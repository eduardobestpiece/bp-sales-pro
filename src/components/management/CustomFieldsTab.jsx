import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Puzzle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomField } from "@/api/entities";

export default function CustomFieldsTab() {
  const [fields, setFields] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
      name: '',
      label: '',
      type: 'text',
      applies_to: []
  });

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    setIsLoading(true);
    try {
      const data = await CustomField.list();
      setFields(data);
    } catch (error) {
      console.error("Erro ao carregar campos:", error);
    }
    setIsLoading(false);
  };
  
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
        await CustomField.create(formData);
        setShowForm(false);
        setFormData({ name: '', label: '', type: 'text', applies_to: [] });
        loadFields();
    } catch(error) {
        console.error("Erro ao criar campo", error);
    }
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-end">
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {showForm ? 'Cancelar' : 'Adicionar Campo'}
            </Button>
        </div>

      {showForm && (
        <Card className="bg-[#1C1C1C] border-[#656464]">
            <CardHeader><CardTitle className="text-[#D9D9D9]">Novo Campo Personalizado</CardTitle></CardHeader>
            <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="label" className="text-[#9CA3AF]">Rótulo do Campo</Label>
                            <Input id="label" placeholder="Ex: CPF do Cliente" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} className="bg-[#131313] border-[#656464] text-[#D9D9D9]"/>
                        </div>
                        <div>
                            <Label htmlFor="name" className="text-[#9CA3AF]">Nome do Campo (identificador)</Label>
                            <Input id="name" placeholder="Ex: cpf_cliente (sem espaços/acentos)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-[#131313] border-[#656464] text-[#D9D9D9]"/>
                        </div>
                    </div>
                     <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-[#9CA3AF]">Tipo de Campo</Label>
                            <Select value={formData.type} onValueChange={value => setFormData({...formData, type: value})}>
                                <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]"><SelectValue/></SelectTrigger>
                                <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                                    <SelectItem value="text">Texto</SelectItem>
                                    <SelectItem value="number">Número</SelectItem>
                                    <SelectItem value="date">Data</SelectItem>
                                    <SelectItem value="textarea">Área de Texto</SelectItem>
                                    <SelectItem value="select">Seleção</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                             <Label className="text-[#9CA3AF]">Aplicar a</Label>
                            <Select onValueChange={value => setFormData({...formData, applies_to: [value]})}>
                                <SelectTrigger className="bg-[#131313] border-[#656464] text-[#D9D9D9]"><SelectValue placeholder="Selecione onde aplicar"/></SelectTrigger>
                                <SelectContent className="bg-[#1C1C1C] border-[#656464]">
                                    <SelectItem value="lead">Lead</SelectItem>
                                    <SelectItem value="deal">Negócio</SelectItem>
                                    <SelectItem value="contact">Contato</SelectItem>
                                    <SelectItem value="company">Empresa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit" className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white">Salvar Campo</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
      )}

      <Card className="bg-[#1C1C1C] border-[#656464]">
        <CardHeader>
          <CardTitle className="text-[#D9D9D9]">Campos Personalizados ({fields.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-[#9CA3AF]">Carregando campos...</div>
          ) : fields.length === 0 ? (
            <div className="text-center py-8 text-[#9CA3AF]">Nenhum campo personalizado criado.</div>
          ) : (
            <div className="space-y-2">
              {fields.map(field => (
                <div key={field.id} className="flex justify-between items-center p-3 bg-[#131313] rounded-md">
                    <div>
                        <p className="font-semibold text-[#D9D9D9]">{field.label}</p>
                        <div className="flex items-center gap-2">
                             <Badge variant="outline" className="border-[#656464] text-[#9CA3AF]">{field.type}</Badge>
                             <Badge variant="secondary" className="bg-[#E50F5F]/20 text-[#E50F5F]">{field.applies_to.join(', ')}</Badge>
                        </div>
                    </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-[#9CA3AF] hover:text-[#E50F5F]"><Edit className="w-4 h-4"/></Button>
                    <Button variant="ghost" size="icon" className="text-[#9CA3AF] hover:text-red-500"><Trash2 className="w-4 h-4"/></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}