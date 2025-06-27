import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar as CalendarIcon, 
  Clock,
  ChevronRight
} from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PeriodSelectorModal({ 
  open, 
  onClose, 
  onApplyPeriod,
  initialPeriod = { type: 'today', startDate: null, endDate: null }
}) {
  const [selectedPeriod, setSelectedPeriod] = useState({
    type: 'today',
    startDate: null,
    endDate: null
  });

  useEffect(() => {
    if (open) {
      setSelectedPeriod(initialPeriod);
    }
  }, [open, initialPeriod]);

  const periodPresets = [
    {
      key: 'today',
      label: 'Hoje',
      description: 'Atividades de hoje',
      getDates: () => {
        const today = new Date();
        return { startDate: today, endDate: today };
      }
    },
    {
      key: 'yesterday',
      label: 'Ontem',
      description: 'Atividades de ontem',
      getDates: () => {
        const yesterday = subDays(new Date(), 1);
        return { startDate: yesterday, endDate: yesterday };
      }
    },
    {
      key: 'thisWeek',
      label: 'Esta Semana',
      description: 'Segunda a domingo desta semana',
      getDates: () => {
        const today = new Date();
        return { 
          startDate: startOfWeek(today, { weekStartsOn: 1 }), 
          endDate: endOfWeek(today, { weekStartsOn: 1 }) 
        };
      }
    },
    {
      key: 'lastWeek',
      label: 'Semana Passada',
      description: 'Segunda a domingo da semana passada',
      getDates: () => {
        const lastWeek = subDays(new Date(), 7);
        return { 
          startDate: startOfWeek(lastWeek, { weekStartsOn: 1 }), 
          endDate: endOfWeek(lastWeek, { weekStartsOn: 1 }) 
        };
      }
    },
    {
      key: 'thisMonth',
      label: 'Este Mês',
      description: 'Primeiro ao último dia deste mês',
      getDates: () => {
        const today = new Date();
        return { 
          startDate: startOfMonth(today), 
          endDate: endOfMonth(today) 
        };
      }
    },
    {
      key: 'lastMonth',
      label: 'Mês Passado',
      description: 'Primeiro ao último dia do mês passado',
      getDates: () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return { 
          startDate: startOfMonth(lastMonth), 
          endDate: endOfMonth(lastMonth) 
        };
      }
    },
    {
      key: 'next7Days',
      label: 'Próximos 7 Dias',
      description: 'Hoje até 7 dias à frente',
      getDates: () => {
        const today = new Date();
        return { 
          startDate: today, 
          endDate: addDays(today, 7) 
        };
      }
    },
    {
      key: 'next30Days',
      label: 'Próximos 30 Dias',
      description: 'Hoje até 30 dias à frente',
      getDates: () => {
        const today = new Date();
        return { 
          startDate: today, 
          endDate: addDays(today, 30) 
        };
      }
    },
    {
      key: 'overdue',
      label: 'Atrasadas',
      description: 'Atividades com vencimento no passado',
      getDates: () => {
        const today = new Date();
        return { 
          startDate: new Date(2020, 0, 1), 
          endDate: subDays(today, 1) 
        };
      }
    },
    {
      key: 'custom',
      label: 'Período Personalizado',
      description: 'Selecione datas específicas',
      getDates: () => ({ startDate: null, endDate: null })
    }
  ];

  const handlePresetClick = (preset) => {
    const dates = preset.getDates();
    setSelectedPeriod({
      type: preset.key,
      startDate: dates.startDate,
      endDate: dates.endDate
    });
  };

  const handleApply = () => {
    onApplyPeriod(selectedPeriod);
    onClose();
  };

  const formatDateRange = () => {
    if (!selectedPeriod.startDate) return "Selecione um período";
    
    if (selectedPeriod.type === 'today') return "Hoje";
    if (selectedPeriod.type === 'yesterday') return "Ontem";
    
    const start = format(selectedPeriod.startDate, 'dd/MM/yyyy', { locale: ptBR });
    const end = selectedPeriod.endDate ? format(selectedPeriod.endDate, 'dd/MM/yyyy', { locale: ptBR }) : start;
    
    return start === end ? start : `${start} até ${end}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#E50F5F] flex items-center gap-2">
            <CalendarIcon className="w-6 h-6" />
            Selecionar Período
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Coluna Esquerda - Presets */}
          <div>
            <Label className="text-[#9CA3AF] mb-4 block">Períodos Pré-definidos</Label>
            <div className="space-y-2">
              {periodPresets.map((preset) => (
                <div
                  key={preset.key}
                  onClick={() => handlePresetClick(preset)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedPeriod.type === preset.key
                      ? 'border-[#E50F5F] bg-[#E50F5F]/10'
                      : 'border-[#656464] hover:border-[#E50F5F]/50 bg-[#131313]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-[#D9D9D9] text-sm">{preset.label}</h4>
                      <p className="text-xs text-[#9CA3AF] mt-1">{preset.description}</p>
                    </div>
                    {selectedPeriod.type === preset.key && (
                      <div className="w-2 h-2 bg-[#E50F5F] rounded-full"></div>
                    )}
                  </div>
                  
                  {preset.key !== 'custom' && (
                    <div className="mt-2 text-xs text-[#656464]">
                      {(() => {
                        const dates = preset.getDates();
                        if (!dates.startDate) return "";
                        
                        const start = format(dates.startDate, 'dd/MM', { locale: ptBR });
                        const end = dates.endDate ? format(dates.endDate, 'dd/MM', { locale: ptBR }) : start;
                        return start === end ? start : `${start} - ${end}`;
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Coluna Direita - Calendário Personalizado */}
          <div>
            <Label className="text-[#9CA3AF] mb-4 block">Seleção Manual</Label>
            
            {selectedPeriod.type === 'custom' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-[#656464] mb-2 block">Data Inicial</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#1C1C1C]"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedPeriod.startDate ? format(selectedPeriod.startDate, 'dd/MM/yyyy') : "Selecionar"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-[#656464]">
                        <Calendar
                          mode="single"
                          selected={selectedPeriod.startDate}
                          onSelect={(date) => setSelectedPeriod(prev => ({ ...prev, startDate: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label className="text-xs text-[#656464] mb-2 block">Data Final</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#1C1C1C]"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedPeriod.endDate ? format(selectedPeriod.endDate, 'dd/MM/yyyy') : "Selecionar"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-[#656464]">
                        <Calendar
                          mode="single"
                          selected={selectedPeriod.endDate}
                          onSelect={(date) => setSelectedPeriod(prev => ({ ...prev, endDate: date }))}
                          disabled={(date) => selectedPeriod.startDate && date < selectedPeriod.startDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            ) : (
              <Card className="bg-[#131313] border-[#656464]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[#D9D9D9] text-sm">Período Selecionado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-[#E50F5F]" />
                    <span className="text-[#D9D9D9] font-medium">{formatDateRange()}</span>
                  </div>
                  
                  {selectedPeriod.startDate && selectedPeriod.endDate && (
                    <div className="mt-3 p-2 bg-[#1C1C1C] rounded border border-[#656464]">
                      <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                        <span>Início</span>
                        <span>Fim</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-[#D9D9D9]">
                          {format(selectedPeriod.startDate, 'dd/MM/yyyy')}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#656464]" />
                        <span className="text-sm text-[#D9D9D9]">
                          {format(selectedPeriod.endDate, 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Resumo do período */}
            <div className="mt-4 p-3 bg-[#E50F5F]/10 border border-[#E50F5F]/30 rounded-lg">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#E50F5F]" />
                <span className="text-sm font-medium text-[#E50F5F]">Resumo do Filtro</span>
              </div>
              <p className="text-sm text-[#D9D9D9] mt-1">
                {formatDateRange()}
              </p>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-6 border-t border-[#656464]">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleApply}
            disabled={selectedPeriod.type === 'custom' && (!selectedPeriod.startDate || !selectedPeriod.endDate)}
            className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
          >
            Aplicar Período
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}