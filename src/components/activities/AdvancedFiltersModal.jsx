import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { 
  Filter, 
  Calendar as CalendarIcon, 
  Users, 
  Building2,
  Target,
  Flag,
  X
} from "lucide-react";
import { format } from "date-fns";

export default function AdvancedFiltersModal({ 
  open, 
  onClose, 
  onApplyFilters, 
  workflows, 
  users, 
  companies,
  initialFilters = {}
}) {
  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    assignedTo: [],
    workflows: [],
    companies: [],
    dueDateFrom: null,
    dueDateTo: null,
    createdDateFrom: null,
    createdDateTo: null,
    hasChecklist: null,
    isOverdue: false,
    isCompleted: false
  });

  useEffect(() => {
    if (open) {
      setFilters({
        status: initialFilters.status || [],
        priority: initialFilters.priority || [],
        assignedTo: initialFilters.assignedTo || [],
        workflows: initialFilters.workflows || [],
        companies: initialFilters.companies || [],
        dueDateFrom: initialFilters.dueDateFrom || null,
        dueDateTo: initialFilters.dueDateTo || null,
        createdDateFrom: initialFilters.createdDateFrom || null,
        createdDateTo: initialFilters.createdDateTo || null,
        hasChecklist: initialFilters.hasChecklist || null,
        isOverdue: initialFilters.isOverdue || false,
        isCompleted: initialFilters.isCompleted || false
      });
    }
  }, [open, initialFilters]);

  const handleArrayFilter = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: prev[filterKey].includes(value)
        ? prev[filterKey].filter(item => item !== value)
        : [...prev[filterKey], value]
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({
      status: [],
      priority: [],
      assignedTo: [],
      workflows: [],
      companies: [],
      dueDateFrom: null,
      dueDateTo: null,
      createdDateFrom: null,
      createdDateTo: null,
      hasChecklist: null,
      isOverdue: false,
      isCompleted: false
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    count += filters.status.length;
    count += filters.priority.length;
    count += filters.assignedTo.length;
    count += filters.workflows.length;
    count += filters.companies.length;
    if (filters.dueDateFrom || filters.dueDateTo) count++;
    if (filters.createdDateFrom || filters.createdDateTo) count++;
    if (filters.hasChecklist !== null) count++;
    if (filters.isOverdue) count++;
    if (filters.isCompleted) count++;
    return count;
  };

  const statusOptions = [
    { value: "pending", label: "Pendente", color: "bg-gray-500" },
    { value: "in_progress", label: "Em Andamento", color: "bg-blue-500" },
    { value: "completed", label: "Concluído", color: "bg-green-500" },
    { value: "cancelled", label: "Cancelado", color: "bg-red-500" }
  ];

  const priorityOptions = [
    { value: "low", label: "Baixa", color: "text-blue-500" },
    { value: "medium", label: "Média", color: "text-yellow-500" },
    { value: "high", label: "Alta", color: "text-red-500" }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-[#E50F5F] flex items-center gap-2">
              <Filter className="w-6 h-6" />
              Filtros Avançados
            </DialogTitle>
            {getActiveFiltersCount() > 0 && (
              <Badge className="bg-[#E50F5F] text-white">
                {getActiveFiltersCount()} filtro{getActiveFiltersCount() > 1 ? 's' : ''} ativo{getActiveFiltersCount() > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Coluna Esquerda */}
          <div className="space-y-6">
            {/* Status */}
            <div>
              <Label className="text-[#9CA3AF] flex items-center gap-2 mb-3">
                <Target className="w-4 h-4" />
                Status
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map(status => (
                  <label
                    key={status.value}
                    className="flex items-center gap-2 p-2 bg-[#131313] rounded border border-[#656464] hover:border-[#E50F5F]/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={filters.status.includes(status.value)}
                      onCheckedChange={() => handleArrayFilter('status', status.value)}
                      className="border-[#656464] data-[state=checked]:bg-[#E50F5F] data-[state=checked]:border-[#E50F5F]"
                    />
                    <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                    <span className="text-sm text-[#D9D9D9]">{status.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Prioridade */}
            <div>
              <Label className="text-[#9CA3AF] flex items-center gap-2 mb-3">
                <Flag className="w-4 h-4" />
                Prioridade
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {priorityOptions.map(priority => (
                  <label
                    key={priority.value}
                    className="flex items-center gap-2 p-2 bg-[#131313] rounded border border-[#656464] hover:border-[#E50F5F]/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={filters.priority.includes(priority.value)}
                      onCheckedChange={() => handleArrayFilter('priority', priority.value)}
                      className="border-[#656464] data-[state=checked]:bg-[#E50F5F] data-[state=checked]:border-[#E50F5F]"
                    />
                    <Flag className={`w-4 h-4 ${priority.color}`} />
                    <span className="text-sm text-[#D9D9D9]">{priority.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Empresas */}
            <div>
              <Label className="text-[#9CA3AF] flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4" />
                Empresas
              </Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {companies.map(company => (
                  <label
                    key={company.id}
                    className="flex items-center gap-2 p-2 bg-[#131313] rounded border border-[#656464] hover:border-[#E50F5F]/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={filters.companies.includes(company.id)}
                      onCheckedChange={() => handleArrayFilter('companies', company.id)}
                      className="border-[#656464] data-[state=checked]:bg-[#E50F5F] data-[state=checked]:border-[#E50F5F]"
                    />
                    <span className="text-sm text-[#D9D9D9]">{company.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Workflows */}
            <div>
              <Label className="text-[#9CA3AF] flex items-center gap-2 mb-3">
                <Target className="w-4 h-4" />
                Workflows
              </Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {workflows.map(workflow => (
                  <label
                    key={workflow.id}
                    className="flex items-center gap-2 p-2 bg-[#131313] rounded border border-[#656464] hover:border-[#E50F5F]/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={filters.workflows.includes(workflow.id)}
                      onCheckedChange={() => handleArrayFilter('workflows', workflow.id)}
                      className="border-[#656464] data-[state=checked]:bg-[#E50F5F] data-[state=checked]:border-[#E50F5F]"
                    />
                    <span className="text-sm text-[#D9D9D9]">{workflow.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna Direita */}
          <div className="space-y-6">
            {/* Responsáveis */}
            <div>
              <Label className="text-[#9CA3AF] flex items-center gap-2 mb-3">
                <Users className="w-4 h-4" />
                Responsáveis
              </Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {users.map(user => (
                  <label
                    key={user.id}
                    className="flex items-center gap-2 p-2 bg-[#131313] rounded border border-[#656464] hover:border-[#E50F5F]/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={filters.assignedTo.includes(user.id)}
                      onCheckedChange={() => handleArrayFilter('assignedTo', user.id)}
                      className="border-[#656464] data-[state=checked]:bg-[#E50F5F] data-[state=checked]:border-[#E50F5F]"
                    />
                    <span className="text-sm text-[#D9D9D9]">{user.full_name || user.email}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Data de Vencimento */}
            <div>
              <Label className="text-[#9CA3AF] flex items-center gap-2 mb-3">
                <CalendarIcon className="w-4 h-4" />
                Data de Vencimento
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-[#656464] mb-1 block">De</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#1C1C1C]"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dueDateFrom ? format(filters.dueDateFrom, 'dd/MM/yyyy') : "Selecionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-[#656464]">
                      <Calendar
                        mode="single"
                        selected={filters.dueDateFrom}
                        onSelect={(date) => setFilters(prev => ({ ...prev, dueDateFrom: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="text-xs text-[#656464] mb-1 block">Até</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#1C1C1C]"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dueDateTo ? format(filters.dueDateTo, 'dd/MM/yyyy') : "Selecionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-[#656464]">
                      <Calendar
                        mode="single"
                        selected={filters.dueDateTo}
                        onSelect={(date) => setFilters(prev => ({ ...prev, dueDateTo: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Data de Criação */}
            <div>
              <Label className="text-[#9CA3AF] flex items-center gap-2 mb-3">
                <CalendarIcon className="w-4 h-4" />
                Data de Criação
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-[#656464] mb-1 block">De</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#1C1C1C]"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.createdDateFrom ? format(filters.createdDateFrom, 'dd/MM/yyyy') : "Selecionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-[#656464]">
                      <Calendar
                        mode="single"
                        selected={filters.createdDateFrom}
                        onSelect={(date) => setFilters(prev => ({ ...prev, createdDateFrom: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="text-xs text-[#656464] mb-1 block">Até</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#1C1C1C]"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.createdDateTo ? format(filters.createdDateTo, 'dd/MM/yyyy') : "Selecionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-[#656464]">
                      <Calendar
                        mode="single"
                        selected={filters.createdDateTo}
                        onSelect={(date) => setFilters(prev => ({ ...prev, createdDateTo: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Filtros Especiais */}
            <div>
              <Label className="text-[#9CA3AF] flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4" />
                Filtros Especiais
              </Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2 bg-[#131313] rounded border border-[#656464] hover:border-[#E50F5F]/50 cursor-pointer">
                  <Checkbox
                    checked={filters.isOverdue}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, isOverdue: checked }))}
                    className="border-[#656464] data-[state=checked]:bg-[#E50F5F] data-[state=checked]:border-[#E50F5F]"
                  />
                  <span className="text-sm text-[#D9D9D9]">Apenas atrasadas</span>
                </label>
                
                <label className="flex items-center gap-2 p-2 bg-[#131313] rounded border border-[#656464] hover:border-[#E50F5F]/50 cursor-pointer">
                  <Checkbox
                    checked={filters.isCompleted}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, isCompleted: checked }))}
                    className="border-[#656464] data-[state=checked]:bg-[#E50F5F] data-[state=checked]:border-[#E50F5F]"
                  />
                  <span className="text-sm text-[#D9D9D9]">Apenas concluídas</span>
                </label>

                <div>
                  <Label className="text-xs text-[#656464] mb-1 block">Possui Checklist</Label>
                  <Select 
                    value={filters.hasChecklist === null ? "all" : filters.hasChecklist.toString()} 
                    onValueChange={(value) => setFilters(prev => ({ 
                      ...prev, 
                      hasChecklist: value === "all" ? null : value === "true" 
                    }))}
                  >
                    <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="true">Apenas com checklist</SelectItem>
                      <SelectItem value="false">Apenas sem checklist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-between items-center pt-6 border-t border-[#656464]">
          <Button
            variant="outline"
            onClick={handleClear}
            className="border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
          >
            <X className="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleApply}
              className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
            >
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}