
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListChecks, Type, Pilcrow, Link as LinkIcon, Hash, BookMarked, FileText as FileTextIcon, AtSign, Phone, MapPin, Disc, ChevronDownSquare, Container, Calendar, Clock, CalendarClock, UserSquare, DollarSign, EyeOff, Minus } from 'lucide-react';

const subFieldTypes = [
  { type: 'checklist', label: 'Checklist', icon: ListChecks },
  { type: 'text', label: 'Texto', icon: Type },
  { type: 'long_text', label: 'Texto Longo', icon: Pilcrow },
  { type: 'url', label: 'URL', icon: LinkIcon },
  { type: 'number', label: 'Número', icon: Hash },
  { type: 'reference', label: 'Referência', icon: BookMarked },
  { type: 'document', label: 'Documento', icon: FileTextIcon },
  { type: 'email', label: 'Email', icon: AtSign },
  { type: 'phone', label: 'Telefone', icon: Phone },
  { type: 'address', label: 'Endereço', icon: MapPin },
  { type: 'radio', label: 'Rádio', icon: Disc },
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDownSquare },
  { type: 'multi_select', label: 'Seleção de múltiplos', icon: ListChecks },
  { type: 'date', label: 'Data', icon: Calendar },
  { type: 'time', label: 'Hora', icon: Clock },
  { type: 'datetime', label: 'Data e Hora', icon: CalendarClock },
  { type: 'full_name', label: 'Nome e sobrenome', icon: UserSquare },
  { type: 'money', label: 'Valor monetário', icon: DollarSign },
];

