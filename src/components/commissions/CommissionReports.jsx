import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function CommissionReports({ commissions = [], users = [], rules = [] }) {
  const usersMap = new Map(users.map(u => [u.id, u.full_name]));
  const rulesMap = new Map(rules.map(r => [r.id, r.name]));

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-blue-100 text-blue-800 border-blue-200",
      paid: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      <Badge variant="outline" className={colors[status] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };
  
  return (
    <Card className="bg-[#1C1C1C] border-[#656464]">
      <CardHeader>
        <CardTitle className="text-[#D9D9D9]">Relatório de Comissões</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-b-[#656464]">
              <TableHead className="text-[#9CA3AF]">Usuário</TableHead>
              <TableHead className="text-[#9CA3AF]">Valor</TableHead>
              <TableHead className="text-[#9CA3AF]">Regra Aplicada</TableHead>
              <TableHead className="text-[#9CA3AF]">Tipo</TableHead>
              <TableHead className="text-[#9CA3AF]">Status</TableHead>
              <TableHead className="text-[#9CA3AF] text-right">Data Pagamento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commissions.length > 0 ? commissions.map(commission => (
              <TableRow key={commission.id} className="border-b-[#656464]">
                <TableCell className="text-[#D9D9D9] font-medium">{usersMap.get(commission.user_id) || 'N/A'}</TableCell>
                <TableCell className="text-green-400 font-semibold">{formatCurrency(commission.amount)}</TableCell>
                <TableCell className="text-[#D9D9D9]">{rulesMap.get(commission.rule_id) || 'N/A'}</TableCell>
                <TableCell className="text-[#D9D9D9] capitalize">{commission.type}</TableCell>
                <TableCell>{getStatusBadge(commission.status)}</TableCell>
                <TableCell className="text-[#D9D9D9] text-right">{formatDate(commission.payment_date)}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-[#9CA3AF] py-8">
                  Nenhuma comissão encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}