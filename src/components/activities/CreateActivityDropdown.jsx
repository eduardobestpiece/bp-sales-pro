import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Activity, FileText, BookOpen } from "lucide-react";

import CreateActivityModal from "./CreateActivityModal";
import CreatePlaybookModal from "./CreatePlaybookModal";
import ActivityModal from "./ActivityModal";

export default function CreateActivityDropdown({ children }) {
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPlaybookModal, setShowPlaybookModal] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {children}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
          <DropdownMenuItem 
            onClick={() => setShowActivityModal(true)}
            className="text-[#D9D9D9] hover:bg-[#656464]/20 cursor-pointer"
          >
            <Activity className="w-4 h-4 mr-2" />
            Atividade
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowTemplateModal(true)}
            className="text-[#D9D9D9] hover:bg-[#656464]/20 cursor-pointer"
          >
            <FileText className="w-4 h-4 mr-2" />
            Modelo
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowPlaybookModal(true)}
            className="text-[#D9D9D9] hover:bg-[#656464]/20 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Playbook
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modais */}
      <ActivityModal
        activity={null}
        open={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        onSave={() => {
          setShowActivityModal(false);
          // Callback para atualizar lista se necessário
        }}
        workflows={[]}
        users={[]}
      />

      <ActivityModal
        activity={null}
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSave={() => {
          setShowTemplateModal(false);
        }}
        isTemplate={true}
        workflows={[]}
        users={[]}
      />

      <CreatePlaybookModal
        open={showPlaybookModal}
        onClose={() => setShowPlaybookModal(false)}
        onSuccess={() => {
          setShowPlaybookModal(false);
        }}
      />
    </>
  );
}