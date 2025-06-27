import React, { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Search,
  Database,
  Eye,
  Trash2
} from "lucide-react";
import { RecordList } from "@/api/entities";
import { CompanyContext } from "@/components/contexts/CompanyContext";

export default function Records() {
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedCompanyId } = useContext(CompanyContext);

  useEffect(() => {
    loadLists();
  }, [selectedCompanyId]);

  const loadLists = async () => {
    setIsLoading(true);
    try {
      const allLists = await RecordList.list();
      setLists(allLists);
    } catch (error) {
      console.error("Erro ao carregar listas:", error);
    }
    setIsLoading(false);
  };

  const deleteList = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta lista? As respostas associadas não serão excluídas.")) {
      try {
        await RecordList.delete(id);
        loadLists();
      } catch (error) {
        console.error("Erro ao excluir lista:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#D9D9D9]">Registros</h1>
            <p className="text-[#9CA3AF] mt-1">Gerencie suas listas de respostas de formulários</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
            <Input
              placeholder="Buscar listas..."
              className="pl-10 bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
            />
          </div>
        </div>

        {/* Lists */}
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <p className="text-center text-[#9CA3AF]">Carregando listas...</p>
          ) : lists.length === 0 ? (
            <Card className="bg-[#1C1C1C] border-[#656464]">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Database className="w-12 h-12 text-[#9CA3AF] mb-4" />
                <h3 className="text-lg font-medium text-[#D9D9D9] mb-2">Nenhuma lista encontrada</h3>
                <p className="text-[#9CA3AF] text-center">Listas são criadas automaticamente quando você cria um novo formulário.</p>
              </CardContent>
            </Card>
          ) : (
            lists.map((list) => (
              <Card key={list.id} className="bg-[#1C1C1C] border-[#656464] hover:border-[#E50F5F]/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[#E50F5F]/20 rounded-lg">
                        <Database className="w-6 h-6 text-[#E50F5F]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#D9D9D9] text-lg">{list.name}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-[#9CA3AF]">{list.record_count || 0} registros</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="border-[#656464] text-[#D9D9D9]" disabled>
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button variant="outline" size="sm" className="border-[#656464] text-[#D9D9D9] hover:text-red-500" onClick={() => deleteList(list.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}