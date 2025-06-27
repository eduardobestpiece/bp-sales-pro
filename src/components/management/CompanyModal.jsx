
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload } from 'lucide-react';
import { Company } from '@/api/entities';
import { User } from '@/api/entities';
import { LeadSource } from '@/api/entities';
import { LossReason } from '@/api/entities';
import { UploadFile } from '@/api/integrations';

const fetchAddressByCEP = async (cep) => {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
    if (!response.ok) throw new Error('CEP não encontrado');
    const data = await response.json();
    return data.erro ? null : data;
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
};

const formatCNPJ = (cnpj) => {
  if (!cnpj) return "";
  const cleaned = cnpj.replace(/\D/g, "");
  // Max length for formatting is 14 digits (CNPJ)
  const truncated = cleaned.substring(0, 14);

  const match = truncated.match(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})$/);
  if (!match) return truncated; // Return as is if it doesn't match the pattern yet

  let formatted = "";
  if (match[1]) formatted += match[1];
  if (match[2]) formatted += "." + match[2];
  if (match[3]) formatted += "." + match[3];
  if (match[4]) formatted += "/" + match[4];
  if (match[5]) formatted += "-" + match[5];

  return formatted;
};

const validateCNPJ = (cnpj) => {
  if (!cnpj) return true; // Consider empty CNPJ as valid or handle as required

  const cleaned = cnpj.replace(/[^\d]+/g, '');

  if (cleaned.length !== 14) return false;

  // Elimina CNPJs invalidos conhecidos
  if (cleaned === "00000000000000" ||
      cleaned === "11111111111111" ||
      cleaned === "22222222222222" ||
      cleaned === "33333333333333" ||
      cleaned === "44444444444444" ||
      cleaned === "55555555555555" ||
      cleaned === "66666666666666" ||
      cleaned === "77777777777777" ||
      cleaned === "88888888888888" ||
      cleaned === "99999999999999")
      return false;

  // Valida DVs
  let size = cleaned.length - 2;
  let numbers = cleaned.substring(0, size);
  const digits = cleaned.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result != parseInt(digits.charAt(0))) return false;

  size = size + 1;
  numbers = cleaned.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result != parseInt(digits.charAt(1))) return false;

  return true;
};

