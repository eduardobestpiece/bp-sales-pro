import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Camera,
  Lock,
  Calendar,
  Globe,
  User,
  Phone,
  IdCard,
  Save,
  Loader2
} from "lucide-react";
import { User as UserEntity } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import ImageCropModal from "../common/ImageCropModal";

export default function PersonalInfoTab({ user, onRefresh, onUserUpdate, onOpenChangePassword }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
    birth_date: user?.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : "",
    document: user?.document || "",
    timezone: user?.timezone || "America/Sao_Paulo"
  });
  const fileInputRef = useRef(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await UserEntity.updateMyUserData(formData);
      // Usar onRefresh se disponível, senão usar onUserUpdate
      if (onRefresh && typeof onRefresh === 'function') {
        onRefresh();
      } else if (onUserUpdate && typeof onUserUpdate === 'function') {
        onUserUpdate();
      }
    } catch (error) {
      console.error("Erro ao salvar informações pessoais:", error);
    }
    setIsLoading(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target.result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCroppedImageSave = async (croppedImageData) => {
    setIsUploading(true);
    try {
      // Converter base64 para blob
      const response = await fetch(croppedImageData);
      const blob = await response.blob();
      
      // Criar um arquivo a partir do blob
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      
      const { file_url } = await UploadFile({ file });
      await UserEntity.updateMyUserData({ photo_url: file_url });
      
      // Usar onRefresh se disponível, senão usar onUserUpdate
      if (onRefresh && typeof onRefresh === 'function') {
        onRefresh();
      } else if (onUserUpdate && typeof onUserUpdate === 'function') {
        onUserUpdate();
      }
      
      setShowCropModal(false);
      setSelectedImage(null);
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      alert("Falha no upload da foto. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <Card className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveChanges} className="space-y-6">
              {/* Avatar e informações principais */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="w-24 h-24 border-2 border-[#E50F5F]">
                    <AvatarImage src={user?.photo_url} className="object-cover" />
                    <AvatarFallback className="bg-[#E50F5F] text-white text-3xl">
                      {user?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleAvatarClick}
                    className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6" />
                    )}
                  </Button>
                  <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{user?.full_name}</h2>
                  <p className="text-[#9CA3AF]">{user?.email}</p>
                </div>
              </div>
              
              {/* Informações - Form fields */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#9CA3AF] flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome Completo
                  </Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                    placeholder="Seu nome completo"
                  />
                </div>
                
                <div>
                  <Label className="text-[#9CA3AF] flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Telefone
                  </Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div>
                  <Label className="text-[#9CA3AF] flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data de Nascimento
                  </Label>
                  <Input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                    className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                  />
                </div>
                
                <div>
                  <Label className="text-[#9CA3AF] flex items-center gap-2">
                    <IdCard className="w-4 h-4" />
                    CPF
                  </Label>
                  <Input
                    value={formData.document}
                    onChange={(e) => handleInputChange('document', e.target.value)}
                    className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1"
                    placeholder="000.000.000-00"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label className="text-[#9CA3AF] flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Fuso Horário
                  </Label>
                  <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                    <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9] mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
                      <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                      <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tóquio (GMT+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[#656464]">
                {onOpenChangePassword && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onOpenChangePassword}
                    className="border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Alterar Senha
                  </Button>
                )}
                <Button 
                  type="submit" 
                  className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <ImageCropModal
        open={showCropModal}
        onClose={() => {
          setShowCropModal(false);
          setSelectedImage(null);
        }}
        onSave={handleCroppedImageSave}
        imageSrc={selectedImage}
        title="Recortar Foto de Perfil"
      />
    </>
  );
}