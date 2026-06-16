"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { UserPlus, ShieldAlert, X, Edit2 } from "lucide-react";
import { customerSchema, CustomerFormValues } from "@/utils/schemas";

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  customerData?: any; // Edit ke waqt data isme aayega
}

export default function AddCustomerModal({ isOpen, onClose, onSuccess, customerData }: AddCustomerModalProps) {
  const [loading, setLoading] = useState(false);
  const isEditMode = !!customerData;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
  });

  // Fields auto-fill karne ke liye jab edit mode ho
  useEffect(() => {
    if (customerData && isOpen) {
      setValue("name", customerData.name);
      setValue("cnic", customerData.cnic);
      setValue("mobile", customerData.mobile);
      setValue("address", customerData.address);
      setValue("guarantorName", customerData.guarantorName || "");
      setValue("guarantorMobile", customerData.guarantorMobile || "");
      setValue("guarantorCnic", customerData.guarantorCnic || "");
    } else if (!isOpen) {
      reset();
    }
  }, [customerData, isOpen, setValue, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: CustomerFormValues) => {
    setLoading(true);
    try {
      // Agar edit mode hai to same route par `?id=` bhejenge
      const url = isEditMode ? `/api/customers?id=${customerData._id}` : "/api/customers";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (resData.success) {
        toast.success(isEditMode ? "Customer data update ho gaya! 📝" : "Customer add ho gaya! 🎉");
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
      <div className="relative w-full max-w-3xl bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] z-10 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
            {isEditMode ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />} 
            {isEditMode ? "Customer Edit Karein" : "Naya Customer Register Karein"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Mukammal Naam *</label>
                <input {...register("name")} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition text-sm" />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">CNIC Number *</label>
                <input {...register("cnic")} disabled={isEditMode} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition text-sm disabled:opacity-50" />
                {errors.cnic && <p className="text-red-400 text-xs mt-1">{errors.cnic.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Mobile Number *</label>
                <input {...register("mobile")} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition text-sm" />
                {errors.mobile && <p className="text-red-400 text-xs mt-1">{errors.mobile.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Mukammal Pata *</label>
                <input {...register("address")} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition text-sm" />
                {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500" /> Guarantor / Zameen <span className="text-xs text-slate-500 lowercase font-normal">(Optional)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Guarantor Naam</label>
                <input {...register("guarantorName")} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Guarantor Mobile</label>
                <input {...register("guarantorMobile")} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Guarantor CNIC</label>
                <input {...register("guarantorCnic")} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition text-sm" placeholder="xxxxx-xxxxxxx-x" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition text-sm font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/20 transition disabled:opacity-50 text-sm">
              {loading ? "Saving..." : isEditMode ? "Update Changes" : "Save Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}