import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Book, Edit, Archive, Play, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PlaybookList({ 
  playbooks, 
  templates, 
  isLoading, 
  onRefresh, 
  searchTerm, 
  onEdit, 
  onArchive, 
  onUse,
  selectedItems = [],
  onSelectionChange
}) {
  const filteredPlaybooks = playbooks.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculatePlaybookStats = (playbook) => {
    if (!playbook.blocks || playbook.blocks.length === 0) {
      return { totalBlocks: 0, totalActivities: 0, totalDays: 0 };
    }

    let totalActivities = 0;
    let totalDays = 0;

    playbook.blocks.forEach(block => {
      if (block.steps && block.steps.length > 0) {
        totalActivities += block.steps.length;
        
        // Encontrar o maior prazo no bloco
        let maxBlockDays = 0;
        block.steps.forEach(step => {
          const template = templates.find(t => t.id === step.template_id);
          if (template && template.days_to_complete) {
            maxBlockDays = Math.max(maxBlockDays, template.days_to_complete);
          }
        });
        totalDays += maxBlockDays;
      }
    });

    return {
      totalBlocks: playbook.blocks.length,
      totalActivities,
      totalDays
    };
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectionChange(filteredPlaybooks.map(p => p.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (itemId, checked, event) => {
    if (event?.ctrlKey || event?.metaKey) {
      // Ctrl+Click para seleção múltipla
      if (checked) {
        onSelectionChange([...selectedItems, itemId]);
      } else {
        onSelectionChange(selectedItems.filter(id => id !== itemId));
      }
    } else {
      // Click normal
      if (checked) {
        onSelectionChange([...selectedItems, itemId]);
      } else {
        onSelectionChange(selectedItems.filter(id => id !== itemId));
      }
    }
  };

  const isAllSelected = filteredPlaybooks.length > 0 && filteredPlaybooks.every(p => selectedItems.includes(p.id));
  const isPartialSelected = selectedItems.length > 0 && !isAllSelected;

  if (isLoading) {
    return <div className="text-center py-8 text-[#9CA3AF]">Carregando playbooks...</div>;
  }

  if (filteredPlaybooks.length === 0) {
    return (
      <Card className="bg-[#1C1C1C] border-[#656464]">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Book className="w-12 h-12 text-[#9CA3AF] mb-4" />
          <h3 className="text-lg font-medium text-[#D9D9D9] mb-2">Nenhum playbook encontrado</h3>
          <p className="text-[#9CA3AF] text-center mb-4">
            {searchTerm ? 'Tente uma busca diferente.' : 'Crie seu primeiro playbook para começar a padronizar processos.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1C1C1C] border-[#656464]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#D9D9D9]">Playbooks ({filteredPlaybooks.length})</CardTitle>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
              className="border-[#E50F5F] data-[state=checked]:bg-[#E50F5F]"
              ref={(el) => {
                if (el) el.indeterminate = isPartialSelected;
              }}
            />
            <span className="text-sm text-[#9CA3AF] hidden sm:inline">Selecionar todos</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredPlaybooks.map(playbook => {
            const stats = calculatePlaybookStats(playbook);
            return (
              <div
                key={playbook.id}
                className="flex items-center gap-4 p-4 bg-[#131313] rounded-lg border border-[#656464] hover:border-[#E50F5F]/50 transition-colors"
              >
                <Checkbox
                  checked={selectedItems.includes(playbook.id)}
                  onCheckedChange={(checked, event) => handleSelectItem(playbook.id, checked, event)}
                  className="border-[#E50F5F] data-[state=checked]:bg-[#E50F5F] flex-shrink-0"
                />
                
                <div className="w-3 h-3 rounded-full bg-[#E50F5F] flex-shrink-0"></div>
                
                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
                  <div className="col-span-1 md:col-span-2 lg:col-span-1">
                    <h3 className="font-medium text-[#D9D9D9] truncate text-sm mb-1">{playbook.name}</h3>
                    <p className="text-xs text-[#9CA3AF] truncate">{playbook.description || 'Sem descrição'}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-[#9CA3AF]">
                    <div className="flex items-center gap-1">
                      <Book className="w-3 h-3" />
                      <span>{stats.totalBlocks} bloco(s)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-[#9CA3AF]">
                    <div className="flex items-center gap-1">
                      <span>{stats.totalActivities} atividade(s)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-[#9CA3AF]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{stats.totalDays} dia(s)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEdit(playbook)}
                    className="text-[#9CA3AF] hover:text-[#E50F5F] hover:bg-[#E50F5F]/20 h-8 px-2 text-xs"
                  >
                    <Edit className="w-4 h-4 lg:mr-1" />
                    <span className="hidden lg:inline">Editar</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onUse(playbook)}
                    className="text-[#9CA3AF] hover:text-[#E50F5F] hover:bg-[#E50F5F]/20 h-8 px-2 text-xs"
                  >
                    <Play className="w-4 h-4 lg:mr-1" />
                    <span className="hidden lg:inline">Usar</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onArchive(playbook)}
                    className="text-[#9CA3AF] hover:text-orange-500 hover:bg-orange-500/20 h-8 px-2 text-xs"
                  >
                    <Archive className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}