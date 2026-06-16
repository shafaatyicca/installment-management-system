"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { PackagePlus, X, Edit3 } from "lucide-react";
import { productSchema, ProductFormValues } from "@/utils/schemas";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  productData?: any;
}

export default function AddProductModal({ isOpen, onClose, onSuccess, productData }: AddProductModalProps) {
    
  const [loading, setLoading] = useState(false);
  const isEditMode = !!productData;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
  });

  useEffect(() => {
    if (productData && isOpen) {
      setValue("name", productData.name);
      setValue("costPrice", productData.costPrice);
      setValue("stock", productData.stock);
      setValue("brand", productData.brand || "");
      setValue("modelNumber", productData.modelNumber || "");
    } else if (!isOpen) {
      reset();
    }
  }, [productData, isOpen, setValue, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    try {
      const url = isEditMode ? `/api/products?id=${productData._id}` : "/api/products";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (resData.success) {
        toast.success(isEditMode ? "Product successfully update ho gaya! 📝" : "Product stock mein add ho gaya! 📦");
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(resData.message || "Kuch galat hua!");
      }
    } catch (error) {
      toast.error("Network issue, dubara koshish karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] z-10 text-slate-100">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
            {isEditMode ? <Edit3 className="w-5 h-5" /> : <PackagePlus className="w-5 h-5" />} 
            {isEditMode ? "Product Details Edit Karein" : "Naya Product Stock mein Add Karein"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Product Ka Naam *</label>
              <input { ...register("name") } placeholder="e.g., Haier Refrigerator 12 cu ft" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition text-sm" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Cost Price */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Khareed Qeemat (Cost Price) *</label>
              <input type="number" { ...register("costPrice") } placeholder="Rs. Jo aap ne invest ki" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition text-sm" />
              {errors.costPrice && <p className="text-red-400 text-xs mt-1">{errors.costPrice.message}</p>}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Stock Quantity *</label>
              <input type="number" { ...register("stock") } placeholder="0" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition text-sm" />
              {errors.stock && <p className="text-red-400 text-xs mt-1">{errors.stock.message}</p>}
            </div>

            {/* Brand (Optional) */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Brand <span className="text-slate-500 font-normal">(Optional)</span></label>
              <input { ...register("brand") } placeholder="e.g., Haier, Dawlance" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition text-sm" />
            </div>

            {/* Model Number (Optional) */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Model / Serial Number <span className="text-slate-500 font-normal">(Optional)</span></label>
              <input { ...register("modelNumber") } placeholder="e.g., HRF-336" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition text-sm" />
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition text-sm font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/20 transition disabled:opacity-50 text-sm">
              {loading ? "Saving..." : isEditMode ? "Update Stock" : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}