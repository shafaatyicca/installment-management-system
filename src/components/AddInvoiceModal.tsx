"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FilePlus, X, Calculator, User, Box } from "lucide-react";

interface AddInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddInvoiceModal({ isOpen, onClose, onSuccess }: AddInvoiceModalProps) {
  const [loading, setLoading] = useState(false);
  
  // Data Lists for Dropdowns
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // Form States
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [durationMonths, setDurationMonths] = useState("");

  // Auto Calculation States (Live View Only)
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [monthlyInstallment, setMonthlyInstallment] = useState(0);

  // Load Customers & Products for Selection Dropdowns
  useEffect(() => {
    if (isOpen) {
      // Fetch Customers
      fetch("/api/customers")
        .then((res) => res.json())
        .then((resData) => { if (resData.success) setCustomers(resData.data); });

      // Fetch Products
      fetch("/api/products")
        .then((res) => res.json())
        .then((resData) => { if (resData.success) setProducts(resData.data); });
    }
  }, [isOpen]);

  // 🔥 LIVE AUTO CALCULATION LOGIC
  useEffect(() => {
    const sPrice = Number(salePrice || 0);
    const dPayment = Number(downPayment || 0);
    const months = Number(durationMonths || 0);

    const remaining = sPrice - dPayment;
    setRemainingAmount(remaining >= 0 ? remaining : 0);

    if (remaining > 0 && months > 0) {
      setMonthlyInstallment(Math.round(remaining / months));
    } else {
      setMonthlyInstallment(0);
    }
  }, [salePrice, downPayment, durationMonths]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !productId || !salePrice || !durationMonths) {
      toast.error("Sari fields bharna lazmi hain!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          productId,
          salePrice,
          downPayment,
          durationMonths,
        }),
      });

      const resData = await response.json();

      if (resData.success) {
        toast.success("Invoice successfully generate ho gayi! 📄");
        // Reset Form
        setCustomerId("");
        setProductId("");
        setSalePrice("");
        setDownPayment("");
        setDurationMonths("");
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(resData.message || "Invoice banane mein masla hua");
      }
    } catch (error) {
      toast.error("Network problem, dubara koshish karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-md shadow-2xl overflow-y-auto max-h-[90vh] z-10 text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-2 border-b border-slate-700/60">
          <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-400">
            <FilePlus className="w-5 h-5" /> New Installment Bill (Invoice)
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Area */}
        <form onSubmit={handleSubmit} className="p-2 space-y-2">
          
          {/* Dropdowns Group */}
          <div className="space-y-4">
            {/* 1. Customer Select */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-indigo-400" /> Select Customer*
              </label>
              <select 
                value={customerId} 
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition text-sm"
              >
                <option value="">Select Customer</option>
                {customers.map((c: any) => (
                  <option key={c._id} value={c._id}>{c.name} ({c.phone || c.mobile})</option>
                ))}
              </select>
            </div>

            {/* 2. Product Select */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                <Box className="w-3.5 h-3.5 text-indigo-400" /> Select Product*
              </label>
              <select 
                value={productId} 
                onChange={(e) => setProductId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition text-sm"
              >
                <option value="">Select Product</option>
                {products.map((p: any) => (
                  <option key={p._id} value={p._id} disabled={p.stock < 1}>
                    {p.name} {p.brand ? `[${p.brand}]` : ""} — Stock: {p.stock} items (Cost: Rs. {p.costPrice})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 📊 Financial Inputs Row - Ab yeh poori width cover karega layout kharab kiye bagair */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            
            {/* 1. Sale Price */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Sale Price *</label>
              <input 
                type="number" 
                value={salePrice} 
                onChange={(e) => setSalePrice(e.target.value)} 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition text-sm" 
              />
            </div>

            {/* 2. Down Payment (Advance) */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Down Payment (Advance) *</label>
              <input 
                type="number" 
                value={downPayment} 
                onChange={(e) => setDownPayment(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition text-sm" 
              />
            </div>

            {/* 3. Duration Months */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Duration (Months) *</label>
              <input 
                type="number" 
                value={durationMonths} 
                onChange={(e) => setDurationMonths(e.target.value)}
                placeholder="e.g., 10, 12" 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 transition text-sm" 
              />
            </div>

          </div>

          {/* 🔥 LIVE AUTO CALCULATION PANEL BOX */}
          <div className="bg-slate-900/60 border border-indigo-500/20 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5" /> Live Auto Calculations
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs">Remaining Amount</p>
                <p className="text-lg font-bold text-amber-400">Rs. {remainingAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Monthly Installment:</p>
                <p className="text-lg font-bold text-emerald-400">Rs. {monthlyInstallment.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Actions Footer Buttons */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-700/60">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition text-sm font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/20 transition disabled:opacity-50 text-sm">
              {loading ? "Generating..." : "Generate Invoice & Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}