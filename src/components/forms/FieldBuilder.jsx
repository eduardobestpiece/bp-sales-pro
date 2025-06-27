import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Type, 
  Hash, 
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  Link as LinkIcon,
  FileText,
  CheckSquare,
  List,
  DollarSign,
  Users,
  CreditCard
} from "lucide-react";

const fieldTypes = [
  { value: "text", label: "Texto", icon: Type, description: "Campo de texto simples em uma linha" },
  { value: "textarea", label: "Texto Longo", icon: FileText, description: "Campo de texto para múltiplas linhas" },
  { value: "url", label: "URL", icon: LinkIcon, description: "Campo para links e URLs" },
  { value: "number", label: "Número", icon: Hash, description: "Campo numérico com vírgulas" },
  { value: "email", label: "Email", icon: Mail, description: "Campo de email com validação" },
  { value: "phone", label: "Telefone", icon: Phone, description: "Campo de telefone com DDI" },
  { value: "document", label: "Documento", icon: CreditCard, description: "CPF ou CNPJ com validação" },
  { value: "address", label: "Endereço", icon: MapPin, description: "Campo completo de endereço" },
  { value: "date", label: "Data", icon: Calendar, description: "Seletor de data" },
  { value: "time", label: "Hora", icon: Clock, description: "Seletor de hora" },
  { value: "datetime", label: "Data e Hora", icon: Calendar, description: "Seletor de data e hora" },
  { value: "radio", label: "Rádio", icon: CheckSquare, description: "Opções de seleção única" },
  { value: "dropdown", label: "Dropdown", icon: List, description: "Lista suspensa de opções" },
  { value: "multiple", label: "Seleção Múltipla", icon: Users, description: "Múltiplas seleções" },
  { value: "currency", label: "Valor Monetário", icon: DollarSign, description: "Campo de moeda" },
  { value: "reference", label: "Referência", icon: Users, description: "Referência a outros dados" },
  { value: "checklist", label: "Checklist", icon: CheckSquare, description: "Lista de verificação" },
  { value: "fullname", label: "Nome e Sobrenome", icon: Users, description: "Campo de nome completo" },
  { value: "dynamic", label: "Caixa Dinâmica", icon: Plus, description: "Campos que se repetem dinamicamente" }
];

