"use client";

import React, { useState } from "react";
import { Search, HandHeart, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Loan } from "@/lib/types";

interface LoansViewProps {
  loans: Loan[];
  loading: boolean;
  statusFilter: string;
  onFilterStatus: (st: string) => void;
  onSearch: (q: string) => void;
  onOpenIssueModal: () => void;
  onOpenReturnModal: (loan: Loan) => void;
  onExtendLoan: (loanId: number) => void;
}

export function LoansView({
  loans,
  loading,
  statusFilter,
  onFilterStatus,
  onSearch,
  onOpenIssueModal,
  onOpenReturnModal,
  onExtendLoan,
}: LoansViewProps) {
  const [searchInput, setSearchInput] = useState("");
  const tabs = [
    { id: "all", label: "Everything" },
    { id: "active", label: "Still out" },
    { id: "overdue", label: "Late" },
    { id: "returned", label: "Returned" },
  ];

  return (
    <div className="space-y-5 p-4 md:p-8">
      <div className="flex flex-col gap-3 rounded-[1.6rem] bg-white p-4 shadow-sm ring-1 ring-[#eadfD0] lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onFilterStatus(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                statusFilter === tab.id ? "bg-[#16352a] text-[#f6f1e7]" : "bg-[#f7f3eb] text-[#5c5348]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7b68]" />
          <input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="Search a person or a title"
            className="w-full rounded-2xl border border-[#eadfD0] bg-[#f7f3eb] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#245c45] focus:bg-white"
          />
        </div>
        <button onClick={onOpenIssueModal} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#16352a] px-4 py-3 text-sm font-bold text-white">
          <HandHeart className="h-4 w-4" /> New checkout
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#16352a] border-t-transparent" />
        </div>
      ) : loans.length === 0 ? (
        <div className="rounded-[1.6rem] border border-dashed border-[#d9d0c3] bg-white/70 px-6 py-16 text-center">
          <h3 className="font-display text-2xl">Nothing here</h3>
          <p className="mt-2 text-sm text-[#6b6258]">
            {statusFilter === "overdue" ? "No late books. That is a good day." : "Try another filter, or check a book out."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {loans.map((loan) => {
            const returned = loan.status === "returned";
            const late = !returned && (loan.status === "overdue" || (loan.days_overdue || 0) > 0);
            return (
              <article key={loan.id} className="grid gap-4 rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-[#eadfD0] md:grid-cols-[1.4fr_1fr_auto] md:items-center">
                <div>
                  <p className="font-display text-2xl leading-tight">{loan.book_title}</p>
                  <p className="mt-1 text-sm text-[#6b6258]">
                    Borrowed by <span className="font-bold text-[#1c1917]">{loan.member_name}</span>
                    {loan.member_code ? ` · ${loan.member_code}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-bold ${
                    returned ? "bg-[#e7f3ea] text-[#1c4a38]" : late ? "bg-[#f8e4da] text-[#9a4124]" : "bg-[#f7f3eb] text-[#245c45]"
                  }`}>
                    {returned ? <CheckCircle2 className="h-3.5 w-3.5" /> : late ? <AlertTriangle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    {returned ? "Returned" : late ? `${loan.days_overdue || 0} days late` : "On time"}
                  </span>
                  <span className="text-[#6b6258]">Due {loan.due_date}</span>
                  <span className={`font-bold ${loan.fine_amount > 0 ? "text-[#9a4124]" : "text-[#6b6258]"}`}>
                    {loan.fine_amount > 0 ? `$${loan.fine_amount.toFixed(2)} fee` : "No fee"}
                  </span>
                </div>
                <div className="flex gap-2 md:justify-end">
                  {returned ? (
                    <span className="text-sm text-[#8a7b68]">Back on {loan.return_date}</span>
                  ) : (
                    <>
                      <button onClick={() => onOpenReturnModal(loan)} className="rounded-xl bg-[#16352a] px-4 py-2.5 text-sm font-bold text-white">
                        Return
                      </button>
                      <button onClick={() => onExtendLoan(loan.id)} className="rounded-xl bg-[#f7f3eb] px-4 py-2.5 text-sm font-bold text-[#16352a]">
                        Add 7 days
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
