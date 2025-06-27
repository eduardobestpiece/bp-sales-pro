import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronRight, ChevronDown } from 'lucide-react';

function UserNode({ user, users, commissions, level = 0 }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const downlines = useMemo(() => users.filter(u => u.manager_id === user.id), [user.id, users]);
  
  const userCommissions = useMemo(() => 
    commissions.filter(c => c.user_id === user.id), 
    [user.id, commissions]
  );
  const totalCommission = useMemo(() => 
    userCommissions.reduce((sum, c) => sum + (c.amount || 0), 0),
    [userCommissions]
  );
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div>
      <div 
        className="flex items-center p-2 rounded-md hover:bg-[#1C1C1C] transition-colors"
        style={{ paddingLeft: `${level * 24}px` }}
      >
        <div className="flex items-center gap-3 flex-1">
          {downlines.length > 0 && (
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 hover:bg-[#656464]/20 rounded-md">
              {isExpanded ? <ChevronDown className="w-4 h-4 text-[#9CA3AF]" /> : <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />}
            </button>
          )}
          {!downlines.length && <div className="w-6 h-6"></div>}
          
          <Avatar className="w-8 h-8 bg-[#E50F5F]">
            <AvatarFallback className="bg-[#E50F5F] text-white text-xs font-semibold">
              {user.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-[#D9D9D9]">{user.full_name}</p>
            <p className="text-xs text-[#9CA3AF]">{user.role_function || 'Sem função'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-green-400">{formatCurrency(totalCommission)}</p>
          <p className="text-xs text-[#9CA3AF]">{userCommissions.length} comissões</p>
        </div>
      </div>
      {isExpanded && downlines.length > 0 && (
        <div className="border-l-2 border-[#656464] ml-3">
          {downlines.map(downline => (
            <UserNode key={downline.id} user={downline} users={users} commissions={commissions} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommissionHierarchy({ users = [], commissions = [] }) {
  const rootUsers = useMemo(() => users.filter(u => !u.manager_id || !users.some(m => m.id === u.manager_id)), [users]);

  return (
    <Card className="bg-[#1C1C1C] border-[#656464]">
      <CardHeader>
        <CardTitle className="text-[#D9D9D9]">Hierarquia de Comissões</CardTitle>
      </CardHeader>
      <CardContent>
        {rootUsers.length > 0 ? (
          rootUsers.map(user => (
            <UserNode key={user.id} user={user} users={users} commissions={commissions} />
          ))
        ) : (
          <p className="text-center text-[#9CA3AF] py-8">Nenhum usuário raiz encontrado para iniciar a hierarquia.</p>
        )}
      </CardContent>
    </Card>
  );
}