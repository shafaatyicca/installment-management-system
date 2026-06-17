"use client";

import { useState, useEffect } from "react";
import { FilePlus, FileText } from "lucide-react";
import { Toaster } from "react-hot-toast";
import AddInvoiceModal from "@/components/AddInvoiceModal";
import InvoiceTable from "@/components/InvoiceTable";
import InvoiceDetails from "@/components/InvoiceDetails"; // 👈 1. Naya Details sliding panel link kiya

export default function InvoicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 2. Sliding Panel control karne ki states
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
    <div className="min-h-screen bg-slate-900 text-slate-100 p-2">
      <Toaster position="top-center" />

      <div className="max-w-6xl mx-auto space-y-2">
        
        {/* Top bar with Heading and Create Trigger Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/40 p-2 rounded-md border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Installment Invoice Center</h1>
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition text-sm w-full sm:w-auto justify-center"
          >
            <FilePlus className="w-4 h-4" />Create Installment
          </button>
        </div>

        {/* Live Filterable Ledger Invoice Table */}
        {/* 👈 3. onViewClick handle pass kiya taake click track ho sake */}
        <InvoiceTable 
          invoices={invoices} 
          loading={loading} 
          onViewClick={(invoice) => {
            setSelectedInvoice(invoice);
            setIsDetailsOpen(true);
          }}
        />

      </div>

      {/* Shared Full Functional Auto Calculation Create Invoice Modal */}
      <AddInvoiceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchInvoices}
      />

      {/* 🗓️ 4. Sliding Invoice Details Panel component */}
      {isDetailsOpen && (
        <InvoiceDetails
          invoice={selectedInvoice}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedInvoice(null);
          }}
          onRefresh={() => {
            fetchInvoices(); // Kist jama hone par piche background list automatic sync hogi
            setIsDetailsOpen(false);
          }}
        />
      )}
    </div>
  );
}