import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function AdvancedTab({ formData, setFormData }) {
  const slugify = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase()
      .replace(/\s+/g, '_')       // Replace spaces with _
      .replace(/[^\w-]+/g, '')   // Remove all non-word chars
      .replace(/--+/g, '_')        // Replace multiple - with single _
      .replace(/^-+/, '')          // Trim - from start of text
      .replace(/-+$/, '');         // Trim - from end of text
  };

  const handleFieldChange = (fieldId, property, value) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => {
        if (field.id === fieldId) {
          return { ...field, [property]: value };
        }
        return field;
      })
    }));
  };

  const handleLabelChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => {
        if (field.id === fieldId) {
          const slug = slugify(value);
          return {
            ...field,
            label: value,
            spreadsheet_name: slug,
            webhook_name: slug
          };
        }
        return field;
      })
    }));
  };
  
  const fields = formData.fields || [];

  return (
    <div className="space-y-6">
      <div className="p-4 bg-[#1A1A1A] rounded-lg border border-[#404040]">
        <h4 className="text-sm font-medium text-[#E50F5F] mb-4">Mapeamento de Nomes dos Campos</h4>
        
        {fields.length === 0 ? (
          <p className="text-sm text-center text-[#9CA3AF]">Adicione campos na aba "Campos" para ver as configurações avançadas.</p>
        ) : (
          <div className="space-y-4">
            {fields.map(field => (
              <div key={field.id} className="p-3 bg-[#131313] rounded-md border border-[#656464]">
                <p className="text-sm font-semibold text-[#D9D9D9] mb-2">{field.label}</p>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor={`label-${field.id}`} className="text-xs">Nome do Campo (Rótulo)</Label>
                    <Input
                      id={`label-${field.id}`}
                      value={field.label}
                      onChange={(e) => handleLabelChange(field.id, e.target.value)}
                      className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`spreadsheet-${field.id}`} className="text-xs">Nome para Planilha</Label>
                    <Input
                      id={`spreadsheet-${field.id}`}
                      value={field.spreadsheet_name || ''}
                      onChange={(e) => handleFieldChange(field.id, 'spreadsheet_name', e.target.value)}
                      className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`webhook-${field.id}`} className="text-xs">Nome para Webhook</Label>
                    <Input
                      id={`webhook-${field.id}`}
                      value={field.webhook_name || ''}
                      onChange={(e) => handleFieldChange(field.id, 'webhook_name', e.target.value)}
                      className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] h-8"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}