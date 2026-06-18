"use client";

import { useState } from "react";
import { X, Calendar, User, ShoppingBag, CheckCircle, Clock, AlertTriangle, Printer } from "lucide-react";
import toast from "react-hot-toast";

interface Installment {
  _id: string;
  installNo: number;
  dueDate: string;
  amount: number;
  status: "Pending" | "Paid" | "Overdue";
  paidDate?: string | null;
}

interface InvoiceProductItem {
  product: string | { name: string; brand?: string };
  name: string;
  price: number;
  quantity: number;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customer: { name: string; mobile: string };
  products: InvoiceProductItem[]; // Updated to match array structure
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
  
  // Custom Confirmation Modal States
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; installmentId: string | null }>({
    open: false,
    installmentId: null,
  });

  if (!invoice) return null;

  // Trigger Confirmation Instead of Native Alert
  const askForPaymentConfirmation = (installmentId: string) => {
    setConfirmModal({ open: true, installmentId });
  };

  const handleReceivePayment = async () => {
    const installmentId = confirmModal.installmentId;
    if (!installmentId) return;

    setConfirmModal({ open: false, installmentId: null });
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

  const handlePrintReceipt = (inst: Installment) => {
    toast.success(`#${inst.installNo} ki receipt print ho rahi hai...`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 animate-fade-in">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      {/* Center Popup Container */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-slate-800 border border-slate-700/60 shadow-2xl flex flex-col z-10 rounded-md overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-slate-700/60 bg-slate-800/90 sticky top-0 z-20">
          <div>
            <span className="text-xs mr-2 font-mono font-semibold bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-md">
              {invoice.invoiceNumber}
            </span>
            <span className="text-base text-slate-100">Invoice Details</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition cursor-pointer">
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
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-500 font-medium uppercase">Items Purchased</p>
                
                {/* 🟢 CHANGED: Multiple items dynamic listing handler array check */}
                {invoice.products && invoice.products.length > 0 ? (
                  <div className="mt-1 space-y-1 max-h-20 overflow-y-auto scrollbar-none">
                    {invoice.products.map((item, idx) => (
                      <div key={idx} className="text-xs text-slate-200 flex justify-between gap-2">
                        <span className="truncate font-medium">• {item.name || "Unknown Product"}</span>
                        <span className="font-mono text-slate-400 shrink-0">
                          ({item.quantity}x) Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <h4 className="text-sm text-slate-200 mt-0.5">No products assigned</h4>
                )}
              </div>
            </div>
          </div>

          {/* Financial Deal Summary */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Sale Price</p>
              <p className="text-sm font-bold text-slate-300 mt-0.5">Rs. {(invoice.salePrice || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Advance Paid</p>
              <p className="text-sm font-bold text-indigo-400 mt-0.5">Rs. {(invoice.downPayment || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Remaining Amount</p>
              <p className="text-sm font-bold text-amber-400 mt-0.5">Rs. {(invoice.remainingAmount || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Monthly Installment</p>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">Rs. {(invoice.monthlyInstallment || 0).toLocaleString()}</p>
            </div>
          </div>

          {/* INSTALLMENT SCHEDULE HEADER */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" /> Payment History & Schedule
              </h3>
              <span className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded-md font-medium">
                Plan: {invoice.durationMonths === 0 ? "Full Cash Sale" : `${invoice.durationMonths} Months`}
              </span>
            </div>

            {/* Schedule Cards Stack */}
            <div className="space-y-2.5">
              {invoice.installments?.map((inst) => (
                <div 
                  key={inst._id} 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-md border transition ${
                    inst.status === "Paid" 
                      ? "bg-emerald-500/10 border-emerald-500/20" 
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
                      <p className="text-xs font-bold text-slate-200">Rs. {(inst.amount || 0).toLocaleString()}</p>
                      <p className="text-[11px] text-red-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> Due: {new Date(inst.dueDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-slate-700/30 sm:border-t-0">
                    {inst.status === "Paid" ? (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/10">
                            <CheckCircle className="w-3 h-3" /> PAID
                          </span>
                          {inst.paidDate && (
                            <p className="text-[9px] font-mono mt-0.5 text-slate-400">
                              Rec: {new Date(inst.paidDate).toLocaleDateString("en-GB")}
                            </p>
                          )}
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handlePrintReceipt(inst)}
                          className="text-[11px] font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1.5 rounded-lg border border-indigo-500/20 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3 h-3" /> Print Receipt
                        </button>
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
                          type="button"
                          onClick={() => askForPaymentConfirmation(inst._id)}
                          disabled={payLoading !== null}
                          className="text-xs cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1.5 rounded-md shadow-sm transition disabled:opacity-50 font-medium"
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

      {/* CUSTOM MINI CONFIRMATION MODAL */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setConfirmModal({ open: false, installmentId: null })} />
          <div className="relative w-full max-w-sm bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-2xl space-y-4 z-10 text-center animate-scale-up">
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-100">Confirm Payment?</h4>
              <p className="text-xs text-slate-400">Are you sure you want to mark this installment as paid?</p>
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmModal({ open: false, installmentId: null })}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReceivePayment}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold transition shadow-md cursor-pointer"
              >
                Yes, Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}