"use client";

import React from "react";
import { Printer, X } from "lucide-react";

interface ReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    receiptNumber: string;
    customerName: string;
    amountReceived: number;
    remainingBalance: number;
    products: Array<{ name: string; brand?: string }>;
    receivingDate: string;
  };
}

export default function ReceiptPrint({ isOpen, onClose, data }: ReceiptProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm print:bg-white print:p-0">
      
      {/* CSS to hide software layout during print */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            color: #000000 !important;
            background-color: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Container */}
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-xl shadow-2xl p-6 print:border-0 print:shadow-none print:w-full print:max-w-none print:bg-white text-slate-100 print:text-black">
        
        {/* Actions Bar (Hidden on Print) */}
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-800 no-print">
          <h3 className="text-sm font-bold text-indigo-400">Receipt Preview</h3>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={onClose} className="bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-1.5 rounded-lg cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE AREA */}
        <div id="print-area" className="space-y-4 font-sans bg-slate-900 print:bg-white p-2">
          
          {/* Shop Header */}
          <div className="text-center border-b border-dashed border-slate-700 print:border-black pb-3">
            <h2 className="text-xl font-bold uppercase tracking-wider print:text-black">Digital Store</h2>
            <p className="text-[11px] text-slate-400 print:text-gray-600 mt-0.5">Main Bazar, Peshawar, Pakistan</p>
            <p className="text-[11px] text-slate-400 print:text-gray-600">Contact: 0300-1234567</p>
          </div>

          {/* Receipt Info Meta */}
          <div className="grid grid-cols-2 gap-y-1.5 text-xs border-b border-slate-800 print:border-black pb-3">
            <div>
              <p className="text-slate-500 print:text-gray-500 font-medium">Receipt No:</p>
              <p className="font-mono font-bold text-slate-200 print:text-black">{data.receiptNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 print:text-gray-500 font-medium">Date & Time:</p>
              <p className="font-mono font-medium text-slate-300 print:text-black">{data.receivingDate}</p>
            </div>
            <div className="col-span-2 pt-1">
              <p className="text-slate-500 print:text-gray-500 font-medium">Customer Name:</p>
              <p className="font-bold text-slate-200 print:text-black text-sm">{data.customerName}</p>
            </div>
          </div>

          {/* Product Items Details */}
          <div className="space-y-1 text-xs">
            <p className="text-slate-500 print:text-gray-500 font-bold uppercase text-[10px] tracking-wider">Dealt Product(s)</p>
            <div className="bg-slate-950/40 print:bg-transparent p-2 rounded-lg border border-slate-800/60 print:border-0 print:p-0 space-y-1">
              {data.products.map((p, idx) => (
                <div key={idx} className="flex justify-between text-slate-300 print:text-black font-medium">
                  <span>• {p.name}</span>
                  {p.brand && <span className="text-slate-500 print:text-gray-500 text-[10px]">({p.brand})</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Breakup Box */}
          <div className="border-t border-dashed border-slate-700 print:border-black pt-3 space-y-1.5">
            <div className="flex justify-between items-center text-sm font-bold bg-indigo-500/10 print:bg-gray-100 p-2.5 rounded-xl">
              <span className="text-indigo-400 print:text-black">Amount Received:</span>
              <span className="text-emerald-400 print:text-black font-mono text-base">Rs. {data.amountReceived.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs px-2 pt-1 text-slate-400 print:text-black">
              <span>Remaining Balance:</span>
              <span className="font-mono font-bold text-amber-400 print:text-black">Rs. {data.remainingBalance.toLocaleString()}</span>
            </div>
          </div>

          {/* Footer Thank you Message */}
          <div className="text-center pt-6 border-t border-slate-800 print:border-black text-[10px] text-slate-500 print:text-gray-500 italic">
            <p>Thank you for your business!</p>
            <p className="mt-0.5">Software generated transaction record.</p>
          </div>

        </div>
      </div>
    </div>
  );
}