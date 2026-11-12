"use client";

import React, { useEffect, useState } from "react";
import { BookPlus, HandHeart } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/components/ui";

interface HeaderProps {
  onOpenIssueModal: () => void;
  onOpenAddBookModal: () => void;
  activeTab: string;
}

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Home",
    subtitle: "A clear view of what is on the shelves, what is out, and what needs a nudge.",
  },
  books: {
    title: "Catalog",
    subtitle: "Search the collection, check a copy out, or add a new title.",
  },
  loans: {
    title: "Checkouts",
    subtitle: "Track every loan, return a book, or extend a due date.",
  },
  members: {
    title: "Members",
    subtitle: "Look up a patron and see how many books they can still borrow.",
  },
  reservations: {
    title: "Holds",
    subtitle: "Manage the waitlist and hand books to the next reader in line.",
  },
};

export function Header({
  onOpenIssueModal,
  onOpenAddBookModal,
  activeTab,
}: HeaderProps) {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [today, setToday] = useState("");
  const page = pageMeta[activeTab] ?? pageMeta.dashboard;

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    );
    const check = async () => setBackendOnline(await api.checkHealth());
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  const online = backendOnline === true;
  const offline = backendOnline === false;

  return (
    <header className="sticky top-0 z-30 border-b border-[#e7e0d3] bg-[#f6f2ea]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-4 md:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a7b68]">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                online ? "bg-emerald-500" : offline ? "bg-rose-500" : "bg-amber-400"
              )}
            />
            {today || "Today"}
          </div>
          <h1 className="mt-1 truncate font-display text-3xl text-[#17201b] md:text-4xl">
            {page.title}
          </h1>
          <p className="mt-1 max-w-xl text-sm leading-snug text-[#6b7269]">{page.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-bold ring-1",
              online
                ? "bg-white text-[#1f6a4a] ring-[#cfe6d9]"
                : offline
                  ? "bg-white text-[#a53f29] ring-[#f0d3c8]"
                  : "bg-white text-[#8a6516] ring-[#f0e3c4]"
            )}
            title="Backend connection status"
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                online
                  ? "live-dot bg-emerald-500"
                  : offline
                    ? "bg-rose-500"
                    : "bg-amber-400"
              )}
            />
            {online ? "Connected" : offline ? "Server offline" : "Checking..."}
          </span>

          <button
            onClick={onOpenIssueModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0f3d2e] px-4 py-2.5 text-sm font-bold text-[#f7f3ec] shadow-[0_8px_20px_-12px_rgba(15,61,46,0.9)] transition hover:bg-[#15513c] active:scale-[0.98]"
          >
            <HandHeart className="h-4 w-4" />
            <span className="hidden sm:inline">Check out</span>
            <span className="sm:hidden">Issue</span>
          </button>

          <button
            onClick={onOpenAddBookModal}
            className="hidden items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#0f3d2e] ring-1 ring-[#e3dccd] transition hover:bg-[#fbf9f4] sm:inline-flex"
          >
            <BookPlus className="h-4 w-4" />
            Add book
          </button>

        </div>
      </div>
    </header>
  );
}
