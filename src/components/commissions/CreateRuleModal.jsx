import React, { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Percent, DollarSign, TrendingUp, Award } from "lucide-react";
import { CommissionRule } from "@/api/entities";

export default function CreateRuleModal({ open, onClose, onSuccess, users }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "percentage",
    value: 0,
    currency: "BRL",
    conditions: {
      min_value: 0,
      max_value: 0,
      product_categories: [],
      user_levels: []
    },
    tiers: [],
    hierarchy_levels: [],
    active: true,
    applicable_to: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        type: "percentage",
        value: 0,
        currency: "BRL",
        conditions: {
          min_value: 0,
          max_value: 0,
          product_categories: [],
          user_levels: []
        },
        tiers: [],
        hierarchy_levels: [],
        active: true,
        applicable_to: []
      });
      setActiveTab("basic");
    }
  }, [open]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const addTier = () => {
    setFormData(prev => ({
      ...prev,
      tiers: [...prev.tiers, { min_amount: 0, max_amount: 0, rate: 0 }]
    }));
  };

  const removeTier = (index) => {
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers.filter((_, i) => i !== index)
    }));
  };

  const updateTier = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers.map((tier, i) => 
        i === index ? { ...tier, [field]: value } : tier
      )
    }));
  };

  const addHierarchyLevel = () => {
    setFormData(prev => ({
      ...prev,
      hierarchy_levels: [...prev.hierarchy_levels, { 
        level: prev.hierarchy_levels.length + 1, 
        name: "", 
        rate: 0, 
        max_depth: 1 
      }]
    }));
  };

  const removeHierarchyLevel = (index) => {
    setFormData(prev => ({
      ...prev,
      hierarchy_levels: prev.hierarchy_levels.filter((_, i) => i !== index)
    }));
  };

  const updateHierarchyLevel = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      hierarchy_levels: prev.hierarchy_levels.map((level, i) => 
        i === index ? { ...level, [field]: value } : level
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await CommissionRule.create(formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao criar regra:", error);
    }
    
    setIsLoading(false);
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#E50F5F]">Nova Regra de Comissão</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-[#131313] border border-[#656464]">
              <TabsTrigger 
                value="basic" 
                className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white"
              >
                Básico
              </TabsTrigger>
              <TabsTrigger 
                value="conditions" 
                className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white"
              >
                Condições
              </TabsTrigger>
              <TabsTrigger 
                value="tiered" 
                disabled={formData.type !== 'tiered'}
                className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white disabled:opacity-50"
              >
                Escalonamento
              </TabsTrigger>
              <TabsTrigger 
                value="hierarchy" 
                className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white"
              >
                Hierarquia
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Nome da Regra</Label>
                  <Input 
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-[#131313] border-[#656464]"
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => handleInputChange('active', checked)}
                  />
                  <Label htmlFor="active">Regra Ativa</Label>
                </div>
              </div>
              
              <div>
                <Label>Tipo de Comissão</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {['percentage', 'fixed', 'tiered', 'bonus'].map(type => {
                    const Icon = getTypeIcon(type);
                    return (
                      <Card
                        key={type}
                        onClick={() => handleInputChange('type', type)}
                        className={`cursor-pointer ${formData.type === type ? 'border-[#E50F5F] bg-[#E50F5F]/10' : 'border-[#656464]'} bg-[#131313]`}
                      >
                        <CardContent className="p-4 text-center">
                          <Icon className="w-8 h-8 mx-auto text-[#D9D9D9]" />
                          <p className="mt-2 text-sm font-medium capitalize">{type}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {formData.type !== 'tiered' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="value">
                      {formData.type === 'percentage' ? 'Percentual (%)' : 'Valor'}
                    </Label>
                    <Input 
                      id="value"
                      type="number"
                      value={formData.value}
                      onChange={(e) => handleInputChange('value', parseFloat(e.target.value))}
                      className="bg-[#131313] border-[#656464]"
                    />
                  </div>
                  {formData.type === 'fixed' && (
                    <div>
                      <Label htmlFor="currency">Moeda</Label>
                      <Select value={formData.currency} onValueChange={(val) => handleInputChange('currency', val)}>
                        <SelectTrigger className="bg-[#131313] border-[#656464]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                          <SelectItem value="BRL">BRL</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="conditions" className="mt-6 space-y-4">
               {/* Futuras implementações de condições */}
               <p className="text-center text-[#9CA3AF]">Configuração de condições em desenvolvimento.</p>
            </TabsContent>

            <TabsContent value="tiered" className="mt-6 space-y-4">
              <Card className="bg-[#131313] border-[#656464]">
                <CardHeader>
                  <CardTitle>Níveis de Escalonamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.tiers.map((tier, index) => (
                    <div key={index} className="flex items-center gap-4 p-2 rounded-md bg-[#1C1C1C]">
                      <Input
                        type="number"
                        placeholder="De"
                        value={tier.min_amount}
                        onChange={(e) => updateTier(index, 'min_amount', parseFloat(e.target.value))}
                        className="bg-[#131313] border-[#656464]"
                      />
                      <Input
                        type="number"
                        placeholder="Até"
                        value={tier.max_amount}
                        onChange={(e) => updateTier(index, 'max_amount', parseFloat(e.target.value))}
                        className="bg-[#131313] border-[#656464]"
                      />
                      <Input
                        type="number"
                        placeholder="Taxa (%)"
                        value={tier.rate}
                        onChange={(e) => updateTier(index, 'rate', parseFloat(e.target.value))}
                        className="bg-[#131313] border-[#656464]"
                      />
                      <Button variant="destructive" size="icon" onClick={() => removeTier(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addTier} className="border-[#656464] text-[#D9D9D9]">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Nível
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hierarchy" className="mt-6 space-y-4">
              <Card className="bg-[#131313] border-[#656464]">
                <CardHeader>
                  <CardTitle>Níveis de Hierarquia (Uplines)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.hierarchy_levels.map((level, index) => (
                    <div key={index} className="flex items-center gap-4 p-2 rounded-md bg-[#1C1C1C]">
                      <Input
                        placeholder="Nome do Nível"
                        value={level.name}
                        onChange={(e) => updateHierarchyLevel(index, 'name', e.target.value)}
                        className="bg-[#131313] border-[#656464]"
                      />
                       <Input
                        type="number"
                        placeholder="Taxa (%)"
                        value={level.rate}
                        onChange={(e) => updateHierarchyLevel(index, 'rate', parseFloat(e.target.value))}
                        className="bg-[#131313] border-[#656464]"
                      />
                      <Input
                        type="number"
                        placeholder="Profundidade Máx."
                        value={level.max_depth}
                        onChange={(e) => updateHierarchyLevel(index, 'max_depth', parseInt(e.target.value))}
                        className="bg-[#131313] border-[#656464]"
                      />
                      <Button variant="destructive" size="icon" onClick={() => removeHierarchyLevel(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addHierarchyLevel} className="border-[#656464] text-[#D9D9D9]">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Nível de Upline
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-[#656464]">
            <Button type="button" variant="outline" onClick={onClose} className="border-[#656464] text-[#D9D9D9]">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white">
              {isLoading ? "Salvando..." : "Salvar Regra"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}