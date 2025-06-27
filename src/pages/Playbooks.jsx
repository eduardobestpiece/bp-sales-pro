import React, { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, BookOpen, FileText, Archive } from "lucide-react";
import { Playbook } from "@/api/entities";
import { ActivityTemplate } from "@/api/entities";
import { CompanyContext } from "@/components/contexts/CompanyContext";
import { User } from "@/api/entities";
import { Company } from "@/api/entities";

import PlaybookList from "../components/playbooks/PlaybookList";
import TemplateList from "../components/playbooks/TemplateList";
import ArchivedList from "../components/playbooks/ArchivedList";
import CreatePlaybookModal from "../components/playbooks/CreatePlaybookModal";
import ActivityModal from "../components/activities/ActivityModal";
import UsePlaybookModal from "../components/playbooks/UsePlaybookModal";
import UseTemplateModal from "../components/playbooks/UseTemplateModal";

export default function Playbooks() {
  const [activeTab, setActiveTab] = useState("playbooks");
  const [playbooks, setPlaybooks] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [archivedItems, setArchivedItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatePlaybook, setShowCreatePlaybook] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showEditPlaybook, setShowEditPlaybook] = useState(false);
  const [showEditTemplate, setShowEditTemplate] = useState(false);
  const [showUsePlaybook, setShowUsePlaybook] = useState(false);
  const [showUseTemplate, setShowUseTemplate] = useState(false);
  const [editingPlaybook, setEditingPlaybook] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [usingPlaybooks, setUsingPlaybooks] = useState([]);
  const [usingTemplates, setUsingTemplates] = useState([]);
  const [searchTermPlaybooks, setSearchTermPlaybooks] = useState("");
  const [searchTermTemplates, setSearchTermTemplates] = useState("");
  const [searchTermArchived, setSearchTermArchived] = useState("");
  
  // Seleção em massa
  const [selectedPlaybooks, setSelectedPlaybooks] = useState([]);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  
  const { selectedCompanyId } = useContext(CompanyContext);

  useEffect(() => {
    if (selectedCompanyId) {
      loadData();
    } else {
      setIsLoading(false);
      setPlaybooks([]);
      setTemplates([]);
      setArchivedItems([]);
    }
  }, [selectedCompanyId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [playbooksData, templatesData, usersData, currentUserData, companiesData] = await Promise.all([
        Playbook.list("-created_date"),
        ActivityTemplate.list("-created_date"),
        User.list(),
        User.me(),
        Company.list()
      ]);
      
      const companyFilter = p => selectedCompanyId === 'all' || p.company_id === selectedCompanyId;

      const filteredPlaybooks = playbooksData.filter(p => companyFilter(p) && !p.archived);
      const filteredTemplates = templatesData.filter(t => companyFilter(t) && !t.archived);
      
      // Itens arquivados (apenas para administradores)
      const archived = [
        ...playbooksData.filter(p => companyFilter(p) && p.archived).map(p => ({...p, type: 'playbook'})),
        ...templatesData.filter(t => companyFilter(t) && t.archived).map(t => ({...t, type: 'template'}))
      ];
      
      setPlaybooks(filteredPlaybooks);
      setTemplates(filteredTemplates);
      setArchivedItems(archived);
      setUsers(usersData);
      setCurrentUser(currentUserData);
      setCompanies(companiesData);
    } catch (error) {
      console.error("Erro ao carregar dados dos playbooks:", error);
    }
    setIsLoading(false);
  };

  const handleCreateTemplateSuccess = () => {
    setShowCreateTemplate(false);
    loadData();
  };

  const handleCreatePlaybookSuccess = () => {
    setShowCreatePlaybook(false);
    loadData();
  };

  const handleEditPlaybookSuccess = () => {
    setShowEditPlaybook(false);
    setEditingPlaybook(null);
    loadData();
  };

  const handleEditTemplateSuccess = () => {
    setShowEditTemplate(false);
    setEditingTemplate(null);
    loadData();
  };

  // Handlers para ações dos playbooks
  const handleEditPlaybook = (playbook) => {
    setEditingPlaybook(playbook);
    setShowEditPlaybook(true);
  };

  const handleArchivePlaybook = async (playbook) => {
    if (confirm(`Tem certeza que deseja arquivar o playbook "${playbook.name}"?`)) {
      try {
        const companyId = playbook.company_id || selectedCompanyId;
        if (!companyId) {
          throw new Error("Company ID não encontrado");
        }
        
        const updateData = {
          name: playbook.name,
          description: playbook.description || "",
          blocks: playbook.blocks || [],
          company_id: companyId,
          archived: true
        };
        
        await Playbook.update(playbook.id, updateData);
        loadData(); // Recarrega os dados para refletir o arquivamento
      } catch (error) {
        console.error("Erro ao arquivar playbook:", error);
        alert("Erro ao arquivar playbook: " + error.message);
      }
    }
  };

  const handleUsePlaybook = (playbook) => {
    if (Array.isArray(playbook)) {
      setUsingPlaybooks(playbook);
    } else {
      setUsingPlaybooks([playbook]);
    }
    setShowUsePlaybook(true);
  };

  // Handlers para ações dos templates
  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setShowEditTemplate(true);
  };

  const handleArchiveTemplate = async (template) => {
    if (confirm(`Tem certeza que deseja arquivar o template "${template.name}"?`)) {
      try {
        const companyId = template.company_id || selectedCompanyId;
        if (!companyId) {
          throw new Error("Company ID não encontrado");
        }
        
        const updateData = {
          name: template.name,
          description: template.description || "",
          checklist: template.checklist || [],
          days_to_complete: template.days_to_complete || 1,
          company_id: companyId,
          archived: true
        };
        
        await ActivityTemplate.update(template.id, updateData);
        loadData(); // Recarrega os dados para refletir o arquivamento
      } catch (error) {
        console.error("Erro ao arquivar template:", error);
        alert("Erro ao arquivar template: " + error.message);
      }
    }
  };

  const handleUseTemplate = (templates) => {
    setUsingTemplates(Array.isArray(templates) ? templates : [templates]);
    setShowUseTemplate(true);
  };

  // Handlers para ações em massa
  const handleBulkArchivePlaybooks = async () => {
    if (selectedPlaybooks.length === 0) return;
    if (confirm(`Tem certeza que deseja arquivar ${selectedPlaybooks.length} playbook(s)?`)) {
      try {
        for (const id of selectedPlaybooks) {
          const playbook = playbooks.find(p => p.id === id);
          if (playbook) {
            const companyId = playbook.company_id || selectedCompanyId;
            const updateData = {
              name: playbook.name,
              description: playbook.description || "",
              blocks: playbook.blocks || [],
              company_id: companyId,
              archived: true
            };
            await Playbook.update(id, updateData);
          }
        }
        setSelectedPlaybooks([]);
        loadData();
      } catch (error) {
        console.error("Erro ao arquivar playbooks:", error);
        alert("Erro ao arquivar playbooks: " + error.message);
      }
    }
  };

  const handleBulkUsePlaybooks = () => {
    if (selectedPlaybooks.length === 0) return;
    const selectedPlaybookObjects = playbooks.filter(p => selectedPlaybooks.includes(p.id));
    handleUsePlaybook(selectedPlaybookObjects);
  };

  const handleBulkArchiveTemplates = async () => {
    if (selectedTemplates.length === 0) return;
    if (confirm(`Tem certeza que deseja arquivar ${selectedTemplates.length} template(s)?`)) {
      try {
        for (const id of selectedTemplates) {
          const template = templates.find(t => t.id === id);
          if (template) {
            const companyId = template.company_id || selectedCompanyId;
            const updateData = {
              name: template.name,
              description: template.description || "",
              checklist: template.checklist || [],
              days_to_complete: template.days_to_complete || 1,
              company_id: companyId,
              archived: true
            };
            await ActivityTemplate.update(id, updateData);
          }
        }
        setSelectedTemplates([]);
        loadData();
      } catch (error) {
        console.error("Erro ao arquivar templates:", error);
        alert("Erro ao arquivar templates: " + error.message);
      }
    }
  };

  const handleBulkUseTemplates = () => {
    if (selectedTemplates.length === 0) return;
    const selectedTemplateObjects = templates.filter(t => selectedTemplates.includes(t.id));
    handleUseTemplate(selectedTemplateObjects);
  };

  // Handlers para itens arquivados
  const handleRestoreItem = async (item) => {
    try {
      const companyId = item.company_id || selectedCompanyId;
      
      if (item.type === 'playbook') {
        const updateData = {
          name: item.name,
          description: item.description || "",
          blocks: item.blocks || [],
          company_id: companyId,
          archived: false
        };
        await Playbook.update(item.id, updateData);
      } else {
        const updateData = {
          name: item.name,
          description: item.description || "",
          checklist: item.checklist || [],
          days_to_complete: item.days_to_complete || 1,
          company_id: companyId,
          archived: false
        };
        await ActivityTemplate.update(item.id, updateData);
      }
      loadData();
    } catch (error) {
      console.error("Erro ao restaurar item:", error);
      alert("Erro ao restaurar item: " + error.message);
    }
  };

  const handleDeleteItem = async (item) => {
    if (confirm(`Tem certeza que deseja excluir definitivamente "${item.name}"?`)) {
      try {
        if (item.type === 'playbook') {
          await Playbook.delete(item.id);
        } else {
          await ActivityTemplate.delete(item.id);
        }
        loadData();
      } catch (error) {
        console.error("Erro ao excluir item:", error);
        alert("Erro ao excluir item: " + error.message);
      }
    }
  };

  // Verificar se é administrador
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role_function === 'administrador';

  if (!selectedCompanyId) {
    return (
      <div className="min-h-screen bg-[#131313] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-[#D9D9D9] mb-4">Selecione uma empresa</h1>
            <p className="text-[#9CA3AF]">Escolha uma empresa no menu lateral para visualizar os playbooks.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131313] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#D9D9D9]">Playbooks</h1>
          <p className="text-[#9CA3AF] mt-1">Padronize seus processos e workflows</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'} bg-[#1C1C1C] border border-[#656464] h-auto`}>
            <TabsTrigger 
              value="playbooks" 
              className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white flex items-center gap-2 px-2 py-2 text-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Playbooks</span>
            </TabsTrigger>
            <TabsTrigger 
              value="models" 
              className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white flex items-center gap-2 px-2 py-2 text-sm"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Modelos</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger 
                value="archived" 
                className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white flex items-center gap-2 px-2 py-2 text-sm"
              >
                <Archive className="w-4 h-4" />
                <span className="hidden sm:inline">Arquivados</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="playbooks" className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
                <Input
                  placeholder="Buscar playbooks..."
                  value={searchTermPlaybooks}
                  onChange={(e) => setSearchTermPlaybooks(e.target.value)}
                  className="pl-10 bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] w-full"
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {selectedPlaybooks.length > 0 && (
                  <>
                    <Button
                      onClick={handleBulkUsePlaybooks}
                      className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white flex-1 sm:flex-none"
                    >
                      Usar ({selectedPlaybooks.length})
                    </Button>
                    <Button
                      onClick={handleBulkArchivePlaybooks}
                      className="bg-orange-600 hover:bg-orange-700 text-white flex-1 sm:flex-none"
                    >
                      Arquivar ({selectedPlaybooks.length})
                    </Button>
                  </>
                )}
                <Button 
                  onClick={() => setShowCreatePlaybook(true)}
                  className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white flex-1 sm:flex-none"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Criar Playbook</span>
                  <span className="sm:hidden">Criar</span>
                </Button>
              </div>
            </div>
            <PlaybookList 
              playbooks={playbooks} 
              templates={templates} 
              isLoading={isLoading} 
              onRefresh={loadData}
              searchTerm={searchTermPlaybooks}
              onEdit={handleEditPlaybook}
              onArchive={handleArchivePlaybook}
              onUse={handleUsePlaybook}
              selectedItems={selectedPlaybooks}
              onSelectionChange={setSelectedPlaybooks}
            />
          </TabsContent>

          <TabsContent value="models" className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
                <Input
                  placeholder="Buscar modelos..."
                  value={searchTermTemplates}
                  onChange={(e) => setSearchTermTemplates(e.target.value)}
                  className="pl-10 bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] w-full"
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {selectedTemplates.length > 0 && (
                  <>
                    <Button
                      onClick={handleBulkUseTemplates}
                      className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white flex-1 sm:flex-none"
                    >
                      Usar ({selectedTemplates.length})
                    </Button>
                    <Button
                      onClick={handleBulkArchiveTemplates}
                      className="bg-orange-600 hover:bg-orange-700 text-white flex-1 sm:flex-none"
                    >
                      Arquivar ({selectedTemplates.length})
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => setShowCreateTemplate(true)}
                  className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white flex-1 sm:flex-none"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Adicionar Modelo</span>
                  <span className="sm:hidden">Adicionar</span>
                </Button>
              </div>
            </div>
            <TemplateList 
              templates={templates} 
              isLoading={isLoading}
              onRefresh={loadData}
              searchTerm={searchTermTemplates}
              users={users}
              onEdit={handleEditTemplate}
              onArchive={handleArchiveTemplate}
              onUse={handleUseTemplate}
              selectedItems={selectedTemplates}
              onSelectionChange={setSelectedTemplates}
            />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="archived" className="mt-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative flex-1 w-full sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
                  <Input
                    placeholder="Buscar itens arquivados..."
                    value={searchTermArchived}
                    onChange={(e) => setSearchTermArchived(e.target.value)}
                    className="pl-10 bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] w-full"
                  />
                </div>
              </div>
              <ArchivedList 
                items={archivedItems}
                isLoading={isLoading}
                searchTerm={searchTermArchived}
                onRestore={handleRestoreItem}
                onDelete={handleDeleteItem}
                onEdit={(item) => {
                  if (item.type === 'playbook') {
                    handleEditPlaybook(item);
                  } else {
                    handleEditTemplate(item);
                  }
                }}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Modais */}
      <CreatePlaybookModal
        open={showCreatePlaybook}
        onClose={() => setShowCreatePlaybook(false)}
        onSuccess={handleCreatePlaybookSuccess}
        templates={templates}
        companyId={selectedCompanyId}
      />

      <CreatePlaybookModal
        open={showEditPlaybook}
        onClose={() => setShowEditPlaybook(false)}
        onSuccess={handleEditPlaybookSuccess}
        templates={templates}
        companyId={selectedCompanyId}
        playbook={editingPlaybook}
      />
      
      <ActivityModal
        activity={null}
        open={showCreateTemplate}
        onClose={() => setShowCreateTemplate(false)}
        onSuccess={handleCreateTemplateSuccess}
        users={users}
        isTemplateMode={true}
        selectedCompany={selectedCompanyId}
      />

      <ActivityModal
        activity={editingTemplate}
        open={showEditTemplate}
        onClose={() => setShowEditTemplate(false)}
        onSuccess={handleEditTemplateSuccess}
        users={users}
        isTemplateMode={true}
        selectedCompany={selectedCompanyId}
      />

      <UsePlaybookModal
        open={showUsePlaybook}
        onClose={() => setShowUsePlaybook(false)}
        playbooks={usingPlaybooks}
        companies={companies}
        templates={templates}
        onSuccess={() => {
          setShowUsePlaybook(false);
          setUsingPlaybooks([]);
        }}
      />

      <UseTemplateModal
        templates={usingTemplates}
        open={showUseTemplate}
        onClose={() => setShowUseTemplate(false)}
        companies={companies}
        onSuccess={() => {
          setShowUseTemplate(false);
          setUsingTemplates([]);
        }}
      />
    </div>
  );
}