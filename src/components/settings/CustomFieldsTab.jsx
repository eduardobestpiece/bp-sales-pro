import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Puzzle, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Type,
  Hash,
  Calendar,
  List,
  FileText,
  CheckSquare,
  Eye,
  Save,
  X,
  Settings
} from "lucide-react";
import { CustomField } from "@/api/entities";

const fieldTypes = [
  { 
    id: 'text', 
    name: 'Texto', 
    icon: Type, 
    description: 'Campo de texto simples',
    color: 'bg-blue-500/20 text-blue-400'
  },
  { 
    id: 'textarea', 
    name: 'Texto Longo', 
    icon: FileText, 
    description: 'Campo de texto com múltiplas linhas',
    color: 'bg-green-500/20 text-green-400'
  },
  { 
    id: 'number', 
    name: 'Número', 
    icon: Hash, 
    description: 'Campo numérico',
    color: 'bg-purple-500/20 text-purple-400'
  },
  { 
    id: 'date', 
    name: 'Data', 
    icon: Calendar, 
    description: 'Seleção de data',
    color: 'bg-yellow-500/20 text-yellow-400'
  },
  { 
    id: 'select', 
    name: 'Lista Suspensa', 
    icon: List, 
    description: 'Seleção de uma opção',
    color: 'bg-red-500/20 text-red-400'
  },
  { 
    id: 'checkbox', 
    name: 'Caixa de Seleção', 
    icon: CheckSquare, 
    description: 'Verdadeiro ou falso',
    color: 'bg-indigo-500/20 text-indigo-400'
  }
];

const appliesTo = [
  { id: 'lead', name: 'Leads', description: 'Campos para leads e prospects' },
  { id: 'deal', name: 'Negócios', description: 'Campos para oportunidades de venda' },
  { id: 'contact', name: 'Contatos', description: 'Campos para pessoas/contatos' },
  { id: 'company', name: 'Empresas', description: 'Campos para empresas clientes' },
  { id: 'activity', name: 'Atividades', description: 'Campos para tarefas e atividades' },
  { id: 'product', name: 'Produtos', description: 'Campos para produtos/serviços' }
];

