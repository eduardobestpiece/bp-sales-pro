import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, Square } from "lucide-react";

export default function ActivityDetailsModal({ activity, open, onClose }) {
  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#E50F5F]">{activity.title}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {activity.description && (
            <div>
              <h3 className="font-semibold text-[#D9D9D9] mb-1">Descrição</h3>
              <p className="text-[#9CA3AF]">{activity.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-[#D9D9D9] mb-1">Status</h3>
              <Badge variant="secondary" className="capitalize">{activity.status}</Badge>
            </div>
            <div>
              <h3 className="font-semibold text-[#D9D9D9] mb-1">Prioridade</h3>
              <Badge variant="secondary" className="capitalize">{activity.priority}</Badge>
            </div>
            <div>
              <h3 className="font-semibold text-[#D9D9D9] mb-1">Prazo</h3>
              <p className="text-[#9CA3AF]">
                {activity.due_date ? new Date(activity.due_date).toLocaleString('pt-BR') : 'Não definido'}
              </p>
            </div>
          </div>
          {activity.checklist && activity.checklist.length > 0 && (
            <div>
              <h3 className="font-semibold text-[#D9D9D9] mb-2">Checklist</h3>
              <div className="space-y-2">
                {activity.checklist.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {item.completed ? <Check className="w-4 h-4 text-green-500" /> : <Square className="w-4 h-4 text-[#9CA3AF]" />}
                    <span className={`${item.completed ? 'line-through text-[#9CA3AF]' : 'text-[#D9D9D9]'}`}>
                      {item.item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}