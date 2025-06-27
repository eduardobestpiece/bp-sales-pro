import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Search, Filter, Calendar, Trash2 } from 'lucide-react';
import { FormResponse } from '@/api/entities';
import { User } from '@/api/entities';
import { Checkbox } from "@/components/ui/checkbox";

export default function FormResponsesModal({ form, open, onClose }) {
  const [responses, setResponses] = useState([]);
  const [filteredResponses, setFilteredResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponses, setSelectedResponses] = useState([]);
  const [userTimezone, setUserTimezone] = useState('UTC');

  useEffect(() => {
    if (open) {
      const fetchUserTimezone = async () => {
        try {
          const user = await User.me();
          setUserTimezone(user.timezone || 'UTC');
        } catch (e) {
          console.error("Could not fetch user timezone, defaulting to UTC.", e);
        }
      };
      fetchUserTimezone();
    }

    if (open && form) {
      loadResponses();
    }
  }, [open, form]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = responses.filter(response => 
        Object.values(response.responses || {}).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredResponses(filtered);
    } else {
      setFilteredResponses(responses);
    }
    // Clear selections when filter changes
    setSelectedResponses([]);
  }, [searchTerm, responses]);

  const loadResponses = async () => {
    setIsLoading(true);
    try {
      const responsesData = await FormResponse.filter({ form_id: form.id });
      setResponses(responsesData);
      setFilteredResponses(responsesData);
      setSelectedResponses([]); // Clear selections on load
    } catch (error) {
      console.error('Erro ao carregar respostas:', error);
    }
    setIsLoading(false);
  };

  const formatResponseDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'medium',
        timeZone: userTimezone,
      }).format(new Date(dateString));
    } catch (e) {
      // Fallback in case of timezone error or invalid date format
      console.error("Error formatting date with timezone, falling back to local string:", e);
      return new Date(dateString).toLocaleString('pt-BR');
    }
  };

  const downloadCSV = () => {
    if (filteredResponses.length === 0) {
      alert('Não há respostas para exportar.');
      return;
    }

    // Coletar todos os campos únicos
    const allFields = new Set();
    filteredResponses.forEach(response => {
      Object.keys(response.responses || {}).forEach(field => allFields.add(field));
    });
    
    const fields = Array.from(allFields);
    
    // Criar cabeçalho CSV
    const headers = ['Data de Envio', 'IP', ...fields, 'UTM Source', 'UTM Medium', 'UTM Campaign'];
    
    // Criar linhas de dados
    const csvData = filteredResponses.map(response => {
      const row = [
        formatResponseDate(response.created_date), // Use new formatResponseDate for CSV
        response.ip_address || '',
        ...fields.map(field => {
          const value = response.responses[field];
          // Handle array values by joining them
          if (Array.isArray(value)) {
            return value.join(', ');
          }
          return value || '';
        }),
        response.tracking_data?.utm_source || '',
        response.tracking_data?.utm_medium || '',
        response.tracking_data?.utm_campaign || ''
      ];
      return row;
    });
    
    // Combinar cabeçalho e dados
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => {
        // Ensure values are strings and properly escaped
        const stringField = String(field);
        return `"${stringField.replace(/"/g, '""')}"`;
      }).join(','))
      .join('\n');
    
    // Criar e baixar arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `respostas_${form.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the object URL
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedResponses(filteredResponses.map(r => r.id));
    } else {
      setSelectedResponses([]);
    }
  };
  
  const handleSelectRow = (responseId, checked) => {
    if (checked) {
      setSelectedResponses(prev => [...prev, responseId]);
    } else {
      setSelectedResponses(prev => prev.filter(id => id !== responseId));
    }
  };
  
  const handleDeleteSelected = async () => {
    if (selectedResponses.length === 0) return;
    if (window.confirm(`Tem certeza que deseja excluir ${selectedResponses.length} resposta(s) selecionada(s)? Esta ação não pode ser desfeita.`)) {
      try {
        // A SDK de entidade não suporta bulk delete, então deletamos um por um.
        // Consider adding a loading state here for bulk delete
        for (const responseId of selectedResponses) {
          await FormResponse.delete(responseId);
        }
        setSelectedResponses([]);
        await loadResponses(); // Reload to reflect changes
        // TODO: Futuramente, adicionar uma notificação de sucesso (e.g., toast)
      } catch (error) {
        console.error("Erro ao excluir respostas:", error);
        // TODO: Futuramente, adicionar uma notificação de erro
        alert("Erro ao excluir respostas. Por favor, tente novamente.");
      }
    }
  };

  // Obter lista de campos únicos para as colunas da tabela
  // Ensure uniqueFields is derived from 'responses' for consistent headers, not 'filteredResponses'
  const uniqueFields = [...new Set(responses.flatMap(r => Object.keys(r.responses || {})))];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] max-w-6xl w-[95vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#E50F5F]">
            Respostas do Formulário: {form?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0">
          {/* Filtros e Ações */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
                <Input
                  placeholder="Buscar nas respostas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#131313] border-[#656464] text-[#D9D9D9]"
                />
              </div>
              <Button
                variant="outline"
                className="border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20 hover:text-[#D9D9D9] hover:border-[#E50F5F]/80 bg-[#131313]"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
            <Button
              onClick={downloadCSV}
              className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
              disabled={filteredResponses.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar CSV
            </Button>
          </div>

          {/* Ações em Massa */}
          {selectedResponses.length > 0 && (
            <div className="flex items-center justify-between p-3 mb-4 bg-[#131313] border border-[#E50F5F]/50 rounded-lg">
                <span className="text-sm text-white">{selectedResponses.length} resposta(s) selecionada(s)</span>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteSelected}
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Selecionadas
                </Button>
            </div>
          )}

          {/* Contador */}
          <div className="text-sm text-[#9CA3AF] mb-4">
            {filteredResponses.length} respostas encontradas
          </div>

          {/* Tabela de Respostas */}
          <div className="flex-1 overflow-auto border border-[#656464] rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center h-32 text-[#9CA3AF]">
                Carregando respostas...
              </div>
            ) : filteredResponses.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-[#9CA3AF]">
                {searchTerm ? 'Nenhuma resposta encontrada para esta busca.' : 'Nenhuma resposta ainda.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-[#656464]">
                    <TableHead className="w-[50px] text-[#D9D9D9]">
                      <Checkbox
                        checked={selectedResponses.length > 0 && selectedResponses.length === filteredResponses.length}
                        onCheckedChange={handleSelectAll}
                        aria-label="Selecionar todas as linhas"
                        className="data-[state=checked]:bg-[#E50F5F] data-[state=checked]:text-white border-[#656464]"
                      />
                    </TableHead>
                    <TableHead className="text-[#D9D9D9]">Data</TableHead>
                    {uniqueFields.map(field => (
                      <TableHead key={field} className="text-[#D9D9D9]">
                        {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </TableHead>
                    ))}
                    <TableHead className="text-[#D9D9D9]">Origem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResponses.map((response, index) => (
                    <TableRow key={response.id || index} className="border-[#656464]">
                      <TableCell>
                        <Checkbox
                          checked={selectedResponses.includes(response.id)}
                          onCheckedChange={(checked) => handleSelectRow(response.id, checked)}
                          aria-label={`Selecionar linha ${index + 1}`}
                          className="data-[state=checked]:bg-[#E50F5F] data-[state=checked]:text-white border-[#656464]"
                        />
                      </TableCell>
                      <TableCell className="text-[#D9D9D9]">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <div>
                            <div>{formatResponseDate(response.created_date).split(' ')[0]}</div>
                            <div className="text-xs text-[#9CA3AF]">
                              {formatResponseDate(response.created_date).split(' ').slice(1).join(' ')}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      {uniqueFields.map(field => (
                        <TableCell key={field} className="text-[#D9D9D9] max-w-xs">
                          <div className="truncate" title={String(response.responses?.[field] || '')}>
                            {Array.isArray(response.responses?.[field]) 
                              ? response.responses[field].join(', ') 
                              : String(response.responses?.[field] || '-')}
                          </div>
                        </TableCell>
                      ))}
                      <TableCell className="text-[#D9D9D9]">
                        <div className="text-xs">
                          {response.tracking_data?.utm_source && (
                            <div>Source: {response.tracking_data.utm_source}</div>
                          )}
                          {response.tracking_data?.utm_medium && (
                            <div>Medium: {response.tracking_data.utm_medium}</div>
                          )}
                          {!response.tracking_data?.utm_source && !response.tracking_data?.utm_medium && (
                            <span className="text-[#9CA3AF]">Direto</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}