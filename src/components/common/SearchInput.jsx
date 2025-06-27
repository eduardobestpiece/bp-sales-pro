import React from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchInput({ 
  value, 
  onChange, 
  placeholder = "Pesquisar...", 
  className = "" 
}) {
  const handleClear = () => {
    onChange("");
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10 bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 text-[#9CA3AF] hover:text-[#E50F5F]"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}