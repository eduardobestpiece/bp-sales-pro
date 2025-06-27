import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function WorkflowDetailsModal({ workflow, open, onClose, onRefresh }) {
  if (!workflow) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#E50F5F]">{workflow.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <h3 className="font-semibold text-[#D9D9D9] mb-2">Permissões</h3>
            <Badge 
              variant="outline" 
              className={`${
                workflow.permissions === 'public' 
                  ? 'border-green-500 text-green-400' 
                  : 'border-yellow-500 text-yellow-400'
              }`}
            >
              {workflow.permissions === 'public' ? 'Público' : 'Privado'}
            </Badge>
          </div>
          
          <div>
            <h3 className="font-semibold text-[#D9D9D9] mb-2">Fases</h3>
            <div className="flex flex-wrap gap-2">
              {workflow.stages?.map((stage, index) => (
                <Badge key={index} variant="secondary" className="bg-[#131313] border border-[#656464] text-[#D9D9D9]">
                  {stage.name}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-[#D9D9D9] mb-2">Usuários Convidados</h3>
            {workflow.invited_users?.length > 0 ? (
                <p className="text-[#9CA3AF]">{workflow.invited_users.length} usuário(s) convidado(s)</p>
            ) : (
                <p className="text-[#9CA3AF]">Nenhum usuário convidado.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}