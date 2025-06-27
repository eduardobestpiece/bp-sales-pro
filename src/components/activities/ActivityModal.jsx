
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomFieldEditor } from "@/components/activities/CustomFieldEditor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  CheckSquare,
  Plus,
  X,
  Edit,
  Clock as ClockIcon,
  Repeat,
  FileText,
  Save
} from "lucide-react";
import { Activity } from "@/api/entities";
import { ActivityTemplate } from "@/api/entities";
import { User as UserEntity } from "@/api/entities";
import RecurrenceModal from "./RecurrenceModal";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

function getRecurrenceSummary(rule) {
    if (!rule || !rule.frequency) return "Sem recorrência";

    let summary = `Repete a cada ${rule.interval > 1 ? rule.interval : ''} `;

    switch (rule.frequency) {
        case 'daily':
            summary += rule.interval > 1 ? 'dias' : 'dia';
            break;
        case 'weekly':
            summary += rule.interval > 1 ? 'semanas' : 'semana';
            if (rule.daysOfWeek?.length > 0) {
              const dayNames = {
                'sunday': 'Dom', 'monday': 'Seg', 'tuesday': 'Ter', 'wednesday': 'Qua',
                'thursday': 'Qui', 'friday': 'Sex', 'saturday': 'Sáb'
              };
              const days = rule.daysOfWeek.map(day => dayNames[day.toLowerCase()]).filter(Boolean).join(', ');
              if (days) {
                summary += ` (${days})`;
              }
            }
            break;
        case 'monthly':
            summary += rule.interval > 1 ? 'meses' : 'mês';
            summary += ` no dia ${rule.dayOfMonth}`;
            break;
        case 'yearly':
            summary += rule.interval > 1 ? 'anos' : 'ano';
            break;
        default:
            return "Recorrência customizada";
    }

    if (rule.until) {
      try {
        const untilDate = parseISO(rule.until);
        summary += ` até ${format(untilDate, "dd/MM/yyyy", { locale: ptBR })}`;
      } catch (e) {
        console.error("Error parsing recurrence until date:", e);
      }
    }

    return summary.trim();
}

