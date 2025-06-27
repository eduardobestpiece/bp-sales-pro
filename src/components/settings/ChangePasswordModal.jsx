import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, Check, AlertCircle } from "lucide-react";

export default function ChangePasswordModal({ open, onClose }) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    return requirements;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validações
    if (!formData.currentPassword) {
      setError("Por favor, insira sua senha atual.");
      setIsLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      setIsLoading(false);
      return;
    }

    const passwordRequirements = validatePassword(formData.newPassword);
    if (!Object.values(passwordRequirements).every(req => req)) {
      setError("A nova senha não atende aos requisitos de segurança.");
      setIsLoading(false);
      return;
    }

    try {
      // Simulação de alteração de senha
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      }, 2000);
    } catch (err) {
      setError("Erro ao alterar senha. Verifique sua senha atual.");
    }
    setIsLoading(false);
  };

  const passwordRequirements = validatePassword(formData.newPassword);

  const handleClose = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setError("");
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#E50F5F] flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Alterar Senha
          </DialogTitle>
        </DialogHeader>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {/* Senha Atual */}
            <div>
              <Label className="text-[#9CA3AF]">Senha Atual</Label>
              <div className="relative mt-1">
                <Input
                  type={showPasswords.current ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  className="bg-[#131313] border-[#656464] text-[#D9D9D9] pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] hover:text-[#D9D9D9]"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Nova Senha */}
            <div>
              <Label className="text-[#9CA3AF]">Nova Senha</Label>
              <div className="relative mt-1">
                <Input
                  type={showPasswords.new ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className="bg-[#131313] border-[#656464] text-[#D9D9D9] pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] hover:text-[#D9D9D9]"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Requisitos da Senha */}
              {formData.newPassword && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-[#9CA3AF]">Requisitos da senha:</p>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    <div className={`flex items-center gap-1 ${passwordRequirements.length ? 'text-green-400' : 'text-[#9CA3AF]'}`}>
                      <Check className="w-3 h-3" />
                      Pelo menos 8 caracteres
                    </div>
                    <div className={`flex items-center gap-1 ${passwordRequirements.uppercase ? 'text-green-400' : 'text-[#9CA3AF]'}`}>
                      <Check className="w-3 h-3" />
                      Pelo menos uma letra maiúscula
                    </div>
                    <div className={`flex items-center gap-1 ${passwordRequirements.number ? 'text-green-400' : 'text-[#9CA3AF]'}`}>
                      <Check className="w-3 h-3" />
                      Pelo menos um número
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirmar Senha */}
            <div>
              <Label className="text-[#9CA3AF]">Confirmar Nova Senha</Label>
              <div className="relative mt-1">
                <Input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="bg-[#131313] border-[#656464] text-[#D9D9D9] pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] hover:text-[#D9D9D9]"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-200">{error}</span>
              </div>
            )}

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
                {isLoading ? "Alterando..." : "Alterar Senha"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="py-6 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#D9D9D9] mb-2">
              Senha Alterada!
            </h3>
            <p className="text-sm text-[#9CA3AF]">
              Sua senha foi alterada com sucesso.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}