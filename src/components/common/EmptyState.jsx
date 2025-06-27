import React from "react";
import { Button } from "@/components/ui/button";

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel,
  onAction,
  className = ""
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && <Icon className="w-16 h-16 text-[#9CA3AF] mx-auto mb-4" />}
      <h3 className="text-lg font-medium text-[#D9D9D9] mb-2">{title}</h3>
      <p className="text-[#9CA3AF] mb-6 max-w-md mx-auto">{description}</p>
      
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}