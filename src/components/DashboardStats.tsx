"use client";

import React from "react";
import { 
  Users, 
  Package, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  Calendar,
  UserCheck
} from "lucide-react";

// Mock data (Jab API banayenge toh yeh dynamic ho jayega)
const statsData = [
  {
    title: "Total Customers",
    value: "1,240",
    icon: Users,
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  },
  {
    title: "Total Products",
    value: "85",
    icon: Package,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    title: "Active Installments",
    value: "312",
    icon: TrendingUp,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    title: "Total Receivable",
    value: "Rs. 4,850,000",
    icon: DollarSign,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    title: "Overdue Amount",
    value: "Rs. 185,000",
    icon: AlertTriangle,
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  },
  {
    title: "Total Due Customers",
    value: "42",
    icon: UserCheck,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  {
    title: "Today Due",
    value: "Rs. 25,000",
    icon: Clock,
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
  {
    title: "Upcoming Due (This Month)",
    value: "Rs. 450,000",
    icon: Calendar,
    color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  },
];

export default function DashboardStats() {
  return (
    <div className="w-full space-y-4 p-2 sm:p-4 bg-slate-950 min-h-screen text-slate-100">
      
      {/* Header Section */}
      <div className="flex flex-col gap-1 border-b border-slate-800 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Business Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Real-time insights and installment system overview.
        </p>
      </div>

      {/* Main Stats Grid - Fully Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/60 transition-all duration-200 p-4 rounded-xl flex items-center justify-between shadow-lg group relative overflow-hidden"
            >
              {/* Card Content */}
              <div className="space-y-1 z-10 flex-1 min-w-0">
                <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
                  {stat.title}
                </p>
                <h3 className="text-lg sm:text-xl font-bold font-mono text-slate-100 truncate">
                  {stat.value}
                </h3>
              </div>

              {/* Icon Container */}
              <div className={`p-2.5 rounded-xl border shrink-0 ${stat.color} transition-transform duration-200 group-hover:scale-105`}>
                <Icon className="w-5 h-5 sm:w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}