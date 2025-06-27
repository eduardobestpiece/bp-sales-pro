

import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Users,
  Target,
  FileText,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  Menu,
  User,
  LogOut,
  Activity, // This is the Lucide icon
  BookOpen,
  DollarSign,
  UserPlus,
  Search,
  Plus,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserEntity } from "@/api/entities";
import { Company } from "@/api/entities";
import { Workflow } from "@/api/entities"; // New import for Workflow entity
import { Activity as ActivityEntity } from "@/api/entities"; // New import for Activity entity, aliased to avoid conflict with Lucide icon
import { ActivityTemplate } from "@/api/entities"; // New import for ActivityTemplate entity
import { Playbook } from "@/api/entities"; // New import for Playbook entity
import { CompanyContext } from "@/components/contexts/CompanyContext";
import ActivityModal from "@/components/activities/ActivityModal";
import CreatePlaybookModal from "@/components/activities/CreatePlaybookModal";

// New component for CreateActivityDropdown
function CreateActivityDropdown({ children, isDarkMode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className={`${isDarkMode ? 'bg-[#1C1C1C] border-[#656464]' : 'bg-white border-gray-200'}`}>
        <DropdownMenuItem className={`${isDarkMode ? 'text-[#D9D9D9] hover:bg-[#656464]/20' : 'text-gray-900 hover:bg-[#656464]/20'}`}>
          <Activity className="w-4 h-4 mr-2" />
          Atividade
        </DropdownMenuItem>
        <DropdownMenuItem className={`${isDarkMode ? 'text-[#D9D9D9] hover:bg-[#656464]/20' : 'text-gray-900 hover:bg-[#656464]/20'}`}>
          <FileText className="w-4 h-4 mr-2" />
          Modelo
        </DropdownMenuItem>
        <DropdownMenuItem className={`${isDarkMode ? 'text-[#D9D9D9] hover:bg-[#656464]/20' : 'text-gray-900 hover:bg-[#656464]/20'}`}>
          <BookOpen className="w-4 h-4 mr-2" />
          Playbook
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


const navigationItems = [
  {
    title: "Inicial",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Atividades",
    url: createPageUrl("Activities"),
    icon: Activity,
  },
  {
    title: "Drive",
    url: createPageUrl("Drive"),
    icon: Database,
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(() => localStorage.getItem("selectedCompanyId") || "all");
  const [companies, setCompanies] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]); // New state for search results
  const [showSearchResults, setShowSearchResults] = useState(false); // New state to control search results visibility
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // State for creation modals
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPlaybookModal, setShowPlaybookModal] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [users, setUsers] = useState([]);

  const loadInitialData = useCallback(async () => {
    try {
      const currentUser = await UserEntity.me();
      setUser(currentUser);
      
      const companiesData = await Company.list();
      const userCompanyRoles = currentUser.company_roles || [];
      
      let accessibleCompanies = [];
      
      const isParentOwner = userCompanyRoles.some(role => {
        const company = companiesData.find(c => c.id === role.company_id);
        return company && company.company_type === 'parent' && role.role_function === 'proprietario';
      });

      if (isParentOwner) {
        accessibleCompanies = companiesData;
      } else {
        if (userCompanyRoles.length > 0) {
          for (const role of userCompanyRoles) {
            const userCompany = companiesData.find(c => c.id === role.company_id);
            if (userCompany) {
              if (userCompany.company_type === 'mother' && role.role_function === 'proprietario') {
                const childCompanies = companiesData.filter(c => 
                  c.parent_company_id === userCompany.id || c.id === userCompany.id
                );
                accessibleCompanies = [...accessibleCompanies, ...childCompanies];
              } else {
                if (!accessibleCompanies.some(ac => ac.id === userCompany.id)) {
                  accessibleCompanies.push(userCompany);
                }
              }
            }
          }
          
          accessibleCompanies = accessibleCompanies.filter((company, index, self) => 
            index === self.findIndex(c => c.id === company.id)
          );
        }
      }
      
      setCompanies(accessibleCompanies);
      
      const savedCompanyId = localStorage.getItem("selectedCompanyId");
      if (savedCompanyId === "all" || (savedCompanyId && accessibleCompanies.some(c => c.id === savedCompanyId))) {
        setSelectedCompanyId(savedCompanyId);
      } else if (accessibleCompanies.length > 0) {
        const newCompanyId = accessibleCompanies[0].id;
        setSelectedCompanyId(newCompanyId);
        localStorage.setItem("selectedCompanyId", newCompanyId);
      } else {
        setSelectedCompanyId("all");
        localStorage.setItem("selectedCompanyId", "all");
      }
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
    }
  }, []); 

  useEffect(() => {
    if (currentPageName !== 'ViewForm') {
        loadInitialData();
    }
  }, [loadInitialData, currentPageName]);

  const loadDataForModals = async () => {
      try {
          const [workflowsData, usersData] = await Promise.all([
              Workflow.list(),
              UserEntity.list()
          ]);
          setWorkflows(workflowsData);
          setUsers(usersData);
      } catch (error) {
          console.error("Erro ao carregar dados para modais:", error);
      }
  };
  
  useEffect(() => {
    loadDataForModals();
  }, []);

  const handleGlobalSearchNavigation = (url) => {
      navigate(url);
      setSearchTerm('');
      setSearchResults([]);
      setShowSearchResults(false);
  };

  // Pesquisa Global
  const performGlobalSearch = useCallback(async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const [workflows, activities, templates, playbooks] = await Promise.all([
        Workflow.list(),
        ActivityEntity.filter({ status: { $ne: 'cancelled' } }), // Excluir atividades canceladas/excluídas
        ActivityTemplate.list(),
        Playbook.list()
      ]);

      const results = [];
      
      // Buscar workflows
      workflows.filter(w => w.name?.toLowerCase().includes(term.toLowerCase()))
        .forEach(item => results.push({
          type: 'workflow',
          id: item.id,
          title: item.name,
          subtitle: 'Workflow',
          url: createPageUrl("Activities") + "?tab=workflows&focus=" + item.id // Example URL, adjust as needed
        }));

      // Buscar atividades ativas
      activities.filter(a => a.title?.toLowerCase().includes(term.toLowerCase()))
        .forEach(item => results.push({
          type: 'activity',
          id: item.id,
          title: item.title,
          subtitle: 'Tarefa',
          url: createPageUrl("Activities") + "?tab=activities&focus=" + item.id // Example URL, adjust as needed
        }));

      // Buscar modelos
      templates.filter(t => t.name?.toLowerCase().includes(term.toLowerCase()))
        .forEach(item => results.push({
          type: 'template',
          id: item.id,
          title: item.name,
          subtitle: 'Modelo',
          url: createPageUrl("Activities") + "?tab=templates&focus=" + item.id // Example URL, adjust as needed
        }));

      // Buscar playbooks
      playbooks.filter(p => p.name?.toLowerCase().includes(term.toLowerCase()))
        .forEach(item => results.push({
          type: 'playbook',
          id: item.id,
          title: item.name,
          subtitle: 'Playbook',
          url: createPageUrl("Activities") + "?tab=playbooks&focus=" + item.id // Example URL, adjust as needed
        }));

      setSearchResults(results.slice(0, 8)); // Limitar a 8 resultados
      setShowSearchResults(true);
    } catch (error) {
      console.error("Erro na pesquisa global:", error);
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performGlobalSearch(searchTerm);
    }, 300); // Debounce search input

    return () => clearTimeout(timeoutId);
  }, [searchTerm, performGlobalSearch]);

  const handleCompanyChange = (companyId) => {
    if (companyId) {
      setSelectedCompanyId(companyId);
      localStorage.setItem("selectedCompanyId", companyId);
    }
  }

  const handleLogout = async () => {
    try {
      await UserEntity.logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const selectedCompanyName = selectedCompanyId === "all" ? "Todas Empresas" : (companies.find(c => c.id === selectedCompanyId)?.name || "Nenhuma empresa");
  const selectedCompany = companies.find(c => c.id === selectedCompanyId);
  
  const isSettingsPage = currentPageName === 'Settings';

  // Se for a página de formulário público, renderiza apenas o conteúdo
  if (currentPageName === 'ViewForm') {
    return <div className="bg-[#131313] min-h-screen">{children}</div>;
  }

  return (
    <CompanyContext.Provider value={{ selectedCompanyId, setSelectedCompanyId: handleCompanyChange, companies }}>
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#131313]' : 'bg-gray-50'} text-[#D9D9D9] font-['DM_Sans']`}>
        <style>
          {`
            :root {
              --primary-bg: ${isDarkMode ? '#131313' : '#ffffff'};
              --secondary-bg: ${isDarkMode ? '#1C1C1C' : '#f8f9fa'};
              --accent-color: #E50F5F;
              --border-color: #656464;
              --text-color: ${isDarkMode ? '#D9D9D9' : '#1f2937'};
              --text-muted: ${isDarkMode ? '#9CA3AF' : '#6b7280'};
            }
            
            .custom-scrollbar::-webkit-scrollbar {
              width: 4px;
            }
            
            .custom-scrollbar::-webkit-scrollbar-track {
              background: var(--secondary-bg);
            }
            
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: var(--border-color);
              border-radius: 2px;
            }
            
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: var(--accent-color);
            }
          `}
        </style>

        {/* Header Superior - Barra Fina */}
        <header className={`h-12 ${isDarkMode ? 'bg-[#1C1C1C]' : 'bg-white'} border-b border-[#656464] flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50`}>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`${isDarkMode ? 'text-[#D9D9D9] hover:bg-[#656464]/20' : 'text-gray-600 hover:bg-gray-100'} lg:inline-flex hidden`}
            >
              <Menu className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className={`${isDarkMode ? 'text-[#D9D9D9] hover:bg-[#656464]/20' : 'text-gray-600 hover:bg-gray-100'} lg:hidden`}
            >
              <Menu className="w-4 h-4" />
            </Button>

            {/* Logo BP Sales */}
            <div className="flex items-center gap-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/324fd9a2f_BPSalesBranca-LogoBPSales.png" 
                alt="BP Sales" 
                className="h-6"
              />
            </div>
          </div>

          {/* Campo de Pesquisa Central */}
          <div className="flex-1 max-w-md mx-8 hidden md:block relative"> {/* Added relative for dropdown positioning */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
              <Input
                placeholder="Pesquisar workflows, tarefas, modelos..." // Updated placeholder
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)} // Show results if any when focused
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)} // Hide results after a small delay to allow click on links
                className={`pl-10 h-8 ${isDarkMode ? 'bg-[#131313] border-[#656464] text-[#D9D9D9]' : 'bg-gray-50 border-gray-300 text-gray-900'} focus:border-[#E50F5F]`}
              />
            </div>
            
            {/* Resultados da Pesquisa */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1C1C1C] border border-[#656464] rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                {searchResults.map((result) => (
                  <a
                    key={`${result.type}-${result.id}`}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleGlobalSearchNavigation(result.url);
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-[#656464]/20 transition-colors border-b border-[#656464] last:border-b-0"
                  >
                    <div className="w-8 h-8 rounded bg-[#E50F5F]/20 flex items-center justify-center">
                      {result.type === 'workflow' && <Settings className="w-4 h-4 text-[#E50F5F]" />}
                      {result.type === 'activity' && <Activity className="w-4 h-4 text-[#E50F5F]" />}
                      {result.type === 'template' && <FileText className="w-4 h-4 text-[#E50F5F]" />}
                      {result.type === 'playbook' && <BookOpen className="w-4 h-4 text-[#E50F5F]" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#D9D9D9]">{result.title}</p>
                      <p className="text-xs text-[#9CA3AF]">{result.subtitle}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Controles Direita */}
          <div className="flex items-center gap-2">
            {/* Toggle Dark/Light Mode */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={`${isDarkMode ? 'text-[#D9D9D9] hover:bg-[#656464]/20' : 'text-gray-600 hover:bg-gray-100'} w-8 h-8`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Avatar do Usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-8 h-8 p-0">
                  <Avatar className="w-7 h-7 bg-[#E50F5F]">
                    <AvatarImage src={user?.photo_url} className="object-cover" />
                    <AvatarFallback className="bg-[#E50F5F] text-white text-xs font-semibold">
                      {user?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`${isDarkMode ? 'bg-[#1C1C1C] border-[#656464]' : 'bg-white border-gray-200'} w-56`}>
                <div className="px-3 py-2">
                  <p className={`font-medium ${isDarkMode ? 'text-[#D9D9D9]' : 'text-gray-900'} text-sm`}>
                    {user?.full_name || 'Usuário'}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">{user?.email}</p>
                </div>
                <DropdownMenuSeparator className="border-[#656464]" />
                <DropdownMenuItem asChild>
                  <Link 
                    to={createPageUrl("Settings")} 
                    className={`flex items-center gap-2 ${isDarkMode ? 'text-[#D9D9D9] hover:bg-[#656464]/20' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <Settings className="w-4 h-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-[#656464]" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className={`flex items-center gap-2 ${isDarkMode ? 'text-red-400 hover:bg-red-500/20' : 'text-red-600 hover:bg-red-50'}`}
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Layout Principal */}
        <div className="pt-12 flex h-screen">
          {/* Sidebar - Desktop */}
          {!isSettingsPage && (
            <div className={`hidden lg:flex ${isCollapsed ? 'w-0 overflow-hidden' : 'w-64'} ${isDarkMode ? 'bg-[#1C1C1C]' : 'bg-white'} border-r border-[#656464] transition-all duration-300 flex-col`}>
              {/* Seleção de Empresa */}
              <div className="p-4 border-b border-[#656464]">
                <Select value={selectedCompanyId} onValueChange={handleCompanyChange}>
                  <SelectTrigger className={`${isDarkMode ? 'bg-[#131313] border-[#656464] text-[#D9D9D9]' : 'bg-gray-50 border-gray-300 text-gray-900'} h-10`}>
                    <div className="flex items-center gap-2 overflow-hidden">
                      {selectedCompanyId === 'all' ? (
                        <Building2 className="w-5 h-5 text-[#E50F5F] flex-shrink-0" />
                      ) : (
                        <Avatar className="w-6 h-6 flex-shrink-0">
                          <AvatarImage src={selectedCompany?.logo_url} className="object-cover" />
                          <AvatarFallback className="text-xs bg-gray-700">{selectedCompany?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <span className="truncate">
                        {selectedCompanyName}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className={`${isDarkMode ? 'bg-[#1C1C1C] border-[#656464]' : 'bg-white border-gray-200'}`}>
                    <SelectItem value="all" className={`${isDarkMode ? 'text-[#D9D9D9] focus:bg-[#E50F5F]/20' : 'text-gray-900 focus:bg-[#E50F5F]/20'}`}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        <span>Todas Empresas</span>
                      </div>
                    </SelectItem>
                    {companies.map((company) => (
                      <SelectItem 
                        key={company.id} 
                        value={company.id} 
                        className={`${isDarkMode ? 'text-[#D9D9D9] focus:bg-[#E50F5F]/20' : 'text-gray-900 focus:bg-[#E50F5F]/20'}`}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={company.logo_url} className="object-cover" />
                            <AvatarFallback className="text-xs bg-gray-700">{company.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{company.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Seleção de Funcionalidade */}
              <div className="p-4 border-b border-[#656464]">
                {!isCollapsed && (
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-[#E50F5F]/10' : 'bg-[#E50F5F]/10'} border border-[#E50F5F]/30`}>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#E50F5F]" />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-[#D9D9D9]' : 'text-gray-900'}`}>
                        Gestão de Atividades
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Botão Criar */}
              <div className="p-4 border-b border-[#656464]">
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button className="w-full bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white">
                              <Plus className="w-4 h-4 mr-2" />
                              {!isCollapsed && "Criar"}
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className={`${isDarkMode ? 'bg-[#1C1C1C] border-[#656464]' : 'bg-white border-gray-200'}`}>
                          <DropdownMenuItem onClick={() => setShowActivityModal(true)} className={`${isDarkMode ? 'text-[#D9D9D9] hover:bg-[#656464]/20' : 'text-gray-900 hover:bg-[#656464]/20'}`}>
                              <Activity className="w-4 h-4 mr-2" />
                              Atividade
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setShowTemplateModal(true)} className={`${isDarkMode ? 'text-[#D9D9D9] hover:bg-[#656464]/20' : 'text-gray-900 hover:bg-gray-100'}`}>
                              <FileText className="w-4 h-4 mr-2" />
                              Modelo
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setShowPlaybookModal(true)} className={`${isDarkMode ? 'text-[#D9D9D9] hover:bg-[#656464]/20' : 'text-gray-900 hover:bg-gray-100'}`}>
                              <BookOpen className="w-4 h-4 mr-2" />
                              Playbook
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
              </div>

              {/* Navegação */}
              <div className="flex-1 p-2 custom-scrollbar overflow-y-auto">
                <div className="space-y-1">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.url}
                      className={`flex items-center gap-3 py-2 px-3 rounded-md transition-all duration-200 text-sm ${
                        location.pathname === item.url 
                          ? 'bg-[#E50F5F]/20 text-[#E50F5F] border-l-2 border-[#E50F5F]' 
                          : `${isDarkMode ? 'text-[#D9D9D9] hover:bg-[#E50F5F]/10' : 'text-gray-700 hover:bg-[#E50F5F]/10'} hover:text-[#E50F5F]`
                      } ${isCollapsed ? 'justify-center px-3' : 'px-3'}`}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </Link>
                  ))}
                  
                  {/* Link Convidar */}
                  <Link
                    to={createPageUrl("Management")}
                    className={`flex items-center gap-3 py-2 px-3 rounded-md transition-all duration-200 text-sm ${
                      location.pathname === createPageUrl("Management")
                        ? 'bg-[#E50F5F]/20 text-[#E50F5F] border-l-2 border-[#E50F5F]' 
                        : `${isDarkMode ? 'text-[#D9D9D9] hover:bg-[#E50F5F]/10' : 'text-gray-700 hover:bg-[#E50F5F]/10'} hover:text-[#E50F5F]`
                    } ${isCollapsed ? 'justify-center px-3' : 'px-3'}`}
                  >
                    <UserPlus className="w-4 h-4 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">Convidar</span>}
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* Sidebar Mobile - Mesmo conteúdo adaptado */}
          <div className={`lg:hidden fixed inset-y-0 left-0 w-64 ${isDarkMode ? 'bg-[#1C1C1C]' : 'bg-white'} border-r border-[#656464] transform transition-transform duration-300 z-40 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} pt-12`}>
            {/* Conteúdo idêntico ao sidebar desktop mas sem isCollapsed */}
            <div className="p-4 border-b border-[#656464]">
              <Select value={selectedCompanyId} onValueChange={handleCompanyChange}>
                <SelectTrigger className={`${isDarkMode ? 'bg-[#131313] border-[#656464] text-[#D9D9D9]' : 'bg-gray-50 border-gray-300 text-gray-900'} h-10`}>
                  <div className="flex items-center gap-2 overflow-hidden">
                    {selectedCompanyId === 'all' ? (
                      <Building2 className="w-5 h-5 text-[#E50F5F] flex-shrink-0" />
                    ) : (
                      <Avatar className="w-6 h-6 flex-shrink-0">
                        <AvatarImage src={selectedCompany?.logo_url} className="object-cover" />
                        <AvatarFallback className="text-xs bg-gray-700">{selectedCompany?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <span className="truncate">
                      <SelectValue placeholder="Selecionar empresa" />
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className={`${isDarkMode ? 'bg-[#1C1C1C] border-[#656464]' : 'bg-white border-gray-200'}`}>
                  <SelectItem value="all" className={`${isDarkMode ? 'text-[#D9D9D9] focus:bg-[#E50F5F]/20' : 'text-gray-900 focus:bg-[#E50F5F]/20'}`}>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      <span>Todas Empresas</span>
                    </div>
                  </SelectItem>
                  {companies.map((company) => (
                    <SelectItem 
                      key={company.id} 
                      value={company.id} 
                      className={`${isDarkMode ? 'text-[#D9D9D9] focus:bg-[#E50F5F]/20' : 'text-gray-900 focus:bg-[#E50F5F]/20'}`}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={company.logo_url} className="object-cover" />
                          <AvatarFallback className="text-xs bg-gray-700">{company.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{company.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 border-b border-[#656464]">
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-[#E50F5F]/10' : 'bg-[#E50F5F]/10'} border border-[#E50F5F]/30`}>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#E50F5F]" />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-[#D9D9D9]' : 'text-gray-900'}`}>
                    Gestão de Atividades
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-b border-[#656464]">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className={`${isDarkMode ? 'bg-[#1C1C1C] border-[#656464]' : 'bg-white border-gray-200'}`}>
                  <DropdownMenuItem onClick={() => setShowActivityModal(true)} className={`${isDarkMode ? 'text-[#D9D9D9] hover:bg-[#656464]/20' : 'text-gray-900 hover:bg-[#656464]/20'}`}>
                    <Activity className="w-4 h-4 mr-2" />
                    Atividade
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowTemplateModal(true)} className={`${isDarkMode ? 'text-[#D9D9D9] hover:bg-[#656464]/20' : 'text-gray-900 hover:bg-gray-100'}`}>
                    <FileText className="w-4 h-4 mr-2" />
                    Modelo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowPlaybookModal(true)} className={`${isDarkMode ? 'text-[#D9D9D9] hover:bg-[#656464]/20' : 'text-gray-900 hover:bg-gray-100'}`}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Playbook
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex-1 p-2 custom-scrollbar overflow-y-auto">
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.url}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 py-2 px-3 rounded-md transition-all duration-200 text-sm ${
                      location.pathname === item.url 
                        ? 'bg-[#E50F5F]/20 text-[#E50F5F] border-l-2 border-[#E50F5F]' 
                        : `${isDarkMode ? 'text-[#D9D9D9] hover:bg-[#E50F5F]/10' : 'text-gray-700 hover:bg-[#E50F5F]/10'} hover:text-[#E50F5F]`
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                ))}
                
                <Link
                  to={createPageUrl("Management")}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 py-2 px-3 rounded-md transition-all duration-200 text-sm ${
                    location.pathname === createPageUrl("Management")
                      ? 'bg-[#E50F5F]/20 text-[#E50F5F] border-l-2 border-[#E50F5F]' 
                      : `${isDarkMode ? 'text-[#D9D9D9] hover:bg-[#E50F5F]/10' : 'text-gray-700 hover:bg-[#E50F5F]/10'} hover:text-[#E50F5F]`
                  }`}
                >
                  <UserPlus className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">Convidar</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Overlay Mobile */}
          {isMobileMenuOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-30 pt-12"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Conteúdo Principal */}
          <div className="flex-1 flex flex-col min-h-screen">
            <main className={`flex-1 ${isDarkMode ? 'bg-[#131313]' : 'bg-gray-50'} overflow-auto`}>
              {children}
            </main>
          </div>
        </div>
      </div>
      
      {/* Modais de Criação Globais */}
      <ActivityModal
        open={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        onSuccess={() => { console.log('Activity created/updated'); setShowActivityModal(false); }}
        users={users}
        workflows={workflows}
        selectedCompany={selectedCompanyId}
        isTemplateMode={false}
      />
       <ActivityModal
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSuccess={() => { console.log('Template created/updated'); setShowTemplateModal(false); }}
        users={users}
        workflows={workflows}
        selectedCompany={selectedCompanyId}
        isTemplateMode={true}
      />
      <CreatePlaybookModal
        open={showPlaybookModal}
        onClose={() => setShowPlaybookModal(false)}
        onSuccess={() => { console.log('Playbook created'); setShowPlaybookModal(false); }}
        templates={[]}
        selectedCompanyId={selectedCompanyId}
      />
    </CompanyContext.Provider>
  );
}

