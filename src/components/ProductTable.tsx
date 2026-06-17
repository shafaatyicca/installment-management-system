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
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      try {
        const response = await fetch(`/api/products?id=${id}`, {
          method: "DELETE",
        });
        const data = await response.json();

        if (data.success) {
          toast.success("Pruduct successfully deleted.");
          if (onSuccess) onSuccess(); 
        } else {
          toast.error(data.message || "Delete failed, please try again.");
        }
      } catch (error) {
        toast.error("Network issue, try again later.");
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
      <div className="w-full bg-slate-800/30 border border-slate-800 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center gap-3">
        <div className="w-7 h-7 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs md:text-sm text-slate-400">Products stock load ho raha hai...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 w-full">
      {/* 🔍 Responsive Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Product ya Brand search karein..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-500"
        />
      </div>

      {/* 📱 1. MOBILE RESPONSIVE CARDS VIEW (md:hidden - Mobile screen par table ki jagah cards dikhenge) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 bg-slate-800/20 rounded-xl border border-slate-800">
            Stock mein koi product nahi mila.
          </div>
        ) : (
          filteredProducts.map((product, index) => (
            <div key={product._id} className="bg-slate-800/50 border border-slate-800/80 p-4 rounded-xl space-y-3 shadow-md relative overflow-hidden">
              
              {/* Card Header: Product Name & Stock Status Badge */}
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded font-mono mr-1.5">#{index + 1}</span>
                  <h3 className="text-sm font-bold text-slate-100 inline tracking-tight">{product.name}</h3>
                  {product.modelNumber && (
                    <p className="text-[11px] text-slate-500 mt-0.5 pl-7">Model: {product.modelNumber}</p>
                  )}
                </div>
                
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium shrink-0 ${
                  product.stock > 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" : "bg-red-500/10 text-red-400 border border-red-500/10"
                }`}>
                  {product.stock > 0 ? `${product.stock} Qty` : "Out of Stock"}
                </span>
              </div>

              {/* Brand Indicator */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pl-7">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                <span>Brand: <strong className="text-slate-300">{product.brand || "—"}</strong></span>
              </div>

              {/* Price Breakdown Details Box */}
              <div className="grid grid-cols-2 gap-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60 text-[11px]">
                <div>
                  <p className="text-slate-500 text-[10px] font-medium uppercase">Unit Cost</p>
                  <p className="font-semibold text-slate-300 mt-0.5">Rs. {product.costPrice.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-500 text-[10px] font-medium uppercase">Total Value</p>
                  <p className="font-bold text-emerald-400 mt-0.5">
                    Rs. {(product.totalCost || (product.costPrice * product.stock)).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Actions Area: Edit & Delete for Mobile Touch */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-700/40">
                <button 
                  onClick={() => onEditClick(product)}
                  className="text-[11px] font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/10 transition flex items-center gap-1"
                >
                  <Edit className="w-3 h-3" /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(product._id)}
                  className="text-[11px] font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/10 transition flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* 🖥️ 2. DESKTOP VIEW TABLE (hidden md:block - Desktop par khud-ba-khud table show ho jaye) */}
      <div className="hidden md:block w-full bg-slate-800/40 border border-slate-800 backdrop-blur-md rounded-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/60 bg-slate-800/60 text-slate-400 text-xs uppercase">
                <th className="p-2">S#</th>
                <th className="p-2">Product Details</th>
                <th className="p-2">Brand / Model</th>
                <th className="p-2">Unit Cost</th>
                <th className="p-2">Stock Status</th>
                <th className="p-2">Total</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-200">
              {filteredProducts.map((product, index) => (
                <tr key={product._id} className="hover:bg-slate-700/20 transition duration-150">
                  <td className="p-2 font-medium text-slate-400">{index + 1}</td>
                  <td className="p-2 text-slate-100 text-xs">{product.name}</td>
                  <td className="p-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Tag className="w-3.5 h-3.5 text-indigo-400" /> {product.brand || "—"}
                    </div>
                    {product.modelNumber && (
                      <div className="text-xs text-slate-500 pl-5">Model: {product.modelNumber}</div>
                    )}
                  </td>
                  <td className="p-2 text-xs text-slate-300">Rs. {product.costPrice.toLocaleString()}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      <span className={`px-2 py-0.5 rounded-md text-xs ${
                        product.stock > 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {product.stock > 0 ? `${product.stock} Items` : "Out of Stock"}
                      </span>
                    </div>
                  </td>
                  <td className="p-2 text-xs text-emerald-400">
                    Rs. {(product.totalCost || (product.costPrice * product.stock)).toLocaleString()}
                  </td>
                  <td className="p-2 text-right space-x-2">
                    <button 
                      onClick={() => onEditClick(product)}
                      className="text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1.5 rounded-lg border border-amber-500/20 transition inline-flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => handleDelete(product._id)}
                      className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1.5 rounded-lg border border-red-500/20 transition inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}