
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Globe, MessageSquare, Phone } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const FILTER_CONDITIONS = [
  { value: 'contains', label: 'Contém' },
  { value: 'not_contains', label: 'Não contém' },
  { value: 'equals', label: 'Igual a' },
  { value: 'not_equals', label: 'Diferente de' },
  { value: 'less_than', label: 'Menor que' },
  { value: 'greater_than', label: 'Maior que' },
  { value: 'less_or_equal', label: 'Menor ou igual a' },
  { value: 'greater_or_equal', label: 'Maior ou igual a' },
  { value: 'before', label: 'Antes de' },
  { value: 'after', label: 'Depois de' },
];

export default function IntegrationsTab({ formData, setFormData }) {
  const integrations = formData.integrations || {};
  const rejectionConfig = integrations.rejection_config || { filters: [] };
  const completionAction = integrations.completion_action || { type: 'message' };

  const handleIntegrationChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [section]: {
          ...prev.integrations?.[section],
          [field]: value,
        },
      },
    }));
  };

  const handleSimpleIntegrationChange = (field, value) => {
     setFormData(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [field]: value,
      },
    }));
  };

  const handleCompletionActionChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        completion_action: {
          ...prev.integrations?.completion_action,
          [field]: value,
        },
      },
    }));
  };

  const handleRejectionChange = (field, value) => {
    handleIntegrationChange('rejection_config', field, value);
  };
  
  const addFilter = () => {
    const newFilter = { id: `filter-${Date.now()}`, field: '', condition: 'equals', value: '' };
    handleRejectionChange('filters', [...(rejectionConfig.filters || []), newFilter]);
  };

  const updateFilter = (filterId, field, value) => {
    const updatedFilters = rejectionConfig.filters.map(f =>
      f.id === filterId ? { ...f, [field]: value } : f
    );
    handleRejectionChange('filters', updatedFilters);
  };

  const removeFilter = (filterId) => {
    const updatedFilters = rejectionConfig.filters.filter(f => f.id !== filterId);
    handleRejectionChange('filters', updatedFilters);
  };

  return (
    <div className="space-y-6">
      {/* Pixels */}
      <div className="space-y-4 p-4 bg-[#1A1A1A] rounded-lg border border-[#404040]">
        <h4 className="text-sm font-medium text-[#E50F5F]">Pixels de Rastreamento</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Meta Ads Pixel ID</Label>
            <Input 
              value={integrations.pixels?.meta_pixel_id || ''}
              onChange={(e) => handleIntegrationChange('pixels', 'meta_pixel_id', e.target.value)}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8" 
            />
          </div>
           <div className="space-y-2">
            <Label className="text-xs">Meta Ads Access Token</Label>
            <Input 
              value={integrations.pixels?.meta_access_token || ''}
              onChange={(e) => handleIntegrationChange('pixels', 'meta_access_token', e.target.value)}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8" 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Google Analytics ID</Label>
            <Input 
              value={integrations.pixels?.ga_id || ''}
              onChange={(e) => handleIntegrationChange('pixels', 'ga_id', e.target.value)}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8" 
              placeholder="G-XXXXXXXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Google Tag Manager ID</Label>
            <Input 
              value={integrations.pixels?.gtm_id || ''}
              onChange={(e) => handleIntegrationChange('pixels', 'gtm_id', e.target.value)}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8" 
              placeholder="GTM-XXXXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Google Ads ID</Label>
            <Input 
              value={integrations.pixels?.google_ads_id || ''}
              onChange={(e) => handleIntegrationChange('pixels', 'google_ads_id', e.target.value)}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8" 
              placeholder="AW-XXXXXXXXX"
            />
          </div>
           <div className="space-y-2">
            <Label className="text-xs">Google Ads Rótulo de Conversão</Label>
            <Input 
              value={integrations.pixels?.google_conversion_label || ''}
              onChange={(e) => handleIntegrationChange('pixels', 'google_conversion_label', e.target.value)}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8" 
            />
          </div>
        </div>
      </div>
      
      {/* Webhook */}
      <div className="space-y-2 p-4 bg-[#1A1A1A] rounded-lg border border-[#404040]">
        <Label className="text-sm font-medium text-[#E50F5F]">Webhook</Label>
        <Input 
          value={integrations.webhook_url || ''}
          onChange={(e) => handleSimpleIntegrationChange('webhook_url', e.target.value)}
          className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8"
          placeholder="https://seu-servidor.com/webhook"
        />
      </div>

      {/* Conclusão */}
      <div className="space-y-4 p-4 bg-[#1A1A1A] rounded-lg border border-[#404040]">
        <h4 className="text-sm font-medium text-[#E50F5F]">Conclusão</h4>
        <RadioGroup 
            value={completionAction.type} 
            onValueChange={(value) => handleCompletionActionChange('type', value)}
            className="grid grid-cols-3 gap-4"
        >
          <Label htmlFor="type-message" className={`flex flex-col items-center justify-center p-4 rounded-lg border cursor-pointer ${completionAction.type === 'message' ? 'border-[#E50F5F] bg-[#E50F5F]/10' : 'border-[#656464]'}`}>
            <RadioGroupItem value="message" id="type-message" className="sr-only" />
            <MessageSquare className="w-6 h-6 mb-2" />
            <span className="text-sm">Mensagem</span>
          </Label>
          <Label htmlFor="type-redirect" className={`flex flex-col items-center justify-center p-4 rounded-lg border cursor-pointer ${completionAction.type === 'redirect' ? 'border-[#E50F5F] bg-[#E50F5F]/10' : 'border-[#656464]'}`}>
            <RadioGroupItem value="redirect" id="type-redirect" className="sr-only" />
            <Globe className="w-6 h-6 mb-2" />
            <span className="text-sm">Redirecionar</span>
          </Label>
          <Label htmlFor="type-whatsapp" className={`flex flex-col items-center justify-center p-4 rounded-lg border cursor-pointer ${completionAction.type === 'whatsapp' ? 'border-[#E50F5F] bg-[#E50F5F]/10' : 'border-[#656464]'}`}>
            <RadioGroupItem value="whatsapp" id="type-whatsapp" className="sr-only" />
            <Phone className="w-6 h-6 mb-2" />
            <span className="text-sm">WhatsApp</span>
          </Label>
        </RadioGroup>

        {completionAction.type === 'message' && (
          <div className="space-y-2">
            <Label className="text-xs">Mensagem de Conclusão</Label>
            <Textarea
              value={completionAction.success_message || ''}
              onChange={(e) => handleCompletionActionChange('success_message', e.target.value)}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
              placeholder="Obrigado por suas respostas!"
            />
          </div>
        )}
        {completionAction.type === 'redirect' && (
          <div className="space-y-2">
            <Label className="text-xs">URL de Redirecionamento</Label>
            <Input 
              value={completionAction.url || ''}
              onChange={(e) => handleCompletionActionChange('url', e.target.value)}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8"
              placeholder="https://seu-site.com/obrigado"
            />
          </div>
        )}
        {completionAction.type === 'whatsapp' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Número do WhatsApp (DDI+DDD+Número)</Label>
              <Input 
                value={completionAction.whatsapp_number || ''}
                onChange={(e) => handleCompletionActionChange('whatsapp_number', e.target.value)}
                className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8"
                placeholder="5561999999999"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Mensagem</Label>
              <Textarea
                value={completionAction.whatsapp_message || ''}
                onChange={(e) => handleCompletionActionChange('whatsapp_message', e.target.value)}
                className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                placeholder="Olá, me interessei pelo seu produto. Meu nome é {nome_do_campo}."
              />
               <p className="text-xs text-[#9CA3AF]">Use {'{nome_da_variavel}'} para inserir dados do formulário.</p>
            </div>
          </div>
        )}
      </div>

      {/* Rejection */}
      <div className="space-y-4 p-4 bg-[#1A1A1A] rounded-lg border border-[#404040]">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-[#E50F5F]">Reprovação Automática</Label>
          <Switch 
            checked={rejectionConfig.enabled || false}
            onCheckedChange={(checked) => handleRejectionChange('enabled', checked)}
          />
        </div>
        {rejectionConfig.enabled && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Texto da Reprovação</Label>
              <Textarea
                value={rejectionConfig.text || ''}
                onChange={(e) => handleRejectionChange('text', e.target.value)}
                className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                placeholder="Infelizmente, você não se qualifica no momento."
              />
            </div>
            <div>
              <Label className="text-xs">Filtros para Reprovar</Label>
              <div className="space-y-2 mt-2">
                {rejectionConfig.filters?.map(filter => (
                  <div key={filter.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                    <Select value={filter.field} onValueChange={v => updateFilter(filter.id, 'field', v)}>
                      <SelectTrigger className="col-span-1 bg-[#131313] border-[#656464] text-[#D9D9D9] h-8">
                        <SelectValue placeholder="Campo" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                        {(formData.fields || []).map(f => <SelectItem key={f.id} value={f.name}>{f.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={filter.condition} onValueChange={v => updateFilter(filter.id, 'condition', v)}>
                      <SelectTrigger className="col-span-1 bg-[#131313] border-[#656464] text-[#D9D9D9] h-8">
                        <SelectValue placeholder="Condição" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                        {FILTER_CONDITIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input
                      value={filter.value}
                      onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                      className="col-span-1 bg-[#131313] border-[#656464] text-[#D9D9D9] h-8"
                      placeholder="Valor"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeFilter(filter.id)} className="text-red-500 h-8 w-8">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={addFilter} 
                className="mt-2 border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:text-[#D9D9D9] hover:border-[#E50F5F]/80 bg-[#1C1C1C]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Filtro
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
