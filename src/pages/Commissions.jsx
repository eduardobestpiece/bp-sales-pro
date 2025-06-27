import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  DollarSign,
  TrendingUp,
  Users,
  Calculator,
  Edit,
  Eye,
  Settings,
  UserCheck,
  Percent,
  Target,
  Award
} from "lucide-react";
import { CommissionRule } from "@/api/entities";
import { Commission } from "@/api/entities";
import { User } from "@/api/entities";

import CreateRuleModal from "../components/commissions/CreateRuleModal";
import CommissionHierarchy from "../components/commissions/CommissionHierarchy";
import CommissionReports from "../components/commissions/CommissionReports";

export default function Commissions() {
  const [rules, setRules] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [activeTab, setActiveTab] = useState("rules");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rulesData, commissionsData, usersData] = await Promise.all([
        CommissionRule.list("-created_date"),
        Commission.list("-created_date"),
        User.list()
      ]);
      setRules(rulesData);
      setCommissions(commissionsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setIsLoading(false);
  };

  const handleCreateRule = () => {
    setShowCreateRule(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTypeIcon = (type) => {
    const icons = {
      percentage: Percent,
      fixed: DollarSign,
      tiered: TrendingUp,
      bonus: Award
    };
    return icons[type] || DollarSign;
  };

  const getTypeLabel = (type) => {
    const labels = {
      percentage: "Percentual",
      fixed: "Valor Fixo", 
      tiered: "Escalonada",
      bonus: "Bônus"
    };
    return labels[type] || type;
  };

  const filteredRules = rules.filter(rule =>
    rule.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#131313] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#D9D9D9]">Comissionamentos</h1>
            <p className="text-[#9CA3AF] mt-1">Gerencie regras de comissão e hierarquia multinível</p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calcular Comissões
            </Button>
            <Button 
              onClick={handleCreateRule}
              className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Regra
            </Button>
          </div>
        </div>

        {/* Busca e Filtros */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
            />
          </div>
          <Button
            variant="outline"
            className="border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#1C1C1C] border border-[#656464]">
            <TabsTrigger 
              value="rules" 
              className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Regras
            </TabsTrigger>
            <TabsTrigger 
              value="hierarchy" 
              className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Hierarquia
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="mt-6">
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8 text-[#9CA3AF]">
                  Carregando regras...
                </div>
              ) : filteredRules.length === 0 ? (
                <Card className="bg-[#1C1C1C] border-[#656464]">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <DollarSign className="w-12 h-12 text-[#9CA3AF] mb-4" />
                    <h3 className="text-lg font-medium text-[#D9D9D9] mb-2">Nenhuma regra encontrada</h3>
                    <p className="text-[#9CA3AF] text-center mb-4">
                      {searchTerm ? "Tente uma busca diferente" : "Crie sua primeira regra de comissão"}
                    </p>
                    <Button 
                      onClick={handleCreateRule}
                      className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeira Regra
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredRules.map((rule) => {
                    const TypeIcon = getTypeIcon(rule.type);
                    return (
                      <Card key={rule.id} className="bg-[#1C1C1C] border-[#656464] hover:border-[#E50F5F]/50 transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-[#E50F5F]/20 rounded-lg">
                                <TypeIcon className="w-6 h-6 text-[#E50F5F]" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-[#D9D9D9] text-lg">{rule.name}</h3>
                                <p className="text-[#9CA3AF] mt-1">
                                  {getTypeLabel(rule.type)} - {
                                    rule.type === 'percentage' 
                                      ? `${rule.value}%` 
                                      : formatCurrency(rule.value)
                                  }
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                  <Badge 
                                    variant="outline" 
                                    className={`${rule.active ? 'border-green-500 text-green-400' : 'border-gray-500 text-gray-400'}`}
                                  >
                                    {rule.active ? 'Ativa' : 'Inativa'}
                                  </Badge>
                                  <span className="text-sm text-[#9CA3AF]">
                                    {rule.applicable_to?.length || 0} usuário(s)
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="border-[#656464] text-[#D9D9D9]">
                                <Eye className="w-4 h-4 mr-2" />
                                Visualizar
                              </Button>
                              <Button variant="outline" size="sm" className="border-[#656464] text-[#D9D9D9]">
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="hierarchy" className="mt-6">
            <CommissionHierarchy 
              users={users}
              commissions={commissions}
              onRefresh={loadData}
            />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <CommissionReports 
              commissions={commissions}
              users={users}
              rules={rules}
            />
          </TabsContent>
        </Tabs>

        {/* Modal */}
        <CreateRuleModal 
          open={showCreateRule}
          onClose={() => setShowCreateRule(false)}
          onSuccess={loadData}
          users={users}
        />
      </div>
    </div>
  );
}