"use client";

import { useState, useEffect } from "react";
import { FileText, FileSpreadsheet, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function ProfitReportPage() {
  const [list, setList] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/profit");
      const resData = await response.json();
      if (resData.success) {
        setList(resData.data.list);
        setSummary(resData.data.summary);
      } else {
        toast.error(resData.message || "Report load nahi ho saka");
      }
    } catch (error) {
      toast.error("Network error, dubara koshish karein");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // 📄 PDF EXPORT
  const handleExportPDF = () => {
    if (!list.length) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Profit Report", 14, 18);

    doc.setFontSize(10);
    doc.text(
      `Total Sale: Rs. ${summary.totalSaleValue.toLocaleString()}  |  Total Cost: Rs. ${summary.totalCostValue.toLocaleString()}  |  Total Profit: Rs. ${summary.totalProfit.toLocaleString()}`,
      14,
      26
    );

    const rows = list.map((inv) => [
      inv.invoiceNumber,
      inv.customerName,
      inv.saleType,
      `Rs. ${inv.salePrice.toLocaleString()}`,
      `Rs. ${inv.costPrice.toLocaleString()}`,
      `Rs. ${inv.profit.toLocaleString()}`,
      inv.status,
    ]);

    autoTable(doc, {
      startY: 34,
      head: [["Invoice#", "Customer", "Type", "Sale Price", "Cost Price", "Profit", "Status"]],
      body: rows,
      styles: { fontSize: 8 },
      margin: { left: 14 },
    });

    doc.save(`Profit_Report_${Date.now()}.pdf`);
  };

  // 📊 EXCEL EXPORT
  const handleExportExcel = () => {
    if (!list.length) return;

    const rows = list.map((inv) => ({
      "Invoice#": inv.invoiceNumber,
      Customer: inv.customerName,
      Type: inv.saleType,
      "Sale Price": inv.salePrice,
      "Cost Price": inv.costPrice,
      Profit: inv.profit,
      Status: inv.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Profit Report");
    XLSX.writeFile(workbook, `Profit_Report_${Date.now()}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-2">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-800 p-3 rounded-md border border-slate-800">
          <div>
            <h1 className="text-xl font-bold">Profit Report</h1>
            <p className="text-xs text-slate-400">Har invoice ka Sale Price vs Cost Price profit</p>
          </div>

          {list.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer"
              >
                <FileText className="w-4 h-4" /> PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" /> Excel
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16 text-sm text-slate-400">Report load ho raha hai...</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-800 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-medium">Total Sale Value</p>
                  <p className="text-lg font-bold text-slate-100 mt-1">Rs. {summary.totalSaleValue.toLocaleString()}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-medium">Total Cost Value</p>
                  <p className="text-lg font-bold text-amber-400 mt-1">Rs. {summary.totalCostValue.toLocaleString()}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-medium">Total Profit</p>
                  <p className={`text-lg font-bold mt-1 ${summary.totalProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    Rs. {summary.totalProfit.toLocaleString()}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>

            {list.length === 0 ? (
              <div className="text-center py-16 text-sm text-slate-500 bg-slate-800/30 rounded-xl border border-slate-800">
                Koi invoice nahi mili.
              </div>
            ) : (
              <>
                {/* 📱 Mobile Cards */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {list.map((inv) => (
                    <div key={inv.invoiceId} className="bg-slate-800 border border-slate-700 p-4 rounded-xl space-y-2.5 relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-indigo-400 font-mono">{inv.invoiceNumber}</p>
                          <p className="text-sm font-semibold text-slate-100 mt-0.5">{inv.customerName}</p>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase border ${
                            inv.status === "Completed"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : inv.status === "Defaulted"
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-700 text-[11px]">
                        <div>
                          <p className="text-slate-500 uppercase text-[10px]">Sale</p>
                          <p className="text-slate-200 font-mono mt-0.5">{inv.salePrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 uppercase text-[10px]">Cost</p>
                          <p className="text-amber-400 font-mono mt-0.5">{inv.costPrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 uppercase text-[10px]">Profit</p>
                          <p className={`font-mono font-bold mt-0.5 ${inv.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {inv.profit.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 🖥️ Desktop Table */}
                <div className="hidden md:block w-full bg-slate-800 border border-slate-800 rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-700 bg-slate-900 text-slate-400 text-xs uppercase">
                          <th className="p-2">Invoice#</th>
                          <th className="p-2">Customer</th>
                          <th className="p-2">Type</th>
                          <th className="p-2">Sale Price</th>
                          <th className="p-2">Cost Price</th>
                          <th className="p-2">Profit</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700 text-sm text-slate-200">
                        {list.map((inv) => (
                          <tr key={inv.invoiceId} className="hover:bg-slate-700/30 transition">
                            <td className="p-2 text-xs font-mono text-indigo-400">{inv.invoiceNumber}</td>
                            <td className="p-2 text-xs">{inv.customerName}</td>
                            <td className="p-2 text-xs text-slate-400">{inv.saleType}</td>
                            <td className="p-2 text-xs font-mono">Rs. {inv.salePrice.toLocaleString()}</td>
                            <td className="p-2 text-xs font-mono text-amber-400">Rs. {inv.costPrice.toLocaleString()}</td>
                            <td className={`p-2 text-xs font-mono font-bold ${inv.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              Rs. {inv.profit.toLocaleString()}
                            </td>
                            <td className="p-2">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                                  inv.status === "Completed"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : inv.status === "Defaulted"
                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                    : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                }`}
                              >
                                {inv.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}