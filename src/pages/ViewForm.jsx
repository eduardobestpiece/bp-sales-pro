import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form } from '@/api/entities';
import { FormResponse } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Plus } from 'lucide-react';

// Funções de Pixel Helper
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

const fireMetaPixelEvent = async (pixelId, accessToken, eventName, userData, customData, eventSourceUrl) => {
  if (!pixelId) return;
  
  try {
    // Disparar pixel via Facebook Pixel API
    if (typeof window.fbq === 'function') {
      window.fbq('track', eventName, customData);
    }
    
    // Se tiver access token, usar Conversions API
    if (accessToken) {
      const url = `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`;
      const payload = {
        data: [
          {
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            action_source: 'website',
            event_source_url: eventSourceUrl || window.location.href,
            user_data: {
              em: userData.email ? [await sha256(userData.email.toLowerCase().trim())] : [],
              ph: userData.phone ? [await sha256(userData.phone.replace(/\D/g, ''))] : [],
              client_user_agent: navigator.userAgent,
              fbc: getCookie('_fbc'),
              fbp: getCookie('_fbp'),
            },
            custom_data: customData,
          },
        ],
      };
      
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
  } catch (error) {
    console.error('Meta Pixel Error:', error);
  }
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return undefined;
};

const fireGoogleAnalyticsEvent = (gaId, eventName, eventParams) => {
  if (!gaId || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, { ...eventParams, 'send_to': gaId });
};

const fireGoogleAdsConversion = (adsId, conversionLabel, eventParams) => {
  if (!adsId || !conversionLabel || typeof window.gtag !== 'function') return;
  window.gtag('event', 'conversion', {
    'send_to': `${adsId}/${conversionLabel}`,
    ...eventParams
  });
};

const fireGTMEvent = (data) => {
    if (typeof window.dataLayer === 'undefined') {
        window.dataLayer = [];
    }
    window.dataLayer.push(data);
};

// Funções de validação
const isValidUrl = (string) => {
  try {
    const url = string.includes('://') ? string : `https://${string}`;
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const fetchAddressByCEP = async (cep) => {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    return data.erro ? null : data;
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
};

// Componente para renderizar campos dentro da Caixa Dinâmica
const FieldRenderer = ({ field, value, onChange }) => {
    const baseInputStyle = "block w-full bg-transparent p-3 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:border-[#E50F5F] focus:outline-none transition-colors";

    const internalHandleChange = (e) => {
        let processedValue = e.target.value;
        const { type, checked } = e.target;

        if (field.type === 'number') processedValue = processedValue.replace(/[^0-9,]/g, '');
        else if (field.type === 'money') processedValue = processedValue.replace(/[^0-9,.]/g, '');
        else if (field.type === 'phone' || field.type === 'document') processedValue = processedValue.replace(/[^0-9]/g, '');
        else if (field.type === 'email') processedValue = processedValue.toLowerCase();
        else if (type === 'checkbox') processedValue = checked;

        onChange(field.name, processedValue);
    };

    switch (field.type) {
        case 'text': return <input type="text" name={field.name} placeholder={field.placeholder} required={field.required} onChange={internalHandleChange} value={value || ''} className={baseInputStyle} />;
        case 'long_text': return <textarea name={field.name} placeholder={field.placeholder} required={field.required} onChange={internalHandleChange} value={value || ''} className={`${baseInputStyle} h-24 resize-vertical`} />;
        case 'email': return <input type="email" name={field.name} placeholder={field.placeholder} required={field.required} onChange={internalHandleChange} value={value || ''} className={baseInputStyle} onBlur={(e) => { e.target.setCustomValidity(e.target.value && !isValidEmail(e.target.value) ? 'Por favor, insira um email válido' : ''); }} />;
        case 'number': return <input type="text" name={field.name} placeholder={field.placeholder} required={field.required} onChange={internalHandleChange} value={value || ''} className={baseInputStyle} />;
        case 'url': return <input type="url" name={field.name} placeholder={field.placeholder} required={field.required} onChange={internalHandleChange} value={value || ''} className={baseInputStyle} onBlur={(e) => { e.target.setCustomValidity(e.target.value && !isValidUrl(e.target.value) ? 'Por favor, insira uma URL válida' : ''); }} />;
        case 'phone': return <input type="tel" name={field.name} placeholder={field.placeholder} required={field.required} onChange={internalHandleChange} value={value || ''} className={baseInputStyle} />;
        case 'document': return <input type="text" name={field.name} placeholder={field.placeholder} required={field.required} onChange={internalHandleChange} value={value || ''} className={baseInputStyle} />;
        case 'date': return <input type="date" name={field.name} required={field.required} onChange={internalHandleChange} value={value || ''} className={baseInputStyle} />;
        case 'time': return <input type="time" name={field.name} required={field.required} onChange={internalHandleChange} value={value || ''} className={baseInputStyle} />;
        case 'datetime': return <input type="datetime-local" name={field.name} required={field.required} onChange={internalHandleChange} value={value || ''} className={baseInputStyle} />;
        case 'money': return <input type="text" name={field.name} placeholder="0,00" required={field.required} onChange={internalHandleChange} value={value || ''} className={baseInputStyle} />;
        case 'full_name': return <input type="text" name={field.name} placeholder={field.placeholder} required={field.required} onChange={internalHandleChange} value={value || ''} className={baseInputStyle} />;
        default: return <div className="text-red-500 text-sm">Campo '{field.type}' não suportado dentro de Dynamic Box.</div>;
    }
};

const renderField = (field, responseData, setResponseData, layoutSettings, handleFirstInput) => {
    const baseInputStyle = "block w-full bg-transparent p-3 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:border-[#E50F5F] focus:outline-none transition-colors";
    
    const actionButtonBg = layoutSettings?.desktop?.actionButtons?.backgroundColor || '#E50F5F';
    const actionButtonText = layoutSettings?.desktop?.actionButtons?.textColor || '#FFFFFF';
    const actionButtonBorder = layoutSettings?.desktop?.actionButtons?.borderColor || actionButtonBg;

    const actionButtonStyle = {
        backgroundColor: actionButtonBg,
        color: actionButtonText,
        borderColor: actionButtonBorder,
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let processedValue = value;
        if (type === 'checkbox') processedValue = checked;
        else if (field.type === 'number') processedValue = value.replace(/[^0-9,]/g, '');
        else if (field.type === 'money') processedValue = value.replace(/[^0-9,.]/g, '');
        else if (field.type === 'phone' || field.type === 'document') processedValue = value.replace(/[^0-9]/g, '');
        else if (field.type === 'email') processedValue = value.toLowerCase();
        
        setResponseData(prev => ({ ...prev, [name]: processedValue }));
        
        // Disparar evento de primeiro input
        if (handleFirstInput && value.length === 1 && (!responseData[name] || responseData[name].length === 0)) {
            handleFirstInput();
        }
    };

    const handleCEPChange = async (e) => {
        const cep = e.target.value.replace(/[^0-9]/g, '');
        setResponseData(prev => ({ ...prev, [`${field.name}_cep`]: cep }));
        
        if (handleFirstInput && cep.length === 1 && (!responseData[`${field.name}_cep`] || responseData[`${field.name}_cep`].length === 0)) {
            handleFirstInput();
        }

        if (cep.length === 8) {
            const addressData = await fetchAddressByCEP(cep);
            if (addressData) {
                setResponseData(prev => ({
                    ...prev,
                    [`${field.name}_endereco`]: addressData.logradouro,
                    [`${field.name}_bairro`]: addressData.bairro,
                    [`${field.name}_cidade`]: addressData.localidade,
                    [`${field.name}_estado`]: addressData.uf,
                    [`${field.name}_pais`]: 'Brasil'
                }));
            }
        }
    };
    
    const handleMultiChange = (name, value, isChecked) => {
        setResponseData(prev => {
            const currentValues = prev[name] || [];
            if (isChecked) {
                return { ...prev, [name]: [...currentValues, value] };
            } else {
                return { ...prev, [name]: currentValues.filter(v => v !== value) };
            }
        });
        
        if (handleFirstInput && isChecked && (!responseData[name] || responseData[name].length === 0)) {
            handleFirstInput();
        }
    };

    const setFieldValue = (fieldName, value) => {
        setResponseData(prev => ({ ...prev, [fieldName]: value }));
        
        if (handleFirstInput && value && (!responseData[fieldName] || responseData[fieldName].length === 0)) {
            handleFirstInput();
        }
    };

    switch (field.type) {
        case 'text': return <input type="text" name={field.name} placeholder={field.placeholder} required={field.required} onChange={handleChange} value={responseData[field.name] || ''} className={baseInputStyle} />;
        case 'long_text': return <textarea name={field.name} placeholder={field.placeholder} required={field.required} onChange={handleChange} value={responseData[field.name] || ''} className={`${baseInputStyle} h-24 resize-vertical`} />;
        case 'email': return <input type="email" name={field.name} placeholder={field.placeholder} required={field.required} onChange={handleChange} value={responseData[field.name] || ''} className={baseInputStyle} onBlur={(e) => { e.target.setCustomValidity(e.target.value && !isValidEmail(e.target.value) ? 'Por favor, insira um email válido' : ''); }} />;
        case 'number': return <input type="text" name={field.name} placeholder={field.placeholder} required={field.required} onChange={handleChange} value={responseData[field.name] || ''} className={baseInputStyle} />;
        case 'url': return <input type="url" name={field.name} placeholder={field.placeholder} required={field.required} onChange={handleChange} value={responseData[field.name] || ''} className={baseInputStyle} onBlur={(e) => { e.target.setCustomValidity(e.target.value && !isValidUrl(e.target.value) ? 'Por favor, insira uma URL válida' : ''); }} />;
        case 'phone': return <input type="tel" name={field.name} placeholder={field.placeholder} required={field.required} onChange={handleChange} value={responseData[field.name] || ''} className={baseInputStyle} />;
        case 'document': return <input type="text" name={field.name} placeholder={field.placeholder} required={field.required} onChange={handleChange} value={responseData[field.name] || ''} className={baseInputStyle} />;
        case 'address': return (
            <div className="space-y-3">
                <input type="text" name={`${field.name}_cep`} placeholder="CEP (somente números)" onChange={handleCEPChange} value={responseData[`${field.name}_cep`] || ''} maxLength={8} className={`${baseInputStyle} w-40`} />
                <input type="text" name={`${field.name}_endereco`} placeholder="Endereço" value={responseData[`${field.name}_endereco`] || ''} className={baseInputStyle} readOnly />
                <input type="text" name={`${field.name}_bairro`} placeholder="Bairro" value={responseData[`${field.name}_bairro`] || ''} className={baseInputStyle} readOnly />
                <div className="flex gap-3">
                    <input type="text" name={`${field.name}_cidade`} placeholder="Cidade" value={responseData[`${field.name}_cidade`] || ''} className={baseInputStyle} readOnly />
                    <input type="text" name={`${field.name}_estado`} placeholder="Estado" value={responseData[`${field.name}_estado`] || ''} className={baseInputStyle} readOnly />
                </div>
                <div className="flex gap-3">
                    <input type="text" name={`${field.name}_numero`} placeholder="Número" onChange={handleChange} value={responseData[`${field.name}_numero`] || ''} className={`${baseInputStyle} w-24`} />
                    <input type="text" name={`${field.name}_complemento`} placeholder="Complemento" onChange={handleChange} value={responseData[`${field.name}_complemento`] || ''} className={`${baseInputStyle} flex-1`} />
                </div>
            </div>
        );
        case 'date': return <input type="date" name={field.name} required={field.required} onChange={handleChange} value={responseData[field.name] || ''} className={baseInputStyle} />;
        case 'time': return <input type="time" name={field.name} required={field.required} onChange={handleChange} value={responseData[field.name] || ''} className={baseInputStyle} />;
        case 'datetime': return <input type="datetime-local" name={field.name} required={field.required} onChange={handleChange} value={responseData[field.name] || ''} className={baseInputStyle} />;
        case 'money': return <input type="text" name={field.name} placeholder="0,00" required={field.required} onChange={handleChange} value={responseData[field.name] || ''} className={baseInputStyle} />;
        case 'full_name': return <input type="text" name={field.name} placeholder={field.placeholder} required={field.required} onChange={handleChange} value={responseData[field.name] || ''} className={baseInputStyle} />;
        case 'radio': return <div className="space-y-2">{(field.config?.options || []).map((option, index) => <div key={index} className="flex items-center gap-2"><input type="radio" name={field.name} value={option} id={`${field.name}_${index}`} onChange={handleChange} checked={responseData[field.name] === option} className="accent-[#E50F5F]" /><label htmlFor={`${field.name}_${index}`} className="text-white text-sm">{option}</label></div>)}</div>;
        case 'dropdown': return <select name={field.name} required={field.required} onChange={handleChange} value={responseData[field.name] || ''} className={`${baseInputStyle} bg-gray-800`}><option value="">Selecione...</option>{(field.config?.options || []).map((option, index) => <option key={index} value={option}>{option}</option>)}</select>;
        case 'multi_select': return <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-500 rounded-md p-3">{(field.config?.options || []).map((option, index) => <div key={index} className="flex items-center gap-2"><input type="checkbox" id={`${field.name}_${index}`} onChange={(e) => handleMultiChange(field.name, option, e.target.checked)} checked={(responseData[field.name] || []).includes(option)} className="accent-[#E50F5F]" /><label htmlFor={`${field.name}_${index}`} className="text-white text-sm">{option}</label></div>)}</div>;
        case 'checklist': return <div className="space-y-2">{(field.config?.items || []).map(item => <div key={item.id} className="flex items-center gap-2"><input type="checkbox" id={item.id} name={`${field.name}_${item.id}`} onChange={handleChange} checked={responseData[`${field.name}_${item.id}`] || false} className="w-4 h-4 accent-[#E50F5F]" /><label htmlFor={item.id} className="text-white text-sm">{item.value}</label></div>)}</div>;
        case 'hidden': return <input type="hidden" name={field.name} value={field.config?.fixedValue || ''} />;
        case 'divider': return null;
        case 'dynamic_box': {
            const boxItems = responseData[field.name] || [];
            const addItem = () => setFieldValue(field.name, [...boxItems, { _id: `item-${Date.now()}` }]);
            const removeItem = (index) => setFieldValue(field.name, boxItems.filter((_, i) => i !== index));
            const handleBoxItemChange = (itemIndex, subFieldName, subFieldValue) => {
                const newItems = [...boxItems];
                newItems[itemIndex] = { ...newItems[itemIndex], [subFieldName]: subFieldValue };
                setFieldValue(field.name, newItems);
            };
            return (
                <div className="space-y-4">
                    {boxItems.map((item, index) => (
                        <div key={item._id} className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg space-y-3 relative">
                            <Button size="icon" variant="ghost" onClick={() => removeItem(index)} className="absolute top-1 right-1 h-6 w-6 text-gray-500 hover:text-red-500"><X className="w-4 h-4" /></Button>
                            {(field.config?.fields || []).map(subField => (
                                <div key={subField.id}>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">{subField.label} {subField.required && <span className="text-red-500">*</span>}</label>
                                    <FieldRenderer field={subField} value={item[subField.name]} onChange={(name, value) => handleBoxItemChange(index, name, value)} />
                                </div>
                            ))}
                        </div>
                    ))}
                    <Button type="button" onClick={addItem} style={actionButtonStyle} className="w-full border"><Plus className="w-4 h-4 mr-2" /> {field.config?.addButtonText || 'Adicionar Item'}</Button>
                </div>
            );
        }
        default: return <div className="text-red-500 text-sm">Campo do tipo '{field.type}' não suportado.</div>;
    }
};

export default function ViewForm() {
    const [searchParams] = useSearchParams();
    const formId = searchParams.get('id');
    const [form, setForm] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [responseData, setResponseData] = useState({});
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRejected, setIsRejected] = useState(false);
    const [rejectionMessage, setRejectionMessage] = useState("");
    const [hasStartedTyping, setHasStartedTyping] = useState(false);

    useEffect(() => {
        const loadForm = async () => {
            if (!formId) {
                setError('ID do formulário não fornecido.');
                setIsLoading(false);
                return;
            }
            try {
                const formData = await Form.get(formId);
                
                // CORREÇÃO CRÍTICA: Se o formulário for público, não tentar fazer autenticação
                if (!formData.is_public) {
                   try {
                       await User.me(); 
                   } catch (authError) {
                       setError('Este formulário requer login.');
                       setIsLoading(false);
                       return;
                   }
                }
                
                setForm(formData);
                
                // Disparar pixels de início de formulário
                const { pixels } = formData.integrations || {};
                if (pixels?.meta_pixel_id) {
                    fireMetaPixelEvent(pixels.meta_pixel_id, pixels.meta_access_token, 'ViewForm', {}, {});
                }
                if (pixels?.ga_id) {
                    fireGoogleAnalyticsEvent(pixels.ga_id, 'page_view', { page_title: formData.title });
                }
                if (pixels?.gtm_id) {
                    fireGTMEvent({ 
                        event: 'page_view', 
                        page_title: formData.title,
                        form_id: formData.id 
                    });
                }
                
            } catch (e) {
                console.error('Erro ao carregar formulário:', e);
                setError('Formulário não encontrado.');
            } finally {
                setIsLoading(false);
            }
        };
        loadForm();
    }, [formId]);

    // Carregar scripts de rastreamento
    useEffect(() => {
        if (form?.integrations?.pixels) {
            const { meta_pixel_id, ga_id, gtm_id } = form.integrations.pixels;
            
            // Meta Pixel
            if (meta_pixel_id && !window.fbq) {
                const script = document.createElement('script');
                script.innerHTML = `
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window,document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '${meta_pixel_id}');
                    fbq('track', 'PageView');
                `;
                document.head.appendChild(script);
            }
            
            // Google Analytics
            if (ga_id && !window.gtag) {
                const gtagScript = document.createElement('script');
                gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${ga_id}`;
                gtagScript.async = true;
                document.head.appendChild(gtagScript);
                
                const gtagConfig = document.createElement('script');
                gtagConfig.innerHTML = `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${ga_id}');
                `;
                document.head.appendChild(gtagConfig);
            }
            
            // Google Tag Manager
            if (gtm_id && !window.dataLayer) {
                const gtmScript = document.createElement('script');
                gtmScript.innerHTML = `
                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','${gtm_id}');
                `;
                document.head.appendChild(gtmScript);
            }
        }
    }, [form]);

    const handleFirstInput = useCallback(() => {
        if (!hasStartedTyping && form?.integrations?.pixels) {
            setHasStartedTyping(true);
            const { pixels } = form.integrations;
            const userData = { email: responseData.email, phone: responseData.phone };
            
            if (pixels.meta_pixel_id) {
                fireMetaPixelEvent(pixels.meta_pixel_id, pixels.meta_access_token, 'FormInitiate', userData, responseData);
            }
            if (pixels.ga_id) {
                fireGoogleAnalyticsEvent(pixels.ga_id, 'form_start', { form_id: form.id });
            }
            if (pixels.gtm_id) {
                fireGTMEvent({ 
                    event: 'form_start', 
                    form_id: form.id,
                    form_title: form.title 
                });
            }
        }
    }, [hasStartedTyping, form, responseData]);

    const fieldsByStep = form?.fields?.sort((a, b) => (a.order || 0) - (b.order || 0)).reduce((acc, field) => {
        if (field.type === 'divider') acc.push([]);
        else {
            if (acc.length === 0) acc.push([]);
            acc[acc.length - 1].push(field);
        }
        return acc;
    }, []) || [];

    const totalSteps = fieldsByStep.length;
    const currentStepFields = fieldsByStep[currentStep] || [];

    const checkRejection = useCallback((data) => {
        const config = form?.integrations?.rejection_config;
        if (!config?.enabled || !config.filters) return false;
        for (const filter of config.filters) {
            const fieldValue = String(data[filter.field] || '');
            const filterValue = String(filter.value || '');
            let isMatch = false;
            switch (filter.condition) {
                case 'equals': isMatch = fieldValue === filterValue; break;
                case 'not_equals': isMatch = fieldValue !== filterValue; break;
                case 'contains': isMatch = fieldValue.includes(filterValue); break;
                case 'not_contains': isMatch = !fieldValue.includes(filterValue); break;
                case 'less_than': isMatch = Number(fieldValue) < Number(filterValue); break;
                case 'greater_than': isMatch = Number(fieldValue) > Number(filterValue); break;
            }
            if (isMatch) {
                setRejectionMessage(config.text || 'Suas informações não atendem aos critérios.');
                return true;
            }
        }
        return false;
    }, [form]);

    const validateCurrentStep = useCallback(() => {
        for (const field of currentStepFields) {
            if (field.required) {
                const value = responseData[field.name];
                if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim().length === 0)) {
                    return false;
                }
            }
        }
        return true;
    }, [currentStepFields, responseData]);

    const handleNext = () => {
        if (!validateCurrentStep()) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        if (checkRejection(responseData)) {
            setIsRejected(true);
            return;
        }
        if (currentStep < totalSteps - 1) setCurrentStep(prev => prev + 1);
    };

    const handlePrevious = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateCurrentStep()) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        if (checkRejection(responseData)) {
            setIsRejected(true);
            return;
        }
        setIsSubmitting(true);
        const trackingParams = new URLSearchParams(window.location.search);
        const trackingData = Object.fromEntries(trackingParams.entries());
        const finalData = { form_id: formId, responses: responseData, tracking_data: trackingData };

        try {
            await FormResponse.create(finalData);
            if (form) await Form.update(formId, { responses_count: (form.responses_count || 0) + 1 });
            
            const { pixels, webhook_url, completion_action } = form.integrations || {};
            
            // Webhook
            if (webhook_url) {
                fetch(webhook_url, { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify(finalData) 
                }).catch(console.error);
            }

            // Pixels de conversão
            if (pixels) {
                const userData = { email: responseData.email, phone: responseData.phone };
                if (pixels.meta_pixel_id) {
                    fireMetaPixelEvent(pixels.meta_pixel_id, pixels.meta_access_token, 'FormSent', userData, responseData);
                }
                if (pixels.ga_id) {
                    fireGoogleAnalyticsEvent(pixels.ga_id, 'form_submit', responseData);
                }
                if (pixels.google_ads_id && pixels.google_conversion_label) {
                    fireGoogleAdsConversion(pixels.google_ads_id, pixels.google_conversion_label, responseData);
                }
                if (pixels.gtm_id) {
                    fireGTMEvent({ 
                        event: 'form_submission', 
                        form_id: form.id,
                        form_title: form.title,
                        ...responseData 
                    });
                }
            }

            // Ações de conclusão
            if (completion_action?.type === 'redirect' && completion_action.url) {
                let redirectUrl = completion_action.url;
                if (!redirectUrl.startsWith('http')) {
                    redirectUrl = `https://${redirectUrl}`;
                }
                const url = new URL(redirectUrl);
                Object.entries(trackingData).forEach(([key, value]) => url.searchParams.append(key, value));
                window.location.href = url.toString();
            } else if (completion_action?.type === 'whatsapp' && completion_action.whatsapp_number) {
                let message = completion_action.whatsapp_message || '';
                Object.entries(responseData).forEach(([key, value]) => { 
                    message = message.replace(`{${key}}`, encodeURIComponent(String(value))); 
                });
                window.location.href = `https://wa.me/${completion_action.whatsapp_number}?text=${message}`;
            } else {
                setShowSuccessMessage(true);
            }
        } catch (err) {
            console.error('Erro ao enviar formulário:', err);
            alert('Ocorreu um erro ao enviar suas respostas.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="flex items-center justify-center h-screen bg-[#131313] text-white">Carregando...</div>;
    if (error) return <div className="flex items-center justify-center h-screen bg-[#131313] text-red-500">{error}</div>;
    if (!form) return null;

    const layoutSettings = form.layout_settings || {};
    const successMessage = form.integrations?.completion_action?.success_message || "Obrigado! Suas respostas foram enviadas.";
    const progressPercentage = totalSteps > 1 ? ((currentStep + 1) / totalSteps) * 100 : 0;
    
    if (isRejected) return <div className="flex items-center justify-center min-h-screen bg-[#1C1C1C] text-white p-4"><div className="text-center bg-[#131313] p-8 rounded-lg shadow-lg max-w-md"><h2 className="text-2xl font-bold text-[#E50F5F] mb-4">Reprovado</h2><p>{rejectionMessage}</p></div></div>;
    if (showSuccessMessage) return <div className="flex items-center justify-center min-h-screen bg-[#1C1C1C] text-white p-4"><div className="text-center bg-[#131313] p-8 rounded-lg shadow-lg max-w-md"><h2 className="text-2xl font-bold text-green-400 mb-4">Enviado com Sucesso!</h2><p>{successMessage}</p></div></div>;

    return (
        <div style={{ backgroundColor: layoutSettings.desktop?.background?.color || '#131313' }} className="flex items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
            <div style={{ backgroundColor: layoutSettings.desktop?.container?.backgroundColor || '#1C1C1C', borderRadius: `${layoutSettings.desktop?.container?.borderRadius || 8}px` }} className="w-full max-w-2xl p-6 sm:p-8 md:p-10 shadow-2xl">
                {totalSteps > 1 && <div className="mb-8"><div className="flex justify-between mb-1"><span className="text-base font-medium text-[#E50F5F]">Etapa {currentStep + 1} de {totalSteps}</span></div><div className="w-full bg-gray-700 rounded-full h-2.5"><div style={{ width: `${progressPercentage}%`, backgroundColor: layoutSettings.desktop?.progressBar?.color || '#E50F5F' }} className="h-2.5 rounded-full"></div></div></div>}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white">{form.headline}</h2>
                    {form.show_description && <p className="mt-2 text-gray-400">{form.description}</p>}
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {currentStepFields.map(field => <div key={field.id}>{!form.hide_questions && <label className="block text-sm font-medium text-gray-300 mb-2">{field.label} {field.required && <span className="text-red-500">*</span>}</label>}{renderField(field, responseData, setResponseData, layoutSettings, handleFirstInput)}</div>)}
                    <div className="flex justify-between items-center pt-6">
                        {currentStep > 0 ? <Button type="button" onClick={handlePrevious} className="bg-transparent border border-gray-500 text-white hover:bg-gray-800"><ChevronLeft className="w-4 h-4 mr-2" />Voltar</Button> : <div></div>}
                        {currentStep < totalSteps - 1 ? <Button type="button" onClick={handleNext} disabled={!validateCurrentStep()} className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white disabled:opacity-50">Avançar<ChevronRight className="w-4 h-4 ml-2" /></Button> : <Button type="submit" disabled={isSubmitting || !validateCurrentStep()} className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white disabled:opacity-50">{isSubmitting ? 'Enviando...' : 'Enviar'}</Button>}
                    </div>
                </form>
            </div>
        </div>
    );
}