"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "⌂",
  },
  {
    name: "AI Assistant",
    href: "/chat",
    icon: "✦",
  },
  {
    name: "Documents",
    href: "/documents",
    icon: "▣",
  },
  {
    name: "Research",
    href: "/research",
    icon: "◎",
  },
  {
    name: "History",
    href: "/history",
    icon: "◷",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: "▥",
  },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  open = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, logout } = useAuth();

  const [loggingOut, setLoggingOut] =
    useState(false);

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    try {
      setLoggingOut(true);

      await logout();
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    } finally {
      setLoggingOut(false);

      onClose?.();

      /*
        Redirect regardless of the outcome: the local session is cleared
        either way, so leaving the user on a protected page would be wrong.
      */
      router.push("/login");
    }
  }

  return (
    <>
      {/* Backdrop, mobile only */}
      {open && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-dvh w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:z-40 lg:translate-x-0 ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-4 sm:px-6">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-lg font-bold text-white">
              N
            </div>

            <span className="text-xl font-bold text-gray-900">
              NexusAI
            </span>
          </Link>

          {/* Close, mobile only */}
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 lg:hidden"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-6">

          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Workspace
          </p>

          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="w-5 text-center text-base">
                  {item.icon}
                </span>

                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="shrink-0 border-t border-gray-200 p-4">

          {user && (
            <div className="mb-3 flex items-center gap-3 rounded-lg p-2">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">
                  {user.name}
                </p>

                <p className="truncate text-xs text-gray-500">
                  {user.email}
                </p>
              </div>

            </div>
          )}

          <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
          >
            <span className="w-5 text-center">⚙</span>
            Settings
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
          >
            <span className="w-5 text-center">⏻</span>
            {loggingOut
              ? "Signing out..."
              : "Sign out"}
          </button>

        </div>
      </aside>
    </>
  );
}
