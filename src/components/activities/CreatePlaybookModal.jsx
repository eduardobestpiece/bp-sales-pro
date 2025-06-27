import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  BookOpen,
  Layers,
  Clock,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Playbook } from "@/api/entities";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function CreatePlaybookModal({ 
  playbook, 
  templates, 
  open, 
  onClose, 
  onSuccess,
  selectedCompanyId 
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    company_id: selectedCompanyId || "",
    blocks: []
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (playbook && open) {
      setFormData({
        name: playbook.name || "",
        description: playbook.description || "",
        company_id: playbook.company_id || selectedCompanyId || "",
        blocks: playbook.blocks || []
      });
    } else if (open && !playbook) {
      setFormData({
        name: "",
        description: "",
        company_id: selectedCompanyId || "",
        blocks: []
      });
    }
  }, [playbook, open, selectedCompanyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const playbookData = {
        ...formData,
        blocks: formData.blocks.map((block, blockIndex) => ({
          ...block,
          steps: block.steps.map((step, stepIndex) => ({
            ...step,
            order: stepIndex
          }))
        }))
      };

      if (playbook) {
        await Playbook.update(playbook.id, playbookData);
      } else {
        await Playbook.create(playbookData);
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar playbook:", error);
    }
    setIsLoading(false);
  };

  const addBlock = () => {
    const newBlock = {
      id: `block-${Date.now()}`,
      name: "",
      steps: []
    };
    setFormData(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
  };

  const updateBlock = (blockIndex, field, value) => {
    const newBlocks = [...formData.blocks];
    newBlocks[blockIndex][field] = value;
    setFormData(prev => ({ ...prev, blocks: newBlocks }));
  };

  const removeBlock = (blockIndex) => {
    const newBlocks = formData.blocks.filter((_, i) => i !== blockIndex);
    setFormData(prev => ({ ...prev, blocks: newBlocks }));
  };

  const addStepToBlock = (blockIndex) => {
    const newBlocks = [...formData.blocks];
    const newStep = {
      id: `step-${Date.now()}`,
      template_id: "",
      order: newBlocks[blockIndex].steps.length
    };
    newBlocks[blockIndex].steps.push(newStep);
    setFormData(prev => ({ ...prev, blocks: newBlocks }));
  };

  const updateStep = (blockIndex, stepIndex, field, value) => {
    const newBlocks = [...formData.blocks];
    newBlocks[blockIndex].steps[stepIndex][field] = value;
    setFormData(prev => ({ ...prev, blocks: newBlocks }));
  };

  const removeStep = (blockIndex, stepIndex) => {
    const newBlocks = [...formData.blocks];
    newBlocks[blockIndex].steps = newBlocks[blockIndex].steps.filter((_, i) => i !== stepIndex);
    setFormData(prev => ({ ...prev, blocks: newBlocks }));
  };

  const moveStep = (blockIndex, stepIndex, direction) => {
    const newBlocks = [...formData.blocks];
    const steps = newBlocks[blockIndex].steps;
    const newIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
    
    if (newIndex >= 0 && newIndex < steps.length) {
      [steps[stepIndex], steps[newIndex]] = [steps[newIndex], steps[stepIndex]];
      setFormData(prev => ({ ...prev, blocks: newBlocks }));
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.droppableId.startsWith('block-steps-')) {
      // Reordenando steps dentro de um bloco
      const blockIndex = parseInt(source.droppableId.split('-')[2]);
      const newBlocks = [...formData.blocks];
      const steps = Array.from(newBlocks[blockIndex].steps);
      const [reorderedStep] = steps.splice(source.index, 1);
      steps.splice(destination.index, 0, reorderedStep);
      newBlocks[blockIndex].steps = steps;
      setFormData(prev => ({ ...prev, blocks: newBlocks }));
    } else if (source.droppableId === 'blocks') {
      // Reordenando blocos
      const blocks = Array.from(formData.blocks);
      const [reorderedBlock] = blocks.splice(source.index, 1);
      blocks.splice(destination.index, 0, reorderedBlock);
      setFormData(prev => ({ ...prev, blocks }));
    }
  };

  const getTemplateName = (templateId) => {
    return templates.find(t => t.id === templateId)?.name || 'Modelo não encontrado';
  };

  const getTemplateDays = (templateId) => {
    return templates.find(t => t.id === templateId)?.days_to_complete || 1;
  };

  const getTotalSteps = () => {
    return formData.blocks.reduce((total, block) => total + block.steps.length, 0);
  };

  const getTotalDays = () => {
    return formData.blocks.reduce((total, block) => {
      return total + block.steps.reduce((stepTotal, step) => {
        return stepTotal + getTemplateDays(step.template_id);
      }, 0);
    }, 0);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#E50F5F] flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            {playbook ? 'Editar' : 'Criar'} Playbook
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Label className="text-[#9CA3AF]">Nome do Playbook</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                placeholder="Ex: Onboarding de Clientes"
                required
              />
            </div>
            <div>
              <Label className="text-[#9CA3AF]">Resumo</Label>
              <div className="flex items-center gap-4 mt-2 text-sm text-[#9CA3AF]">
                <Badge variant="outline" className="border-[#656464] flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {formData.blocks.length} blocos
                </Badge>
                <Badge variant="outline" className="border-[#656464] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {getTotalSteps()} atividades
                </Badge>
                <Badge variant="outline" className="border-[#656464] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  ~{getTotalDays()} dias
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-[#9CA3AF]">Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
              placeholder="Descreva o objetivo e contexto deste playbook..."
              rows={3}
            />
          </div>

          {/* Blocos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg font-semibold text-[#D9D9D9]">Blocos do Playbook</Label>
              <Button
                type="button"
                onClick={addBlock}
                className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Bloco
              </Button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="blocks">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {formData.blocks.map((block, blockIndex) => (
                      <Draggable key={block.id} draggableId={block.id} index={blockIndex}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-[#131313] border-[#656464]"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-3">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="w-5 h-5 text-[#9CA3AF] cursor-move" />
                                </div>
                                <div className="flex-1">
                                  <Input
                                    value={block.name}
                                    onChange={(e) => updateBlock(blockIndex, 'name', e.target.value)}
                                    className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
                                    placeholder={`Nome do Bloco ${blockIndex + 1}`}
                                  />
                                </div>
                                <Badge variant="outline" className="border-[#656464] text-[#9CA3AF]">
                                  {block.steps.length} atividades
                                </Badge>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeBlock(blockIndex)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {/* Steps do Bloco */}
                              <Droppable droppableId={`block-steps-${blockIndex}`}>
                                {(provided) => (
                                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                    {block.steps.map((step, stepIndex) => (
                                      <Draggable key={step.id} draggableId={step.id} index={stepIndex}>
                                        {(provided) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="flex items-center gap-3 p-3 bg-[#1C1C1C] rounded border border-[#656464]"
                                          >
                                            <div {...provided.dragHandleProps}>
                                              <GripVertical className="w-4 h-4 text-[#9CA3AF] cursor-move" />
                                            </div>
                                            <span className="text-sm text-[#9CA3AF] w-8">
                                              {stepIndex + 1}.
                                            </span>
                                            <div className="flex-1">
                                              <Select
                                                value={step.template_id}
                                                onValueChange={(value) => updateStep(blockIndex, stepIndex, 'template_id', value)}
                                              >
                                                <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                                                  <SelectValue placeholder="Selecionar modelo..." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                                                  {templates.map(template => (
                                                    <SelectItem key={template.id} value={template.id}>
                                                      {template.name} ({template.days_to_complete || 1} dias)
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => moveStep(blockIndex, stepIndex, 'up')}
                                                disabled={stepIndex === 0}
                                                className="w-8 h-8 text-[#9CA3AF] hover:text-[#D9D9D9]"
                                              >
                                                <ArrowUp className="w-3 h-3" />
                                              </Button>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => moveStep(blockIndex, stepIndex, 'down')}
                                                disabled={stepIndex === block.steps.length - 1}
                                                className="w-8 h-8 text-[#9CA3AF] hover:text-[#D9D9D9]"
                                              >
                                                <ArrowDown className="w-3 h-3" />
                                              </Button>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeStep(blockIndex, stepIndex)}
                                                className="w-8 h-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>

                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => addStepToBlock(blockIndex)}
                                className="w-full mt-3 border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:border-[#E50F5F]"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Atividade ao Bloco
                              </Button>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {formData.blocks.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-[#656464] rounded-lg">
                <Layers className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" />
                <p className="text-[#9CA3AF] mb-4">
                  Nenhum bloco criado ainda. Adicione o primeiro bloco para começar.
                </p>
                <Button
                  type="button"
                  onClick={addBlock}
                  className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Bloco
                </Button>
              </div>
            )}
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
              disabled={isLoading || !formData.name}
              className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
            >
              {isLoading ? "Salvando..." : (playbook ? "Atualizar" : "Criar")} Playbook
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}