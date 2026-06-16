"use client";

import { useState } from "react";
import { Search, Calendar, User, ShoppingBag } from "lucide-react";

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
      <div className="w-full bg-slate-800/30 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400">Invoices records load ho rahe hain...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
        <input
          type="text"
          placeholder="INV#, Customer Name ya Product search karein..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-500"
        />
      </div>

      {/* Table Container */}
      <div className="w-full bg-slate-800/40 border border-slate-800 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl">
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
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Koi invoice records nahi mile.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv, index) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}