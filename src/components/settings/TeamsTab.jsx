
import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Plus, Edit, Trash2, Search, User, Building2 } from 'lucide-react';
import { Team } from '@/api/entities';
import { User as UserEntity } from '@/api/entities';
import { CompanyContext } from '@/components/contexts/CompanyContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";


function TeamModal({ open, onClose, onSave, team, companies, users, selectedCompanyId }) {
  const [formData, setFormData] = useState({
    name: '',
    company_id: selectedCompanyId,
    leader_id: '',
  });
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || '',
        company_id: team.company_id || selectedCompanyId,
        leader_id: team.leader_id || '',
      });
      // Carregar membros existentes da equipe
      // Filter users by the team's company_id before determining members
      const usersInTeamCompany = users.filter(u => u.company_roles?.some(r => r.company_id === team.company_id));
      const currentMembers = usersInTeamCompany.filter(u => u.team_id === team.id).map(u => u.id);
      setSelectedMembers(currentMembers);
    } else {
      setFormData({
        name: '',
        company_id: selectedCompanyId,
        leader_id: '',
      });
      setSelectedMembers([]);
    }
  }, [team, users, selectedCompanyId, open]);

  const handleSave = () => {
    onSave({ ...formData }, selectedMembers);
  };
  
  const handleMemberToggle = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const companyUsers = users.filter(u => u.company_roles?.some(r => r.company_id === formData.company_id));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
        <DialogHeader>
          <DialogTitle className="text-[#E50F5F]">{team ? 'Editar Equipe' : 'Criar Nova Equipe'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Nome da Equipe</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
              className="bg-[#131313] border-[#656464]"
            />
          </div>
          <div>
            <Label htmlFor="company_id">Empresa</Label>
            <Select
              value={formData.company_id}
              onValueChange={(value) => setFormData(prev => ({...prev, company_id: value}))}
            >
              <SelectTrigger id="company_id" className="bg-[#131313] border-[#656464]">
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="leader_id">Líder da Equipe</Label>
            <Select
              value={formData.leader_id}
              onValueChange={(value) => setFormData(prev => ({...prev, leader_id: value}))}
            >
              <SelectTrigger id="leader_id" className="bg-[#131313] border-[#656464]">
                <SelectValue placeholder="Selecione um líder" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                {companyUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
              <Label>Membros da Equipe</Label>
              <ScrollArea className="h-48 mt-2 border border-[#656464] rounded-md p-2 bg-[#131313]">
                  <div className="space-y-2">
                      {companyUsers.map(user => (
                          <div key={user.id} className="flex items-center space-x-2">
                              <Checkbox
                                  id={`member-${user.id}`}
                                  checked={selectedMembers.includes(user.id)}
                                  onCheckedChange={() => handleMemberToggle(user.id)}
                                  className="border-[#656464] data-[state=checked]:bg-[#E50F5F] data-[state=checked]:border-[#E50F5F]"
                              />
                              <label
                                  htmlFor={`member-${user.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                  {user.full_name}
                              </label>
                          </div>
                      ))}
                  </div>
              </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-[#656464] hover:bg-[#656464]/20">Cancelar</Button>
          <Button onClick={handleSave} className="bg-[#E50F5F] hover:bg-[#E50F5F]/80">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TeamsTab() {
  const { companies, selectedCompanyId } = useContext(CompanyContext);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [teamsData, usersData] = await Promise.all([
        Team.list(),
        UserEntity.list()
      ]);
      setTeams(teamsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setIsLoading(false);
  };

  const handleSaveTeam = async (teamData, memberIds) => {
    try {
      let teamId;
      if (editingTeam) {
        await Team.update(editingTeam.id, teamData);
        teamId = editingTeam.id;
      } else {
        const newTeam = await Team.create(teamData);
        teamId = newTeam.id;
      }

      // Atualizar o `team_id` nos usuários
      const usersInCompany = users.filter(u => u.company_roles?.some(r => r.company_id === teamData.company_id));
      
      for (const user of usersInCompany) {
        const isMember = memberIds.includes(user.id);
        const isCurrentlyInThisTeam = user.team_id === teamId;

        // If user should be a member of this team but isn't, or should NOT be a member of this team but is.
        if (isMember && !isCurrentlyInThisTeam) {
          await UserEntity.update(user.id, { team_id: teamId });
        } else if (!isMember && isCurrentlyInThisTeam) {
          await UserEntity.update(user.id, { team_id: null });
        }
      }

      loadData();
      setShowModal(false);
      setEditingTeam(null);
    } catch (error) {
      console.error("Erro ao salvar equipe:", error);
    }
  };
  
  const handleDeleteTeam = async (teamId) => {
      if(window.confirm('Tem certeza que deseja excluir esta equipe?')) {
          try {
              // Desvincular usuários da equipe
              const members = users.filter(u => u.team_id === teamId);
              for (const member of members) {
                  await UserEntity.update(member.id, { team_id: null });
              }
              await Team.delete(teamId);
              loadData();
          } catch(error) {
              console.error("Erro ao deletar equipe:", error);
          }
      }
  }

  const filteredTeams = teams
    .filter(team => selectedCompanyId === 'all' || team.company_id === selectedCompanyId)
    .filter(team => team.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getTeamMembers = (teamId) => users.filter(u => u.team_id === teamId);
  const getLeader = (leaderId) => users.find(u => u.id === leaderId);
  const getCompany = (companyId) => companies.find(c => c.id === companyId);

  return (
    <div className="space-y-6">
      <Card className="bg-[#1C1C1C] border-[#656464]">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <CardTitle className="text-[#D9D9D9] flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gerenciar Equipes
              </CardTitle>
            </div>
            <div className="flex w-full lg:w-auto items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
                <Input
                  placeholder="Buscar equipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#131313] border-[#656464] text-[#D9D9D9]"
                />
              </div>
              <Button onClick={() => { setEditingTeam(null); setShowModal(true); }} className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Criar Equipe
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Carregando...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTeams.map(team => {
                const members = getTeamMembers(team.id);
                const leader = getLeader(team.leader_id);
                const company = getCompany(team.company_id);
                return (
                  <Card key={team.id} className="bg-[#131313] border-[#656464]">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base text-[#D9D9D9]">{team.name}</CardTitle>
                          {company && (
                            <p className="text-xs text-[#9CA3AF] flex items-center gap-1 mt-1">
                                <Building2 className="w-3 h-3"/>
                                {company.name}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-[#9CA3AF] hover:text-[#E50F5F]" onClick={() => {setEditingTeam(team); setShowModal(true);}}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-7 h-7 text-[#9CA3AF] hover:text-red-400" onClick={() => handleDeleteTeam(team.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {leader && (
                        <div className="flex items-center gap-2 pt-2 border-t border-[#656464] mt-2">
                           <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs bg-[#E50F5F] text-white">{leader.full_name.charAt(0)}</AvatarFallback>
                           </Avatar>
                           <div>
                            <p className="text-xs text-[#9CA3AF]">Líder</p>
                            <p className="text-sm font-medium text-[#D9D9D9]">{leader.full_name}</p>
                           </div>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-[#9CA3AF] mb-2">Membros ({members.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {members.map(member => (
                          <Avatar key={member.id} className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-gray-600">{member.full_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      <TeamModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveTeam}
        team={editingTeam}
        companies={companies}
        users={users}
        selectedCompanyId={selectedCompanyId}
      />
    </div>
  );
}