export default function CompanyModal({ open, onClose, company, users, currentUser }) {
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    address: { zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' },
    owner_id: '',
    logo_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cnpjError, setCnpjError] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        cnpj: company.cnpj || '',
        address: company.address || { zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' },
        owner_id: company.owner_id || '',
        logo_url: company.logo_url || ''
      });
    } else {
      setFormData({
        name: '',
        cnpj: '',
        address: { zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' },
        owner_id: currentUser?.id || '',
        logo_url: ''
      });
    }
    // Reset logoFile state when modal opens/company changes
    setLogoFile(null);
    setCnpjError(''); // Clear CNPJ error on open
  }, [company, currentUser, open]);

  const handleCEPChange = async (e) => {
    const cep = e.target.value;
    setFormData(prev => ({ ...prev, address: { ...prev.address, zipCode: cep } }));
    if (cep.replace(/\D/g, '').length === 8) {
      const addressData = await fetchAddressByCEP(cep);
      if (addressData) {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            street: addressData.logradouro,
            neighborhood: addressData.bairro,
            city: addressData.localidade,
            state: addressData.uf
          }
        }));
      }
    }
  };

  const handleCnpjChange = (e) => {
    const formattedCnpj = formatCNPJ(e.target.value);
    setFormData(prev => ({ ...prev, cnpj: formattedCnpj }));
    const cleanedCnpj = formattedCnpj.replace(/[^\d]+/g, '');
    if (cleanedCnpj.length === 14) {
      if (!validateCNPJ(formattedCnpj)) {
        setCnpjError("CNPJ inválido.");
      } else {
        setCnpjError("");
      }
    } else if (cleanedCnpj.length > 0 && cleanedCnpj.length < 14) {
        setCnpjError("CNPJ incompleto.");
    } else {
      setCnpjError("");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, address: { ...prev.address, [name]: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Re-validate CNPJ on submit just in case
    if (formData.cnpj.replace(/[^\d]+/g, '').length === 14 && !validateCNPJ(formData.cnpj)) {
      setCnpjError("CNPJ inválido.");
      return;
    }
    if (cnpjError) return;

    setIsSubmitting(true);

    let finalFormData = { ...formData };

    try {
      if (logoFile) {
        const { file_url } = await UploadFile({ file: logoFile });
        finalFormData.logo_url = file_url;
      }

      if (company) {
        await Company.update(company.id, finalFormData);
      } else {
        const newCompany = await Company.create({
          ...finalFormData,
          company_type: 'company' // Definir tipo padrão
        });
        
        // Copiar origens e motivos de perda globais para a nova empresa
        const globalLeadSources = await LeadSource.filter({ company_id: null });
        if (globalLeadSources.length > 0) {
          const newLeadSources = globalLeadSources.map(ls => ({ ...ls, id: undefined, company_id: newCompany.id }));
          await LeadSource.bulkCreate(newLeadSources);
        }
        const globalLossReasons = await LossReason.filter({ company_id: null });
        if (globalLossReasons.length > 0) {
          const newLossReasons = globalLossReasons.map(lr => ({ ...lr, id: undefined, company_id: newCompany.id }));
          await LossReason.bulkCreate(newLossReasons);
        }
      }
      onClose();
    } catch (error) {
      console.error("Erro ao salvar empresa:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const canChangeOwner = currentUser?.company_roles?.some(cr => cr.role_function === 'proprietario');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-[#E50F5F]">{company ? 'Editar Empresa' : 'Adicionar Empresa'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={logoFile ? URL.createObjectURL(logoFile) : formData.logo_url} />
              <AvatarFallback className="bg-[#E50F5F] text-white">{formData.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label>Logo da Empresa</Label>
              <Button type="button" variant="outline" className="w-full mt-2 bg-[#131313] border-[#656464] hover:bg-[#656464]/20" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Carregar Imagem
              </Button>
              <Input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files[0])}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="name">Nome da empresa</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} className="bg-[#131313] border-[#656464] mt-1" />
          </div>
          <div>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input 
                id="cnpj" 
                name="cnpj" 
                value={formData.cnpj} 
                onChange={handleCnpjChange} 
                className="bg-[#131313] border-[#656464] mt-1" 
                maxLength={18} // Max length for formatted CNPJ (xx.xxx.xxx/xxxx-xx)
            />
            {cnpjError && <p className="text-red-500 text-xs mt-1">{cnpjError}</p>}
          </div>
          
          <div className="space-y-2 border-t border-b border-[#656464] py-4">
            <h3 className="font-medium">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Label htmlFor="zipCode">CEP</Label>
                <Input id="zipCode" name="zipCode" value={formData.address.zipCode} onChange={handleCEPChange} className="bg-[#131313] border-[#656464] mt-1" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="street">Endereço</Label>
                <Input id="street" name="street" value={formData.address.street} onChange={handleAddressChange} className="bg-[#131313] border-[#656464] mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <Input name="number" placeholder="Número" value={formData.address.number} onChange={handleAddressChange} className="bg-[#131313] border-[#656464]" />
                 <Input name="complement" placeholder="Complemento" value={formData.address.complement} onChange={handleAddressChange} className="bg-[#131313] border-[#656464]" />
                 <Input name="neighborhood" placeholder="Bairro" value={formData.address.neighborhood} onChange={handleAddressChange} className="bg-[#131313] border-[#656464]" />
                 <Input name="city" placeholder="Cidade" value={formData.address.city} onChange={handleAddressChange} className="bg-[#131313] border-[#656464]" />
                 <Input name="state" placeholder="Estado" value={formData.address.state} onChange={handleAddressChange} className="bg-[#131313] border-[#656464]" />
            </div>
          </div>
          
          {company && canChangeOwner && (
            <div>
              <Label htmlFor="owner_id">Proprietário</Label>
              <Select value={formData.owner_id} onValueChange={(value) => setFormData(prev => ({...prev, owner_id: value}))}>
                <SelectTrigger className="bg-[#131313] border-[#656464] mt-1">
                  <SelectValue placeholder="Selecione um proprietário" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1C] text-[#D9D9D9] border-[#656464]">
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id} className="focus:bg-[#E50F5F]/20">{user.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="bg-transparent border-[#656464] hover:bg-[#656464]/20">Cancelar</Button>
            <Button type="submit" disabled={isSubmitting || !!cnpjError} className="bg-[#E50F5F] hover:bg-[#E50F5F]/80">
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
