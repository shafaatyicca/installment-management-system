"use client";

import { useState, useEffect } from "react";
import { FilePlus, FileText } from "lucide-react";
import { Toaster } from "react-hot-toast";
import AddInvoiceModal from "@/components/AddInvoiceModal";
import InvoiceTable from "@/components/InvoiceTable";

export default function InvoicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/invoices");
      const resData = await response.json();
      if (resData.success) {
        setInvoices(resData.data);
      }
    } catch (error) {
      console.error("Invoices load nahi ho sakin", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <Toaster position="top-center" />

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top bar with Heading and Create Trigger Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Installment Invoice Center</h1>
              <p className="text-xs text-slate-400 mt-0.5">Shop ke ledger deals aur mahana kist records manage karein</p>
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition text-sm w-full sm:w-auto justify-center"
          >
            <FilePlus className="w-4 h-4" /> Naya Installment Bill Create Karein
          </button>
        </div>

        {/* Live Filterable Ledger Invoice Table */}
        <InvoiceTable invoices={invoices} loading={loading} />

      </div>

      {/* Shared Full Functional Auto Calculation Create Invoice Modal */}
      <AddInvoiceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchInvoices}
      />
    </div>
  );
}