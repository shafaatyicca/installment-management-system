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
  
  // Edit mode tracking state
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

  // Table se edit click hone ka handler
  const handleEditOpen = (customer: any) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  // Modal close handler
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  return (
    // 📱 Mobile par padding p-4 hogi aur bade screens par md:p-6 taake space zaya na ho
    <div className="min-h-screen bg-slate-900 text-slate-100 p-2 w-full max-w-full overflow-x-hidden">
      <Toaster position="top-center" />

      {/* Main Responsive Layout Wrapper */}
      <div className="max-w-6xl mx-auto space-y-2">
        
        {/* Top Header Card: Mobile par items center aur flex-col ho jayenge */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-slate-800/40 p-2 rounded-md border border-slate-800/80 backdrop-blur-md">
          
          {/* Left Side: Icon and Titles */}
          <div className="flex items-center gap-3">
            {/* Mobile par icon container thoda chota kiya taake tight lage */}
            <div className="p-2.5 md:p-3 bg-indigo-600/10 rounded-md text-indigo-400 border border-indigo-500/20 flex-shrink-0">
              <Users className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-md md:text-xl font-bold tracking-tight">Customer Directory</h1>
            </div>
          </div>

          {/* Right Side Button: Mobile par w-full (poori width) aur text center hoga */}
          <button 
            onClick={() => { setSelectedCustomer(null); setIsModalOpen(true); }} 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 md:px-5 py-2.5 md:py-3 rounded-xl shadow-lg shadow-indigo-600/10 transition-all text-xs md:text-sm w-full sm:w-auto justify-center active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4 flex-shrink-0" /> Add Customer
          </button>
        </div>

        {/* 📊 Responsive Table Wrapper (Horizontal Scroll handling table ke andar hoti hai) */}
        <div className="w-full overflow-hidden">
          <CustomerTable 
            customers={customers} 
            loading={loading} 
            onEditClick={handleEditOpen} 
            onSuccess={fetchCustomers}  
          />
        </div>
      </div>

      {/* Input / Edit Customer Popup Modal */}
      <CustomerModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        onSuccess={fetchCustomers}
        customerData={selectedCustomer}
      />
    </div>
  );
}