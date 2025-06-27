import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Company } from '@/api/entities';
import { User } from '@/api/entities';
import { PlusCircle, Trash2, ExternalLink, UserPlus } from 'lucide-react';

export default function InviteUserModal({ open, onClose, user, companies }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    document: '',
    company_roles: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        document: user.document || '',
        company_roles: user.company_roles || [],
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        document: '',
        company_roles: [],
      });
    }
    setError('');
  }, [user, open]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (index, field, value) => {
    const updatedRoles = [...formData.company_roles];
    updatedRoles[index][field] = value;
    setFormData(prev => ({ ...prev, company_roles: updatedRoles }));
  };

  const addCompanyRole = () => {
    setFormData(prev => ({
      ...prev,
      company_roles: [...prev.company_roles, { company_id: '', role_function: 'colaborador' }]
    }));
  };

  const removeCompanyRole = (index) => {
    const updatedRoles = formData.company_roles.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, company_roles: updatedRoles }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.full_name || !formData.email) {
      setError('Nome e email são obrigatórios.');
      setIsLoading(false);
      return;
    }

    if (formData.company_roles.some(role => !role.company_id || !role.role_function)) {
      setError('Todos os vínculos devem ter empresa e função selecionadas.');
      setIsLoading(false);
      return;
    }

    const dataToSubmit = {
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone || undefined,
      document: formData.document || undefined,
      company_roles: formData.company_roles,
    };

    try {
      if (user) {
        await User.update(user.id, dataToSubmit);
        onClose();
      } else {
        setError('Para convidar novos usuários, use a funcionalidade nativa da plataforma.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Erro ao salvar usuário:", err);
      setError(err.message || "Ocorreu um erro. Verifique os dados e tente novamente.");
      setIsLoading(false);
    }
  };

  const openWorkspaceUsers = () => {
    window.open('https://base44.app/workspace/users', '_blank');
  };

  // Se não for edição de usuário existente, mostrar instruções
  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#E50F5F] flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Convidar Novo Usuário
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#E50F5F]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-[#E50F5F]" />
              </div>
              <h3 className="text-lg font-semibold text-[#D9D9D9] mb-2">
                Use a Funcionalidade Nativa
              </h3>
              <p className="text-[#9CA3AF] text-sm mb-6">
                Para convidar novos usuários com segurança, utilize a funcionalidade oficial da plataforma Base44.
              </p>
            </div>
            
            <div className="bg-[#131313] border border-[#656464] rounded-lg p-4">
              <h4 className="font-semibold text-[#D9D9D9] mb-2">Como convidar:</h4>
              <ol className="text-sm text-[#9CA3AF] space-y-1">
                <li>1. Acesse o Workspace da plataforma</li>
                <li>2. Vá para a seção "Usuários"</li>
                <li>3. Clique em "Convidar Usuário"</li>
                <li>4. Preencha os dados do novo usuário</li>
              </ol>
            </div>
          </div>
          
          <DialogFooter className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="bg-transparent border-[#656464] hover:bg-[#656464]/20"
            >
              Cancelar
            </Button>
            <Button 
              onClick={openWorkspaceUsers}
              className="bg-[#E50F5F] hover:bg-[#E50F5F]/80"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Formulário de edição para usuários existentes
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#E50F5F]">Editar Usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-[#9CA3AF]">Nome Completo</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label className="text-[#9CA3AF]">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                placeholder="email@exemplo.com"
                disabled
              />
            </div>
            <div>
              <Label className="text-[#9CA3AF]">Telefone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label className="text-[#9CA3AF]">CPF</Label>
              <Input
                value={formData.document}
                onChange={(e) => handleInputChange('document', e.target.value)}
                className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                placeholder="000.000.000-00"
              />
            </div>
          </div>
          
          <div className="space-y-3 pt-4 border-t border-[#656464]">
            <div className="flex items-center justify-between">
              <Label className="text-[#9CA3AF]">Vínculos com Empresas</Label>
              <Button
                type="button"
                onClick={addCompanyRole}
                className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
                size="sm"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Adicionar Vínculo
              </Button>
            </div>
            
            {formData.company_roles.map((role, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-[#131313] rounded-lg border border-[#656464]">
                <div className="flex-1">
                  <Select
                    value={role.company_id}
                    onValueChange={(value) => handleRoleChange(index, 'company_id', value)}
                  >
                    <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id} className="text-[#D9D9D9] focus:bg-[#E50F5F]/20">
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Select
                    value={role.role_function}
                    onValueChange={(value) => handleRoleChange(index, 'role_function', value)}
                  >
                    <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                      <SelectValue placeholder="Função" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                      <SelectItem value="proprietario" className="text-[#D9D9D9] focus:bg-[#E50F5F]/20">Proprietário</SelectItem>
                      <SelectItem value="administrador" className="text-[#D9D9D9] focus:bg-[#E50F5F]/20">Administrador</SelectItem>
                      <SelectItem value="lider" className="text-[#D9D9D9] focus:bg-[#E50F5F]/20">Líder</SelectItem>
                      <SelectItem value="comercial" className="text-[#D9D9D9] focus:bg-[#E50F5F]/20">Comercial</SelectItem>
                      <SelectItem value="colaborador" className="text-[#D9D9D9] focus:bg-[#E50F5F]/20">Colaborador</SelectItem>
                      <SelectItem value="parceiros" className="text-[#D9D9D9] focus:bg-[#E50F5F]/20">Parceiro</SelectItem>
                      <SelectItem value="cliente" className="text-[#D9D9D9] focus:bg-[#E50F5F]/20">Cliente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  onClick={() => removeCompanyRole(index)}
                  variant="ghost"
                  size="icon"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded">{error}</p>}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="bg-transparent border-[#656464] hover:bg-[#656464]/20"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="bg-[#E50F5F] hover:bg-[#E50F5F]/80"
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}