// Componentes de configuração específicos para cada tipo de campo
const fieldConfigs = {
  text: ({ field, updateConfig }) => null, // No config needed
  
  long_text: ({ field, updateConfig }) => null,
  
  number: ({ field, updateConfig }) => null,
  
  url: ({ field, updateConfig }) => null,
  
  email: ({ field, updateConfig }) => null,
  
  phone: ({ field, updateConfig }) => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-[#E50F5F] border-b border-[#404040] pb-2">Configuração de Telefone</h4>
      <div>
        <Label className="text-xs">DDI Padrão</Label>
        <Input
          value={field.config?.defaultDDI || ''}
          onChange={(e) => updateConfig('defaultDDI', e.target.value)}
          className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8"
          placeholder="Ex: 55"
        />
      </div>
      <p className="text-xs text-[#9CA3AF]">O telefone será salvo nos formatos: DDI, number e phone.</p>
    </div>
  ),
  
  document: ({ field, updateConfig }) => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-[#E50F5F] border-b border-[#404040] pb-2">Configuração de Documento</h4>
      <div>
        <Label className="text-xs">Tipo de Documento</Label>
        <Select
          value={field.config?.documentType || 'both'}
          onValueChange={(value) => updateConfig('documentType', value)}
        >
          <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1C1C1C] border-[#656464]">
            <SelectItem value="cpf">Apenas CPF</SelectItem>
            <SelectItem value="cnpj">Apenas CNPJ</SelectItem>
            <SelectItem value="both">CPF ou CNPJ</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
  
  address: ({ field, updateConfig }) => null,
  
  date: ({ field, updateConfig }) => null,
  
  time: ({ field, updateConfig }) => null,
  
  datetime: ({ field, updateConfig }) => null,
  
  money: ({ field, updateConfig }) => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-[#E50F5F] border-b border-[#404040] pb-2">Configuração de Valor Monetário</h4>
      <div>
        <Label className="text-xs">Moeda</Label>
        <Select
          value={field.config?.currency || 'BRL'}
          onValueChange={(value) => updateConfig('currency', value)}
        >
          <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1C1C1C] border-[#656464]">
            <SelectItem value="BRL">Real (R$)</SelectItem>
            <SelectItem value="USD">Dólar ($)</SelectItem>
            <SelectItem value="EUR">Euro (€)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
  
  full_name: ({ field, updateConfig }) => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-[#E50F5F] border-b border-[#404040] pb-2">Configuração de Nome Completo</h4>
      <div className="flex items-center justify-between">
        <Label className="text-xs">Campo Único</Label>
        <Switch
          checked={field.config?.singleField || false}
          onCheckedChange={(checked) => updateConfig('singleField', checked)}
        />
      </div>
      <p className="text-xs text-[#9CA3AF]">Salva nos formatos: fname, lname e name.</p>
    </div>
  ),
  
  hidden: ({ field, updateConfig }) => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-[#E50F5F] border-b border-[#404040] pb-2">Configuração de Campo Oculto</h4>
      <div>
        <Label className="text-xs">Valor Fixo</Label>
        <Input
          value={field.config?.fixedValue || ''}
          onChange={(e) => updateConfig('fixedValue', e.target.value)}
          className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8"
          placeholder="Deixe vazio para capturar da URL"
        />
      </div>
      <p className="text-xs text-[#9CA3AF]">Se vazio, capturará o valor dos parâmetros da URL.</p>
    </div>
  ),
  
  divider: ({ field, updateConfig }) => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-[#E50F5F] border-b border-[#404040] pb-2">Configuração de Divisória</h4>
      <div>
        <Label className="text-xs">Texto da Etapa</Label>
        <Input
          value={field.config?.stepText || ''}
          onChange={(e) => updateConfig('stepText', e.target.value)}
          className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8"
          placeholder="Ex: Dados Pessoais"
        />
      </div>
      <p className="text-xs text-[#9CA3AF]">Cria etapas no formulário com barra de progresso.</p>
    </div>
  ),
  
  checklist: ({ field, updateConfig }) => {
    const items = field.config?.items || [];

    const handleItemChange = (itemId, newValue) => {
      updateConfig('items', items.map(item => item.id === itemId ? { ...item, value: newValue } : item));
    };

    const handleRemoveItem = (itemId) => {
      updateConfig('items', items.filter(item => item.id !== itemId));
    };

    const addItem = () => {
      updateConfig('items', [...items, { id: `item-${Date.now()}`, value: '' }]);
    };

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-[#E50F5F] border-b border-[#404040] pb-2">Itens do Checklist</h4>
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2">
            <Input
              value={item.value}
              onChange={(e) => handleItemChange(item.id, e.target.value)}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8 flex-grow"
              placeholder="Nome do item"
            />
            <Button variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => handleRemoveItem(item.id)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button onClick={addItem} variant="outline" className="w-full text-xs bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:text-[#D9D9D9]">
          <Plus className="w-3 h-3 mr-2" />
          Adicionar Item
        </Button>
      </div>
    );
  },
  
  radio: ({ field, updateConfig }) => {
    const options = field.config?.options || [];

    const handleOptionChange = (index, newValue) => {
      const newOptions = [...options];
      newOptions[index] = newValue;
      updateConfig('options', newOptions);
    };

    const handleRemoveOption = (index) => {
      const newOptions = options.filter((_, i) => i !== index);
      updateConfig('options', newOptions);
    };

    const addOption = () => {
      updateConfig('options', [...options, '']); // Add an empty string for new option
    };
    
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-[#E50F5F] border-b border-[#404040] pb-2">Opções</h4>
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8 flex-grow"
              placeholder={`Opção ${index + 1}`}
            />
            <Button variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => handleRemoveOption(index)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button onClick={addOption} variant="outline" className="w-full text-xs bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:text-[#D9D9D9]">
          <Plus className="w-3 h-3 mr-2" /> Adicionar Opção
        </Button>
      </div>
    );
  },
  
  dropdown: ({ field, updateConfig }) => {
    const options = field.config?.options || [];

    const handleOptionChange = (index, newValue) => {
      const newOptions = [...options];
      newOptions[index] = newValue;
      updateConfig('options', newOptions);
    };

    const handleRemoveOption = (index) => {
      const newOptions = options.filter((_, i) => i !== index);
      updateConfig('options', newOptions);
    };

    const addOption = () => {
      updateConfig('options', [...options, '']); // Add an empty string for new option
    };
    
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-[#E50F5F] border-b border-[#404040] pb-2">Opções</h4>
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8 flex-grow"
              placeholder={`Opção ${index + 1}`}
            />
            <Button variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => handleRemoveOption(index)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button onClick={addOption} variant="outline" className="w-full text-xs bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:text-[#D9D9D9]">
          <Plus className="w-3 h-3 mr-2" /> Adicionar Opção
        </Button>
      </div>
    );
  },
  
  multi_select: ({ field, updateConfig }) => {
    const options = field.config?.options || [];

    const handleOptionChange = (index, newValue) => {
      const newOptions = [...options];
      newOptions[index] = newValue;
      updateConfig('options', newOptions);
    };

    const handleRemoveOption = (index) => {
      const newOptions = options.filter((_, i) => i !== index);
      updateConfig('options', newOptions);
    };

    const addOption = () => {
      updateConfig('options', [...options, '']); // Add an empty string for new option
    };
    
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-[#E50F5F] border-b border-[#404040] pb-2">Opções</h4>
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8 flex-grow"
              placeholder={`Opção ${index + 1}`}
            />
            <Button variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => handleRemoveOption(index)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button onClick={addOption} variant="outline" className="w-full text-xs bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:text-[#D9D9D9]">
          <Plus className="w-3 h-3 mr-2" /> Adicionar Opção
        </Button>
      </div>
    );
  },
  
  reference: ({ field, updateConfig }) => (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-[#E50F5F] border-b border-[#404040] pb-2">Configuração de Referência</h4>
      <div>
        <Label className="text-xs">Fonte de Dados</Label>
        <Select
          value={field.config?.referenceType || ''}
          onValueChange={(value) => updateConfig('referenceType', value)}
        >
          <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1C1C1C] border-[#656464]">
            <SelectItem value="workflows">Workflows</SelectItem>
            <SelectItem value="playbooks">Playbooks</SelectItem>
            <SelectItem value="activity_templates">Atividades Modelo</SelectItem>
            <SelectItem value="users">Usuários</SelectItem>
            <SelectItem value="companies">Empresas</SelectItem>
            <SelectItem value="lead_sources">Origens de Leads</SelectItem>
            <SelectItem value="loss_reasons">Motivos de Perda</SelectItem>
            <SelectItem value="products">Produtos</SelectItem>
            <SelectItem value="forms">Formulários</SelectItem>
            <SelectItem value="drive_links">Links do Drive</SelectItem>
            <SelectItem value="leads">Leads</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="item-unico" className="text-xs">Item Único</Label>
        <Switch
          id="item-unico"
          checked={field.config?.isSingle === undefined ? true : field.config.isSingle}
          onCheckedChange={(checked) => updateConfig('isSingle', checked)}
        />
      </div>
       <p className="text-xs text-[#9CA3AF]">Se desmarcado, o usuário poderá selecionar múltiplos itens. Formulários privados são necessários para a maioria das fontes de dados.</p>
    </div>
  ),
  
  dynamic_box: ({ field, updateConfig }) => {
    const fields = field.config?.fields || [];
    
    const addSubField = (type) => {
      const newField = {
        id: `subfield-${Date.now()}`,
        type: type,
        label: `Novo Sub-campo (${type})`,
        name: `subcampo_${Date.now()}`
      };
      updateConfig('fields', [...fields, newField]);
    };
    
    const removeSubField = (id) => {
      updateConfig('fields', fields.filter(f => f.id !== id));
    };

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-[#E50F5F] border-b border-[#404040] pb-2">Configuração da Caixa Dinâmica</h4>
        <div>
          <Label className="text-xs">Limite de Itens</Label>
          <Input
            type="number"
            value={field.config?.limit || ''}
            onChange={(e) => updateConfig('limit', e.target.value ? parseInt(e.target.value, 10) : '')}
            className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8"
            placeholder="Opcional"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Campos na Caixa</Label>
          {fields.map(subField => (
            <div key={subField.id} className="flex items-center justify-between p-2 bg-[#1A1A1A] rounded">
              <span className="text-sm text-gray-300">{subField.label} ({subField.type})</span>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeSubField(subField.id)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full text-xs bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:text-[#D9D9D9]">
              <Plus className="w-3 h-3 mr-2" /> Adicionar Campo à Caixa
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-h-60 overflow-y-auto custom-scrollbar">
            {subFieldTypes.map(ft => {
              const Icon = ft.icon;
              return (
                <DropdownMenuItem key={ft.type} onSelect={() => addSubField(ft.type)} className="focus:bg-[#E50F5F]/20">
                  <Icon className="w-4 h-4 mr-2" />
                  <span>{ft.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
};

export default function FieldEditorModal({ field, open, onClose, onSave }) {
  const [localField, setLocalField] = useState(null);

  useEffect(() => {
    if (field) {
      setLocalField({ ...field });
    }
  }, [field]);

  const updateField = (key, value) => {
    setLocalField(prev => ({ ...prev, [key]: value }));
  };
  
  const updateConfig = (key, value) => {
    setLocalField(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    onSave(localField);
  };

  if (!localField) return null;

  const SpecificConfig = fieldConfigs[localField.type];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-2xl w-[95vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Campo: <span className="text-[#E50F5F]">{localField.label}</span></DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
          {/* Configurações Gerais */}
          <div className="space-y-4 p-4 bg-[#1A1A1A] rounded-lg border border-[#404040]">
            <h4 className="text-sm font-medium text-[#D9D9D9]">Configurações Gerais</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="label" className="text-xs">Nome do Campo (Rótulo)</Label>
                <Input id="label" value={localField.label} onChange={e => updateField('label', e.target.value)} className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8"/>
              </div>
              <div>
                <Label htmlFor="name" className="text-xs">Nome da Variável (sem espaços)</Label>
                <Input id="name" value={localField.name} onChange={e => updateField('name', e.target.value.toLowerCase().replace(/\s/g, '_'))} className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8"/>
              </div>
            </div>
             <div>
              <Label htmlFor="placeholder" className="text-xs">Texto de Exemplo (Placeholder)</Label>
              <Input id="placeholder" value={localField.placeholder || ''} onChange={e => updateField('placeholder', e.target.value)} className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8"/>
            </div>
             <div>
              <Label htmlFor="defaultValue" className="text-xs">Valor Padrão</Label>
              <Input id="defaultValue" value={localField.defaultValue || ''} onChange={e => updateField('defaultValue', e.target.value)} className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8"/>
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="required" className="text-xs">Campo Obrigatório</Label>
                <Switch id="required" checked={localField.required} onCheckedChange={checked => updateField('required', checked)}/>
            </div>
          </div>

          {SpecificConfig && (
            <div className="space-y-4 p-4 bg-[#1A1A1A] rounded-lg border border-[#404040]">
              <SpecificConfig field={localField} updateConfig={updateConfig} />
            </div>
          )}
        </div>
        
        <DialogFooter className="p-6 border-t border-[#656464]">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-[#656464] text-[#D9D9D9] bg-[#131313] hover:bg-[#656464]/20"
          >
            Cancelar
          </Button>
          <Button className="bg-[#E50F5F] hover:bg-[#E50F5F]/80" onClick={handleSave}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
