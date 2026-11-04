"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Wallet,
  Network,
  HeartHandshake,
  CalendarDays,
  Megaphone,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import type { AdminNavItem } from "@/lib/permissions";

const icons = {
  overview: LayoutDashboard,
  members: Users,
  attendance: CalendarCheck,
  finance: Wallet,
  departments: Network,
  followup: HeartHandshake,
  events: CalendarDays,
  communication: Megaphone,
  settings: Settings,
};

export function Sidebar({
  items,
  name,
  roleLabel,
  signOut,
}: {
  items: AdminNavItem[];
  name: string;
  roleLabel: string;
  signOut: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {items.map((item) => {
        const Icon = icons[item.icon];
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-accent text-accent-foreground"
                : "text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 p-4">
      <p className="truncate text-sm font-semibold text-white">{name}</p>
      <p className="text-xs text-white/60">{roleLabel}</p>
      <form action={signOut}>
        <button
          type="submit"
          className="mt-3 flex items-center gap-2 text-xs font-medium text-white/75 hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </form>
    </div>
  );

  const brand = (
    <Link href="/admin" className="block px-5 py-6">
      <Image src="/logo-white.png" alt="Treasurehouse" width={2050} height={218} className="h-5 w-auto" />
    </Link>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col bg-navy md:flex md:h-screen md:sticky md:top-0">
        {brand}
        {nav}
        {footer}
      </aside>

      <div className="sticky top-0 z-40 flex items-center justify-between bg-navy px-4 md:hidden">
        {brand}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-2 text-white"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-navy">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 p-1 text-white"
            >
              <X className="h-5 w-5" />
            </button>
            {brand}
            {nav}
            {footer}
          </aside>
        </div>
      )}
    </>
  );
}
