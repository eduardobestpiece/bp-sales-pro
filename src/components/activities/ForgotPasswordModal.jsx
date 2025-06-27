import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Check, AlertCircle } from "lucide-react";

export default function ForgotPasswordModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email) {
      setError("Por favor, insira seu email.");
      setIsLoading(false);
      return;
    }

    // Validação simples de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, insira um email válido.");
      setIsLoading(false);
      return;
    }

    try {
      // Simular envio de email de recuperação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSuccess(true);
    } catch (err) {
      setError("Erro ao enviar email. Tente novamente.");
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    setEmail("");
    setIsSuccess(false);
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#E50F5F] flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Recuperar Senha
          </DialogTitle>
        </DialogHeader>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div>
              <Label className="text-[#9CA3AF]">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email"
                className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-200">{error}</span>
              </div>
            )}

            <p className="text-sm text-[#9CA3AF]">
              Enviaremos um link de recuperação para o email informado.
            </p>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
              >
                {isLoading ? "Enviando..." : "Enviar Email"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="py-6 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#D9D9D9] mb-2">
              Email Enviado!
            </h3>
            <p className="text-sm text-[#9CA3AF] mb-6">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
            <Button
              onClick={handleClose}
              className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
            >
              Entendi
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}