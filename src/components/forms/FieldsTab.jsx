
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, GripVertical, Trash2, Edit, Type, Pilcrow, AtSign, Link, Hash, ListChecks, BookMarked, FileText, Phone, MapPin, Disc, ChevronDownSquare, Container, Calendar, Clock, CalendarClock, UserSquare, DollarSign, EyeOff, Minus
} from 'lucide-react';
import FieldEditorModal from './FieldEditorModal';

const fieldTypes = [
  { type: 'checklist', label: 'Checklist', icon: ListChecks },
  { type: 'text', label: 'Texto', icon: Type },
  { type: 'long_text', label: 'Texto Longo', icon: Pilcrow },
  { type: 'url', label: 'URL', icon: Link },
  { type: 'number', label: 'Número', icon: Hash },
  { type: 'reference', label: 'Referência', icon: BookMarked },
  { type: 'document', label: 'Documento', icon: FileText },
  { type: 'email', label: 'Email', icon: AtSign },
  { type: 'phone', label: 'Telefone', icon: Phone },
  { type: 'address', label: 'Endereço', icon: MapPin },
  { type: 'radio', label: 'Rádio', icon: Disc },
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDownSquare },
  { type: 'multi_select', label: 'Seleção de múltiplos', icon: ListChecks },
  { type: 'dynamic_box', label: 'Caixa dinâmica', icon: Container },
  { type: 'date', label: 'Data', icon: Calendar },
  { type: 'time', label: 'Hora', icon: Clock },
  { type: 'datetime', label: 'Data e Hora', icon: CalendarClock },
  { type: 'full_name', label: 'Nome e sobrenome', icon: UserSquare },
  { type: 'money', label: 'Valor monetário', icon: DollarSign },
  { type: 'hidden', label: 'Oculto', icon: EyeOff },
  { type: 'divider', label: 'Divisória', icon: Minus },
];

export default function FieldsTab({ formData, setFormData }) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(formData.fields || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData(prev => ({ ...prev, fields: items.map((field, index) => ({ ...field, order: index })) }));
  };

  const addField = (type) => {
    const defaultLabel = `Novo Campo (${type})`;
    const slug = defaultLabel.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    const newField = {
      id: `field-${Date.now()}`,
      type: type,
      label: defaultLabel,
      name: slug,
      spreadsheet_name: slug,
      webhook_name: slug,
      required: false,
      placeholder: '',
      defaultValue: '',
      order: (formData.fields || []).length,
      config: {}
    };
    setFormData(prev => ({
      ...prev,
      fields: [...(prev.fields || []), newField]
    }));
  };

  const openEditor = (field) => {
    setEditingField(field);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setEditingField(null);
    setIsEditorOpen(false);
  };

  const handleSaveField = (updatedField) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => field.id === updatedField.id ? updatedField : field)
    }));
    closeEditor();
  };

  const removeField = (id) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== id)
    }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-[#D9D9D9]">Campos do Formulário</h3>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="fields">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3 min-h-[100px]"
            >
              {(formData.fields || []).sort((a, b) => a.order - b.order).map((field, index) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center gap-2 p-3 bg-[#1A1A1A] rounded-md border border-[#404040]"
                    >
                      <div {...provided.dragHandleProps} className="cursor-grab text-[#9CA3AF]">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <span className="flex-1 text-[#D9D9D9]">{field.label} <span className="text-xs text-[#9CA3AF]">({field.type})</span></span>
                      <Button variant="ghost" size="icon" className="text-[#9CA3AF] hover:text-[#E50F5F]" onClick={() => openEditor(field)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-[#9CA3AF] hover:text-red-500" onClick={() => removeField(field.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:text-[#D9D9D9] hover:border-[#E50F5F]/80 bg-[#1C1C1C] mt-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Campo
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-h-80 overflow-y-auto custom-scrollbar">
          {fieldTypes.map(ft => {
            const Icon = ft.icon;
            return (
              <DropdownMenuItem key={ft.type} onSelect={() => addField(ft.type)} className="focus:bg-[#E50F5F]/20">
                <Icon className="w-4 h-4 mr-2" />
                <span>{ft.label}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {isEditorOpen && (
        <FieldEditorModal
          field={editingField}
          open={isEditorOpen}
          onClose={closeEditor}
          onSave={handleSaveField}
        />
      )}
    </div>
  );
}
