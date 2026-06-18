"use client";

import { useState } from "react";
import { Search, Calendar, User, ShoppingBag, Eye } from "lucide-react";

interface InvoiceTableProps {
  invoices: any[];
  loading: boolean;
  onViewClick: (invoice: any) => void;
}

export default function InvoiceTable({ invoices, loading, onViewClick }: InvoiceTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInvoices = invoices.filter((inv) => {
    const search = searchTerm.toLowerCase();
    const matchesCustomer = inv.customer?.name?.toLowerCase().includes(search);
    const matchesInvoice = inv.invoiceNumber?.toLowerCase().includes(search);
    const matchesProduct = inv.products?.some((p: any) => p.name?.toLowerCase().includes(search));
    return matchesInvoice || matchesCustomer || matchesProduct;
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
    <div className="space-y-2 w-full">
      {/* 🔍 Responsive Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Enter Invoice#, Customer Name, Product Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-md pl-10 pr-4 py-2.5 text-xs md:text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-500"
        />
      </div>

      {/* 📱 1. MOBILE RESPONSIVE CARDS VIEW */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 bg-slate-800/20 rounded-xl border border-slate-800">
            Koi invoice records nahi mile.
          </div>
        ) : (
          filteredInvoices.map((inv, index) => (
            <div key={inv._id} className="bg-slate-800/50 border border-slate-800/80 p-4 rounded-xl space-y-3 shadow-md relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-slate-700/40 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded font-mono">#{index + 1}</span>
                  <span className="text-xs text-indigo-400 uppercase tracking-wider">{inv.invoiceNumber}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border ${
                  inv.status === "Completed"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                }`}>
                  {inv.status || "Active"}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-100">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{inv.customer?.name || "Deleted Customer"}</span>
                </div>
                <div className="flex flex-col gap-1 pl-5 text-[11px] text-slate-400">
                  {inv.products?.map((p: any, idx: number) => (
                    <div key={idx} className="flex flex-col bg-slate-900/30 p-1 rounded border border-slate-800/40 mt-0.5">
                      <div className="flex items-center gap-1 font-medium text-slate-300">
                        <ShoppingBag className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="truncate">{p.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono pl-4">
                        {p.quantity}x @ Rs. {(p.price || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                <div>
                  <p className="text-slate-500 text-[10px] font-medium uppercase">Sale Price</p>
                  <p className="text-slate-200 mt-0.5">Rs. {(inv.salePrice || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-medium uppercase">Monthly</p>
                  <p className="text-indigo-300 mt-0.5">
                    {inv.durationMonths === 0 ? "Rs. 0" : `Rs. ${(inv.monthlyInstallment || 0).toLocaleString()}/Mo`}
                  </p>
                </div>
                <div className="border-t border-slate-800/60 pt-1.5 mt-1">
                  <p className="text-emerald-500 text-[10px] font-medium uppercase">Advance Paid</p>
                  <p className="font-semibold text-emerald-400 mt-0.5">
                    Rs. {(inv.downPayment || 0).toLocaleString()}
                  </p>
                </div>
                <div className="border-t border-slate-800/60 pt-1.5 mt-1">
                  <p className="text-amber-500 text-[10px] font-medium uppercase">Remaining</p>
                  <p className="text-amber-400 mt-0.5">
                    Rs. {(inv.remainingAmount || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/40 mt-1">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>Plan: <strong className="text-slate-300">{inv.durationMonths === 0 ? "Cash Sale" : `${inv.durationMonths} Months`}</strong></span>
                </div>
                <button onClick={() => onViewClick(inv)} className="text-[11px] font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-500/10 transition flex items-center gap-1 cursor-pointer">
                  <Eye className="w-3 h-3" /> View Detail
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🖥️ 2. DESKTOP VIEW TABLE */}
      <div className="hidden md:block w-full bg-slate-800/40 border border-slate-800 backdrop-blur-md rounded-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/60 bg-slate-800/60 text-slate-400 text-xs uppercase">
                <th className="p-2">S#</th>
                <th className="p-2">Invoice #</th>
                <th className="p-2">Customer / Items Purchased</th>
                <th className="p-2">Sale Price</th>
                <th className="p-2">Advance / Bal.</th>
                <th className="p-2">Installment Deal</th>
                <th className="p-2">Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-200">
              {filteredInvoices.map((inv, index) => (
                <tr key={inv._id} className="hover:bg-slate-700/20 transition duration-150">
                  <td className="p-2 font-medium text-slate-400">{index + 1}</td>
                  <td className="p-2 text-indigo-400 uppercase text-xs font-mono">{inv.invoiceNumber}</td>
                  <td className="p-2 space-y-1 max-w-xs">
                    <div className="flex items-center gap-1.5 text-sm text-slate-100">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" /> 
                      <span className="truncate">{inv.customer?.name || "Deleted"}</span>
                    </div>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {inv.products?.map((p: any, idx: number) => (
                        <div key={idx} className="flex flex-col bg-slate-900/20 rounded border border-slate-800/30">
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-300">
                            <ShoppingBag className="w-3 h-3 text-indigo-500/70 shrink-0" />
                            <span className="truncate">{p.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-2 text-slate-200 text-xs font-mono">Rs. {(inv.salePrice || 0).toLocaleString()}</td>
                  
                  <td className="p-2 space-y-0.5 font-mono">
                    <div className="text-xs text-emerald-400">
                      Adv: {(inv.downPayment || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-amber-400">
                      Bal: {(inv.remainingAmount || 0).toLocaleString()}
                    </div>
                  </td>

                  <td className="p-2 space-y-0.5">
                    <div className="text-slate-200 text-xs font-mono">
                      {inv.durationMonths === 0 ? "Rs. 0" : `Rs. ${(inv.monthlyInstallment || 0).toLocaleString()}`}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" /> {inv.durationMonths === 0 ? "Cash Sale" : `${inv.durationMonths} Months`}
                    </div>
                  </td>

                  <td className="p-2">
                    <span className={`p-1.5 rounded-md text-[10px] border ${
                      inv.status === "Completed"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                    }`}>
                      {inv.status || "Active"}
                    </span>
                  </td>
                  <td className="p-2 text-right pr-4">
                    <button onClick={() => onViewClick(inv)} className="text-xs text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 p-1.5 rounded-md border border-indigo-500/20 transition inline-flex items-center gap-1 cursor-pointer font-medium">
                      <Eye className="w-3.5 h-3.5" /> View Detail
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