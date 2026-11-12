"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  AlertTriangle,
  Loader2,
  BookOpen,
  User,
  CalendarDays,
} from "lucide-react";
import { Loan } from "@/lib/types";
import { Badge, Button, Field, Modal, cn, inputClass } from "@/components/ui";

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  onSuccess: () => void;
  apiReturn: (loanId: number, data: { fine_paid?: boolean; notes?: string }) => Promise<unknown>;
}

export function ReturnModal({ isOpen, onClose, loan, onSuccess, apiReturn }: ReturnModalProps) {
  const [finePaid, setFinePaid] = useState(true);
  const [returnNotes, setReturnNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setFinePaid(true);
    setReturnNotes("");
    setError(null);
  }, [isOpen, loan?.id]);

  if (!loan) return null;

  const isOverdue = loan.status === "overdue" || (loan.days_overdue ?? 0) > 0;
  const fine = loan.fine_amount || 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiReturn(loan.id, {
        fine_paid: finePaid,
        notes: returnNotes.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process the return.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      icon={<CheckCircle className="h-5 w-5" />}
      title="Return this book"
      subtitle="Confirm the copy is back and settle any late fee."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="return-form" size="sm" disabled={submitting}>
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle className="h-3.5 w-3.5" />
            )}
            {submitting ? "Returning..." : "Mark as returned"}
          </Button>
        </div>
      }
    >
      <form id="return-form" onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div className="flex items-center gap-2 rounded-xl bg-[#fbe9e2] px-3.5 py-3 text-xs font-semibold text-[#a53f29] ring-1 ring-[#f0d3c8]">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="space-y-3 rounded-2xl bg-[#fbf9f4] p-4 ring-1 ring-[#f0eade]">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6f2ea] text-[#0f3d2e]">
              <BookOpen className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#17201b]">{loan.book_title}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#8a9187]">
                <User className="h-3 w-3" />
                {loan.member_name}
                {loan.member_code ? ` · ${loan.member_code}` : ""}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-[#f0eade] pt-3 text-xs">
            <div>
              <p className="text-[11px] text-[#9aa196]">Checked out</p>
              <p className="mt-0.5 flex items-center gap-1 font-semibold text-[#5c645b]">
                <CalendarDays className="h-3 w-3" /> {loan.loan_date}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#9aa196]">Due date</p>
              <p
                className={cn(
                  "mt-0.5 flex items-center justify-end gap-1 font-semibold",
                  isOverdue ? "text-[#a53f29]" : "text-[#5c645b]"
                )}
              >
                <CalendarDays className="h-3 w-3" /> {loan.due_date}
              </p>
            </div>
          </div>
        </div>

        {isOverdue && fine > 0 ? (
          <div className="rounded-2xl border border-[#f0d3c8] bg-[#fdf3ef] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#a53f29]">
                <AlertTriangle className="h-4 w-4" />
                Late fee
              </div>
              <Badge tone="danger">{loan.days_overdue ?? 0} days late</Badge>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xs text-[#9a6a58]">
                {loan.days_overdue ?? 0} days × $0.50 / day
              </span>
              <span className="font-display text-2xl text-[#a53f29]">${fine.toFixed(2)}</span>
            </div>
            <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-semibold text-[#5c645b] ring-1 ring-[#f0d3c8]">
              <input
                type="checkbox"
                checked={finePaid}
                onChange={(event) => setFinePaid(event.target.checked)}
                className="h-4 w-4 accent-[#2f7d5b]"
              />
              Fine collected / waived at the desk
            </label>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-2xl border border-[#cfe6d9] bg-[#f2f8f4] px-4 py-3 text-xs font-semibold text-[#1f6a4a]">
            <CheckCircle className="h-4 w-4" />
            Returned on time — no late fee.
          </div>
        )}

        <Field label="Return condition / notes" hint="Optional note about the copy's condition.">
          <input
            type="text"
            value={returnNotes}
            onChange={(event) => setReturnNotes(event.target.value)}
            className={inputClass}
            placeholder="e.g. Good condition, returned to front desk"
          />
        </Field>
      </form>
    </Modal>
  );
}
