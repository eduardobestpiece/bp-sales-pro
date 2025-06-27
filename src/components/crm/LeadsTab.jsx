
import React, { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Edit, Trash2, Mail, Phone, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Lead } from "@/api/entities";
import { Company } from "@/api/entities";

export default function LeadsTab({ selectedCompanyId }) {
  const [leads, setLeads] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (selectedCompanyId) {
        loadData();
    }
  }, [selectedCompanyId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allLeads, companiesData] = await Promise.all([
        Lead.list("-created_date"),
        Company.list()
      ]);
      const leadsForCompany = allLeads.filter(l => l.company_id === selectedCompanyId);
      const companyMap = new Map(companiesData.map(c => [c.id, c.name]));
      const leadsWithCompanyNames = leadsForCompany.map(lead => ({
        ...lead,
        company_name: lead.company_id ? companyMap.get(lead.company_id) : 'N/A'
      }));
      setLeads(leadsWithCompanyNames);
      setCompanies(companiesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setIsLoading(false);
  };

  const handleCreateLead = async () => {
    // Implementar modal de criação de lead
    console.log("Criar novo lead");
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedLeads(filteredLeads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId, checked) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, leadId]);
    } else {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: "bg-blue-100 text-blue-800 border-blue-200",
      contacted: "bg-yellow-100 text-yellow-800 border-yellow-200",
      qualified: "bg-green-100 text-green-800 border-green-200",
      converted: "bg-purple-100 text-purple-800 border-purple-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusLabel = (status) => {
    const labels = {
      new: "Novo",
      contacted: "Contatado",
      qualified: "Qualificado",
      converted: "Convertido"
    };
    return labels[status] || status;
  };

  const filteredLeads = leads.filter(lead =>
    lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header e Ações */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
            <Input
              placeholder="Buscar leads..."
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
        
        <Button
          onClick={handleCreateLead}
          className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar Lead
        </Button>
      </div>

      {/* Seleção em Massa */}
      {selectedLeads.length > 0 && (
        <Card className="bg-[#1C1C1C] border border-[#E50F5F]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[#D9D9D9]">
                {selectedLeads.length} lead(s) selecionado(s)
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-[#656464] text-[#D9D9D9]">
                  Mover para Funil
                </Button>
                <Button variant="outline" size="sm" className="border-[#656464] text-[#D9D9D9]">
                  Atribuir Responsável
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Leads */}
      <Card className="bg-[#1C1C1C] border-[#656464]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#D9D9D9]">Leads ({filteredLeads.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all-leads"
                checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all-leads" className="text-sm text-[#9CA3AF] cursor-pointer">Selecionar todos</label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-[#9CA3AF]">
                Carregando leads...
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-8 text-[#9CA3AF]">
                Nenhum lead encontrado
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-4 bg-[#131313] rounded-lg border border-[#656464] hover:border-[#E50F5F]/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Checkbox
                      id={`select-lead-${lead.id}`}
                      checked={selectedLeads.includes(lead.id)}
                      onCheckedChange={(checked) => handleSelectLead(lead.id, checked)}
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-[#D9D9D9]">{lead.name}</h3>
                        <Badge className={getStatusColor(lead.status)}>
                          {getStatusLabel(lead.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#9CA3AF]">
                        {lead.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {lead.email}
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {lead.phone}
                          </div>
                        )}
                        {lead.company_name && lead.company_name !== 'N/A' && (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {lead.company_name}
                          </div>
                        )}
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
    </div>
  );
}
