import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Mail,
  Phone,
  Hash,
  Calendar,
  List,
  CheckSquare,
  FileText,
  Eye,
  Code
} from "lucide-react";
import { Form } from "@/api/entities";

const fieldTypes = [
  { value: "text", label: "Texto", icon: Type },
  { value: "email", label: "Email", icon: Mail },
  { value: "phone", label: "Telefone", icon: Phone },
  { value: "number", label: "Número", icon: Hash },
  { value: "textarea", label: "Texto Longo", icon: FileText },
  { value: "select", label: "Lista Suspensa", icon: List },
  { value: "radio", label: "Opção Única", icon: CheckSquare },
  { value: "checkbox", label: "Múltipla Escolha", icon: CheckSquare },
  { value: "date", label: "Data", icon: Calendar },
];

export default function FormBuilderModal({ form, open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "draft",
    fields: []
  });
  const [selectedFieldType, setSelectedFieldType] = useState("");
  const [editingField, setEditingField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("builder");

  useEffect(() => {
    if (form && open) {
      setFormData({
        title: form.title || "",
        description: form.description || "",
        status: form.status || "draft",
        fields: form.fields || []
      });
    }
  }, [form, open]);

  const addField = (type) => {
    const newField = {
      id: Date.now().toString(),
      type,
      label: "",
      placeholder: "",
      required: false,
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? [''] : undefined
    };
    
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    setEditingField(newField.id);
    setSelectedFieldType("");
  };

  const updateField = (fieldId, updates) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const removeField = (fieldId) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  const addOption = (fieldId) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId 
          ? { ...field, options: [...(field.options || []), ''] }
          : field
      )
    }));
  };

  const updateOption = (fieldId, optionIndex, value) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId 
          ? { 
              ...field, 
              options: field.options?.map((opt, i) => i === optionIndex ? value : opt) 
            }
          : field
      )
    }));
  };

  const removeOption = (fieldId, optionIndex) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId 
          ? { 
              ...field, 
              options: field.options?.filter((_, i) => i !== optionIndex) 
            }
          : field
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (form?.id) {
        await Form.update(form.id, formData);
      } else {
        await Form.create(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar formulário:", error);
    }
    
    setIsLoading(false);
  };

  const generateEmbedCode = () => {
    if (!form?.id) return "";
    return `<iframe src="${window.location.origin}/form/${form.id}" width="100%" height="600" frameborder="0"></iframe>`;
  };

  const renderFieldPreview = (field) => {
    const fieldProps = {
      className: "bg-[#131313] border-[#656464] text-[#D9D9D9]",
      placeholder: field.placeholder,
      required: field.required
    };

    switch (field.type) {
      case 'textarea':
        return <Textarea {...fieldProps} rows={3} />;
      case 'select':
        return (
          <Select>
            <SelectTrigger {...fieldProps}>
              <SelectValue placeholder={field.placeholder || "Selecione uma opção"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, i) => (
                <SelectItem key={i} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input type="radio" name={field.id} value={option} className="text-[#E50F5F]" />
                <label className="text-[#D9D9D9]">{option}</label>
              </div>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input type="checkbox" value={option} className="text-[#E50F5F]" />
                <label className="text-[#D9D9D9]">{option}</label>
              </div>
            ))}
          </div>
        );
      default:
        return <Input {...fieldProps} type={field.type} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#E50F5F]">
            {form?.id ? 'Editar Formulário' : 'Construir Formulário'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#131313] border border-[#656464]">
            <TabsTrigger 
              value="builder" 
              className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Construtor
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              Visualizar
            </TabsTrigger>
            <TabsTrigger 
              value="embed" 
              className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white"
            >
              <Code className="w-4 h-4 mr-2" />
              Incorporar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Configurações do Formulário */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="bg-[#131313] border-[#656464]">
                  <CardHeader>
                    <CardTitle className="text-[#D9D9D9]">Configurações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Título</Label>
                      <Input 
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Textarea 
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                          <SelectItem value="draft">Rascunho</SelectItem>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="archived">Arquivado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Adicionar Campos */}
                <Card className="bg-[#131313] border-[#656464]">
                  <CardHeader>
                    <CardTitle className="text-[#D9D9D9]">Adicionar Campo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {fieldTypes.map(({ value, label, icon: Icon }) => (
                        <Button
                          key={value}
                          variant="outline"
                          size="sm"
                          onClick={() => addField(value)}
                          className="border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 justify-start"
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {label}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Editor de Campos */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-[#131313] border-[#656464]">
                  <CardHeader>
                    <CardTitle className="text-[#D9D9D9]">
                      Campos do Formulário ({formData.fields.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.fields.length === 0 ? (
                      <div className="text-center py-8 text-[#9CA3AF]">
                        Nenhum campo adicionado. Use o painel à esquerda para adicionar campos.
                      </div>
                    ) : (
                      formData.fields.map((field, index) => (
                        <Card key={field.id} className="bg-[#1C1C1C] border-[#656464]">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <GripVertical className="w-4 h-4 text-[#9CA3AF]" />
                                <Badge variant="outline" className="text-xs">
                                  {fieldTypes.find(t => t.value === field.type)?.label}
                                </Badge>
                              </div>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => removeField(field.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Rótulo</Label>
                                <Input 
                                  value={field.label}
                                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                                  className="bg-[#131313] border-[#656464] text-[#D9D9D9]"
                                />
                              </div>
                              <div>
                                <Label>Placeholder</Label>
                                <Input 
                                  value={field.placeholder}
                                  onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                  className="bg-[#131313] border-[#656464] text-[#D9D9D9]"
                                />
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 mt-4">
                              <Switch
                                checked={field.required}
                                onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                              />
                              <Label>Campo obrigatório</Label>
                            </div>

                            {/* Opções para campos select, radio, checkbox */}
                            {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                              <div className="mt-4">
                                <Label>Opções</Label>
                                <div className="space-y-2 mt-2">
                                  {field.options?.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center gap-2">
                                      <Input 
                                        value={option}
                                        onChange={(e) => updateOption(field.id, optIndex, e.target.value)}
                                        className="bg-[#131313] border-[#656464] text-[#D9D9D9]"
                                        placeholder={`Opção ${optIndex + 1}`}
                                      />
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => removeOption(field.id, optIndex)}
                                        className="border-[#656464] text-[#D9D9D9]"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addOption(field.id)}
                                    className="border-[#656464] text-[#D9D9D9]"
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Adicionar Opção
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <Card className="bg-[#131313] border-[#656464]">
              <CardHeader>
                <CardTitle className="text-[#D9D9D9]">Visualização do Formulário</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#D9D9D9] mb-2">{formData.title}</h2>
                    {formData.description && (
                      <p className="text-[#9CA3AF] mb-6">{formData.description}</p>
                    )}
                  </div>
                  
                  {formData.fields.map((field) => (
                    <div key={field.id}>
                      <Label className="text-[#D9D9D9]">
                        {field.label}
                        {field.required && <span className="text-[#E50F5F] ml-1">*</span>}
                      </Label>
                      <div className="mt-1">
                        {renderFieldPreview(field)}
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    type="button" 
                    className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
                    disabled
                  >
                    Enviar
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="embed" className="mt-6">
            <Card className="bg-[#131313] border-[#656464]">
              <CardHeader>
                <CardTitle className="text-[#D9D9D9]">Código de Incorporação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-[#9CA3AF]">
                    Copie o código abaixo e cole no seu site para incorporar este formulário:
                  </p>
                  <div className="bg-[#1C1C1C] border border-[#656464] rounded-md p-4">
                    <code className="text-[#D9D9D9] text-sm break-all">
                      {generateEmbedCode()}
                    </code>
                  </div>
                  <Button
                    onClick={() => navigator.clipboard.writeText(generateEmbedCode())}
                    className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
                  >
                    Copiar Código
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-3 pt-6 border-t border-[#656464]">
          <Button type="button" variant="outline" onClick={onClose} className="border-[#656464] text-[#D9D9D9]">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white">
            {isLoading ? "Salvando..." : "Salvar Formulário"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}