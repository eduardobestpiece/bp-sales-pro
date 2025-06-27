import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Product } from '@/api/entities';

export default function ProductModal({ open, onClose, product, companyId }) {
  const [formData, setFormData] = useState({ name: '', price: 0, cost: 0, category: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || 0,
        cost: product.cost || 0,
        category: product.category || '',
      });
    } else {
      setFormData({ name: '', price: 0, cost: 0, category: '' });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'cost' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dataToSave = { ...formData, company_id: companyId };
      if (product) {
        await Product.update(product.id, dataToSave);
      } else {
        if (!companyId) {
            alert("Selecione uma empresa para adicionar o produto.");
            setIsSubmitting(false);
            return;
        }
        await Product.create(dataToSave);
      }
      onClose();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
        <DialogHeader>
          <DialogTitle className="text-[#E50F5F]">{product ? 'Editar Produto' : 'Adicionar Produto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Nome do Produto</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} className="bg-[#131313] border-[#656464] mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Preço (R$)</Label>
              <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} className="bg-[#131313] border-[#656464] mt-1" />
            </div>
            <div>
              <Label htmlFor="cost">Custo (R$)</Label>
              <Input id="cost" name="cost" type="number" step="0.01" value={formData.cost} onChange={handleChange} className="bg-[#131313] border-[#656464] mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Input id="category" name="category" value={formData.category} onChange={handleChange} className="bg-[#131313] border-[#656464] mt-1" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="bg-transparent border-[#656464] hover:bg-[#656464]/20">Cancelar</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#E50F5F] hover:bg-[#E50F5F]/80">
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}