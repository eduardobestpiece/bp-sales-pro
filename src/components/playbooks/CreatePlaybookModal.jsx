import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, Clock } from "lucide-react";
import { Playbook } from "@/api/entities";

export default function CreatePlaybookModal({ open, onClose, onSuccess, templates = [], companyId, playbook = null }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    blocks: []
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (playbook) {
      setFormData({
        name: playbook.name || "",
        description: playbook.description || "",
        blocks: playbook.blocks || []
      });
    } else {
      setFormData({
        name: "",
        description: "",
        blocks: []
      });
    }
  }, [playbook, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    setIsLoading(true);
    try {
      const playbookData = {
        ...formData,
        company_id: companyId
      };
      
      if (playbook) {
        await Playbook.update(playbook.id, playbookData);
      } else {
        await Playbook.create(playbookData);
      }
      
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar playbook:", error);
    }
    setIsLoading(false);
  };

  const addBlock = () => {
    const newBlock = {
      id: `block-${Date.now()}`,
      name: `Bloco ${formData.blocks.length + 1}`,
      steps: []
    };
    setFormData(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
  };

  const updateBlock = (blockId, updates) => {
    setFormData(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => 
        block.id === blockId ? { ...block, ...updates } : block
      )
    }));
  };

  const removeBlock = (blockId) => {
    setFormData(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== blockId)
    }));
  };

  const addStepToBlock = (blockId) => {
    const newStep = {
      template_id: "",
      order: 0
    };
    setFormData(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => 
        block.id === blockId 
          ? { ...block, steps: [...(block.steps || []), newStep] }
          : block
      )
    }));
  };

  const updateStep = (blockId, stepIndex, updates) => {
    setFormData(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => 
        block.id === blockId 
          ? { 
              ...block, 
              steps: block.steps.map((step, index) => 
                index === stepIndex ? { ...step, ...updates } : step
              )
            }
          : block
      )
    }));
  };

  const removeStep = (blockId, stepIndex) => {
    setFormData(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => 
        block.id === blockId 
          ? { ...block, steps: block.steps.filter((_, index) => index !== stepIndex) }
          : block
      )
    }));
  };

  // Calcular prazo do bloco e total
  const calculateBlockDays = (block) => {
    if (!block.steps || block.steps.length === 0) return 0;
    
    let maxDays = 0;
    block.steps.forEach(step => {
      const template = templates.find(t => t.id === step.template_id);
      if (template && template.days_to_complete) {
        maxDays = Math.max(maxDays, template.days_to_complete);
      }
    });
    return maxDays;
  };

  const calculateTotalDays = () => {
    return formData.blocks.reduce((total, block) => {
      return total + calculateBlockDays(block);
    }, 0);
  };

  const filteredTemplates = templates.filter(t => t.company_id === companyId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[#E50F5F]">
              {playbook ? "Editar Playbook" : "Criar Novo Playbook"}
            </DialogTitle>
            {formData.blocks.length > 0 && (
              <Badge className="bg-[#E50F5F]/20 text-[#E50F5F] border-[#E50F5F]/30">
                <Clock className="w-3 h-3 mr-1" />
                {calculateTotalDays()} dias total
              </Badge>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name" className="text-[#D9D9D9]">Nome do Playbook</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-[#131313] border-[#656464] text-[#D9D9D9] placeholder:text-[#9CA3AF]"
                placeholder="Digite o nome do playbook"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description" className="text-[#D9D9D9]">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-[#131313] border-[#656464] text-[#D9D9D9] placeholder:text-[#9CA3AF]"
                placeholder="Descreva o objetivo deste playbook"
                rows={3}
              />
            </div>
          </div>

          {/* Blocos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-[#D9D9D9]">Blocos do Playbook</h3>
              <Button
                type="button"
                onClick={addBlock}
                className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
                variant="default"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Bloco
              </Button>
            </div>

            {formData.blocks.map((block, blockIndex) => {
              const blockDays = calculateBlockDays(block);
              return (
                <Card key={block.id} className="bg-[#131313] border-[#656464]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <CardTitle className="text-[#D9D9D9] text-base flex-1">
                          <Input
                            value={block.name}
                            onChange={(e) => updateBlock(block.id, { name: e.target.value })}
                            className="bg-transparent border-none p-0 text-[#D9D9D9] font-medium focus:ring-0"
                            placeholder="Nome do bloco"
                          />
                        </CardTitle>
                        {blockDays > 0 && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            <Clock className="w-3 h-3 mr-1" />
                            {blockDays} dias
                          </Badge>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBlock(block.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {block.steps?.map((step, stepIndex) => {
                        const stepTemplate = templates.find(t => t.id === step.template_id);
                        return (
                          <div key={stepIndex} className="flex items-center gap-3 p-3 bg-[#1C1C1C] rounded border border-[#656464]">
                            <GripVertical className="w-4 h-4 text-[#9CA3AF]" />
                            <div className="flex-1">
                              <Select
                                value={step.template_id || ""}
                                onValueChange={(value) => updateStep(block.id, stepIndex, { template_id: value })}
                              >
                                <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                                  <SelectValue placeholder="Selecionar atividade modelo" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                                  {filteredTemplates.length === 0 ? (
                                    <SelectItem value="no-templates" disabled>
                                      Nenhum modelo disponível
                                    </SelectItem>
                                  ) : (
                                    filteredTemplates.map(template => (
                                      <SelectItem 
                                        key={template.id} 
                                        value={template.id}
                                        className="text-[#D9D9D9] focus:bg-[#E50F5F]/20 focus:text-[#D9D9D9]"
                                      >
                                        {template.name} ({template.days_to_complete || 1} dias)
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              {stepTemplate && (
                                <div className="text-xs text-[#9CA3AF] mt-1">
                                  {stepTemplate.days_to_complete || 1} dias - {stepTemplate.description || 'Sem descrição'}
                                </div>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeStep(block.id, stepIndex)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addStepToBlock(block.id)}
                        className="w-full border-dashed border-[#656464] text-[#9CA3AF] hover:text-[#E50F5F] hover:border-[#E50F5F] bg-transparent"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Atividade Modelo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {formData.blocks.length === 0 && (
              <div className="text-center py-8 text-[#9CA3AF] border-2 border-dashed border-[#656464] rounded-lg">
                <p>Nenhum bloco adicionado ainda.</p>
                <p className="text-sm">Clique em "Adicionar Bloco" para começar.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/30"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
            >
              {isLoading ? "Salvando..." : (playbook ? "Atualizar" : "Criar Playbook")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}