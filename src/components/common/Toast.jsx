import React, { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const toastTypes = {
  success: {
    icon: CheckCircle,
    className: "bg-green-600 border-green-500 text-white"
  },
  error: {
    icon: AlertCircle, 
    className: "bg-red-600 border-red-500 text-white"
  },
  info: {
    icon: Info,
    className: "bg-blue-600 border-blue-500 text-white"
  },
  warning: {
    icon: AlertCircle,
    className: "bg-yellow-600 border-yellow-500 text-black"
  }
};

export default function Toast({ 
  message, 
  type = "info", 
  duration = 5000, 
  onClose,
  show = true 
}) {
  const [isVisible, setIsVisible] = useState(show);
  
  const toastConfig = toastTypes[type] || toastTypes.info;
  const Icon = toastConfig.icon;

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose && onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ${
      isVisible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-full opacity-0'
    }`}>
      <div className={`p-4 rounded-lg border shadow-lg ${toastConfig.className}`}>
        <div className="flex items-start gap-3">
          <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="flex-1 text-sm font-medium">{message}</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="w-5 h-5 p-0 hover:bg-black/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Hook para usar toast
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "info", duration = 5000) => {
    const id = Date.now();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration + 300);
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
        />
      ))}
    </div>
  );

  return { showToast, ToastContainer };
}