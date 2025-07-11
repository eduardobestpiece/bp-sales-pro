import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Archive, AlertTriangle } from "lucide-react";

export default function ArchiveWorkflowModal({ workflow, open, onClose, onSuccess }) {
  const handleArchive = async () => {
    try {
      // Implementar lógica de arquivamento
      // Por exemplo: await Workflow.update(workflow.id, { archived: true });
      console.log("Arquivando workflow:", workflow.id);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao arquivar workflow:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-orange-500">
            <Archive className="w-5 h-5" />
            Arquivar Workflow
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-start gap-3 py-4">
          <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[#D9D9D9] mb-2">
              Você tem certeza que deseja arquivar o workflow <strong>"{workflow?.name}"</strong>?
            </p>
            <p className="text-[#9CA3AF] text-sm">
              O workflow será movido para a área de arquivos e não aparecerá mais na lista principal. 
              Você pode restaurá-lo a qualquer momento nas configurações.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleArchive}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Archive className="w-4 h-4 mr-2" />
            Arquivar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}