import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Lightbulb, Plus } from "lucide-react";
import { ActivityTemplate } from "@/api/entities";
import { Activity } from "@/api/entities";

export default function TemplateSelectionModal({ open, onClose, onSuccess, workflows = [], users = [] }) {
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = async () => {
    try {
      const data = await ActivityTemplate.list("-created_date");
      setTemplates(data);
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
    }
  };

  const handleSelectTemplate = async (template) => {
    setIsLoading(true);
    try {
      await Activity.create({
        title: template.name,
        description: template.description || "",
        checklist: template.checklist || [],
        workflow_id: workflows[0]?.id || "",
        stage: workflows[0]?.stages?.[0]?.name || "",
        priority: "medium",
        status: "pending",
        assigned_to: []
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao criar atividade do template:", error);
    }
    setIsLoading(false);
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#E50F5F]">Selecionar Modelo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#9CA3AF]" />
            <Input
              placeholder="Buscar modelos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#131313] border-[#656464] text-[#D9D9D9]"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-3">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-[#9CA3AF]">
                Nenhum modelo encontrado
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <Card key={template.id} className="bg-[#131313] border-[#656464] hover:border-[#E50F5F]/50 transition-all cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Lightbulb className="w-5 h-5 text-[#E50F5F]" />
                        <CardTitle className="text-[#D9D9D9]">{template.name}</CardTitle>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSelectTemplate(template)}
                        disabled={isLoading}
                        className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Usar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#9CA3AF] text-sm">
                      {template.description || "Sem descrição"}
                    </p>
                    <p className="text-xs text-[#9CA3AF] mt-2">
                      {template.checklist?.length || 0} item(s) no checklist
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