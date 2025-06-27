import React, { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadSource } from "@/api/entities";
import { CompanyContext } from "@/components/contexts/CompanyContext";

export default function LeadSourcesTab() {
  const { selectedCompanyId } = useContext(CompanyContext);
  const [sources, setSources] = useState([]);
  const [allSources, setAllSources] = useState([]);
  const [newSourceName, setNewSourceName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadSources();
  }, []);

  useEffect(() => {
    filterByCompany();
  }, [selectedCompanyId, allSources]);

  const loadSources = async () => {
    setIsLoading(true);
    try {
      const data = await LeadSource.list();
      setAllSources(data);
      filterByCompany(data);
    } catch (error) {
      console.error("Erro ao carregar origens:", error);
    }
    setIsLoading(false);
  };
  
  const filterByCompany = (sourceList = allSources) => {
    if (selectedCompanyId === 'all') {
      setSources(sourceList);
    } else {
      // Inclui origens da empresa selecionada E origens globais (sem company_id)
      setSources(sourceList.filter(s => s.company_id === selectedCompanyId || !s.company_id));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newSourceName.trim() || selectedCompanyId === 'all') {
        alert("Selecione uma empresa para adicionar uma origem específica.");
        return;
    }
    try {
      await LeadSource.create({ name: newSourceName, company_id: selectedCompanyId });
      setNewSourceName("");
      loadSources();
    } catch (error) {
      console.error("Erro ao criar origem:", error);
    }
  };

  const handleDelete = async (source) => {
    if (window.confirm(`Tem certeza que deseja excluir a origem "${source.name}"?`)) {
        try {
            await LeadSource.delete(source.id);
            loadSources();
        } catch(error) {
            console.error("Erro ao excluir origem", error);
        }
    }
  };
  
  const filteredSources = sources.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="bg-[#1C1C1C] border-[#656464]">
        <CardHeader>
          <CardTitle className="text-[#D9D9D9]">Adicionar Nova Origem de Lead</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              placeholder="Ex: Google Ads, Indicação"
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9]"
            />
             <p className="text-xs text-gray-500">A origem será associada à empresa selecionada no menu lateral.</p>
            <Button type="submit" className="w-full bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card className="bg-[#1C1C1C] border-[#656464]">
        <CardHeader>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
              <Input
                placeholder="Buscar origem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#131313] border-[#656464] text-[#D9D9D9]"
              />
            </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-[#9CA3AF]">Carregando...</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredSources.map(source => (
                <div key={source.id} className="flex items-center justify-between p-3 bg-[#131313] rounded-lg">
                    <p className="font-medium text-[#D9D9D9]">{source.name}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1C1C1C] border-[#656464] hover:bg-[#656464]/30 text-[#D9D9D9]" onClick={() => {/* Edit logic */}}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1C1C1C] border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-white" onClick={() => handleDelete(source)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}