import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity } from "@/api/entities";
import { User } from "@/api/entities";

export default function CreateActivityModal({ open, onClose, onSuccess, workflows, preSelectedWorkflow = null, currentUser = null }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    workflow_id: "",
    priority: "medium",
    assigned_to: [],
    custom_fields: {}
  });
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  useEffect(() => {
    if (open) {
      loadUsers();
      setFormData({
        title: "",
        description: "",
        due_date: "",
        workflow_id: preSelectedWorkflow || "",
        priority: "medium",
        assigned_to: currentUser ? [currentUser.id] : [],
        custom_fields: {}
      });
      
      if (preSelectedWorkflow) {
        const workflow = workflows.find(w => w.id === preSelectedWorkflow);
        setSelectedWorkflow(workflow);
      }
    }
  }, [open, preSelectedWorkflow, currentUser]);

  const loadUsers = async () => {
    try {
      const usersData = await User.list();
      setUsers(usersData);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkflowChange = (workflowId) => {
    const workflow = workflows.find(w => w.id === workflowId);
    setSelectedWorkflow(workflow);
    setFormData(prev => ({ 
      ...prev, 
      workflow_id: workflowId,
      custom_fields: {} // Reset custom fields when workflow changes
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
    setIsLoading(true);
    try {
      await Activity.create(formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao criar atividade:", error);
    }
    setIsLoading(false);
  };

  const renderCustomField = (field) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={formData.custom_fields[field.name] || ""}
            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="bg-[#131313] border-[#656464] text-[#D9D9D9]"
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={formData.custom_fields[field.name] || ""}
            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="bg-[#131313] border-[#656464] text-[#D9D9D9]"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={formData.custom_fields[field.name] || ""}
            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="bg-[#131313] border-[#656464] text-[#D9D9D9]"
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={formData.custom_fields[field.name] || ""}
            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
            className="bg-[#131313] border-[#656464] text-[#D9D9D9]"
          />
        );
      case 'dropdown':
        return (
          <Select 
            value={formData.custom_fields[field.name] || ""} 
            onValueChange={(value) => handleCustomFieldChange(field.name, value)}
          >
            <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent className="bg-[#1C1C1C] border-[#656464]">
              {field.settings?.options?.map((option, index) => (
                <SelectItem key={index} value={option} className="text-[#D9D9D9]">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            value={formData.custom_fields[field.name] || ""}
            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="bg-[#131313] border-[#656464] text-[#D9D9D9]"
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#E50F5F]">Nova Atividade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="title" className="text-[#9CA3AF]">Título da Atividade</Label>
            <Input 
              id="title" 
              value={formData.title} 
              onChange={(e) => handleInputChange('title', e.target.value)} 
              required 
              className="bg-[#131313] border-[#656464] text-[#D9D9D9]" 
            />
          </div>
          
          <div>
            <Label htmlFor="description" className="text-[#9CA3AF]">Descrição</Label>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={(e) => handleInputChange('description', e.target.value)} 
              className="bg-[#131313] border-[#656464] text-[#D9D9D9]" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="due_date" className="text-[#9CA3AF]">Prazo</Label>
              <Input 
                id="due_date" 
                type="datetime-local" 
                value={formData.due_date} 
                onChange={(e) => handleInputChange('due_date', e.target.value)} 
                className="bg-[#131313] border-[#656464] text-[#D9D9D9]" 
              />
            </div>
            <div>
              <Label htmlFor="priority" className="text-[#9CA3AF]">Prioridade</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger id="priority" className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workflow_id" className="text-[#9CA3AF]">Workflow</Label>
              <Select value={formData.workflow_id} onValueChange={handleWorkflowChange}>
                <SelectTrigger id="workflow_id" className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                  <SelectValue placeholder="Selecione o workflow" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                  {workflows.map(wf => (
                    <SelectItem key={wf.id} value={wf.id}>{wf.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assigned_to" className="text-[#9CA3AF]">Responsável</Label>
              <Select onValueChange={(value) => handleInputChange('assigned_to', [value])}>
                <SelectTrigger id="assigned_to" className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                  <SelectValue placeholder="Selecione um usuário" />
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
          </div>

          {/* Campos Personalizados */}
          {selectedWorkflow && selectedWorkflow.custom_fields && selectedWorkflow.custom_fields.length > 0 && (
            <div className="border-t border-[#656464] pt-4">
              <h3 className="text-lg font-semibold text-[#D9D9D9] mb-4">Campos Personalizados</h3>
              <div className="space-y-4">
                {selectedWorkflow.custom_fields.map((field) => (
                  <div key={field.id || field.name}>
                    <Label className="text-[#9CA3AF]">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {renderCustomField(field)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white" 
              disabled={isLoading}
            >
              {isLoading ? "Criando..." : "Criar Atividade"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}