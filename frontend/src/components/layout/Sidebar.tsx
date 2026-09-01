"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-200 bg-white">

      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-lg font-bold text-white">
            N
          </div>

          <span className="text-xl font-bold text-gray-900">
            NexusAI
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-6">

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
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-gray-100 text-gray-900"
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
      <div className="border-t border-gray-200 p-4">

        {user && (
          <div className="mb-3 flex items-center gap-3 rounded-lg p-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
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
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        >
          <span>⚙</span>
          Settings
        </Link>

      </div>
    </aside>
  );
}