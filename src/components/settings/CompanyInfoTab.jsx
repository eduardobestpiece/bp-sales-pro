
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Building2, 
  Plus, 
  Search, 
  Edit, 
  LogOut, 
  Crown,
  Users,
  MapPin
} from "lucide-react";
import { Company } from "@/api/entities";
import CompanyModal from "../management/CompanyModal";

export default function CompanyInfoTab({ companies, user, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  // Filtrar empresas que o usuário tem acesso
  const userCompanyRoles = user?.company_roles || [];
  const accessibleCompanies = companies.filter(company => 
    userCompanyRoles.some(role => role.company_id === company.id)
  );

  const filteredCompanies = accessibleCompanies.filter(company =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserRoleInCompany = (companyId) => {
    const role = userCompanyRoles.find(role => role.company_id === companyId);
    return role?.role_function || 'colaborador';
  };

  const getCompanyTypeLabel = (type) => {
    const types = {
      parent: 'Empresa Pai',
      mother: 'Empresa Mãe',
      company: 'Empresa'
    };
    return types[type] || 'Empresa';
  };

  const getCompanyTypeColor = (type) => {
    const colors = {
      parent: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      mother: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      company: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getRoleColor = (role) => {
    const colors = {
      proprietario: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      administrador: 'bg-red-500/20 text-red-400 border-red-500/30',
      lider: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      comercial: 'bg-green-500/20 text-green-400 border-green-500/30',
      colaborador: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      parceiros: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      cliente: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
    };
    return colors[role] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setShowCreateModal(true);
  };

  const handleLeaveCompany = async (companyId) => {
    if (window.confirm('Tem certeza que deseja sair desta empresa?')) {
      try {
        // Implementar lógica de saída da empresa
        console.log('Sair da empresa:', companyId);
        onRefresh();
      } catch (error) {
        console.error('Erro ao sair da empresa:', error);
      }
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header e Busca */}
        <Card className="bg-[#1C1C1C] border-[#656464]">
          <CardHeader>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <CardTitle className="text-[#D9D9D9] flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Minhas Empresas ({filteredCompanies.length})
              </CardTitle>
              
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
                  <Input
                    placeholder="Buscar empresas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-[#131313] border-[#656464] text-[#D9D9D9]"
                  />
                </div>
                <Button
                  onClick={() => {
                    setEditingCompany(null);
                    setShowCreateModal(true);
                  }}
                  className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Lista de Empresas (Updated Section) */}
        <Card className="bg-[#1C1C1C] border-[#656464]">
          <CardHeader>
            <CardTitle className="text-[#D9D9D9]">
              Minhas Empresas ({filteredCompanies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCompanies.length > 0 ? (
              <div className="space-y-3">
                {filteredCompanies.map(company => {
                  const userRole = getUserRoleInCompany(company.id);
                  const canEdit = ['proprietario', 'administrador'].includes(userRole);
                  
                  return (
                    <div key={company.id} className="flex items-center p-4 bg-[#131313] rounded-lg border border-[#656464]">
                      <Avatar className="w-16 h-16 mr-4 flex-shrink-0">
                        <AvatarImage src={company.logo_url} alt={company.name} className="object-cover" />
                        <AvatarFallback className="text-2xl bg-gray-700">
                          {company.name?.charAt(0) || 'E'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-[#D9D9D9] truncate">{company.name}</h3>
                          <Badge variant="outline" className={getCompanyTypeColor(company.company_type)}>
                            {getCompanyTypeLabel(company.company_type)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge className={`${getRoleColor(userRole)} flex items-center gap-1`}>
                            <Crown className="w-3 h-3" /> Meu Cargo: {userRole}
                          </Badge>
                          {/* Static 2 users as per outline. If dynamic count needed, logic would go here. */}
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> 2 Usuários
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {canEdit && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEdit(company)}
                            className="text-[#9CA3AF] hover:text-[#E50F5F]"
                          >
                            <Edit className="w-4 h-4 mr-2" /> Editar
                          </Button>
                        )}
                        {userRole !== 'proprietario' && (
                          <Button 
                            variant="outline" 
                            className="text-red-400 border-red-400/50 hover:bg-red-400/10 hover:text-red-300" 
                            size="sm"
                            onClick={() => handleLeaveCompany(company.id)}
                          >
                            <LogOut className="w-4 h-4 mr-2" /> Sair
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-[#9CA3AF]">
                <Building2 className="mx-auto w-12 h-12 mb-2" />
                <p>
                  {searchTerm 
                    ? "Nenhuma empresa encontrada" 
                    : "Você ainda não faz parte de nenhuma empresa."
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Criação/Edição */}
      <CompanyModal
        company={editingCompany}
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingCompany(null);
        }}
        onSuccess={onRefresh}
        parentCompanies={companies.filter(c => c.company_type === 'parent' || c.company_type === 'mother')}
      />
    </>
  );
}