export default function ActivityModal({ activity, workflow, open, onClose, onSuccess, users = [], workflows = [], selectedCompany, isTemplateMode = false }) {
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [isSavingAsTemplate, setIsSavingAsTemplate] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateDays, setTemplateDays] = useState(1);

  const initializeState = () => {
    let initialData;
    if (activity) {
      initialData = {
        title: isTemplateMode ? activity.name : activity.title || "",
        description: activity.description || "",
        due_date: isTemplateMode ? activity.days_to_complete || 1 : (activity.due_date ? new Date(activity.due_date).toISOString().substring(0, 16) : ""),
        company_id: activity.company_id || selectedCompany || "",
        checklist: Array.isArray(activity.checklist) ? activity.checklist.map((item, index) => ({
          id: item.id || `checklist-${Date.now()}-${index}`, 
          item: item.item || "",
          completed: item.completed || false,
          assigned_to: item.assigned_to || ""
        })) : [],
        workflow_id: activity.workflow_id || "",
        priority: activity.priority || "medium",
        status: activity.status || "pending",
        assigned_to: activity.assigned_to || [],
        stage: activity.stage || "",
        custom_fields: activity.custom_fields || {},
        recurrence_rule: activity.recurrence_rule || null,
      };
    } else {
      const currentUser = users.find(u => u.email); 
      initialData = {
        title: "",
        description: "",
        due_date: isTemplateMode ? 1 : "",
        company_id: selectedCompany || "",
        checklist: [],
        workflow_id: isTemplateMode ? "" : (workflow?.id || ""),
        priority: "medium",
        status: "pending",
        assigned_to: currentUser ? [currentUser.id] : [],
        stage: isTemplateMode ? "" : (workflow?.stages?.[0]?.name || ""),
        custom_fields: {},
        recurrence_rule: null,
      };
    }
    setFormData(initialData);
  };
  
  useEffect(() => {
    if (open) {
      initializeState();
      // Reset templateDays when opening for a new template or activity
      if (!activity && isTemplateMode) {
        setTemplateDays(1);
      }
    }
  }, [activity, open, isTemplateMode, users, workflow, selectedCompany]);

  const handleSave = async () => {
    if (!formData || !formData.title?.trim()) {
      alert("Nome/Título é obrigatório.");
      return;
    }
    
    setIsLoading(true);
    try {
      if (isTemplateMode) {
        const templateData = {
          name: formData.title,
          description: formData.description,
          checklist: formData.checklist.map(({ id, ...rest }) => rest),
          days_to_complete: parseInt(formData.due_date, 10) || 1,
          company_id: formData.company_id,
          custom_fields: formData.custom_fields,
        };

        if (activity) {
          await ActivityTemplate.update(activity.id, templateData);
        } else {
          await ActivityTemplate.create(templateData);
        }
      } else {
        if (activity) {
          await Activity.update(activity.id, formData);
        } else {
          await Activity.create(formData);
        }
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!formData || !formData.title?.trim()) {
      alert("Nome/Título é obrigatório para criar modelo.");
      return;
    }
    
    setShowTemplateModal(true);
  };

  const confirmSaveAsTemplate = async () => {
    setIsSavingAsTemplate(true);
    try {
      const templateData = {
        name: `Modelo: ${formData.title}`,
        description: formData.description,
        checklist: formData.checklist.map(({ id, ...rest }) => rest),
        days_to_complete: templateDays,
        company_id: formData.company_id,
        custom_fields: formData.custom_fields,
      };

      await ActivityTemplate.create(templateData);
      alert("Modelo criado com sucesso!");
      setShowTemplateModal(false);
      setTemplateDays(1); // Reset to default after creation
    } catch (error) {
      console.error("Erro ao criar modelo:", error);
      alert("Erro ao criar modelo: " + error.message);
    } finally {
      setIsSavingAsTemplate(false);
    }
  };

  const addChecklistItem = () => {
    const newItem = {
      id: `new-checklist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      item: "",
      completed: false,
      assigned_to: ""
    };
    
    setFormData(prev => ({
      ...prev,
      checklist: [...(prev.checklist || []), newItem]
    }));
  };

  const updateChecklistItem = (itemId, field, value) => {
    setFormData(prev => ({
      ...prev,
      checklist: (prev.checklist || []).map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeChecklistItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      checklist: (prev.checklist || []).filter(item => item.id !== itemId)
    }));
  };

  const updateFormField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomFieldsChange = (newCustomFields) => {
    setFormData(prev => ({
      ...prev,
      custom_fields: newCustomFields
    }));
  };

  const handleApplyRecurrence = (rule) => {
    updateFormField('recurrence_rule', rule);
  };

  if (!formData) return null;

  const completedItems = formData.checklist.filter(item => item.completed).length;
  const totalItems = formData.checklist.length;
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-[#E50F5F]">
              {isTemplateMode ? (activity ? 'Editar Modelo' : 'Criar Novo Modelo') : 'Detalhes da Atividade'}
            </DialogTitle>
            
            {/* Botão Salvar como Modelo - apenas para atividades não-template */}
            {!isTemplateMode && (
              <Button
                variant="outline"
                onClick={handleSaveAsTemplate}
                disabled={isSavingAsTemplate}
                className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:border-[#E50F5F]"
              >
                <FileText className="w-4 h-4 mr-2" />
                Salvar como Modelo
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-6">
          {/* COLUNA 1: Informações Principais */}
          <div className="space-y-6">
            {/* Título e Descrição */}
            <div className="space-y-4">
              <div>
                <Label className="text-[#D9D9D9]">
                  {isTemplateMode ? "Nome do Modelo" : "Título da Atividade"}
                </Label>
                <Input
                  value={formData?.title || ""}
                  onChange={(e) => updateFormField('title', e.target.value)}
                  className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                  placeholder={isTemplateMode ? "Nome do Modelo" : "Título da Atividade"}
                />
              </div>
              
              <div>
                <Label className="text-[#D9D9D9]">Descrição</Label>
                <Textarea
                  value={formData?.description || ""}
                  onChange={(e) => updateFormField('description', e.target.value)}
                  className="bg-[#131313] border-[#656464] text-[#D9D9D9] min-h-[100px] mt-1"
                  placeholder="Adicione uma descrição..."
                />
              </div>
            </div>

            {/* Data de Vencimento para Atividades */}
            {!isTemplateMode && (
              <div className="space-y-2">
                <Label className="text-[#9CA3AF]">Data de Vencimento</Label>
                <Input
                  type="datetime-local"
                  value={formData?.due_date || ""}
                  onChange={(e) => updateFormField('due_date', e.target.value)}
                  className="bg-[#131313] border-[#656464] text-[#D9D9D9]"
                />
              </div>
            )}

            {/* Workflow e Fase */}
            {!isTemplateMode && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#9CA3AF]">Workflow</Label>
                  <Select 
                    value={formData?.workflow_id || ""} 
                    onValueChange={(value) => updateFormField('workflow_id', value)}
                  >
                    <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                      <SelectValue placeholder="Selecionar workflow" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                      {workflows.map(w => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[#9CA3AF]">Fase</Label>
                  <Select 
                    value={formData?.stage || ""} 
                    onValueChange={(value) => updateFormField('stage', value)}
                  >
                    <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                      <SelectValue placeholder="Selecionar fase" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                      {workflows.find(w => w.id === formData?.workflow_id)?.stages?.map((stage, i) => (
                        <SelectItem key={i} value={stage.name}>{stage.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Recorrência */}
            {!isTemplateMode && (
              <div className="space-y-2">
                <Label className="text-[#9CA3AF]">Recorrência</Label>
                <Button
                  variant="outline"
                  onClick={() => setShowRecurrenceModal(true)}
                  className="w-full justify-start text-left font-normal bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:border-[#E50F5F]"
                >
                  <Repeat className="w-4 h-4 mr-2"/>
                  <span>{getRecurrenceSummary(formData?.recurrence_rule)}</span>
                </Button>
              </div>
            )}

            {/* Prazo para Templates */}
            {isTemplateMode && (
              <div className="space-y-2">
                <Label htmlFor="days_to_complete" className="text-[#9CA3AF]">Prazo (dias)</Label>
                <Input
                  id="days_to_complete"
                  type="number"
                  value={formData?.due_date || 1}
                  onChange={(e) => updateFormField('due_date', parseInt(e.target.value, 10) || 1)}
                  className="bg-[#131313] border-[#656464] text-[#D9D9D9]"
                  placeholder="Ex: 3"
                  min="1"
                />
              </div>
            )}

            {/* Responsáveis */}
            {!isTemplateMode && (
              <div className="space-y-2">
                <Label className="text-[#9CA3AF]">Responsáveis</Label>
                <Select 
                  value={formData?.assigned_to?.[0] || ""} 
                  onValueChange={(value) => updateFormField('assigned_to', value ? [value] : [])}
                >
                  <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                    <SelectValue placeholder="Selecionar responsável" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Campos Personalizados */}
            <CustomFieldEditor
              entityType={isTemplateMode ? 'template' : 'activity'}
              values={formData?.custom_fields || {}
            }
              onChange={handleCustomFieldsChange}
            />
          </div>

          {/* COLUNA 2: Checklist */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-[#9CA3AF]" />
                  <Label className="text-lg font-semibold text-[#D9D9D9]">Checklist</Label>
                  {formData?.checklist?.length > 0 && (
                    <Badge variant="outline" className="border-[#656464] text-[#9CA3AF]">
                      {Math.round((formData.checklist.filter(item => item.completed).length / formData.checklist.length) * 100)}%
                    </Badge>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-[#E50F5F] hover:text-[#E50F5F]/80" 
                  onClick={addChecklistItem}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar item
                </Button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(!formData?.checklist || formData.checklist.length === 0) && (
                  <div className="text-center py-8 text-[#9CA3AF] bg-[#131313] rounded border border-[#656464]">
                    <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum item no checklist</p>
                    <p className="text-sm">Clique em "Adicionar item" para começar</p>
                  </div>
                )}
                
                {formData?.checklist?.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-4 rounded bg-[#131313] border border-[#656464]">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={(checked) => updateChecklistItem(item.id, 'completed', checked)}
                      className="border-[#E50F5F] data-[state=checked]:bg-[#E50F5F] mt-1"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <Input
                        value={item.item || ""}
                        onChange={(e) => updateChecklistItem(item.id, 'item', e.target.value)}
                        className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
                        placeholder="Descreva o item do checklist..."
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#9CA3AF]">Responsável:</span>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 px-2 text-xs bg-transparent hover:bg-[#656464]/20">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-5 h-5">
                                  <AvatarFallback className={`text-xs ${
                                    item.assigned_to && users.find(u => u.id === item.assigned_to) 
                                      ? 'bg-[#E50F5F] text-white' 
                                      : 'bg-gray-600 text-white'
                                  }`}>
                                    {item.assigned_to && users.find(u => u.id === item.assigned_to) 
                                      ? users.find(u => u.id === item.assigned_to)?.full_name?.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() || 'U'
                                      : '?'
                                    }
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-[#D9D9D9]">
                                  {item.assigned_to && users.find(u => u.id === item.assigned_to) 
                                    ? (users.find(u => u.id === item.assigned_to)?.full_name || users.find(u => u.id === item.assigned_to)?.email)
                                    : 'Ninguém'
                                  }
                                </span>
                              </div>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                            <DropdownMenuItem 
                              onClick={() => updateChecklistItem(item.id, 'assigned_to', "")}
                              className="focus:bg-[#E50F5F]/20"
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="w-5 h-5">
                                  <AvatarFallback className="bg-gray-600 text-white text-xs">?</AvatarFallback>
                                </Avatar>
                                <span>Ninguém</span>
                              </div>
                            </DropdownMenuItem>
                            {users.map(u => (
                              <DropdownMenuItem 
                                key={u.id} 
                                onClick={() => updateChecklistItem(item.id, 'assigned_to', u.id)}
                                className="focus:bg-[#E50F5F]/20"
                              >
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-5 h-5">
                                    <AvatarFallback className="bg-[#E50F5F] text-white text-xs">
                                      {u.full_name?.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{u.full_name || u.email}</span>
                                </div>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20 mt-1" 
                      onClick={() => removeChecklistItem(item.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3 pt-6 border-t border-[#656464]">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#656464] text-[#D9D9D9] bg-[#131313] hover:bg-[#656464]/20"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white" 
            disabled={isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    
    {/* Modal para definir prazo do modelo */}
    <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#E50F5F]">Definir Prazo do Modelo</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Label className="text-[#9CA3AF]">Prazo para execução (em dias)</Label>
          <Input
            type="number"
            value={templateDays}
            onChange={(e) => setTemplateDays(parseInt(e.target.value, 10) || 1)}
            className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-2"
            placeholder="Ex: 3"
            min="1"
          />
          <p className="text-sm text-[#9CA3AF] mt-2">
            Defina quantos dias uma atividade criada a partir deste modelo terá para ser concluída.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setShowTemplateModal(false)}
            className="border-[#656464] text-[#D9D9D9] bg-[#131313] hover:bg-[#656464]/20"
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmSaveAsTemplate} 
            className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white" 
            disabled={isSavingAsTemplate}
          >
            <FileText className="w-4 h-4 mr-2" />
            {isSavingAsTemplate ? "Criando..." : "Criar Modelo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    
    <RecurrenceModal
        open={showRecurrenceModal}
        onClose={() => setShowRecurrenceModal(false)}
        onApplyRecurrence={handleApplyRecurrence}
        initialRule={formData?.recurrence_rule}
    />
    </>
  );
}
