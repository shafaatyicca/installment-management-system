"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  FilePlus,
  X,
  Calculator,
  User,
  Box,
  Search,
  DollarSign,
  Percent,
} from "lucide-react";
// 🟢 Receipt Print component
import ReceiptPrint from "./ReceiptPrint";

interface AddInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddInvoiceModal({
  isOpen,
  onClose,
  onSuccess,
}: AddInvoiceModalProps) {
  const [loading, setLoading] = useState(false);

  // Data Lists for Dropdowns
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // Sale Type Mode: 'Installment' or 'Cash'
  const [saleMode, setSaleMode] = useState<"Installment" | "Cash">(
    "Installment",
  );

  // Installment Type Mode
  const [calcMode, setCalcMode] = useState<"byMonths" | "byAmount">("byMonths");

  // Search & Custom Dropdown States
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerId, setCustomerId] = useState("");

  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Multiple products manage karne ke liye array state
  const [selectedCartItems, setSelectedCartItems] = useState<any[]>([]);

  // Form Inputs
  const [salePrice, setSalePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [fixedMonthlyAmount, setFixedMonthlyAmount] = useState("");

  // Live Auto Calculation States
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [finalMonthlyInstallment, setFinalMonthlyInstallment] = useState(0);
  const [finalDurationMonths, setFinalDurationMonths] = useState(0);

  // Cart ka total cost track karne ke liye alag state
  const [cartTotalCost, setCartTotalCost] = useState(0);

  // Invoice generation par foran advance raseed kholne ke liye states
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Click Outside Dropdowns Handler Refs
  const customerRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);

  // Load Customers & Products
  useEffect(() => {
    if (isOpen) {
      fetch("/api/customers")
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success) setCustomers(resData.data);
        });

      fetch("/api/products")
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success) setProducts(resData.data);
        });
    }
  }, [isOpen]);

  // Click Outside logic to close custom dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        customerRef.current &&
        !customerRef.current.contains(event.target as Node)
      ) {
        setShowCustomerDropdown(false);
      }
      if (
        productRef.current &&
        !productRef.current.contains(event.target as Node)
      ) {
        setShowProductDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Saare selected products ka total dynamic plus karne ke liye effect
  useEffect(() => {
    const total = selectedCartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    setCartTotalCost(total);
  }, [selectedCartItems]);

  // 🔥 LIVE AUTO CALCULATION LOGIC
  useEffect(() => {
    const sPrice = Number(salePrice || 0);

    if (saleMode === "Cash") {
      setRemainingAmount(0);
      setFinalMonthlyInstallment(0);
      setFinalDurationMonths(0);
      return;
    }

    const dPayment = Number(downPayment || 0);
    const remaining = sPrice - dPayment;
    setRemainingAmount(remaining >= 0 ? remaining : 0);

    if (remaining > 0) {
      if (calcMode === "byMonths") {
        const months = Number(durationMonths || 0);
        setFinalDurationMonths(months);
        setFinalMonthlyInstallment(
          months > 0 ? Math.round(remaining / months) : 0,
        );
      } else {
        const amountPerMonth = Number(fixedMonthlyAmount || 0);
        setFinalMonthlyInstallment(amountPerMonth);
        setFinalDurationMonths(
          amountPerMonth > 0 ? Math.ceil(remaining / amountPerMonth) : 0,
        );
      }
    } else {
      setFinalMonthlyInstallment(0);
      setFinalDurationMonths(0);
    }
  }, [
    salePrice,
    downPayment,
    durationMonths,
    fixedMonthlyAmount,
    saleMode,
    calcMode,
  ]);

  if (!isOpen && !isReceiptOpen) return null;

  // Filter Functions for Searches
  const filteredCustomers = customers.filter(
    (c: any) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.phone || c.mobile || "").includes(customerSearch),
  );

  const filteredProducts = products.filter(
    (p: any) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.brand || "").toLowerCase().includes(productSearch.toLowerCase()),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId || selectedCartItems.length === 0 || !salePrice) {
      toast.error(
        "Customer, kam az kam 1 Product aur Sale Price enter karna lazmi hai!",
      );
      return;
    }

    if (saleMode === "Installment" && finalDurationMonths <= 0) {
      toast.error("Installment plan ki duration ya amount sahi enter karein!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customerId,
        products: selectedCartItems.map(item => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price
        })),
        salePrice: Number(salePrice),
        saleType: saleMode,
        downPayment: saleMode === "Cash" ? 0 : Number(downPayment || 0),
        durationMonths: saleMode === "Cash" ? 0 : Number(finalDurationMonths),
        monthlyInstallment:
          saleMode === "Cash" ? 0 : Number(finalMonthlyInstallment),
      };

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (resData.success) {
        toast.success(
          saleMode === "Cash"
            ? "Cash Invoice successfully generated!"
            : "Installment Invoice successfully generated!",
        );

        // 🟢 AGAR BACKEND NE ADVANCE RASEED BHEJI HAI TO POPUP OPEN KAREIN
        if (resData.advanceReceipt) {
  const selectedCustomer: any = customers.find((c: any) => c._id === customerId);
  
  setReceiptData({
    receiptNumber: resData.advanceReceipt.receiptNumber,
    invoiceNumber: resData.data?.invoiceNumber || "",
    customerName: selectedCustomer ? selectedCustomer.name : "Customer Record",
    customerMobile: selectedCustomer ? (selectedCustomer.phone || selectedCustomer.mobile || "") : "",
    amountReceived: resData.advanceReceipt.amountReceived,
    remainingBalance: resData.advanceReceipt.remainingBalance,
    installNo: 0,
    durationMonths: saleMode === "Cash" ? 0 : finalDurationMonths,
    products: selectedCartItems.map((item) => ({
      name: item.name,
      brand: item.brand || "",
    })),
    receivingDate: resData.advanceReceipt.paidDate,
  });
  setIsReceiptOpen(true);
}

        // Reset Input Fields
        setCustomerId("");
        setCustomerSearch("");
        setSelectedCartItems([]);
        setProductSearch("");
        setSalePrice("");
        setDownPayment("");
        setDurationMonths("");
        setFixedMonthlyAmount("");
        setSaleMode("Installment");
        
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(resData.message || "Invoice banane mein masla hua");
      }
    } catch (error) {
      toast.error("Network problem, dubara koshish karein.");
    } finally {
      setLoading(false);
    }
  };

  const handleNumberInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
    }
  };

  return (
    <>
      {/* 1. SELLING FORM MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
          <style jsx global>{`
            input[type="number"]::-webkit-outer-spin-button,
            input[type="number"]::-webkit-inner-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
            input[type="number"] {
              -moz-appearance: textfield;
            }
          `}</style>

          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="relative w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-md shadow-2xl overflow-y-auto max-h-[90vh] z-10 text-slate-100 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-2 border-b border-slate-700/60">
              <h2 className="text-base font-bold flex items-center gap-2 text-indigo-400">
                <FilePlus className="w-5 h-5" /> Deal Booking & Invoice Center
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Area */}
            <form onSubmit={handleSubmit} className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-700/40">
                <button
                  type="button"
                  onClick={() => setSaleMode("Installment")}
                  className={`py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    saleMode === "Installment"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" /> Installment Sale
                </button>
                <button
                  type="button"
                  onClick={() => setSaleMode("Cash")}
                  className={`py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    saleMode === "Cash"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" /> Full Cash Sale
                </button>
              </div>

              {/* 1. Searchable Customer Dropdown */}
              <div ref={customerRef} className="relative">
                <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-400" /> Customer Search & Select*
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Type customer name or number..."
                    value={customerSearch}
                    onFocus={() => setShowCustomerDropdown(true)}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                {showCustomerDropdown && (
                  <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-30 divide-y divide-slate-800 scrollbar-thin scrollbar-thumb-slate-700">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-2.5 text-xs text-slate-500 text-center">
                        Koi customer nahi mila
                      </div>
                    ) : (
                      filteredCustomers.map((c: any) => (
                        <div
                          key={c._id}
                          onClick={() => {
                            setCustomerId(c._id);
                            setCustomerSearch(`${c.name} (${c.phone || c.mobile})`);
                            setShowCustomerDropdown(false);
                          }}
                          className={`p-2.5 text-xs cursor-pointer hover:bg-indigo-600 hover:text-white transition flex justify-between ${customerId === c._id ? "bg-indigo-500/20 text-indigo-400" : "text-slate-300"}`}
                        >
                          <span className="font-medium">{c.name}</span>
                          <span className="font-mono text-slate-400 hover:text-white">
                            {c.phone || c.mobile}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* 2. Searchable Product Dropdown */}
              <div ref={productRef} className="relative">
                <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                  <Box className="w-3.5 h-3.5 text-indigo-400" /> Product Search & Select*
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Type product name or brand..."
                    value={productSearch}
                    onFocus={() => setShowProductDropdown(true)}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductDropdown(true);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                {showProductDropdown && (
                  <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-30 divide-y divide-slate-800 scrollbar-thin scrollbar-thumb-slate-700">
                    {filteredProducts.length === 0 ? (
                      <div className="p-2.5 text-xs text-slate-500 text-center">
                        Koi product nahi mila
                      </div>
                    ) : (
                      filteredProducts.map((p: any) => (
                        <div
                          key={p._id}
                          onClick={() => {
                            if (p.stock >= 1) {
                              setSelectedCartItems((prev) => {
                                const exists = prev.find(
                                  (item) => item.product === p._id,
                                );
                                if (exists) {
                                  if (exists.quantity >= p.stock) {
                                    toast.error("Stock mein is se zyada maal nahi hai!");
                                    return prev;
                                  }
                                  return prev.map((item) =>
                                    item.product === p._id
                                      ? { ...item, quantity: item.quantity + 1 }
                                      : item,
                                  );
                                }
                                return [
                                  ...prev,
                                  {
                                    product: p._id,
                                    name: p.name,
                                    brand: p.brand || "",
                                    price: p.costPrice,
                                    quantity: 1,
                                  },
                                ];
                              });
                              setProductSearch("");
                              setShowProductDropdown(false);
                            }
                          }}
                          className={`p-2.5 text-xs flex justify-between items-center transition ${p.stock < 1 ? "opacity-40 cursor-not-allowed bg-slate-950/20" : "cursor-pointer hover:bg-indigo-600 hover:text-white"} ${selectedCartItems.some((i) => i.product === p._id) ? "bg-indigo-500/20 text-indigo-400" : "text-slate-300"}`}
                        >
                          <div>
                            <span className="font-medium">{p.name}</span>
                            {p.brand && (
                              <span className="ml-1 text-slate-400 text-[10px]">
                                ({p.brand})
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[11px]">
                            {p.stock < 1
                              ? "Out of Stock"
                              : `Stock: ${p.stock} | Rs. ${p.costPrice.toLocaleString()}`}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Selected Products Cart UI Preview */}
              {selectedCartItems.length > 0 && (
                <div className="bg-slate-900/50 border border-slate-700/40 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                      Selected Products
                    </p>
                    <p className="text-xs font-semibold text-slate-300">
                      Total System Cost:{" "}
                      <span className="text-emerald-400 font-mono font-bold ml-1">
                        Rs. {cartTotalCost.toLocaleString()}
                      </span>
                    </p>
                  </div>
                  <div className="space-y-2 max-h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                    {selectedCartItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-slate-950/40 border border-slate-800 p-2.5 rounded-lg text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-200">
                            {item.name} {item.brand ? `(${item.brand})` : ""}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Rate: Rs. {item.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  setSelectedCartItems((prev) =>
                                    prev.map((it, i) =>
                                      i === index
                                        ? { ...it, quantity: it.quantity - 1 }
                                        : it,
                                    ),
                                  );
                                }
                              }}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 font-mono font-medium text-slate-200">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const originalProduct: any = products.find(
                                  (p: any) => p._id === item.product,
                                );
                                if (
                                  originalProduct &&
                                  item.quantity >= originalProduct.stock
                                ) {
                                  toast.error("Stock limits full ho chuki hain!");
                                  return;
                                }
                                setSelectedCartItems((prev) =>
                                  prev.map((it, i) =>
                                    i === index
                                      ? { ...it, quantity: it.quantity + 1 }
                                      : it,
                                  ),
                                );
                              }}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-mono text-slate-400 font-medium w-24 text-right">
                            Rs. {(item.price * item.quantity).toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCartItems((prev) =>
                                prev.filter((_, i) => i !== index),
                              );
                            }}
                            className="text-red-400 hover:text-red-300 p-1 transition rounded-md hover:bg-red-500/10 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Fields Row */}
              <div
                className={`grid grid-cols-1 gap-3 ${saleMode === "Installment" ? "sm:grid-cols-3" : "sm:grid-cols-1"}`}
              >
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Sale Price *
                  </label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    onKeyDown={handleNumberInputKeyDown}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    placeholder={
                      cartTotalCost > 0
                        ? `Cost Total: ${cartTotalCost}`
                        : "Enter final deal price..."
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {saleMode === "Installment" && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Down Payment (Advance) *
                      </label>
                      <input
                        type="number"
                        value={downPayment}
                        onChange={(e) => setDownPayment(e.target.value)}
                        onKeyDown={handleNumberInputKeyDown}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Calculation Method
                      </label>
                      <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
                        <button
                          type="button"
                          onClick={() => {
                            setCalcMode("byMonths");
                            setFixedMonthlyAmount("");
                          }}
                          className={`py-1.5 text-[11px] font-medium rounded-lg transition ${calcMode === "byMonths" ? "bg-indigo-600 text-white" : "text-slate-400"}`}
                        >
                          By Months
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCalcMode("byAmount");
                            setDurationMonths("");
                          }}
                          className={`py-1.5 text-[11px] font-medium rounded-lg transition ${calcMode === "byAmount" ? "bg-indigo-600 text-white" : "text-slate-400"}`}
                        >
                          By Amount
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Dynamic Inputs Based on Calculation Method */}
              {saleMode === "Installment" && (
                <div className="pt-1">
                  {calcMode === "byMonths" ? (
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Plan Duration (Months) *
                      </label>
                      <input
                        type="number"
                        value={durationMonths}
                        onChange={(e) => setDurationMonths(e.target.value)}
                        onKeyDown={handleNumberInputKeyDown}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        placeholder="e.g., 12"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Fixed Monthly Installment Amount (Rs.) *
                      </label>
                      <input
                        type="number"
                        value={fixedMonthlyAmount}
                        onChange={(e) => setFixedMonthlyAmount(e.target.value)}
                        onKeyDown={handleNumberInputKeyDown}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        placeholder="e.g., 3000"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* LIVE AUTO CALCULATION PANEL BOX */}
              <div className="bg-slate-900/60 border border-indigo-500/20 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                  <Calculator className="w-3.5 h-3.5" /> Live Deal Target Breakup
                </h4>

                {saleMode === "Cash" ? (
                  <p className="text-sm font-semibold text-emerald-400">
                    Full Cash Sale Deal!
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-950/30 p-2 rounded-lg border border-slate-800">
                        <p className="text-slate-500 text-[10px] uppercase font-bold">
                          Remaining Bal
                        </p>
                        <p className="text-sm font-bold text-amber-400 mt-0.5">
                          Rs. {remainingAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-slate-950/30 p-2 rounded-lg border border-slate-800">
                        <p className="text-slate-500 text-[10px] uppercase font-bold">
                          Monthly Kist
                        </p>
                        <p className="text-sm font-bold text-emerald-400 mt-0.5">
                          Rs. {finalMonthlyInstallment.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-slate-950/30 p-2 rounded-lg border border-slate-800">
                        <p className="text-slate-500 text-[10px] uppercase font-bold">
                          Total Months
                        </p>
                        <p className="text-sm font-bold text-indigo-400 mt-0.5">
                          {finalDurationMonths} Months
                        </p>
                      </div>
                    </div>

                    {calcMode === "byAmount" &&
                      finalMonthlyInstallment > 0 &&
                      remainingAmount % finalMonthlyInstallment !== 0 && (
                        <p className="text-[11px] text-amber-500 text-center font-medium pt-1 border-t border-slate-800/60 mt-2">
                          * Note: Last month kist will automatically adjust to Rs.{" "}
                          {(
                            remainingAmount -
                            finalMonthlyInstallment * (finalDurationMonths - 1)
                          ).toLocaleString()}
                        </p>
                      )}

                    {calcMode === "byMonths" &&
                      finalDurationMonths > 0 &&
                      finalMonthlyInstallment > 0 &&
                      remainingAmount -
                        finalMonthlyInstallment * finalDurationMonths !==
                        0 && (
                        <p className="text-[11px] text-indigo-400 text-center font-medium pt-1 border-t border-slate-800/60 mt-2">
                          * Note: Last month kist will automatically adjust to Rs.{" "}
                          {(
                            remainingAmount -
                            finalMonthlyInstallment * (finalDurationMonths - 1)
                          ).toLocaleString()}
                        </p>
                      )}
                  </>
                )}
              </div>

              {/* Actions Footer Buttons */}
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-700/60">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                >
                  {loading ? "Generating Deal..." : "Generate Invoice & Lock Deal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🟢 2. THERMAL PRINT POPUP (Jab dynamic advance receipt data backend se aye) */}
      {isReceiptOpen && receiptData && (
        <ReceiptPrint
          isOpen={isReceiptOpen}
          onClose={() => {
            setIsReceiptOpen(false);
            setReceiptData(null);
          }}
          data={receiptData}
        />
      )}
    </>
  );
}