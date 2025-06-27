import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title = "Confirmar Ação",
  message = "Tem certeza que deseja continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default" // default, danger
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {variant === "danger" && <AlertTriangle className="w-5 h-5 text-red-400" />}
            <span className={variant === "danger" ? "text-red-400" : "text-[#E50F5F]"}>
              {title}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-[#9CA3AF]">{message}</p>
        </div>

        <DialogFooter className="border-t border-[#656464] pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
          >
            {cancelText}
          </Button>
          <Button 
            onClick={onConfirm}
            className={variant === "danger" 
              ? "bg-red-600 hover:bg-red-700 text-white" 
              : "bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
            }
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}