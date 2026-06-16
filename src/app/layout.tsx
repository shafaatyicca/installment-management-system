import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar"; // <-- Sidebar import karein

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Installment Sale Management System",
  description: "Manage shop inventory and installments ledger",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-slate-900">
      <body className={`${inter.className} min-h-screen text-slate-100 flex`}>
        
        {/* 1. Global Fixed Sidebar Layout */}
        <Sidebar />

        {/* 2. Dynamic Content Area with Left Margin for Sidebar Space */}
        <main className="flex-1 min-h-screen md:pl-56 pt-16 md:pt-0 bg-slate-900 overflow-x-hidden">
          <div className="max-w-[1400px] mx-auto w-full"> {/* <-- Is se screen boht zyada khilegi nahi */}
            {children}
          </div>
        </main>

      </body>
    </html>
  );
}