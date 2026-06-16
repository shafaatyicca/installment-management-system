"use client";

import { useState } from "react";
import { Search, Phone, CreditCard, MapPin, UserCheck } from "lucide-react"; 
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

// 1. Props interface mein onEditClick shamil kiya
interface CustomerTableProps {
  customers: Customer[];
  loading: boolean;
  onEditClick: (customer: Customer) => void; 
  onSuccess: () => void; // Table refresh karne ke liye
}

// 2. Arguments mein receive kiya
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
        if (onSuccess) onSuccess(); // Table refresh karne ke liye
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
      <div className="w-full bg-slate-800/30 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400">Customers ka data load ho raha hai...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
        <input
          type="text"
          placeholder="Customer ka Naam, CNIC ya Mobile search karein..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-500"
        />
      </div>

      <div className="w-full bg-slate-800/40 border border-slate-800 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/60 bg-slate-800/60 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <th className="py-4 px-6">Customer Name</th>
                <th className="py-4 px-6">CNIC / Mobile</th>
                <th className="py-4 px-6">Address</th>
                <th className="py-4 px-6">Guarantor</th>
                <th className="py-4 px-6 text-right">Actions</th>
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
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-slate-700/20 transition duration-150">
                    <td className="py-4 px-6 font-medium text-slate-100">
                      {customer.name}
                    </td>
                    <td className="py-4 px-6 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <CreditCard className="w-3.5 h-3.5 text-indigo-400" /> {customer.cnic}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" /> {customer.mobile}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-400 max-w-xs truncate">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="truncate">{customer.address}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-400 text-xs">
                      {customer.guarantorName ? (
                        <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md w-fit border border-amber-500/20">
                          <UserCheck className="w-3 h-3" /> {customer.guarantorName}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => onEditClick(customer)}
                        className="text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/20 transition"
                      >
                        Edit
                      </button>
                      <button 
                      onClick={() => handleDelete(customer._id)}
                      className="text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/20 transition ml-2"
                    >
                      Delete
                    </button>
                      
                      <Link 
                        href={`/customers/${customer._id}`}
                        className="text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition"
                      >
                        Profile
                      </Link>
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