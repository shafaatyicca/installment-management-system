"use client";

import { useState } from "react";
import { X, Calendar, User, ShoppingBag, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface Installment {
  _id: string;
  installNo: number;
  dueDate: string;
  amount: number;
  status: "Pending" | "Paid" | "Overdue";
  paidDate?: string | null;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customer: { name: string; mobile: string };
  product: { name: string; brand?: string };
  salePrice: number;
  downPayment: number;
  remainingAmount: number;
  monthlyInstallment: number;
  durationMonths: number;
  status: "Active" | "Completed" | "Defaulted";
  installments: Installment[];
  createdAt: string;
}

interface InvoiceDetailsProps {
  invoice: Invoice | null;
  onClose: () => void;
  onRefresh: () => void;
}

export default function InvoiceDetails({ invoice, onClose, onRefresh }: InvoiceDetailsProps) {
  const [payLoading, setPayLoading] = useState<string | null>(null);

  if (!invoice) return null;

  const handleReceivePayment = async (installmentId: string) => {
    if (!confirm("Are you sure you want to mark this installment as paid?")) return;

    setPayLoading(installmentId);
    try {
      const response = await fetch(`/api/take_payment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice._id,
          installmentId: installmentId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Installment successfully marked as paid!");
        onRefresh();
      } else {
        toast.error(data.message || "Failed to update payment status");
      }
    } catch (error) {
      toast.error("Network issue, please try again.");
    } finally {
      setPayLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 animate-fade-in">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      {/* 🎯 Center Popup Container */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-slate-800 border border-slate-700/60 shadow-2xl flex flex-col z-10 rounded-md overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-slate-700/60 bg-slate-800/90 sticky top-0 z-20">
          <div>
            <span className="text-xs mr-2 font-mono font-semibold bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-md">
              {invoice.invoiceNumber}
            </span>
            <span className="text-base text-slate-100">Installment Account Details</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-2 space-y-2 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          
          {/* Customer & Product Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-900/40 border border-slate-700/40 p-3.5 rounded-md flex gap-3 items-start">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 shrink-0"><User className="w-4 h-4" /></div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium uppercase">Customer</p>
                <h4 className="text-sm font-bold text-slate-200 mt-0.5">{invoice.customer?.name || "Deleted"}</h4>
                <p className="text-xs text-slate-400 font-mono">{invoice.customer?.mobile}</p>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-700/40 p-3.5 rounded-md flex gap-3 items-start">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0">
              <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium uppercase">Item Purchased</p>
                <h4 className="text-sm text-slate-200 mt-0.5">{invoice.product?.name || "Deleted"}</h4>
                <p className="text-xs text-slate-400">{invoice.product?.brand || "No Brand"}</p>
              </div>
            </div>
          </div>

          {/* Financial Deal Summary */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Sale Price</p>
              <p className="text-sm font-bold text-slate-300 mt-0.5">Rs. {invoice.salePrice.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Advance Paid</p>
              <p className="text-sm font-bold text-indigo-400 mt-0.5">Rs. {invoice.downPayment.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Remaining Amount</p>
              <p className="text-sm font-bold text-amber-400 mt-0.5">Rs. {invoice.remainingAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Monthly Installment</p>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">Rs. {invoice.monthlyInstallment.toLocaleString()}</p>
            </div>
          </div>

          {/* INSTALLMENT SCHEDULE HEADER */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" /> Payment & Installment Schedule
              </h3>
              <span className="text-xs text-slate-500 font-medium">Plan: {invoice.durationMonths} Months</span>
            </div>

            {/* Schedule Cards Stack */}
            <div className="space-y-2.5">
              {invoice.installments?.map((inst) => (
                <div 
                  key={inst._id} 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition ${
                    inst.status === "Paid" 
                      ? "bg-emerald-500/5 border-emerald-500/20" 
                      : inst.status === "Overdue"
                      ? "bg-red-500/5 border-red-500/20"
                      : "bg-slate-900/30 border-slate-700/40 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      inst.status === "Paid" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"
                    }`}>
                      #{inst.installNo}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Rs. {inst.amount.toLocaleString()}</p>
                      <p className="text-[11px] text-red-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> Due: {new Date(inst.dueDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-slate-700/30 sm:border-t-0">
                    {inst.status === "Paid" ? (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/10">
                          <CheckCircle className="w-3 h-3" /> PAID
                        </span>
                        {inst.paidDate && (
                          <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                            Rec: {new Date(inst.paidDate).toLocaleDateString("en-GB")}
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md ${
                          inst.status === "Overdue" 
                            ? "bg-red-500/10 text-red-400 border border-red-500/10" 
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/10"
                        }`}>
                          {inst.status === "Overdue" ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {inst.status}
                        </span>
                        
                        <button
                          onClick={() => handleReceivePayment(inst._id)}
                          disabled={payLoading !== null}
                          className="text-xs cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1.5 rounded-md shadow-sm transition disabled:opacity-50"
                        >
                          {payLoading === inst._id ? "Processing..." : "Receive Payment"}
                        </button>
                      </>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}