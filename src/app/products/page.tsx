"use client";

import { useState, useEffect } from "react";
import { PackagePlus, Boxes } from "lucide-react";
import { Toaster } from "react-hot-toast";
import AddProductModal from "@/components/AddProductModal";
import ProductTable from "@/components/ProductTable";

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/products");
      const resData = await response.json();
      if (resData.success) {
        setProducts(resData.data);
      }
    } catch (error) {
      console.error("Products load nahi ho sakay", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditOpen = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-2">
      <Toaster position="top-center" />

      <div className="max-w-6xl mx-auto space-y-2">
        
        {/* Top bar with Heading and Trigger Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/90 p-2 rounded-md border border-slate-800 md:bg-slate-800/40 md:backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Product Stock Directory</h1>
            </div>
          </div>

          <button 
            onClick={() => { setSelectedProduct(null); setIsModalOpen(true); }} 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition text-sm w-full sm:w-auto justify-center"
          >
            <PackagePlus className="w-4 h-4" /> Add Product
          </button>
        </div>

        {/* Live Search Product Table */}
        <ProductTable products={products} loading={loading} onEditClick={handleEditOpen} onSuccess={fetchProducts} />

      </div>

      {/* Shared Add/Edit Modal */}
      <AddProductModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        onSuccess={fetchProducts}
        productData={selectedProduct}
      />
    </div>
  );
}