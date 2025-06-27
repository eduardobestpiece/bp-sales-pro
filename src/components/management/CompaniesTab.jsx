
import React, { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Building2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Company } from "@/api/entities";
import { User } from "@/api/entities";
import { CompanyContext } from "@/components/contexts/CompanyContext";

import CompanyModal from './CompanyModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import CompanyUsersManager from './CompanyUsersManager';

export default function CompaniesTab() {
  const { selectedCompanyId } = useContext(CompanyContext);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [deletingCompany, setDeletingCompany] = useState(null);
  const [expandedCompanyId, setExpandedCompanyId] = useState(null);

  useEffect(() => {
    loadData();
  }, [selectedCompanyId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [companiesData, usersData, me] = await Promise.all([
        Company.list("-created_date"),
        User.list(),
        User.me()
      ]);
      setCompanies(companiesData);
      setUsers(usersData);
      setCurrentUser(me);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setIsLoading(false);
  };

  const handleOpenModal = (company = null) => {
    setEditingCompany(company);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
    loadData();
  };

  const handleOpenDeleteModal = (company) => {
    setDeletingCompany(company);
  };

  const handleCloseDeleteModal = () => {
    setDeletingCompany(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCompany) return;
    try {
      await Company.delete(deletingCompany.id);
      handleCloseDeleteModal();
      loadData();
    } catch (error) {
      console.error("Erro ao excluir empresa:", error);
    }
  };
  
  const toggleExpandCompany = (companyId) => {
    setExpandedCompanyId(prevId => (prevId === companyId ? null : companyId));
  };

  const getUserName = (userId) => {
    return users.find(u => u.id === userId)?.full_name || 'Não definido';
  };
  
  const filteredCompanies = companies.filter(company =>
    (company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.cnpj?.includes(searchTerm)) &&
    (selectedCompanyId === 'all' || company.id === selectedCompanyId || company.parent_company_id === selectedCompanyId)
  );

  const canAddCompany = currentUser?.company_roles?.some(cr => cr.role_function === 'proprietario');

  return (
    <>
      <Card className="bg-[#1C1C1C] border-[#656464]">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
              />
            </div>
            {canAddCompany && (
              <Button
                onClick={() => handleOpenModal()}
                className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Empresa
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-[#9CA3AF]">Carregando empresas...</div>
          ) : filteredCompanies.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <Building2 className="w-12 h-12 text-[#9CA3AF] mb-4" />
              <h3 className="text-lg font-medium text-[#D9D9D9] mb-2">Nenhuma empresa encontrada</h3>
              <p className="text-[#9CA3AF] text-center mb-4">
                {searchTerm ? "Tente uma busca diferente." : "Adicione a primeira empresa para começar."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCompanies.map(company => {
                const userRoleForCompany = currentUser?.company_roles?.find(cr => cr.company_id === company.id)?.role_function;
                const canEdit = userRoleForCompany === 'proprietario' || userRoleForCompany === 'administrador';
                const canDelete = userRoleForCompany === 'proprietario';

                return (
                  <div key={company.id} className="bg-[#131313] rounded-lg">
                    <div className="flex items-center justify-between p-3">
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-[#9CA3AF] hover:text-[#E50F5F]" onClick={() => toggleExpandCompany(company.id)}>
                           {expandedCompanyId === company.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                         </Button>
                         <div className="flex items-center flex-1 min-w-0 gap-4">
                           <Avatar>
                            <AvatarImage src={company.logo_url} alt={company.name} />
                            <AvatarFallback className="bg-[#E50F5F] text-white">{company.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                             <p className="font-medium text-[#D9D9D9] truncate" title={company.name}>{company.name}</p>
                             <p className="text-sm text-[#9CA3AF]">{company.cnpj || 'N/A'}</p>
                             <p className="text-sm text-[#9CA3AF]">Proprietário: {getUserName(company.owner_id)}</p>
                          </div>
                        </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1C1C1C] border-[#656464] hover:bg-[#656464]/30 text-[#D9D9D9]" onClick={() => handleOpenModal(company)} disabled={!canEdit}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1C1C1C] border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-white" onClick={() => handleOpenDeleteModal(company)} disabled={!canDelete}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {expandedCompanyId === company.id && (
                      <CompanyUsersManager company={company} allUsers={users} onUpdate={loadData} currentUser={currentUser} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      {isModalOpen && (
        <CompanyModal
          open={isModalOpen}
          onClose={handleCloseModal}
          company={editingCompany}
          users={users}
          currentUser={currentUser}
        />
      )}

      {deletingCompany && (
        <ConfirmDeleteModal
          open={!!deletingCompany}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDeleteConfirm}
          itemName={deletingCompany.name}
          itemType="empresa"
        />
      )}
    </>
  );
}
