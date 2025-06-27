import React, { useState, useEffect, useMemo, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  List,
  Settings,
  X,
  FileText,
  BookOpen,
  Shield
} from "lucide-react";
import { Activity } from "@/api/entities";
import { Workflow } from "@/api/entities";
import { User as UserEntity } from "@/api/entities";
import { ActivityTemplate } from "@/api/entities";
import { Playbook } from "@/api/entities";
import { CompanyContext } from "@/components/contexts/CompanyContext";

import WorkflowsList from "../components/activities/WorkflowsList";
import ActivitiesList from "../components/activities/ActivitiesList";
import CreateWorkflowModal from "../components/activities/CreateWorkflowModal";
import ActivityModal from "../components/activities/ActivityModal";
import TemplatesList from "../components/activities/TemplatesList";
import PlaybooksList from "../components/activities/PlaybooksList";
import PagePermissionsModal from "../components/common/PagePermissionsModal";
import CreateActivityDropdown from "../components/activities/CreateActivityDropdown";

export default function Activities() {
  const { selectedCompanyId, setSelectedCompanyId, companies } = useContext(CompanyContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [workflows, setWorkflows] = useState([]);
  const [activities, setActivities] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [playbooks, setPlaybooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const [activeTab, setActiveTab] = useState("activities");
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [filters, setFilters] = useState({
    searchTerm: "",
    status: [],
    priority: [],
    assignedTo: "",
    workflowId: "",
    stage: "",
    users: [],
    period: "all",
    companyId: selectedCompanyId || "all"
  });

  const pageTitle = "Gestão de Atividades";

  useEffect(() => {
    loadPageData();
  }, []);

  useEffect(() => {
    setFilters(prev => ({...prev, companyId: selectedCompanyId || 'all'}));
  }, [selectedCompanyId]);

  useEffect(() => {
      const params = new URLSearchParams(location.search);
      const tab = params.get('tab');
      const focusId = params.get('focus');

      if (tab) {
          setActiveTab(tab);
      }
      
      if (focusId && activities.length > 0) {
          const activityToOpen = activities.find(a => a.id === focusId);
          if (activityToOpen) {
              setEditingActivity(activityToOpen);
              setShowActivityModal(true);
              // Limpa o parâmetro da URL para não reabrir
              const newUrl = location.pathname + `?tab=${activeTab || 'activities'}`;
              navigate(newUrl, { replace: true });
          }
      }
  }, [location.search, activities, navigate, activeTab]);

  const loadPageData = async () => {
    setIsLoading(true);
    try {
      const user = await UserEntity.me();
      setCurrentUser(user);

      const [workflowsData, activitiesData, templatesData, playbooksData, usersData] = await Promise.all([
        Workflow.list("-created_date"),
        Activity.list("-created_date"),
        ActivityTemplate.list("-created_date"),
        Playbook.list("-created_date"),
        UserEntity.list()
      ]);
      
      const accessibleWorkflows = workflowsData.filter(w => 
        w.permissions === 'public' || 
        w.invited_users?.includes(user?.id) || 
        w.created_by === user?.email
      );
      
      const accessibleWorkflowIds = accessibleWorkflows.map(w => w.id);
      const userActivities = activitiesData.filter(a => 
        accessibleWorkflowIds.includes(a.workflow_id)
      );

      setWorkflows(accessibleWorkflows);
      setActivities(userActivities);
      setTemplates(templatesData);
      setPlaybooks(playbooksData);
      setUsers(usersData);

    } catch (error) {
      console.error("Erro ao carregar dados da página:", error);
    }
    setIsLoading(false);
  };
  
  const handleOpenWorkflow = (workflowId) => {
    setActiveTab("activities");
    setFilters(prev => ({
      ...prev,
      workflowId: workflowId,
      searchTerm: "",
      assignedTo: "",
      stage: ""
    }));
  };

  const clearWorkflowFilter = () => {
    setFilters(prev => ({
      ...prev,
      workflowId: "",
      stage: ""
    }));
  };

  const getSelectedWorkflow = () => {
    return workflows.find(w => w.id === filters.workflowId);
  };
  
  const handleCreateActivity = () => {
    setEditingActivity(null);
    setShowActivityModal(true);
  };
  
  const handleEditActivity = (activity) => {
      setEditingActivity(activity);
      setShowActivityModal(true);
  }

  const handleSearch = (e) => {
    setFilters((prev) => ({ ...prev, searchTerm: e.target.value }));
  };

  const filteredWorkflows = useMemo(() => {
    let filtered = workflows;
    if (filters.companyId && filters.companyId !== 'all') {
      filtered = filtered.filter(w => w.company_id === filters.companyId);
    }
    if (activeTab === 'workflows' && filters.searchTerm) {
      filtered = filtered.filter(w => w.name.toLowerCase().includes(filters.searchTerm.toLowerCase()));
    }
    return filtered;
  }, [workflows, filters.companyId, filters.searchTerm, activeTab]);

  const filteredTemplates = useMemo(() => {
    let filtered = templates;
    if (filters.companyId && filters.companyId !== 'all') {
      filtered = filtered.filter(t => t.company_id === filters.companyId);
    }
    if (activeTab === 'templates' && filters.searchTerm) {
      filtered = filtered.filter(t => t.name.toLowerCase().includes(filters.searchTerm.toLowerCase()));
    }
    return filtered;
  }, [templates, filters.companyId, filters.searchTerm, activeTab]);

  const filteredPlaybooks = useMemo(() => {
    let filtered = playbooks;
    if (filters.companyId && filters.companyId !== 'all') {
      filtered = filtered.filter(p => p.company_id === filters.companyId);
    }
    if (activeTab === 'playbooks' && filters.searchTerm) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(filters.searchTerm.toLowerCase()));
    }
    return filtered;
  }, [playbooks, filters.companyId, filters.searchTerm, activeTab]);

  return (
    <>
      <div className="w-full min-h-screen bg-[#131313] p-4 lg:p-6">
        <div className="w-full max-w-none mx-auto space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-bold text-[#D9D9D9]">{pageTitle}</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPermissionsModal(true)}
                className="text-[#9CA3AF] hover:text-[#E50F5F] hover:bg-[#E50F5F]/10"
              >
                <Shield className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
                <Input
                  placeholder="Pesquisar..."
                  value={filters.searchTerm}
                  onChange={handleSearch}
                  className="pl-10 bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex-shrink-0 bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/10 hover:text-[#E50F5F]"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <CreateActivityDropdown
                onCreateActivity={handleCreateActivity}
                onCreateWorkflow={() => setShowCreateWorkflow(true)}
                onSuccess={loadPageData}
                selectedCompanyId={selectedCompanyId}
              />
            </div>
          </div>

          {showAdvancedFilters && (
            <div className="p-4 bg-[#1C1C1C] border border-[#656464] rounded-lg text-[#D9D9D9]">
              <p>Filtros avançados serão implementados aqui...</p>
            </div>
          )}

          {filters.workflowId && (
            <div className="flex items-center gap-2 p-3 bg-[#1C1C1C] border border-[#E50F5F]/50 rounded-lg">
              <span className="text-sm text-[#D9D9D9]">Filtrando por workflow:</span>
              <Badge className="bg-[#E50F5F]/20 text-[#E50F5F] border-[#E50F5F]/30">
                {getSelectedWorkflow()?.name || 'Workflow'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearWorkflowFilter}
                className="text-[#9CA3AF] hover:text-[#E50F5F] h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-[#1C1C1C] border border-[#656464]">
              <TabsTrigger
                value="activities"
                className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white flex items-center gap-2"
              >
                <List className="w-4 h-4" />
                Tarefas
              </TabsTrigger>
              <TabsTrigger
                value="workflows"
                className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Workflows
              </TabsTrigger>
              <TabsTrigger
                value="templates"
                className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Modelos
              </TabsTrigger>
              <TabsTrigger
                value="playbooks"
                className="data-[state=active]:bg-[#E50F5F] data-[state=active]:text-white flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Playbooks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activities" className="mt-6">
              <ActivitiesList
                activities={activities}
                workflows={workflows}
                users={users}
                companies={companies}
                onRefresh={loadPageData}
                filters={filters}
                setFilters={setFilters}
                selectedWorkflow={getSelectedWorkflow()}
                onCreateActivityClick={handleCreateActivity}
                onEditActivity={handleEditActivity}
              />
            </TabsContent>

            <TabsContent value="workflows" className="mt-6">
              <WorkflowsList
                workflows={filteredWorkflows}
                activities={activities}
                onRefresh={loadPageData}
                searchTerm={filters.searchTerm}
                onOpenWorkflow={handleOpenWorkflow}
              />
            </TabsContent>

            <TabsContent value="templates" className="mt-6">
              <TemplatesList
                templates={filteredTemplates}
                onRefresh={loadPageData}
                companies={companies}
                users={users}
                workflows={workflows}
                selectedCompanyId={selectedCompanyId}
              />
            </TabsContent>

            <TabsContent value="playbooks" className="mt-6">
              <PlaybooksList
                playbooks={filteredPlaybooks}
                templates={filteredTemplates}
                onRefresh={loadPageData}
                companies={companies}
                users={users}
                workflows={workflows}
                selectedCompanyId={selectedCompanyId}
              />
            </TabsContent>
          </Tabs>

          <CreateWorkflowModal
            open={showCreateWorkflow}
            onClose={() => setShowCreateWorkflow(false)}
            onSuccess={loadPageData}
            selectedCompany={selectedCompanyId}
          />

          <ActivityModal
            activity={editingActivity}
            workflow={workflows.find(w => w.id === (editingActivity?.workflow_id || filters.workflowId))}
            open={showActivityModal}
            onClose={() => {
              setShowActivityModal(false);
              setEditingActivity(null);
            }}
            onSuccess={() => {
              loadPageData();
              setShowActivityModal(false);
              setEditingActivity(null);
            }}
            users={users}
            workflows={workflows}
            selectedCompany={selectedCompanyId}
          />
        </div>
      </div>
      <PagePermissionsModal
        open={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        pageName="Activities"
        pageTitle={pageTitle}
        companyId={selectedCompanyId}
      />
    </>
  );
}