"use client";

import React, { useState } from "react";
import { X, ArrowLeftRight, AlertCircle, BookOpen, User } from "lucide-react";
import { Book, Member } from "@/lib/types";

interface IssueBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  members: Member[];
  initialBookId?: number;
  onIssueSuccess: () => void;
  apiIssue: (data: { book_id: number; member_id: number; due_days: number; notes?: string }) => Promise<any>;
}

export function IssueBookModal({
  isOpen,
  onClose,
  books,
  members,
  initialBookId,
  onIssueSuccess,
  apiIssue,
}: IssueBookModalProps) {
  const [selectedBookId, setSelectedBookId] = useState<number>(initialBookId || (books[0]?.id ?? 0));
  const [selectedMemberId, setSelectedMemberId] = useState<number>(members[0]?.id ?? 0);
  const [dueDays, setDueDays] = useState<number>(14);
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !selectedMemberId) {
      setError("Please select both a book and a member.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await apiIssue({
        book_id: Number(selectedBookId),
        member_id: Number(selectedMemberId),
        due_days: Number(dueDays),
        notes: notes.trim() || undefined,
      });
      onIssueSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to issue book.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBook = books.find((b) => b.id === Number(selectedBookId));
  const selectedMember = members.find((m) => m.id === Number(selectedMemberId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
            <ArrowLeftRight className="h-5 w-5" />
            <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Check out a book</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center space-x-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Select Book */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Book Title
            </label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id} disabled={b.available_copies <= 0}>
                  {b.title} ({b.available_copies} available / {b.total_copies} total) {b.available_copies <= 0 ? "— [OUT OF STOCK]" : ""}
                </option>
              ))}
            </select>
            {selectedBook && (
              <p className="mt-1 text-[11px] text-slate-400">
                Author: {selectedBook.author} • Shelf: {selectedBook.shelf_location || "General"}
              </p>
            )}
          </div>

          {/* Select Member */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Library Member
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id} disabled={m.status !== "Active"}>
                  {m.name} ({m.member_code}) — {m.membership_type} [{m.active_loans_count || 0}/{m.max_borrow_limit} borrowed]
                </option>
              ))}
            </select>
            {selectedMember && (
              <p className="mt-1 text-[11px] text-slate-400">
                Email: {selectedMember.email} • Status: {selectedMember.status}
              </p>
            )}
          </div>

          {/* Duration Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Loan Duration
            </label>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {[
                { days: 7, label: "7 Days" },
                { days: 14, label: "14 Days" },
                { days: 21, label: "21 Days" },
                { days: 30, label: "30 Days" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.days}
                  onClick={() => setDueDays(opt.days)}
                  className={`rounded-xl py-2 text-xs font-semibold transition ${
                    dueDays === opt.days
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Loan Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Course assignment, research project..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Buttons */}
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
              className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-50 transition"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span>{submitting ? "Checking out..." : "Confirm checkout"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

