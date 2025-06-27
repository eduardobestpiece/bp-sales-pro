import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Folder, 
  File, 
  MoreHorizontal, 
  Download, 
  Share2, 
  Edit, 
  Trash2,
  Eye,
  Copy
} from "lucide-react";
import { DriveFile } from "@/api/entities";

export default function FileListItem({ 
  file, 
  viewMode, 
  isSelected, 
  onSelect, 
  onDoubleClick,
  onRefresh,
  formatFileSize,
  getFileIcon 
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await DriveFile.delete(file.id);
      onRefresh();
    } catch (error) {
      console.error("Erro ao excluir arquivo:", error);
    }
    setIsDeleting(false);
  };

  const handleDownload = () => {
    if (file.file_url) {
      window.open(file.file_url, '_blank');
    }
  };

  const handleShare = () => {
    if (file.file_url) {
      navigator.clipboard.writeText(file.file_url);
      // Toast: "Link copiado para área de transferência"
    }
  };

  if (viewMode === "grid") {
    return (
      <div
        className={`relative p-4 rounded-lg border cursor-pointer transition-all ${
          isSelected 
            ? 'border-[#E50F5F] bg-[#E50F5F]/10' 
            : 'border-[#656464] bg-[#131313] hover:border-[#E50F5F]/50'
        }`}
        onDoubleClick={() => onDoubleClick && onDoubleClick()}
      >
        {/* Checkbox de Seleção */}
        <div className="absolute top-2 left-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="border-[#656464] data-[state=checked]:bg-[#E50F5F] data-[state=checked]:border-[#E50F5F]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Menu de Ações */}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-6 h-6 text-[#9CA3AF] hover:text-[#E50F5F]"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
              {file.type === 'file' && (
                <>
                  <DropdownMenuItem onClick={handleDownload} className="hover:bg-[#E50F5F]/20">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShare} className="hover:bg-[#E50F5F]/20">
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="border-[#656464]" />
                </>
              )}
              <DropdownMenuItem className="hover:bg-[#E50F5F]/20">
                <Edit className="w-4 h-4 mr-2" />
                Renomear
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                disabled={isDeleting}
                className="hover:bg-red-500/20 text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? "Excluindo..." : "Excluir"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Ícone */}
        <div className="flex flex-col items-center text-center mt-4">
          {file.type === 'folder' ? (
            <Folder className="w-12 h-12 text-[#E50F5F] mb-3" />
          ) : (
            <div className="text-4xl mb-3">
              {getFileIcon ? getFileIcon(file.file_type) : '📎'}
            </div>
          )}
          
          {/* Nome */}
          <p className="text-sm font-medium text-[#D9D9D9] line-clamp-2 mb-1">
            {file.name}
          </p>
          
          {/* Tamanho/Info */}
          {file.type === 'file' && (
            <p className="text-xs text-[#9CA3AF]">
              {formatFileSize ? formatFileSize(file.file_size) : ''}
            </p>
          )}
        </div>
      </div>
    );
  }

  // List View
  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all ${
        isSelected 
          ? 'border-[#E50F5F] bg-[#E50F5F]/10' 
          : 'border-[#656464] bg-[#131313] hover:border-[#E50F5F]/50'
      }`}
      onDoubleClick={() => onDoubleClick && onDoubleClick()}
    >
      {/* Checkbox */}
      <Checkbox
        checked={isSelected}
        onCheckedChange={onSelect}
        className="border-[#656464] data-[state=checked]:bg-[#E50F5F] data-[state=checked]:border-[#E50F5F]"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Ícone */}
      <div className="flex-shrink-0">
        {file.type === 'folder' ? (
          <Folder className="w-8 h-8 text-[#E50F5F]" />
        ) : (
          <div className="text-2xl">
            {getFileIcon ? getFileIcon(file.file_type) : '📎'}
          </div>
        )}
      </div>

      {/* Informações */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[#D9D9D9] truncate">{file.name}</p>
        <div className="flex items-center gap-4 text-sm text-[#9CA3AF]">
          <span>{file.type === 'folder' ? 'Pasta' : 'Arquivo'}</span>
          {file.type === 'file' && formatFileSize && (
            <span>{formatFileSize(file.file_size)}</span>
          )}
          <span>{new Date(file.created_date).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2">
        {file.type === 'file' && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); handleDownload(); }}
              className="w-8 h-8 text-[#9CA3AF] hover:text-[#E50F5F]"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); handleShare(); }}
              className="w-8 h-8 text-[#9CA3AF] hover:text-[#E50F5F]"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-8 h-8 text-[#9CA3AF] hover:text-[#E50F5F]"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
            <DropdownMenuItem className="hover:bg-[#E50F5F]/20">
              <Edit className="w-4 h-4 mr-2" />
              Renomear
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete}
              disabled={isDeleting}
              className="hover:bg-red-500/20 text-red-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "Excluindo..." : "Excluir"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}