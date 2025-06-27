import React, { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FolderPlus, 
  Upload, 
  Search, 
  Grid3X3, 
  List, 
  Download,
  Share2,
  Trash2,
  File,
  Folder,
  ArrowLeft,
  MoreHorizontal,
  Eye
} from "lucide-react";
import { DriveFile } from "@/api/entities";
import { CompanyContext } from "@/components/contexts/CompanyContext";
import { UploadFile } from "@/api/integrations";

import CreateFolderModal from "../components/drive/CreateFolderModal";
import UploadFileModal from "../components/drive/UploadFileModal";
import FileListItem from "../components/drive/FileListItem";

export default function Drive() {
  const { selectedCompanyId, companies } = useContext(CompanyContext);
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUploadFile, setShowUploadFile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, [currentFolder, selectedCompanyId]);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const allFiles = await DriveFile.list("-created_date");
      
      // Filtrar por empresa e pasta atual
      const filteredFiles = allFiles.filter(file => {
        const companyMatch = selectedCompanyId === 'all' || file.company_id === selectedCompanyId;
        const folderMatch = file.parent_id === currentFolder?.id || (!file.parent_id && !currentFolder);
        return companyMatch && folderMatch;
      });
      
      setFiles(filteredFiles);
    } catch (error) {
      console.error("Erro ao carregar arquivos:", error);
    }
    setIsLoading(false);
  };

  const handleFolderClick = (folder) => {
    setCurrentFolder(folder);
    setBreadcrumb(prev => [...prev, folder]);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      // Voltar para raiz
      setCurrentFolder(null);
      setBreadcrumb([]);
    } else {
      const newBreadcrumb = breadcrumb.slice(0, index + 1);
      setBreadcrumb(newBreadcrumb);
      setCurrentFolder(newBreadcrumb[newBreadcrumb.length - 1] || null);
    }
  };

  const handleFileSelect = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      for (const fileId of selectedFiles) {
        await DriveFile.delete(fileId);
      }
      setSelectedFiles([]);
      loadFiles();
    } catch (error) {
      console.error("Erro ao excluir arquivos:", error);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const folders = filteredFiles.filter(f => f.type === 'folder');
  const filesList = filteredFiles.filter(f => f.type === 'file');

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('video')) return '🎥';
    if (fileType?.includes('audio')) return '🎵';
    if (fileType?.includes('text')) return '📝';
    return '📎';
  };

  return (
    <div className="min-h-screen bg-[#131313] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#D9D9D9]">Drive</h1>
            <p className="text-[#9CA3AF] mt-1">
              Gerencie seus arquivos e documentos
              {companies.find(c => c.id === selectedCompanyId)?.name && (
                <span className="ml-2 text-[#E50F5F]">• {companies.find(c => c.id === selectedCompanyId)?.name}</span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCreateFolder(true)}
              className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:border-[#E50F5F]"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Nova Pasta
            </Button>
            <Button
              onClick={() => setShowUploadFile(true)}
              className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {/* Controles */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBreadcrumbClick(-1)}
              className="text-[#9CA3AF] hover:text-[#E50F5F] p-1"
            >
              Drive
            </Button>
            {breadcrumb.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <span className="text-[#656464]">/</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBreadcrumbClick(index)}
                  className="text-[#9CA3AF] hover:text-[#E50F5F] p-1"
                >
                  {folder.name}
                </Button>
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
              <Input
                placeholder="Buscar arquivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] min-w-64"
              />
            </div>

            {/* Modo de Visualização */}
            <div className="flex border border-[#656464] rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`rounded-none ${viewMode === "grid" ? "bg-[#E50F5F] text-white" : "text-[#9CA3AF]"}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={`rounded-none ${viewMode === "list" ? "bg-[#E50F5F] text-white" : "text-[#9CA3AF]"}`}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Ações em Massa */}
        {selectedFiles.length > 0 && (
          <div className="p-4 bg-[#1C1C1C] border border-[#E50F5F] rounded-lg flex items-center justify-between">
            <span className="text-[#D9D9D9] font-medium">
              {selectedFiles.length} item(s) selecionado(s)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="border-red-500 text-red-400 hover:bg-red-500/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFiles([])}
                className="text-[#9CA3AF] hover:text-[#D9D9D9]"
              >
                Limpar Seleção
              </Button>
            </div>
          </div>
        )}

        {/* Lista de Arquivos */}
        <Card className="bg-[#1C1C1C] border-[#656464]">
          <CardHeader>
            <CardTitle className="text-[#D9D9D9] flex items-center justify-between">
              <span>
                {currentFolder ? `Pasta: ${currentFolder.name}` : 'Todos os Arquivos'}
                ({filteredFiles.length} itens)
              </span>
              {currentFolder && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBreadcrumbClick(-1)}
                  className="text-[#9CA3AF] hover:text-[#E50F5F]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-[#E50F5F] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-[#9CA3AF]">Carregando arquivos...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#D9D9D9] mb-2">
                  {searchTerm ? "Nenhum arquivo encontrado" : "Pasta vazia"}
                </h3>
                <p className="text-[#9CA3AF] mb-4">
                  {searchTerm 
                    ? "Tente uma busca diferente" 
                    : "Faça upload de arquivos ou crie uma nova pasta"
                  }
                </p>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" : "space-y-2"}>
                {/* Pastas primeiro */}
                {folders.map((folder) => (
                  <FileListItem
                    key={folder.id}
                    file={folder}
                    viewMode={viewMode}
                    isSelected={selectedFiles.includes(folder.id)}
                    onSelect={() => handleFileSelect(folder.id)}
                    onDoubleClick={() => handleFolderClick(folder)}
                    onRefresh={loadFiles}
                    formatFileSize={formatFileSize}
                  />
                ))}
                
                {/* Arquivos depois */}
                {filesList.map((file) => (
                  <FileListItem
                    key={file.id}
                    file={file}
                    viewMode={viewMode}
                    isSelected={selectedFiles.includes(file.id)}
                    onSelect={() => handleFileSelect(file.id)}
                    onRefresh={loadFiles}
                    formatFileSize={formatFileSize}
                    getFileIcon={getFileIcon}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modais */}
        <CreateFolderModal
          open={showCreateFolder}
          onClose={() => setShowCreateFolder(false)}
          onSuccess={loadFiles}
          parentFolder={currentFolder}
          selectedCompanyId={selectedCompanyId}
        />

        <UploadFileModal
          open={showUploadFile}
          onClose={() => setShowUploadFile(false)}
          onSuccess={loadFiles}
          parentFolder={currentFolder}
          selectedCompanyId={selectedCompanyId}
        />
      </div>
    </div>
  );
}