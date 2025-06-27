import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ size = "default", text = "Carregando..." }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className={`${sizeClasses[size]} text-[#E50F5F] animate-spin mb-4`} />
      <p className="text-[#9CA3AF] text-sm">{text}</p>
    </div>
  );
}