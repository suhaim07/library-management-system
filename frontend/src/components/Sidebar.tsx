"use client";

import React from "react";
import {
  House,
  Library,
  BookOpenCheck,
  Users,
  Bookmark,
  Sparkles,
} from "lucide-react";

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
  { id: "books", label: "Books", hint: "Find something to read", icon: Library },
  { id: "loans", label: "Checkouts", hint: "Who has what", icon: BookOpenCheck },
  { id: "members", label: "People", hint: "Members and limits", icon: Users },
  { id: "reservations", label: "Holds", hint: "Waiting list", icon: Bookmark },
];

export function Sidebar({ activeTab, setActiveTab, stats }: SidebarProps) {
  return (
    <>
      <aside className="hidden md:flex w-[17.5rem] shrink-0 flex-col bg-[#16352a] text-[#f6f1e7] px-4 py-6">
        <div className="px-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e7c9a5] text-[#16352a]">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="mt-4 font-display text-2xl leading-none">The Library</p>
          <p className="mt-2 text-sm text-[#d7e6dc]">A quieter way to run the desk.</p>
        </div>

        <nav className="mt-8 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const late = item.id === "loans" ? stats?.overdueLoansCount : 0;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                  isActive ? "bg-[#f6f1e7] text-[#16352a]" : "text-[#e7f0ea] hover:bg-white/10"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold leading-tight">{item.label}</span>
                  <span className={`block text-xs ${isActive ? "text-[#5d7366]" : "text-[#b7cfc2]"}`}>
                    {item.hint}
                  </span>
                </span>
                {late ? (
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${isActive ? "bg-[#f3d6c8] text-[#8a3d22]" : "bg-[#c46b3a] text-white"}`}>
                    {late} late
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto rounded-3xl bg-white/10 p-4 text-sm leading-relaxed text-[#e7f0ea]">
          <p className="font-bold text-white">How borrowing works</p>
          <p className="mt-1">Most books go out for 14 days. Late books are $0.50 a day. Limits depend on membership.</p>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[#d9d0c3] bg-[#fffdf8]/95 px-2 py-2 backdrop-blur md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-bold ${
                isActive ? "bg-[#16352a] text-[#f6f1e7]" : "text-[#5c5348]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}
