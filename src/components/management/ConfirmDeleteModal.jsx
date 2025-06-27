import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ConfirmDeleteModal({ open, onClose, onConfirm, itemName, itemType }) {
  const [confirmationText, setConfirmationText] = useState('');
  
  const isMatch = confirmationText === itemName;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
        <DialogHeader>
          <DialogTitle className="text-red-500">Confirmar Exclusão</DialogTitle>
          <DialogDescription className="text-[#9CA3AF]">
            Esta ação é irreversível. Para confirmar, digite <strong>{itemName}</strong> no campo abaixo.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="confirm-delete-input">Nome do {itemType}</Label>
          <Input
            id="confirm-delete-input"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            className="bg-[#131313] border-[#656464] mt-1"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="bg-transparent border-[#656464] hover:bg-[#656464]/20">Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={!isMatch}>Excluir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}