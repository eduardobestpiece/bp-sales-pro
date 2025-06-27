import React, { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LossReason } from "@/api/entities";
import { CompanyContext } from "@/components/contexts/CompanyContext";

export default function LossReasonsTab() {
  const { selectedCompanyId } = useContext(CompanyContext);
  const [reasons, setReasons] = useState([]);
  const [allReasons, setAllReasons] = useState([]);
  const [newReasonName, setNewReasonName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadReasons();
  }, []);

  useEffect(() => {
    filterByCompany();
  }, [selectedCompanyId, allReasons]);

  const loadReasons = async () => {
    setIsLoading(true);
    try {
      const data = await LossReason.list();
      setAllReasons(data);
      filterByCompany(data);
    } catch (error) {
      console.error("Erro ao carregar motivos:", error);
    }
    setIsLoading(false);
  };

  const filterByCompany = (reasonList = allReasons) => {
    if (selectedCompanyId === 'all') {
      setReasons(reasonList);
    } else {
      setReasons(reasonList.filter(r => r.company_id === selectedCompanyId || !r.company_id));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newReasonName.trim() || selectedCompanyId === 'all') {
      alert("Selecione uma empresa para adicionar um motivo específico.");
      return;
    }
    try {
      await LossReason.create({ name: newReasonName, company_id: selectedCompanyId });
      setNewReasonName("");
      loadReasons();
    } catch (error) {
      console.error("Erro ao criar motivo:", error);
    }
  };

  const handleDelete = async (reason) => {
    if (window.confirm(`Tem certeza que deseja excluir o motivo "${reason.name}"?`)) {
        try {
            await LossReason.delete(reason.id);
            loadReasons();
        } catch(error) {
            console.error("Erro ao excluir motivo", error);
        }
    }
  };

  const filteredReasons = reasons.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="bg-[#1C1C1C] border-[#656464]">
        <CardHeader>
          <CardTitle className="text-[#D9D9D9]">Adicionar Novo Motivo de Perda</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              placeholder="Ex: Preço, Concorrência"
              value={newReasonName}
              onChange={(e) => setNewReasonName(e.target.value)}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9]"
            />
            <p className="text-xs text-gray-500">O motivo será associado à empresa selecionada no menu lateral.</p>
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
                placeholder="Buscar motivo..."
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
              {filteredReasons.map(reason => (
                <div key={reason.id} className="flex items-center justify-between p-3 bg-[#131313] rounded-lg">
                  <p className="font-medium text-[#D9D9D9]">{reason.name}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1C1C1C] border-[#656464] hover:bg-[#656464]/30" onClick={() => {/* Edit logic */}}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1C1C1C] border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-white" onClick={() => handleDelete(reason)}>
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