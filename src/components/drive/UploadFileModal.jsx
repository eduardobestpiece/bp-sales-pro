import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, File, X, CheckCircle } from "lucide-react";
import { DriveFile } from "@/api/entities";
import { UploadFile } from "@/api/integrations";

export default function UploadFileModal({ 
  open, 
  onClose, 
  onSuccess, 
  parentFolder,
  selectedCompanyId 
}) {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const newFiles = selectedFiles.map(file => ({
      id: Math.random().toString(36).substring(2),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending' // pending, uploading, completed, error
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    for (const fileItem of files) {
      if (fileItem.status !== 'pending') continue;
      
      try {
        // Atualizar status para uploading
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'uploading' } : f
        ));
        
        // Simular progresso (em uma implementação real, isso viria da API)
        setUploadProgress(prev => ({ ...prev, [fileItem.id]: 0 }));
        
        // Upload do arquivo
        const { file_url } = await UploadFile({ file: fileItem.file });
        
        // Simular progresso completo
        setUploadProgress(prev => ({ ...prev, [fileItem.id]: 100 }));
        
        // Salvar no drive
        await DriveFile.create({
          name: fileItem.name,
          type: 'file',
          file_type: fileItem.type,
          file_url: file_url,
          file_size: fileItem.size,
          parent_id: parentFolder?.id || null,
          company_id: selectedCompanyId
        });
        
        // Atualizar status para completed
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'completed' } : f
        ));
        
      } catch (error) {
        console.error("Erro no upload:", error);
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'error' } : f
        ));
      }
    }
    
    setIsUploading(false);
    
    // Se todos os uploads foram bem-sucedidos, fechar modal
    setTimeout(() => {
      const allCompleted = files.every(f => f.status === 'completed');
      if (allCompleted) {
        onSuccess();
        onClose();
        setFiles([]);
        setUploadProgress({});
      }
    }, 1000);
  };

  const handleClose = () => {
    if (!isUploading) {
      setFiles([]);
      setUploadProgress({});
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-[#E50F5F]">
            <Upload className="w-5 h-5" />
            Upload de Arquivos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Área de Drop/Select */}
          <div className="border-2 border-dashed border-[#656464] rounded-lg p-8 text-center hover:border-[#E50F5F] transition-colors">
            <Upload className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" />
            <p className="text-[#D9D9D9] mb-2">Arraste arquivos aqui ou</p>
            <Button 
              variant="outline"
              onClick={() => document.getElementById('fileInput').click()}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:border-[#E50F5F]"
            >
              Selecionar Arquivos
            </Button>
            <input
              id="fileInput"
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {parentFolder && (
            <div className="text-sm text-[#9CA3AF]">
              Upload para: <span className="text-[#E50F5F]">{parentFolder.name}</span>
            </div>
          )}

          {/* Lista de Arquivos */}
          {files.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <h4 className="font-medium text-[#D9D9D9]">Arquivos ({files.length})</h4>
              {files.map((fileItem) => (
                <div key={fileItem.id} className="flex items-center gap-3 p-3 bg-[#131313] rounded-lg">
                  <File className="w-5 h-5 text-[#9CA3AF] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#D9D9D9] truncate">{fileItem.name}</p>
                    <p className="text-xs text-[#9CA3AF]">{formatFileSize(fileItem.size)}</p>
                    
                    {/* Progress Bar */}
                    {fileItem.status === 'uploading' && (
                      <Progress 
                        value={uploadProgress[fileItem.id] || 0} 
                        className="mt-1 h-1"
                      />
                    )}
                  </div>
                  
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {fileItem.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {fileItem.status === 'error' && (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                    {fileItem.status === 'pending' && !isUploading && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(fileItem.id)}
                        className="w-5 h-5 p-0 text-[#9CA3AF] hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-[#656464] pt-4">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isUploading}
            className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
          >
            {isUploading ? "Fazendo Upload..." : "Cancelar"}
          </Button>
          <Button 
            onClick={uploadFiles}
            disabled={files.length === 0 || isUploading}
            className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
          >
            {isUploading ? "Enviando..." : `Upload (${files.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}