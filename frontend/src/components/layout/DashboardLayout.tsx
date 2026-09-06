"use client";

import { ReactNode, useState } from "react";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  /*
    On small screens the sidebar collapses into a drawer that slides in over
    the content. From `lg` upwards it is always visible and this state is
    ignored.
  */
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-gray-50">

      <Sidebar
        open={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <Navbar
        onMenuClick={() =>
          setSidebarOpen(true)
        }
      />

      <main className="pt-16 lg:ml-64">
        {children}
      </main>

    </div>
  );
}
