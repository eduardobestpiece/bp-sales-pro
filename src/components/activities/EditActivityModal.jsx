import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity } from "@/api/entities";
import { User } from "@/api/entities";

export default function EditActivityModal({ activity, open, onClose, onSuccess, workflows, users }) {
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  useEffect(() => {
    if (activity && open) {
      const workflow = workflows.find(w => w.id === activity.workflow_id);
      setSelectedWorkflow(workflow);
      
      setFormData({
        title: activity.title || "",
        description: activity.description || "",
        due_date: activity.due_date ? new Date(activity.due_date).toISOString().substring(0, 16) : "",
        workflow_id: activity.workflow_id || "",
        priority: activity.priority || "medium",
        assigned_to: activity.assigned_to || [],
        stage: activity.stage || "",
        custom_fields: activity.custom_fields || {}
      });
    }
  }, [activity, open, workflows]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleWorkflowChange = (workflowId) => {
    const workflow = workflows.find(w => w.id === workflowId);
    setSelectedWorkflow(workflow);
    setFormData(prev => ({ 
      ...prev, 
      workflow_id: workflowId,
      stage: "", // Reset stage when workflow changes
      custom_fields: {} // Reset custom fields
    }));
  };

  const handleCustomFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      custom_fields: {
        ...prev.custom_fields,
        [fieldName]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData) return;
    setIsLoading(true);
    try {
      await Activity.update(activity.id, formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao editar atividade:", error);
    }
    setIsLoading(false);
  };
  
  const renderCustomField = (field) => {
    // This is a simplified renderer, you might need to expand it like in CreateActivityModal
    // For now, let's keep it simple to fix the modal structure
    return (
      <div key={field.id || field.name}>
        <Label className="text-[#9CA3AF]">{field.label}</Label>
        <Input
          value={formData.custom_fields[field.name] || ""}
          onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
          placeholder={field.label}
          className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
        />
      </div>
    );
  };
  
  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#E50F5F]">Editar Atividade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Title and Description */}
          <div><Label htmlFor="title" className="text-[#9CA3AF]">Título</Label><Input id="title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} required className="bg-[#131313] border-[#656464] text-[#D9D9D9]" /></div>
          <div><Label htmlFor="description" className="text-[#9CA3AF]">Descrição</Label><Textarea id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} className="bg-[#131313] border-[#656464] text-[#D9D9D9]" /></div>
          
          {/* Due Date and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="due_date" className="text-[#9CA3AF]">Prazo</Label><Input id="due_date" type="datetime-local" value={formData.due_date} onChange={(e) => handleInputChange('due_date', e.target.value)} className="bg-[#131313] border-[#656464] text-[#D9D9D9]" /></div>
            <div><Label htmlFor="priority" className="text-[#9CA3AF]">Prioridade</Label><Select value={formData.priority} onValueChange={(v) => handleInputChange('priority', v)}><SelectTrigger className="bg-[#131313] border-[#656464]"><SelectValue /></SelectTrigger><SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"><SelectItem value="low">Baixa</SelectItem><SelectItem value="medium">Média</SelectItem><SelectItem value="high">Alta</SelectItem></SelectContent></Select></div>
          </div>
          
          {/* Workflow and Stage */}
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="workflow" className="text-[#9CA3AF]">Workflow</Label><Select value={formData.workflow_id} onValueChange={handleWorkflowChange}><SelectTrigger className="bg-[#131313] border-[#656464]"><SelectValue /></SelectTrigger><SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">{workflows.map(wf => (<SelectItem key={wf.id} value={wf.id}>{wf.name}</SelectItem>))}</SelectContent></Select></div>
            {selectedWorkflow?.stages && <div><Label htmlFor="stage" className="text-[#9CA3AF]">Fase</Label><Select value={formData.stage} onValueChange={(v) => handleInputChange('stage', v)}><SelectTrigger className="bg-[#131313] border-[#656464]"><SelectValue /></SelectTrigger><SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">{selectedWorkflow.stages.map(s => (<SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>))}</SelectContent></Select></div>}
          </div>

          {/* Assigned To */}
          <div><Label htmlFor="assigned_to" className="text-[#9CA3AF]">Responsável</Label><Select value={formData.assigned_to[0] || ""} onValueChange={(v) => handleInputChange('assigned_to', [v])}><SelectTrigger className="bg-[#131313] border-[#656464]"><SelectValue /></SelectTrigger><SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">{users.map(u => (<SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>))}</SelectContent></Select></div>
          
          {/* Custom Fields */}
          {selectedWorkflow?.custom_fields?.length > 0 && (
            <div className="border-t border-[#656464] pt-4 mt-4 space-y-4">
              <h3 className="text-lg font-semibold text-[#D9D9D9]">Campos Personalizados</h3>
              {selectedWorkflow.custom_fields.map(field => renderCustomField(field))}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20">Cancelar</Button>
            <Button type="submit" className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white" disabled={isLoading}>{isLoading ? "Salvando..." : "Salvar Alterações"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}