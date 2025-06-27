import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/api/entities";

export default function FormSettingsModal({ form, open, onClose, onSuccess }) {
  const [settings, setSettings] = useState({
    redirect_url: "",
    success_message: "Obrigado! Sua mensagem foi enviada com sucesso.",
    email_notification: false,
    notification_emails: [],
    auto_respond: false,
    auto_respond_message: ""
  });
  const [emailInput, setEmailInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (form && open) {
      setSettings(form.settings || {
        redirect_url: "",
        success_message: "Obrigado! Sua mensagem foi enviada com sucesso.",
        email_notification: false,
        notification_emails: [],
        auto_respond: false,
        auto_respond_message: ""
      });
    }
  }, [form, open]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const addNotificationEmail = () => {
    if (emailInput && !settings.notification_emails?.includes(emailInput)) {
      setSettings(prev => ({
        ...prev,
        notification_emails: [...(prev.notification_emails || []), emailInput]
      }));
      setEmailInput("");
    }
  };

  const removeNotificationEmail = (email) => {
    setSettings(prev => ({
      ...prev,
      notification_emails: prev.notification_emails?.filter(e => e !== email) || []
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await Form.update(form.id, { settings });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#E50F5F]">
            Configurações - {form?.title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mensagem de Sucesso */}
          <Card className="bg-[#131313] border-[#656464]">
            <CardHeader>
              <CardTitle className="text-[#D9D9D9]">Após o Envio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Mensagem de Sucesso</Label>
                <Textarea 
                  value={settings.success_message}
                  onChange={(e) => handleSettingChange('success_message', e.target.value)}
                  className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label>URL de Redirecionamento (opcional)</Label>
                <Input 
                  value={settings.redirect_url}
                  onChange={(e) => handleSettingChange('redirect_url', e.target.value)}
                  className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] mt-1"
                  placeholder="https://exemplo.com/obrigado"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notificações por Email */}
          <Card className="bg-[#131313] border-[#656464]">
            <CardHeader>
              <CardTitle className="text-[#D9D9D9]">Notificações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.email_notification}
                  onCheckedChange={(checked) => handleSettingChange('email_notification', checked)}
                />
                <Label>Receber notificação por email quando houver nova resposta</Label>
              </div>
              
              {settings.email_notification && (
                <div>
                  <Label>Emails para notificação</Label>
                  <div className="flex gap-2 mt-1">
                    <Input 
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
                      placeholder="email@exemplo.com"
                      type="email"
                    />
                    <Button type="button" onClick={addNotificationEmail} variant="outline" className="border-[#656464] text-[#D9D9D9]">
                      Adicionar
                    </Button>
                  </div>
                  {settings.notification_emails?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {settings.notification_emails.map((email) => (
                        <div key={email} className="flex items-center justify-between p-2 bg-[#1C1C1C] rounded">
                          <span className="text-[#D9D9D9]">{email}</span>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeNotificationEmail(email)}
                          >
                            Remover
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resposta Automática */}
          <Card className="bg-[#131313] border-[#656464]">
            <CardHeader>
              <CardTitle className="text-[#D9D9D9]">Resposta Automática</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.auto_respond}
                  onCheckedChange={(checked) => handleSettingChange('auto_respond', checked)}
                />
                <Label>Enviar resposta automática por email para quem preencher o formulário</Label>
              </div>
              
              {settings.auto_respond && (
                <div>
                  <Label>Mensagem da resposta automática</Label>
                  <Textarea 
                    value={settings.auto_respond_message}
                    onChange={(e) => handleSettingChange('auto_respond_message', e.target.value)}
                    className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] mt-1"
                    rows={4}
                    placeholder="Obrigado por entrar em contato! Recebemos sua mensagem e entraremos em contato em breve."
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-[#656464]">
            <Button type="button" variant="outline" onClick={onClose} className="border-[#656464] text-[#D9D9D9]">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white">
              {isLoading ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}