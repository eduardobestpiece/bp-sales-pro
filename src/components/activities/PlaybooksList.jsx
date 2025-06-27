
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Plus, 
  Play, 
  Archive, 
  Clock, 
  BookOpen,
  CheckSquare,
  Layers
} from "lucide-react";
import { Playbook } from "@/api/entities";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import CreatePlaybookModal from "./CreatePlaybookModal";
import UsePlaybookModal from "./UsePlaybookModal";
import ArchivePlaybookModal from "./ArchivePlaybookModal";

export default function PlaybooksList({ 
  playbooks, 
  templates,
  onRefresh, 
  companies, 
  users, 
  workflows,
  selectedCompanyId 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlaybookIds, setSelectedPlaybookIds] = useState([]);
  const [sortBy, setSortBy] = useState("name");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUseModal, setShowUseModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [editingPlaybook, setEditingPlaybook] = useState(null);
  const [usingPlaybook, setUsingPlaybook] = useState(null);
  const [archivingPlaybook, setArchivingPlaybook] = useState(null);

  const getTotalActivities = (playbook) => {
    return playbook.blocks?.reduce((total, block) => total + (block.steps?.length || 0), 0) || 0;
  };

  const getEstimatedDays = (playbook) => {
    if (!playbook.blocks) return 0;
    return playbook.blocks.reduce((total, block) => {
      return total + block.steps.reduce((stepTotal, step) => {
        const template = templates.find(t => t.id === step.template_id);
        return stepTotal + (template?.days_to_complete || 1);
      }, 0);
    }, 0);
  };

  const filteredPlaybooks = playbooks
    .filter(playbook => 
      playbook.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCompanyId === 'all' || playbook.company_id === selectedCompanyId)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "activities":
          return (getTotalActivities(b) - getTotalActivities(a));
        case "created":
          return new Date(b.created_date) - new Date(a.created_date);
        default:
          return 0;
      }
    });

  const handleCardClick = (e, playbook) => {
    // Se Ctrl ou Cmd estiver pressionado, só fazer seleção múltipla
    if (e.ctrlKey || e.metaKey) {
      handlePlaybookClick(e, playbook.id);
      return;
    }
    
    setEditingPlaybook(playbook);
    setShowCreateModal(true);
  };

  const handlePlaybookClick = (e, playbookId) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedPlaybookIds(prev => 
        prev.includes(playbookId) 
          ? prev.filter(id => id !== playbookId)
          : [...prev, playbookId]
      );
    }
  };

  const handleUse = (e, playbook) => {
    e.stopPropagation();
    setUsingPlaybook(playbook);
    setShowUseModal(true);
  };

  const handleArchive = (e, playbook) => {
    e.stopPropagation();
    setArchivingPlaybook(playbook);
    setShowArchiveModal(true);
  };

  const handleBulkAction = async (action) => {
    try {
      if (action === "archive") {
        console.log("Arquivar playbooks:", selectedPlaybookIds);
        // Additional bulk archive logic would go here, e.g., API call
      } 
      setSelectedPlaybookIds([]);
    } catch (error) {
      console.error("Erro na ação em massa:", error);
    }
  };

  const getCompanyName = (companyId) => {
    return companies.find(c => c.id === companyId)?.name || 'Empresa não encontrada';
  };

  return (
    <div className="space-y-6">
      {/* Filtros e Controles */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
            <Input
              placeholder="Buscar playbooks por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="activities">Nº de Atividades</SelectItem>
              <SelectItem value="created">Data de criação</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => {
            setEditingPlaybook(null);
            setShowCreateModal(true);
          }}
          className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Playbook
        </Button>
      </div>

      {/* Ações em Massa - Só mostra se mais de 1 item selecionado */}
      {selectedPlaybookIds.length > 0 && (
        <div className="p-4 bg-[#1C1C1C] border border-[#E50F5F] rounded-lg flex items-center justify-between">
          <span className="text-[#D9D9D9] font-medium">
            {selectedPlaybookIds.length} playbook(s) selecionado(s)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("archive")}
              className="border-orange-500 text-orange-400 hover:bg-orange-500/20"
            >
              <Archive className="w-4 h-4 mr-2" />
              Arquivar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPlaybookIds([])}
              className="text-[#9CA3AF] hover:text-[#D9D9D9]"
            >
              Limpar
            </Button>
          </div>
        </div>
      )}

      {/* Lista de Playbooks */}
      <Card className="bg-[#1C1C1C] border-[#656464]">
        <CardHeader>
          <CardTitle className="text-[#D9D9D9] flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Playbooks ({filteredPlaybooks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPlaybooks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#D9D9D9] mb-2">
                {searchTerm ? "Nenhum playbook encontrado" : "Nenhum playbook criado"}
              </h3>
              <p className="text-[#9CA3AF] mb-4">
                {searchTerm 
                  ? "Tente uma busca diferente" 
                  : "Crie seu primeiro playbook para automatizar fluxos de trabalho"
                }
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => {
                    setEditingPlaybook(null);
                    setShowCreateModal(true);
                  }}
                  className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Playbook
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPlaybooks.map((playbook) => (
                <div
                  key={playbook.id}
                  onClick={(e) => handleCardClick(e, playbook)}
                  className={`flex items-center justify-between p-4 bg-[#131313] rounded-lg border cursor-pointer transition-all ${
                    selectedPlaybookIds.includes(playbook.id)
                      ? 'border-[#E50F5F] bg-[#E50F5F]/5'
                      : 'border-[#656464] hover:border-[#E50F5F]/50'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Checkbox
                      checked={selectedPlaybookIds.includes(playbook.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPlaybookIds(prev => [...prev, playbook.id]);
                        } else {
                          setSelectedPlaybookIds(prev => prev.filter(id => id !== playbook.id));
                        }
                      }}
                      className="border-[#656464] data-[state=checked]:bg-[#E50F5F] data-[state=checked]:border-[#E50F5F]"
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-[#D9D9D9]">{playbook.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-[#656464] text-[#9CA3AF] flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            {playbook.blocks?.length || 0} blocos
                          </Badge>
                          <Badge variant="outline" className="border-[#656464] text-[#9CA3AF] flex items-center gap-1">
                            <CheckSquare className="w-3 h-3" />
                            {getTotalActivities(playbook)} atividades
                          </Badge>
                          <Badge variant="outline" className="border-[#656464] text-[#9CA3AF] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            ~{getEstimatedDays(playbook)} dias
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-[#9CA3AF] line-clamp-2 mb-2">
                        {playbook.description || 'Sem descrição'}
                      </p>
                      
                      {/* Blocos do Playbook */}
                      {playbook.blocks && playbook.blocks.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {playbook.blocks.slice(0, 3).map((block, index) => (
                            <span
                              key={index}
                              className="text-xs bg-[#E50F5F]/10 text-[#E50F5F] px-2 py-1 rounded"
                            >
                              {block.name} ({block.steps?.length || 0})
                            </span>
                          ))}
                          {playbook.blocks.length > 3 && (
                            <span className="text-xs bg-[#656464]/20 text-[#9CA3AF] px-2 py-1 rounded">
                              +{playbook.blocks.length - 3} mais
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-[#656464]">
                        <span>Empresa: {getCompanyName(playbook.company_id)}</span>
                        <span>•</span>
                        <span>Criado em {new Date(playbook.created_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleUse(e, playbook)}
                      className="bg-[#E50F5F]/10 border-[#E50F5F] text-[#E50F5F] hover:bg-[#E50F5F]/20 h-8"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Iniciar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleArchive(e, playbook)}
                      className="bg-[#1C1C1C] border-orange-500/50 text-orange-400 hover:bg-orange-500/20 h-8"
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modais */}
      <CreatePlaybookModal
        playbook={editingPlaybook}
        templates={templates}
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingPlaybook(null);
        }}
        onSuccess={onRefresh}
        selectedCompanyId={selectedCompanyId}
      />

      <UsePlaybookModal
        playbook={usingPlaybook}
        templates={templates}
        open={showUseModal}
        onClose={() => {
          setShowUseModal(false);
          setUsingPlaybook(null);
        }}
        onSuccess={onRefresh}
        users={users}
        workflows={workflows}
        companies={companies}
        selectedCompanyId={selectedCompanyId}
      />

      <ArchivePlaybookModal
        open={showArchiveModal}
        onClose={() => {
          setShowArchiveModal(false);
          setArchivingPlaybook(null);
        }}
        onConfirm={() => {
          // Implementar arquivamento
          // e.g., await Playbook.archive(archivingPlaybook.id);
          setShowArchiveModal(false);
          setArchivingPlaybook(null);
          onRefresh(); // Refresh list after archiving
        }}
        itemName={archivingPlaybook?.name}
        itemType="playbook"
      />
    </div>
  );
}
