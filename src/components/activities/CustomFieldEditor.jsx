import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CustomField } from "@/api/entities";

export function CustomFieldEditor({ 
  entityType = 'activity', 
  values = {}, 
  onChange,
  readOnly = false 
}) {
  const [customFields, setCustomFields] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCustomFields();
  }, [entityType]);

  const loadCustomFields = async () => {
    setIsLoading(true);
    try {
      const fields = await CustomField.list();
      // Filtrar campos que se aplicam ao tipo de entidade atual
      const applicableFields = fields.filter(field => 
        field.applies_to && field.applies_to.includes(entityType)
      );
      setCustomFields(applicableFields);
    } catch (error) {
      console.error("Erro ao carregar campos personalizados:", error);
    }
    setIsLoading(false);
  };

  const handleFieldChange = (fieldName, value) => {
    if (onChange) {
      onChange({
        ...values,
        [fieldName]: value
      });
    }
  };

  const renderField = (field) => {
    const value = values[field.name] || '';
    
    const commonProps = {
      className: "bg-[#131313] border-[#656464] text-[#D9D9D9]",
      disabled: readOnly
    };

    switch (field.type) {
      case 'text':
        return (
          <Input
            {...commonProps}
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={`${commonProps.className} h-20`}
          />
        );
        
      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value) || '')}
            placeholder={field.placeholder}
          />
        );
        
      case 'date':
        return (
          <Input
            {...commonProps}
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        );
        
      case 'select':
        return (
          <Select 
            value={value} 
            onValueChange={(val) => handleFieldChange(field.name, val)}
            disabled={readOnly}
          >
            <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]">
              <SelectValue placeholder={field.placeholder || "Selecione uma opção..."} />
            </SelectTrigger>
            <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
              {(field.options || []).map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value === true || value === 'true'}
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
              className="border-[#656464] data-[state=checked]:bg-[#E50F5F] data-[state=checked]:border-[#E50F5F]"
              disabled={readOnly}
            />
            <Label className="text-[#9CA3AF] cursor-pointer">
              {field.placeholder || field.label}
            </Label>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-4 bg-[#656464]/20 rounded animate-pulse"></div>
        <div className="h-8 bg-[#656464]/20 rounded animate-pulse"></div>
      </div>
    );
  }

  if (customFields.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="border-t border-[#656464] pt-4">
        <h4 className="text-sm font-medium text-[#D9D9D9] mb-4">
          Campos Personalizados
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label className="text-[#9CA3AF] text-sm">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </Label>
              
              {renderField(field)}
              
              {field.description && (
                <p className="text-xs text-[#656464]">
                  {field.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CustomFieldEditor;