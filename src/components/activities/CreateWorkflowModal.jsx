
import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, UserPlus } from "lucide-react";
import { Workflow } from "@/api/entities";
import { User } from "@/api/entities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const STAGE_TYPES = [
    { value: "pending", label: "Pendente" },
    { value: "in_progress", label: "Em Andamento" },
    { value: "completed", label: "Concluído" },
    { value: "cancelled", label: "Cancelado" },
];

const REQUIRED_TYPES = ["pending", "completed", "cancelled"];

export default function CreateWorkflowModal({ open, onClose, onSuccess, selectedCompany }) {
  const [formData, setFormData] = useState({
    name: "",
    permissions: "public",
    invited_users: [],
    stages: [
      { id: `stage-${Date.now()}-1`, name: "Pendente", type: "pending", order: 0 },
      { id: `stage-${Date.now()}-2`, name: "Em Andamento", type: "in_progress", order: 1 },
      { id: `stage-${Date.now()}-3`, name: "Concluído", type: "completed", order: 2 },
      { id: `stage-${Date.now()}-4`, name: "Cancelado", type: "cancelled", order: 3 },
    ],
  });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  const loadUsers = useCallback(async () => {
    try {
      const users = await User.list();
      setAvailableUsers(users);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  }, []); 

  useEffect(() => {
    if (open) {
      loadUsers();
      // Reset form data when modal opens
      setFormData({
        name: "",
        permissions: "public",
        invited_users: [],
        stages: [
            { id: `stage-${Date.now()}-1`, name: "Pendente", type: "pending", order: 0 },
            { id: `stage-${Date.now()}-2`, name: "Em Andamento", type: "in_progress", order: 1 },
            { id: `stage-${Date.now()}-3`, name: "Concluído", type: "completed", order: 2 },
            { id: `stage-${Date.now()}-4`, name: "Cancelado", type: "cancelled", order: 3 },
        ],
      });
      setActiveTab("info");
    }
  }, [open, loadUsers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Ensure 'order' is set correctly based on current array index before sending
      // Adicionar company_id ao payload
      const payload = { 
        ...formData, 
        company_id: selectedCompany,
        stages: formData.stages.map((stage, index) => ({ ...stage, order: index })) 
      };
      await Workflow.create(payload);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao criar workflow:", error);
    }
    setIsLoading(false);
  };

  const addStage = () => {
    const newStage = { id: `new-stage-${Date.now()}`, name: "", type: "in_progress", order: formData.stages.length };
    setFormData(prev => ({ ...prev, stages: [...prev.stages, newStage] }));
  };

  const updateStage = (index, field, value) => {
    const newStages = [...formData.stages];
    newStages[index][field] = value;
    setFormData(prev => ({ ...prev, stages: newStages }));
  };

  const removeStage = (index) => {
    const newStages = formData.stages.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, stages: newStages }));
  };
  
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(formData.stages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFormData(prev => ({ ...prev, stages: items }));
  };

  const toggleUser = (userId) => {
    const isSelected = formData.invited_users.includes(userId);
    const newUsers = isSelected
      ? formData.invited_users.filter((id) => id !== userId)
      : [...formData.invited_users, userId];
    setFormData(prev => ({ ...prev, invited_users: newUsers }));
  };

  const hasRequiredStages = () => {
    const currentTypes = new Set(formData.stages.map(stage => stage.type));
    return REQUIRED_TYPES.every(type => currentTypes.has(type));
  };
  
  const getAvailableStageTypes = (currentType) => {
      const usedRequiredTypes = new Set(
          formData.stages
              .filter(s => s.type !== currentType && REQUIRED_TYPES.includes(s.type))
              .map(s => s.type)
      );
      // 'in_progress' stages can always be added. Other required types (pending, completed, cancelled)
      // can only be chosen if not already assigned to another stage (excluding the current one being edited).
      return STAGE_TYPES.filter(type => type.value === 'in_progress' || !usedRequiredTypes.has(type.value));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#E50F5F]">Criar Workflow</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#131313] border border-[#656464]">
              <TabsTrigger value="info" className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white text-[#D9D9D9]">Informações</TabsTrigger>
              <TabsTrigger value="guests" className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white text-[#D9D9D9]">Convidados</TabsTrigger>
              <TabsTrigger value="stages" className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white text-[#D9D9D9]">Fases</TabsTrigger>
            </TabsList>

            {/* Tab Content: Informações */}
            <TabsContent value="info" className="pt-6">
              <Card className="bg-[#131313] border-[#656464]">
                <CardHeader>
                  <CardTitle className="text-[#D9D9D9]">Informações do Workflow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-[#9CA3AF]">Nome do Workflow</Label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Processo de Vendas"
                      className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-[#9CA3AF] mb-3 block">Permissões</Label>
                    <RadioGroup
                      value={formData.permissions}
                      onValueChange={(value) => setFormData({ ...formData, permissions: value })}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3 p-3 bg-[#1C1C1C] rounded-lg border border-[#656464]">
                        <RadioGroupItem value="public" id="public" className="border-[#E50F5F] text-[#E50F5F]" />
                        <Label htmlFor="public" className="text-[#D9D9D9] flex-1 cursor-pointer">
                          <div className="font-medium">Público</div>
                          <div className="text-sm text-[#9CA3AF]">Todos os usuários da empresa podem ver</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-[#1C1C1C] rounded-lg border border-[#656464]">
                        <RadioGroupItem value="private" id="private" className="border-[#E50F5F] text-[#E50F5F]" />
                        <Label htmlFor="private" className="text-[#D9D9D9] flex-1 cursor-pointer">
                          <div className="font-medium">Privado</div>
                          <div className="text-sm text-[#9CA3AF]">Somente usuários convidados</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Content: Convidados */}
            <TabsContent value="guests" className="pt-6">
              <Card className="bg-[#131313] border-[#656464]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-[#D9D9D9]">Convidados</CardTitle>
                      <p className="text-[#9CA3AF] text-sm mt-1">O criador do workflow será adicionado automaticamente</p>
                    </div>
                    <Button
                      type="button"
                      className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                    {availableUsers.map((user) => (
                      <div key={user.id} className="flex items-center space-x-3 p-3 bg-[#1C1C1C] rounded-lg border border-[#656464]">
                        <Checkbox
                          id={user.id}
                          checked={formData.invited_users.includes(user.id)}
                          onCheckedChange={() => toggleUser(user.id)}
                          className="border-[#E50F5F] data-[state=checked]:bg-[#E50F5F]"
                        />
                        <div className="flex-1">
                          <p className="text-[#D9D9D9] font-medium">{user.full_name || 'Nome não informado'}</p>
                          <p className="text-[#9CA3AF] text-sm">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Content: Fases */}
            <TabsContent value="stages" className="pt-6">
              <Card className="bg-[#131313] border-[#656464]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-[#D9D9D9]">Fases do Workflow</CardTitle>
                      <p className="text-[#9CA3AF] text-sm">Defina e ordene as fases. É obrigatório ter pelo menos uma fase de cada tipo: Pendente, Concluído e Cancelado.</p>
                    </div>
                    <Button type="button" onClick={addStage} className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white">
                      <Plus className="w-4 h-4 mr-2" /> Adicionar Fase
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="stages">
                          {(provided) => (
                              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                  {formData.stages.map((stage, index) => (
                                      <Draggable key={stage.id} draggableId={stage.id.toString()} index={index}>
                                          {(provided) => (
                                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="flex items-center gap-4 p-4 bg-[#1C1C1C] rounded-lg border border-[#656464]">
                                                  <GripVertical className="w-5 h-5 text-[#9CA3AF] cursor-move" />
                                                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                      <div>
                                                          <Label className="text-[#9CA3AF]">Nome da Fase</Label>
                                                          <Input required value={stage.name} onChange={(e) => updateStage(index, 'name', e.target.value)} placeholder="Ex: Prospecção" className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1" />
                                                      </div>
                                                      <div>
                                                          <Label className="text-[#9CA3AF]">Tipo de Fase</Label>
                                                          <Select value={stage.type} onValueChange={(value) => updateStage(index, 'type', value)}>
                                                              <SelectTrigger className="w-full mt-1 p-2 bg-[#131313] border border-[#656464] text-[#D9D9D9] rounded-md">
                                                                  <SelectValue placeholder="Selecione o tipo" />
                                                              </SelectTrigger>
                                                              <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                                                                  {getAvailableStageTypes(stage.type).map(type => (
                                                                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                                                  ))}
                                                              </SelectContent>
                                                          </Select>
                                                      </div>
                                                  </div>
                                                  {formData.stages.length > 1 && (
                                                      <Button type="button" onClick={() => removeStage(index)} variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/20">
                                                          <Trash2 className="w-4 h-4" />
                                                      </Button>
                                                  )}
                                              </div>
                                          )}
                                      </Draggable>
                                  ))}
                                  {provided.placeholder}
                              </div>
                          )}
                      </Droppable>
                  </DragDropContext>

                  {!hasRequiredStages() && (
                    <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
                      <p className="text-orange-200 text-sm">⚠️ Atenção: É necessário ter pelo menos uma fase de cada tipo (Pendente, Concluído e Cancelado).</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-6 border-t border-[#656464]">
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
              disabled={isLoading || !hasRequiredStages()}
              className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white disabled:opacity-50"
            >
              {isLoading ? "Criando..." : "Criar Workflow"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
