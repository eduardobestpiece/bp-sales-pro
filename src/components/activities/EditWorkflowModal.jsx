
import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, UserPlus, AlertTriangle } from "lucide-react";
import { Workflow } from "@/api/entities";
import { User } from "@/api/entities";
import { Activity } from "@/api/entities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import InviteUserToWorkflowModal from "./InviteUserToWorkflowModal";
import { Company } from '@/api/entities';

const STAGE_TYPES = [
    { value: "pending", label: "Pendente" },
    { value: "in_progress", label: "Em Andamento" },
    { value: "completed", label: "Concluído" },
    { value: "cancelled", label: "Cancelado" },
];

const REQUIRED_TYPES = ["pending", "completed", "cancelled"];

export default function EditWorkflowModal({ workflow, open, onClose, onSuccess, activities = [] }) {
  const [formData, setFormData] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [stageReassign, setStageReassign] = useState({ open: false, stageIndex: null, targetStageName: '' });

  const loadData = useCallback(async () => {
    try {
      const [users, companiesData] = await Promise.all([User.list(), Company.list()]);
      setAvailableUsers(users);
      setCompanies(companiesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadData();
      if (workflow) { // Ensure workflow is available before setting formData
        setFormData({
          ...workflow,
          invited_users: workflow.invited_users || [],
          stages: workflow.stages.map(s => ({...s, id: s.id || `stage-${Math.random()}`})) // Ensure stages have IDs
        });
        setActiveTab("info");
      }
    }
  }, [open, workflow, loadData]);

  if (!formData) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = { ...formData, stages: formData.stages.map((stage, index) => ({ ...stage, order: index })) };
      await Workflow.update(workflow.id, payload);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar workflow:", error);
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
  
  const handleRemoveStage = (index) => {
    const stageToRemove = formData.stages[index];
    const activitiesInStage = activities.filter(a => a.workflow_id === workflow.id && a.stage === stageToRemove.name);

    if (activitiesInStage.length > 0) {
      setStageReassign({ open: true, stageIndex: index, targetStageName: '' });
    } else {
      const newStages = formData.stages.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, stages: newStages }));
    }
  };

  const confirmReassignAndRemove = async () => {
    const { stageIndex, targetStageName } = stageReassign;
    if (!targetStageName) {
      alert("Por favor, selecione uma nova fase para as atividades.");
      return;
    }
    
    setIsLoading(true);
    try {
        const stageToRemove = formData.stages[stageIndex];
        const activitiesToUpdate = activities.filter(a => a.workflow_id === workflow.id && a.stage === stageToRemove.name);

        for (const activity of activitiesToUpdate) {
            await Activity.update(activity.id, { stage: targetStageName });
        }
        
        const newStages = formData.stages.filter((_, i) => i !== stageIndex);
        setFormData(prev => ({ ...prev, stages: newStages }));
    } catch (error) {
        console.error("Erro ao reatribuir e remover fase:", error);
    }
    setIsLoading(false);
    setStageReassign({ open: false, stageIndex: null, targetStageName: '' });
  };


  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(formData.stages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFormData(prev => ({ ...prev, stages: items }));
  };

  const toggleUser = (userId) => {
    // formData.invited_users is guaranteed to be an array due to useEffect initialization
    const isSelected = formData.invited_users.includes(userId);
    const newUsers = isSelected
      ? formData.invited_users.filter((id) => id !== userId)
      : [...formData.invited_users, userId];
    setFormData(prev => ({ ...prev, invited_users: newUsers }));
  };

  const handleInviteSuccess = (newUser) => {
    // Adiciona o novo usuário à lista de convidados e recarrega os dados
    if (!formData.invited_users.includes(newUser.id)) {
      setFormData(prev => ({
        ...prev,
        invited_users: [...prev.invited_users, newUser.id]
      }));
    }
    loadData(); // Reload all users and companies, in case the invited user was new
    setShowInviteModal(false);
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
      return STAGE_TYPES.filter(type => type.value === 'in_progress' || !usedRequiredTypes.has(type.value));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#E50F5F]">Editar Workflow</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-[#131313] border border-[#656464]">
                <TabsTrigger value="info" className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white text-[#D9D9D9]">Informações</TabsTrigger>
                <TabsTrigger value="guests" className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white text-[#D9D9D9]">Convidados</TabsTrigger>
                <TabsTrigger value="stages" className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white text-[#D9D9D9]">Fases</TabsTrigger>
              </TabsList>
              
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
                          <RadioGroupItem value="public" id="public-edit" className="border-[#E50F5F] text-[#E50F5F]" />
                          <Label htmlFor="public-edit" className="text-[#D9D9D9] flex-1 cursor-pointer">
                            <div className="font-medium">Público</div>
                            <div className="text-sm text-[#9CA3AF]">Todos os usuários da empresa podem ver</div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-[#1C1C1C] rounded-lg border border-[#656464]">
                          <RadioGroupItem value="private" id="private-edit" className="border-[#E50F5F] text-[#E50F5F]" />
                          <Label htmlFor="private-edit" className="text-[#D9D9D9] flex-1 cursor-pointer">
                            <div className="font-medium">Privado</div>
                            <div className="text-sm text-[#9CA3AF]">Somente usuários convidados</div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="guests" className="pt-6">
                <Card className="bg-[#131313] border-[#656464]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-[#D9D9D9]">Convidados</CardTitle>
                        <p className="text-[#9CA3AF] text-sm mt-1">O criador do workflow é adicionado automaticamente</p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setShowInviteModal(true)}
                        className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Convidar Usuário
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                      {availableUsers.filter(u => (formData.invited_users || []).includes(u.id)).map((user) => (
                        <div key={user.id} className="flex items-center space-x-3 p-3 bg-[#1C1C1C] rounded-lg border border-[#656464]">
                          <Checkbox
                            id={`edit-${user.id}`}
                            checked={(formData.invited_users || []).includes(user.id)}
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
                      <Droppable droppableId="stages-edit">
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
                                              <SelectItem key={type.value} value={type.value} className="focus:bg-[#E50F5F]/20">{type.label}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <Button type="button" onClick={() => handleRemoveStage(index)} variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/20">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
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
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <InviteUserToWorkflowModal 
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        companies={companies}
        workflow={workflow}
        onSuccess={handleInviteSuccess}
      />

      <AlertDialog open={stageReassign.open} onOpenChange={(open) => !open && setStageReassign({ open: false, stageIndex: null, targetStageName: '' })}>
        <AlertDialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-orange-400">Reatribuir Atividades</AlertDialogTitle>
            <AlertDialogDescription className="text-[#9CA3AF]">
              Esta fase contém atividades. Para onde você deseja movê-las antes de excluir a fase?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label className="text-[#9CA3AF]">Mover atividades para a fase:</Label>
            <Select onValueChange={(value) => setStageReassign(prev => ({...prev, targetStageName: value}))}>
              <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-2">
                <SelectValue placeholder="Selecione uma nova fase" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                {formData.stages.filter((_, i) => i !== stageReassign.stageIndex).map(stage => (
                  <SelectItem key={stage.id} value={stage.name} className="text-[#D9D9D9] focus:bg-[#E50F5F]/20">{stage.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setStageReassign({ open: false, stageIndex: null, targetStageName: '' })}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReassignAndRemove}
              disabled={isLoading || !stageReassign.targetStageName}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isLoading ? "Movendo..." : "Mover e Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
