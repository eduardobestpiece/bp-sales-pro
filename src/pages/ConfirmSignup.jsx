import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ConfirmSignup() {
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
        </div>

        <Card className="bg-[#1C1C1C] border-[#656464]">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-[#E50F5F] text-xl">Cadastro Confirmado!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-[#9CA3AF]">
              Sua conta foi ativada com sucesso. Agora você pode fazer login e começar a usar o BP Sales App.
            </p>
            
            <div className="pt-4">
              <Link to={createPageUrl("Welcome")}>
                <Button className="w-full bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white font-medium">
                  Fazer Login
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <p className="text-xs text-[#656464] mt-4">
              Bem-vindo ao BP Sales App - Gestão de atividades com total transparência
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}