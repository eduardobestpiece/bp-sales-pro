
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  FileText,
  Edit,
  Trash2,
  Copy,
  BarChart3
} from "lucide-react";
import { Form } from "@/api/entities";
import FormEditorModal from "../components/forms/FormEditorModal";
import FormResponsesModal from "../components/forms/FormResponsesModal";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function Forms() {
  const [forms, setForms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [selectedFormForResponses, setSelectedFormForResponses] = useState(null);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setIsLoading(true);
    try {
      const formsData = await Form.list("-created_date");
      setForms(formsData);
    } catch (error) {
      console.error("Erro ao carregar formulários:", error);
    }
    setIsLoading(false);
  };

  const handleOpenEditor = (form = null) => {
    setSelectedForm(form);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setSelectedForm(null);
    loadForms();
  };

  const handleOpenResponses = (form) => {
    setSelectedFormForResponses(form);
    setShowResponsesModal(true);
  };

  const handleCloseResponses = () => {
    setShowResponsesModal(false);
    setSelectedFormForResponses(null);
  };

  const handleCopyForm = async (form) => {
    try {
      const newForm = {
        ...form,
        title: `${form.title} (Cópia)`,
        status: "draft",
        responses_count: 0
      };
      delete newForm.id;
      await Form.create(newForm);
      loadForms();
    } catch (error) {
      console.error("Erro ao copiar formulário:", error);
    }
  };

  const handleDeleteForm = async (formId) => {
    if (window.confirm("Tem certeza que deseja excluir este formulário?")) {
      try {
        await Form.delete(formId);
        loadForms();
      } catch (error) {
        console.error("Erro ao excluir formulário:", error);
      }
    }
  };

  const filteredForms = forms.filter(form =>
    form.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#131313] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#D9D9D9]">Formulários</h1>
            <p className="text-[#9CA3AF] mt-1">Crie e gerencie formulários personalizados</p>
          </div>
          
          <Button 
            onClick={() => handleOpenEditor()}
            className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Formulário
          </Button>
        </div>

        {/* Busca */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
            <Input
              placeholder="Buscar formulários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
            />
          </div>
        </div>

        {/* Lista de Formulários */}
        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            <div className="text-center py-8 text-[#9CA3AF]">
              Carregando formulários...
            </div>
          ) : filteredForms.length === 0 ? (
            <Card className="bg-[#1C1C1C] border-[#656464]">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-[#9CA3AF] mb-4" />
                <h3 className="text-lg font-medium text-[#D9D9D9] mb-2">Nenhum formulário encontrado</h3>
                <p className="text-[#9CA3AF] text-center mb-4">
                  {searchTerm ? "Tente uma busca diferente" : "Crie seu primeiro formulário para começar a captar leads"}
                </p>
                <Button
                  onClick={() => handleOpenEditor()}
                  className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Formulário
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredForms.map((form) => (
              <Card key={form.id} className="bg-[#1C1C1C] border-[#656464] hover:border-[#E50F5F]/50 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl text-[#D9D9D9] truncate">{form.title}</CardTitle>
                      <p className="text-[#9CA3AF] mt-1 truncate">{form.description || 'Sem descrição'}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-[#9CA3AF]">
                          {form.fields?.length || 0} campos
                        </span>
                        <span className="text-sm text-[#9CA3AF]">
                          {form.responses_count || 0} respostas
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      {form.is_public && (
                        <Link to={createPageUrl(`ViewForm?id=${form.id}`)} target="_blank">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:text-[#D9D9D9] hover:border-[#E50F5F]/80 bg-[#1C1C1C]"
                          >
                            Ver
                          </Button>
                        </Link>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:text-[#D9D9D9] hover:border-[#E50F5F]/80 bg-[#1C1C1C]"
                        onClick={() => handleOpenResponses(form)}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Respostas
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:text-[#D9D9D9] hover:border-[#E50F5F]/80 bg-[#1C1C1C]"
                        onClick={() => handleOpenEditor(form)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button 
                        variant="ghost"
                        size="icon"
                        className="text-[#9CA3AF] hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => handleDeleteForm(form.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>

        {/* Modal Editor */}
        {isEditorOpen && (
          <FormEditorModal 
            form={selectedForm}
            open={isEditorOpen}
            onClose={handleCloseEditor}
          />
        )}

        {/* Modal Respostas */}
        {showResponsesModal && (
          <FormResponsesModal
            form={selectedFormForResponses}
            open={showResponsesModal}
            onClose={handleCloseResponses}
          />
        )}
      </div>
    </div>
  );
}
