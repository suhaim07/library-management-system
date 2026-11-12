"use client";

import React, { useEffect, useState } from "react";
import { Bookmark, AlertCircle, Loader2, User, BookOpen } from "lucide-react";
import { Book, Member } from "@/lib/types";
import { Button, Field, Modal, cn, inputClass } from "@/components/ui";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  members: Member[];
  onConfirm: (memberId: number) => Promise<unknown>;
}

export function ReservationModal({
  isOpen,
  onClose,
  book,
  members,
  onConfirm,
}: ReservationModalProps) {
  const [memberId, setMemberId] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const firstActive = members.find((member) => member.status === "Active") ?? members[0];
    setMemberId(firstActive?.id ?? 0);
    setError(null);
  }, [isOpen, members]);

  if (!book) return null;

  const selectedMember = members.find((member) => member.id === memberId);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!memberId) {
      setError("Please choose a member for this hold.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(memberId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place the hold.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      icon={<Bookmark className="h-5 w-5" />}
      title="Place a hold"
      subtitle="Reserve the next available copy for a reader."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="reservation-form" size="sm" disabled={submitting}>
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Bookmark className="h-3.5 w-3.5" />
            )}
            {submitting ? "Placing hold..." : "Place hold"}
          </Button>
        </div>
      }
    >
      <form id="reservation-form" onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div className="flex items-center gap-2 rounded-xl bg-[#fbe9e2] px-3.5 py-3 text-xs font-semibold text-[#a53f29] ring-1 ring-[#f0d3c8]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="flex items-center gap-3 rounded-2xl bg-[#fbf9f4] p-4 ring-1 ring-[#f0eade]">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e6f2ea] text-[#0f3d2e]">
            <BookOpen className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#17201b]">{book.title}</p>
            <p className="truncate text-xs text-[#8a9187]">{book.author}</p>
          </div>
        </div>

        <Field
          label="Member"
          required
          hint={
            selectedMember
              ? `${selectedMember.membership_type} · ${selectedMember.active_loans_count ?? 0} of ${selectedMember.max_borrow_limit} books out`
              : undefined
          }
        >
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a9187]" />
            <select
              value={memberId}
              onChange={(event) => setMemberId(Number(event.target.value))}
              className={cn(inputClass, "pl-9")}
            >
              <option value={0} disabled>
                Select a member
              </option>
              {members.map((member) => (
                <option key={member.id} value={member.id} disabled={member.status !== "Active"}>
                  {member.name} ({member.member_code}) — {member.membership_type}
                  {member.status !== "Active" ? ` · ${member.status}` : ""}
                </option>
              ))}
            </select>
          </div>
        </Field>

        <div className="rounded-2xl border border-[#f0e3c4] bg-[#fdf8ec] px-4 py-3 text-xs leading-relaxed text-[#8a6516]">
          The member will join the waiting list. You can hand over the book from the Holds
          page as soon as a copy comes back.
        </div>
      </form>
    </Modal>
  );
}
