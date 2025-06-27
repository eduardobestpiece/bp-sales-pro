
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import { User } from '@/api/entities';
import { Company } from '@/api/entities'; // Re-add this import if it was removed in an intermediate step, but it's not explicitly in the outline, so preserving from original.
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function CompanyUsersManager({ company, allUsers, onUpdate, currentUser }) {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState('');

  // Filter users based on the new 'company_roles' structure
  const companyUsers = allUsers.filter(u => u.company_roles?.some(cr => cr.company_id === company.id));
  const availableUsers = allUsers.filter(u => !u.company_roles?.some(cr => cr.company_id === company.id));

  const handleAddUser = async () => {
    if (!selectedUser) return;
    try {
      const userToAdd = await User.get(selectedUser);
      // Define default role for newly added user
      const newCompanyRole = { company_id: company.id, role_function: 'colaborador' }; 
      const updatedCompanyRoles = [...(userToAdd.company_roles || []), newCompanyRole];
      await User.update(userToAdd.id, { company_roles: updatedCompanyRoles });
      onUpdate();
      setSelectedUser('');
      toast({ title: "Sucesso", description: "Usuário adicionado à empresa." });
    } catch (error) {
      console.error("Erro ao adicionar usuário:", error);
      toast({ title: "Erro", description: "Não foi possível adicionar o usuário.", variant: "destructive" });
    }
  };

  const handleRemoveUser = async (userId) => {
    const userToRemove = allUsers.find(u => u.id === userId);
    if (!userToRemove) {
        toast({ title: "Erro", description: "Usuário não encontrado.", variant: "destructive" });
        return;
    }

    // Get roles for permission checks within this company context
    const currentUserRoleInCompany = getUserRole(currentUser);
    const userToRemoveRoleInCompany = getUserRole(userToRemove);

    // Permission: Cannot remove the company owner
    if (userId === company.owner_id) {
        toast({ title: "Ação não permitida", description: "Não é possível remover o proprietário da empresa.", variant: "destructive" });
        return;
    }
    // Permission: Admin cannot remove proprietor (in THIS company)
    if (currentUserRoleInCompany === 'administrador' && userToRemoveRoleInCompany === 'proprietario') {
        toast({ title: "Ação não permitida", description: "Administradores não podem remover proprietários.", variant: "destructive" });
        return;
    }

    if (window.confirm(`Tem certeza que deseja remover ${userToRemove.full_name} desta empresa?`)) {
      try {
        // Update user's company_roles by filtering out the current company's entry
        const updatedCompanyRoles = userToRemove.company_roles.filter(cr => cr.company_id !== company.id);
        await User.update(userId, { company_roles: updatedCompanyRoles });
        onUpdate();
        toast({ title: "Sucesso", description: "Usuário removido da empresa." });
      } catch (error) {
        console.error("Erro ao remover usuário:", error);
        toast({ title: "Erro", description: "Não foi possível remover o usuário.", variant: "destructive" });
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
     try {
        const userToUpdate = allUsers.find(u => u.id === userId);
        if (!userToUpdate) {
            toast({ title: "Erro", description: "Usuário não encontrado para atualizar função.", variant: "destructive" });
            return;
        }
        // Update user's company_roles for the specific company entry
        const updatedCompanyRoles = userToUpdate.company_roles.map(cr => 
          cr.company_id === company.id ? { ...cr, role_function: newRole } : cr
        );
        await User.update(userId, { company_roles: updatedCompanyRoles });
        onUpdate();
        toast({ title: "Sucesso", description: "Função do usuário atualizada." });
     } catch (error) {
        console.error("Erro ao mudar função:", error);
        toast({ title: "Erro", description: "Não foi possível atualizar a função.", variant: "destructive" });
     }
  };

  // Helper function to get a user's role specifically for the current company
  const getUserRole = (user) => {
    return user.company_roles?.find(cr => cr.company_id === company.id)?.role_function || 'colaborador';
  };

  // Determines if the currentUser has permission to manage (change role or remove) a specific user
  const canManageUser = (user) => {
      const currentUserRoleInCompany = getUserRole(currentUser);
      const userRoleInCompany = getUserRole(user);

      // Only 'proprietario' and 'administrador' roles in the company can manage
      if (!['proprietario', 'administrador'].includes(currentUserRoleInCompany)) {
          return false;
      }

      // The company owner cannot be managed (removed or have their role changed) via this UI
      // Specific removal checks are in handleRemoveUser, but this covers UI disable for both actions
      if (user.id === company.owner_id) {
          return false;
      }

      // A 'proprietario' in the company can manage any other user (who is not the company owner)
      if (currentUserRoleInCompany === 'proprietario') {
          return true;
      }

      // An 'administrador' in the company can manage users with roles lower than 'administrador'
      if (currentUserRoleInCompany === 'administrador') {
          // An administrator cannot manage other administrators or proprietors
          if (userRoleInCompany === 'proprietario' || userRoleInCompany === 'administrador') {
              return false;
          }
          return true; // Can manage users with roles lower than administrator
      }

      return false; // Default: cannot manage
  };

  // This variable checks the currentUser's role within the company to determine visibility of the "Add User" section
  const canAddUsers = getUserRole(currentUser) === 'proprietario' || getUserRole(currentUser) === 'administrador';

  return (
    <div className="p-4 bg-[#1C1C1C] border-t border-[#656464] space-y-4">
      <h4 className="font-semibold text-md text-[#D9D9D9]">Gerenciar Usuários ({companyUsers.length})</h4>
      
      {/* Add existing user section */}
      {canAddUsers && (
        <div className="flex items-center gap-2">
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="flex-1 bg-[#131313] border-[#656464] text-[#D9D9D9]">
              <SelectValue placeholder="Selecione um usuário para adicionar" />
            </SelectTrigger>
            <SelectContent className="bg-[#1C1C1C] text-[#D9D9D9] border-[#656464]">
              {availableUsers.length > 0 ? (
                availableUsers.map(user => (
                  <SelectItem key={user.id} value={user.id} className="focus:bg-[#E50F5F]/20">{user.full_name} ({user.email})</SelectItem>
                ))
              ) : (
                <div className="p-2 text-sm text-[#9CA3AF] text-center">Nenhum usuário disponível para adicionar.</div>
              )}
            </SelectContent>
          </Select>
          <Button onClick={handleAddUser} disabled={!selectedUser} className="bg-[#E50F5F] hover:bg-[#E50F5F]/80">
            <Plus className="w-4 h-4 mr-2" /> Adicionar
          </Button>
        </div>
      )}

      {/* List of users in the company */}
      <div className="space-y-2">
        {companyUsers.length > 0 ? companyUsers.map(user => (
          <div key={user.id} className="flex items-center justify-between p-2 rounded-md bg-[#131313]">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#E50F5F] text-white text-xs">{user.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="text-sm text-[#D9D9D9]">{user.full_name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Select 
                value={getUserRole(user)} 
                onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                disabled={!canManageUser(user)} // Use new permission check for role change
              >
                    <SelectTrigger className="w-[180px] bg-[#1C1C1C] border-[#656464] text-sm h-8 text-[#D9D9D9]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] text-[#D9D9D9] border-[#656464]">
                        <SelectItem value="proprietario" className="focus:bg-[#E50F5F]/20">Proprietário</SelectItem>
                        <SelectItem value="administrador" className="focus:bg-[#E50F5F]/20">Administrador</SelectItem>
                        <SelectItem value="lider" className="focus:bg-[#E50F5F]/20">Líder</SelectItem>
                        <SelectItem value="comercial" className="focus:bg-[#E50F5F]/20">Comercial</SelectItem>
                        <SelectItem value="colaborador" className="focus:bg-[#E50F5F]/20">Colaborador</SelectItem>
                    </SelectContent>
                </Select>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-red-400 hover:bg-red-500/20" 
                onClick={() => handleRemoveUser(user.id)} 
                disabled={!canManageUser(user)} // Use new permission check for remove button
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )) : <p className="text-sm text-[#9CA3AF] text-center py-2">Nenhum usuário nesta empresa.</p>}
      </div>
    </div>
  );
}
