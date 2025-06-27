import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GeneralTab({ formData, setFormData, form }) {
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Você pode adicionar uma notificação aqui
  };

  const formUrl = form?.id ? `${window.location.origin}/ViewForm?id=${form.id}` : '';
  const iframeCode = form?.id ? `<iframe src="${formUrl}" width="100%" height="600" frameborder="0"></iframe>` : '';

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-[#E50F5F]">Informações Básicas</h3>
        
        <div>
          <Label htmlFor="title" className="text-[#D9D9D9]">Título do Formulário</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-2"
            placeholder="Digite o título do formulário"
          />
        </div>

        <div>
          <Label htmlFor="headline" className="text-[#D9D9D9]">Headline (Título Exibido)</Label>
          <Input
            id="headline"
            value={formData.headline}
            onChange={(e) => handleInputChange('headline', e.target.value)}
            className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-2"
            placeholder="Título que aparecerá no formulário público"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-[#D9D9D9]">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-2"
            placeholder="Descreva o objetivo do formulário"
            rows={3}
          />
        </div>
      </div>

      {/* Configurações de Exibição */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-[#E50F5F]">Configurações de Exibição</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show-description" className="text-[#D9D9D9]">Mostrar Descrição</Label>
            <p className="text-sm text-[#9CA3AF] mt-1">Se a descrição deve aparecer no formulário</p>
          </div>
          <Switch
            id="show-description"
            checked={formData.show_description}
            onCheckedChange={(checked) => handleInputChange('show_description', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="hide-questions" className="text-[#D9D9D9]">Ocultar Perguntas</Label>
            <p className="text-sm text-[#9CA3AF] mt-1">Oculta os rótulos dos campos, mostrando apenas placeholders</p>
          </div>
          <Switch
            id="hide-questions"
            checked={formData.hide_questions}
            onCheckedChange={(checked) => handleInputChange('hide_questions', checked)}
          />
        </div>
      </div>

      {/* Configurações de Acesso */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-[#E50F5F]">Configurações de Acesso</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="is-public" className="text-[#D9D9D9]">Formulário Público</Label>
            <p className="text-sm text-[#9CA3AF] mt-1">Permite acesso sem login</p>
          </div>
          <Switch
            id="is-public"
            checked={formData.is_public}
            onCheckedChange={(checked) => handleInputChange('is_public', checked)}
          />
        </div>

        {/* URLs e Códigos de Incorporação */}
        {formData.is_public && form?.id && (
          <div className="space-y-4 p-4 bg-[#131313] rounded-lg border border-[#656464]">
            <h4 className="text-sm font-medium text-[#E50F5F]">Links e Códigos de Incorporação</h4>
            
            {/* URL Pública */}
            <div>
              <Label className="text-[#D9D9D9] text-sm">URL Pública</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  value={formUrl}
                  readOnly
                  className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(formUrl)}
                  className="border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(formUrl, '_blank')}
                  className="border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Código iFrame */}
            <div>
              <Label className="text-[#D9D9D9] text-sm">Código iFrame</Label>
              <div className="flex items-center gap-2 mt-2">
                <Textarea
                  value={iframeCode}
                  readOnly
                  className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] text-sm"
                  rows={3}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(iframeCode)}
                  className="border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-[#E50F5F]">Status</h3>
        
        <div>
          <Label htmlFor="status" className="text-[#D9D9D9]">Status do Formulário</Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full mt-2 bg-[#131313] border border-[#656464] text-[#D9D9D9] rounded-md p-2"
          >
            <option value="draft">Rascunho</option>
            <option value="active">Ativo</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>
      </div>
    </div>
  );
}