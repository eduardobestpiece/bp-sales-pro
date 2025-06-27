import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Edit, Archive, Calendar, CheckSquare, Play } from 'lucide-react';

export default function TemplateList({ 
  templates, 
  isLoading, 
  onRefresh, 
  searchTerm, 
  users, 
  onEdit, 
  onArchive,
  onUse,
  selectedItems = [],
  onSelectionChange
}) {
  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectionChange(filteredTemplates.map(t => t.id));
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

  const isAllSelected = filteredTemplates.length > 0 && filteredTemplates.every(t => selectedItems.includes(t.id));
  const isPartialSelected = selectedItems.length > 0 && !isAllSelected;

  if (isLoading) {
    return <div className="text-center py-8 text-[#9CA3AF]">Carregando modelos...</div>;
  }

  if (filteredTemplates.length === 0) {
    return (
      <Card className="bg-[#1C1C1C] border-[#656464]">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="w-12 h-12 text-[#9CA3AF] mb-4" />
          <h3 className="text-lg font-medium text-[#D9D9D9] mb-2">Nenhum modelo encontrado</h3>
          <p className="text-[#9CA3AF] text-center mb-4">
            {searchTerm ? 'Tente uma busca diferente.' : 'Crie seu primeiro modelo de atividade para usar nos playbooks.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1C1C1C] border-[#656464]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#D9D9D9]">Modelos ({filteredTemplates.length})</CardTitle>
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
        <div className="space-y-2">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="flex items-center justify-between p-3 bg-[#131313] rounded-lg border border-[#656464] hover:border-[#E50F5F]/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Checkbox
                  checked={selectedItems.includes(template.id)}
                  onCheckedChange={(checked, event) => handleSelectItem(template.id, checked, event)}
                  className="border-[#E50F5F] data-[state=checked]:bg-[#E50F5F] flex-shrink-0"
                />
                
                <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-[#D9D9D9] truncate text-sm">{template.name}</h3>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-[#9CA3AF] flex-wrap">
                    <span className="truncate">{template.description || 'Sem descrição'}</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{template.days_to_complete || 1} dia(s)</span>
                    </div>
                    {template.checklist?.length > 0 && (
                      <div className="flex items-center gap-1">
                        <CheckSquare className="w-3 h-3" />
                        <span>{template.checklist.length} tarefa(s)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onEdit(template)}
                  className="text-[#9CA3AF] hover:text-[#E50F5F] hover:bg-[#E50F5F]/20 h-8 px-2 text-xs"
                >
                  <Edit className="w-4 h-4 lg:mr-1" />
                  <span className="hidden lg:inline">Editar</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onUse([template])}
                  className="text-[#9CA3AF] hover:text-[#E50F5F] hover:bg-[#E50F5F]/20 h-8 px-2 text-xs"
                >
                  <Play className="w-4 h-4 lg:mr-1" />
                  <span className="hidden lg:inline">Usar</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onArchive(template)}
                  className="text-[#9CA3AF] hover:text-orange-500 hover:bg-orange-500/20 h-8 px-2 text-xs"
                >
                  <Archive className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}