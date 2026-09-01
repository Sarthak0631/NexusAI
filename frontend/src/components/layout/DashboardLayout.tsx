"use client";

import { ReactNode } from "react";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">

      <Sidebar />

      <Navbar />

      <main className="ml-64 pt-16">
        {children}
      </main>

    </div>
  );
}