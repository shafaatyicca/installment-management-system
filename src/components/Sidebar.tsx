"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Users, Boxes, FileText, LayoutDashboard, Store, Menu, X, ScrollText, HandCoins, CalendarClock } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // Mobile toggle state

  const menuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Manage Customers", href: "/customers", icon: Users },
    { name: "Product Stock", href: "/products", icon: Boxes },
    { name: "Installment Invoices", href: "/invoices", icon: FileText },
    { name: "Customer Ledger", href: "/customer-ledger", icon: ScrollText},
    { name: "Collections", href: "/collection", icon: HandCoins},
    { name: "Overdue Report", href: "/due", icon: CalendarClock},

  ];

  return (
    <>
      {/* 📱 MOBILE HEADER BAR (Sirf mobile screens pr dikhega) */}
      <div className="md:hidden w-full bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between fixed top-0 left-0 z-50 text-slate-100">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-indigo-400" />
          <span className="font-bold text-sm tracking-wide">Installment Pro</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-1 rounded-lg bg-slate-700/50 text-slate-100 focus:outline-none"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* 👥 MOBILE BACKDROP OVERLAY (Sidebar khulne pr background blur krega) */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 🏛️ MAIN SIDEBAR DRAWER (Desktop pr fixed, Mobile pr toggle responsive) */}
      <aside className={`w-56 bg-slate-800 border-r border-slate-700 text-slate-100 flex flex-col h-screen fixed left-0 top-0 z-50 md:z-40 transform transition-transform duration-300 md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        
        {/* Brand Logo Header */}
        <div className="p-2 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className=" text-sm text-white">Installment Pro</h2>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Management System</span>
            </div>
          </div>
          {/* Mobile close button inside sidebar */}
          <button onClick={() => setIsOpen(false)} className="md:hidden p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 p-2 rounded-md text-sm transition-all group ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                    : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-100"
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                  isActive ? "text-white" : "text-indigo-400 group-hover:text-indigo-300"
                }`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Admin Summary */}
        <div className="p-2 border-t border-slate-700 bg-slate-900/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-indigo-400 border border-slate-600">
            S
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200">Shafaat Admin</p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online Ledger
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}