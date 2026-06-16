"use client";

import { useState } from "react";
import { Search, Layers, Tag, Trash2, Edit } from "lucide-react";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
  costPrice: number;
  stock: number;
  totalCost: number;
  brand?: string;
  modelNumber?: string;
}

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  onEditClick: (product: Product) => void;
  onSuccess?: () => void;
}

export default function ProductTable({ products, loading, onEditClick, onSuccess }: ProductTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async (id: string) => {
    if (confirm("Kya aap waqai is product ko stock se hamesha ke liye delete karna chahte hain?")) {
      try {
        const response = await fetch(`/api/products?id=${id}`, {
          method: "DELETE",
        });
        const data = await response.json();

        if (data.success) {
          toast.success("Product successfully delete ho gaya! 🗑️");
          if (onSuccess) onSuccess(); // Auto refresh table state
        } else {
          toast.error(data.message || "Delete nahi ho saka");
        }
      } catch (error) {
        toast.error("Network issue, dubara koshish karein.");
      }
    }
  };

  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(search) ||
      (product.brand && product.brand.toLowerCase().includes(search))
    );
  });

  if (loading) {
    return (
      <div className="w-full bg-slate-800/30 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400">Products stock load ho raha hai...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
        <input
          type="text"
          placeholder="Product ka Naam ya Brand search karein..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-500"
        />
      </div>

      <div className="w-full bg-slate-800/40 border border-slate-800 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/60 bg-slate-800/60 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <th className="py-4 px-6 w-16">S#</th>
                <th className="py-4 px-6">Product Details</th>
                <th className="py-4 px-6">Brand / Model</th>
                <th className="py-4 px-6">Unit Cost</th>
                <th className="py-4 px-6">Stock Status</th>
                <th className="py-4 px-6">Total Cost</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Stock mein koi product nahi mila.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => (
                  <tr key={product._id} className="hover:bg-slate-700/20 transition duration-150">
                    <td className="py-4 px-6 font-medium text-slate-100">
                      {index + 1}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-100">
                      {product.name}
                    </td>
                    <td className="py-4 px-6 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Tag className="w-3.5 h-3.5 text-indigo-400" /> {product.brand || "—"}
                      </div>
                      {product.modelNumber && (
                        <div className="text-xs text-slate-500 pl-5">
                          Model: {product.modelNumber}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-300">
                      Rs. {product.costPrice.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-500" />
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                          product.stock > 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {product.stock > 0 ? `${product.stock} Items` : "Out of Stock"}
                        </span>
                      </div>
                    </td>
                    {/* Auto Calculated Total Cost Field */}
                    <td className="py-4 px-6 font-semibold text-emerald-400">
                      Rs. {(product.totalCost || (product.costPrice * product.stock)).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button 
                        onClick={() => onEditClick(product)}
                        className="text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1.5 rounded-lg border border-amber-500/20 transition inline-flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(product._id)}
                        className="text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1.5 rounded-lg border border-red-500/20 transition inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}