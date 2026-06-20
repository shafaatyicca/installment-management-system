"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, 
  Package, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  Calendar,
  UserCheck,
  RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";

interface DashboardData {
  totalCustomers: number;
  totalProducts: number;
  activeInstallments: number;
  totalReceivable: number;
  overdueAmount: number;
  totalDueCustomers: number;
  todayDue: number;
  totalReceived: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/dashboard");
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.message || "Failed to load dashboard data");
      }
    } catch (error) {
      toast.error("Network error while fetching dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const cardsConfig = [
    { title: "Total Customers", value: data?.totalCustomers, icon: Users, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", isCurrency: false },
    { title: "Total Products", value: data?.totalProducts, icon: Package, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", isCurrency: false },
    { title: "Active Installments", value: data?.activeInstallments, icon: TrendingUp, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", isCurrency: false },
    { title: "Total Receivable", value: data?.totalReceivable, icon: DollarSign, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", isCurrency: true },
    { title: "Overdue Amount", value: data?.overdueAmount, icon: AlertTriangle, color: "text-rose-400 bg-rose-500/10 border-rose-500/20", isCurrency: true },
    { title: "Total Due Customers", value: data?.totalDueCustomers, icon: UserCheck, color: "text-purple-400 bg-purple-500/10 border-purple-500/20", isCurrency: false },
    { title: "Today Due", value: data?.todayDue, icon: Clock, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", isCurrency: true },
    { title: "Total Received", value: data?.totalReceived, icon: TrendingUp, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", isCurrency: true },
  ];

  return (
    // 🎨 Layout Ke Sath Seamless Matching Color (bg-slate-900)
    <div className="w-full space-y-5 p-4 sm:p-6 bg-slate-900 text-slate-100">
      
      {/* Header Row */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Business Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time insights and installment analytics.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="p-2 bg-slate-800 border border-slate-700/60 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-50 transition cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-slate-800/40 border border-slate-700/30 p-4 rounded-xl flex items-center justify-between animate-pulse">
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-slate-700 rounded w-2/3"></div>
                <div className="h-5 bg-slate-700 rounded w-1/2"></div>
              </div>
              <div className="w-10 h-10 bg-slate-700 rounded-xl"></div>
            </div>
          ))
        ) : (
          cardsConfig.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-200 p-4 rounded-xl flex items-center justify-between shadow-md group"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
                    {card.title}
                  </p>
                  <h3 className="text-lg sm:text-xl font-bold font-mono text-slate-100 truncate">
                    {card.isCurrency ? "Rs. " : ""}
                    {(card.value || 0).toLocaleString()}
                  </h3>
                </div>
                <div className={`p-2.5 rounded-xl border shrink-0 ${card.color} transition-transform duration-200 group-hover:scale-105`}>
                  <Icon className="w-5 h-5 sm:w-6 h-6" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}