import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  UserPlus,
  Shield,
  Building2,
  Mail,
  Phone
} from "lucide-react";
import { User as UserEntity } from "@/api/entities";
import InviteUserModal from "../management/InviteUserModal";

export default function UsersManagementTab({ companies, user }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const usersData = await UserEntity.list();
      setUsers(usersData);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
    setIsLoading(false);
  };

  // Filtrar usuários baseado nos filtros
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompany = filterCompany === "all" || 
      u.company_roles?.some(role => role.company_id === filterCompany);
    
    const matchesRole = filterRole === "all" ||
      u.company_roles?.some(role => role.role_function === filterRole);

    return matchesSearch && matchesCompany && matchesRole;
  });

  const handleInviteUser = () => {
    setEditingUser(null);
    setShowInviteModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowInviteModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Tem certeza que deseja remover este usuário?')) {
      try {
        await UserEntity.delete(userId);
        loadUsers();
      } catch (error) {
        console.error('Erro ao remover usuário:', error);
      }
    }
  };

  const getUserCompaniesInfo = (userCompanyRoles) => {
    if (!userCompanyRoles || userCompanyRoles.length === 0) {
      return { companiesText: 'Nenhuma empresa', rolesText: 'Sem função' };
    }

    const companiesText = userCompanyRoles
      .map(role => {
        const company = companies.find(c => c.id === role.company_id);
        return company ? company.name : 'Empresa desconhecida';
      })
      .join(', ');

    const rolesText = [...new Set(userCompanyRoles.map(role => role.role_function))].join(', ');

    return { companiesText, rolesText };
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

  const canManageUser = (targetUser) => {
    // O próprio usuário pode editar a si mesmo
    if (user?.id === targetUser.id) return true;
    
    // Proprietários e administradores podem gerenciar outros usuários
    const userRoles = user?.company_roles || [];
    return userRoles.some(role => ['proprietario', 'administrador'].includes(role.role_function));
  };

  return (
    <>
      <div className="space-y-6">
        {/* Filtros e Controles */}
        <Card className="bg-[#1C1C1C] border-[#656464]">
          <CardHeader>
            <CardTitle className="text-[#D9D9D9] flex items-center gap-2">
              <Users className="w-5 h-5" />
              Gerenciar Usuários ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#131313] border-[#656464] text-[#D9D9D9]"
                />
              </div>
              
              <div className="flex gap-3">
                <Select value={filterCompany} onValueChange={setFilterCompany}>
                  <SelectTrigger className="w-48 bg-[#131313] border-[#656464] text-[#D9D9D9]">
                    <SelectValue placeholder="Filtrar por empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                    <SelectItem value="all">Todas as empresas</SelectItem>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-48 bg-[#131313] border-[#656464] text-[#D9D9D9]">
                    <SelectValue placeholder="Filtrar por função" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                    <SelectItem value="all">Todas as funções</SelectItem>
                    <SelectItem value="proprietario">Proprietário</SelectItem>
                    <SelectItem value="administrador">Administrador</SelectItem>
                    <SelectItem value="lider">Líder</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="colaborador">Colaborador</SelectItem>
                    <SelectItem value="parceiros">Parceiros</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  onClick={handleInviteUser}
                  className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Convidar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Usuários */}
        {isLoading ? (
          <Card className="bg-[#1C1C1C] border-[#656464]">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4 animate-pulse" />
                <p className="text-[#D9D9D9]">Carregando usuários...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredUsers.length === 0 ? (
          <Card className="bg-[#1C1C1C] border-[#656464]">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-[#9CA3AF] mb-4" />
              <h3 className="text-lg font-medium text-[#D9D9D9] mb-2">
                {searchTerm || filterCompany !== "all" || filterRole !== "all" 
                  ? "Nenhum usuário encontrado" 
                  : "Nenhum usuário cadastrado"
                }
              </h3>
              <p className="text-[#9CA3AF] text-center mb-4">
                {searchTerm || filterCompany !== "all" || filterRole !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Convide o primeiro usuário para sua equipe"
                }
              </p>
              {(!searchTerm && filterCompany === "all" && filterRole === "all") && (
                <Button
                  onClick={handleInviteUser}
                  className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Convidar Primeiro Usuário
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((userItem) => {
              const { companiesText, rolesText } = getUserCompaniesInfo(userItem.company_roles);
              const canManage = canManageUser(userItem);
              const isCurrentUser = user?.id === userItem.id;
              
              return (
                <Card key={userItem.id} className="bg-[#1C1C1C] border-[#656464] hover:border-[#E50F5F]/50 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="w-12 h-12 bg-[#E50F5F]">
                          <AvatarFallback className="bg-[#E50F5F] text-white font-semibold">
                            {userItem.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-[#D9D9D9] truncate">
                              {userItem.full_name || 'Nome não informado'}
                            </h3>
                            {isCurrentUser && (
                              <Badge className="bg-[#E50F5F]/20 text-[#E50F5F] border-[#E50F5F]/30 text-xs">
                                Você
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-[#9CA3AF]">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{userItem.email}</span>
                            </div>
                            {userItem.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span>{userItem.phone}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                              <Building2 className="w-3 h-3" />
                              <span className="truncate">{companiesText}</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              {[...new Set(userItem.company_roles?.map(role => role.role_function) || [])].map(role => (
                                <Badge 
                                  key={role} 
                                  className={`${getRoleColor(role)} text-xs`}
                                >
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {canManage && (
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditUser(userItem)}
                            className="text-[#9CA3AF] hover:text-[#E50F5F] h-8 w-8"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          {!isCurrentUser && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(userItem.id)}
                              className="text-[#9CA3AF] hover:text-red-400 h-8 w-8"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Convite/Edição */}
      <InviteUserModal
        open={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setEditingUser(null);
        }}
        user={editingUser}
        companies={companies}
        onSuccess={loadUsers}
      />
    </>
  );
}