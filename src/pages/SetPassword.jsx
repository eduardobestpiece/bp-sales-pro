import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Lock, CheckCircle, X } from "lucide-react";

export default function SetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Validação de senha forte
  const passwordValidation = {
    minLength: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    hasLetter: /[a-zA-Z]/.test(password),
    notSequential: !/123|abc|qwe/i.test(password)
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setIsLoading(false);
      return;
    }

    if (!isPasswordValid) {
      setError("A senha não atende aos requisitos de segurança.");
      setIsLoading(false);
      return;
    }

    try {
      // Aqui seria a chamada para definir a senha
      // Simulação de sucesso
      setTimeout(() => {
        setSuccess(true);
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      setError("Erro ao definir senha. Tente novamente.");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#131313] via-[#1C1C1C] to-[#131313] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/89433a287_BPSalesBranca-LogoBPSales.png" 
              alt="BP Sales" 
              className="h-12 mx-auto mb-4"
            />
          </div>

          <Card className="bg-[#1C1C1C] border-[#656464]">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <CardTitle className="text-[#E50F5F] text-xl">Senha Definida!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-[#9CA3AF]">
                Sua senha foi definida com sucesso. Agora você pode fazer login na plataforma.
              </p>
              
              <Button 
                className="w-full bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white font-medium"
                onClick={() => window.location.href = "/"}
              >
                Ir para Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#131313] via-[#1C1C1C] to-[#131313] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/89433a287_BPSalesBranca-LogoBPSales.png" 
            alt="BP Sales" 
            className="h-12 mx-auto mb-4"
          />
          <h1 className="text-xl font-bold text-[#D9D9D9] mb-2">Definir Senha</h1>
          <p className="text-[#9CA3AF] text-sm">Crie uma senha segura para sua conta</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <Card className="bg-[#1C1C1C] border-[#656464]">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-[#9CA3AF]">Nova Senha</Label>
                <div className="relative mt-1">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#131313] border-[#656464] text-[#D9D9D9] pr-10"
                    placeholder="Digite sua nova senha"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-[#9CA3AF] hover:text-[#D9D9D9]"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-[#9CA3AF]">Confirmar Senha</Label>
                <div className="relative mt-1">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-[#131313] border-[#656464] text-[#D9D9D9] pr-10"
                    placeholder="Confirme sua nova senha"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-[#9CA3AF] hover:text-[#D9D9D9]"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Validação Visual da Senha */}
              <div className="space-y-2 p-3 bg-[#131313] rounded-lg border border-[#656464]">
                <p className="text-sm font-medium text-[#9CA3AF]">Requisitos da senha:</p>
                <div className="space-y-1">
                  {Object.entries({
                    "Pelo menos 8 caracteres": passwordValidation.minLength,
                    "Contém número": passwordValidation.hasNumber,
                    "Contém caractere especial": passwordValidation.hasSpecialChar,
                    "Contém letra": passwordValidation.hasLetter,
                    "Não é sequencial (123, abc)": passwordValidation.notSequential
                  }).map(([rule, isValid]) => (
                    <div key={rule} className="flex items-center gap-2 text-xs">
                      {isValid ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                      <span className={isValid ? "text-green-400" : "text-[#9CA3AF]"}>
                        {rule}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !isPasswordValid || password !== confirmPassword}
                className="w-full bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white font-medium py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Definindo Senha...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Definir Senha
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}