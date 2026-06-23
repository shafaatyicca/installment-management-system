"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import { CalendarIcon, Printer, DollarSign, TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { printStatement } from "@/lib/printStatement";

export default function CollectionReportPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async (range?: DateRange) => {
    setLoading(true);
    try {
      let url = "/api/reports/collection";
      const params = new URLSearchParams();
      if (range?.from) params.append("from", format(range.from, "yyyy-MM-dd"));
      if (range?.to) params.append("to", format(range.to, "yyyy-MM-dd"));
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

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      fetchReport(range);
    }
  };

  const handleClearFilter = () => {
    setDateRange(undefined);
    fetchReport();
  };

  // 🖨️ PRINT STATEMENT
  const handlePrint = () => {
    if (!data) return;

    const periodText = dateRange?.from
      ? `Period: ${format(dateRange.from, "dd MMM yyyy")} to ${dateRange.to ? format(dateRange.to, "dd MMM yyyy") : "Today"}`
      : "Period: Overall (All Time)";

    printStatement({
      title: "Collection Report",
      subtitle: periodText,
      summaryRows: [
        { label: "Total Sale Value", value: `Rs. ${data.totalSaleValue.toLocaleString()}` },
        { label: "Total Collected", value: `Rs. ${data.totalCollected.toLocaleString()}` },
        { label: "Advance Collected", value: `Rs. ${data.totalAdvanceCollected.toLocaleString()}` },
        { label: "Installments Collected", value: `Rs. ${data.totalInstallmentCollected.toLocaleString()}` },
      ],
      columns: [
        { header: "S#", key: "sno" },
        { header: "Invoice#", key: "invoiceNumber" },
        { header: "Receipt#", key: "receiptNumber" },
        { header: "Customer", key: "customerName" },
        { header: "Type", key: "saleType" },
        { header: "Amount", key: "amount" },
        { header: "Date", key: "date" },
        { header: "Balance", key: "balance" },
      ],
      rows: data.detailedList.map((d: any, idx: number) => ({
        sno: idx + 1,
        invoiceNumber: d.invoiceNumber,
        receiptNumber: d.receiptNumber,
        customerName: d.customerName,
        saleType: d.saleType,
        amount: `Rs. ${d.amount.toLocaleString()}`,
        date: new Date(d.paidDate).toLocaleDateString("en-GB"),
        balance: `Rs. ${d.balance.toLocaleString()}`,
      })),
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-2">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-800 p-3 rounded-md border border-slate-800">
          <div>
            <h1 className="text-xl font-bold">Collection Report</h1>
            <p className="text-xs text-slate-400">Total collection aur outstanding overview</p>
          </div>

          {data && data.filterApplied && data.detailedList?.length > 0 && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Statement
            </button>
          )}
        </div>

        {/* Date Range Picker */}
        <div className="bg-slate-800 border border-slate-800 rounded-md p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start px-2.5 font-normal bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800 hover:text-white"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Date range select karein</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {dateRange?.from && (
            <button
              onClick={handleClearFilter}
              className="flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg text-sm transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Clear
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16 text-sm text-slate-400">Report load ho raha hai...</div>
        ) : data ? (
          <>
            <p className="text-xs text-slate-500">
              {data.filterApplied
                ? `Filtered Period: ${dateRange?.from ? format(dateRange.from, "dd MMM yyyy") : "Start"} to ${dateRange?.to ? format(dateRange.to, "dd MMM yyyy") : "Today"}`
                : "Showing: Overall (All Time) Data"}
            </p>

            {/* Summary Cards - ab sirf 4, 1 row mein */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

              <div className="bg-slate-800 border border-slate-800 rounded-xl p-4">
                <p className="text-[10px] text-slate-500 uppercase font-medium">Advance Collected</p>
                <p className="text-lg font-bold text-indigo-400 mt-1">Rs. {data.totalAdvanceCollected.toLocaleString()}</p>
              </div>

              <div className="bg-slate-800 border border-slate-800 rounded-xl p-4">
                <p className="text-[10px] text-slate-500 uppercase font-medium">Installments Collected</p>
                <p className="text-lg font-bold text-indigo-400 mt-1">Rs. {data.totalInstallmentCollected.toLocaleString()}</p>
              </div>
            </div>

            {/* Detailed List - sirf jab date filter applied ho */}
            {data.filterApplied && data.detailedList?.length > 0 && (
              <>
                {/* 📱 Mobile Cards */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {data.detailedList.map((d: any, idx: number) => (
                    <div key={idx} className="bg-slate-800 border border-slate-700 p-4 rounded-xl space-y-2.5 relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded font-mono">#{idx + 1}</span>
                        <span className="text-xs font-mono text-indigo-400">{d.invoiceNumber}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200">{d.customerName}</p>
                      <div className="grid grid-cols-2 gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-700 text-[11px]">
                        <div>
                          <p className="text-slate-500 uppercase text-[10px]">Receipt#</p>
                          <p className="text-slate-200 font-mono mt-0.5">{d.receiptNumber}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 uppercase text-[10px]">Type</p>
                          <p className="text-slate-200 mt-0.5">{d.saleType}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 uppercase text-[10px]">Date</p>
                          <p className="text-slate-200 mt-0.5">{new Date(d.paidDate).toLocaleDateString("en-GB")}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 uppercase text-[10px]">Amount</p>
                          <p className="font-bold text-emerald-400 mt-0.5">Rs. {d.amount.toLocaleString()}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-slate-500 uppercase text-[10px]">Balance</p>
                          <p className="font-bold text-amber-400 mt-0.5">Rs. {d.balance.toLocaleString()}</p>
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
                          <th className="p-2">S#</th>
                          <th className="p-2">Invoice#</th>
                          <th className="p-2">Receipt#</th>
                          <th className="p-2">Customer</th>
                          <th className="p-2">Type</th>
                          <th className="p-2">Amount</th>
                          <th className="p-2">Date</th>
                          <th className="p-2">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700 text-sm text-slate-200">
                        {data.detailedList.map((d: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-700/30 transition">
                            <td className="p-2 text-xs text-slate-400">{idx + 1}</td>
                            <td className="p-2 text-xs font-mono text-indigo-400">{d.invoiceNumber}</td>
                            <td className="p-2 text-xs font-mono">{d.receiptNumber}</td>
                            <td className="p-2 text-xs">{d.customerName}</td>
                            <td className="p-2 text-xs text-slate-400">{d.saleType}</td>
                            <td className="p-2 text-xs font-mono text-emerald-400">Rs. {d.amount.toLocaleString()}</td>
                            <td className="p-2 text-xs">{new Date(d.paidDate).toLocaleDateString("en-GB")}</td>
                            <td className="p-2 text-xs font-mono text-amber-400">Rs. {d.balance.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-sm text-slate-500">Data load nahi ho saka</div>
        )}
      </div>
    </div>
  );
}