import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Play, BookOpen } from "lucide-react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Activity } from "@/api/entities";

export default function UsePlaybookModal({ 
  open, 
  onClose, 
  onSuccess, 
  playbook, 
  templates,
  workflows,
  users,
  companies,
  selectedCompanyId
}) {
  const [formData, setFormData] = useState({
    workflowId: '',
    stage: '',
    assignedTo: '',
    startDate: new Date(),
    companyId: selectedCompanyId
  });
  const [isLoading, setIsLoading] = useState(false);
  const [targetWorkflow, setTargetWorkflow] = useState(null);

  useEffect(() => {
    if (open) {
      const firstWorkflow = workflows.find(w => w.company_id === selectedCompanyId) || workflows[0];
      setFormData({
        workflowId: firstWorkflow?.id || '',
        stage: firstWorkflow?.stages?.[0]?.name || '',
        assignedTo: '',
        startDate: new Date(),
        companyId: selectedCompanyId
      });
      if(firstWorkflow) setTargetWorkflow(firstWorkflow);
    }
  }, [open, playbook, workflows, selectedCompanyId]);

  const handleWorkflowChange = (workflowId) => {
    const wf = workflows.find(w => w.id === workflowId);
    setTargetWorkflow(wf);
    setFormData(prev => ({
      ...prev,
      workflowId,
      stage: wf?.stages?.[0]?.name || ''
    }));
  };

  const handleStartPlaybook = async () => {
    setIsLoading(true);
    try {
      if (!playbook || !playbook.blocks) {
        throw new Error("Playbook inválido ou sem blocos.");
      }

      const newActivities = [];
      let currentDueDate = new Date(formData.startDate);

      for (const block of playbook.blocks) {
        if (!block.steps) continue;
        for (const step of block.steps.sort((a,b) => a.order - b.order)) {
          const template = templates.find(t => t.id === step.template_id);
          if (!template) continue;

          currentDueDate = addDays(currentDueDate, template.days_to_complete || 1);

          newActivities.push({
            title: template.name,
            description: template.description,
            company_id: formData.companyId,
            workflow_id: formData.workflowId,
            stage: formData.stage,
            assigned_to: formData.assignedTo ? [formData.assignedTo] : [],
            due_date: currentDueDate.toISOString(),
            priority: 'medium',
            status: 'pending',
            checklist: template.checklist || [],
            custom_fields: template.custom_fields || {},
          });
        }
      }

      if (newActivities.length > 0) {
        await Activity.bulkCreate(newActivities);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao iniciar playbook:", error);
      // Adicionar um toast/alerta para o usuário
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-[#E50F5F]">
            <Play className="w-5 h-5" />
            Iniciar Playbook: {playbook?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Empresa</Label>
            <Select
              value={formData.companyId}
              onValueChange={(val) => setFormData({...formData, companyId: val})}
            >
              <SelectTrigger className="w-full mt-1 bg-[#131313] border-[#656464]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Workflow de Destino</Label>
            <Select
              value={formData.workflowId}
              onValueChange={handleWorkflowChange}
            >
              <SelectTrigger className="w-full mt-1 bg-[#131313] border-[#656464]">
                <SelectValue placeholder="Selecione um workflow" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                {workflows.filter(w => w.company_id === formData.companyId).map(w => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {targetWorkflow && (
            <div>
              <Label>Fase Inicial</Label>
              <Select
                value={formData.stage}
                onValueChange={(val) => setFormData({...formData, stage: val})}
              >
                <SelectTrigger className="w-full mt-1 bg-[#131313] border-[#656464]">
                  <SelectValue placeholder="Selecione a fase inicial" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                  {targetWorkflow.stages.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label>Responsável Principal</Label>
            <Select
              value={formData.assignedTo}
              onValueChange={(val) => setFormData({...formData, assignedTo: val})}
            >
              <SelectTrigger className="w-full mt-1 bg-[#131313] border-[#656464]">
                <SelectValue placeholder="Selecione um responsável" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                <SelectItem value={null}>Ninguém</SelectItem>
                {users.map(u => <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Data de Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full mt-1 justify-start text-left font-normal bg-[#131313] border-[#656464]"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate ? format(formData.startDate, "PPP", { locale: ptBR }) : <span>Escolha a data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-[#656464]">
                <Calendar
                  mode="single"
                  selected={formData.startDate}
                  onSelect={(date) => setFormData({...formData, startDate: date})}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter className="border-t border-[#656464] pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleStartPlaybook} 
            disabled={isLoading || !formData.workflowId}
            className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
          >
            {isLoading ? "Iniciando..." : "Iniciar Playbook"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}