"use client";

import React, { useState } from "react";
import {
  HandHeart,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  RotateCcw,
  User,
} from "lucide-react";
import { Loan } from "@/lib/types";
import {
  Badge,
  Button,
  EmptyState,
  LoadingState,
  SearchInput,
  Segmented,
  cn,
} from "@/components/ui";

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

const tabs = [
  { id: "all", label: "Everything" },
  { id: "active", label: "On loan" },
  { id: "overdue", label: "Late" },
  { id: "returned", label: "Returned" },
];

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

  return (
    <div className="mx-auto max-w-[1440px] space-y-5 p-4 md:p-8">
      <div className="rounded-3xl bg-white p-4 shadow-[0_1px_2px_rgba(20,30,25,0.04),0_18px_40px_-30px_rgba(20,30,25,0.4)] ring-1 ring-[#e7e0d3] md:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <Segmented tabs={tabs} value={statusFilter} onChange={onFilterStatus} />
          <SearchInput
            className="flex-1"
            value={searchInput}
            onChange={(value) => {
              setSearchInput(value);
              onSearch(value);
            }}
            placeholder="Search a member or book title"
          />
          <Button onClick={onOpenIssueModal}>
            <HandHeart className="h-4 w-4" /> New checkout
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingState label="Pulling up the circulation records..." />
      ) : loans.length === 0 ? (
        <EmptyState
          icon={<Clock className="h-6 w-6" />}
          title={statusFilter === "overdue" ? "Nothing is late. Nice." : "No checkouts here yet"}
          description={
            statusFilter === "overdue"
              ? "Every book is back on time. Keep up the good work."
              : "Try another filter, or check out a book at the desk."
          }
          action={
            <Button onClick={onOpenIssueModal}>
              <HandHeart className="h-4 w-4" /> New checkout
            </Button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {loans.map((loan) => {
            const returned = loan.status === "returned";
            const late = !returned && (loan.status === "overdue" || (loan.days_overdue ?? 0) > 0);
            return (
              <article
                key={loan.id}
                className={cn(
                  "relative overflow-hidden rounded-2xl bg-white p-4 pl-5 shadow-[0_1px_2px_rgba(20,30,25,0.04),0_14px_30px_-24px_rgba(20,30,25,0.4)] ring-1 ring-[#e7e0d3] transition hover:shadow-[0_18px_36px_-26px_rgba(20,30,25,0.5)]",
                  late && "ring-[#f0d3c8]"
                )}
              >
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 w-1",
                    returned ? "bg-[#2f7d5b]" : late ? "bg-[#b4462f]" : "bg-[#d5a64a]"
                  )}
                />
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                        returned
                          ? "bg-[#e6f2ea] text-[#2f7d5b]"
                          : late
                            ? "bg-[#fbe9e2] text-[#b4462f]"
                            : "bg-[#f7ecd4] text-[#a9761f]"
                      )}
                    >
                      {returned ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : late ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : (
                        <Clock className="h-5 w-5" />
                      )}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate font-bold text-[#17201b]">{loan.book_title}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-[#8a9187]">
                        <User className="h-3 w-3" />
                        <span className="font-semibold text-[#5c645b]">{loan.member_name}</span>
                        {loan.member_code ? <span>· {loan.member_code}</span> : null}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#8a9187]">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" /> Out {loan.loan_date}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {returned
                            ? `Back ${loan.return_date}`
                            : `Due ${loan.due_date}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 md:shrink-0 md:justify-end">
                    <Badge tone={returned ? "success" : late ? "danger" : "warn"}>
                      {returned ? "Returned" : late ? `${loan.days_overdue ?? 0} days late` : "On loan"}
                    </Badge>

                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-bold",
                        (loan.fine_amount ?? 0) > 0
                          ? "bg-[#fbe9e2] text-[#a53f29]"
                          : "bg-[#f1ece2] text-[#8a9187]"
                      )}
                    >
                      {(loan.fine_amount ?? 0) > 0
                        ? `$${loan.fine_amount.toFixed(2)} fee`
                        : "No fee"}
                    </span>

                    {returned ? (
                      <span className="px-2 text-xs font-semibold text-[#9aa196]">
                        Closed
                      </span>
                    ) : (
                      <>
                        <Button size="sm" variant="subtle" onClick={() => onExtendLoan(loan.id)}>
                          <RotateCcw className="h-3.5 w-3.5" /> +7 days
                        </Button>
                        <Button size="sm" onClick={() => onOpenReturnModal(loan)}>
                          Return
                        </Button>
                      </>
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
