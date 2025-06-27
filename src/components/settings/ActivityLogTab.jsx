import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Activity, 
  Search, 
  Filter,
  Calendar,
  User,
  Plus,
  Edit,
  Trash2,
  Archive,
  RotateCcw,
  Eye,
  Download
} from "lucide-react";

// Dados simulados de log de atividades
const mockActivityLog = [
  {
    id: '1',
    action: 'create',
    resource_type: 'activity',
    resource_name: 'Reunião de Planejamento',
    user_name: 'João Silva',
    user_email: 'joao@empresa.com',
    timestamp: '2024-01-20T14:30:00Z',
    details: 'Criou nova atividade no workflow "Processo de Vendas"',
    company_name: 'Empresa Principal'
  },
  {
    id: '2',
    action: 'edit',
    resource_type: 'workflow',
    resource_name: 'Processo de Vendas Q4',
    user_name: 'Maria Santos',
    user_email: 'maria@empresa.com',
    timestamp: '2024-01-20T13:15:00Z',
    details: 'Atualizou configurações do workflow e adicionou nova fase',
    company_name: 'Empresa Principal'
  },
  {
    id: '3',
    action: 'delete',
    resource_type: 'template',
    resource_name: 'Modelo de Follow-up Antigo',
    user_name: 'Admin Sistema',
    user_email: 'admin@empresa.com',
    timestamp: '2024-01-20T11:45:00Z',
    details: 'Excluiu modelo de atividade obsoleto',
    company_name: 'Filial São Paulo'
  },
  {
    id: '4',
    action: 'archive',
    resource_type: 'playbook',
    resource_name: 'Playbook de Onboarding v1',
    user_name: 'Pedro Costa',
    user_email: 'pedro@empresa.com',
    timestamp: '2024-01-20T10:20:00Z',
    details: 'Arquivou playbook desatualizado',
    company_name: 'Empresa Principal'
  },
  {
    id: '5',
    action: 'invite',
    resource_type: 'user',
    resource_name: 'Ana Oliveira',
    user_name: 'João Silva',
    user_email: 'joao@empresa.com',
    timestamp: '2024-01-20T09:30:00Z',
    details: 'Convidou novo usuário para a equipe comercial',
    company_name: 'Empresa Principal'
  },
  {
    id: '6',
    action: 'restore',
    resource_type: 'activity',
    resource_name: 'Tarefa de Prospecção',
    user_name: 'Maria Santos',
    user_email: 'maria@empresa.com',
    timestamp: '2024-01-19T16:45:00Z',
    details: 'Restaurou atividade do arquivo',
    company_name: 'Filial São Paulo'
  }
];

