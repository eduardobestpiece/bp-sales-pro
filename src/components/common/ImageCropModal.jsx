import React, { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crop, RotateCcw, Check, X } from "lucide-react";

export default function ImageCropModal({ 
  open, 
  onClose, 
  onSave, 
  imageSrc,
  title = "Recortar Imagem",
  aspectRatio = 1 // Para manter quadrado
}) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
    width: 200,
    height: 200
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const handleImageLoad = useCallback((e) => {
    const { naturalWidth, naturalHeight } = e.target;
    const containerWidth = 400;
    const containerHeight = 400;
    
    let displayWidth, displayHeight;
    
    if (naturalWidth > naturalHeight) {
      displayWidth = containerWidth;
      displayHeight = (naturalHeight / naturalWidth) * containerWidth;
    } else {
      displayHeight = containerHeight;
      displayWidth = (naturalWidth / naturalHeight) * containerHeight;
    }
    
    setImageSize({ width: displayWidth, height: displayHeight });
    
    // Centralizar o crop inicialmente
    const cropSize = Math.min(displayWidth, displayHeight) * 0.8;
    setCrop({
      x: (displayWidth - cropSize) / 2,
      y: (displayHeight - cropSize) / 2,
      width: cropSize,
      height: cropSize
    });
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left - crop.x,
      y: e.clientY - rect.top - crop.y
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragStart.x;
    const newY = e.clientY - rect.top - dragStart.y;
    
    // Limitar o crop dentro da imagem
    const maxX = imageSize.width - crop.width;
    const maxY = imageSize.height - crop.height;
    
    setCrop(prev => ({
      ...prev,
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    }));
  }, [isDragging, dragStart, imageSize, crop.width, crop.height]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const getCroppedImage = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image) return null;
    
    const ctx = canvas.getContext('2d');
    
    // Calcular a escala real da imagem
    const scaleX = image.naturalWidth / imageSize.width;
    const scaleY = image.naturalHeight / imageSize.height;
    
    // Definir o tamanho do canvas de saída
    const outputSize = 300;
    canvas.width = outputSize;
    canvas.height = outputSize;
    
    // Desenhar a parte recortada da imagem no canvas
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      outputSize,
      outputSize
    );
    
    return canvas.toDataURL('image/jpeg', 0.8);
  }, [crop, imageSize]);

  const handleSave = () => {
    const croppedImageData = getCroppedImage();
    if (croppedImageData) {
      onSave(croppedImageData);
    }
  };

  if (!imageSrc) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-[#E50F5F]">
            <Crop className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          <div className="relative bg-[#131313] rounded-lg p-4 flex items-center justify-center">
            <div className="relative" style={{ width: imageSize.width, height: imageSize.height }}>
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Imagem para recorte"
                className="max-w-full max-h-full object-contain"
                onLoad={handleImageLoad}
                draggable={false}
              />
              
              {/* Overlay de recorte */}
              <div 
                className="absolute border-2 border-[#E50F5F] bg-[#E50F5F]/10 cursor-move"
                style={{
                  left: crop.x,
                  top: crop.y,
                  width: crop.width,
                  height: crop.height,
                }}
                onMouseDown={handleMouseDown}
              >
                {/* Cantos do recorte */}
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-[#E50F5F] rounded-full"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#E50F5F] rounded-full"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#E50F5F] rounded-full"></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#E50F5F] rounded-full"></div>
              </div>
              
              {/* Sobreposição escura fora do recorte */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Top */}
                <div 
                  className="absolute top-0 left-0 right-0 bg-black/50"
                  style={{ height: crop.y }}
                ></div>
                {/* Bottom */}
                <div 
                  className="absolute left-0 right-0 bg-black/50"
                  style={{ top: crop.y + crop.height, bottom: 0 }}
                ></div>
                {/* Left */}
                <div 
                  className="absolute left-0 bg-black/50"
                  style={{ 
                    top: crop.y, 
                    width: crop.x, 
                    height: crop.height 
                  }}
                ></div>
                {/* Right */}
                <div 
                  className="absolute right-0 bg-black/50"
                  style={{ 
                    top: crop.y, 
                    width: imageSize.width - crop.x - crop.width, 
                    height: crop.height 
                  }}
                ></div>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-[#9CA3AF] mt-4 text-center">
            Arraste a área de seleção para posicionar o recorte da imagem
          </p>
        </div>

        {/* Canvas oculto para gerar a imagem recortada */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className="flex justify-end gap-3 pt-4 border-t border-[#656464]">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#656464] text-[#D9D9D9] bg-[#131313] hover:bg-[#656464]/20"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            Salvar Recorte
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}