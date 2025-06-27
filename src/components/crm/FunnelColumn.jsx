import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import DealCard from "./DealCard";

const statusColors = {
  lead: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-600" },
  qualified: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-600" },
  proposal: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-600" },
  negotiation: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-600" },
  won: { bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-600" },
  lost: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-600" }
};

const statusLabels = {
  lead: "Lead",
  qualified: "Qualificado",
  proposal: "Proposta",
  negotiation: "Negociação",
  won: "Ganho",
  lost: "Perdido"
};

export default function FunnelColumn({ 
  status, 
  deals, 
  onDealClick, 
  onAddDeal, 
  onDealUpdate,
  totalValue 
}) {
  const colors = statusColors[status] || statusColors.lead;
  const label = statusLabels[status] || status;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[600px] w-80 flex-shrink-0"
    >
      <Card className={`h-full ${colors.bg} ${colors.border} border-2`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={`text-lg ${colors.text}`}>
                {label}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`${colors.text} border-current`}>
                  {deals.length} deals
                </Badge>
                {totalValue > 0 && (
                  <Badge variant="outline" className={`${colors.text} border-current`}>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(totalValue)}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onAddDeal(status)}
              className={`${colors.text} hover:bg-current/10`}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onClick={() => onDealClick(deal)}
              onUpdate={onDealUpdate}
            />
          ))}
          
          {deals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Nenhum deal neste estágio</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddDeal(status)}
                className="mt-2 border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Deal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}