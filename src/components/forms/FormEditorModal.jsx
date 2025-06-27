
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form } from '@/api/entities';
import { RecordList } from '@/api/entities'; // Added import for RecordList

import GeneralTab from './GeneralTab';
import LayoutTab from './LayoutTab';
import FieldsTab from './FieldsTab';
import IntegrationsTab from './IntegrationsTab';
import AdvancedTab from './AdvancedTab';
import FormPreview from './FormPreview';

export default function FormEditorModal({ form, open, onClose }) {
  const [formData, setFormData] = useState(null);
  const [activeTab, setActiveTab] = useState("geral");

  useEffect(() => {
    if (form) {
      setFormData({
        title: form.title || '',
        headline: form.headline || '',
        description: form.description || '',
        show_description: form.show_description !== false,
        is_public: form.is_public !== false,
        status: form.status || 'draft',
        fields: form.fields || [],
        funnel_config: form.funnel_config || { enabled: false },
        layout_settings: form.layout_settings || {},
        integrations: form.integrations || {},
        advanced_settings: form.advanced_settings || {}
      });
    } else {
      setFormData({
        title: '',
        headline: '',
        description: '',
        show_description: true,
        is_public: true,
        status: 'draft',
        fields: [],
        funnel_config: { enabled: false },
        layout_settings: {},
        integrations: {
          pixels: {},
          rejection_config: { enabled: false, filters: [] }
        },
        advanced_settings: {}
      });
    }
  }, [form]);

  const handleSave = async () => {
    try {
      if (form?.id) {
        await Form.update(form.id, formData);
      } else {
        const newForm = await Form.create(formData);
        // Create a corresponding RecordList when a new form is created
        if (newForm?.id) {
            await RecordList.create({
                name: `Respostas: ${formData.title}`,
                description: `Lista de registros automática para o formulário "${formData.title}".`,
                form_id: newForm.id
            });
        }
      }
      onClose();
    } catch (error) {
      console.error("Erro ao salvar formulário:", error);
      alert("Falha ao salvar o formulário.");
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-[95vw] h-[90vh] w-full flex flex-col p-0">
        <DialogHeader className="p-6 border-b border-[#656464]">
          <DialogTitle className="text-xl text-[#E50F5F]">
            {form ? 'Editar Formulário' : 'Criar Novo Formulário'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0">
          {/* Coluna Esquerda - Controles */}
          <div className="bg-[#131313] overflow-y-auto p-6 border-r border-[#656464] custom-scrollbar">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="geral">Geral</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
                <TabsTrigger value="campos">Campos</TabsTrigger>
                <TabsTrigger value="integracoes">Integrações</TabsTrigger>
                <TabsTrigger value="avancado">Avançado</TabsTrigger>
              </TabsList>
              <TabsContent value="geral">
                <GeneralTab formData={formData} setFormData={setFormData} form={form} />
              </TabsContent>
              <TabsContent value="layout">
                <LayoutTab formData={formData} setFormData={setFormData} />
              </TabsContent>
              <TabsContent value="campos">
                <FieldsTab formData={formData} setFormData={setFormData} />
              </TabsContent>
              <TabsContent value="integracoes">
                <IntegrationsTab formData={formData} setFormData={setFormData} />
              </TabsContent>
              <TabsContent value="avancado">
                <AdvancedTab formData={formData} setFormData={setFormData} />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Coluna Direita - Prévia */}
          <div className="flex flex-col p-6 overflow-y-auto custom-scrollbar min-h-0">
            <FormPreview formData={formData} />
          </div>
        </div>

        <DialogFooter className="p-6 border-t border-[#656464]">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:text-[#D9D9D9] hover:border-[#E50F5F]/80 bg-[#1C1C1C]"
          >
            Cancelar
          </Button>
          <Button className="bg-[#E50F5F] hover:bg-[#E50F5F]/80" onClick={handleSave}>Salvar Formulário</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
