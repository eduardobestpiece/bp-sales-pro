
import React, { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Edit, Trash2, Users } from "lucide-react"; // Removed Copy
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge"; // Badge is not used in the new structure but might be generally useful, keep for now.
import { User } from "@/api/entities";
import { CompanyContext } from "@/components/contexts/CompanyContext";

import InviteUserModal from './InviteUserModal';

export default function UsersTab() {
  const { selectedCompanyId, companies } = useContext(CompanyContext);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsersByCompany();
  }, [selectedCompanyId, allUsers]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const usersData = await User.list();
      setAllUsers(usersData);
      filterUsersByCompany(usersData);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
    setIsLoading(false);
  };
  
  const filterUsersByCompany = (usersList = allUsers) => {
    let filtered = usersList;
    if (selectedCompanyId !== 'all') {
      filtered = usersList.filter(u => u.company_roles?.some(cr => cr.company_id === selectedCompanyId));
    }
    setUsers(filtered);
  };

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    loadUsers();
  };

  const handleDelete = (user) => {
    if(window.confirm(`Tem certeza que deseja excluir o usuário ${user.full_name}?`)){
        // Add delete logic here
        console.log("Deletar usuário:", user.id);
        // User.delete(user.id).then(() => { loadUsers(); }); // Example usage
    }
  };

  // Removed: copyToClipboard function as it's no longer used in JSX

  const getCompanyNamesAndRoles = (user) => {
    if (!user.company_roles || user.company_roles.length === 0) return 'Nenhum vínculo';
    return user.company_roles.map(cr => {
      const company = companies.find(c => c.id === cr.company_id);
      return `${company ? company.name : 'Empresa desconhecida'} (${cr.role_function || 'N/A'})`;
    }).join('; ');
  };

  // Removed: getUserRoleForSelectedCompany function as it's no longer used in JSX

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm) ||
    getCompanyNamesAndRoles(user).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card className="bg-[#1C1C1C] border-[#656464]">
        <CardHeader>
           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, email, telefone ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
                />
            </div>
            <Button
              onClick={() => handleOpenModal()}
              className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Convidar Usuário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
           {isLoading ? (
             <div className="text-center py-8 text-[#9CA3AF]">Carregando usuários...</div>
            ) : filteredUsers.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center">
                <Users className="w-12 h-12 text-[#9CA3AF] mb-4" />
                <h3 className="text-lg font-medium text-[#D9D9D9] mb-2">Nenhum usuário encontrado</h3>
                <p className="text-[#9CA3AF] text-center mb-4">
                  {searchTerm ? "Tente uma busca diferente." : "Convide o primeiro usuário para sua equipe."}
                </p>
              </div>
            ) : (
            <div className="space-y-3">
              {filteredUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-[#131313] rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar>
                      <AvatarFallback className="bg-[#E50F5F] text-white">
                        {user.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-[#D9D9D9]">{user.full_name}</p>
                      <p className="text-sm text-[#9CA3AF] mt-1">{user.email}</p>
                      <p className="text-sm text-[#9CA3AF] mt-1">{user.phone || 'Telefone não informado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 bg-[#1C1C1C] border-[#656464] hover:bg-[#656464]/30 text-[#D9D9D9]" 
                      onClick={() => handleOpenModal(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 bg-[#1C1C1C] border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-white" 
                      onClick={() => handleDelete(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            )}
        </CardContent>
      </Card>
      
      {isModalOpen && (
        <InviteUserModal
            open={isModalOpen}
            onClose={handleCloseModal}
            user={editingUser}
            companies={companies}
        />
      )}
    </>
  );
}
