import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield, 
  Search, 
  Users, 
  Building2,
  Eye,
  Plus,
  Edit,
  Trash2,
  Save,
  User
} from "lucide-react";
import { Permission } from "@/api/entities";
import { User as UserEntity } from "@/api/entities";

const permissionResources = [
  { 
    id: 'activities', 
    name: 'Atividades', 
    description: 'Workflows, tarefas, modelos e playbooks'
  },
  { 
    id: 'management', 
    name: 'Gestão', 
    description: 'Empresas, usuários e configurações'
  },
  { 
    id: 'records', 
    name: 'Registros', 
    description: 'Listas de registros e formulários'
  },
  { 
    id: 'drive', 
    name: 'Drive', 
    description: 'Arquivos e documentos'
  },
  { 
    id: 'forms', 
    name: 'Formulários', 
    description: 'Criação e gestão de formulários'
  },
  { 
    id: 'crm', 
    name: 'CRM', 
    description: 'Leads, negócios e vendas'
  },
  { 
    id: 'commissions', 
    name: 'Comissões', 
    description: 'Regras e pagamentos de comissão'
  }
];

const permissionLevels = [
  { id: 'total', name: 'Total', description: 'Acesso a todos os dados da empresa' },
  { id: 'departamento', name: 'Departamento', description: 'Acesso aos dados da equipe/departamento' },
  { id: 'pessoal', name: 'Pessoal', description: 'Acesso apenas aos próprios dados' }
];

const permissionTypes = [
  { id: 'none', name: 'Nenhum', description: 'Sem acesso', color: 'bg-gray-500/20 text-gray-400' },
  { id: 'view', name: 'Visualizar', description: 'Apenas visualização', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'create_view', name: 'Criar + Ver', description: 'Criar e visualizar', color: 'bg-green-500/20 text-green-400' },
  { id: 'edit_create_view', name: 'Editar + Criar + Ver', description: 'Editar, criar e visualizar', color: 'bg-yellow-500/20 text-yellow-400' },
  { id: 'full', name: 'Total', description: 'Acesso completo', color: 'bg-red-500/20 text-red-400' }
];

const rolePermissionDefaults = {
  proprietario: {
    activities: { level: 'total', permission_type: 'full' },
    management: { level: 'total', permission_type: 'full' },
    records: { level: 'total', permission_type: 'full' },
    drive: { level: 'total', permission_type: 'full' },
    forms: { level: 'total', permission_type: 'full' },
    crm: { level: 'total', permission_type: 'full' },
    commissions: { level: 'total', permission_type: 'full' }
  },
  administrador: {
    activities: { level: 'total', permission_type: 'full' },
    management: { level: 'total', permission_type: 'edit_create_view' },
    records: { level: 'total', permission_type: 'full' },
    drive: { level: 'total', permission_type: 'full' },
    forms: { level: 'total', permission_type: 'full' },
    crm: { level: 'total', permission_type: 'full' },
    commissions: { level: 'departamento', permission_type: 'view' }
  },
  lider: {
    activities: { level: 'departamento', permission_type: 'full' },
    management: { level: 'departamento', permission_type: 'create_view' },
    records: { level: 'departamento', permission_type: 'edit_create_view' },
    drive: { level: 'departamento', permission_type: 'edit_create_view' },
    forms: { level: 'departamento', permission_type: 'edit_create_view' },
    crm: { level: 'departamento', permission_type: 'full' },
    commissions: { level: 'pessoal', permission_type: 'view' }
  },
  comercial: {
    activities: { level: 'pessoal', permission_type: 'edit_create_view' },
    management: { level: 'pessoal', permission_type: 'view' },
    records: { level: 'departamento', permission_type: 'create_view' },
    drive: { level: 'departamento', permission_type: 'create_view' },
    forms: { level: 'departamento', permission_type: 'view' },
    crm: { level: 'departamento', permission_type: 'edit_create_view' },
    commissions: { level: 'pessoal', permission_type: 'view' }
  },
  colaborador: {
    activities: { level: 'pessoal', permission_type: 'edit_create_view' },
    management: { level: 'pessoal', permission_type: 'view' },
    records: { level: 'pessoal', permission_type: 'view' },
    drive: { level: 'pessoal', permission_type: 'create_view' },
    forms: { level: 'pessoal', permission_type: 'view' },
    crm: { level: 'pessoal', permission_type: 'view' },
    commissions: { level: 'pessoal', permission_type: 'view' }
  }
};

