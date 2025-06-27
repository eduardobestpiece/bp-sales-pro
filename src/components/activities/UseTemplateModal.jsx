import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckSquare, Calendar as CalendarIcon, Users, Play } from "lucide-react";
import { Activity } from "@/api/entities";
import { format, addDays } from "date-fns";

export default function UseTemplateModal({ 
  template, 
  open, 
  onClose, 
  onSuccess, 
  users, 
  workflows, 
  companies,
  selectedCompanyId 
}) {
  const [formData, setFormData] = useState({
    title: "",
    assigned_to: [],
    workflow_id: "",
    stage: "",
    company_id: selectedCompanyId || "",
    due_date: null
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (template && open) {
      const calculatedDueDate = addDays(new Date(), template.days_to_complete || 1);
      
      setFormData({
        title: template.name,
        assigned_to: [],
        workflow_id: "",
        stage: "",
        company_id: selectedCompanyId || "",
        due_date: calculatedDueDate
      });
    }
  }, [template, open, selectedCompanyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const activityData = {
        title: formData.title,
        description: template.description,
        assigned_to: formData.assigned_to,
        workflow_id: formData.workflow_id,
        stage: formData.stage,
        company_id: formData.company_id,
        due_date: formData.due_date?.toISOString(),
        checklist: template.checklist || [],
        priority: "medium",
        status: "pending"
      };

      await Activity.create(activityData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao criar atividade:", error);
    }
    setIsLoading(false);
  };

  const selectedWorkflow = workflows.find(w => w.id === formData.workflow_id);
  const availableStages = selectedWorkflow?.stages || [];

  const toggleUser = (userId) => {
    setFormData(prev => ({
      ...prev,
      assigned_to: prev.assigned_to.includes(userId)
        ? prev.assigned_to.filter(id => id !== userId)
        : [...prev.assigned_to, userId]
    }));
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#E50F5F] flex items-center gap-2">
            <Play className="w-6 h-6" />
            Usar Modelo: {template.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações do Modelo */}
          <div className="p-4 bg-[#131313] rounded-lg border border-[#656464]">
            <h3 className="font-medium text-[#D9D9D9] mb-2">Sobre este modelo:</h3>
            <p className="text-sm text-[#9CA3AF] mb-3">
              {template.description || 'Sem descrição disponível'}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="outline" className="border-[#656464] text-[#9CA3AF] flex items-center gap-1">
                <CheckSquare className="w-3 h-3" />
                {template.checklist?.length || 0} itens no checklist
              </Badge>
              <Badge variant="outline" className="border-[#656464] text-[#9CA3AF] flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                {template.days_to_complete || 1} dias para conclusão
              </Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Título da Atividade */}
            <div>
              <Label className="text-[#9CA3AF]">Título da Atividade</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                placeholder="Nome da atividade"
                required
              />
            </div>

            {/* Empresa */}
            <div>
              <Label className="text-[#9CA3AF]">Empresa</Label>
              <Select 
                value={formData.company_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, company_id: value }))}
              >
                <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1">
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Workflow */}
            <div>
              <Label className="text-[#9CA3AF]">Workflow</Label>
              <Select 
                value={formData.workflow_id} 
                onValueChange={(value) => {
                  const workflow = workflows.find(w => w.id === value);
                  setFormData(prev => ({ 
                    ...prev, 
                    workflow_id: value,
                    stage: workflow?.stages?.[0]?.name || ""
                  }));
                }}
              >
                <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1">
                  <SelectValue placeholder="Selecione o workflow" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                  {workflows.map(workflow => (
                    <SelectItem key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fase */}
            {availableStages.length > 0 && (
              <div>
                <Label className="text-[#9CA3AF]">Fase Inicial</Label>
                <Select 
                  value={formData.stage} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, stage: value }))}
                >
                  <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1">
                    <SelectValue placeholder="Selecione a fase" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                    {availableStages.map(stage => (
                      <SelectItem key={stage.name} value={stage.name}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Data de Vencimento */}
            <div>
              <Label className="text-[#9CA3AF]">Data de Vencimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full mt-1 justify-start text-left bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#1C1C1C]"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? format(formData.due_date, 'PPP', { locale: undefined }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-[#656464]">
                  <Calendar
                    mode="single"
                    selected={formData.due_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, due_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Responsáveis */}
            <div>
              <Label className="text-[#9CA3AF] flex items-center gap-2">
                <Users className="w-4 h-4" />
                Responsáveis
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
                {users.map(user => (
                  <label
                    key={user.id}
                    className="flex items-center gap-2 p-2 bg-[#131313] rounded border border-[#656464] hover:border-[#E50F5F]/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.assigned_to.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="text-[#E50F5F] rounded"
                    />
                    <span className="text-sm text-[#D9D9D9]">
                      {user.full_name || user.email}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3 pt-6 border-t border-[#656464]">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.title || !formData.company_id}
                className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
              >
                {isLoading ? "Criando..." : "Criar Atividade"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}