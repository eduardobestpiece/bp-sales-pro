
import React, { useState, useEffect, useContext } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Users, Target, DollarSign } from "lucide-react";
import { CompanyContext } from "@/components/contexts/CompanyContext"; // Corrected path

import LeadsTab from "../components/crm/LeadsTab";
import DealsTab from "../components/crm/DealsTab";
import SalesTab from "../components/crm/SalesTab";

export default function CRM() {
  const [activeTab, setActiveTab] = useState("leads");
  const { selectedCompanyId } = useContext(CompanyContext);

  if (!selectedCompanyId) {
      return <div className="p-6 text-[#9CA3AF]">Selecione uma empresa para continuar.</div>;
  }

  return (
    <div className="min-h-screen bg-[#131313] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#D9D9D9]">CRM</h1>
            <p className="text-[#9CA3AF] mt-1">Gerencie seus leads, negócios e vendas</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#1C1C1C] border border-[#656464]">
            <TabsTrigger 
              value="leads" 
              className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger 
              value="deals" 
              className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Negócios
            </TabsTrigger>
            <TabsTrigger 
              value="sales" 
              className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Vendas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="mt-6">
            <LeadsTab selectedCompanyId={selectedCompanyId} />
          </TabsContent>

          <TabsContent value="deals" className="mt-6">
            <DealsTab selectedCompanyId={selectedCompanyId} />
          </TabsContent>

          <TabsContent value="sales" className="mt-6">
            <SalesTab selectedCompanyId={selectedCompanyId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
