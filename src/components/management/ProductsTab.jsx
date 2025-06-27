import React, { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Product } from "@/api/entities";
import { CompanyContext } from "@/components/contexts/CompanyContext";

import ProductModal from './ProductModal'; // Assume creation

export default function ProductsTab() {
  const { selectedCompanyId } = useContext(CompanyContext);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProductsByCompany();
  }, [selectedCompanyId, allProducts]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const productsData = await Product.list("-created_date");
      setAllProducts(productsData);
      filterProductsByCompany(productsData);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
    setIsLoading(false);
  };
  
  const filterProductsByCompany = (productsList = allProducts) => {
    let filtered = productsList;
    if(selectedCompanyId !== 'all'){
      filtered = productsList.filter(p => p.company_id === selectedCompanyId);
    }
    setProducts(filtered);
  };

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    loadProducts();
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await Product.delete(productId);
        loadProducts();
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
      }
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card className="bg-[#1C1C1C] border-[#656464]">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]"
              />
            </div>
            <Button
              onClick={() => handleOpenModal()}
              className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Produto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-[#9CA3AF]">Carregando produtos...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="w-12 h-12 text-[#9CA3AF] mb-4" />
              <h3 className="text-lg font-medium text-[#D9D9D9] mb-2">Nenhum produto encontrado</h3>
              <p className="text-[#9CA3AF] text-center mb-4">
                {searchTerm ? "Tente uma busca diferente." : "Cadastre seu primeiro produto."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-[#131313] rounded-lg">
                  <div>
                    <p className="font-medium text-[#D9D9D9]">{product.name}</p>
                    <p className="text-sm text-[#9CA3AF]">{formatCurrency(product.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1C1C1C] border-[#656464] hover:bg-[#656464]/30" onClick={() => handleOpenModal(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 bg-[#1C1C1C] border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-white" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {isModalOpen && (
        <ProductModal
            open={isModalOpen}
            onClose={handleCloseModal}
            product={editingProduct}
            companyId={selectedCompanyId === 'all' ? null : selectedCompanyId}
        />
      )}
    </>
  );
}