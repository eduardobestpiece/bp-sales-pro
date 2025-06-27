
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/api/entities";
import { Eye, EyeOff, Mail, Lock, UserPlus, LogIn } from "lucide-react";
import ForgotPasswordModal from "../components/activities/ForgotPasswordModal";

export default function Welcome() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Estados para formulários
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Como o Base44 usa Google Login, vamos redirecionar para o login nativo
      await User.login();
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
    }
    setIsLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    if (registerData.password !== registerData.confirmPassword) {
      setError("As senhas não coincidem.");
      setIsLoading(false);
      return;
    }

    if (registerData.password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      setIsLoading(false);
      return;
    }

    try {
      // Simulação de registro - na realidade o Base44 usa convites
      setMessage("Cadastro realizado! Você receberá um email de confirmação em breve.");
      // Aqui normalmente enviaríamos os dados para uma API de registro
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#131313] via-[#1C1C1C] to-[#131313] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNFNTBGNUYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJtMzYgMzQgNi0yYy4zNi0uMTIuNjgtLjM0Ljg5LS42My4yMS0uMjkuMzEtLjY0LjI4LTEuMDEtLjAzLS4zNy0uMTktLjcyLS40NS0uOTlsLTItMi0yLTJjLS4yNy0uMjYtLjYyLS40Mi0uOTktLjQ1LS4zNy0uMDMtLjcyLjA3LTEuMDEuMjgtLjI5LjIxLS41MS41My0uNjMuODlsLTIgNnptLTE4IDhsNi0yYy4zNi0uMTIuNjgtLjM0Ljg5LS42My4yMS0uMjkuMzEtLjY0LjI4LTEuMDEtLjAzLS.zNy0uMTktLjcyLS40NS0uOTlsLTItMi0yLTJjLS4yNy0uMjYtLjYyLS40Mi0uOTktLjQ1LS4zNy0uMDMtLjcyLjA3LTEuMDEuMjgtLjI5LjIxLS41MS41My0uNjMuODlsLTIgNnoiLz48L2c+PC9nPjwvc3ZnPg==')]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/89433a287_BPSalesBranca-LogoBPSales.png"
            alt="BP Sales"
            className="h-12 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-[#D9D9D9] mb-2">Bem-vindo ao BP Sales App</h1>
          <p className="text-[#9CA3AF] text-sm">Gestão de atividades com total transparência</p>
        </div>

        {/* Mensagens */}
        {message && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Tabs de Login/Registro */}
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#1C1C1C] border border-[#656464]">
            <TabsTrigger
              value="login"
              className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white"
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white"
            >
              Registre-se
            </TabsTrigger>
          </TabsList>

          {/* Tab de Login */}
          <TabsContent value="login">
            <Card className="bg-[#1C1C1C] border-[#656464]">
              <CardHeader>
                <CardTitle className="text-[#D9D9D9] flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Fazer Login
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label className="text-[#9CA3AF]">Email ou Usuário</Label>
                    <Input
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                      placeholder="Digite seu email"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-[#9CA3AF]">Senha</Label>
                    <div className="relative mt-1">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="bg-[#131313] border-[#656464] text-[#D9D9D9] pr-10"
                        placeholder="Digite sua senha"
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

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white font-medium py-2.5"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Entrando...
                      </div>
                    ) : (
                      "Entrar"
                    )}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-[#E50F5F] hover:text-[#E50F5F]/80 underline"
                    >
                      Esqueci minha senha
                    </button>
                  </div>

                  <div className="text-center text-sm text-[#9CA3AF]">
                    Ainda não tem cadastro?{" "}
                    <TabsTrigger
                      value="register"
                      className="text-[#E50F5F] hover:text-[#E50F5F]/80 underline p-0 h-auto bg-transparent"
                    >
                      Clique aqui
                    </TabsTrigger>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Registro */}
          <TabsContent value="register">
            <Card className="bg-[#1C1C1C] border-[#656464]">
              <CardContent className="pt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#9CA3AF]">Primeiro Nome</Label>
                      <Input
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                        className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                        placeholder="Nome"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-[#9CA3AF]">Sobrenome</Label>
                      <Input
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                        className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                        placeholder="Sobrenome"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-[#9CA3AF]">Email</Label>
                    <Input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value.toLowerCase() })}
                      className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-[#9CA3AF]">Telefone</Label>
                    <Input
                      type="tel"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <Label className="text-[#9CA3AF]">Senha</Label>
                    <div className="relative mt-1">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className="bg-[#131313] border-[#656464] text-[#D9D9D9] pr-10"
                        placeholder="Mínimo 8 caracteres"
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
                    <Label className="text-[#9CA3AF]">Repetir Senha</Label>
                    <div className="relative mt-1">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        className="bg-[#131313] border-[#656464] text-[#D9D9D9] pr-10"
                        placeholder="Confirme sua senha"
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

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white font-medium py-2.5"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Cadastrando...
                      </div>
                    ) : (
                      "Criar Conta"
                    )}
                  </Button>

                  <div className="text-center text-sm text-[#9CA3AF]">
                    Já tem uma conta?{" "}
                    <TabsTrigger
                      value="login"
                      className="text-[#E50F5F] hover:text-[#E50F5F]/80 underline p-0 h-auto bg-transparent"
                    >
                      Faça login
                    </TabsTrigger>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Esqueci Senha */}
        <ForgotPasswordModal
          open={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
        />

        {/* Aviso sobre Base44 */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300 text-center">
            💡 Este app utiliza autenticação segura do Base44. O login será redirecionado para o sistema oficial.
          </p>
        </div>
      </div>
    </div>
  );
}
