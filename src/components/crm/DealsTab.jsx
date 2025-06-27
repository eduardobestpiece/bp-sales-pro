
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Target, Edit, Trash2, Kanban, List } from "lucide-react";
import { DragDropContext } from '@hello-pangea/dnd';
import { Deal } from "@/api/entities";
import { Lead } from "@/api/entities";
import FunnelColumn from "./FunnelColumn";

// Definição estática das fases do funil
const funnelStages = [
    { id: 1, name: 'Prospecção' },
    { id: 2, name: 'Qualificação' },
    { id: 3, name: 'Proposta' },
    { id: 4, name: 'Negociação' },
    { id: 5, name: 'Fechamento' },
];

export default function DealsTab({ selectedCompanyId }) {
  const [dealsByStage, setDealsByStage] = useState({});
  const [leadsMap, setLeadsMap] = useState(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' ou 'list'

  useEffect(() => {
    if (selectedCompanyId) {
        loadData();
    }
  }, [selectedCompanyId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allDeals, allLeads] = await Promise.all([
        Deal.list("-created_date"),
        Lead.list()
      ]);
      
      const leads = new Map(allLeads.map(lead => [lead.id, lead]));
      setLeadsMap(leads);

      // Filter deals by selected company (indirectly via leads)
      const dealsForCompany = allDeals.filter(deal => {
          const lead = leads.get(deal.lead_id);
          return lead && lead.company_id === selectedCompanyId;
      });

      // Agrupa os negócios por fase
      const groupedDeals = funnelStages.reduce((acc, stage) => {
        acc[stage.name] = dealsForCompany.filter(deal => deal.stage === stage.name);
        return acc;
      }, {});

      // Adiciona negócios sem fase definida à primeira coluna
      const dealsWithoutStage = dealsForCompany.filter(deal => !funnelStages.some(s => s.name === deal.stage));
      if(groupedDeals[funnelStages[0].name]){
        groupedDeals[funnelStages[0].name] = [...groupedDeals[funnelStages[0].name], ...dealsWithoutStage];
      }
      
      setDealsByStage(groupedDeals);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setIsLoading(false);
  };
  
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      return; // Não faz nada se o item for solto na mesma coluna
    }

    // Atualização otimista da UI
    const sourceStage = source.droppableId;
    const destStage = destination.droppableId;
    const dealToMove = dealsByStage[sourceStage].find(d => d.id === draggableId);

    const newSourceDeals = dealsByStage[sourceStage].filter(d => d.id !== draggableId);
    const newDestDeals = [...dealsByStage[destStage], { ...dealToMove, stage: destStage }];

    setDealsByStage({
      ...dealsByStage,
      [sourceStage]: newSourceDeals,
      [destStage]: newDestDeals,
    });
    
    // Atualização no backend
    try {
      await Deal.update(draggableId, { stage: destination.droppableId });
    } catch (error) {
      console.error("Erro ao atualizar negócio:", error);
      // Reverter a UI em caso de erro
      setDealsByStage(dealsByStage); 
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex gap-4">
          <Button
            className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Negócio
          </Button>
          <Button
            variant="outline"
            className="border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20"
          >
            <Target className="w-4 h-4 mr-2" />
            Criar Funil
          </Button>
        </div>
        <div>
          <Button variant="ghost" onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}>
            {viewMode === 'kanban' ? <List className="w-4 h-4 mr-2" /> : <Kanban className="w-4 h-4 mr-2" />}
            {viewMode === 'kanban' ? 'Ver como Lista' : 'Ver como Kanban'}
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center text-[#9CA3AF] py-10">Carregando negócios...</div>
      ) : viewMode === 'kanban' ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
            {funnelStages.map(stage => (
              <FunnelColumn 
                key={stage.id} 
                stage={stage} 
                deals={dealsByStage[stage.name] || []}
                leadsMap={leadsMap}
              />
            ))}
          </div>
        </DragDropContext>
      ) : (
        <div className="text-center text-[#9CA3AF] py-10">Visualização em lista em desenvolvimento.</div>
      )}
    </div>
  );
}
