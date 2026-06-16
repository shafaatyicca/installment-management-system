"use client";

import { useState } from "react";
import { Search, Calendar, User, ShoppingBag, Banknote, DollarSign, Activity } from "lucide-react";

interface InvoiceTableProps {
  invoices: any[];
  loading: boolean;
}

export default function InvoiceTable({ invoices, loading }: InvoiceTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInvoices = invoices.filter((inv) => {
    const search = searchTerm.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(search) ||
      inv.customer?.name.toLowerCase().includes(search) ||
      inv.product?.name.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="w-full bg-slate-800/30 border border-slate-800 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center gap-3">
        <div className="w-7 h-7 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs md:text-sm text-slate-400">Invoices records load ho rahe hain...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* 🔍 Responsive Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="INV#, Customer ya Product search karein..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-500"
        />
      </div>

      {/* 📱 1. MOBILE RESPONSIVE CARDS VIEW (md:hidden - Sirf mobile screens ke liye) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 bg-slate-800/20 rounded-xl border border-slate-800">
            Koi invoice records nahi mile.
          </div>
        ) : (
          filteredInvoices.map((inv, index) => (
            <div key={inv._id} className="bg-slate-800/50 border border-slate-800/80 p-4 rounded-xl space-y-3 shadow-md relative overflow-hidden">
              
              {/* Card Header: Invoice Number, Serial, & Status */}
              <div className="flex justify-between items-center border-b border-slate-700/40 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded font-mono">#{index + 1}</span>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{inv.invoiceNumber}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  inv.status === "Active" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}>
                  {inv.status}
                </span>
              </div>

              {/* Customer & Item Area */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-100">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{inv.customer?.name || "Deleted Customer"}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <ShoppingBag className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{inv.product?.name || "Deleted Product"}</span>
                </div>
              </div>

              {/* Financial Stats Breakdown (Grid Structure for small screens) */}
              <div className="grid grid-cols-2 gap-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                <div>
                  <p className="text-slate-500 text-[10px] font-medium uppercase">Sale Price</p>
                  <p className="font-bold text-slate-200 mt-0.5">Rs. {inv.salePrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-medium uppercase">Monthly Kist</p>
                  <p className="font-bold text-indigo-300 mt-0.5">Rs. {inv.monthlyInstallment.toLocaleString()}/Mo</p>
                </div>
                <div className="border-t border-slate-800/60 pt-1.5 mt-1">
                  <p className="text-emerald-500 text-[10px] font-medium uppercase">Advance Paid</p>
                  <p className="font-semibold text-emerald-400 mt-0.5">Rs. {inv.downPayment.toLocaleString()}</p>
                </div>
                <div className="border-t border-slate-800/60 pt-1.5 mt-1">
                  <p className="text-amber-500 text-[10px] font-medium uppercase">Remaining</p>
                  <p className="font-bold text-amber-400 mt-0.5">Rs. {inv.remainingAmount.toLocaleString()}</p>
                </div>
              </div>

              {/* Bottom Duration Badge */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>Plan Duration: <strong className="text-slate-300">{inv.durationMonths} Months</strong></span>
              </div>

            </div>
          ))
        )}
      </div>

      {/* 🖥️ 2. DESKTOP VIEW TABLE (hidden md:block - Mobile par automatic hide ho jaye) */}
      <div className="hidden md:block w-full bg-slate-800/40 border border-slate-800 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/60 bg-slate-800/60 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <th className="py-4 px-6 w-16">S#</th>
                <th className="py-4 px-6">Invoice #</th>
                <th className="py-4 px-6">Customer / Item</th>
                <th className="py-4 px-6">Sale Price</th>
                <th className="py-4 px-6">Advance / Bal.</th>
                <th className="py-4 px-6">Installment Deal</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-200">
              {filteredInvoices.map((inv, index) => (
                <tr key={inv._id} className="hover:bg-slate-700/20 transition duration-150">
                  <td className="py-4 px-6 font-medium text-slate-400">{index + 1}</td>
                  <td className="py-4 px-6 font-bold text-indigo-400 uppercase tracking-wider">{inv.invoiceNumber}</td>
                  <td className="py-4 px-6 space-y-1">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-100">
                      <User className="w-3.5 h-3.5 text-slate-400" /> {inv.customer?.name || "Deleted"}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" /> {inv.product?.name || "Deleted"}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-200">Rs. {inv.salePrice.toLocaleString()}</td>
                  <td className="py-4 px-6 space-y-0.5">
                    <div className="text-xs text-emerald-400">Adv: Rs. {inv.downPayment.toLocaleString()}</div>
                    <div className="text-xs text-amber-400 font-medium">Rem: Rs. {inv.remainingAmount.toLocaleString()}</div>
                  </td>
                  <td className="py-4 px-6 space-y-0.5">
                    <div className="font-semibold text-slate-200">Rs. {inv.monthlyInstallment.toLocaleString()} / Mo</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {inv.durationMonths} Months
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border ${
                      inv.status === "Active" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}>
                      {inv.status}
                    </span>
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