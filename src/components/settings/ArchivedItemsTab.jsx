import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Archive, 
  Search, 
  RotateCcw, 
  Trash2, 
  Activity,
  FileText,
  BookOpen,
  Building2,
  Users,
  Calendar
} from "lucide-react";

// Dados simulados de itens arquivados
const mockArchivedItems = [
  {
    id: '1',
    type: 'workflow',
    name: 'Processo de Vendas Q3',
    description: 'Workflow para vendas do terceiro trimestre',
    archived_date: '2024-01-15T10:30:00Z',
    archived_by: 'admin@empresa.com',
    company_id: 'comp1',
    company_name: 'Empresa Principal'
  },
  {
    id: '2',
    type: 'activity',
    name: 'Reunião de Alinhamento Semanal',
    description: 'Atividade de alinhamento da equipe comercial',
    archived_date: '2024-01-10T14:20:00Z',
    archived_by: 'lider@empresa.com',
    company_id: 'comp1',
    company_name: 'Empresa Principal'
  },
  {
    id: '3',
    type: 'template',
    name: 'Modelo de Follow-up',
    description: 'Template para seguimento de clientes',
    archived_date: '2024-01-08T09:15:00Z',
    archived_by: 'admin@empresa.com',
    company_id: 'comp2',
    company_name: 'Filial São Paulo'
  },
  {
    id: '4',
    type: 'playbook',
    name: 'Playbook de Onboarding',
    description: 'Processo completo de integração de novos clientes',
    archived_date: '2024-01-05T16:45:00Z',
    archived_by: 'admin@empresa.com',
    company_id: 'comp1',
    company_name: 'Empresa Principal'
  }
];

const itemTypeConfig = {
  workflow: {
    name: 'Workflow',
    icon: Activity,
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  activity: {
    name: 'Atividade',
    icon: Activity,
    color: 'bg-green-500/20 text-green-400 border-green-500/30'
  },
  template: {
    name: 'Modelo',
    icon: FileText,
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  },
  playbook: {
    name: 'Playbook',
    icon: BookOpen,
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  },
  company: {
    name: 'Empresa',
    icon: Building2,
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  },
  user: {
    name: 'Usuário',
    icon: Users,
    color: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
  }
};

export default function ArchivedItemsTab() {
  const [archivedItems, setArchivedItems] = useState(mockArchivedItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCompany, setFilterCompany] = useState("all");
  const [sortBy, setSortBy] = useState("archived_date");
  const [isLoading, setIsLoading] = useState(false);

  const filteredItems = archivedItems
    .filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === "all" || item.type === filterType;
      const matchesCompany = filterCompany === "all" || item.company_id === filterCompany;
      
      return matchesSearch && matchesType && matchesCompany;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'archived_date':
        default:
          return new Date(b.archived_date) - new Date(a.archived_date);
      }
    });

  const handleRestore = async (itemId) => {
    if (window.confirm('Tem certeza que deseja restaurar este item?')) {
      setIsLoading(true);
      try {
        // Simular restauração
        await new Promise(resolve => setTimeout(resolve, 1000));
        setArchivedItems(prev => prev.filter(item => item.id !== itemId));
      } catch (error) {
        console.error('Erro ao restaurar item:', error);
      }
      setIsLoading(false);
    }
  };

  const handlePermanentDelete = async (itemId) => {
    if (window.confirm('⚠️ ATENÇÃO: Esta ação é irreversível!\n\nTem certeza que deseja excluir permanentemente este item?')) {
      setIsLoading(true);
      try {
        // Simular exclusão permanente
        await new Promise(resolve => setTimeout(resolve, 1000));
        setArchivedItems(prev => prev.filter(item => item.id !== itemId));
      } catch (error) {
        console.error('Erro ao excluir item permanentemente:', error);
      }
      setIsLoading(false);
    }
  };

  const getItemTypeInfo = (type) => {
    return itemTypeConfig[type] || itemTypeConfig.activity;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Filtros e Controles */}
      <Card className="bg-[#1C1C1C] border-[#656464]">
        <CardHeader>
          <CardTitle className="text-[#D9D9D9] flex items-center gap-2">
            <Archive className="w-5 h-5" />
            Itens Arquivados ({filteredItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
              <Input
                placeholder="Buscar itens arquivados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#131313] border-[#656464] text-[#D9D9D9]"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="workflow">Workflows</SelectItem>
                <SelectItem value="activity">Atividades</SelectItem>
                <SelectItem value="template">Modelos</SelectItem>
                <SelectItem value="playbook">Playbooks</SelectItem>
                <SelectItem value="company">Empresas</SelectItem>
                <SelectItem value="user">Usuários</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                <SelectValue placeholder="Filtrar por empresa" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                <SelectItem value="all">Todas as empresas</SelectItem>
                <SelectItem value="comp1">Empresa Principal</SelectItem>
                <SelectItem value="comp2">Filial São Paulo</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                <SelectItem value="archived_date">Data de arquivamento</SelectItem>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="type">Tipo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Itens Arquivados */}
      {filteredItems.length === 0 ? (
        <Card className="bg-[#1C1C1C] border-[#656464]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Archive className="w-12 h-12 text-[#9CA3AF] mb-4" />
            <h3 className="text-lg font-medium text-[#D9D9D9] mb-2">
              {searchTerm || filterType !== "all" || filterCompany !== "all" 
                ? "Nenhum item encontrado" 
                : "Nenhum item arquivado"
              }
            </h3>
            <p className="text-[#9CA3AF] text-center">
              {searchTerm || filterType !== "all" || filterCompany !== "all"
                ? "Tente ajustar os filtros de busca"
                : "Os itens arquivados aparecerão aqui"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const typeInfo = getItemTypeInfo(item.type);
            const TypeIcon = typeInfo.icon;
            
            return (
              <Card key={item.id} className="bg-[#1C1C1C] border-[#656464] hover:border-[#E50F5F]/50 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-[#131313] rounded-lg border border-[#656464]">
                        <TypeIcon className="w-5 h-5 text-[#9CA3AF]" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-[#D9D9D9] truncate">
                            {item.name}
                          </h3>
                          <Badge className={typeInfo.color}>
                            {typeInfo.name}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-[#9CA3AF] mb-3 line-clamp-2">
                          {item.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-[#656464]">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Arquivado em {formatDate(item.archived_date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>por {item.archived_by}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            <span>{item.company_name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(item.id)}
                        disabled={isLoading}
                        className="bg-green-500/10 border-green-500/50 text-green-400 hover:bg-green-500/20"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Restaurar
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePermanentDelete(item.id)}
                        disabled={isLoading}
                        className="bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Aviso sobre exclusão permanente */}
      {filteredItems.length > 0 && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center mt-0.5">
                <span className="text-amber-400 text-xs font-bold">!</span>
              </div>
              <div>
                <h4 className="font-medium text-amber-200 mb-1">Atenção</h4>
                <p className="text-sm text-amber-200/80">
                  Itens restaurados voltarão ao seu estado original. 
                  A exclusão permanente não pode ser desfeita.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}