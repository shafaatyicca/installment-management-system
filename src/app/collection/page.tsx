"use client";

import { useState, useEffect } from "react";
import { Calendar, FileText, FileSpreadsheet, DollarSign, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function CollectionReportPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = "/api/reports/collection";
      const params = new URLSearchParams();
      if (fromDate) params.append("from", fromDate);
      if (toDate) params.append("to", toDate);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      const resData = await response.json();
      if (resData.success) {
        setData(resData.data);
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

  const handleClearFilter = () => {
    setFromDate("");
    setToDate("");
    setTimeout(() => fetchReport(), 0);
  };

  // 📄 PDF EXPORT
  const handleExportPDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Collection Report", 14, 18);

    doc.setFontSize(10);
    const periodText = fromDate || toDate
      ? `Period: ${fromDate || "Start"} to ${toDate || "Today"}`
      : "Period: Overall (All Time)";
    doc.text(periodText, 14, 26);

    const rows = [
      ["Total Sale Value", `Rs. ${data.totalSaleValue.toLocaleString()}`],
      ["Total Collected", `Rs. ${data.totalCollected.toLocaleString()}`],
      ["Advance Collected", `Rs. ${data.totalAdvanceCollected.toLocaleString()}`],
      ["Installments Collected", `Rs. ${data.totalInstallmentCollected.toLocaleString()}`],
      ["Total Due (Outstanding)", `Rs. ${data.totalDue.toLocaleString()}`],
      ["Total Payments Received", `${data.collectedCount}`],
    ];

    autoTable(doc, {
      startY: 34,
      head: [["Metric", "Value"]],
      body: rows,
      styles: { fontSize: 10 },
      margin: { left: 14 },
    });

    doc.save(`Collection_Report_${Date.now()}.pdf`);
  };

  // 📊 EXCEL EXPORT
  const handleExportExcel = () => {
    if (!data) return;

    const rows = [
      { Metric: "Total Sale Value", Value: data.totalSaleValue },
      { Metric: "Total Collected", Value: data.totalCollected },
      { Metric: "Advance Collected", Value: data.totalAdvanceCollected },
      { Metric: "Installments Collected", Value: data.totalInstallmentCollected },
      { Metric: "Total Due (Outstanding)", Value: data.totalDue },
      { Metric: "Total Payments Received", Value: data.collectedCount },
    ];

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Collection Report");
    XLSX.writeFile(workbook, `Collection_Report_${Date.now()}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-2">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-800 p-3 rounded-md border border-slate-800">
          <div>
            <h1 className="text-xl font-bold">Collection Report</h1>
            <p className="text-xs text-slate-400">Total collection aur outstanding overview</p>
          </div>

          {data && (
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

        {/* Date Filter */}
        <div className="bg-slate-800 border border-slate-800 rounded-md p-3 flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={fetchReport}
              className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              Apply
            </button>
            <button
              onClick={handleClearFilter}
              className="flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg text-sm transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-sm text-slate-400">Report load ho raha hai...</div>
        ) : data ? (
          <>
            <p className="text-xs text-slate-500">
              {data.filterApplied
                ? `Filtered Period: ${fromDate || "Start"} to ${toDate || "Today"}`
                : "Showing: Overall (All Time) Data"}
            </p>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-slate-800 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-medium">Total Sale Value</p>
                  <p className="text-lg font-bold text-slate-100 mt-1">Rs. {data.totalSaleValue.toLocaleString()}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-medium">Total Collected</p>
                  <p className="text-lg font-bold text-emerald-400 mt-1">Rs. {data.totalCollected.toLocaleString()}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-medium">Total Due (Outstanding)</p>
                  <p className="text-lg font-bold text-amber-400 mt-1">Rs. {data.totalDue.toLocaleString()}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-800 rounded-xl p-4">
                <p className="text-[10px] text-slate-500 uppercase font-medium">Advance Collected</p>
                <p className="text-lg font-bold text-indigo-400 mt-1">Rs. {data.totalAdvanceCollected.toLocaleString()}</p>
              </div>

              <div className="bg-slate-800 border border-slate-800 rounded-xl p-4">
                <p className="text-[10px] text-slate-500 uppercase font-medium">Installments Collected</p>
                <p className="text-lg font-bold text-indigo-400 mt-1">Rs. {data.totalInstallmentCollected.toLocaleString()}</p>
              </div>

              <div className="bg-slate-800 border border-slate-800 rounded-xl p-4">
                <p className="text-[10px] text-slate-500 uppercase font-medium">Total Payments Received</p>
                <p className="text-lg font-bold text-slate-100 mt-1">{data.collectedCount}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-sm text-slate-500">Data load nahi ho saka</div>
        )}
      </div>
    </div>
  );
}