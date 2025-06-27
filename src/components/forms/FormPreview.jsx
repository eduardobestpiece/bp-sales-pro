
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, Monitor } from 'lucide-react';

const renderField = (field) => {
  const baseInputStyles = "block w-full placeholder:opacity-60 bg-[#131313] border-[#656464] text-[#D9D9D9] p-2";

  // Common props for single input elements based on the field configuration
  const inputBaseProps = {
    id: field.id,
    name: field.name,
    placeholder: field.placeholder || '',
    required: field.required,
    disabled: true
  };

  // Common props for sub-inputs within composite fields (like address or full_name parts)
  const subInputBaseProps = {
    disabled: true,
    className: `${baseInputStyles} rounded` // Sub-inputs get full base styling
  };

  switch (field.type) {
    case 'text':
      return <input type="text" {...inputBaseProps} className={`${baseInputStyles} rounded`} />;
    case 'long_text':
      return <textarea {...inputBaseProps} rows="4" className={`${baseInputStyles} rounded`}></textarea>;
    case 'url':
      return <input type="url" {...inputBaseProps} className={`${baseInputStyles} rounded`} />;
    case 'number':
      return <input type="text" {...inputBaseProps} placeholder="Ex: 1,234.56" className={`${baseInputStyles} rounded`} />;
    case 'email':
      return <input type="email" {...inputBaseProps} className={`${baseInputStyles} rounded`} />;
    case 'phone':
      return (
        <div className="flex">
          <select className="bg-[#131313] border-[#656464] text-[#D9D9D9] p-2 rounded-l border-r-0 w-20" disabled>
            <option>+{field.config?.defaultDDI || '55'}</option>
          </select>
          <input type="tel" {...inputBaseProps} className={`${baseInputStyles} rounded-l-none flex-1`} />
        </div>
      );
    case 'document':
      return <input type="text" {...inputBaseProps} placeholder={
        field.config?.documentType === 'cpf' ? 'CPF' :
        field.config?.documentType === 'cnpj' ? 'CNPJ' : 'CPF ou CNPJ'
      } className={`${baseInputStyles} rounded`} />;
    case 'address':
      return (
        <div className="space-y-2">
          <input type="text" {...subInputBaseProps} placeholder="CEP" id={`${field.id}-cep`} name={`${field.name}-cep`} className={`${subInputBaseProps.className} w-32`} />
          <input type="text" {...subInputBaseProps} placeholder="Endereço" id={`${field.id}-endereco`} name={`${field.name}-endereco`} />
          <div className="flex gap-2">
            <input type="text" {...subInputBaseProps} placeholder="Número" id={`${field.id}-numero`} name={`${field.name}-numero`} className={`${subInputBaseProps.className} w-24`} />
            <input type="text" {...subInputBaseProps} placeholder="Complemento" id={`${field.id}-complemento`} name={`${field.name}-complemento`} className={`${subInputBaseProps.className} flex-1`} />
          </div>
        </div>
      );
    case 'date':
      return <input type="date" {...inputBaseProps} className={`${baseInputStyles} rounded`} />;
    case 'time':
      return <input type="time" {...inputBaseProps} className={`${baseInputStyles} rounded`} />;
    case 'datetime':
      return <input type="datetime-local" {...inputBaseProps} className={`${baseInputStyles} rounded`} />;
    case 'money':
      return (
        <div className="flex">
          <span className="bg-[#131313] border-[#656464] text-[#D9D9D9] p-2 rounded-l border-r-0 px-3">
            {field.config?.currency === 'USD' ? '$' : field.config?.currency === 'EUR' ? '€' : 'R$'}
          </span>
          <input type="text" {...inputBaseProps} className={`${baseInputStyles} rounded-l-none flex-1`} />
        </div>
      );
    case 'full_name':
      return field.config?.singleField ? (
        <input type="text" {...inputBaseProps} placeholder="Nome completo" className={`${baseInputStyles} rounded`} />
      ) : (
        <div className="flex gap-2">
          <input type="text" {...subInputBaseProps} placeholder="Nome" id={`${field.id}-nome`} name={`${field.name}-nome`} className={`${subInputBaseProps.className} flex-1`} />
          <input type="text" {...subInputBaseProps} placeholder="Sobrenome" id={`${field.id}-sobrenome`} name={`${field.name}-sobrenome`} className={`${subInputBaseProps.className} flex-1`} />
        </div>
      );
    case 'radio':
      return (
        <div className="space-y-2">
          {(field.config?.options || []).map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input type="radio" name={field.name} id={`${field.id}-${index}`} disabled className="accent-[#E50F5F]" />
              <label htmlFor={`${field.id}-${index}`} className="text-sm">{option}</label>
            </div>
          ))}
        </div>
      );
    case 'dropdown':
      return (
        <select {...inputBaseProps} className={`${baseInputStyles} rounded`}>
          <option value="">Selecione uma opção</option>
          {(field.config?.options || []).map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      );
    case 'multi_select':
      return (
        <div className="space-y-2 max-h-32 overflow-y-auto border border-[#656464] rounded p-2">
          {(field.config?.options || []).map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input type="checkbox" id={`${field.id}-${index}`} disabled className="accent-[#E50F5F]" />
              <label htmlFor={`${field.id}-${index}`} className="text-sm">{option}</label>
            </div>
          ))}
        </div>
      );
    case 'reference':
      return (
        <select {...inputBaseProps} className={`${baseInputStyles} rounded`}>
          <option value="">Selecione da fonte: {field.config?.referenceType || 'planilhas'}</option>
        </select>
      );
    case 'dynamic_box':
      return (
        <div className="space-y-4 p-4 border border-[#656464] rounded">
          <div className="text-sm text-[#9CA3AF]">Caixa Dinâmica</div>
          {(field.config?.subFields || []).map((subField, index) => (
            <div key={subField.id || index}>
              <label className="text-xs text-[#9CA3AF]">{subField.label}</label>
              <input
                type="text"
                className="block w-full bg-[#1A1A1A] border-[#505050] text-[#D9D9D9] p-1 rounded text-sm"
                disabled
                placeholder={subField.placeholder || ''}
                id={`${field.id}-dynamic-${subField.id || index}`}
                name={`${field.name}-dynamic-${subField.name || index}`}
              />
            </div>
          ))}
          <button className="text-xs text-[#E50F5F] border border-[#E50F5F] px-2 py-1 rounded" disabled>+ Adicionar</button>
        </div>
      );
    case 'checklist':
      return (
        <div className="space-y-2 p-2 rounded bg-[#1A1A1A]">
          {(field.config?.items || []).map(item => (
            <div key={item.id} className="flex items-center gap-2">
              <input type="checkbox" id={item.id} disabled className="w-4 h-4 accent-[#E50F5F]" />
              <label htmlFor={item.id} className="text-sm">{item.value || 'Item sem nome'}</label>
            </div>
          ))}
        </div>
      );
    case 'hidden':
      return <div className="text-xs text-[#9CA3AF] italic">Campo oculto: {field.config?.fixedValue || 'Valor da URL'}</div>;
    case 'divider':
      return (
        <div className="py-4">
          <hr className="border-[#656464]" />
          <div className="text-center text-sm text-[#E50F5F] mt-2">
            {field.config?.stepText || 'Nova Etapa'}
          </div>
        </div>
      );
    default:
      return <input type="text" {...inputBaseProps} value={`Campo do tipo: ${field.type}`} className={`${baseInputStyles} rounded`} />;
  }
};