export default function FieldBuilder({ fields = [], onChange }) {
  const [selectedFieldType, setSelectedFieldType] = useState("");
  const [editingField, setEditingField] = useState(null);

  const addField = (type) => {
    const newField = {
      id: Date.now().toString(),
      type,
      label: "",
      name: "",
      required: false,
      placeholder: "",
      options: [],
      validation: {},
      settings: {}
    };
    
    onChange([...fields, newField]);
    setEditingField(newField.id);
    setSelectedFieldType("");
  };

  const updateField = (fieldId, updates) => {
    const updatedFields = fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    );
    onChange(updatedFields);
  };

  const removeField = (fieldId) => {
    const updatedFields = fields.filter(field => field.id !== fieldId);
    onChange(updatedFields);
  };

  const moveField = (fieldId, direction) => {
    const fieldIndex = fields.findIndex(field => field.id === fieldId);
    if (fieldIndex === -1) return;

    const newFields = [...fields];
    const targetIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;

    if (targetIndex < 0 || targetIndex >= newFields.length) return;

    [newFields[fieldIndex], newFields[targetIndex]] = [newFields[targetIndex], newFields[fieldIndex]];
    onChange(newFields);
  };

  const FieldEditor = ({ field }) => {
    const fieldType = fieldTypes.find(type => type.value === field.type);
    
    return (
      <Card className="bg-[#131313] border-[#656464] mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {fieldType?.icon && <fieldType.icon className="w-4 h-4 text-[#E50F5F]" />}
              <CardTitle className="text-[#D9D9D9] text-sm">{fieldType?.label}</CardTitle>
              <Badge variant="outline" className="border-[#656464] text-[#9CA3AF]">
                {field.required ? "Obrigatório" : "Opcional"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => moveField(field.id, 'up')}
                className="w-6 h-6 text-[#9CA3AF] hover:text-[#E50F5F]"
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => moveField(field.id, 'down')}
                className="w-6 h-6 text-[#9CA3AF] hover:text-[#E50F5F]"
              >
                ↓
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeField(field.id)}
                className="w-6 h-6 text-[#9CA3AF] hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {editingField === field.id && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-[#9CA3AF]">Nome do Campo</Label>
                <Input
                  value={field.label}
                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                  placeholder="Ex: Nome do Cliente"
                  className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
                />
              </div>
              
              <div>
                <Label className="text-[#9CA3AF]">Nome Técnico</Label>
                <Input
                  value={field.name}
                  onChange={(e) => updateField(field.id, { name: e.target.value })}
                  placeholder="Ex: nome_cliente"
                  className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
                />
              </div>
            </div>

            <div>
              <Label className="text-[#9CA3AF]">Placeholder</Label>
              <Input
                value={field.placeholder}
                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                placeholder="Texto de ajuda para o usuário"
                className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
              />
            </div>

            {/* Opções para campos de seleção */}
            {['radio', 'dropdown', 'multiple'].includes(field.type) && (
              <div>
                <Label className="text-[#9CA3AF]">Opções (uma por linha ou separadas por vírgula)</Label>
                <Textarea
                  value={field.options.join('\n')}
                  onChange={(e) => {
                    const options = e.target.value.split(/[,\n]/).map(opt => opt.trim()).filter(Boolean);
                    updateField(field.id, { options });
                  }}
                  placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                  className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] h-24"
                />
              </div>
            )}

            {/* Configurações específicas por tipo */}
            {field.type === 'phone' && (
              <div className="p-4 bg-[#1C1C1C] rounded-lg border border-[#656464]">
                <h4 className="text-[#D9D9D9] font-medium mb-2">Configurações de Telefone</h4>
                <p className="text-[#9CA3AF] text-sm">
                  • Inclui seletor de DDI com bandeira<br/>
                  • Validação automática por país<br/>
                  • Formato salvo: DDI, number, phone
                </p>
              </div>
            )}

            {field.type === 'address' && (
              <div className="p-4 bg-[#1C1C1C] rounded-lg border border-[#656464]">
                <h4 className="text-[#D9D9D9] font-medium mb-2">Configurações de Endereço</h4>
                <p className="text-[#9CA3AF] text-sm">
                  • CEP com preenchimento automático<br/>
                  • Campos: Rua, Número, Complemento, Cidade, Estado, País
                </p>
              </div>
            )}

            {field.type === 'fullname' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={field.settings?.unique_field || false}
                    onCheckedChange={(checked) => updateField(field.id, {
                      settings: { ...field.settings, unique_field: checked }
                    })}
                  />
                  <Label className="text-[#9CA3AF]">Campo Único (exige nome e sobrenome)</Label>
                </div>
                <div className="p-4 bg-[#1C1C1C] rounded-lg border border-[#656464]">
                  <p className="text-[#9CA3AF] text-sm">
                    Formato salvo: fname (primeiro nome), lname (sobrenome), name (completo)
                  </p>
                </div>
              </div>
            )}

            {field.type === 'reference' && (
              <div className="space-y-3">
                <div>
                  <Label className="text-[#9CA3AF]">Tipo de Referência</Label>
                  <Select
                    value={field.settings?.reference_type || ""}
                    onValueChange={(value) => updateField(field.id, {
                      settings: { ...field.settings, reference_type: value }
                    })}
                  >
                    <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                      <SelectValue placeholder="Selecione o tipo de referência" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                      <SelectItem value="users">Usuários</SelectItem>
                      <SelectItem value="companies">Empresas</SelectItem>
                      <SelectItem value="leads">Leads</SelectItem>
                      <SelectItem value="products">Produtos</SelectItem>
                      <SelectItem value="workflows">Workflows</SelectItem>
                      <SelectItem value="spreadsheets">Planilhas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={field.settings?.multiple_selection || false}
                    onCheckedChange={(checked) => updateField(field.id, {
                      settings: { ...field.settings, multiple_selection: checked }
                    })}
                  />
                  <Label className="text-[#9CA3AF]">Múltiplas Seleções</Label>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Switch
                checked={field.required}
                onCheckedChange={(checked) => updateField(field.id, { required: checked })}
              />
              <Label className="text-[#9CA3AF]">Campo Obrigatório</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingField(null)}
                className="border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
              >
                Concluir
              </Button>
            </div>
          </CardContent>
        )}
        
        {editingField !== field.id && (
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#D9D9D9] font-medium">{field.label || 'Campo sem nome'}</p>
                <p className="text-[#9CA3AF] text-sm">{field.placeholder || fieldType?.description}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setEditingField(field.id)}
                className="text-[#E50F5F] hover:bg-[#E50F5F]/20"
              >
                Editar
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Lista de Campos */}
      <div className="space-y-4">
        {fields.map(field => (
          <FieldEditor key={field.id} field={field} />
        ))}
      </div>

      {/* Seleção de Novo Campo */}
      <Card className="bg-[#1C1C1C] border-[#656464] border-dashed">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-[#D9D9D9] font-medium">Adicionar Novo Campo</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {fieldTypes.map(fieldType => (
                <Button
                  key={fieldType.value}
                  variant="outline"
                  onClick={() => addField(fieldType.value)}
                  className="h-auto p-3 flex flex-col items-center gap-2 border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:border-[#E50F5F] hover:text-[#E50F5F]"
                >
                  <fieldType.icon className="w-5 h-5" />
                  <span className="text-xs text-center">{fieldType.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}