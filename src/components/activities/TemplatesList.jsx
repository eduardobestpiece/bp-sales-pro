
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Plus,
  Archive,
  ChevronDown,
  ChevronRight,
  Play, // Added Play icon import
} from "lucide-react";
import { ActivityTemplate } from "@/api/entities"; // Keeping for type reference if needed, although not directly used in JSX

import ActivityModal from "./ActivityModal";
import UseTemplateModal from "./UseTemplateModal";
import ArchiveTemplateModal from "./ArchiveTemplateModal";

export default function TemplatesList({
  templates = [],
  onRefresh,
  companies = [],
  users = [],
  workflows = [],
  selectedCompanyId
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showUseModal, setShowUseModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [usingTemplate, setUsingTemplate] = useState(null);
  const [archivingTemplate, setArchivingTemplate] = useState(null);
  const [expandedTemplateId, setExpandedTemplateId] = useState(null); // New state to manage expanded template

  const filteredTemplates = (templates || [])
    .filter(template =>
      template.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCompanyId === 'all' || template.company_id === selectedCompanyId)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "days":
          return (a.days_to_complete || 0) - (b.days_to_complete || 0);
        case "created":
          return new Date(b.created_date) - new Date(a.created_date);
        default:
          return 0;
      }
    });

  // Removed: groupTemplatesByCompany and groupedTemplates are no longer used as grouping is removed.

  // Simplified handleCardClick: Only handles opening the editing modal, multi-selection is removed.
  const handleCardClick = (template) => {
    setEditingTemplate(template);
    setShowTemplateModal(true);
  };

  // Removed: handleTemplateClick, handleUse, handleArchive, handleBulkAction, toggleSection, renderTemplateItem.
  // Their functionalities are now either removed or handled directly inline within the JSX.

  return (
    <div className="space-y-4"> {/* Changed from space-y-6 */}
      {/* Filtros e Controles */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
            <Input
              placeholder="Buscar modelos por nome..."
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
              <SelectItem value="days">Prazo (dias)</SelectItem>
              <SelectItem value="created">Data de criação</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => {
            setEditingTemplate(null);
            setShowTemplateModal(true);
          }}
          className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Modelo
        </Button>
      </div>

      {/* Ações em Massa section removed as multi-selection is no longer implemented */}

      {/* Lista de Modelos - Entire structure re-worked */}
      <div className="bg-[#1C1C1C] border border-[#656464] rounded-lg p-2 space-y-1">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-8 text-[#9CA3AF]">
            {searchTerm ? "Nenhum modelo encontrado" : "Nenhum modelo cadastrado"}
          </div>
        ) : (
          filteredTemplates.map((template) => {
            const isExpanded = expandedTemplateId === template.id;
            return (
              <div key={template.id} className="bg-[#131313] rounded-lg border border-[#3a3a3a]">
                <div
                  className="flex items-center p-3 cursor-pointer"
                  onClick={() => handleCardClick(template)} // Simplified click handler
                >
                  <div className="flex-1 flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the parent div's onClick from firing
                        setExpandedTemplateId(prev => prev === template.id ? null : template.id);
                      }}
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
                    </Button>
                    <div className="flex-1">
                        <p className="font-medium text-[#D9D9D9]">{template.name}</p>
                        <p className="text-sm text-[#9CA3AF] line-clamp-1">{template.description || 'Sem descrição'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the parent div's onClick from firing
                        setUsingTemplate(template);
                        setShowUseModal(true); // Show modal directly
                      }}
                      className="bg-[#E50F5F]/10 border-[#E50F5F] text-[#E50F5F] hover:bg-[#E50F5F]/20 h-8"
                    >
                      <Play className="w-4 h-4 mr-1" /> {/* Added Play icon */}
                      Usar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the parent div's onClick from firing
                        setArchivingTemplate(template);
                        setShowArchiveModal(true); // Show modal directly
                      }}
                      className="text-[#9CA3AF] hover:text-[#E50F5F]"
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {isExpanded && template.checklist && template.checklist.length > 0 && (
                  <div className="pl-16 pr-4 pb-3">
                    <p className="text-xs text-[#9CA3AF] mb-1">Checklist:</p>
                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                      {template.checklist.map((item, index) => <li key={item.id || index}>{item.item}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modais - Keep as is */}
      <ActivityModal
        activity={editingTemplate}
        open={showTemplateModal}
        onClose={() => {
          setShowTemplateModal(false);
          setEditingTemplate(null);
        }}
        onSuccess={onRefresh}
        users={users}
        workflows={workflows}
        selectedCompany={selectedCompanyId}
        isTemplateMode={true}
      />

      <UseTemplateModal
        template={usingTemplate}
        open={showUseModal}
        onClose={() => {
          setShowUseModal(false);
          setUsingTemplate(null);
        }}
        onSuccess={onRefresh}
        users={users}
        workflows={workflows}
        companies={companies}
        selectedCompanyId={selectedCompanyId}
      />

      <ArchiveTemplateModal
        open={showArchiveModal}
        onClose={() => {
          setShowArchiveModal(false);
          setArchivingTemplate(null);
        }}
        onConfirm={() => {
          console.log("Archiving template:", archivingTemplate?.id);
          setShowArchiveModal(false);
          setArchivingTemplate(null);
          onRefresh();
        }}
        itemName={archivingTemplate?.name}
        itemType="modelo"
      />
    </div>
  );
}
