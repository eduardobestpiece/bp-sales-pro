import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form } from "@/api/entities";

export default function CreateFormModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "draft"
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const newForm = {
        ...formData,
        fields: [],
        settings: {
          success_message: "Obrigado! Sua mensagem foi enviada com sucesso.",
          email_notification: false,
          auto_respond: false
        },
        responses_count: 0
      };
      
      await Form.create(newForm);
      setFormData({ title: "", description: "", status: "draft" });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao criar formulário:", error);
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#E50F5F]">Criar Novo Formulário</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Título do Formulário</Label>
            <Input 
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
              placeholder="Ex: Formulário de Contato"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea 
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
              placeholder="Descreva o propósito deste formulário..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-[#656464]">
            <Button type="button" variant="outline" onClick={onClose} className="border-[#656464] text-[#D9D9D9]">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white">
              {isLoading ? "Criando..." : "Criar Formulário"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}