import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Activity } from "@/api/entities";

export default function DeleteActivityModal({ activity, open, onClose, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!activity) return;
    setIsLoading(true);
    try {
      await Activity.delete(activity.id);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao excluir atividade:", error);
    }
    setIsLoading(false);
  };

  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-[#D9D9D9]">Excluir Atividade</DialogTitle>
              <p className="text-[#9CA3AF] text-sm">Esta ação não pode ser desfeita.</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-[#D9D9D9]">
            Tem certeza que deseja excluir a atividade <strong>"{activity.title}"</strong>?
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isLoading ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}