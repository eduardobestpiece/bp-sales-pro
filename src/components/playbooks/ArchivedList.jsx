import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Archive, Eye, RotateCcw, Trash2, BookOpen, FileText } from 'lucide-react';

export default function ArchivedList({ 
  items, 
  isLoading, 
  searchTerm, 
  onRestore, 
  onDelete, 
  onEdit 
}) {
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="text-center py-8 text-[#9CA3AF]">Carregando itens arquivados...</div>;
  }

  if (filteredItems.length === 0) {
    return (
      <Card className="bg-[#1C1C1C] border-[#656464]">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Archive className="w-12 h-12 text-[#9CA3AF] mb-4" />
          <h3 className="text-lg font-medium text-[#D9D9D9] mb-2">Nenhum item arquivado</h3>
          <p className="text-[#9CA3AF] text-center mb-4">
            {searchTerm ? 'Tente uma busca diferente.' : 'Itens arquivados aparecerão aqui.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1C1C1C] border-[#656464]">
      <CardHeader>
        <CardTitle className="text-[#D9D9D9]">Itens Arquivados ({filteredItems.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filteredItems.map(item => (
            <div
              key={`${item.type}-${item.id}`}
              className="flex items-center justify-between p-3 bg-[#131313] rounded-lg border border-[#656464] hover:border-[#E50F5F]/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0"></div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-[#D9D9D9] truncate text-sm">{item.name}</h3>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        item.type === 'playbook' 
                          ? 'border-[#E50F5F] text-[#E50F5F]' 
                          : 'border-blue-500 text-blue-400'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {item.type === 'playbook' ? <BookOpen className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                        {item.type === 'playbook' ? 'Playbook' : 'Modelo'}
                      </div>
                    </Badge>
                  </div>
                  <p className="text-xs text-[#9CA3AF] truncate">
                    {item.description || 'Sem descrição'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onEdit(item)}
                  className="text-[#9CA3AF] hover:text-[#E50F5F] hover:bg-[#E50F5F]/20 h-8 px-2 text-xs"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Visualizar
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onRestore(item)}
                  className="text-[#9CA3AF] hover:text-green-500 hover:bg-green-500/20 h-8 px-2 text-xs"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Resgatar
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onDelete(item)}
                  className="text-[#9CA3AF] hover:text-red-500 hover:bg-red-500/20 h-8 px-2 text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}