const actionConfig = {
  create: {
    name: 'Criação',
    icon: Plus,
    color: 'bg-green-500/20 text-green-400 border-green-500/30'
  },
  edit: {
    name: 'Edição',
    icon: Edit,
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  delete: {
    name: 'Exclusão',
    icon: Trash2,
    color: 'bg-red-500/20 text-red-400 border-red-500/30'
  },
  archive: {
    name: 'Arquivar',
    icon: Archive,
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  },
  restore: {
    name: 'Restaurar',
    icon: RotateCcw,
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  },
  invite: {
    name: 'Convite',
    icon: User,
    color: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
  },
  view: {
    name: 'Visualização',
    icon: Eye,
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
};

const resourceTypeConfig = {
  activity: 'Atividade',
  workflow: 'Workflow',
  template: 'Modelo',
  playbook: 'Playbook',
  user: 'Usuário',
  company: 'Empresa'
};

export default function ActivityLogTab({ user }) {
  const [activityLog, setActivityLog] = useState(mockActivityLog);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterResource, setFilterResource] = useState("all");
  const [filterUser, setFilterUser] = useState("all");
  const [dateRange, setDateRange] = useState("7_days");
  const [isLoading, setIsLoading] = useState(false);

  const filteredLog = activityLog
    .filter(entry => {
      const matchesSearch = 
        entry.resource_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.user_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAction = filterAction === "all" || entry.action === filterAction;
      const matchesResource = filterResource === "all" || entry.resource_type === filterResource;
      const matchesUser = filterUser === "all" || entry.user_email === filterUser;
      
      // Filtro de data
      const entryDate = new Date(entry.timestamp);
      const now = new Date();
      let matchesDate = true;
      
      switch (dateRange) {
        case '1_day':
          matchesDate = (now - entryDate) / (1000 * 60 * 60 * 24) <= 1;
          break;
        case '7_days':
          matchesDate = (now - entryDate) / (1000 * 60 * 60 * 24) <= 7;
          break;
        case '30_days':
          matchesDate = (now - entryDate) / (1000 * 60 * 60 * 24) <= 30;
          break;
        case '90_days':
          matchesDate = (now - entryDate) / (1000 * 60 * 60 * 24) <= 90;
          break;
        default:
          matchesDate = true;
      }
      
      return matchesSearch && matchesAction && matchesResource && matchesUser && matchesDate;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const getActionInfo = (action) => {
    return actionConfig[action] || actionConfig.view;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `há ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `há ${Math.floor(diffInHours)} h`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const handleExportLog = async () => {
    setIsLoading(true);
    try {
      // Simular exportação
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Log exportado com sucesso');
    } catch (error) {
      console.error('Erro ao exportar log:', error);
    }
    setIsLoading(false);
  };

  const uniqueUsers = [...new Set(activityLog.map(entry => ({ email: entry.user_email, name: entry.user_name })))];

  return (
    <div className="space-y-6">
      {/* Filtros e Controles */}
      <Card className="bg-[#1C1C1C] border-[#656464]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#D9D9D9] flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Log de Atividades ({filteredLog.length})
            </CardTitle>
            
            <Button
              onClick={handleExportLog}
              disabled={isLoading}
              variant="outline"
              className="border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
            >
              <Download className="w-4 h-4 mr-2" />
              {isLoading ? 'Exportando...' : 'Exportar'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
              <Input
                placeholder="Buscar no log..."  
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#131313] border-[#656464] text-[#D9D9D9]"
              />
            </div>
            
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                <SelectItem value="all">Todas as ações</SelectItem>
                <SelectItem value="create">Criação</SelectItem>
                <SelectItem value="edit">Edição</SelectItem>
                <SelectItem value="delete">Exclusão</SelectItem>
                <SelectItem value="archive">Arquivar</SelectItem>
                <SelectItem value="restore">Restaurar</SelectItem>
                <SelectItem value="invite">Convite</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterResource} onValueChange={setFilterResource}>
              <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                <SelectValue placeholder="Recurso" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                <SelectItem value="all">Todos os recursos</SelectItem>
                <SelectItem value="activity">Atividades</SelectItem>
                <SelectItem value="workflow">Workflows</SelectItem>
                <SelectItem value="template">Modelos</SelectItem>
                <SelectItem value="playbook">Playbooks</SelectItem>
                <SelectItem value="user">Usuários</SelectItem>
                <SelectItem value="company">Empresas</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                <SelectValue placeholder="Usuario" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                <SelectItem value="all">Todos os usuários</SelectItem>
                {uniqueUsers.map(u => (
                  <SelectItem key={u.email} value={u.email}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                <SelectItem value="1_day">Último dia</SelectItem>
                <SelectItem value="7_days">Últimos 7 dias</SelectItem>
                <SelectItem value="30_days">Últimos 30 dias</SelectItem>
                <SelectItem value="90_days">Últimos 90 dias</SelectItem>
                <SelectItem value="all">Todo o período</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timeline do Log */}
      {filteredLog.length === 0 ? (
        <Card className="bg-[#1C1C1C] border-[#656464]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="w-12 h-12 text-[#9CA3AF] mb-4" />
            <h3 className="text-lg font-medium text-[#D9D9D9] mb-2">
              Nenhuma atividade encontrada
            </h3>
            <p className="text-[#9CA3AF] text-center">
              Tente ajustar os filtros para ver mais resultados
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLog.map((entry, index) => {
            const actionInfo = getActionInfo(entry.action);
            const ActionIcon = actionInfo.icon;
            const isToday = new Date(entry.timestamp).toDateString() === new Date().toDateString();
            
            return (
              <Card key={entry.id} className="bg-[#1C1C1C] border-[#656464] hover:border-[#E50F5F]/30 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Timeline Line */}
                    <div className="flex flex-col items-center">
                      <div className={`p-2 rounded-full ${actionInfo.color.split(' ')[0]}/40`}>
                        <ActionIcon className="w-4 h-4 text-[#E50F5F]" />
                      </div>
                      {index < filteredLog.length - 1 && (
                        <div className="w-px h-8 bg-[#656464] mt-2" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={actionInfo.color}>
                            {actionInfo.name}
                          </Badge>
                          <Badge variant="outline" className="border-[#656464] text-[#9CA3AF] text-xs">
                            {resourceTypeConfig[entry.resource_type]}
                          </Badge>
                          {isToday && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                              Hoje
                            </Badge>
                          )}
                        </div>
                        
                        <span className="text-xs text-[#656464]">
                          {formatDate(entry.timestamp)}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <h4 className="font-medium text-[#D9D9D9] mb-1">
                          {entry.resource_name}
                        </h4>
                        <p className="text-sm text-[#9CA3AF]">
                          {entry.details}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6 bg-[#E50F5F]">
                            <AvatarFallback className="bg-[#E50F5F] text-white text-xs">
                              {entry.user_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-[#9CA3AF]">
                            {entry.user_name}
                          </span>
                        </div>
                        
                        <span className="text-xs text-[#656464]">
                          {entry.company_name}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Informações Adicionais */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
              <Activity className="w-3 h-3 text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-blue-200 mb-1">Sobre o Log de Atividades</h4>
              <p className="text-sm text-blue-200/80 mb-2">
                O log registra todas as ações importantes realizadas na plataforma pelos usuários.
              </p>
              <ul className="text-xs text-blue-200/70 space-y-1">
                <li>• Logs são mantidos por 90 dias automaticamente</li>
                <li>• Você pode exportar os dados para análise externa</li>
                <li>• Apenas usuários com permissão podem ver logs de outras pessoas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}