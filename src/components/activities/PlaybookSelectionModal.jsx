import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, BookOpen, Play } from "lucide-react";
import { Playbook } from "@/api/entities";
import { Activity } from "@/api/entities";
import { ActivityTemplate } from "@/api/entities";

export default function PlaybookSelectionModal({ open, onClose, onSuccess, workflows = [], users = [] }) {
  const [playbooks, setPlaybooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadPlaybooks();
    }
  }, [open]);

  const loadPlaybooks = async () => {
    try {
      const data = await Playbook.list("-created_date");
      setPlaybooks(data);
    } catch (error) {
      console.error("Erro ao carregar playbooks:", error);
    }
  };

  const handleSelectPlaybook = async (playbook) => {
    setIsLoading(true);
    try {
      // Cria atividades baseadas no playbook
      for (const step of playbook.steps || []) {
        const template = await ActivityTemplate.get(step.template_id);
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (step.days_to_complete || 1));
        
        await Activity.create({
          title: template.name,
          description: template.description || "",
          checklist: template.checklist || [],
          due_date: dueDate.toISOString(),
          workflow_id: workflows[0]?.id || "",
          stage: workflows[0]?.stages?.[0]?.name || "",
          priority: "medium",
          status: "pending",
          assigned_to: []
        });
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao criar atividades do playbook:", error);
    }
    setIsLoading(false);
  };

  const filteredPlaybooks = playbooks.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#E50F5F]">Selecionar Playbook</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#9CA3AF]" />
            <Input
              placeholder="Buscar playbooks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#131313] border-[#656464] text-[#D9D9D9]"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-3">
            {filteredPlaybooks.length === 0 ? (
              <div className="text-center py-8 text-[#9CA3AF]">
                Nenhum playbook encontrado
              </div>
            ) : (
              filteredPlaybooks.map((playbook) => (
                <Card key={playbook.id} className="bg-[#131313] border-[#656464] hover:border-[#E50F5F]/50 transition-all cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-[#E50F5F]" />
                        <CardTitle className="text-[#D9D9D9]">{playbook.name}</CardTitle>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSelectPlaybook(playbook)}
                        disabled={isLoading}
                        className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Usar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#9CA3AF] text-sm">
                      {playbook.description || "Sem descrição"}
                    </p>
                    <p className="text-xs text-[#9CA3AF] mt-2">
                      {playbook.steps?.length || 0} etapa(s)
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#656464]">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20 bg-[#131313]"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}