"use client";

import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="fixed left-64 right-0 top-0 z-30 h-16 border-b border-gray-200 bg-white">

      <div className="flex h-full items-center justify-between px-8">

        {/* Search */}
        <div className="relative w-80">
          <input
            type="text"
            placeholder="Search your knowledge..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 pl-10 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
          />

          <span className="absolute left-3 top-2.5 text-gray-400">
            ⌕
          </span>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-5">

          {/* Notifications */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100"
            aria-label="Notifications"
          >
            ♢
          </button>

          {/* User */}
          {user && (
            <div className="flex items-center gap-3">

              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user.name}
                </p>

                <p className="text-xs text-gray-500">
                  {user.role}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}