"use client";

import React from "react";
import {
  BookOpen,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  ArrowRight,
  ArrowUpRight,
  Plus,
  HandHeart,
  RefreshCw,
  BookMarked,
  CalendarClock,
} from "lucide-react";
import { DashboardStats, Loan } from "@/lib/types";
import { Badge, Button, EmptyState, Skeleton, cn } from "@/components/ui";

interface DashboardViewProps {
  stats: DashboardStats | null;
  loans: Loan[];
  loading: boolean;
  onNavigate: (tab: string) => void;
  onOpenIssueModal: () => void;
  onOpenAddBookModal: () => void;
  onOpenAddMemberModal: () => void;
  onRetry?: () => void;
}

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

export function DashboardView({
  stats,
  loans,
  loading,
  onNavigate,
  onOpenIssueModal,
  onOpenAddBookModal,
  onOpenAddMemberModal,
  onRetry,
}: DashboardViewProps) {
  if (loading) {
    return (
      <div className="mx-auto max-w-[1440px] space-y-6 p-4 md:p-8">
        <Skeleton className="h-52 w-full rounded-3xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-3xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="mx-auto max-w-[1440px] p-4 md:p-8">
        <EmptyState
          icon={<AlertTriangle className="h-6 w-6" />}
          title="We could not reach the library server"
          description="Start the FastAPI backend on http://127.0.0.1:8000 and try again. The interface will reconnect automatically."
          action={
            onRetry ? (
              <Button onClick={onRetry}>
                <RefreshCw className="h-4 w-4" /> Try again
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const availabilityRate =
    stats.total_copies > 0
      ? Math.round((stats.available_copies / stats.total_copies) * 100)
      : 100;

  const overdueLoans = loans.filter(
    (loan) =>
      loan.status !== "returned" &&
      (loan.status === "overdue" || (loan.days_overdue ?? 0) > 0)
  );

  const cards = [
    {
      label: "Titles in catalog",
      value: stats.total_books,
      note: `${stats.total_copies} physical copies`,
      icon: BookOpen,
      tone: "bg-[#e6f2ea] text-[#0f3d2e]",
      onClick: () => onNavigate("books"),
      progress: 100,
      bar: "bg-[#2f7d5b]",
    },
    {
      label: "Available now",
      value: stats.available_copies,
      note: `${availabilityRate}% ready to borrow`,
      icon: CheckCircle,
      tone: "bg-[#e7f0f8] text-[#2b5b84]",
      onClick: () => onNavigate("books"),
      progress: availabilityRate,
      bar: "bg-[#3f80b3]",
    },
    {
      label: "Out on loan",
      value: stats.active_loans,
      note: `${stats.borrowed_copies} copies with readers`,
      icon: Clock,
      tone: "bg-[#f7ecd4] text-[#8a6516]",
      onClick: () => onNavigate("loans"),
      progress: stats.total_copies ? Math.round((stats.borrowed_copies / stats.total_copies) * 100) : 0,
      bar: "bg-[#d5a64a]",
    },
    {
      label: "Overdue",
      value: stats.overdue_loans,
      note: `${money(stats.total_fines_due)} in late fees`,
      icon: AlertTriangle,
      tone: "bg-[#fbe9e2] text-[#a53f29]",
      onClick: () => onNavigate("loans"),
      progress: stats.active_loans ? Math.round((stats.overdue_loans / stats.active_loans) * 100) : 0,
      bar: "bg-[#b4462f]",
      warn: stats.overdue_loans > 0,
    },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 p-4 md:p-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f3d2e] via-[#124634] to-[#1b5a43] p-6 text-[#f7f3ec] shadow-[0_24px_60px_-30px_rgba(15,61,46,0.8)] md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#2f7d5b]/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-[#d5a64a]/15 blur-3xl" />
        <div className="relative grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-center">
          <div>
            <p className="text-sm font-bold text-[#d5a64a]">{greeting}, librarian.</p>
            <h2 className="mt-2 font-display text-4xl leading-[1.05] md:text-5xl">
              Make the desk
              <br className="hidden sm:block" /> a little lighter.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#cfe0d6] md:text-base">
              {stats.total_members} members trust this collection. You have{" "}
              <span className="font-bold text-white">{stats.available_copies} copies ready</span> and{" "}
              <span className="font-bold text-white">{stats.overdue_loans} late</span> to follow up.
            </p>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3 md:grid-cols-1">
            <button
              onClick={onOpenIssueModal}
              className="group flex items-center justify-between gap-3 rounded-2xl bg-[#d5a64a] px-4 py-3.5 text-left text-sm font-bold text-[#262115] transition hover:bg-[#e0b45d]"
            >
              <span className="flex items-center gap-2">
                <HandHeart className="h-4 w-4" /> Check out a book
              </span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={onOpenAddBookModal}
              className="group flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3.5 text-left text-sm font-bold ring-1 ring-white/15 transition hover:bg-white/15"
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add a book
              </span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={onOpenAddMemberModal}
              className="group flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3.5 text-left text-sm font-bold ring-1 ring-white/15 transition hover:bg-white/15"
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Add a member
              </span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={card.onClick}
              className="group relative overflow-hidden rounded-3xl bg-white p-5 text-left shadow-[0_1px_2px_rgba(20,30,25,0.04),0_18px_40px_-30px_rgba(20,30,25,0.4)] ring-1 ring-[#e7e0d3] transition hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-30px_rgba(20,30,25,0.5)]"
            >
              <div className="flex items-start justify-between">
                <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", card.tone)}>
                  <Icon className="h-5 w-5" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-[#c4bcae] opacity-0 transition group-hover:opacity-100" />
              </div>
              <p
                className={cn(
                  "mt-4 font-display text-4xl leading-none",
                  card.warn ? "text-[#a53f29]" : "text-[#17201b]"
                )}
              >
                {card.value}
              </p>
              <p className="mt-1.5 text-sm font-bold text-[#3f4a43]">{card.label}</p>
              <p className="mt-0.5 text-xs text-[#8a9187]">{card.note}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#f1ece2]">
                <div
                  className={cn("h-full rounded-full transition-all", card.bar)}
                  style={{ width: `${Math.min(card.progress, 100)}%` }}
                />
              </div>
            </button>
          );
        })}
      </section>

      {/* Activity + overview */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(20,30,25,0.04),0_18px_40px_-30px_rgba(20,30,25,0.4)] ring-1 ring-[#e7e0d3] md:p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-[#17201b]">Latest movement</h3>
              <p className="text-sm text-[#8a9187]">Recent checkouts, returns, and late items.</p>
            </div>
            <button
              onClick={() => onNavigate("loans")}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[#2f7d5b] transition hover:bg-[#e6f2ea]"
            >
              See all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {stats.recent_activity.length === 0 ? (
              <div className="py-12 text-center">
                <BookMarked className="mx-auto h-8 w-8 text-[#c4bcae]" />
                <p className="mt-3 text-sm text-[#8a9187]">
                  Nothing has moved yet. Check out the first book to start the story.
                </p>
              </div>
            ) : (
              stats.recent_activity.map((activity) => {
                const isOverdue = activity.status === "overdue";
                const isReturned = activity.status === "returned";
                return (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-[#fbf9f4] px-4 py-3 ring-1 ring-[#f0eade]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                          isReturned
                            ? "bg-[#e6f2ea] text-[#2f7d5b]"
                            : isOverdue
                              ? "bg-[#fbe9e2] text-[#b4462f]"
                              : "bg-[#f7ecd4] text-[#a9761f]"
                        )}
                      >
                        {isReturned ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : isOverdue ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#17201b]">
                          {activity.book_title}
                        </p>
                        <p className="truncate text-xs text-[#8a9187]">
                          with {activity.member_name}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge tone={isReturned ? "success" : isOverdue ? "danger" : "warn"}>
                        {isReturned ? "Returned" : isOverdue ? "Late" : "On loan"}
                      </Badge>
                      <p className="mt-1 text-[11px] text-[#9aa196]">
                        {isReturned ? `Back ${activity.return_date}` : `Due ${activity.due_date}`}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(20,30,25,0.04),0_18px_40px_-30px_rgba(20,30,25,0.4)] ring-1 ring-[#e7e0d3] md:p-6">
            <h3 className="text-xl font-bold text-[#17201b]">Collection health</h3>
            <p className="text-sm text-[#8a9187]">How much of the shelf is ready today.</p>

            <div className="mt-5 flex items-center gap-5">
              <div
                className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#2f7d5b ${availabilityRate}%, #efe9dd ${availabilityRate}% 100%)`,
                }}
              >
                <div className="flex h-[88px] w-[88px] flex-col items-center justify-center rounded-full bg-white">
                  <span className="font-display text-2xl leading-none text-[#17201b]">
                    {availabilityRate}%
                  </span>
                  <span className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[#8a9187]">
                    ready
                  </span>
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-2.5 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-[#6b7269]">
                    <span className="h-2 w-2 rounded-full bg-[#2f7d5b]" /> Available
                  </span>
                  <span className="font-bold text-[#17201b]">{stats.available_copies}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-[#6b7269]">
                    <span className="h-2 w-2 rounded-full bg-[#d5a64a]" /> On loan
                  </span>
                  <span className="font-bold text-[#17201b]">{stats.borrowed_copies}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-[#6b7269]">
                    <span className="h-2 w-2 rounded-full bg-[#b4462f]" /> Late fines
                  </span>
                  <span className="font-bold text-[#a53f29]">{money(stats.total_fines_due)}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#fbf9f4] px-4 py-3 text-sm ring-1 ring-[#f0eade]">
              <span className="text-[#6b7269]">Fines collected</span>
              <span className="font-bold text-[#17201b]">{money(stats.total_fines_collected)}</span>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(20,30,25,0.04),0_18px_40px_-30px_rgba(20,30,25,0.4)] ring-1 ring-[#e7e0d3] md:p-6">
            <h3 className="text-xl font-bold text-[#17201b]">Genre mix</h3>
            <div className="mt-4 space-y-3">
              {stats.genre_distribution.slice(0, 5).map((genre) => {
                const max = Math.max(...stats.genre_distribution.map((g) => g.count), 1);
                return (
                  <div key={genre.genre}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate pr-2 font-bold text-[#3f4a43]">{genre.genre}</span>
                      <span className="shrink-0 text-[#8a9187]">{genre.count}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#f1ece2]">
                      <div
                        className="h-full rounded-full bg-[#2f7d5b]"
                        style={{ width: `${(genre.count / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Needs attention */}
      {overdueLoans.length > 0 ? (
        <section className="rounded-3xl border border-[#f0d3c8] bg-[#fdf3ef] p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fbe9e2] text-[#b4462f]">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-[#17201b]">Needs a gentle reminder</h3>
                <p className="text-sm text-[#9a6a58]">
                  {overdueLoans.length} overdue loan{overdueLoans.length === 1 ? "" : "s"} waiting to come back.
                </p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => onNavigate("loans")}>
              Review checkouts <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {overdueLoans.slice(0, 6).map((loan) => (
              <div
                key={loan.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-[#f0d3c8]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#17201b]">{loan.book_title}</p>
                  <p className="truncate text-xs text-[#8a9187]">{loan.member_name}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-bold text-[#a53f29]">
                    {loan.days_overdue ?? 0} days late
                  </p>
                  <p className="text-[11px] text-[#9aa196]">{money(loan.fine_amount ?? 0)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="flex items-center gap-3 rounded-3xl border border-[#cfe6d9] bg-[#eef7f1] px-5 py-4 text-sm text-[#1f6a4a]">
          <CalendarClock className="h-5 w-5 shrink-0" />
          <p className="font-semibold">No overdue books right now. The shelves are in good shape.</p>
        </section>
      )}
    </div>
  );
}
