import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, ShoppingBag, Tag, ThumbsDown, Puzzle } from "lucide-react";

import CompaniesTab from "../components/management/CompaniesTab";
import UsersTab from "../components/management/UsersTab";
import ProductsTab from "../components/management/ProductsTab";
import LeadSourcesTab from "../components/management/LeadSourcesTab";
import LossReasonsTab from "../components/management/LossReasonsTab";
import CustomFieldsTab from "../components/management/CustomFieldsTab";

export default function Management() {
  const [activeTab, setActiveTab] = useState("companies");

  const tabs = [
    { value: "companies", label: "Empresas", icon: Building2, component: <CompaniesTab /> },
    { value: "users", label: "Usuários", icon: Users, component: <UsersTab /> },
    { value: "products", label: "Produtos", icon: ShoppingBag, component: <ProductsTab /> },
    { value: "lead-sources", label: "Origens de Leads", icon: Tag, component: <LeadSourcesTab /> },
    { value: "loss-reasons", label: "Motivos de Perda", icon: ThumbsDown, component: <LossReasonsTab /> },
    { value: "custom-fields", label: "Campos Personalizados", icon: Puzzle, component: <CustomFieldsTab /> },
  ];

  return (
    <div className="min-h-screen bg-[#131313] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#D9D9D9]">Cadastros</h1>
            <p className="text-[#9CA3AF] mt-1">Gerencie os dados mestres da sua plataforma.</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 bg-[#1C1C1C] border border-[#656464] p-1 rounded-lg">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white flex items-center gap-2 rounded-md transition-all"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map(tab => (
            <TabsContent key={tab.value} value={tab.value} className="mt-6">
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}