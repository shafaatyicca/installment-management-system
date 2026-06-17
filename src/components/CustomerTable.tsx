"use client";

import { useState } from "react";
import { Search, Phone, CreditCard, MapPin, UserCheck, Eye, Trash2, Edit } from "lucide-react"; 
import Link from "next/link";
import toast from "react-hot-toast";

interface Customer {
  _id: string;
  name: string;
  cnic: string;
  mobile: string;
  address: string;
  guarantorName?: string;
}

interface CustomerTableProps {
  customers: Customer[];
  loading: boolean;
  onEditClick: (customer: Customer) => void; 
  onSuccess: () => void;
}

export default function CustomerTable({ customers, loading, onEditClick, onSuccess }: CustomerTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers.filter((customer) => {
    const search = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(search) ||
      customer.cnic.includes(search) ||
      customer.mobile.includes(search)
    );
  });
  
  const handleDelete = async (id: string) => {
    if (confirm("Kya aap waqai is customer ko delete karna chahte hain?")) {
      try {
        const response = await fetch(`/api/customers?id=${id}`, {
          method: "DELETE",
        });
        const data = await response.json();

        if (data.success) {
          toast.success("Customer delete ho gaya!");
          if (onSuccess) onSuccess();
        } else {
          toast.error(data.message || "Delete nahi ho saka");
        }
      } catch (error) {
        toast.error("Network ka masla hai.");
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center gap-3">
        <div className="w-7 h-7 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs md:text-sm text-slate-400">Customers ka data load ho raha hai...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 w-full">
      {/* 🔍 Search Bar Area */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Naam, CNIC ya Mobile search karein..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-500"
        />
      </div>

      {/* 📱 1. MOBILE RESPONSIVE CARDS VIEW (FIXED GPU RENDERING WITH PREMIUM FLAT STYLE) */}
      <div className="grid grid-cols-1 gap-3 md:hidden transform translate-z-0 will-change-transform">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 bg-slate-800 rounded-xl border border-slate-700">
            Koi customer nahi mila.
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer._id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl space-y-3 relative overflow-hidden">
              
              {/* Header Title & Rich Solid Guarantor Badge */}
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <h3 className="text-sm font-bold text-slate-100 tracking-tight">{customer.name}</h3>
                {customer.guarantorName && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-900 shrink-0 uppercase tracking-wider">
                    <UserCheck className="w-3 h-3" /> Zamin: {customer.guarantorName}
                  </span>
                )}
              </div>

              {/* Info Box with Dark Solid Contrast */}
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-700 space-y-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>CNIC: <strong className="text-slate-100 font-mono">{customer.cnic}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Mob: <strong className="text-slate-100 font-mono">{customer.mobile}</strong></span>
                </div>
                <div className="flex items-start gap-2 pt-1 border-t border-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2 text-slate-400">{customer.address}</span>
                </div>
              </div>

              {/* Action Buttons: Premium Solid Buttons for Touch Input */}
              <div className="flex justify-end gap-2 pt-1">
                <Link 
                  href={`/customers/${customer._id}`}
                  className="flex items-center gap-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition shadow-sm"
                >
                  <Eye className="w-3 h-3" /> Profile
                </Link>
                <button 
                  onClick={() => onEditClick(customer)}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-100 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg border border-slate-600 transition"
                >
                  <Edit className="w-3 h-3 text-amber-400" /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(customer._id)}
                  className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/80 hover:bg-rose-900 px-3 py-1.5 rounded-lg border border-rose-900 transition"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* 🖥️ 2. DESKTOP VIEW TABLE (Clean Solid Layout) */}
      <div className="hidden md:block w-full bg-slate-800 border border-slate-700 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900 text-slate-400 text-xs uppercase">
                <th className="p-2.5">#</th>
                <th className="p-2.5">Customer Name</th>
                <th className="p-2.5">CNIC / Mobile</th>
                <th className="p-2.5">Address</th>
                <th className="p-2.5">Guarantor</th>
                <th className="p-2.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 text-sm text-slate-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Koi customer nahi mila.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, index) => (
                  <tr key={customer._id} className="hover:bg-slate-700/40 transition duration-150">
                    <td className="p-2.5 font-medium text-slate-400">{index + 1}</td>
                    <td className="p-2.5 text-xs font-bold text-slate-100">{customer.name}</td>
                    <td className="p-2.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <CreditCard className="w-3.5 h-3.5 text-indigo-400" /> <span className="font-mono">{customer.cnic}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" /> <span className="font-mono">{customer.mobile}</span>
                      </div>
                    </td>
                    <td className="p-2.5 text-slate-400 max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="text-xs line-clamp-1">{customer.address}</span>
                      </div>
                    </td>
                    <td className="p-2.5 text-slate-400 text-xs">
                      {customer.guarantorName ? (
                        <span className="flex items-center gap-1 text-amber-400 bg-amber-950 px-2 py-1 rounded-md w-fit border border-amber-900 font-medium">
                          <UserCheck className="w-3 h-3" /> {customer.guarantorName}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="p-2.5 text-right pr-4">
                      <div className="inline-flex items-center gap-2">
                        <Link 
                          href={`/customers/${customer._id}`}
                          className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Profile
                        </Link>
                        <button 
                          onClick={() => onEditClick(customer)}
                          className="text-xs text-slate-200 bg-slate-700 hover:bg-slate-600 px-2.5 py-1.5 rounded-lg border border-slate-600 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5 text-amber-400" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(customer._id)}
                          className="text-xs text-rose-400 bg-slate-900 hover:bg-rose-950 px-2.5 py-1.5 rounded-lg border border-rose-900 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}