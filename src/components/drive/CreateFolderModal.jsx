import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderPlus } from "lucide-react";
import { DriveFile } from "@/api/entities";

export default function CreateFolderModal({ 
  open, 
  onClose, 
  onSuccess, 
  parentFolder,
  selectedCompanyId 
}) {
  const [folderName, setFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    setIsLoading(true);
    try {
      await DriveFile.create({
        name: folderName.trim(),
        type: 'folder',
        parent_id: parentFolder?.id || null,
        company_id: selectedCompanyId
      });
      
      onSuccess();
      onClose();
      setFolderName("");
    } catch (error) {
      console.error("Erro ao criar pasta:", error);
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-[#E50F5F]">
            <FolderPlus className="w-5 h-5" />
            Nova Pasta
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4 py-4">
          <div>
            <Label htmlFor="folderName">Nome da Pasta</Label>
            <Input
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Digite o nome da pasta"
              className="mt-1 bg-[#131313] border-[#656464] text-[#D9D9D9]"
              autoFocus
            />
          </div>
          
          {parentFolder && (
            <div className="text-sm text-[#9CA3AF]">
              Será criada dentro de: <span className="text-[#E50F5F]">{parentFolder.name}</span>
            </div>
          )}
        </form>

        <DialogFooter className="border-t border-[#656464] pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={isLoading || !folderName.trim()}
            className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
          >
            {isLoading ? "Criando..." : "Criar Pasta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}