import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Repeat } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const weekDays = [
  { id: 'SU', name: 'D' },
  { id: 'MO', name: 'S' },
  { id: 'TU', name: 'T' },
  { id: 'WE', name: 'Q' },
  { id: 'TH', name: 'Q' },
  { id: 'FR', name: 'S' },
  { id: 'SA', name: 'S' }
];

export default function RecurrenceModal({ open, onClose, onApplyRecurrence, initialRule }) {
  const [rule, setRule] = useState({
    frequency: 'weekly',
    interval: 1,
    daysOfWeek: ['MO'],
    dayOfMonth: 1,
    end_type: 'never',
    end_date: null,
    occurrences: 10
  });

  useEffect(() => {
    if (open) {
      setRule(initialRule || {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: ['MO'],
        dayOfMonth: 1,
        end_type: 'never',
        end_date: null,
        occurrences: 10
      });
    }
  }, [open, initialRule]);

  const handleApply = () => {
    onApplyRecurrence(rule);
    onClose();
  };
  
  const toggleWeekDay = (day) => {
    setRule(prev => {
        const daysOfWeek = prev.daysOfWeek.includes(day)
            ? prev.daysOfWeek.filter(d => d !== day)
            : [...prev.daysOfWeek, day];
        return { ...prev, daysOfWeek };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-[#E50F5F]">
            <Repeat className="w-5 h-5" />
            Definir Recorrência
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Frequência e Intervalo */}
          <div className="flex items-center gap-4">
            <Label className="w-24">Repetir a cada</Label>
            <Input
              type="number"
              min="1"
              value={rule.interval}
              onChange={(e) => setRule({ ...rule, interval: parseInt(e.target.value) || 1 })}
              className="w-24 bg-[#131313] border-[#656464]"
            />
            <Select
              value={rule.frequency}
              onValueChange={(val) => setRule({ ...rule, frequency: val })}
            >
              <SelectTrigger className="flex-1 bg-[#131313] border-[#656464]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                <SelectItem value="daily">Dia(s)</SelectItem>
                <SelectItem value="weekly">Semana(s)</SelectItem>
                <SelectItem value="monthly">Mês(es)</SelectItem>
                <SelectItem value="yearly">Ano(s)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Opções de Frequência */}
          {rule.frequency === 'weekly' && (
            <div>
              <Label>Repetir em</Label>
              <div className="flex justify-between gap-1 mt-2">
                {weekDays.map(day => (
                  <Button
                    key={day.id}
                    variant="outline"
                    size="icon"
                    onClick={() => toggleWeekDay(day.id)}
                    className={`w-9 h-9 rounded-full ${
                      rule.daysOfWeek.includes(day.id)
                        ? 'bg-[#E50F5F] text-white border-[#E50F5F]'
                        : 'bg-[#131313] border-[#656464] hover:bg-[#656464]/20'
                    }`}
                  >
                    {day.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {rule.frequency === 'monthly' && (
            <div>
              <Label>Repetir no dia</Label>
              <Input
                type="number"
                min="1"
                max="31"
                value={rule.dayOfMonth}
                onChange={(e) => setRule({ ...rule, dayOfMonth: parseInt(e.target.value) || 1 })}
                className="w-full mt-2 bg-[#131313] border-[#656464]"
              />
            </div>
          )}

          {/* Condição de Término */}
          <div>
            <Label>Termina</Label>
            <RadioGroup
              value={rule.end_type}
              onValueChange={(val) => setRule({ ...rule, end_type: val })}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value="never" id="never" className="border-[#656464] data-[state=checked]:border-[#E50F5F]"/>
                <Label htmlFor="never">Nunca</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="on_date" id="on_date" className="border-[#656464] data-[state=checked]:border-[#E50F5F]" />
                <Label htmlFor="on_date">Em</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={rule.end_type !== 'on_date'}
                      className="w-48 justify-start text-left font-normal bg-[#131313] border-[#656464]"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {rule.end_date ? format(new Date(rule.end_date), "PPP", { locale: ptBR }) : <span>Escolha a data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#1C1C1C] border-[#656464]">
                    <Calendar
                      mode="single"
                      selected={rule.end_date ? new Date(rule.end_date) : null}
                      onSelect={(date) => setRule({ ...rule, end_date: date.toISOString().split('T')[0] })}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="after_occurrences" id="after_occurrences" className="border-[#656464] data-[state=checked]:border-[#E50F5F]" />
                <Label htmlFor="after_occurrences">Após</Label>
                <Input
                  type="number"
                  min="1"
                  disabled={rule.end_type !== 'after_occurrences'}
                  value={rule.occurrences}
                  onChange={(e) => setRule({ ...rule, occurrences: parseInt(e.target.value) || 1 })}
                  className="w-24 bg-[#131313] border-[#656464]"
                />
                <Label>ocorrências</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="border-t border-[#656464] pt-4">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="bg-[#131313] border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleApply} 
            className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
          >
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}