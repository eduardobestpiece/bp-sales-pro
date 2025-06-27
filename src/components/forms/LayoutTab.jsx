
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Added Card imports

const FONT_OPTIONS = [
  'Athelas', 'Effra', 'Roboto', 'Montserrat', 'Poppins', 'Arial', 
  'DM Sans', 'DM Sans Serif', 'Inter', 'Open Sans', 'Lato', 
  'Source Sans Pro', 'Nunito', 'PT Sans', 'Ubuntu', 'Helvetica', 
  'Georgia', 'Times New Roman', 'SF Pro', 'SF Compact', 'SF Mono', 'Nova Yorque'
];

export default function LayoutTab({ formData, setFormData }) {
  const [deviceTab, setDeviceTab] = useState('desktop');
  const [buttonState, setButtonState] = useState('normal');

  const handleLayoutChange = (device, section, field, value) => {
    setFormData(prev => ({
      ...prev,
      layout_settings: {
        ...prev.layout_settings,
        [device]: {
          ...prev.layout_settings?.[device],
          [section]: {
            ...prev.layout_settings?.[device]?.[section],
            [field]: value
          }
        }
      }
    }));
  };

  const getLayoutValue = (device, section, field, defaultValue = '') => {
    return formData.layout_settings?.[device]?.[section]?.[field] || defaultValue;
  };
  
  const handleColorInputChange = (e, device, section, field) => {
    e.stopPropagation();
    handleLayoutChange(device, section, field, e.target.value);
  }

  const copyDesktopToMobile = () => {
    const desktopSettings = formData.layout_settings?.desktop || {};
    setFormData(prev => ({
      ...prev,
      layout_settings: {
        ...prev.layout_settings,
        mobile: { ...desktopSettings }
      }
    }));
    alert("Layout do desktop copiado para o mobile!");
  };

  const FontControls = ({ device, section, label }) => (
    <div className="space-y-4 p-4 bg-[#1A1A1A] rounded-lg border border-[#404040]">
      <h4 className="text-sm font-medium text-[#E50F5F]">{label}</h4>
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label className="text-[#D9D9D9] text-xs">Fonte</Label>
          <Select
            value={getLayoutValue(device, section, 'fontFamily', 'Inter')}
            onValueChange={(value) => handleLayoutChange(device, section, 'fontFamily', value)}
          >
            <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1C1C1C] border-[#656464] max-h-60">
              {FONT_OPTIONS.map(font => (
                <SelectItem key={font} value={font} className="text-[#D9D9D9]">
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[#D9D9D9] text-xs">Tamanho (px)</Label>
            <Input
              type="number"
              value={getLayoutValue(device, section, 'fontSize', section === 'title' ? '24' : section === 'description' ? '16' : section === 'questions' ? '14' : '14')}
              onChange={(e) => handleLayoutChange(device, section, 'fontSize', e.target.value)}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8"
            />
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <Label className="text-[#D9D9D9] text-xs">Cor</Label>
            <Input
              type="color"
              value={getLayoutValue(device, section, 'color', '#D9D9D9')}
              onChange={(e) => handleColorInputChange(e, device, section, 'color')}
              className="w-full h-8 p-1 bg-[#131313] border-[#656464]"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const FieldControls = ({ device }) => (
    <div className="space-y-4 p-4 bg-[#1A1A1A] rounded-lg border border-[#404040]">
      <h4 className="text-sm font-medium text-[#E50F5F]">Campos de Input</h4>
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label className="text-[#D9D9D9] text-xs">Fonte</Label>
          <Select
            value={getLayoutValue(device, 'fields', 'fontFamily', 'Inter')}
            onValueChange={(value) => handleLayoutChange(device, 'fields', 'fontFamily', value)}
          >
            <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1C1C1C] border-[#656464] max-h-60">
              {FONT_OPTIONS.map(font => (
                <SelectItem key={font} value={font} className="text-[#D9D9D9]">
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="text-[#D9D9D9] text-xs">Tamanho (px)</Label>
            <Input
              type="number"
              value={getLayoutValue(device, 'fields', 'fontSize', '14')}
              onChange={(e) => handleLayoutChange(device, 'fields', 'fontSize', e.target.value)}
              className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8"
            />
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <Label className="text-[#D9D9D9] text-xs">Cor Texto</Label>
            <Input
              type="color"
              value={getLayoutValue(device, 'fields', 'color', '#D9D9D9')}
              onChange={(e) => handleColorInputChange(e, device, 'fields', 'color')}
              className="w-full h-8 p-1 bg-[#131313] border-[#656464]"
            />
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <Label className="text-[#D9D9D9] text-xs">Cor Fundo</Label>
            <Input
              type="color"
              value={getLayoutValue(device, 'fields', 'backgroundColor', '#131313')}
              onChange={(e) => handleColorInputChange(e, device, 'fields', 'backgroundColor')}
              className="w-full h-8 p-1 bg-[#131313] border-[#656464]"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={getLayoutValue(device, 'fields', 'hasBorder', true)}
            onCheckedChange={(checked) => handleLayoutChange(device, 'fields', 'hasBorder', checked)}
          />
          <Label className="text-[#9CA3AF] text-xs">Mostrar borda</Label>
        </div>

        {getLayoutValue(device, 'fields', 'hasBorder', true) && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[#D9D9D9] text-xs">Espessura (px)</Label>
              <Input
                type="number"
                value={getLayoutValue(device, 'fields', 'borderWidth', '1')}
                onChange={(e) => handleLayoutChange(device, 'fields', 'borderWidth', e.target.value)}
                className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8"
              />
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <Label className="text-[#D9D9D9] text-xs">Cor Borda</Label>
              <Input
                type="color"
                value={getLayoutValue(device, 'fields', 'borderColor', '#656464')}
                onChange={(e) => handleColorInputChange(e, device, 'fields', 'borderColor')}
                className="w-full h-8 p-1 bg-[#131313] border-[#656464]"
              />
            </div>
          </div>
        )}

        <div>
          <Label className="text-[#D9D9D9] text-xs">Curva da Borda (px)</Label>
          <Input
            type="number"
            value={getLayoutValue(device, 'fields', 'borderRadius', '4')}
            onChange={(e) => handleLayoutChange(device, 'fields', 'borderRadius', e.target.value)}
            className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8"
          />
        </div>
      </div>
    </div>
  );

  const ButtonControls = ({ device }) => (
    <div className="space-y-4 p-4 bg-[#1A1A1A] rounded-lg border border-[#404040]">
      <h4 className="text-sm font-medium text-[#E50F5F]">Botão de Envio</h4>
      
      <Tabs value={buttonState} onValueChange={setButtonState} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#131313] h-8">
          <TabsTrigger value="normal" className="text-xs">Normal</TabsTrigger>
          <TabsTrigger value="hover" className="text-xs">Hover</TabsTrigger>
          <TabsTrigger value="pressed" className="text-xs">Pressionado</TabsTrigger>
        </TabsList>

        {['normal', 'hover', 'pressed'].map(state => (
          <TabsContent key={state} value={state} className="mt-4">
            <div className="space-y-4">
              <div>
                <Label className="text-[#D9D9D9] text-xs">Fonte</Label>
                <Select
                  value={getLayoutValue(device, 'button', `${state}_fontFamily`, 'Inter')}
                  onValueChange={(value) => handleLayoutChange(device, 'button', `${state}_fontFamily`, value)}
                >
                  <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C1C1C] border-[#656464] max-h-60">
                      {FONT_OPTIONS.map(font => (
                        <SelectItem key={font} value={font} className="text-[#D9D9D9]">
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[#D9D9D9] text-xs">Tamanho (px)</Label>
                  <Input
                    type="number"
                    value={getLayoutValue(device, 'button', `${state}_fontSize`, '16')}
                    onChange={(e) => handleLayoutChange(device, 'button', `${state}_fontSize`, e.target.value)}
                    className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8"
                  />
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <Label className="text-[#D9D9D9] text-xs">Cor Texto</Label>
                  <Input
                    type="color"
                    value={getLayoutValue(device, 'button', `${state}_color`, '#FFFFFF')}
                    onChange={(e) => handleColorInputChange(e, device, 'button', `${state}_color`)}
                    className="w-full h-8 p-1 bg-[#131313] border-[#656464]"
                  />
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <Label className="text-[#D9D9D9] text-xs">Cor Fundo</Label>
                  <Input
                    type="color"
                    value={getLayoutValue(device, 'button', `${state}_backgroundColor`, state === 'hover' ? '#D40F5A' : state === 'pressed' ? '#B20D4C' : '#E50F5F')}
                    onChange={(e) => handleColorInputChange(e, device, 'button', `${state}_backgroundColor`)}
                    className="w-full h-8 p-1 bg-[#131313] border-[#656464]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={getLayoutValue(device, 'button', `${state}_hasBorder`, false)}
                  onCheckedChange={(checked) => handleLayoutChange(device, 'button', `${state}_hasBorder`, checked)}
                />
                <Label className="text-[#9CA3AF] text-xs">Mostrar borda</Label>
              </div>

              {getLayoutValue(device, 'button', `${state}_hasBorder`, false) && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[#D9D9D9] text-xs">Espessura (px)</Label>
                    <Input
                      type="number"
                      value={getLayoutValue(device, 'button', `${state}_borderWidth`, '1')}
                      onChange={(e) => handleLayoutChange(device, 'button', `${state}_borderWidth`, e.target.value)}
                      className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8"
                    />
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Label className="text-[#D9D9D9] text-xs">Cor Borda</Label>
                    <Input
                      type="color"
                      value={getLayoutValue(device, 'button', `${state}_borderColor`, '#E50F5F')}
                      onChange={(e) => handleColorInputChange(e, device, 'button', `${state}_borderColor`)}
                      className="w-full h-8 p-1 bg-[#131313] border-[#656464]"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label className="text-[#D9D9D9] text-xs">Curva da Borda (px)</Label>
                <Input
                  type="number"
                  value={getLayoutValue(device, 'button', `${state}_borderRadius`, '6')}
                  onChange={(e) => handleLayoutChange(device, 'button', `${state}_borderRadius`, e.target.value)}
                  className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8"
                />
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );

  const ActionButtonsControls = ({ device }) => (
    <Card className="bg-[#1A1A1A] rounded-lg border border-[#404040]">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-[#E50F5F]">Botões de Ação (Caixa Dinâmica / Referência)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div onClick={(e) => e.stopPropagation()}>
            <Label className="text-[#D9D9D9] text-xs">Cor de fundo</Label>
            <Input
              type="color"
              value={getLayoutValue(device, 'actionButtons', 'backgroundColor', '#E50F5F')}
              onChange={(e) => handleColorInputChange(e, device, 'actionButtons', 'backgroundColor')}
              className="w-full h-8 p-1 bg-[#131313] border-[#656464]"
            />
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <Label className="text-[#D9D9D9] text-xs">Cor da borda</Label>
            <Input
              type="color"
              value={getLayoutValue(device, 'actionButtons', 'borderColor', '#E50F5F')}
              onChange={(e) => handleColorInputChange(e, device, 'actionButtons', 'borderColor')}
              className="w-full h-8 p-1 bg-[#131313] border-[#656464]"
            />
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <Label className="text-[#D9D9D9] text-xs">Cor do texto</Label>
            <Input
              type="color"
              value={getLayoutValue(device, 'actionButtons', 'textColor', '#FFFFFF')}
              onChange={(e) => handleColorInputChange(e, device, 'actionButtons', 'textColor')}
              className="w-full h-8 p-1 bg-[#131313] border-[#656464]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ContainerControls = ({ device }) => (
    <div className="space-y-4 p-4 bg-[#1A1A1A] rounded-lg border border-[#404040]">
      <h4 className="text-sm font-medium text-[#E50F5F]">Caixa do Formulário</h4>
      
      <div className="space-y-4">
        <div onClick={(e) => e.stopPropagation()}>
          <Label className="text-[#D9D9D9] text-xs">Cor de Fundo</Label>
          <Input
            type="color"
            value={getLayoutValue(device, 'container', 'backgroundColor', '#1C1C1C')}
            onChange={(e) => handleColorInputChange(e, device, 'container', 'backgroundColor')}
            className="w-full h-8 p-1 bg-[#131313] border-[#656464]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={getLayoutValue(device, 'container', 'hasBorder', true)}
            onCheckedChange={(checked) => handleLayoutChange(device, 'container', 'hasBorder', checked)}
          />
          <Label className="text-[#9CA3AF] text-xs">Mostrar borda</Label>
        </div>

        {getLayoutValue(device, 'container', 'hasBorder', true) && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[#D9D9D9] text-xs">Espessura (px)</Label>
              <Input
                type="number"
                value={getLayoutValue(device, 'container', 'borderWidth', '1')}
                onChange={(e) => handleLayoutChange(device, 'container', 'borderWidth', e.target.value)}
                className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8"
              />
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <Label className="text-[#D9D9D9] text-xs">Cor Borda</Label>
              <Input
                type="color"
                value={getLayoutValue(device, 'container', 'borderColor', '#656464')}
                onChange={(e) => handleColorInputChange(e, device, 'container', 'borderColor')}
                className="w-full h-8 p-1 bg-[#131313] border-[#656464]"
              />
            </div>
          </div>
        )}

        <div>
          <Label className="text-[#D9D9D9] text-xs">Curva da Borda (px)</Label>
          <Input
            type="number"
            value={getLayoutValue(device, 'container', 'borderRadius', '8')}
            onChange={(e) => handleLayoutChange(device, 'container', 'borderRadius', e.target.value)}
            className="bg-[#131313] border-[#656464] text-[#D9D9D9] h-8"
          />
        </div>
      </div>
    </div>
  );

  const BackgroundControls = ({ device }) => (
    <div className="space-y-4 p-4 bg-[#1A1A1A] rounded-lg border border-[#404040]">
      <h4 className="text-sm font-medium text-[#E50F5F]">Fundo da Página</h4>
      
      <div onClick={(e) => e.stopPropagation()}>
        <Label className="text-[#D9D9D9] text-xs">Cor de Fundo</Label>
        <Input
          type="color"
          value={getLayoutValue(device, 'background', 'color', '#2a2a2a')}
          onChange={(e) => handleColorInputChange(e, device, 'background', 'color')}
          className="w-full h-8 p-1 bg-[#131313] border-[#656464]"
        />
      </div>
    </div>
  );
  
  const ProgressBarControls = ({ device }) => (
    <div className="space-y-4 p-4 bg-[#1A1A1A] rounded-lg border border-[#404040]">
      <h4 className="text-sm font-medium text-[#E50F5F]">Barra de Progresso</h4>
      <div onClick={(e) => e.stopPropagation()}>
        <Label className="text-[#D9D9D9] text-xs">Cor da Barra</Label>
        <Input
          type="color"
          value={getLayoutValue(device, 'progressBar', 'color', '#E50F5F')}
          onChange={(e) => handleColorInputChange(e, device, 'progressBar', 'color')}
          className="w-full h-8 p-1 bg-[#131313] border-[#656464]"
        />
      </div>
    </div>
  );


  return (
    <div className="space-y-6">
      <Tabs value={deviceTab} onValueChange={setDeviceTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[#131313]">
          <TabsTrigger value="desktop">Desktop</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
        </TabsList>

        <TabsContent value="desktop" className="mt-6 space-y-4">
          <FontControls device="desktop" section="title" label="Título" />
          <FontControls device="desktop" section="description" label="Descrição" />
          <FontControls device="desktop" section="questions" label="Perguntas" />
          <FieldControls device="desktop" />
          <ButtonControls device="desktop" />
          <ActionButtonsControls device="desktop" />
          <ProgressBarControls device="desktop" />
          <ContainerControls device="desktop" />
          <BackgroundControls device="desktop" />
        </TabsContent>

        <TabsContent value="mobile" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={copyDesktopToMobile}
              className="border-[#E50F5F] text-[#E50F5F] hover:bg-[#E50F5F]/10 hover:text-[#E50F5F]"
            >
              Copiar do desktop
            </Button>
          </div>
          <FontControls device="mobile" section="title" label="Título" />
          <FontControls device="mobile" section="description" label="Descrição" />
          <FontControls device="mobile" section="questions" label="Perguntas" />
          <FieldControls device="mobile" />
          <ButtonControls device="mobile" />
          <ActionButtonsControls device="mobile" />
          <ProgressBarControls device="mobile" />
          <ContainerControls device="mobile" />
          <BackgroundControls device="mobile" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
