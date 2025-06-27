
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const currencies = [
  { value: "BRL", label: "Real (BRL)" },
  { value: "USD", label: "Dólar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "Libra (GBP)" },
  { value: "JPY", label: "Iene (JPY)" },
  { value: "CAD", label: "Dólar Canadense (CAD)" },
  { value: "AUD", label: "Dólar Australiano (AUD)" },
  { value: "CHF", label: "Franco Suíço (CHF)" },
];

const aggregationTypes = [
  { value: "sum", label: "Soma" },
  { value: "count", label: "Contagem" },
  { value: "count_unique", label: "Contagem de diferentes" },
  { value: "average", label: "Média" },
  { value: "min", label: "Mínimo" },
  { value: "max", label: "Máximo" },
];

const calculationTypes = [
  { value: "add", label: "Somar" },
  { value: "subtract", label: "Subtrair" },
  { value: "multiply", label: "Multiplicar" },
  { value: "divide", label: "Dividir" },
];

export default function MetricsModal({ open, onClose }) {
  const [metrics, setMetrics] = useState({
    investimento: { 
      spreadsheet: "", 
      column: "", // Already defined in state, but missing in UI
      aggregation: "sum", 
      currency: "BRL",
      enabled: false 
    },
    leads: { 
      spreadsheet: "", 
      column: "", // Already defined in state, but missing in UI
      aggregation: "count",
      enabled: false 
    },
    vendas: { 
      spreadsheet: "", 
      column: "", // Already defined in state, but missing in UI
      aggregation: "count",
      enabled: false 
    },
    faturamento: { 
      spreadsheet: "", 
      column: "", // Already defined in state, but missing in UI
      aggregation: "sum", 
      currency: "BRL",
      enabled: false 
    }
  });

  const [customMetrics, setCustomMetrics] = useState([]);
  const [newCustomMetric, setNewCustomMetric] = useState({
    name: "",
    spreadsheet: "",
    column: "",
    aggregation: "sum",
    type: "number",
    currency: "BRL"
  });

  const [calculatedMetrics, setCalculatedMetrics] = useState([]);
  const [newCalculatedMetric, setNewCalculatedMetric] = useState({
    name: "",
    metric1: "",
    operation: "add",
    metric2: "",
    type: "number",
    currency: "BRL"
  });

  const handleSave = () => {
    console.log("Salvando métricas:", {
      metrics,
      customMetrics,
      calculatedMetrics
    });
    onClose();
  };

  const addCustomMetric = () => {
    if (newCustomMetric.name && newCustomMetric.spreadsheet && newCustomMetric.column) {
      setCustomMetrics([...customMetrics, { ...newCustomMetric, id: Date.now() }]);
      setNewCustomMetric({
        name: "",
        spreadsheet: "",
        column: "",
        aggregation: "sum",
        type: "number",
        currency: "BRL"
      });
    }
  };

  const addCalculatedMetric = () => {
    if (newCalculatedMetric.name && newCalculatedMetric.metric1 && newCalculatedMetric.metric2) {
      setCalculatedMetrics([...calculatedMetrics, { ...newCalculatedMetric, id: Date.now() }]);
      setNewCalculatedMetric({
        name: "",
        metric1: "",
        operation: "add",
        metric2: "",
        type: "number",
        currency: "BRL"
      });
    }
  };

  // Helper to get display names for main metrics
  const getMetricDisplayName = (key) => {
    switch (key) {
      case 'investimento': return 'Investimento em Anúncios';
      case 'leads': return 'Leads';
      case 'vendas': return 'Vendas';
      case 'faturamento': return 'Faturamento';
      default: return key; // Fallback for custom metrics if needed
    }
  };

  const availableMetrics = [
    ...Object.keys(metrics).filter(key => metrics[key].enabled).map(key => ({
      value: key,
      label: getMetricDisplayName(key)
    })),
    ...customMetrics.map(m => ({
      value: m.name, // Custom metric name as value and label
      label: m.name
    }))
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#E50F5F]">Associar Dados</DialogTitle>
          <p className="text-[#9CA3AF]">Configure as métricas do seu dashboard conectando dados das suas planilhas</p>
        </DialogHeader>

        <Tabs defaultValue="main-metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#131313] border border-[#656464]">
            <TabsTrigger 
              value="main-metrics" 
              className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white text-[#D9D9D9] hover:text-[#E50F5F]"
            >
              Métricas Principais
            </TabsTrigger>
            <TabsTrigger 
              value="custom-metrics" 
              className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white text-[#D9D9D9] hover:text-[#E50F5F]"
            >
              Métricas Personalizadas
            </TabsTrigger>
            <TabsTrigger 
              value="calculated-metrics" 
              className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white text-[#D9D9D9] hover:text-[#E50F5F]"
            >
              Métricas Calculadas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="main-metrics" className="space-y-6 mt-6">
            {/* Investimento em Anúncios */}
            <Card className="bg-[#131313] border-[#656464]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#D9D9D9] flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#E50F5F] rounded-full"></div>
                    Investimento em Anúncios
                  </CardTitle>
                  <Switch
                    checked={metrics.investimento.enabled}
                    onCheckedChange={(checked) => setMetrics({
                      ...metrics,
                      investimento: { ...metrics.investimento, enabled: checked }
                    })}
                  />
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4"> {/* Changed to md:grid-cols-4 */}
                <div>
                  <Label className="text-[#9CA3AF]">Planilha</Label>
                  <Select 
                    value={metrics.investimento.spreadsheet}
                    onValueChange={(value) => setMetrics({
                      ...metrics,
                      investimento: { ...metrics.investimento, spreadsheet: value }
                    })}
                  >
                    <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                      <SelectValue placeholder="Selecione a planilha" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="vendas">Vendas</SelectItem>
                      <SelectItem value="leads">Leads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Added Column Field */}
                <div>
                  <Label className="text-[#9CA3AF]">Coluna</Label>
                  <Select 
                    value={metrics.investimento.column}
                    onValueChange={(value) => setMetrics({
                      ...metrics,
                      investimento: { ...metrics.investimento, column: value }
                    })}
                  >
                    <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                      <SelectValue placeholder="Selecione a coluna" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                      <SelectItem value="valor">Valor</SelectItem>
                      <SelectItem value="custo">Custo</SelectItem>
                      <SelectItem value="quantidade">Quantidade</SelectItem>
                      <SelectItem value="id">ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#9CA3AF]">Tipo de Captação</Label>
                  <Select 
                    value={metrics.investimento.aggregation}
                    onValueChange={(value) => setMetrics({
                      ...metrics,
                      investimento: { ...metrics.investimento, aggregation: value }
                    })}
                  >
                    <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                      <SelectItem value="sum">Soma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#9CA3AF]">Moeda</Label>
                  <Select 
                    value={metrics.investimento.currency}
                    onValueChange={(value) => setMetrics({
                      ...metrics,
                      investimento: { ...metrics.investimento, currency: value }
                    })}
                  >
                    <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                      {currencies.map(currency => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Leads */}
            <Card className="bg-[#131313] border-[#656464]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#D9D9D9] flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    Leads
                  </CardTitle>
                  <Switch
                    checked={metrics.leads.enabled}
                    onCheckedChange={(checked) => setMetrics({
                      ...metrics,
                      leads: { ...metrics.leads, enabled: checked }
                    })}
                  />
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Changed to md:grid-cols-3 */}
                <div>
                  <Label className="text-[#9CA3AF]">Planilha</Label>
                  <Select 
                    value={metrics.leads.spreadsheet}
                    onValueChange={(value) => setMetrics({
                      ...metrics,
                      leads: { ...metrics.leads, spreadsheet: value }
                    })}
                  >
                    <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                      <SelectValue placeholder="Selecione a planilha" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                      <SelectItem value="leads">Leads</SelectItem>
                      <SelectItem value="contatos">Contatos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Added Column Field */}
                <div>
                  <Label className="text-[#9CA3AF]">Coluna</Label>
                  <Select 
                    value={metrics.leads.column}
                    onValueChange={(value) => setMetrics({
                      ...metrics,
                      leads: { ...metrics.leads, column: value }
                    })}
                  >
                    <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                      <SelectValue placeholder="Selecione a coluna" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                      <SelectItem value="id">ID</SelectItem>
                      <SelectItem value="nome">Nome</SelectItem>
                      <SelectItem value="quantidade">Quantidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#9CA3AF]">Tipo de Captação</Label>
                  <Select 
                    value={metrics.leads.aggregation}
                    onValueChange={(value) => setMetrics({
                      ...metrics,
                      leads: { ...metrics.leads, aggregation: value }
                    })}
                  >
                    <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                      <SelectItem value="count">Contagem</SelectItem>
                      <SelectItem value="sum">Soma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Vendas */}
            <Card className="bg-[#131313] border-[#656464]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#D9D9D9] flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Vendas
                  </CardTitle>
                  <Switch
                    checked={metrics.vendas.enabled}
                    onCheckedChange={(checked) => setMetrics({
                      ...metrics,
                      vendas: { ...metrics.vendas, enabled: checked }
                    })}
                  />
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Changed to md:grid-cols-3 */}
                <div>
                  <Label className="text-[#9CA3AF]">Planilha</Label>
                  <Select 
                    value={metrics.vendas.spreadsheet}
                    onValueChange={(value) => setMetrics({
                      ...metrics,
                      vendas: { ...metrics.vendas, spreadsheet: value }
                    })}
                  >
                    <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                      <SelectValue placeholder="Selecione a planilha" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                      <SelectItem value="vendas">Vendas</SelectItem>
                      <SelectItem value="transacoes">Transações</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Added Column Field */}
                <div>
                  <Label className="text-[#9CA3AF]">Coluna</Label>
                  <Select 
                    value={metrics.vendas.column}
                    onValueChange={(value) => setMetrics({
                      ...metrics,
                      vendas: { ...metrics.vendas, column: value }
                    })}
                  >
                    <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                      <SelectValue placeholder="Selecione a coluna" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                      <SelectItem value="id">ID</SelectItem>
                      <SelectItem value="valor">Valor</SelectItem>
                      <SelectItem value="quantidade">Quantidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#9CA3AF]">Tipo de Captação</Label>
                  <Select 
                    value={metrics.vendas.aggregation}
                    onValueChange={(value) => setMetrics({
                      ...metrics,
                      vendas: { ...metrics.vendas, aggregation: value }
                    })}
                  >
                    <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                      <SelectItem value="count">Contagem</SelectItem>
                      <SelectItem value="sum">Soma</SelectItem>
                      <SelectItem value="count_unique">Contagem de diferentes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Faturamento */}
            <Card className="bg-[#131313] border-[#656464]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#D9D9D9] flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    Faturamento
                  </CardTitle>
                  <Switch
                    checked={metrics.faturamento.enabled}
                    onCheckedChange={(checked) => setMetrics({
                      ...metrics,
                      faturamento: { ...metrics.faturamento, enabled: checked }
                    })}
                  />
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4"> {/* Changed to md:grid-cols-4 */}
                <div>
                  <Label className="text-[#9CA3AF]">Planilha</Label>
                  <Select 
                    value={metrics.faturamento.spreadsheet}
                    onValueChange={(value) => setMetrics({
                      ...metrics,
                      faturamento: { ...metrics.faturamento, spreadsheet: value }
                    })}
                  >
                    <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                      <SelectValue placeholder="Selecione a planilha" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                      <SelectItem value="vendas">Vendas</SelectItem>
                      <SelectItem value="faturamento">Faturamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Added Column Field */}
                <div>
                  <Label className="text-[#9CA3AF]">Coluna</Label>
                  <Select 
                    value={metrics.faturamento.column}
                    onValueChange={(value) => setMetrics({
                      ...metrics,
                      faturamento: { ...metrics.faturamento, column: value }
                    })}
                  >
                    <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                      <SelectValue placeholder="Selecione a coluna" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                      <SelectItem value="valor">Valor</SelectItem>
                      <SelectItem value="custo">Custo</SelectItem>
                      <SelectItem value="quantidade">Quantidade</SelectItem>
                      <SelectItem value="id">ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#9CA3AF]">Tipo de Captação</Label>
                  <Select 
                    value={metrics.faturamento.aggregation}
                    onValueChange={(value) => setMetrics({
                      ...metrics,
                      faturamento: { ...metrics.faturamento, aggregation: value }
                    })}
                  >
                    <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                      <SelectItem value="sum">Soma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#9CA3AF]">Moeda</Label>
                  <Select 
                    value={metrics.faturamento.currency}
                    onValueChange={(value) => setMetrics({
                      ...metrics,
                      faturamento: { ...metrics.faturamento, currency: value }
                    })}
                  >
                    <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                      {currencies.map(currency => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Métricas Calculadas Automaticamente */}
            <Card className="bg-[#131313] border-[#656464]">
              <CardHeader>
                <CardTitle className="text-[#D9D9D9]">Métricas Calculadas Automaticamente</CardTitle>
                <p className="text-[#9CA3AF] text-sm">Estas métricas são calculadas automaticamente baseadas nas configurações acima</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#1C1C1C] rounded-lg border border-[#656464]">
                    <h4 className="font-medium text-[#D9D9D9] flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      Taxa de Conversão
                    </h4>
                    <p className="text-sm text-[#9CA3AF] mt-1">Calculado: Vendas ÷ Leads × 100</p>
                    <p className="text-xs text-[#9CA3AF]">Sempre apresentado em percentual</p>
                  </div>
                  
                  <div className="p-4 bg-[#1C1C1C] rounded-lg border border-[#656464]">
                    <h4 className="font-medium text-[#D9D9D9] flex items-center gap-2">
                      <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                      Ticket Médio
                    </h4>
                    <p className="text-sm text-[#9CA3AF] mt-1">Calculado: Faturamento ÷ Vendas</p>
                    <p className="text-xs text-[#9CA3AF]">Apresentado como valor monetário</p>
                  </div>
                  
                  <div className="p-4 bg-[#1C1C1C] rounded-lg border border-[#656464]">
                    <h4 className="font-medium text-[#D9D9D9] flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      ROAS
                    </h4>
                    <p className="text-sm text-[#9CA3AF] mt-1">Calculado: Faturamento ÷ Investimento × 100</p>
                    <p className="text-xs text-[#9CA3AF]">Sempre apresentado em percentual</p>
                  </div>
                  
                  <div className="p-4 bg-[#1C1C1C] rounded-lg border border-[#656464]">
                    <h4 className="font-medium text-[#D9D9D9] flex items-center gap-2">
                      <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                      Custo por Lead
                    </h4>
                    <p className="text-sm text-[#9CA3AF] mt-1">Calculado: Investimento ÷ Leads</p>
                    <p className="text-xs text-[#9CA3AF]">Apresentado como valor monetário</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom-metrics" className="space-y-6 mt-6">
            <Card className="bg-[#131313] border-[#656464]">
              <CardHeader>
                <CardTitle className="text-[#D9D9D9]">Adicionar Métrica Personalizada</CardTitle>
                <p className="text-[#9CA3AF] text-sm">Crie métricas personalizadas baseadas nos seus dados</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#9CA3AF]">Nome da Métrica</Label>
                    <Input 
                      placeholder="Ex: Custo por Aquisição"
                      value={newCustomMetric.name}
                      onChange={(e) => setNewCustomMetric({...newCustomMetric, name: e.target.value})}
                      className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
                    />
                  </div>
                  <div>
                    <Label className="text-[#9CA3AF]">Planilha</Label>
                    <Select 
                      value={newCustomMetric.spreadsheet}
                      onValueChange={(value) => setNewCustomMetric({...newCustomMetric, spreadsheet: value})}
                    >
                      <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                        <SelectValue placeholder="Selecione a planilha" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                        <SelectItem value="vendas">Vendas</SelectItem>
                        <SelectItem value="leads">Leads</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-[#9CA3AF]">Coluna</Label>
                    <Select 
                      value={newCustomMetric.column}
                      onValueChange={(value) => setNewCustomMetric({...newCustomMetric, column: value})}
                    >
                      <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                        <SelectValue placeholder="Selecione a coluna" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                        <SelectItem value="valor">Valor</SelectItem>
                        <SelectItem value="quantidade">Quantidade</SelectItem>
                        <SelectItem value="custo">Custo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#9CA3AF]">Tipo de Captação</Label>
                    <Select 
                      value={newCustomMetric.aggregation}
                      onValueChange={(value) => setNewCustomMetric({...newCustomMetric, aggregation: value})}
                    >
                      <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                        {aggregationTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#9CA3AF]">Tipo</Label>
                    <Select 
                      value={newCustomMetric.type}
                      onValueChange={(value) => setNewCustomMetric({...newCustomMetric, type: value})}
                    >
                      <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                        <SelectItem value="number">Números</SelectItem>
                        <SelectItem value="percentage">Percentual</SelectItem>
                        <SelectItem value="currency">Moeda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newCustomMetric.type === 'currency' && (
                  <div className="w-full md:w-48">
                    <Label className="text-[#9CA3AF]">Moeda</Label>
                    <Select 
                      value={newCustomMetric.currency}
                      onValueChange={(value) => setNewCustomMetric({...newCustomMetric, currency: value})}
                    >
                      <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                        {currencies.map(currency => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button 
                  onClick={addCustomMetric}
                  className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
                >
                  Adicionar Métrica
                </Button>
              </CardContent>
            </Card>

            {/* Lista de Métricas Personalizadas */}
            {customMetrics.length > 0 && (
              <Card className="bg-[#131313] border-[#656464]">
                <CardHeader>
                  <CardTitle className="text-[#D9D9D9]">Métricas Personalizadas Criadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {customMetrics.map((metric) => (
                      <div key={metric.id} className="flex items-center justify-between p-3 bg-[#1C1C1C] rounded-lg border border-[#656464]">
                        <div>
                          <h4 className="font-medium text-[#D9D9D9]">{metric.name}</h4>
                          <p className="text-sm text-[#9CA3AF]">
                            {metric.aggregation} de {metric.column} em {metric.spreadsheet}
                            {metric.type === 'currency' && ` (${metric.currency})`}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setCustomMetrics(customMetrics.filter(m => m.id !== metric.id))}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remover
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="calculated-metrics" className="space-y-6 mt-6">
            <Card className="bg-[#131313] border-[#656464]">
              <CardHeader>
                <CardTitle className="text-[#D9D9D9]">Criar Métrica Calculada</CardTitle>
                <p className="text-[#9CA3AF] text-sm">Combine métricas existentes com operações matemáticas</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-[#9CA3AF]">Nome da Métrica</Label>
                  <Input 
                    placeholder="Ex: ROI de Marketing"
                    value={newCalculatedMetric.name}
                    onChange={(e) => setNewCalculatedMetric({...newCalculatedMetric, name: e.target.value})}
                    className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-[#9CA3AF]">Primeira Métrica</Label>
                    <Select 
                      value={newCalculatedMetric.metric1}
                      onValueChange={(value) => setNewCalculatedMetric({...newCalculatedMetric, metric1: value})}
                    >
                      <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                        <SelectValue placeholder="Selecione métrica" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                        {availableMetrics.map(metric => (
                          <SelectItem key={metric.value} value={metric.value}>
                            {metric.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#9CA3AF]">Operação</Label>
                    <Select 
                      value={newCalculatedMetric.operation}
                      onValueChange={(value) => setNewCalculatedMetric({...newCalculatedMetric, operation: value})}
                    >
                      <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                        {calculationTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#9CA3AF]">Segunda Métrica</Label>
                    <Select 
                      value={newCalculatedMetric.metric2}
                      onValueChange={(value) => setNewCalculatedMetric({...newCalculatedMetric, metric2: value})}
                    >
                      <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                        <SelectValue placeholder="Selecione métrica" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                        {availableMetrics.map(metric => (
                          <SelectItem key={metric.value} value={metric.value}>
                            {metric.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#9CA3AF]">Tipo de Resultado</Label>
                    <Select 
                      value={newCalculatedMetric.type}
                      onValueChange={(value) => setNewCalculatedMetric({...newCalculatedMetric, type: value})}
                    >
                      <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                        <SelectItem value="number">Números</SelectItem>
                        <SelectItem value="percentage">Percentual</SelectItem>
                        <SelectItem value="currency">Moeda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newCalculatedMetric.type === 'currency' && (
                    <div>
                      <Label className="text-[#9CA3AF]">Moeda</Label>
                      <Select 
                        value={newCalculatedMetric.currency}
                        onValueChange={(value) => setNewCalculatedMetric({...newCalculatedMetric, currency: value})}
                      >
                        <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                          {currencies.map(currency => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={addCalculatedMetric}
                  className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
                >
                  Criar Métrica Calculada
                </Button>
              </CardContent>
            </Card>

            {/* Lista de Métricas Calculadas */}
            {calculatedMetrics.length > 0 && (
              <Card className="bg-[#131313] border-[#656464]">
                <CardHeader>
                  <CardTitle className="text-[#D9D9D9]">Métricas Calculadas Criadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {calculatedMetrics.map((metric) => (
                      <div key={metric.id} className="flex items-center justify-between p-3 bg-[#1C1C1C] rounded-lg border border-[#656464]">
                        <div>
                          <h4 className="font-medium text-[#D9D9D9]">{metric.name}</h4>
                          <p className="text-sm text-[#9CA3AF]">
                            {getMetricDisplayName(metric.metric1)} {calculationTypes.find(t => t.value === metric.operation)?.label.toLowerCase()} {getMetricDisplayName(metric.metric2)}
                            {metric.type === 'currency' && ` (${metric.currency})`}
                            {metric.type === 'percentage' && ' (%)'}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setCalculatedMetrics(calculatedMetrics.filter(m => m.id !== metric.id))}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remover
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-6 border-t border-[#656464]">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20 hover:text-[#E50F5F] hover:border-[#E50F5F]"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white border-none"
          >
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