export default function CustomFieldsTab({ companies, user }) {
  const [customFields, setCustomFields] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterAppliesTo, setFilterAppliesTo] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [previewField, setPreviewField] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estado do formulário
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    type: 'text',
    applies_to: [],
    options: [],
    required: false,
    placeholder: '',
    description: ''
  });

  useEffect(() => {
    loadCustomFields();
  }, []);

  const loadCustomFields = async () => {
    setIsLoading(true);
    try {
      const fields = await CustomField.list();
      setCustomFields(fields);
    } catch (error) {
      console.error("Erro ao carregar campos personalizados:", error);
    }
    setIsLoading(false);
  };

  const filteredFields = customFields.filter(field => {
    const matchesSearch = 
      field.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || field.type === filterType;
    const matchesAppliesTo = filterAppliesTo === "all" || field.applies_to?.includes(filterAppliesTo);
    
    return matchesSearch && matchesType && matchesAppliesTo;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      label: '',
      type: 'text',
      applies_to: [],
      options: [],
      required: false,
      placeholder: '',
      description: ''
    });
  };

  const handleCreate = () => {
    resetForm();
    setEditingField(null);
    setShowCreateModal(true);
  };

  const handleEdit = (field) => {
    setFormData({
      name: field.name || '',
      label: field.label || '',
      type: field.type || 'text',
      applies_to: field.applies_to || [],
      options: field.options || [],
      required: field.required || false,
      placeholder: field.placeholder || '',
      description: field.description || ''
    });
    setEditingField(field);
    setShowCreateModal(true);
  };

  const handleDelete = async (field) => {
    if (window.confirm(`Tem certeza que deseja excluir o campo "${field.label}"?\n\nEsta ação não pode ser desfeita e removerá todos os dados associados a este campo.`)) {
      try {
        await CustomField.delete(field.id);
        await loadCustomFields();
      } catch (error) {
        console.error("Erro ao excluir campo:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.label || formData.applies_to.length === 0) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    // Gerar nome automaticamente se não foi fornecido
    if (!formData.name.trim()) {
      const generatedName = formData.label
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);
      formData.name = `campo_${generatedName}`;
    }

    try {
      if (editingField) {
        await CustomField.update(editingField.id, formData);
      } else {
        await CustomField.create(formData);
      }
      
      await loadCustomFields();
      setShowCreateModal(false);
      resetForm();
      setEditingField(null);
    } catch (error) {
      console.error("Erro ao salvar campo:", error);
      alert("Erro ao salvar campo. Verifique se o nome não está em uso.");
    }
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const toggleAppliesTo = (entityType) => {
    setFormData(prev => ({
      ...prev,
      applies_to: prev.applies_to.includes(entityType)
        ? prev.applies_to.filter(type => type !== entityType)
        : [...prev.applies_to, entityType]
    }));
  };

  const getFieldTypeInfo = (type) => {
    return fieldTypes.find(ft => ft.id === type) || fieldTypes[0];
  };

  const getAppliesInfo = (applies) => {
    return applies.map(type => appliesTo.find(at => at.id === type)).filter(Boolean);
  };

  const renderFieldPreview = () => {
    if (!previewField && !showCreateModal) return null;
    
    const field = previewField || formData;
    const typeInfo = getFieldTypeInfo(field.type);
    
    return (
      <div className="p-4 bg-[#131313] rounded-lg border border-[#656464]">
        <h4 className="text-sm font-medium text-[#D9D9D9] mb-3">Pré-visualização</h4>
        
        <div className="space-y-2">
          <Label className="text-[#D9D9D9]">
            {field.label || 'Nome do Campo'}
            {field.required && <span className="text-red-400 ml-1">*</span>}
          </Label>
          
          {field.type === 'text' && (
            <Input
              placeholder={field.placeholder || "Digite aqui..."}
              className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
              disabled
            />
          )}
          
          {field.type === 'textarea' && (
            <Textarea
              placeholder={field.placeholder || "Digite sua resposta..."}
              className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] h-20"
              disabled
            />
          )}
          
          {field.type === 'number' && (
            <Input
              type="number"
              placeholder={field.placeholder || "0"}
              className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
              disabled
            />
          )}
          
          {field.type === 'date' && (
            <Input
              type="date"
              className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
              disabled
            />
          )}
          
          {field.type === 'select' && (
            <Select disabled>
              <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                <SelectValue placeholder="Selecione uma opção..." />
              </SelectTrigger>
              <SelectContent>
                {(field.options || []).map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option || `Opção ${index + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {field.type === 'checkbox' && (
            <div className="flex items-center space-x-2">
              <Checkbox disabled />
              <Label className="text-[#9CA3AF]">
                {field.placeholder || "Marque esta opção"}
              </Label>
            </div>
          )}
          
          {field.description && (
            <p className="text-xs text-[#9CA3AF]">{field.description}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header e Controles */}
      <Card className="bg-[#1C1C1C] border-[#656464]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#D9D9D9] flex items-center gap-2">
              <Puzzle className="w-5 h-5" />
              Campos Personalizados ({filteredFields.length})
            </CardTitle>
            
            <Button
              onClick={handleCreate}
              className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Campo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
              <Input
                placeholder="Buscar campos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#131313] border-[#656464] text-[#D9D9D9]"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                <SelectItem value="all">Todos os tipos</SelectItem>
                {fieldTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterAppliesTo} onValueChange={setFilterAppliesTo}>
              <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                <SelectValue placeholder="Aplicado a" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                <SelectItem value="all">Todos os contextos</SelectItem>
                {appliesTo.map(entity => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Campos */}
      {filteredFields.length === 0 ? (
        <Card className="bg-[#1C1C1C] border-[#656464]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Puzzle className="w-12 h-12 text-[#9CA3AF] mb-4" />
            <h3 className="text-lg font-medium text-[#D9D9D9] mb-2">
              {searchTerm || filterType !== "all" || filterAppliesTo !== "all" 
                ? "Nenhum campo encontrado" 
                : "Nenhum campo personalizado criado"
              }
            </h3>
            <p className="text-[#9CA3AF] text-center mb-4">
              {searchTerm || filterType !== "all" || filterAppliesTo !== "all"
                ? "Tente ajustar os filtros de busca"
                : "Crie campos personalizados para capturar informações específicas"
              }
            </p>
            {!(searchTerm || filterType !== "all" || filterAppliesTo !== "all") && (
              <Button
                onClick={handleCreate}
                className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Campo
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredFields.map((field) => {
            const typeInfo = getFieldTypeInfo(field.type);
            const appliesInfo = getAppliesInfo(field.applies_to || []);
            const TypeIcon = typeInfo.icon;
            
            return (
              <Card key={field.id} className="bg-[#1C1C1C] border-[#656464] hover:border-[#E50F5F]/50 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                        <TypeIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#D9D9D9] text-sm">
                          {field.label}
                          {field.required && <span className="text-red-400 ml-1">*</span>}
                        </h3>
                        <p className="text-xs text-[#9CA3AF]">
                          {field.name} • {typeInfo.name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewField(field)}
                        className="text-[#9CA3AF] hover:text-[#E50F5F] h-8 w-8 p-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(field)}
                        className="text-[#9CA3AF] hover:text-[#E50F5F] h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(field)}
                        className="text-[#9CA3AF] hover:text-red-400 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {field.description && (
                    <p className="text-xs text-[#9CA3AF] mb-3">
                      {field.description}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-[#9CA3AF] mb-1">Aplicado a:</p>
                      <div className="flex flex-wrap gap-1">
                        {appliesInfo.map(entity => (
                          <Badge key={entity.id} variant="outline" className="border-[#656464] text-[#D9D9D9] text-xs">
                            {entity.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {field.type === 'select' && field.options?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-[#9CA3AF] mb-1">Opções:</p>
                        <div className="flex flex-wrap gap-1">
                          {field.options.slice(0, 3).map((option, index) => (
                            <Badge key={index} className="bg-[#131313] text-[#D9D9D9] text-xs">
                              {option}
                            </Badge>
                          ))}
                          {field.options.length > 3 && (
                            <Badge className="bg-[#131313] text-[#9CA3AF] text-xs">
                              +{field.options.length - 3} mais
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Criação/Edição */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#1C1C1C] border-[#656464] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#E50F5F] flex items-center gap-2">
                  <Puzzle className="w-5 h-5" />
                  {editingField ? 'Editar Campo Personalizado' : 'Criar Campo Personalizado'}
                </CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                    setEditingField(null);
                  }}
                  className="text-[#9CA3AF] hover:text-[#D9D9D9]"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Coluna Esquerda - Configurações */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[#D9D9D9]">Rótulo do Campo *</Label>
                      <Input
                        value={formData.label}
                        onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                        placeholder="Ex: CPF, Data de Nascimento..."
                        className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                        required
                      />
                      <p className="text-xs text-[#9CA3AF] mt-1">Nome que será exibido nos formulários</p>
                    </div>
                    
                    <div>
                      <Label className="text-[#D9D9D9]">Nome Técnico</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.replace(/[^a-z0-9_]/gi, '_').toLowerCase() }))}
                        placeholder="Ex: campo_cpf, data_nascimento..."
                        className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                      />
                      <p className="text-xs text-[#9CA3AF] mt-1">Nome usado internamente (será gerado automaticamente se vazio)</p>
                    </div>
                    
                    <div>
                      <Label className="text-[#D9D9D9]">Tipo de Campo *</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                          {fieldTypes.map(type => (
                            <SelectItem key={type.id} value={type.id}>
                              <div className="flex items-center gap-2">
                                <type.icon className="w-4 h-4" />
                                <div>
                                  <div className="font-medium">{type.name}</div>
                                  <div className="text-xs text-[#9CA3AF]">{type.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-[#D9D9D9]">Aplicar a *</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {appliesTo.map(entity => (
                          <div key={entity.id} className="flex items-center space-x-2 p-2 bg-[#131313] rounded border border-[#656464]">
                            <Checkbox
                              checked={formData.applies_to.includes(entity.id)}
                              onCheckedChange={() => toggleAppliesTo(entity.id)}
                              className="border-[#656464] data-[state=checked]:bg-[#E50F5F] data-[state=checked]:border-[#E50F5F]"
                            />
                            <div>
                              <Label className="text-[#D9D9D9] text-sm cursor-pointer">
                                {entity.name}
                              </Label>
                              <p className="text-xs text-[#9CA3AF]">{entity.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-[#D9D9D9]">Placeholder</Label>
                      <Input
                        value={formData.placeholder}
                        onChange={(e) => setFormData(prev => ({ ...prev, placeholder: e.target.value }))}
                        placeholder="Texto de exemplo..."
                        className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-[#D9D9D9]">Descrição</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descrição ou instrução para o campo..."
                        className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1 h-20"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.required}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, required: checked }))}
                        className="border-[#656464] data-[state=checked]:bg-[#E50F5F] data-[state=checked]:border-[#E50F5F]"
                      />
                      <Label className="text-[#D9D9D9] cursor-pointer">
                        Campo obrigatório
                      </Label>
                    </div>

                    {/* Opções para campos select */}
                    {formData.type === 'select' && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-[#D9D9D9]">Opções da Lista</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addOption}
                            className="border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {formData.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                value={option}
                                onChange={(e) => updateOption(index, e.target.value)}
                                placeholder={`Opção ${index + 1}`}
                                className="bg-[#131313] border-[#656464] text-[#D9D9D9] flex-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(index)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          {formData.options.length === 0 && (
                            <p className="text-xs text-[#9CA3AF] text-center py-4">
                              Nenhuma opção adicionada. Clique em "Adicionar" para criar opções.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Coluna Direita - Pré-visualização */}
                  <div>
                    {renderFieldPreview()}
                  </div>
                </div>
              </CardContent>
              
              <div className="flex justify-end gap-3 p-6 pt-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                    setEditingField(null);
                  }}
                  className="border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
                  disabled={!formData.label.trim() || formData.applies_to.length === 0}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingField ? 'Atualizar Campo' : 'Criar Campo'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal de Pré-visualização */}
      {previewField && !showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#1C1C1C] border-[#656464] w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#D9D9D9] flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Pré-visualização
                </CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => setPreviewField(null)}
                  className="text-[#9CA3AF] hover:text-[#D9D9D9]"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {renderFieldPreview()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}