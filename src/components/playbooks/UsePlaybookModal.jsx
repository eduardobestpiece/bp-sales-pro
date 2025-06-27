import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, Settings, Target, Clock } from "lucide-react";
import { Company } from "@/api/entities";
import { Workflow } from "@/api/entities";
import { Activity } from "@/api/entities";
import { ActivityTemplate } from "@/api/entities";

export default function UsePlaybookModal({ playbooks, open, onClose, onSuccess, companies = [], templates = [] }) {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [workflows, setWorkflows] = useState([]);
  const [stages, setStages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedCompany) {
      loadWorkflows();
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedWorkflow) {
      const workflow = workflows.find(w => w.id === selectedWorkflow);
      setStages(workflow?.stages || []);
      setSelectedStage("");
    }
  }, [selectedWorkflow, workflows]);

  const loadWorkflows = async () => {
    try {
      const allWorkflows = await Workflow.list();
      const companyWorkflows = allWorkflows.filter(w => w.company_id === selectedCompany);
      setWorkflows(companyWorkflows);
    } catch (error) {
      console.error("Erro ao carregar workflows:", error);
    }
  };

  const handleUsePlaybooks = async () => {
    if (!selectedCompany || !selectedWorkflow || !selectedStage) {
      alert("Selecione empresa, workflow e fase antes de continuar.");
      return;
    }

    setIsLoading(true);
    try {
      const activities = [];
      
      // Processar cada playbook selecionado
      for (const playbook of playbooks) {
        for (const block of playbook.blocks || []) {
          for (const step of block.steps || []) {
            const template = templates.find(t => t.id === step.template_id);
            if (template) {
              const activity = {
                title: template.name,
                description: template.description || "",
                company_id: selectedCompany,
                workflow_id: selectedWorkflow,
                stage: selectedStage,
                status: "pending",
                priority: "medium",
                assigned_to: [],
                checklist: template.checklist || [],
                due_date: new Date(Date.now() + (template.days_to_complete || 1) * 24 * 60 * 60 * 1000).toISOString()
              };
              activities.push(activity);
            }
          }
        }
      }

      // Criar todas as atividades
      await Promise.all(activities.map(activity => Activity.create(activity)));
      
      alert(`${activities.length} atividades criadas com sucesso!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao usar playbooks:", error);
      alert("Erro ao criar atividades. Tente novamente.");
    }
    setIsLoading(false);
  };

  const calculateTotalStats = () => {
    if (!playbooks || playbooks.length === 0) return { totalActivities: 0, totalDays: 0 };
    
    let totalActivities = 0;
    let totalDays = 0;

    playbooks.forEach(playbook => {
      playbook.blocks?.forEach(block => {
        if (block.steps) {
          totalActivities += block.steps.length;
          let maxBlockDays = 0;
          block.steps.forEach(step => {
            const template = templates.find(t => t.id === step.template_id);
            if (template && template.days_to_complete) {
              maxBlockDays = Math.max(maxBlockDays, template.days_to_complete);
            }
          });
          totalDays += maxBlockDays;
        }
      });
    });

    return { totalActivities, totalDays };
  };

  const stats = calculateTotalStats();
  const playbookNames = Array.isArray(playbooks) ? playbooks : [playbooks];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[#E50F5F]">
            Usar Playbook{playbookNames.length > 1 ? 's' : ''}: {playbookNames.length > 1 ? `${playbookNames.length} selecionados` : playbookNames[0]?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="flex items-center gap-4 p-4 bg-[#131313] rounded-lg border border-[#656464]">
            <Badge className="bg-[#E50F5F]/20 text-[#E50F5F] border-[#E50F5F]/30">
              {stats.totalActivities} atividades
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              <Clock className="w-3 h-3 mr-1" />
              {stats.totalDays} dias
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-[#D9D9D9] mb-2 block">
                <Building2 className="w-4 h-4 inline mr-2" />
                Selecione a Empresa
              </Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                  <SelectValue placeholder="Escolha uma empresa" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id} className="text-[#D9D9D9]">
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[#D9D9D9] mb-2 block">
                <Settings className="w-4 h-4 inline mr-2" />
                Selecione o Workflow
              </Label>
              <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow} disabled={!selectedCompany}>
                <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                  <SelectValue placeholder="Escolha um workflow" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                  {workflows.map(workflow => (
                    <SelectItem key={workflow.id} value={workflow.id} className="text-[#D9D9D9]">
                      {workflow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[#D9D9D9] mb-2 block">
                <Target className="w-4 h-4 inline mr-2" />
                Selecione a Fase
              </Label>
              <Select value={selectedStage} onValueChange={setSelectedStage} disabled={!selectedWorkflow}>
                <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                  <SelectValue placeholder="Escolha uma fase" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                  {stages.map(stage => (
                    <SelectItem key={stage.name} value={stage.name} className="text-[#D9D9D9]">
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#656464]">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[#656464] text-[#D9D9D9] bg-[#131313] hover:bg-[#656464]/20"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUsePlaybooks}
              disabled={!selectedCompany || !selectedWorkflow || !selectedStage || isLoading}
              className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
            >
              {isLoading ? "Criando atividades..." : `Usar Playbook${playbookNames.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}