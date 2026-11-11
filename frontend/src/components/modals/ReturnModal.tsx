"use client";

import React, { useState } from "react";
import { X, CheckCircle, AlertTriangle, DollarSign } from "lucide-react";
import { Loan } from "@/lib/types";

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  onSuccess: () => void;
  apiReturn: (loanId: number, data: { fine_paid?: boolean; notes?: string }) => Promise<any>;
}

export function ReturnModal({
  isOpen,
  onClose,
  loan,
  onSuccess,
  apiReturn,
}: ReturnModalProps) {
  const [finePaid, setFinePaid] = useState<boolean>(true);
  const [returnNotes, setReturnNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !loan) return null;

  const isOverdue = loan.status === "overdue" || (loan.days_overdue && loan.days_overdue > 0);
  const fine = loan.fine_amount || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiReturn(loan.id, {
        fine_paid: finePaid,
        notes: returnNotes.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to process return.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-5 w-5" />
            <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Return this book</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Book Title:</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">{loan.book_title}</span>
          </div>

          <div className="flex justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Borrower:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{loan.member_name}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Member Code:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{loan.member_code}</span>
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
            <div>
              <span className="text-slate-400 block text-[11px]">Loan Date:</span>
              <span className="text-slate-700 dark:text-slate-300">{loan.loan_date}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Due Date:</span>
              <span className={`font-semibold ${isOverdue ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"}`}>
                {loan.due_date}
              </span>
            </div>
          </div>
        </div>

        {/* Fine Notice */}
        {isOverdue && fine > 0 ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900/40 dark:bg-rose-950/30">
            <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-300 font-semibold text-xs">
              <AlertTriangle className="h-4 w-4" />
              <span>Overdue Penalty Calculated</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-300">
                {loan.days_overdue} days late ($0.50/day):
              </span>
              <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
                ${fine.toFixed(2)}
              </span>
            </div>

            <label className="mt-3 flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={finePaid}
                onChange={(e) => setFinePaid(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Mark fine as Collected / Waived at desk</span>
            </label>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
            ✓ Returned on time with zero penalty fees.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Return Condition / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Good condition, returned to front desk"
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="mt-6 flex items-center justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 disabled:opacity-50 transition"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{submitting ? "Returning..." : "Mark as returned"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

