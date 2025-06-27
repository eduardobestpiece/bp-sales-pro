
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  User,
  Building2,
  Users,
  Shield,
  Archive,
  Activity,
  Settings as SettingsIcon,
  Camera,
  Lock,
  Globe,
  Calendar
} from "lucide-react";
import { User as UserEntity } from "@/api/entities";
import { Company } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import PersonalInfoTab from "../components/settings/PersonalInfoTab";
import CompanyInfoTab from "../components/settings/CompanyInfoTab";
import UsersManagementTab from "../components/settings/UsersManagementTab";
import PermissionsTab from "../components/settings/PermissionsTab";
import ArchivedItemsTab from "../components/settings/ArchivedItemsTab";
import ActivityLogTab from "../components/settings/ActivityLogTab";
import TeamsTab from "../components/settings/TeamsTab"; // Nova importação

const settingsMenuItems = [
  {
    id: "personal",
    title: "Informações Pessoais",
    icon: User,
    description: "Gerencie seus dados pessoais"
  },
  {
    id: "company",
    title: "Informações da Empresa",
    icon: Building2,
    description: "Empresas e configurações"
  },
  {
    id: "users",
    title: "Usuários",
    icon: Users,
    description: "Gerenciar equipe"
  },
  {
    id: "permissions",
    title: "Permissões",
    icon: Shield,
    description: "Controle de acesso"
  },
  { id: "teams", title: "Equipes", icon: Users, description: "Crie e gerencie equipes" }, // Nova aba
  {
    id: "archived",
    title: "Itens Arquivados",
    icon: Archive,
    description: "Visualizar itens arquivados"
  },
  {
    id: "activity",
    title: "Log de Atividades",
    icon: Activity,
    description: "Histórico de ações"
  }
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("personal");
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [currentUser, companiesData] = await Promise.all([
        UserEntity.me(),
        Company.list()
      ]);
      
      setUser(currentUser);
      setCompanies(companiesData);
    } catch (error) {
      console.error("Erro ao carregar dados das configurações:", error);
    }
    setIsLoading(false);
  };

  // Função para atualizar os dados do usuário
  const handleUserUpdate = async () => {
    try {
      const updatedUser = await UserEntity.me();
      setUser(updatedUser);
    } catch (error) {
      console.error("Erro ao atualizar dados do usuário:", error);
    }
  };

  const activeMenuItem = settingsMenuItems.find(item => item.id === activeTab);

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return <PersonalInfoTab 
          user={user} 
          onRefresh={loadInitialData}
        />;
      case "company":
        return <CompanyInfoTab companies={companies} user={user} onRefresh={loadInitialData} />;
      case "users":
        return <UsersManagementTab companies={companies} user={user} />;
      case "permissions":
        return <PermissionsTab companies={companies} user={user} />;
      case "teams":
        return <TeamsTab companies={companies} user={user} />;
      case "archived":
        return <ArchivedItemsTab />;
      case "activity":
        return <ActivityLogTab user={user} />;
      default:
        return <PersonalInfoTab 
          user={user} 
          onRefresh={loadInitialData}
        />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#131313] flex items-center justify-center">
        <div className="text-center">
          <SettingsIcon className="w-12 h-12 text-[#E50F5F] mx-auto mb-4 animate-spin" />
          <p className="text-[#D9D9D9]">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131313] flex">
      {/* Menu Lateral de Configurações */}
      <div className="w-80 bg-[#1C1C1C] border-r border-[#656464] min-h-screen p-6 flex flex-col">
        {/* Header do Menu */}
        <div className="mb-8">
          <Link 
            to={createPageUrl("Dashboard")}
            className="flex items-center gap-2 text-[#9CA3AF] hover:text-[#E50F5F] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Voltar ao Início</span>
          </Link>
          
          <div>
            <h1 className="text-2xl font-bold text-[#D9D9D9]">Configurações</h1>
            <p className="text-sm text-[#9CA3AF] mt-1">
              Gerencie os dados da sua conta e plataforma
            </p>
          </div>
        </div>

        {/* Navegação */}
        <nav className="space-y-2 flex-1 overflow-y-auto">
          {settingsMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all ${
                  isActive
                    ? 'bg-[#E50F5F] text-white'
                    : 'text-[#D9D9D9] hover:bg-[#E50F5F]/10 hover:text-[#E50F5F]'
                }`}
              >
                <Icon className="w-5 h-5 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className={`text-xs ${isActive ? 'text-white/80' : 'text-[#9CA3AF]'}`}>
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header da Seção */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              {activeMenuItem && <activeMenuItem.icon className="w-6 h-6 text-[#E50F5F]" />}
              <h2 className="text-2xl font-bold text-[#D9D9D9]">
                {activeMenuItem?.title}
              </h2>
            </div>
            <p className="text-[#9CA3AF]">{activeMenuItem?.description}</p>
          </div>

          {/* Conteúdo da Aba */}
          <div className="space-y-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
