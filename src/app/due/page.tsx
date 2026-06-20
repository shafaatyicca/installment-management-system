"use client";

import { useState, useEffect } from "react";
import { FileText, FileSpreadsheet, AlertTriangle, Clock, Phone, Eye } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function DueReportPage() {
  const [dueList, setDueList] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/reports/due");
      const resData = await response.json();
      if (resData.success) {
        setDueList(resData.data.list);
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
    if (!dueList.length) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Due Report (Overdue + Today's Due)", 14, 18);

    doc.setFontSize(10);
    doc.text(
      `Total Overdue: Rs. ${summary.totalOverdueAmount.toLocaleString()} (${summary.totalOverdueCount})  |  Today's Due: Rs. ${summary.totalTodayAmount.toLocaleString()} (${summary.totalTodayCount})`,
      14,
      26
    );

    const rows = dueList.map((d) => [
      d.customerName,
      d.customerMobile,
      d.invoiceNumber,
      d.installNo === 0 ? "Advance" : `#${d.installNo}`,
      new Date(d.dueDate).toLocaleDateString("en-GB"),
      `Rs. ${d.amount.toLocaleString()}`,
      d.isToday ? "Today" : `${d.daysLate} days late`,
    ]);

    autoTable(doc, {
      startY: 34,
      head: [["Customer", "Mobile", "Invoice#", "Install#", "Due Date", "Amount", "Status"]],
      body: rows,
      styles: { fontSize: 8 },
      margin: { left: 14 },
    });

    doc.save(`Due_Report_${Date.now()}.pdf`);
  };

  // 📊 EXCEL EXPORT
  const handleExportExcel = () => {
    if (!dueList.length) return;

    const rows = dueList.map((d) => ({
      Customer: d.customerName,
      Mobile: d.customerMobile,
      "Invoice#": d.invoiceNumber,
      "Install#": d.installNo === 0 ? "Advance" : d.installNo,
      "Due Date": new Date(d.dueDate).toLocaleDateString("en-GB"),
      Amount: d.amount,
      Status: d.isToday ? "Today" : `${d.daysLate} days late`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Due Report");
    XLSX.writeFile(workbook, `Due_Report_${Date.now()}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-2">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-800 p-3 rounded-md border border-slate-800">
          <div>
            <h1 className="text-xl font-bold">Due Report</h1>
            <p className="text-xs text-slate-400">Overdue aur aaj due hone wali kisten</p>
          </div>

          {dueList.length > 0 && (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-800 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-medium">Total Overdue</p>
                  <p className="text-lg font-bold text-red-400 mt-1">Rs. {summary.totalOverdueAmount.toLocaleString()}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{summary.totalOverdueCount} installments</p>
                </div>
                <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-800 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-medium">Today's Due</p>
                  <p className="text-lg font-bold text-amber-400 mt-1">Rs. {summary.totalTodayAmount.toLocaleString()}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{summary.totalTodayCount} installments</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Due List */}
            {dueList.length === 0 ? (
              <div className="text-center py-16 text-sm text-slate-500 bg-slate-800/30 rounded-xl border border-slate-800">
                Koi overdue ya aaj ki due installment nahi hai. 🎉
              </div>
            ) : (
              <>
                {/* 📱 Mobile Cards */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {dueList.map((d, idx) => (
                    <div
                      key={idx}
                      className={`bg-slate-800 border p-4 rounded-xl space-y-2.5 relative overflow-hidden ${
                        d.isToday ? "border-amber-500/30" : "border-red-500/30"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold text-slate-100">{d.customerName}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" /> {d.customerMobile}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                            d.isToday
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {d.isToday ? "Today" : `${d.daysLate}d late`}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-700 text-[11px]">
                        <div>
                          <p className="text-slate-500 uppercase text-[10px]">Invoice#</p>
                          <p className="text-slate-200 font-mono mt-0.5">{d.invoiceNumber}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 uppercase text-[10px]">Install#</p>
                          <p className="text-slate-200 mt-0.5">{d.installNo === 0 ? "Advance" : `#${d.installNo}`}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 uppercase text-[10px]">Due Date</p>
                          <p className="text-slate-200 mt-0.5">{new Date(d.dueDate).toLocaleDateString("en-GB")}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 uppercase text-[10px]">Amount</p>
                          <p className="font-bold text-amber-400 mt-0.5">Rs. {d.amount.toLocaleString()}</p>
                        </div>
                      </div>

                      {d.customerId && (
                        <Link
                          href={`/reports/customer-ledger?customerId=${d.customerId}`}
                          className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1.5 rounded-lg border border-indigo-500/10 transition"
                        >
                          <Eye className="w-3 h-3" /> View Ledger
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                {/* 🖥️ Desktop Table */}
                <div className="hidden md:block w-full bg-slate-800 border border-slate-800 rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-700 bg-slate-900 text-slate-400 text-xs uppercase">
                          <th className="p-2">Customer</th>
                          <th className="p-2">Mobile</th>
                          <th className="p-2">Invoice#</th>
                          <th className="p-2">Install#</th>
                          <th className="p-2">Due Date</th>
                          <th className="p-2">Amount</th>
                          <th className="p-2">Status</th>
                          <th className="p-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700 text-sm text-slate-200">
                        {dueList.map((d, idx) => (
                          <tr key={idx} className="hover:bg-slate-700/30 transition">
                            <td className="p-2 text-xs font-medium">{d.customerName}</td>
                            <td className="p-2 text-xs text-slate-400 font-mono">{d.customerMobile}</td>
                            <td className="p-2 text-xs font-mono text-indigo-400">{d.invoiceNumber}</td>
                            <td className="p-2 text-xs">{d.installNo === 0 ? "Advance" : `#${d.installNo}`}</td>
                            <td className="p-2 text-xs">{new Date(d.dueDate).toLocaleDateString("en-GB")}</td>
                            <td className="p-2 text-xs font-mono text-amber-400">Rs. {d.amount.toLocaleString()}</td>
                            <td className="p-2">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                                  d.isToday
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                }`}
                              >
                                {d.isToday ? "Today" : `${d.daysLate}d late`}
                              </span>
                            </td>
                            <td className="p-2 text-center">
                              {d.customerId && (
                                <Link
                                  href={`/reports/customer-ledger?customerId=${d.customerId}`}
                                  className="text-xs text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 p-1.5 rounded-md border border-indigo-500/20 transition inline-flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Link>
                              )}
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