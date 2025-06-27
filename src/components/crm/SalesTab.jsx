
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Edit, Trash2, Users, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sale } from "@/api/entities";
import { Lead } from "@/api/entities";
import { User } from "@/api/entities";
import { format } from "date-fns";

export default function SalesTab({ selectedCompanyId }) {
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (selectedCompanyId) {
        loadSalesData();
    }
  }, [selectedCompanyId]);

  const loadSalesData = async () => {
    setIsLoading(true);
    try {
      const [allSales, leadsData, usersData] = await Promise.all([
        Sale.list("-created_date"),
        Lead.list(),
        User.list()
      ]);

      const leadsMap = new Map(leadsData.map(l => [l.id, l]));
      const usersMap = new Map(usersData.map(u => [u.id, u.full_name]));

      const salesForCompany = allSales.filter(sale => {
          const lead = leadsMap.get(sale.lead_id);
          return lead && lead.company_id === selectedCompanyId;
      });

      const populatedSales = salesForCompany.map(sale => ({
        ...sale,
        lead_name: leadsMap.get(sale.lead_id)?.name || 'Lead Desconhecido',
        assigned_name: usersMap.get(sale.assigned_to) || 'Usuário Desconhecido',
      }));
      setSales(populatedSales);
      
      const clientsMap = new Map();
      salesForCompany.forEach(sale => {
        const lead = leadsMap.get(sale.lead_id);
        if (lead) {
          if (!clientsMap.has(lead.id)) {
            clientsMap.set(lead.id, {
              ...lead,
              totalValue: 0,
              totalProfit: 0,
              salesCount: 0
            });
          }
          const client = clientsMap.get(lead.id);
          client.totalValue += sale.value || 0;
          client.totalProfit += sale.profit || 0;
          client.salesCount += 1;
        }
      });
      
      setClients(Array.from(clientsMap.values()));
    } catch (error) {
      console.error("Erro ao carregar dados de vendas:", error);
    }
    setIsLoading(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Button
          className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Venda
        </Button>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[#1C1C1C] border border-[#656464]">
          <TabsTrigger 
            value="sales" 
            className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white"
          >
            Vendas
          </TabsTrigger>
          <TabsTrigger 
            value="clients" 
            className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white"
          >
            Clientes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-6">
          <Card className="bg-[#1C1C1C] border-[#656464]">
            <CardHeader>
              <CardTitle className="text-[#D9D9D9]">Vendas ({sales.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8 text-[#9CA3AF]">
                    Carregando vendas...
                  </div>
                ) : sales.length === 0 ? (
                  <div className="text-center py-8 text-[#9CA3AF]">
                    Nenhuma venda encontrada
                  </div>
                ) : (
                  sales.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between p-4 bg-[#131313] rounded-lg border border-[#656464] hover:border-[#E50F5F]/50 transition-colors"
                    >
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm flex-1">
                        <div>
                          <span className="text-[#9CA3AF]">Data:</span>
                          <div className="flex items-center gap-1 text-[#D9D9D9]">
                            <Calendar className="w-4 h-4" />
                            {formatDate(sale.sale_date)}
                          </div>
                        </div>
                        <div>
                          <span className="text-[#9CA3AF]">Valor:</span>
                          <div className="text-[#D9D9D9] font-semibold">
                            {formatCurrency(sale.value)}
                          </div>
                        </div>
                        <div>
                          <span className="text-[#9CA3AF]">Lucro:</span>
                          <div className="text-green-400 font-semibold">
                            {formatCurrency(sale.profit)}
                          </div>
                        </div>
                        <div>
                          <span className="text-[#9CA3AF]">Cliente:</span>
                          <div className="text-[#D9D9D9]">
                            {sale.lead_name}
                          </div>
                        </div>
                        <div>
                          <span className="text-[#9CA3AF]">Responsável:</span>
                          <div className="text-[#D9D9D9]">
                            {sale.assigned_name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[#9CA3AF] hover:text-[#E50F5F]"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[#9CA3AF] hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="mt-6">
          <Card className="bg-[#1C1C1C] border-[#656464]">
            <CardHeader>
              <CardTitle className="text-[#D9D9D9]">Clientes ({clients.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8 text-[#9CA3AF]">
                    Carregando clientes...
                  </div>
                ) : clients.length === 0 ? (
                  <div className="text-center py-8 text-[#9CA3AF]">
                    Nenhum cliente encontrado
                  </div>
                ) : (
                  clients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-4 bg-[#131313] rounded-lg border border-[#656464] hover:border-[#E50F5F]/50 transition-colors"
                    >
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2 text-sm flex-1">
                        <div>
                          <span className="text-[#9CA3AF] block">Nome:</span>
                          <div className="text-[#D9D9D9] font-medium">
                            {client.name}
                          </div>
                        </div>
                        <div>
                            <span className="text-[#9CA3AF] block">Contato:</span>
                            <div className="flex flex-col">
                                <span className="text-[#D9D9D9] flex items-center gap-1"><Mail className="w-3 h-3"/>{client.email}</span>
                                <span className="text-[#D9D9D9] flex items-center gap-1"><Phone className="w-3 h-3"/>{client.phone}</span>
                            </div>
                        </div>
                        <div>
                          <span className="text-[#9CA3AF] block">Valor Total:</span>
                          <div className="text-[#D9D9D9] font-semibold">
                            {formatCurrency(client.totalValue)}
                          </div>
                        </div>
                        <div>
                          <span className="text-[#9CA3AF] block">Lucro Total:</span>
                          <div className="text-green-400 font-semibold">
                            {formatCurrency(client.totalProfit)}
                          </div>
                        </div>
                      </div>

                      <div className="text-center ml-6">
                        <div className="text-2xl font-bold text-[#E50F5F]">{client.salesCount}</div>
                        <div className="text-sm text-[#9CA3AF]">venda(s)</div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#9CA3AF] hover:text-[#E50F5F] ml-6"
                      >
                        <Users className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
