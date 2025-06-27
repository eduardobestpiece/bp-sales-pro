import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, DollarSign, User, MoreVertical, Phone, Mail } from "lucide-react";
import { motion } from "framer-motion";

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800"
};

const priorityLabels = {
  low: "Baixa",
  medium: "Média", 
  high: "Alta"
};

export default function DealCard({ deal, onClick, onUpdate }) {
  const [isHovered, setIsHovered] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleStatusChange = (newStatus) => {
    onUpdate(deal.id, { status: newStatus });
  };

  const handlePriorityChange = (newPriority) => {
    onUpdate(deal.id, { priority: newPriority });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white border border-gray-200 hover:border-gray-300"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header com título e menu */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                  {deal.title || "Deal sem título"}
                </h4>
                {deal.company_name && (
                  <p className="text-xs text-gray-600 mt-1">{deal.company_name}</p>
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleStatusChange('qualified')}>
                    Mover para Qualificado
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('proposal')}>
                    Mover para Proposta
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('negotiation')}>
                    Mover para Negociação
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('won')}>
                    Marcar como Ganho
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('lost')}>
                    Marcar como Perdido
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Valor */}
            {deal.value && (
              <div className="flex items-center gap-1 text-green-600">
                <DollarSign className="w-3 h-3" />
                <span className="text-sm font-medium">{formatCurrency(deal.value)}</span>
              </div>
            )}

            {/* Informações do contato */}
            {(deal.contact_name || deal.contact_email || deal.contact_phone) && (
              <div className="space-y-1">
                {deal.contact_name && (
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600">{deal.contact_name}</span>
                  </div>
                )}
                {deal.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600">{deal.contact_email}</span>
                  </div>
                )}
                {deal.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600">{deal.contact_phone}</span>
                  </div>
                )}
              </div>
            )}

            {/* Data de fechamento esperada */}
            {deal.expected_close_date && (
              <div className="flex items-center gap-1 text-gray-500">
                <Calendar className="w-3 h-3" />
                <span className="text-xs">{formatDate(deal.expected_close_date)}</span>
              </div>
            )}

            {/* Prioridade e responsável */}
            <div className="flex items-center justify-between">
              {deal.priority && (
                <Badge 
                  variant="outline" 
                  className={`text-xs px-2 py-0 ${priorityColors[deal.priority]}`}
                >
                  {priorityLabels[deal.priority]}
                </Badge>
              )}
              
              {deal.assigned_to_name && (
                <div className="flex items-center gap-1">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={deal.assigned_to_avatar} />
                    <AvatarFallback className="text-xs">
                      {getInitials(deal.assigned_to_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600">{deal.assigned_to_name}</span>
                </div>
              )}
            </div>

            {/* Progress bar se houver probabilidade */}
            {deal.probability && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Probabilidade</span>
                  <span className="text-xs font-medium">{deal.probability}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${deal.probability}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}