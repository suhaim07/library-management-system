"use client";

import React, { useEffect, useState } from "react";
import { BookPlus, HandHeart, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";

interface HeaderProps {
  onOpenIssueModal: () => void;
  onOpenAddBookModal: () => void;
  activeTab: string;
  onSwitchToClassic?: () => void;
}

const titles: Record<string, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Home",
    subtitle: "See what is on the shelves, what is out, and what needs attention.",
  },
  books: {
    title: "Books",
    subtitle: "Search the catalog, check a copy out, or add a new title.",
  },
  loans: {
    title: "Checkouts",
    subtitle: "Return a book, add a week, or find something that is late.",
  },
  members: {
    title: "People",
    subtitle: "Look up a member, see how many books they can still borrow.",
  },
  reservations: {
    title: "Holds",
    subtitle: "Give a waiting book to the next person, or cancel a hold.",
  },
};

export function Header({ onOpenIssueModal, onOpenAddBookModal, activeTab, onSwitchToClassic }: HeaderProps) {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [today, setToday] = useState("Today");
  const page = titles[activeTab] ?? titles.dashboard;

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  useEffect(() => {
    const check = async () => setBackendOnline(await api.checkHealth());
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-[#e6deD2] bg-[#f7f3eb]/90 px-4 py-4 backdrop-blur md:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8a7b68]">{today}</p>
          <h1 className="mt-1 font-display text-3xl text-[#1c1917] md:text-4xl">{page.title}</h1>
          <p className="mt-1 max-w-xl text-sm text-[#6b6258]">{page.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-[#3f4a43] shadow-sm">
            <span className={`h-2 w-2 rounded-full ${backendOnline ? "bg-emerald-500" : backendOnline === false ? "bg-rose-500" : "bg-amber-400"}`} />
            {backendOnline ? "Library is online" : backendOnline === false ? "Server is offline" : "Checking..."}
          </span>

          <button
            onClick={onOpenIssueModal}
            className="inline-flex items-center gap-2 rounded-full bg-[#16352a] px-4 py-2.5 text-sm font-bold text-[#f6f1e7] shadow-sm hover:bg-[#1f4a3a]"
          >
            <HandHeart className="h-4 w-4" />
            Check out a book
          </button>
          <button
            onClick={onOpenAddBookModal}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-[#16352a] shadow-sm hover:bg-[#fffdf8]"
          >
            <BookPlus className="h-4 w-4" />
            Add a book
          </button>

          {onSwitchToClassic && (
            <button
              onClick={onSwitchToClassic}
              className="hidden rounded-full px-3 py-2 text-xs font-semibold text-[#8a7b68] hover:bg-white xl:inline"
            >
              Classic desk
            </button>
          )}
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold text-[#8a7b68] hover:bg-white xl:inline-flex"
          >
            API
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </header>
  );
}
