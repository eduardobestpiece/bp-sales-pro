import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { User } from '@/api/entities';
import { Workflow } from '@/api/entities';
import { Company } from '@/api/entities';
import { useToast } from "@/components/ui/use-toast";

export default function InviteUserToWorkflowModal({ open, onClose, companies, workflow, onSuccess }) {
  const [email, setEmail] = useState('');
  const [selectedCompanyIds, setSelectedCompanyIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setEmail('');
      setSelectedCompanyIds([]);
    }
  }, [open]);

  const handleCompanyChange = (companyId, checked) => {
    setSelectedCompanyIds(prev =>
      checked ? [...prev, companyId] : prev.filter(id => id !== companyId)
    );
  };
  
  const handleInvite = async () => {
    if (!email || selectedCompanyIds.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o email e selecione ao menos uma empresa.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Verificar se o usuário existe na plataforma
      const existingUsers = await User.filter({ email: email.toLowerCase().trim() });
      let targetUser = existingUsers?.[0];

      if (!targetUser) {
        // NOTA: A plataforma não suporta a criação de usuários via SDK.
        // Esta é uma simulação. O ideal seria ter uma API de convite.
        // Por agora, vamos informar ao usuário que o usuário não foi encontrado.
         toast({
          title: "Usuário não encontrado",
          description: `O email "${email}" não corresponde a nenhum usuário na plataforma. Por favor, convide-o primeiro através de 'Cadastros > Usuários'.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // 2. Atualizar as empresas do usuário
      const currentUserCompanies = new Set(targetUser.company_ids || []);
      selectedCompanyIds.forEach(id => currentUserCompanies.add(id));
      
      await User.update(targetUser.id, { 
          company_ids: Array.from(currentUserCompanies),
          role_function: targetUser.role_function || 'colaborador' // Garante a função padrão
      });

      // 3. Adicionar o usuário ao workflow
      const updatedInvitedUsers = Array.from(new Set([...(workflow.invited_users || []), targetUser.id]));
      await Workflow.update(workflow.id, { invited_users: updatedInvitedUsers });

      toast({
        title: "Sucesso!",
        description: `${targetUser.full_name || email} foi adicionado ao workflow e às empresas selecionadas.`,
      });
      
      onSuccess(targetUser); // Passa o usuário de volta para a tela de edição
      onClose();

    } catch (error) {
      console.error("Erro ao convidar usuário:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar a solicitação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
        <DialogHeader>
          <DialogTitle className="text-[#E50F5F]">Convidar para Workflow</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="email">Email do Usuário</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
              className="bg-[#131313] border-[#656464] mt-1"
            />
             <p className="text-xs text-gray-500 mt-1">O usuário já deve existir na plataforma.</p>
          </div>

          <div>
            <Label>Adicionar às Empresas</Label>
            <div className="mt-2 space-y-2 p-3 bg-[#131313] rounded-md max-h-48 overflow-y-auto">
              {companies.map(company => (
                <div key={company.id} className="flex items-center gap-3">
                  <Checkbox
                    id={`company-${company.id}`}
                    checked={selectedCompanyIds.includes(company.id)}
                    onCheckedChange={(checked) => handleCompanyChange(company.id, checked)}
                    className="border-[#E50F5F] data-[state=checked]:bg-[#E50F5F]"
                  />
                  <Label htmlFor={`company-${company.id}`} className="font-normal">{company.name}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="bg-transparent border-[#656464] hover:bg-[#656464]/20">Cancelar</Button>
          <Button onClick={handleInvite} disabled={isLoading} className="bg-[#E50F5F] hover:bg-[#E50F5F]/80">
            {isLoading ? "Convidando..." : "Convidar e Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}