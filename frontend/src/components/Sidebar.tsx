"use client";

import React from "react";
import {
  House,
  Library,
  BookOpenCheck,
  Users,
  Bookmark,
  BookMarked,
  Clock,
} from "lucide-react";
import { cn } from "@/components/ui";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats?: {
    activeLoansCount?: number;
    overdueLoansCount?: number;
  };
}

const navItems = [
  { id: "dashboard", label: "Home", hint: "Today at a glance", icon: House },
  { id: "books", label: "Catalog", hint: "Find a title", icon: Library },
  { id: "loans", label: "Checkouts", hint: "Who has what", icon: BookOpenCheck },
  { id: "members", label: "Members", hint: "People & limits", icon: Users },
  { id: "reservations", label: "Holds", hint: "Waiting list", icon: Bookmark },
];

export function Sidebar({ activeTab, setActiveTab, stats }: SidebarProps) {
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[17.5rem] shrink-0 flex-col overflow-hidden bg-[#0f3d2e] px-4 py-6 text-[#f7f3ec] md:flex">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#2f7d5b]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[#d5a64a]/10 blur-3xl" />

        <div className="relative px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d5a64a] text-[#0f3d2e] shadow-lg shadow-black/20">
              <BookMarked className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-xl leading-none">The Library</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b7cfc2]">
                Circulation desk
              </p>
            </div>
          </div>
        </div>

        <nav className="relative mt-8 space-y-1.5">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8fb3a3]">
            Workspace
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const late = item.id === "loans" ? stats?.overdueLoansCount ?? 0 : 0;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "no-tap-highlight group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition",
                  isActive
                    ? "bg-[#f7f3ec] text-[#0f3d2e] shadow-lg shadow-black/10"
                    : "text-[#dbe9e1] hover:bg-white/10"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition",
                    isActive
                      ? "bg-[#e6f2ea] text-[#0f3d2e]"
                      : "bg-white/5 text-[#b7cfc2] group-hover:text-white"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold leading-tight">{item.label}</span>
                  <span
                    className={cn(
                      "block truncate text-[11px]",
                      isActive ? "text-[#5d7366]" : "text-[#9fbdb0]"
                    )}
                  >
                    {item.hint}
                  </span>
                </span>
                {late > 0 ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      isActive
                        ? "bg-[#fbe9e2] text-[#a53f29]"
                        : "bg-[#c46b3a] text-white"
                    )}
                  >
                    {late}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="relative mt-auto space-y-3 pt-6">
          <div className="rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
            <div className="flex items-center gap-2 text-[#f7ecd4]">
              <Clock className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-wide">Borrowing guide</p>
            </div>
            <dl className="mt-3 space-y-2 text-[11px] text-[#cfe0d6]">
              <div className="flex items-center justify-between gap-2">
                <dt>Standard loan</dt>
                <dd className="font-bold text-white">14 days</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt>Late fee</dt>
                <dd className="font-bold text-white">$0.50 / day</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt>Membership limits</dt>
                <dd className="font-bold text-white">5–12 books</dd>
              </div>
            </dl>
          </div>
          <p className="px-2 text-[10px] text-[#7fa595]">
            Library Management System · v1.0
          </p>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch gap-1 border-t border-[#e7e0d3] bg-[#fffdf9]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "no-tap-highlight flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-bold transition",
                isActive
                  ? "bg-[#0f3d2e] text-[#f7f3ec]"
                  : "text-[#6b7269] hover:bg-black/[0.04]"
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}
