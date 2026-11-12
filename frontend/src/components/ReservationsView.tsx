"use client";

import React, { useMemo, useState } from "react";
import {
  BookmarkCheck,
  Bookmark,
  User,
  CalendarDays,
  Check,
  X,
} from "lucide-react";
import { Reservation } from "@/lib/types";
import {
  Badge,
  Button,
  EmptyState,
  LoadingState,
  SearchInput,
  Segmented,
  cn,
} from "@/components/ui";

interface ReservationsViewProps {
  reservations: Reservation[];
  loading: boolean;
  statusFilter: string;
  onFilterStatus: (st: string) => void;
  onFulfill: (id: number) => void;
  onCancel: (id: number) => void;
}

const tabs = [
  { id: "all", label: "All holds" },
  { id: "pending", label: "Waiting" },
  { id: "fulfilled", label: "Given out" },
  { id: "cancelled", label: "Cancelled" },
];

const statusMeta = {
  pending: { label: "Waiting", tone: "warn" as const },
  fulfilled: { label: "Given out", tone: "success" as const },
  cancelled: { label: "Cancelled", tone: "neutral" as const },
};

export function ReservationsView({
  reservations,
  loading,
  statusFilter,
  onFilterStatus,
  onFulfill,
  onCancel,
}: ReservationsViewProps) {
  const [searchInput, setSearchInput] = useState("");

  const visible = useMemo(() => {
    const query = searchInput.trim().toLowerCase();
    if (!query) return reservations;
    return reservations.filter(
      (res) =>
        res.book_title?.toLowerCase().includes(query) ||
        res.member_name?.toLowerCase().includes(query)
    );
  }, [reservations, searchInput]);

  return (
    <div className="mx-auto max-w-[1440px] space-y-5 p-4 md:p-8">
      <div className="rounded-3xl bg-white p-4 shadow-[0_1px_2px_rgba(20,30,25,0.04),0_18px_40px_-30px_rgba(20,30,25,0.4)] ring-1 ring-[#e7e0d3] md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Segmented tabs={tabs} value={statusFilter} onChange={onFilterStatus} />
          <SearchInput
            className="flex-1"
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search by book or member"
          />
        </div>
      </div>

      {loading ? (
        <LoadingState label="Checking the waiting list..." />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<BookmarkCheck className="h-6 w-6" />}
          title="No holds in this list"
          description="When every copy of a book is out, readers can wait here for the next one to come back."
        />
      ) : (
        <div className="space-y-2.5">
          {visible.map((res) => {
            const meta = statusMeta[res.status] ?? statusMeta.pending;
            return (
              <article
                key={res.id}
                className="relative overflow-hidden rounded-2xl bg-white p-4 pl-5 shadow-[0_1px_2px_rgba(20,30,25,0.04),0_14px_30px_-24px_rgba(20,30,25,0.4)] ring-1 ring-[#e7e0d3] transition hover:shadow-[0_18px_36px_-26px_rgba(20,30,25,0.5)]"
              >
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 w-1",
                    res.status === "fulfilled"
                      ? "bg-[#2f7d5b]"
                      : res.status === "cancelled"
                        ? "bg-[#c4bcae]"
                        : "bg-[#d5a64a]"
                  )}
                />
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                        res.status === "fulfilled"
                          ? "bg-[#e6f2ea] text-[#2f7d5b]"
                          : res.status === "cancelled"
                            ? "bg-[#f1ece2] text-[#8a9187]"
                            : "bg-[#f7ecd4] text-[#a9761f]"
                      )}
                    >
                      <Bookmark className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-[#17201b]">{res.book_title}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-[#8a9187]">
                        <User className="h-3 w-3" />
                        <span className="font-semibold text-[#5c645b]">{res.member_name}</span>
                      </p>
                      <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#8a9187]">
                        <CalendarDays className="h-3 w-3" /> Requested {res.reservation_date}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 md:shrink-0 md:justify-end">
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    {res.status === "pending" ? (
                      <>
                        <Button size="sm" variant="subtle" onClick={() => onCancel(res.id)}>
                          <X className="h-3.5 w-3.5" /> Cancel
                        </Button>
                        <Button size="sm" onClick={() => onFulfill(res.id)}>
                          <Check className="h-3.5 w-3.5" /> Give book
                        </Button>
                      </>
                    ) : (
                      <span className="px-2 text-xs font-semibold text-[#9aa196]">Closed</span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
