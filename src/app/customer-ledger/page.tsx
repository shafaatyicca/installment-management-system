"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, FileText, Download, FileSpreadsheet, User, Phone, CreditCard, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface Customer {
  _id: string;
  name: string;
  cnic: string;
  mobile: string;
  address: string;
}

function CustomerLedgerContent() {
  const searchParams = useSearchParams();
  const urlCustomerId = searchParams.get("customerId");

  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Saare customers load karein dropdown search ke liye
  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setCustomers(resData.data);
      });
  }, []);

  // Agar URL mein customerId aaya hai to direct load karein
  useEffect(() => {
    if (urlCustomerId) {
      fetchLedger(urlCustomerId);
    }
  }, [urlCustomerId]);

  const fetchLedger = async (customerId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/customer-ledger?customerId=${customerId}`);
      const resData = await response.json();
      if (resData.success) {
        setSelectedCustomer(resData.data.customer);
        setInvoices(resData.data.invoices);
        setSummary(resData.data.summary);
      } else {
        toast.error(resData.message || "Ledger load nahi ho saka");
      }
    } catch (error) {
      toast.error("Network error, dubara koshish karein");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((c: any) => {
    const search = customerSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(search) ||
      c.cnic.includes(search) ||
      c.mobile.includes(search)
    );
  });

  // 📄 PDF EXPORT
  const handleExportPDF = () => {
    if (!selectedCustomer || !summary) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Customer Ledger Report", 14, 18);

    doc.setFontSize(10);
    doc.text(`Customer: ${selectedCustomer.name}`, 14, 28);
    doc.text(`CNIC: ${selectedCustomer.cnic}`, 14, 34);
    doc.text(`Mobile: ${selectedCustomer.mobile}`, 14, 40);

    doc.text(`Total Invoices: ${summary.totalInvoices}`, 120, 28);
    doc.text(`Total Sale Value: Rs. ${summary.totalSaleValue.toLocaleString()}`, 120, 34);
    doc.text(`Total Paid: Rs. ${summary.totalPaid.toLocaleString()}`, 120, 40);
    doc.text(`Total Due: Rs. ${summary.totalDue.toLocaleString()}`, 120, 46);

    let startY = 56;

    invoices.forEach((inv: any) => {
      doc.setFontSize(11);
      doc.text(
        `Invoice: ${inv.invoiceNumber}  |  Sale: Rs. ${inv.salePrice.toLocaleString()}  |  Due: Rs. ${inv.dueAmount.toLocaleString()}  |  Status: ${inv.status}`,
        14,
        startY
      );
      startY += 6;

      const rows = inv.installments.map((inst: any) => [
        inst.installNo === 0 ? "Advance" : `#${inst.installNo}`,
        new Date(inst.dueDate).toLocaleDateString("en-GB"),
        `Rs. ${inst.amount.toLocaleString()}`,
        inst.status,
        inst.paidDate ? new Date(inst.paidDate).toLocaleDateString("en-GB") : "-",
        inst.receiptNumber || "-",
      ]);

      autoTable(doc, {
        startY,
        head: [["Install#", "Due Date", "Amount", "Status", "Paid Date", "Receipt#"]],
        body: rows,
        styles: { fontSize: 8 },
        margin: { left: 14 },
      });

      startY = (doc as any).lastAutoTable.finalY + 10;
    });

    doc.save(`Ledger_${selectedCustomer.name}_${Date.now()}.pdf`);
  };

  // 📊 EXCEL EXPORT
  const handleExportExcel = () => {
    if (!selectedCustomer || !summary) return;

    const rows: any[] = [];

    invoices.forEach((inv: any) => {
      inv.installments.forEach((inst: any) => {
        rows.push({
          "Invoice#": inv.invoiceNumber,
          "Sale Price": inv.salePrice,
          "Invoice Status": inv.status,
          "Install#": inst.installNo === 0 ? "Advance" : inst.installNo,
          "Due Date": new Date(inst.dueDate).toLocaleDateString("en-GB"),
          "Amount": inst.amount,
          "Installment Status": inst.status,
          "Paid Date": inst.paidDate ? new Date(inst.paidDate).toLocaleDateString("en-GB") : "",
          "Receipt#": inst.receiptNumber || "",
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");
    XLSX.writeFile(workbook, `Ledger_${selectedCustomer.name}_${Date.now()}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-2">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-800 p-3 rounded-md border border-slate-800">
          <div>
            <h1 className="text-xl font-bold">Customer Ledger Report</h1>
            <p className="text-xs text-slate-400">Customer ki saari invoices aur payment history</p>
          </div>

          {selectedCustomer && (
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

        {/* Search Customer */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Customer naam, CNIC ya mobile search karein..."
            value={customerSearch}
            onFocus={() => setShowDropdown(true)}
            onChange={(e) => {
              setCustomerSearch(e.target.value);
              setShowDropdown(true);
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
          />
          {showDropdown && customerSearch && (
            <div className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-30 divide-y divide-slate-700">
              {filteredCustomers.length === 0 ? (
                <div className="p-3 text-xs text-slate-500 text-center">Koi customer nahi mila</div>
              ) : (
                filteredCustomers.map((c: any) => (
                  <div
                    key={c._id}
                    onClick={() => {
                      setCustomerSearch(c.name);
                      setShowDropdown(false);
                      fetchLedger(c._id);
                    }}
                    className="p-2.5 text-xs cursor-pointer hover:bg-indigo-600 hover:text-white transition flex justify-between text-slate-300"
                  >
                    <span className="font-medium">{c.name}</span>
                    <span className="text-slate-400 font-mono">{c.mobile}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-10 text-sm text-slate-400">Ledger load ho raha hai...</div>
        )}

        {!loading && selectedCustomer && summary && (
          <>
            {/* Customer Info Card */}
            <div className="bg-slate-800 border border-slate-800 rounded-md p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-indigo-400" /> <span className="font-bold">{selectedCustomer.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Phone className="w-4 h-4 text-emerald-400" /> {selectedCustomer.mobile}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <CreditCard className="w-4 h-4 text-indigo-400" /> {selectedCustomer.cnic}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-red-400" /> {selectedCustomer.address}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-800 border border-slate-800 rounded-md p-3">
                <p className="text-[10px] text-slate-500 uppercase">Total Invoices</p>
                <p className="text-lg font-bold text-slate-100">{summary.totalInvoices}</p>
              </div>
              <div className="bg-slate-800 border border-slate-800 rounded-md p-3">
                <p className="text-[10px] text-slate-500 uppercase">Total Sale Value</p>
                <p className="text-lg font-bold text-slate-100">Rs. {summary.totalSaleValue.toLocaleString()}</p>
              </div>
              <div className="bg-slate-800 border border-slate-800 rounded-md p-3">
                <p className="text-[10px] text-slate-500 uppercase">Total Paid</p>
                <p className="text-lg font-bold text-emerald-400">Rs. {summary.totalPaid.toLocaleString()}</p>
              </div>
              <div className="bg-slate-800 border border-slate-800 rounded-md p-3">
                <p className="text-[10px] text-slate-500 uppercase">Total Due</p>
                <p className="text-lg font-bold text-amber-400">Rs. {summary.totalDue.toLocaleString()}</p>
              </div>
            </div>

            {/* Invoices + Installments List */}
            <div className="space-y-4">
              {invoices.map((inv: any) => (
                <div key={inv._id} className="bg-slate-800 border border-slate-800 rounded-md overflow-hidden">
                  <div className="flex justify-between items-center p-3 bg-slate-900 border-b border-slate-800">
                    <span className="text-sm font-bold text-indigo-400">{inv.invoiceNumber}</span>
                    <span className="text-xs text-slate-400">
                      Sale: Rs. {inv.salePrice.toLocaleString()} | Due: Rs. {inv.dueAmount.toLocaleString()} | {inv.status}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-slate-500 uppercase border-b border-slate-800">
                          <th className="p-2 text-left">Install#</th>
                          <th className="p-2 text-left">Due Date</th>
                          <th className="p-2 text-left">Amount</th>
                          <th className="p-2 text-left">Status</th>
                          <th className="p-2 text-left">Paid Date</th>
                          <th className="p-2 text-left">Receipt#</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {inv.installments.map((inst: any) => (
                          <tr key={inst._id}>
                            <td className="p-2">{inst.installNo === 0 ? "Advance" : `#${inst.installNo}`}</td>
                            <td className="p-2">{new Date(inst.dueDate).toLocaleDateString("en-GB")}</td>
                            <td className="p-2">Rs. {inst.amount.toLocaleString()}</td>
                            <td className="p-2">{inst.status}</td>
                            <td className="p-2">{inst.paidDate ? new Date(inst.paidDate).toLocaleDateString("en-GB") : "-"}</td>
                            <td className="p-2 font-mono">{inst.receiptNumber || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && !selectedCustomer && (
          <div className="text-center py-16 text-sm text-slate-500">
            Customer search karein ya kisi customer profile se "View Ledger" pe click karein.
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerLedgerPage() {
  return (
    <Suspense fallback={<div className="p-4 text-slate-400">Loading...</div>}>
      <CustomerLedgerContent />
    </Suspense>
  );
}