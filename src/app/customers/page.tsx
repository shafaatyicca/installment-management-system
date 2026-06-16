"use client";

import { useState, useEffect } from "react";
import { UserPlus, Users } from "lucide-react";
import { Toaster } from "react-hot-toast";
import CustomerModal from "@/components/AddCustomerModal";
import CustomerTable from "@/components/CustomerTable";

export default function CustomersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 1. Yeh state zaroori thi edit mode ke liye
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/customers");
      const resData = await response.json();
      if (resData.success) {
        setCustomers(resData.data);
      }
    } catch (error) {
      console.error("Customers load nahi ho sakay", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // 2. Yeh function chalega jab table se Edit click hoga
  const handleEditOpen = (customer: any) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  // 3. Modal close hote hi state saaf karne ke liye
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <Toaster position="top-center" />

      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Customer Directory</h1>
              <p className="text-xs text-slate-400 mt-0.5">Apne saare customers ka data manage karein</p>
            </div>
          </div>

          <button 
            onClick={() => { setSelectedCustomer(null); setIsModalOpen(true); }} 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition text-sm w-full sm:w-auto justify-center"
          >
            <UserPlus className="w-4 h-4" /> Naya Customer Add Karein
          </button>
        </div>

        {/* handleEditOpen function pass kiya */}
        <CustomerTable 
          customers={customers} 
          loading={loading} 
          onEditClick={handleEditOpen} 
          onSuccess={fetchCustomers}  
        />
      </div>

      <CustomerModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        onSuccess={fetchCustomers}
        customerData={selectedCustomer}
      />
    </div>
  );
}