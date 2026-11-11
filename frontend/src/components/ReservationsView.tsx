"use client";

import React from "react";
import { BookmarkCheck } from "lucide-react";
import { Reservation } from "@/lib/types";

interface ReservationsViewProps {
  reservations: Reservation[];
  loading: boolean;
  statusFilter: string;
  onFilterStatus: (st: string) => void;
  onFulfill: (id: number) => void;
  onCancel: (id: number) => void;
}

export function ReservationsView({
  reservations,
  loading,
  statusFilter,
  onFilterStatus,
  onFulfill,
  onCancel,
}: ReservationsViewProps) {
  const tabs = [
    { id: "all", label: "All holds" },
    { id: "pending", label: "Waiting" },
    { id: "fulfilled", label: "Given out" },
    { id: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="space-y-5 p-4 md:p-8">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onFilterStatus(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              statusFilter === tab.id ? "bg-[#16352a] text-[#f6f1e7]" : "bg-white text-[#5c5348] shadow-sm"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#16352a] border-t-transparent" />
        </div>
      ) : reservations.length === 0 ? (
        <div className="rounded-[1.6rem] border border-dashed border-[#d9d0c3] bg-white/70 px-6 py-16 text-center">
          <BookmarkCheck className="mx-auto h-8 w-8 text-[#8a7b68]" />
          <h3 className="mt-3 font-display text-2xl">No holds in this list</h3>
          <p className="mt-2 text-sm text-[#6b6258]">When every copy of a book is out, people can wait here for the next one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((res) => (
            <article key={res.id} className="flex flex-col gap-4 rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-[#eadfD0] md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-display text-2xl leading-tight">{res.book_title}</p>
                <p className="mt-1 text-sm text-[#6b6258]">
                  Waiting for <span className="font-bold text-[#1c1917]">{res.member_name}</span> · asked on {res.reservation_date}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                  res.status === "fulfilled" ? "bg-[#e7f3ea] text-[#1c4a38]" : res.status === "cancelled" ? "bg-[#f3eee6] text-[#6b6258]" : "bg-[#f8ead8] text-[#8a4b16]"
                }`}>
                  {res.status === "pending" ? "Waiting" : res.status === "fulfilled" ? "Given out" : "Cancelled"}
                </span>
                {res.status === "pending" && (
                  <>
                    <button onClick={() => onFulfill(res.id)} className="rounded-xl bg-[#16352a] px-4 py-2.5 text-sm font-bold text-white">
                      Give them the book
                    </button>
                    <button onClick={() => onCancel(res.id)} className="rounded-xl bg-[#f7f3eb] px-4 py-2.5 text-sm font-bold text-[#5c5348]">
                      Cancel hold
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