export default function FormPreview({ formData }) {
  const [viewMode, setViewMode] = useState('desktop');

  const getLayoutValue = (device, section, field, defaultValue = '') => {
    return formData.layout_settings?.[device]?.[section]?.[field] || defaultValue;
  };

  const getCurrentDevice = () => viewMode;

  const generateStyles = () => {
    const device = getCurrentDevice();
    
    // Estilos de fundo
    const backgroundStyles = {
      backgroundColor: getLayoutValue(device, 'background', 'color', '#2a2a2a'),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    };

    // Estilos do container
    const containerStyles = {
      backgroundColor: getLayoutValue(device, 'container', 'backgroundColor', '#1C1C1C'),
      width: device === 'desktop' ? '80%' : '100%',
      maxWidth: '600px',
      borderRadius: `${getLayoutValue(device, 'container', 'borderRadius', '8')}px`,
      border: getLayoutValue(device, 'container', 'hasBorder', true) 
        ? `${getLayoutValue(device, 'container', 'borderWidth', '1')}px solid ${getLayoutValue(device, 'container', 'borderColor', '#656464')}`
        : 'none',
    };

    // Estilos do título
    const titleStyles = {
      fontFamily: getLayoutValue(device, 'title', 'fontFamily', 'Inter'),
      fontSize: `${getLayoutValue(device, 'title', 'fontSize', '24')}px`,
      color: getLayoutValue(device, 'title', 'color', '#D9D9D9'),
    };

    // Estilos da descrição
    const descriptionStyles = {
      fontFamily: getLayoutValue(device, 'description', 'fontFamily', 'Inter'),
      fontSize: `${getLayoutValue(device, 'description', 'fontSize', '16')}px`,
      color: getLayoutValue(device, 'description', 'color', '#D9D9D9'),
    };

    // Estilos das perguntas
    const questionStyles = {
      fontFamily: getLayoutValue(device, 'questions', 'fontFamily', 'Inter'),
      fontSize: `${getLayoutValue(device, 'questions', 'fontSize', '14')}px`,
      color: getLayoutValue(device, 'questions', 'color', '#D9D9D9'),
    };

    // Estilos dos campos (usado apenas como fallback)
    const fieldStyles = {
      fontFamily: getLayoutValue(device, 'fields', 'fontFamily', 'Inter'),
      fontSize: `${getLayoutValue(device, 'fields', 'fontSize', '14')}px`,
      color: getLayoutValue(device, 'fields', 'color', '#D9D9D9'),
      backgroundColor: getLayoutValue(device, 'fields', 'backgroundColor', '#131313'),
      borderRadius: `${getLayoutValue(device, 'fields', 'borderRadius', '4')}px`,
      border: getLayoutValue(device, 'fields', 'hasBorder', true) 
        ? `${getLayoutValue(device, 'fields', 'borderWidth', '1')}px solid ${getLayoutValue(device, 'fields', 'borderColor', '#656464')}`
        : 'none',
      padding: '8px 12px',
    };

    // Estilos do botão (estado normal)
    const buttonStyles = {
      fontFamily: getLayoutValue(device, 'button', 'normal_fontFamily', 'Inter'),
      fontSize: `${getLayoutValue(device, 'button', 'normal_fontSize', '16')}px`,
      color: getLayoutValue(device, 'button', 'normal_color', '#FFFFFF'),
      backgroundColor: getLayoutValue(device, 'button', 'normal_backgroundColor', '#E50F5F'),
      borderRadius: `${getLayoutValue(device, 'button', 'normal_borderRadius', '6')}px`,
      border: getLayoutValue(device, 'button', 'normal_hasBorder', false) 
        ? `${getLayoutValue(device, 'button', 'normal_borderWidth', '1')}px solid ${getLayoutValue(device, 'button', 'normal_borderColor', '#E50F5F')}`
        : 'none',
      padding: '12px 24px',
      width: '100%',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    };

    const hoverStyles = {
      backgroundColor: getLayoutValue(device, 'button', 'hover_backgroundColor', '#D40F5A'),
      color: getLayoutValue(device, 'button', 'hover_color', '#FFFFFF'),
    };

    return {
      backgroundStyles,
      containerStyles,
      titleStyles,
      descriptionStyles,
      questionStyles,
      fieldStyles, // Mantido para compatibilidade, se necessário
      buttonStyles,
      hoverStyles
    };
  };

  const styles = generateStyles();
  const sortedFields = (formData.fields || []).sort((a,b) => a.order - b.order);

  return (
    <div className="flex flex-col h-full">
      {/* View Mode Toggle */}
      <div className="flex justify-center gap-2 mb-4">
        <Button
          variant={viewMode === 'desktop' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('desktop')}
          className={`${viewMode === 'desktop' ? 'bg-[#E50F5F] hover:bg-[#E50F5F]/90 text-white' : 'border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:text-[#D9D9D9] hover:border-[#E50F5F]/80 bg-[#1C1C1C]'}`}
        >
          <Monitor className="w-4 h-4 mr-2" />
          Desktop
        </Button>
        <Button
          variant={viewMode === 'mobile' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('mobile')}
          className={`${viewMode === 'mobile' ? 'bg-[#E50F5F] hover:bg-[#E50F5F]/90 text-white' : 'border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:text-[#D9D9D9] hover:border-[#E50F5F]/80 bg-[#1C1C1C]'}`}
        >
          <Smartphone className="w-4 h-4 mr-2" />
          Mobile
        </Button>
      </div>

      {/* Preview Area */}
      <div
        className={`flex-1 rounded-lg overflow-hidden transition-all duration-300 ${viewMode === 'desktop' ? 'w-full' : 'w-[375px] h-[667px] mx-auto border-4 border-gray-700 rounded-2xl'}`}
      >
        <div style={styles.backgroundStyles} className="w-full h-full overflow-y-auto custom-scrollbar">
          <div
            style={styles.containerStyles}
            className="p-8 shadow-2xl transition-all duration-300"
          >
            <h2 style={styles.titleStyles} className="text-center font-bold">
              {formData.headline || 'Headline do Formulário'}
            </h2>
            {formData.show_description && (
              <p style={styles.descriptionStyles} className="text-center mt-2">
                {formData.description || 'Descrição do formulário aparecerá aqui.'}
              </p>
            )}
            <div className="mt-8 space-y-6">
              
              {sortedFields.map(field => (
                <div key={field.id}>
                  {!formData.hide_questions && (
                    <label style={styles.questionStyles} className="block font-medium mb-1">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                  )}
                  {renderField(field)}
                </div>
              ))}
              
              <button
                style={styles.buttonStyles}
                onMouseEnter={(e) => {
                  Object.assign(e.target.style, styles.hoverStyles);
                }}
                onMouseLeave={(e) => {
                  Object.assign(e.target.style, {
                    backgroundColor: styles.buttonStyles.backgroundColor,
                    color: styles.buttonStyles.color,
                  });
                }}
                disabled
              >
                Enviar Respostas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
