"use client";

import React from "react";
import {
  BookOpen,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  ArrowRight,
  Plus,
  HandHeart,
} from "lucide-react";
import { DashboardStats } from "@/lib/types";

interface DashboardViewProps {
  stats: DashboardStats | null;
  loading: boolean;
  onNavigate: (tab: string) => void;
  onOpenIssueModal: () => void;
  onOpenAddBookModal: () => void;
  onOpenAddMemberModal: () => void;
}

export function DashboardView({
  stats,
  loading,
  onNavigate,
  onOpenIssueModal,
  onOpenAddBookModal,
  onOpenAddMemberModal,
}: DashboardViewProps) {
  if (loading || !stats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#16352a] border-t-transparent" />
          <p className="text-sm text-[#6b6258]">Opening the library...</p>
        </div>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const availabilityRate = stats.total_copies > 0
    ? Math.round((stats.available_copies / stats.total_copies) * 100)
    : 100;

  const cards = [
    {
      label: "Titles on the shelves",
      value: stats.total_books,
      note: `${stats.total_copies} physical copies`,
      icon: BookOpen,
      onClick: () => onNavigate("books"),
      action: "Browse books",
    },
    {
      label: "Ready to borrow",
      value: stats.available_copies,
      note: `${availabilityRate}% still in the library`,
      icon: CheckCircle,
      onClick: () => onNavigate("books"),
      action: "See what is in",
    },
    {
      label: "Out with readers",
      value: stats.active_loans,
      note: `${stats.borrowed_copies} copies checked out`,
      icon: Clock,
      onClick: () => onNavigate("loans"),
      action: "Open checkouts",
    },
    {
      label: "Needs a reminder",
      value: stats.overdue_loans,
      note: `$${stats.total_fines_due.toFixed(2)} in late fees`,
      icon: AlertTriangle,
      onClick: () => onNavigate("loans"),
      action: "Look at late books",
      warn: stats.overdue_loans > 0,
    },
  ];

  return (
    <div className="space-y-8 p-4 md:p-8">
      <section className="overflow-hidden rounded-[2rem] bg-[#16352a] text-[#f6f1e7] shadow-sm">
        <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_1fr] md:p-8">
          <div>
            <p className="text-sm font-bold text-[#e7c9a5]">{greeting}</p>
            <h2 className="mt-2 font-display text-4xl leading-tight md:text-5xl">
              What would you like to do?
            </h2>
            <p className="mt-3 max-w-lg text-base text-[#d7e6dc]">
              {stats.total_members} people belong to this library. Start with a checkout, a new book, or a new member.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            <button onClick={onOpenIssueModal} className="flex items-center justify-between rounded-2xl bg-[#e7c9a5] px-4 py-4 text-left font-bold text-[#16352a] hover:bg-[#f0d7b8]">
              <span className="flex items-center gap-2"><HandHeart className="h-5 w-5" /> Check out a book</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={onOpenAddBookModal} className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-4 text-left font-bold hover:bg-white/15">
              <span className="flex items-center gap-2"><Plus className="h-5 w-5" /> Add a book</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={onOpenAddMemberModal} className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-4 text-left font-bold hover:bg-white/15">
              <span className="flex items-center gap-2"><Users className="h-5 w-5" /> Add a person</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={card.onClick}
              className="rounded-[1.6rem] bg-white p-5 text-left shadow-sm ring-1 ring-[#eadfD0] transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.warn ? "bg-[#f8e4da] text-[#9a4124]" : "bg-[#e7f3ea] text-[#16352a]"}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-semibold text-[#6b6258]">{card.label}</p>
              <p className={`mt-1 font-display text-4xl ${card.warn ? "text-[#9a4124]" : "text-[#1c1917]"}`}>{card.value}</p>
              <p className="mt-1 text-sm text-[#6b6258]">{card.note}</p>
              <p className="mt-4 inline-flex items-center text-sm font-bold text-[#245c45]">
                {card.action} <ArrowRight className="ml-1 h-4 w-4" />
              </p>
            </button>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-[1.6rem] bg-white p-6 shadow-sm ring-1 ring-[#eadfD0]">
          <h3 className="font-display text-2xl">What we collect</h3>
          <p className="mt-1 text-sm text-[#6b6258]">{stats.genre_distribution.length} kinds of books</p>
          <div className="mt-5 space-y-4">
            {stats.genre_distribution.map((item) => {
              const maxCount = Math.max(...stats.genre_distribution.map((g) => g.count), 1);
              const percentage = stats.total_books ? Math.round((item.count / stats.total_books) * 100) : 0;
              return (
                <div key={item.genre}>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-[#1c1917]">{item.genre}</span>
                    <span className="text-[#6b6258]">{item.count} · {percentage}%</span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#f3eee6]">
                    <div className="h-full rounded-full bg-[#2f6f54]" style={{ width: `${(item.count / maxCount) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 rounded-2xl bg-[#f7f3eb] p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6b6258]">Fees already collected</span>
              <span className="font-bold">${stats.total_fines_collected.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[1.6rem] bg-white p-6 shadow-sm ring-1 ring-[#eadfD0] lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-2xl">Latest movement</h3>
              <p className="text-sm text-[#6b6258]">Recent checkouts, returns, and late books.</p>
            </div>
            <button onClick={() => onNavigate("loans")} className="text-sm font-bold text-[#245c45]">
              See all
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {stats.recent_activity.length === 0 ? (
              <p className="py-10 text-center text-sm text-[#8a7b68]">Nothing has moved yet. Check out the first book to start the story.</p>
            ) : (
              stats.recent_activity.map((act) => {
                const isOverdue = act.status === "overdue";
                const isReturned = act.status === "returned";
                return (
                  <div key={act.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[#f7f3eb] px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-[#1c1917]">{act.book_title}</p>
                      <p className="text-sm text-[#6b6258]">with {act.member_name}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                        isReturned ? "bg-[#e7f3ea] text-[#1c4a38]" : isOverdue ? "bg-[#f8e4da] text-[#9a4124]" : "bg-white text-[#245c45]"
                      }`}>
                        {isReturned ? "Returned" : isOverdue ? "Late" : "Out"}
                      </span>
                      <p className="mt-1 text-xs text-[#8a7b68]">
                        {isReturned ? `Back ${act.return_date}` : `Due ${act.due_date}`}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
