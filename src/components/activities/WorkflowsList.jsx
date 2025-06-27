import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Archive, Users, Activity, Eye } from "lucide-react";

import WorkflowDetailsModal from "./WorkflowDetailsModal";
import EditWorkflowModal from "./EditWorkflowModal";
import ArchiveWorkflowModal from "./ArchiveWorkflowModal";

export default function WorkflowsList({ workflows, onRefresh, searchTerm, onOpenWorkflow, activities = [] }) {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCardClick = (workflow) => {
    setSelectedWorkflow(workflow);
    setShowEdit(true);
  };

  const handleArchive = (e, workflow) => {
    e.stopPropagation();
    setSelectedWorkflow(workflow);
    setShowArchive(true);
  };

  const getActivityCount = (workflowId) => {
    return activities.filter(activity => activity.workflow_id === workflowId).length;
  };

  const getUserCount = (workflow) => {
    return (workflow.invited_users?.length || 0) + 1;
  };

  return (
    <>
      {filteredWorkflows.length === 0 ? (
        <Card className="bg-[#1C1C1C] border-[#656464]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="w-12 h-12 text-[#9CA3AF] mb-4" />
            <h3 className="text-lg font-medium text-[#D9D9D9] mb-2">Nenhum workflow encontrado</h3>
            <p className="text-[#9CA3AF] text-center">
              {searchTerm ? "Tente uma busca diferente" : "Crie seu primeiro workflow para começar"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow) => (
            <Card 
              key={workflow.id} 
              className="bg-[#1C1C1C] border-[#656464] hover:border-[#E50F5F]/50 transition-all cursor-pointer"
              onClick={() => handleCardClick(workflow)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-[#D9D9D9] mb-2">{workflow.name}</CardTitle>
                    <div className="flex items-center gap-3 text-sm text-[#9CA3AF]">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {getUserCount(workflow)} usuários
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        {getActivityCount(workflow.id)} atividades
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${
                      workflow.permissions === 'public' 
                        ? 'border-green-500 text-green-400' 
                        : 'border-yellow-500 text-yellow-400'
                    }`}
                  >
                    {workflow.permissions === 'public' ? 'Público' : 'Privado'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Fases do Workflow */}
                {workflow.stages && workflow.stages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-[#9CA3AF] mb-2">Fases:</p>
                    <div className="flex flex-wrap gap-1">
                      {workflow.stages.slice(0, 3).map((stage, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="border-[#656464] text-[#D9D9D9] text-xs"
                        >
                          {stage.name}
                        </Badge>
                      ))}
                      {workflow.stages.length > 3 && (
                        <Badge variant="outline" className="border-[#656464] text-[#D9D9D9] text-xs">
                          +{workflow.stages.length - 3} mais
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Usuários Convidados */}
                {workflow.invited_users && workflow.invited_users.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-[#9CA3AF] mb-2">Equipe:</p>
                    <div className="flex -space-x-2">
                      {workflow.invited_users.slice(0, 4).map((userId, index) => (
                        <Avatar key={index} className="w-6 h-6 bg-[#E50F5F] border-2 border-[#1C1C1C]">
                          <AvatarFallback className="bg-[#E50F5F] text-white text-xs">
                            {String.fromCharCode(65 + index)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {workflow.invited_users.length > 4 && (
                        <div className="w-6 h-6 bg-[#656464] rounded-full border-2 border-[#1C1C1C] flex items-center justify-center">
                          <span className="text-xs text-[#D9D9D9]">+{workflow.invited_users.length - 4}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Botões de Ação */}
                <div className="flex items-center gap-2 pt-3 border-t border-[#656464]">
                  <Button 
                    size="sm" 
                    className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenWorkflow(workflow.id);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Abrir
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-orange-500/10 border-orange-500 text-orange-500 hover:bg-orange-500/20"
                    onClick={(e) => handleArchive(e, workflow)}
                  >
                    <Archive className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <WorkflowDetailsModal 
        workflow={selectedWorkflow}
        open={showDetails}
        onClose={() => {
          setShowDetails(false);
          setSelectedWorkflow(null);
        }}
        onRefresh={onRefresh}
      />
      
      <EditWorkflowModal 
        workflow={selectedWorkflow}
        open={showEdit}
        onClose={() => {
          setShowEdit(false);
          setSelectedWorkflow(null);
        }}
        onSuccess={onRefresh}
        activities={activities}
      />
      
      <ArchiveWorkflowModal 
        workflow={selectedWorkflow}
        open={showArchive}
        onClose={() => {
          setShowArchive(false);
          setSelectedWorkflow(null);
        }}
        onSuccess={onRefresh}
        activities={activities}
        workflows={workflows}
      />
    </>
  );
}