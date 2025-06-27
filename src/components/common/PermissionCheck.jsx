import React, { createContext, useContext, useState, useEffect } from "react";
import { Permission } from "@/api/entities";
import { User } from "@/api/entities";

// Context para permissões
const PermissionContext = createContext();

// Definições de permissões por função
const ROLE_PERMISSIONS = {
  proprietario: {
    drive: { level: "total", permission: "full" },
    activities: { level: "total", permission: "full" },
    playbooks: { level: "total", permission: "full" },
    forms: { level: "total", permission: "full" },
    records: { level: "total", permission: "full" },
    crm: { level: "total", permission: "full" },
    management: { level: "total", permission: "full" },
    commissions: { level: "total", permission: "full" }
  },
  administrador: {
    drive: { level: "total", permission: "full" },
    activities: { level: "total", permission: "full" },
    playbooks: { level: "total", permission: "full" },
    forms: { level: "total", permission: "full" },
    records: { level: "total", permission: "full" },
    crm: { level: "total", permission: "full" },
    management: { level: "total", permission: "edit_create_view" },
    commissions: { level: "total", permission: "full" }
  },
  lider: {
    drive: { level: "departamento", permission: "view" },
    activities: { level: "departamento", permission: "full" },
    playbooks: { level: "departamento", permission: "edit_create_view" },
    forms: { level: "departamento", permission: "view" },
    records: { level: "departamento", permission: "view" },
    crm: { level: "departamento", permission: "view" },
    management: { level: "departamento", permission: "view" },
    commissions: { level: "departamento", permission: "view" }
  },
  comercial: {
    drive: { level: "pessoal", permission: "view" },
    activities: { level: "pessoal", permission: "full" },
    playbooks: { level: "pessoal", permission: "full" },
    forms: { level: "pessoal", permission: "view" },
    records: { level: "pessoal", permission: "view" },
    crm: { level: "pessoal", permission: "full" },
    management: { level: "pessoal", permission: "view" },
    commissions: { level: "pessoal", permission: "view" }
  },
  colaborador: {
    drive: { level: "pessoal", permission: "view" },
    activities: { level: "pessoal", permission: "full" },
    playbooks: { level: "pessoal", permission: "full" },
    forms: { level: "pessoal", permission: "view" },
    records: { level: "pessoal", permission: "view" },
    crm: { level: "pessoal", permission: "full" },
    management: { level: "pessoal", permission: "edit_create_view" },
    commissions: { level: "pessoal", permission: "view" }
  },
  parceiros: {
    drive: { level: "none", permission: "none" },
    activities: { level: "none", permission: "none" },
    playbooks: { level: "none", permission: "none" },
    forms: { level: "pessoal", permission: "view" },
    records: { level: "pessoal", permission: "view" },
    crm: { level: "pessoal", permission: "full" },
    management: { level: "pessoal", permission: "edit_create_view" },
    commissions: { level: "pessoal", permission: "view" }
  },
  cliente: {
    drive: { level: "none", permission: "none" },
    activities: { level: "none", permission: "none" },
    playbooks: { level: "none", permission: "none" },
    forms: { level: "none", permission: "none" },
    records: { level: "none", permission: "none" },
    crm: { level: "pessoal", permission: "full" },
    management: { level: "pessoal", permission: "edit_create_view" },
    commissions: { level: "pessoal", permission: "view" }
  }
};

// Provider de permissões
export function PermissionProvider({ children }) {
  const [userPermissions, setUserPermissions] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserPermissions();
  }, []);

  const loadUserPermissions = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      // Carregar permissões personalizadas
      const customPermissions = await Permission.filter({ user_id: user.id });
      
      // Combinar permissões baseadas na função com personalizadas
      const permissions = { ...ROLE_PERMISSIONS[user.role_function] };
      
      customPermissions.forEach(perm => {
        permissions[perm.resource] = {
          level: perm.level,
          permission: perm.permission_type
        };
      });
      
      setUserPermissions(permissions);
    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
    }
    setIsLoading(false);
  };

  const checkPermission = (resource, action = "view") => {
    if (!currentUser) return false;
    
    // Administradores totais têm acesso completo
    const totalAdmins = ["eduardocosta@bestpiece.com.br", "eduardocostav4@gmail.com"];
    if (totalAdmins.includes(currentUser.email)) return true;
    
    const resourcePermission = userPermissions[resource];
    if (!resourcePermission) return false;
    
    return hasPermissionForAction(resourcePermission.permission, action);
  };

  const hasPermissionForAction = (permissionType, action) => {
    const permissionHierarchy = {
      none: [],
      view: ["view"],
      create_view: ["view", "create"],
      edit_create_view: ["view", "create", "edit"],
      full: ["view", "create", "edit", "delete"]
    };
    
    return permissionHierarchy[permissionType]?.includes(action) || false;
  };

  const getPermissionLevel = (resource) => {
    if (!currentUser) return "none";
    
    const totalAdmins = ["eduardocosta@bestpiece.com.br", "eduardocostav4@gmail.com"];
    if (totalAdmins.includes(currentUser.email)) return "total";
    
    return userPermissions[resource]?.level || "none";
  };

  return (
    <PermissionContext.Provider value={{
      userPermissions,
      currentUser,
      isLoading,
      checkPermission,
      getPermissionLevel,
      ROLE_PERMISSIONS
    }}>
      {children}
    </PermissionContext.Provider>
  );
}

// Hook para usar permissões
export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions deve ser usado dentro de PermissionProvider');
  }
  return context;
}

// Componente para verificar permissões
export function PermissionCheck({ resource, action = "view", children, fallback = null }) {
  const { checkPermission, isLoading } = usePermissions();
  
  if (isLoading) return null;
  
  if (!checkPermission(resource, action)) {
    return fallback;
  }
  
  return children;
}