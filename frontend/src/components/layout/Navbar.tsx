"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({
  onMenuClick,
}: NavbarProps) {
  const router = useRouter();

  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement>(null);

  /* Close the user menu on an outside click or Escape. */
  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handlePointerDown(
      event: MouseEvent
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [menuOpen]);

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
      setMenuOpen(false);

      router.push("/login");
    }
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-30 h-16 border-b border-gray-200 bg-white lg:left-64">

      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">

        <div className="flex min-w-0 flex-1 items-center gap-3">

          {/* Menu toggle, mobile only */}
          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            className="shrink-0 rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 lg:hidden"
          >
            ☰
          </button>

          {/* Search */}
          <div className="relative w-full max-w-xs sm:max-w-sm">
            <input
              type="text"
              placeholder="Search your knowledge..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 pl-10 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
            />

            <span className="absolute left-3 top-2.5 text-gray-400">
              ⌕
            </span>
          </div>
        </div>

        {/* Right section */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">

          {/* Notifications */}
          <button
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 sm:flex"
            aria-label="Notifications"
          >
            ♢
          </button>

          {/* User menu */}
          {user && (
            <div
              ref={menuRef}
              className="relative"
            >
              <button
                onClick={() =>
                  setMenuOpen(
                    (previous) => !previous
                  )
                }
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-3 rounded-lg p-1 transition hover:bg-gray-100"
              >
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {user.role}
                  </p>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
                >
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {user.name}
                    </p>

                    <p className="truncate text-xs text-gray-500">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    href="/settings"
                    role="menuitem"
                    onClick={() =>
                      setMenuOpen(false)
                    }
                    className="block px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    Settings
                  </Link>

                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="block w-full px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    {loggingOut
                      ? "Signing out..."
                      : "Sign out"}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </header>
  );
}
