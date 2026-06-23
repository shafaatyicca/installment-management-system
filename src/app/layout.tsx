import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("bg-slate-900", "font-sans", geist.variable)}>
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