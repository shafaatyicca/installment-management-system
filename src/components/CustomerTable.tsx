"use client";

import { useState } from "react";
import { Search, Phone, CreditCard, MapPin, UserCheck, Eye, Edit2, Trash2, Edit } from "lucide-react"; 
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
      <div className="w-full bg-slate-800/30 border border-slate-800 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center gap-3">
        <div className="w-7 h-7 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs md:text-sm text-slate-400">Customers ka data load ho raha hai...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 w-full">
      {/* Search Bar Input Adjustment */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Naam, CNIC ya Mobile search karein..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-500"
        />
      </div>

      {/* 📱 1. MOBILE RESPONSIVE CARDS VIEW (md:hidden - Sirf mobile pr dikhega) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 bg-slate-800/20 rounded-xl border border-slate-800">
            Koi customer nahi mila.
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer._id} className="bg-slate-800/50 border border-slate-800/80 p-4 rounded-xl space-y-3 shadow-md">
              {/* Header Title & Guarantor Badge */}
              <div className="flex justify-between items-start gap-2">
                <h3 className="text-sm font-bold text-slate-100 tracking-tight">{customer.name}</h3>
                {customer.guarantorName && (
                  <span className="flex items-center gap-0.5 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/10 shrink-0">
                    <UserCheck className="w-2.5 h-2.5" /> {customer.guarantorName}
                  </span>
                )}
              </div>

              {/* CNIC, Mobile & Address Info Area */}
              <div className="space-y-1.5 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>CNIC: {customer.cnic}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Mob: {customer.mobile}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{customer.address}</span>
                </div>
              </div>

              {/* Action Buttons: Slim & Iconized for Mobile fingers */}
              <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-700/40">
                <button 
                  onClick={() => onEditClick(customer)}
                  className="flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1.5 rounded-lg border border-amber-500/10 transition"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(customer._id)}
                  className="flex items-center gap-1 text-[11px] font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1.5 rounded-lg border border-red-500/10 transition"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
                <Link 
                  href={`/customers/${customer._id}`}
                  className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1.5 rounded-lg border border-indigo-500/10 transition"
                >
                  <Eye className="w-3 h-3" /> Profile
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🖥️ 2. DESKTOP VIEW TABLE (md:block - Mobile pr hide ho jayega) */}
      <div className="hidden md:block w-full bg-slate-800/40 border border-slate-800 backdrop-blur-md rounded-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/60 bg-slate-800/60 text-slate-400 text-xs uppercase">
                <th className="p-2">#</th>
                <th className="p-2">Customer Name</th>
                <th className="p-2">CNIC / Mobile</th>
                <th className="p-2">Address</th>
                <th className="p-2">Guarantor</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    Koi customer nahi mila.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, index) => (
                  <tr key={customer._id} className="hover:bg-slate-700/20 transition duration-150">
                    <td className="p-2 font-medium text-slate-400">{index + 1}</td>
                    <td className="p-2 text-xs text-slate-100">
                      {customer.name}
                    </td>
                    <td className="p-2 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <CreditCard className="w-3.5 h-3.5 text-indigo-400" /> {customer.cnic}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" /> {customer.mobile}
                      </div>
                    </td>
                    <td className="p-2 text-slate-400 max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className=" text-xs">{customer.address}</span>
                      </div>
                    </td>
                    <td className="p-2 text-slate-400 text-xs">
                      {customer.guarantorName ? (
                        <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md w-fit border border-amber-500/20">
                          <UserCheck className="w-3 h-3" /> {customer.guarantorName}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="p-2 text-right flex justify-end gap-2">
                      <Link 
                        href={`/customers/${customer._id}`}
                        className="text-xs cursor-pointer text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1.5 rounded-md border border-indigo-500/20 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button 
                        onClick={() => onEditClick(customer)}
                        className="text-xs cursor-pointer text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1.5 rounded-md border border-amber-500/20 transition"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDelete(customer._id)}
                        className="text-xs cursor-pointer text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2 py-1.5 rounded-md border border-red-500/20 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      
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