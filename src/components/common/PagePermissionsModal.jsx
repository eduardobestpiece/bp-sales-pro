import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Save, Shield } from 'lucide-react';
import { PagePermission } from '@/api/entities';
import { User } from '@/api/entities';
import { Team } from '@/api/entities';

const roles = [
  { id: "proprietario", name: "Proprietário" },
  { id: "administrador", name: "Administrador" },
  { id: "lider", name: "Líder" },
  { id: "comercial", name: "Comercial" },
  { id: "colaborador", name: "Colaborador" },
  { id: "parceiros", name: "Parceiros" },
  { id: "cliente", name: "Cliente" }
];

export default function PagePermissionsModal({ open, onClose, pageName, companyId, pageTitle }) {
  const [permissionSets, setPermissionSets] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentSet, setCurrentSet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && companyId) {
      loadData();
    }
  }, [open, companyId, pageName]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allPermissions, allUsers, allTeams] = await Promise.all([
        PagePermission.filter({ page: pageName, company_id: companyId }),
        User.list(),
        Team.filter({ company_id: companyId })
      ]);
      setPermissionSets(allPermissions);
      setUsers(allUsers.filter(u => u.company_roles?.some(r => r.company_id === companyId)));
      setTeams(allTeams);
    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
    }
    setIsLoading(false);
  };

  const handleSelectSet = (setId) => {
    const selected = permissionSets.find(p => p.id === setId);
    setCurrentSet(JSON.parse(JSON.stringify(selected || null)));
  };

  const handleAddNew = () => {
    setCurrentSet({
      name: '',
      page: pageName,
      company_id: companyId,
      permissions: { view: true, create: false, edit: false, delete: false, archive: false },
      applies_to_roles: [],
      applies_to_teams: [],
      applies_to_users: []
    });
  };

  const handleSave = async () => {
    if (!currentSet) return;
    try {
      if (currentSet.id) {
        await PagePermission.update(currentSet.id, currentSet);
      } else {
        await PagePermission.create(currentSet);
      }
      loadData();
      setCurrentSet(null);
    } catch (error) {
      console.error("Erro ao salvar permissão:", error);
    }
  };

  const handleDelete = async (setId) => {
    if (window.confirm("Tem certeza que deseja excluir este conjunto de permissões?")) {
      try {
        await PagePermission.delete(setId);
        loadData();
        if(currentSet?.id === setId) {
            setCurrentSet(null);
        }
      } catch (error) {
        console.error("Erro ao excluir permissão:", error);
      }
    }
  };

  const updateField = (field, value) => {
    setCurrentSet(prev => ({ ...prev, [field]: value }));
  };

  const updatePermission = (key, value) => {
    setCurrentSet(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: value }
    }));
  };

  const updateMultiSelect = (field, id) => {
    setCurrentSet(prev => {
      const currentValues = prev[field] || [];
      const newValues = currentValues.includes(id)
        ? currentValues.filter(item => item !== id)
        : [...currentValues, id];
      return { ...prev, [field]: newValues };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-[#E50F5F]">
            <Shield className="w-6 h-6" /> Permissões da Página: {pageTitle}
          </DialogTitle>
          <DialogDescription className="text-[#9CA3AF]">
            Crie e gerencie conjuntos de permissões para definir quem pode acessar e interagir com esta página.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-6 h-[calc(100%-150px)]">
          {/* Coluna da Esquerda - Lista de Conjuntos */}
          <div className="w-1/3 border-r border-[#656464] pr-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Conjuntos de Permissões</h3>
              <Button size="sm" onClick={handleAddNew} className="bg-[#E50F5F]/20 text-[#E50F5F] hover:bg-[#E50F5F]/30">
                <Plus className="w-4 h-4 mr-2" /> Novo
              </Button>
            </div>
            <ScrollArea className="flex-1">
              {permissionSets.map(set => (
                <div
                  key={set.id}
                  onClick={() => handleSelectSet(set.id)}
                  className={`p-3 rounded-md cursor-pointer mb-2 flex justify-between items-center ${currentSet?.id === set.id ? 'bg-[#E50F5F]/20' : 'hover:bg-[#656464]/20'}`}
                >
                  <span className="font-medium">{set.name}</span>
                  <Button variant="ghost" size="icon" className="w-6 h-6 text-[#9CA3AF] hover:text-red-400" onClick={(e) => {e.stopPropagation(); handleDelete(set.id);}}>
                      <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Coluna da Direita - Editor */}
          <div className="w-2/3">
            {currentSet ? (
              <ScrollArea className="h-full pr-4">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="setName">Nome do Conjunto</Label>
                    <Input id="setName" value={currentSet.name} onChange={(e) => updateField('name', e.target.value)} className="bg-[#131313] border-[#656464] mt-1" />
                  </div>
                  
                  {/* Permissões */}
                  <div>
                    <Label>Permissões</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2 p-4 bg-[#131313] rounded-lg border border-[#656464]">
                      {Object.keys(currentSet.permissions).map(key => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox id={`perm-${key}`} checked={currentSet.permissions[key]} onCheckedChange={(checked) => updatePermission(key, checked)} />
                          <label htmlFor={`perm-${key}`} className="capitalize">{key}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Atribuir a */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Funções */}
                    <div>
                      <Label>Funções</Label>
                      <div className="mt-2 space-y-2 p-2 bg-[#131313] rounded-lg border border-[#656464]">
                        {roles.map(role => (
                          <div key={role.id} className="flex items-center space-x-2">
                            <Checkbox id={`role-${role.id}`} checked={currentSet.applies_to_roles?.includes(role.id)} onCheckedChange={() => updateMultiSelect('applies_to_roles', role.id)} />
                            <label htmlFor={`role-${role.id}`}>{role.name}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Equipes */}
                    <div>
                      <Label>Equipes</Label>
                      <div className="mt-2 space-y-2 p-2 bg-[#131313] rounded-lg border border-[#656464]">
                        {teams.map(team => (
                          <div key={team.id} className="flex items-center space-x-2">
                            <Checkbox id={`team-${team.id}`} checked={currentSet.applies_to_teams?.includes(team.id)} onCheckedChange={() => updateMultiSelect('applies_to_teams', team.id)} />
                            <label htmlFor={`team-${team.id}`}>{team.name}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Usuários */}
                    <div>
                      <Label>Usuários Específicos</Label>
                      <div className="mt-2 space-y-2 p-2 bg-[#131313] rounded-lg border border-[#656464]">
                        {users.map(user => (
                          <div key={user.id} className="flex items-center space-x-2">
                            <Checkbox id={`user-${user.id}`} checked={currentSet.applies_to_users?.includes(user.id)} onCheckedChange={() => updateMultiSelect('applies_to_users', user.id)} />
                            <label htmlFor={`user-${user.id}`}>{user.full_name}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-full text-center text-[#9CA3AF]">
                <p>Selecione um conjunto para editar ou crie um novo.</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="pt-4 border-t border-[#656464]">
          <Button variant="outline" onClick={onClose} className="border-[#656464] hover:bg-[#656464]/20">Fechar</Button>
          {currentSet && <Button onClick={handleSave} className="bg-[#E50F5F] hover:bg-[#E50F5F]/80"><Save className="w-4 h-4 mr-2" />Salvar Alterações</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}