export default function PermissionsTab({ companies, user }) {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingPermissions, setEditingPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedCompany]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, permissionsData] = await Promise.all([
        UserEntity.list(),
        Permission.list()
      ]);
      
      setUsers(usersData);
      setPermissions(permissionsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setIsLoading(false);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompany = selectedCompany === "all" || 
      u.company_roles?.some(role => role.company_id === selectedCompany);

    return matchesSearch && matchesCompany;
  });

  const getUserPermissions = (userId, companyId) => {
    return permissions.filter(p => 
      p.user_id === userId && 
      p.company_id === companyId
    );
  };

  const getUserRole = (userId, companyId) => {
    const targetUser = users.find(u => u.id === userId);
    const role = targetUser?.company_roles?.find(r => r.company_id === companyId);
    return role?.role_function || 'colaborador';
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    
    // Carregar permissões existentes ou usar padrões baseados na função
    const userRole = getUserRole(user.id, selectedCompany);
    const defaultPermissions = rolePermissionDefaults[userRole] || rolePermissionDefaults.colaborador;
    
    const currentPermissions = {};
    permissionResources.forEach(resource => {
      const existingPermission = permissions.find(p => 
        p.user_id === user.id && 
        p.company_id === selectedCompany && 
        p.resource === resource.id
      );
      
      if (existingPermission) {
        currentPermissions[resource.id] = {
          level: existingPermission.level,
          permission_type: existingPermission.permission_type
        };
      } else {
        currentPermissions[resource.id] = defaultPermissions[resource.id] || {
          level: 'pessoal',
          permission_type: 'view'
        };
      }
    });
    
    setEditingPermissions(currentPermissions);
  };

  const handlePermissionChange = (resource, field, value) => {
    setEditingPermissions(prev => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [field]: value
      }
    }));
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    
    setIsSaving(true);
    try {
      // Primeiro, remove todas as permissões existentes do usuário para a empresa
      const existingPermissions = permissions.filter(p => 
        p.user_id === selectedUser.id && p.company_id === selectedCompany
      );
      
      for (const permission of existingPermissions) {
        await Permission.delete(permission.id);
      }
      
      // Depois, cria as novas permissões
      for (const [resource, config] of Object.entries(editingPermissions)) {
        await Permission.create({
          user_id: selectedUser.id,
          resource: resource,
          level: config.level,
          permission_type: config.permission_type,
          company_id: selectedCompany
        });
      }
      
      await loadData();
      setSelectedUser(null);
      setEditingPermissions({});
    } catch (error) {
      console.error("Erro ao salvar permissões:", error);
    }
    setIsSaving(false);
  };

  const applyRoleDefaults = () => {
    if (!selectedUser) return;
    
    const userRole = getUserRole(selectedUser.id, selectedCompany);
    const defaults = rolePermissionDefaults[userRole] || rolePermissionDefaults.colaborador;
    setEditingPermissions(defaults);
  };

  const getPermissionColor = (permissionType) => {
    const permission = permissionTypes.find(p => p.id === permissionType);
    return permission?.color || 'bg-gray-500/20 text-gray-400';
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

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="bg-[#1C1C1C] border-[#656464]">
        <CardHeader>
          <CardTitle className="text-[#D9D9D9] flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Controle de Permissões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#131313] border-[#656464] text-[#D9D9D9]"
              />
            </div>
            
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-64 bg-[#131313] border-[#656464] text-[#D9D9D9]">
                <SelectValue placeholder="Selecionar empresa" />
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
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      {selectedCompany === "all" ? (
        <Card className="bg-[#1C1C1C] border-[#656464]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-12 h-12 text-[#9CA3AF] mb-4" />
            <h3 className="text-lg font-medium text-[#D9D9D9] mb-2">
              Selecione uma Empresa
            </h3>
            <p className="text-[#9CA3AF] text-center">
              Escolha uma empresa específica para gerenciar as permissões dos usuários
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredUsers.map((userItem) => {
            const userRole = getUserRole(userItem.id, selectedCompany);
            const userPermissions = getUserPermissions(userItem.id, selectedCompany);
            
            return (
              <Card key={userItem.id} className="bg-[#1C1C1C] border-[#656464] hover:border-[#E50F5F]/50 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 bg-[#E50F5F]">
                        <AvatarFallback className="bg-[#E50F5F] text-white font-semibold">
                          {userItem.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-[#D9D9D9] text-sm">
                          {userItem.full_name || 'Nome não informado'}
                        </h3>
                        <p className="text-xs text-[#9CA3AF]">{userItem.email}</p>
                        <Badge className={`${getRoleColor(userRole)} text-xs mt-1`}>
                          {userRole}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(userItem)}
                      className="border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:border-[#E50F5F]"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[#9CA3AF] mb-2">Permissões Atuais:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {permissionResources.slice(0, 4).map(resource => {
                        const permission = userPermissions.find(p => p.resource === resource.id);
                        const permissionType = permission?.permission_type || 'view';
                        
                        return (
                          <div key={resource.id} className="flex items-center justify-between text-xs">
                            <span className="text-[#9CA3AF] truncate">{resource.name}:</span>
                            <Badge className={`${getPermissionColor(permissionType)} text-xs`}>
                              {permissionTypes.find(p => p.id === permissionType)?.name || 'Ver'}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                    {permissionResources.length > 4 && (
                      <p className="text-xs text-[#9CA3AF] text-center">
                        +{permissionResources.length - 4} mais recursos
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Edição de Permissões */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#1C1C1C] border-[#656464] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#E50F5F] flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Permissões - {selectedUser.full_name}
                  </CardTitle>
                  <p className="text-sm text-[#9CA3AF] mt-1">
                    Empresa: {companies.find(c => c.id === selectedCompany)?.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={applyRoleDefaults}
                    className="border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
                  >
                    Aplicar Padrões da Função
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedUser(null);
                      setEditingPermissions({});
                    }}
                    className="text-[#9CA3AF] hover:text-[#D9D9D9]"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {permissionResources.map(resource => (
                <div key={resource.id} className="p-4 bg-[#131313] rounded-lg border border-[#656464]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-[#D9D9D9]">{resource.name}</h4>
                      <p className="text-xs text-[#9CA3AF]">{resource.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nível de Acesso */}
                    <div>
                      <label className="text-xs font-medium text-[#9CA3AF] mb-2 block">
                        Nível de Acesso
                      </label>
                      <Select
                        value={editingPermissions[resource.id]?.level || 'pessoal'}
                        onValueChange={(value) => handlePermissionChange(resource.id, 'level', value)}
                      >
                        <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                          {permissionLevels.map(level => (
                            <SelectItem key={level.id} value={level.id}>
                              <div>
                                <div className="font-medium">{level.name}</div>
                                <div className="text-xs text-[#9CA3AF]">{level.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Tipo de Permissão */}
                    <div>
                      <label className="text-xs font-medium text-[#9CA3AF] mb-2 block">
                        Tipo de Permissão
                      </label>
                      <Select
                        value={editingPermissions[resource.id]?.permission_type || 'view'}
                        onValueChange={(value) => handlePermissionChange(resource.id, 'permission_type', value)}
                      >
                        <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                          {permissionTypes.map(type => (
                            <SelectItem key={type.id} value={type.id}>
                              <div>
                                <div className="font-medium">{type.name}</div>
                                <div className="text-xs text-[#9CA3AF]">{type.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end gap-3 pt-6 border-t border-[#656464]">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedUser(null);
                    setEditingPermissions({});
                  }}
                  className="border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSavePermissions}
                  disabled={isSaving}
                  className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Salvando...' : 'Salvar Permissões'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}