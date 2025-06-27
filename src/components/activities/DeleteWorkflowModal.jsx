import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Workflow } from "@/api/entities";
import { Activity } from "@/api/entities";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function DeleteWorkflowModal({ workflow, open, onClose, onSuccess, activities = [], workflows = [] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [deleteMode, setDeleteMode] = useState('delete_all'); // 'delete_all' or 'move'
  const [targetWorkflowId, setTargetWorkflowId] = useState('');
  const [targetStage, setTargetStage] = useState('');

  if (!workflow) return null;

  const activitiesInWorkflow = activities.filter(a => a.workflow_id === workflow.id);
  const targetWorkflow = workflows.find(w => w.id === targetWorkflowId);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
        if (activitiesInWorkflow.length > 0) {
            if (deleteMode === 'move') {
                if (!targetWorkflowId || !targetStage) {
                    alert("Por favor, selecione um workflow e uma fase de destino.");
                    setIsLoading(false);
                    return;
                }
                // Atualiza as atividades para o novo workflow e fase
                for (const activity of activitiesInWorkflow) {
                    await Activity.update(activity.id, {
                        workflow_id: targetWorkflowId,
                        stage: targetStage
                    });
                }
            } else {
                // Exclui todas as atividades
                for (const activity of activitiesInWorkflow) {
                    await Activity.delete(activity.id);
                }
            }
        }
        // Exclui o workflow
        await Workflow.delete(workflow.id);
        onSuccess();
        onClose();
    } catch (error) {
      console.error("Erro ao deletar workflow e atividades:", error);
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-500">Excluir Workflow</DialogTitle>
          <DialogDescription className="text-[#9CA3AF]">
            Tem certeza que deseja excluir o workflow "{workflow.name}"?
          </DialogDescription>
        </DialogHeader>

        {activitiesInWorkflow.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 my-4 space-y-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-400 mt-1"/>
                    <div>
                        <h4 className="font-semibold text-orange-300">Este workflow contém {activitiesInWorkflow.length} atividade(s).</h4>
                        <p className="text-sm text-orange-400">O que você gostaria de fazer com elas?</p>
                    </div>
                </div>
                
                <RadioGroup value={deleteMode} onValueChange={setDeleteMode} className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="delete_all" id="delete_all" />
                        <Label htmlFor="delete_all" className="text-[#D9D9D9]">Excluir todas as atividades permanentemente</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="move" id="move" />
                        <Label htmlFor="move" className="text-[#D9D9D9]">Mover atividades para outro workflow</Label>
                    </div>
                </RadioGroup>

                {deleteMode === 'move' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6 pt-2">
                        <Select value={targetWorkflowId} onValueChange={setTargetWorkflowId}>
                            <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                                <SelectValue placeholder="Selecione o workflow"/>
                            </SelectTrigger>
                            <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                                {workflows.filter(w => w.id !== workflow.id).map(w => (
                                    <SelectItem key={w.id} value={w.id} className="text-[#D9D9D9]">{w.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                         {targetWorkflow?.stages && (
                            <Select value={targetStage} onValueChange={setTargetStage}>
                                <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                                    <SelectValue placeholder="Selecione a fase"/>
                                </SelectTrigger>
                                <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                                    {targetWorkflow.stages.map((s, i) => (
                                        <SelectItem key={i} value={s.name} className="text-[#D9D9D9]">{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                         )}
                    </div>
                )}
            </div>
        )}

        <DialogFooter className="mt-4">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isLoading || (deleteMode === 'move' && (!targetWorkflowId || !targetStage))}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}