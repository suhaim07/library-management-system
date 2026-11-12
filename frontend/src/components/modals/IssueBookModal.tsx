"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  AlertCircle,
  Loader2,
  BookOpen,
  User,
  Check,
} from "lucide-react";
import { Book, Member } from "@/lib/types";
import { Button, Field, Modal, cn, inputClass } from "@/components/ui";

interface IssueBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  members: Member[];
  initialBookId?: number;
  onIssueSuccess: () => void;
  apiIssue: (data: {
    book_id: number;
    member_id: number;
    due_days: number;
    notes?: string;
  }) => Promise<unknown>;
}

const durations = [
  { days: 7, label: "1 week" },
  { days: 14, label: "2 weeks" },
  { days: 21, label: "3 weeks" },
  { days: 30, label: "1 month" },
];

export function IssueBookModal({
  isOpen,
  onClose,
  books,
  members,
  initialBookId,
  onIssueSuccess,
  apiIssue,
}: IssueBookModalProps) {
  const [selectedBookId, setSelectedBookId] = useState<number>(0);
  const [selectedMemberId, setSelectedMemberId] = useState<number>(0);
  const [dueDays, setDueDays] = useState<number>(14);
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const requested = books.find((book) => book.id === initialBookId);
    const firstAvailable = books.find((book) => book.available_copies > 0) ?? books[0];
    setSelectedBookId(requested?.id ?? firstAvailable?.id ?? 0);
    const firstActive = members.find((member) => member.status === "Active") ?? members[0];
    setSelectedMemberId(firstActive?.id ?? 0);
    setDueDays(14);
    setNotes("");
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialBookId]);

  const selectedBook = books.find((book) => book.id === selectedBookId);
  const selectedMember = members.find((member) => member.id === selectedMemberId);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to issue the book.");
    } finally {
      setSubmitting(false);
    }
  };

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + dueDays);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      icon={<ArrowLeftRight className="h-5 w-5" />}
      title="Check out a book"
      subtitle="Pair a title with a member and set the due date."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="issue-form" size="sm" disabled={submitting}>
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowLeftRight className="h-3.5 w-3.5" />
            )}
            {submitting ? "Checking out..." : "Confirm checkout"}
          </Button>
        </div>
      }
    >
      <form id="issue-form" onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div className="flex items-center gap-2 rounded-xl bg-[#fbe9e2] px-3.5 py-3 text-xs font-semibold text-[#a53f29] ring-1 ring-[#f0d3c8]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <Field
          label="Book"
          required
          hint={
            selectedBook
              ? `${selectedBook.available_copies} of ${selectedBook.total_copies} copies available · ${selectedBook.shelf_location || "General shelf"}`
              : undefined
          }
        >
          <div className="relative">
            <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a9187]" />
            <select
              value={selectedBookId}
              onChange={(event) => setSelectedBookId(Number(event.target.value))}
              className={cn(inputClass, "pl-9")}
            >
              <option value={0} disabled>
                Select a book
              </option>
              {books.map((book) => (
                <option key={book.id} value={book.id} disabled={book.available_copies <= 0}>
                  {book.title} — {book.author} ({book.available_copies} available)
                  {book.available_copies <= 0 ? " · out of stock" : ""}
                </option>
              ))}
            </select>
          </div>
        </Field>

        <Field
          label="Member"
          required
          hint={
            selectedMember
              ? `${selectedMember.membership_type} · ${selectedMember.active_loans_count ?? 0} of ${selectedMember.max_borrow_limit} books out · ${selectedMember.status}`
              : undefined
          }
        >
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a9187]" />
            <select
              value={selectedMemberId}
              onChange={(event) => setSelectedMemberId(Number(event.target.value))}
              className={cn(inputClass, "pl-9")}
            >
              <option value={0} disabled>
                Select a member
              </option>
              {members.map((member) => {
                const atLimit = (member.active_loans_count ?? 0) >= member.max_borrow_limit;
                return (
                  <option
                    key={member.id}
                    value={member.id}
                    disabled={member.status !== "Active" || atLimit}
                  >
                    {member.name} ({member.member_code}) — {member.membership_type}
                    {member.status !== "Active"
                      ? ` · ${member.status}`
                      : atLimit
                        ? " · at limit"
                        : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </Field>

        <Field label="Loan duration">
          <div className="grid grid-cols-4 gap-2">
            {durations.map((option) => (
              <button
                type="button"
                key={option.days}
                onClick={() => setDueDays(option.days)}
                className={cn(
                  "rounded-xl py-2.5 text-xs font-bold transition",
                  dueDays === option.days
                    ? "bg-[#0f3d2e] text-[#f7f3ec] shadow-sm"
                    : "bg-[#fbf9f4] text-[#5c645b] ring-1 ring-[#e3dccd] hover:bg-[#f1ece2]"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Notes" hint="Optional internal note for this checkout.">
          <input
            type="text"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className={inputClass}
            placeholder="e.g. Course assignment, research project..."
          />
        </Field>

        <div className="rounded-2xl bg-[#f2f8f4] p-4 ring-1 ring-[#cfe6d9]">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1f6a4a]">
            <Check className="h-4 w-4" /> Ready to check out
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-[#4c6b5c]">
            <span className="font-bold text-[#17201b]">
              {selectedBook?.title ?? "No book selected"}
            </span>{" "}
            goes to{" "}
            <span className="font-bold text-[#17201b]">
              {selectedMember?.name ?? "no member selected"}
            </span>{" "}
            and is due on{" "}
            <span className="font-bold text-[#17201b]">
              {dueDate.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
            .
          </p>
        </div>
      </form>
    </Modal>
  );
}
