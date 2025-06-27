
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Calendar, Flag, Filter, Plus, Search, CalendarIcon, Archive, ArrowDown, ArrowUp, User as UserIcon, Edit } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User as UserEntity } from "@/api/entities";
import { Activity } from "@/api/entities";
import ActivityModal from "./ActivityModal";
import AdvancedFiltersModal from "./AdvancedFiltersModal";
import PeriodSelectorModal from "./PeriodSelectorModal";
import RecurrenceModal from "./RecurrenceModal";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import CreateActivityDropdown from "./CreateActivityDropdown";
import ArchiveActivityModal from "./ArchiveActivityModal";

const InlineEdit = ({ value, type, options = [], onSave, className = "" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (type === 'date') {
    return (
      <Popover open={showCalendar} onOpenChange={setShowCalendar}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={`h-auto p-1 justify-start font-normal text-left ${className}`}
            onClick={() => setShowCalendar(true)}
          >
            {value ? new Date(value).toLocaleDateString('pt-BR') : 'N/A'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-[#656464]">
          <CalendarPicker
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(date) => {
              if (date) {
                onSave(date.toISOString());
              }
              setShowCalendar(false);
            }}
            className="text-white"
            classNames={{
              day_selected: "bg-[#E50F5F] text-white hover:bg-[#E50F5F]",
              day_today: "bg-[#E50F5F]/20 text-[#E50F5F]",
              day: "text-[#D9D9D9] hover:bg-[#656464]/20",
              nav_button: "text-[#D9D9D9] hover:bg-[#656464]/20",
              nav_button_previous: "text-[#D9D9D9] hover:bg-[#656464]/20",
              nav_button_next: "text-[#D9D9D9] hover:bg-[#656464]/20",
              caption: "text-[#D9D9D9]",
              head_cell: "text-[#9CA3AF]",
              table: "bg-[#1C1C1C]"
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  }

  if (type === 'priority') {
    const priorityIcons = {
      low: <Flag className="w-4 h-4 text-blue-500" />,
      medium: <Flag className="w-4 h-4 text-yellow-500" />,
      high: <Flag className="w-4 h-4 text-red-500" />
    };

    return (
      <Select
        value={value}
        onValueChange={(newValue) => {
          onSave(newValue);
        }}
      >
        <SelectTrigger className={`h-auto p-1 border-none bg-transparent hover:bg-[#656464]/10 w-8 ${className}`}>
          {priorityIcons[value] || <Flag className="w-4 h-4 text-gray-500" />}
        </SelectTrigger>
        <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
          <SelectItem value="low">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-blue-500" />
              Baixa
            </div>
          </SelectItem>
          <SelectItem value="medium">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-yellow-500" />
              Média
            </div>
          </SelectItem>
          <SelectItem value="high">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-red-500" />
              Alta
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    );
  }

  if (type === 'select') {
    return (
      <Select
        value={value}
        onValueChange={(newValue) => {
          onSave(newValue);
        }}
      >
        <SelectTrigger className={`h-auto p-1 border-none bg-transparent hover:bg-[#656464]/10 ${className}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (isEditing) {
    return (
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyPress}
        className={`h-6 p-1 text-sm bg-transparent border-[#E50F5F] ${className}`}
        autoFocus
      />
    );
  }

  return (
    <Button
      variant="ghost"
      className={`h-auto p-1 justify-start font-normal text-left hover:bg-[#656464]/10 ${className}`}
      onClick={() => setIsEditing(true)}
    >
      {value || 'N/A'}
    </Button>
  );
};

function BulkActionsBar({ selectedIds, users, workflows, onApply, onClear }) {
    const [action, setAction] = useState('');
    const [targetUserId, setTargetUserId] = useState('');
    const [targetWorkflowId, setTargetWorkflowId] = useState('');
    const [targetStage, setTargetStage] = useState('');
    const [dueDate, setDueDate] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState('');

    const targetWorkflow = workflows.find(w => w.id === targetWorkflowId);

    const handleApply = () => {
        let updates = {};
        if (action === 'assign' && targetUserId) {
            updates.assigned_to = [targetUserId];
        }
        if (action === 'move' && targetWorkflowId && targetStage) {
            updates.workflow_id = targetWorkflowId;
            updates.stage = targetStage;
        }
        if (action === 'set_due_date' && dueDate) {
            updates.due_date = dueDate.toISOString();
        }

        if (action === 'delete' && deleteConfirm === 'Excluir tudo') {
            onApply({ action: 'delete' });
        } else if (action !== 'delete') {
            onApply({ action, updates });
        }
    };

    return (
        <div className="p-4 bg-[#1C1C1C] border border-[#E50F5F] rounded-lg mb-6 flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-[#D9D9D9]">{selectedIds.length} atividade(s) selecionada(s)</span>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                <Select value={action} onValueChange={(value) => { setAction(value); setTargetUserId(''); setTargetWorkflowId(''); setTargetStage(''); setDueDate(null); setDeleteConfirm(''); }}>
                    <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#1C1C1C]">
                        <SelectValue placeholder="Ação em massa"/>
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                        <SelectItem value="assign">Atribuir responsável</SelectItem>
                        <SelectItem value="move">Mover para workflow</SelectItem>
                        <SelectItem value="set_due_date">Definir prazo</SelectItem>
                        <SelectItem value="delete">Excluir</SelectItem>
                    </SelectContent>
                </Select>

                {action === 'assign' && (
                    <Select value={targetUserId} onValueChange={setTargetUserId}>
                        <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#1C1C1C]">
                            <SelectValue placeholder="Selecionar usuário"/>
                        </SelectTrigger>
                        <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                            {users.map(u => (
                                <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {action === 'move' && (
                    <>
                        <Select value={targetWorkflowId} onValueChange={setTargetWorkflowId}>
                            <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#1C1C1C]">
                                <SelectValue placeholder="Workflow"/>
                            </SelectTrigger>
                            <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                                {workflows.map(w => (
                                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {targetWorkflow && (
                             <Select value={targetStage} onValueChange={setTargetStage}>
                                <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#1C1C1C]">
                                    <SelectValue placeholder="Fase"/>
                                    </SelectTrigger>
                                <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                                    {targetWorkflow.stages.map(s => (
                                        <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </>
                )}

                {action === 'set_due_date' && (
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#1C1C1C]">
                                {dueDate ? dueDate.toLocaleDateString('pt-BR') : "Selecionar data"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-[#656464]">
                            <CalendarPicker mode="single" selected={dueDate} onSelect={setDueDate} initialFocus/>
                        </PopoverContent>
                    </Popover>
                )}

                {action === 'delete' && (
                    <Input
                        className="bg-[#131313] border-[#656464] text-[#D9D9D9]"
                        placeholder='Digite "Excluir tudo"'
                        value={deleteConfirm}
                        onChange={e => setDeleteConfirm(e.target.value)}
                    />
                )}
            </div>
            <Button
                onClick={handleApply}
                className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
                disabled={
                    (action === 'assign' && !targetUserId) ||
                    (action === 'move' && (!targetWorkflowId || !targetStage)) ||
                    (action === 'set_due_date' && !dueDate) ||
                    (action === 'delete' && deleteConfirm !== 'Excluir tudo') ||
                    !action
                }
            >
                Aplicar
            </Button>
            <Button
                onClick={onClear}
                variant="ghost"
                className="text-[#D9D9D9] hover:bg-[#1C1C1C] hover:text-[#E50F5F]"
            >
                Limpar Seleção
            </Button>
        </div>
    );
}

const priorityConfig = {
    high: { label: 'Alta', color: 'text-red-500', icon: Flag },
    medium: { label: 'Média', color: 'text-yellow-500', icon: Flag },
    low: { label: 'Baixa', color: 'text-blue-500', icon: Flag }
};

const ChecklistAssigneePicker = ({ users, assignedTo, onUpdate }) => {
    const assignedUser = users.find(u => u.id === assignedTo);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="w-8 h-8 p-0 rounded-full">
                    {assignedUser ? (
                        <Avatar className="w-6 h-6">
                            <AvatarImage src={assignedUser.photo_url} />
                            <AvatarFallback className="bg-[#E50F5F] text-white text-xs">
                                {assignedUser.full_name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                    ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center">
                            <UserIcon className="w-3 h-3 text-gray-500" />
                        </div>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 bg-[#1C1C1C] border-[#656464] text-white p-0">
                <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
                    <div
                        onClick={() => onUpdate("")}
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-[#656464]/20 cursor-pointer"
                    >
                        <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center">
                            <UserIcon className="w-3 h-3 text-gray-500" />
                        </div>
                        <span className="text-sm">Ninguém</span>
                    </div>
                    {users.map(user => (
                        <div
                            key={user.id}
                            onClick={() => onUpdate(user.id)}
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-[#656464]/20 cursor-pointer"
                        >
                            <Avatar className="w-6 h-6">
                                <AvatarImage src={user.photo_url} />
                                <AvatarFallback className="bg-[#E50F5F] text-white text-xs">{user.full_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{user.full_name}</span>
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default function ActivitiesList({
  activities,
  workflows,
  users,
  companies,
  onRefresh,
  filters = {},
  setFilters,
  selectedWorkflow,
  onCreateActivityClick
}) {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);
  const [showRecurrence, setShowRecurrence] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedActivityIds, setSelectedActivityIds] = useState([]);
  const [collapsedSections, setCollapsedSections] = useState(new Set());
  const [groupBy, setGroupBy] = useState('dates');
  const [sortBy, setSortBy] = useState('due_date_asc');
  const [expandedActivityIds, setExpandedActivityIds] = useState(new Set());

  const loadCurrentUser = async () => {
    try {
      const user = await UserEntity.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Erro ao carregar usuário atual:", error);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const handleUpdateActivity = async (activityId, updates) => {
    try {
      await Activity.update(activityId, updates);
      
      // Verificar se é uma atividade recorrente que foi marcada como concluída
      const activity = activities.find(a => a.id === activityId);
      if (updates.status === 'completed' && activity?.recurrence_rule) {
        await createNextRecurrence(activity);
      }
      
      onRefresh();
    } catch (error) {
      console.error("Erro ao atualizar atividade:", error);
    }
  };

  const createNextRecurrence = async (activity) => {
    try {
      const rule = activity.recurrence_rule;
      if (!rule || !rule.frequency) return;

      let nextDate = new Date(activity.due_date || new Date());
      
      switch (rule.frequency) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + (rule.interval || 1));
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + (rule.interval || 1) * 7);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + (rule.interval || 1));
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + (rule.interval || 1));
          break;
      }

      // Verificar se a recorrência não passou do limite
      if (rule.until && nextDate > new Date(rule.until)) {
        return;
      }

      // Criar nova atividade
      const newActivity = {
        ...activity,
        id: undefined, // Must be undefined for a new activity
        created_date: undefined, // Reset creation date
        updated_date: undefined, // Reset updated date
        due_date: nextDate.toISOString(),
        status: 'pending', // New activity starts as pending
        checklist: activity.checklist?.map(item => ({
          ...item,
          id: undefined, // Reset checklist item IDs
          completed: false // Checklist items are not completed in new activity
        })) || [],
        recurrence_rule: activity.recurrence_rule, // Carry over recurrence rule
      };

      await Activity.create(newActivity);
    } catch (error) {
      console.error("Erro ao criar próxima recorrência:", error);
    }
  };

  const handleChecklistUpdate = async (activity, checklistItemId, updates) => {
    const newChecklist = activity.checklist.map(item =>
        item.id === checklistItemId ? { ...item, ...updates } : item
    );
    await handleUpdateActivity(activity.id, { checklist: newChecklist });
  };

  const handleInlineEdit = async (activity, field, value) => {
    await handleUpdateActivity(activity.id, { [field]: value });
  };

  // Original handleActivityCardClick function is effectively replaced by specific controls (checkbox, chevron, InlineEdit, buttons)
  // For selection with Ctrl/Meta key, we can rely on the checkbox directly.
  const handleActivityClick = (e, activityId) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedActivityIds(prev =>
        prev.includes(activityId)
          ? prev.filter(id => id !== activityId)
          : [...prev, activityId]
      );
    }
  };

  const handleArchive = (e, activity) => {
    e.stopPropagation();
    setSelectedActivity(activity);
    setShowArchive(true);
  };

  const handleApplyBulkActions = async ({ action, updates }) => {
    try {
      if (action === 'delete') {
        await Activity.bulkDelete(selectedActivityIds);
      } else {
        await Activity.bulkUpdate(selectedActivityIds, updates);
      }
      setSelectedActivityIds([]);
      onRefresh();
    } catch (error) {
      console.error("Erro ao aplicar ação em massa:", error);
    }
  };

  const applyAdvancedFilters = (advancedFilters) => {
    setFilters(prev => ({ ...prev, ...advancedFilters }));
  };

  const applyPeriodFilter = (period) => {
    setFilters(prev => ({
      ...prev,
      periodFilter: period,
      dueDateFrom: period.startDate,
      dueDateTo: period.endDate
    }));
  };

  const applyRecurrence = (recurrenceConfig) => {
    console.log("Recorrência configurada:", recurrenceConfig);
  };

  const getWorkflowName = (workflowId) => workflows.find(w => w.id === workflowId)?.name || 'Sem Workflow';
  const getUserName = (userId) => users.find(u => u.id === userId)?.full_name || 'Não atribuído';
  const getStageName = (activity) => activity.stage || 'Sem Fase';
  const getTaskAssignees = (activity) => {
    if (!activity?.checklist || activity.checklist.length === 0) return [];
    const assigneeIds = new Set(activity.checklist.map(item => item.assigned_to).filter(Boolean));
    return users.filter(user => assigneeIds.has(user.id));
  };

  const getStageColor = (type) => {
    switch (type) {
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      case 'in_progress':
      default:
        return 'bg-blue-500';
    }
  };

  const getPriorityOptions = () => [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' }
  ];

  const getWorkflowOptions = () => workflows.map(w => ({
    value: w.id,
    label: w.name
  }));

  const getStageOptions = (workflowId) => {
    const workflow = workflows.find(w => w.id === workflowId);
    return workflow?.stages?.map(s => ({
      value: s.name,
      label: s.name
    })) || [];
  };

  const processedActivities = useMemo(() => {
    const filtered = activities.filter(activity => {
        const matchesSearch = !filters.searchTerm || activity.title?.toLowerCase().includes(filters.searchTerm.toLowerCase());
        const matchesCompany = !filters.companyId || filters.companyId === 'all' || activity.company_id === filters.companyId;
        const matchesWorkflow = !filters.workflowId || activity.workflow_id === filters.workflowId;
        return matchesSearch && matchesCompany && matchesWorkflow;
    });

    const sorted = [...filtered].sort((a, b) => {
        const [sortField, sortDir] = sortBy.split('_');
        const dir = sortDir === 'asc' ? 1 : -1;

        let valA, valB;
        switch (sortField) {
            case 'name':
                valA = a.title.toLowerCase();
                valB = b.title.toLowerCase();
                break;
            case 'due':
                valA = a.due_date ? new Date(a.due_date) : new Date('2999-12-31');
                valB = b.due_date ? new Date(b.due_date) : new Date('2999-12-31');
                break;
            case 'created':
                valA = new Date(a.created_date);
                valB = new Date(b.created_date);
                break;
            default:
                return 0;
        }

        if (valA < valB) return -1 * dir;
        if (valA > valB) return 1 * dir;
        return 0;
    });

    const groups = {};
    sorted.forEach(activity => {
        let groupKey;
        let groupName;

        switch (groupBy) {
            case 'assignee':
                const assignees = getTaskAssignees(activity);
                if (assignees && assignees.length > 0) {
                    assignees.forEach(user => {
                        groupKey = user.id;
                        groupName = user.full_name;
                        if (!groups[groupKey]) groups[groupKey] = { name: groupName, activities: [] };
                        groups[groupKey].activities.push(activity);
                    });
                } else {
                    groupKey = 'unassigned';
                    groupName = 'Não atribuído';
                    if (!groups[groupKey]) groups[groupKey] = { name: groupName, activities: [] };
                    groups[groupKey].activities.push(activity);
                }
                break;
            case 'stage':
                groupKey = getStageName(activity);
                groupName = groupKey;
                if (!groups[groupKey]) groups[groupKey] = { name: groupName, activities: [] };
                groups[groupKey].activities.push(activity);
                break;
            case 'workflow':
                groupKey = activity.workflow_id;
                groupName = getWorkflowName(activity.workflow_id);
                if (!groups[groupKey]) groups[groupKey] = { name: groupName, activities: [] };
                groups[groupKey].activities.push(activity);
                break;
            case 'dates':
            default:
                const today = new Date(); today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
                const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);

                if (!activity.due_date) {
                    groupKey = 'noDueDate';
                } else {
                    const dueDate = new Date(activity.due_date); dueDate.setHours(0, 0, 0, 0);
                    if (dueDate < today) groupKey = 'overdue';
                    else if (dueDate.getTime() === today.getTime()) groupKey = 'today';
                    else if (dueDate.getTime() === tomorrow.getTime()) groupKey = 'tomorrow';
                    else if (dueDate <= nextWeek) groupKey = 'this_week';
                    else groupKey = 'upcoming';
                }

                const groupNames = {
                    overdue: "Atrasadas", today: "Hoje", tomorrow: "Amanhã",
                    this_week: "Esta Semana", upcoming: "Próximas", noDueDate: "Sem Prazo"
                };
                groupName = groupNames[groupKey];
                if (!groups[groupKey]) groups[groupKey] = { name: groupName, activities: [] };
                groups[groupKey].activities.push(activity);
        }
    });

    const groupOrder = ['overdue', 'today', 'tomorrow', 'this_week', 'upcoming', 'noDueDate'];
    const orderedGroups = groupBy === 'dates'
        ? groupOrder.map(key => groups[key]).filter(Boolean)
        : Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));

    return orderedGroups;

  }, [activities, filters, sortBy, groupBy, users, workflows]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] w-40">
                <SelectValue placeholder="Agrupar por" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                <SelectItem value="dates">Datas</SelectItem>
                <SelectItem value="assignee">Responsáveis</SelectItem>
                <SelectItem value="stage">Fases</SelectItem>
                <SelectItem value="workflow">Workflows</SelectItem>
              </SelectContent>
            </Select>
             <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                <SelectItem value="due_date_asc">Prazo (mais recente)</SelectItem>
                <SelectItem value="due_date_desc">Prazo (mais antigo)</SelectItem>
                <SelectItem value="name_asc">Nome (A-Z)</SelectItem>
                <SelectItem value="name_desc">Nome (Z-A)</SelectItem>
                <SelectItem value="created_date_asc">Criação (mais recente)</SelectItem>
                <SelectItem value="created_date_desc">Criação (mais antigo)</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setShowAdvancedFilters(true)} variant="outline" className="border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:border-[#E50F5F] hover:text-[#E50F5F] bg-[#131313]">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
            </Button>
        </div>
        <CreateActivityDropdown
            onCreateNew={onCreateActivityClick}
            workflows={workflows}
            users={users}
            selectedCompanyId={filters.companyId}
            onRefresh={onRefresh}
        />
      </div>

       {selectedActivityIds.length > 1 && (
          <BulkActionsBar
              selectedIds={selectedActivityIds}
              users={users}
              workflows={workflows}
              onApply={handleApplyBulkActions}
              onClear={() => setSelectedActivityIds([])}
          />
       )}

      <div className="bg-[#1C1C1C] border border-[#656464] rounded-lg">
        <div className="grid grid-cols-[20px_1fr_50px_150px_150px_120px_120px_80px] gap-4 items-center p-3 text-xs font-medium text-[#9CA3AF] border-b border-[#656464]">
            <div />
            <div className="truncate">Nome</div>
            <div className="truncate">Urgência</div>
            <div className="truncate">Workflow</div>
            <div className="truncate">Fase</div>
            <div className="truncate">Prazo</div>
            <div className="truncate">Responsável</div>
            <div />
        </div>

        <div className="space-y-1 p-1">
        {processedActivities.length === 0 ? (
            <div className="text-center py-8 text-[#9CA3AF]">Nenhuma atividade encontrada.</div>
        ) : (
          processedActivities.map((group, groupIndex) => (
            <div key={group.name + groupIndex}>
                <div
                    className="flex items-center gap-2 p-2 cursor-pointer hover:bg-[#656464]/10"
                    onClick={() => setCollapsedSections(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(group.name)) newSet.delete(group.name);
                        else newSet.add(group.name);
                        return newSet;
                    })}
                >
                    {collapsedSections.has(group.name) ? <ChevronRight className="w-4 h-4 text-[#9CA3AF]" /> : <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />}
                    <h3 className="font-semibold text-sm text-[#D9D9D9]">{group.name} ({group.activities.length})</h3>
                </div>
                {!collapsedSections.has(group.name) && (
                    <div className="pl-4">
                        {group.activities.map((activity) => {
                            const assignees = getTaskAssignees(activity);
                            const isExpanded = expandedActivityIds.has(activity.id);

                            const activityWorkflow = workflows.find(w => w.id === activity.workflow_id);
                            const stage = activityWorkflow?.stages.find(s => s.name === activity.stage);
                            const stageType = stage?.type || 'in_progress';
                            const stageColor = getStageColor(stageType);

                            return (
                              <div key={activity.id} className="border-t border-[#3a3a3a]">
                                <div className="grid grid-cols-[20px_1fr_50px_150px_150px_120px_120px_80px] gap-4 items-center p-3 hover:bg-[#656464]/10 transition-colors">
                                    <div className="flex items-center justify-center">
                                      <div className={`w-2.5 h-2.5 rounded-full ${stageColor}`}></div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Checkbox
                                        checked={selectedActivityIds.includes(activity.id)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            setSelectedActivityIds(prev => [...prev, activity.id]);
                                          } else {
                                            setSelectedActivityIds(prev => prev.filter(id => id !== activity.id));
                                          }
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="border-[#656464] data-[state=checked]:bg-[#E50F5F] data-[state=checked]:border-[#E50F5F]"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-6 h-6 ml-1 text-[#9CA3AF] hover:bg-[#656464]/20"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setExpandedActivityIds(prev => {
                                                const newSet = new Set(prev);
                                                if (newSet.has(activity.id)) newSet.delete(activity.id);
                                                else newSet.add(activity.id);
                                                return newSet;
                                            });
                                        }}
                                      >
                                        {isExpanded ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
                                      </Button>
                                      <InlineEdit
                                        value={activity.title}
                                        type="text"
                                        onSave={(value) => handleInlineEdit(activity, 'title', value)}
                                        className="text-[#D9D9D9] text-sm flex-1"
                                      />
                                    </div>
                                    <div className="flex justify-center">
                                      <InlineEdit
                                        value={activity.priority}
                                        type="priority"
                                        onSave={(value) => handleInlineEdit(activity, 'priority', value)}
                                        className="text-sm"
                                      />
                                    </div>
                                    <InlineEdit
                                      value={activity.workflow_id}
                                      type="select"
                                      options={getWorkflowOptions()}
                                      onSave={(value) => handleInlineEdit(activity, 'workflow_id', value)}
                                      className="text-sm text-[#9CA3AF]"
                                    />
                                    <InlineEdit
                                      value={activity.stage}
                                      type="select"
                                      options={getStageOptions(activity.workflow_id)}
                                      onSave={(value) => handleInlineEdit(activity, 'stage', value)}
                                      className="text-sm text-[#9CA3AF]"
                                    />
                                    <InlineEdit
                                      value={activity.due_date}
                                      type="date"
                                      onSave={(value) => handleInlineEdit(activity, 'due_date', value)}
                                      className="text-sm text-[#9CA3AF]"
                                    />
                                    <div className="flex items-center -space-x-2">
                                        {assignees.slice(0, 3).map(user => (
                                            <Avatar key={user.id} className="w-6 h-6 border-2 border-[#1C1C1C]">
                                                <AvatarImage src={user.photo_url} />
                                                <AvatarFallback className="bg-[#E50F5F] text-white text-xs">{user.full_name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        ))}
                                        {assignees.length > 3 && (
                                            <div className="w-6 h-6 rounded-full bg-[#656464] flex items-center justify-center text-xs text-white border-2 border-[#1C1C1C]">
                                                +{assignees.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-white" onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedActivity(activity);
                                          setShowActivityModal(true);
                                        }}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-orange-400" onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedActivity(activity);
                                          setShowArchive(true);
                                        }}>
                                            <Archive className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {isExpanded && activity.checklist && activity.checklist.length > 0 && (
                                    <div className="pl-14 pr-4 pb-2 bg-[#131313] border-t border-[#3a3a3a]">
                                      {activity.checklist.map(item => (
                                        <div key={item.id} className="checklist-item grid grid-cols-[auto_1fr_auto] items-center gap-3 py-1">
                                          <Checkbox
                                            checked={item.completed}
                                            onCheckedChange={(checked) => handleChecklistUpdate(activity, item.id, { completed: checked })}
                                            className="border-[#656464] data-[state=checked]:bg-[#E50F5F] data-[state=checked]:border-[#E50F5F]"
                                          />
                                          <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>{item.item}</span>
                                          <ChecklistAssigneePicker
                                            users={users}
                                            assignedTo={item.assigned_to}
                                            onUpdate={(userId) => handleChecklistUpdate(activity, item.id, { assigned_to: userId })}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                )}
                              </div>
                            );
                        })}
                    </div>
                )}
            </div>
          ))
        )}
        </div>
      </div>

      <ActivityModal
        activity={selectedActivity}
        workflow={workflows.find(w => w.id === selectedActivity?.workflow_id)}
        open={showActivityModal}
        onClose={() => {
          setShowActivityModal(false);
          setSelectedActivity(null);
        }}
        onSuccess={onRefresh}
        workflows={workflows}
        users={users}
        currentUser={currentUser}
        selectedCompany={filters.companyId}
      />

      <AdvancedFiltersModal
        open={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        onApplyFilters={applyAdvancedFilters}
        workflows={workflows}
        users={users}
        companies={companies}
        initialFilters={filters}
      />

      <PeriodSelectorModal
        open={showPeriodSelector}
        onClose={() => setShowPeriodSelector(false)}
        onApplyPeriod={applyPeriodFilter}
        initialPeriod={filters.periodFilter}
      />

      <RecurrenceModal
        open={showRecurrence}
        onClose={() => setShowRecurrence(false)}
        onApplyRecurrence={applyRecurrence}
      />

      <ArchiveActivityModal
        activity={selectedActivity}
        open={showArchive}
        onClose={() => {
          setShowArchive(false);
          setSelectedActivity(null);
        }}
        onSuccess={onRefresh}
      />
    </div>
  );
}
