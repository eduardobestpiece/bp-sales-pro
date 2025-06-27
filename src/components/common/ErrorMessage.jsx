import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorMessage({ 
  title = "Ops! Algo deu errado", 
  message = "Ocorreu um erro inesperado. Tente novamente.", 
  onRetry,
  showRetry = true 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
      <h3 className="text-lg font-semibold text-[#D9D9D9] mb-2">{title}</h3>
      <p className="text-[#9CA3AF] mb-6 max-w-md">{message}</p>
      
      {showRetry && onRetry && (
        <Button 
          onClick={onRetry}
          className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar Novamente
        </Button>
      )}
    </div>
  );
}