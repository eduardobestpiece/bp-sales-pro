
import React, { useState, useEffect, useContext } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target,
  Plus,
  Calendar,
  BarChart3,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle,
  Timer
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity } from "@/api/entities";
import { User } from "@/api/entities";
import { Workflow } from "@/api/entities"; // Importar Workflow
import { CompanyContext } from "@/components/contexts/CompanyContext";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ActivityModal from "@/components/activities/ActivityModal"; // Corrigindo o caminho do import

export default function Dashboard() {
  const { selectedCompanyId } = useContext(CompanyContext);
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]); // Adicionar estado para usuários
  const [workflows, setWorkflows] = useState([]); // Adicionar estado para workflows
  const [dateFilter, setDateFilter] = useState("today");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [selectedCompanyId, dateFilter]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [currentUser, allActivities, allUsers, allWorkflows] = await Promise.all([
        User.me(),
        Activity.list("-due_date"),
        User.list(),
        Workflow.list()
      ]);
      
      setUser(currentUser);
      setUsers(allUsers);
      setWorkflows(allWorkflows);
      
      // Filtrar atividades por empresa selecionada
      const filteredActivities = selectedCompanyId === 'all' 
        ? allActivities 
        : allActivities.filter(a => a.company_id === selectedCompanyId);
      
      setActivities(filteredActivities);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    }
    setIsLoading(false);
  };

  // Funções para categorizar atividades
  const getCompletedActivities = () => {
    return activities.filter(a => a.status === 'completed');
  };

  const getTodayActivities = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return activities.filter(a => {
      if (!a.due_date) return false;
      const dueDate = new Date(a.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });
  };

  const getOverdueActivities = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return activities.filter(a => {
      if (!a.due_date || a.status === 'completed') return false;
      const dueDate = new Date(a.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    });
  };

  const getFutureActivities = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return activities.filter(a => {
      if (!a.due_date || a.status === 'completed') return false;
      const dueDate = new Date(a.due_date);
      return dueDate > today;
    });
  };

  const MetricCard = ({ title, count, icon: Icon, color, onClick }) => (
    <Card 
      className={`bg-[#1C1C1C] border-[#656464] hover:border-[#E50F5F]/50 transition-all cursor-pointer ${
        color === 'green' ? 'hover:bg-green-500/5' :
        color === 'blue' ? 'hover:bg-blue-500/5' :
        color === 'red' ? 'hover:bg-red-500/5' :
        'hover:bg-purple-500/5'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#9CA3AF] text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-[#D9D9D9] mt-1">{count}</p>
          </div>
          <div className={`p-2 rounded-lg ${
            color === 'green' ? 'bg-green-500/20' :
            color === 'blue' ? 'bg-blue-500/20' :
            color === 'red' ? 'bg-red-500/20' :
            'bg-purple-500/20'
          }`}>
            <Icon className={`w-5 h-5 ${
              color === 'green' ? 'text-green-500' :
              color === 'blue' ? 'text-blue-500' :
              color === 'red' ? 'text-red-500' :
              'text-purple-500'
            }`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ActivityItem = ({ activity, onClick }) => (
    <div 
      className="flex items-center justify-between p-3 bg-[#131313] rounded-lg border border-[#656464] hover:border-[#E50F5F]/50 transition-colors cursor-pointer"
      onClick={() => onClick(activity)}
    >
      <div className="flex-1">
        <h4 className="font-medium text-[#D9D9D9] text-sm">{activity.title}</h4>
        <p className="text-xs text-[#9CA3AF] mt-1">
          {activity.due_date && new Date(activity.due_date).toLocaleDateString('pt-BR')}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {activity.priority === 'high' && (
          <AlertTriangle className="w-4 h-4 text-red-500" />
        )}
        {activity.priority === 'medium' && (
          <Clock className="w-4 h-4 text-yellow-500" />
        )}
        {activity.priority === 'low' && (
          <Timer className="w-4 h-4 text-blue-500" />
        )}
      </div>
    </div>
  );

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    setShowActivityModal(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#131313] p-4 lg:p-6">
      <div className="w-full max-w-none mx-auto space-y-6">
        {/* Seção 1 - Saudação e Filtros */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#D9D9D9]">
                Seja bem-vindo, {user?.full_name?.split(' ')[0] || 'Usuário'}! 👋
              </h1>
              <p className="text-[#9CA3AF] mt-1">Aqui está o resumo das suas atividades</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] w-48">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mês</SelectItem>
                  <SelectItem value="all">Todos os Períodos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard
              title="Atividades Concluídas"
              count={getCompletedActivities().length}
              icon={CheckCircle}
              color="green"
              onClick={() => {/* Filtrar por concluídas */}}
            />
            <MetricCard
              title="Vencem Hoje"
              count={getTodayActivities().length}
              icon={Clock}
              color="blue"
              onClick={() => {/* Filtrar por hoje */}}
            />
            <MetricCard
              title="Atrasadas"
              count={getOverdueActivities().length}
              icon={AlertTriangle}
              color="red"
              onClick={() => {/* Filtrar por atrasadas */}}
            />
            <MetricCard
              title="Futuras"
              count={getFutureActivities().length}
              icon={Timer}
              color="purple"
              onClick={() => {/* Filtrar por futuras */}}
            />
          </div>
        </div>

        {/* Seção 2 - Duas Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna Esquerda - Atividades Atrasadas */}
          <Card className="bg-[#1C1C1C] border-[#656464]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#D9D9D9] flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Atividades Atrasadas
                </CardTitle>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  {getOverdueActivities().length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {getOverdueActivities().length === 0 ? (
                <p className="text-[#9CA3AF] text-center py-4">
                  🎉 Nenhuma atividade atrasada!
                </p>
              ) : (
                <>
                  {getOverdueActivities().slice(0, 5).map(activity => (
                    <ActivityItem 
                      key={activity.id} 
                      activity={activity} 
                      onClick={handleActivityClick}
                    />
                  ))}
                  {getOverdueActivities().length > 5 && (
                    <Link to={createPageUrl("Activities")}>
                      <Button variant="outline" className="w-full mt-3 border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:border-[#E50F5F]">
                        Ver todas ({getOverdueActivities().length - 5} restantes)
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Coluna Direita - Atividades de Hoje */}
          <Card className="bg-[#1C1C1C] border-[#656464]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#D9D9D9] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Atividades de Hoje
                </CardTitle>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {getTodayActivities().length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {getTodayActivities().length === 0 ? (
                <p className="text-[#9CA3AF] text-center py-4">
                  📅 Nenhuma atividade programada para hoje
                </p>
              ) : (
                <>
                  {getTodayActivities().slice(0, 5).map(activity => (
                    <ActivityItem 
                      key={activity.id} 
                      activity={activity} 
                      onClick={handleActivityClick}
                    />
                  ))}
                  {getTodayActivities().length > 5 && (
                    <Link to={createPageUrl("Activities")}>
                      <Button variant="outline" className="w-full mt-3 border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:border-[#E50F5F]">
                        Ver todas ({getTodayActivities().length - 5} restantes)
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Botão de Ação Principal */}
        <div className="flex justify-center pt-4">
          <Link to={createPageUrl("Activities")}>
            <Button className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white px-8 py-3 text-lg">
              <Plus className="w-5 h-5 mr-2" />
              Gerenciar Todas as Atividades
            </Button>
          </Link>
        </div>
      </div>

      {/* Modal de Atividade */}
      {selectedActivity && (
        <ActivityModal
          activity={selectedActivity}
          open={showActivityModal}
          onClose={() => {
            setShowActivityModal(false);
            setSelectedActivity(null);
          }}
          onSuccess={() => {
            loadDashboardData();
            setShowActivityModal(false);
            setSelectedActivity(null);
          }}
          workflows={workflows}
          users={users}
        />
      )}
    </div>
  );
}
