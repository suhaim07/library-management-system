"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Member } from "@/lib/types";
import { api } from "@/lib/api";
import { Badge, Button, LoadingState, Modal, cn } from "@/components/ui";

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export function MemberDetailModal({ isOpen, onClose, member }: MemberDetailModalProps) {
  const [memberDetails, setMemberDetails] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !member) return;
    setMemberDetails(null);
    setLoading(true);
    api
      .getMember(member.id)
      .then((data) => setMemberDetails(data))
      .catch(() => setMemberDetails(member))
      .finally(() => setLoading(false));
  }, [member, isOpen]);

  if (!member) return null;

  const details = memberDetails ?? member;
  const loans = details.loans ?? [];
  const activeLoans = loans.filter((loan) => loan.status !== "returned").length;
  const totalFines = loans.reduce((sum, loan) => sum + (loan.fine_amount || 0), 0);
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="lg"
      icon={<User className="h-5 w-5" />}
      title="Member profile"
      subtitle={`${member.member_code} · ${member.membership_type}`}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-[#8a9187]">
            Total fines recorded: <span className="font-bold text-[#17201b]">${totalFines.toFixed(2)}</span>
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f3d2e] to-[#2f7d5b] font-display text-2xl text-white shadow-inner">
          {initials}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-2xl font-bold text-[#17201b]">{member.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge tone={member.status === "Active" ? "success" : "danger"}>
              {member.status}
            </Badge>
            <Badge tone="gold">{member.membership_type}</Badge>
            <span className="text-xs text-[#8a9187]">
              {activeLoans} active · {member.max_borrow_limit} book limit
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#fbf9f4] p-3.5 ring-1 ring-[#f0eade]">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#9aa196]">
            <Mail className="h-3.5 w-3.5" /> Email
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-[#3f4a43]">{member.email}</p>
        </div>
        <div className="rounded-2xl bg-[#fbf9f4] p-3.5 ring-1 ring-[#f0eade]">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#9aa196]">
            <Phone className="h-3.5 w-3.5" /> Phone
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-[#3f4a43]">
            {member.phone || "Not provided"}
          </p>
        </div>
        <div className="rounded-2xl bg-[#fbf9f4] p-3.5 ring-1 ring-[#f0eade] sm:col-span-2">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#9aa196]">
            <MapPin className="h-3.5 w-3.5" /> Address / department
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-[#3f4a43]">
            {member.address || "Not provided"}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-[#17201b]">Circulation history</h4>
          <span className="text-xs text-[#8a9187]">{loans.length} records</span>
        </div>

        {loading ? (
          <LoadingState label="Loading history..." />
        ) : loans.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-[#ddd4c4] px-4 py-8 text-center text-sm text-[#8a9187]">
            No borrowing activity recorded for this member yet.
          </div>
        ) : (
          <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
            {loans.map((loan) => {
              const returned = loan.status === "returned";
              const late = !returned && (loan.status === "overdue" || (loan.days_overdue ?? 0) > 0);
              return (
                <div
                  key={loan.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-[#fbf9f4] px-3.5 py-3 ring-1 ring-[#f0eade]"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        returned
                          ? "bg-[#e6f2ea] text-[#2f7d5b]"
                          : late
                            ? "bg-[#fbe9e2] text-[#b4462f]"
                            : "bg-[#f7ecd4] text-[#a9761f]"
                      )}
                    >
                      {returned ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : late ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#17201b]">
                        {loan.book_title}
                      </p>
                      <p className="truncate text-[11px] text-[#8a9187]">
                        {loan.book_author ? `${loan.book_author} · ` : ""}
                        Out {loan.loan_date} · Due {loan.due_date}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge tone={returned ? "success" : late ? "danger" : "warn"}>
                      {returned ? "Returned" : late ? "Late" : "On loan"}
                    </Badge>
                    {(loan.fine_amount ?? 0) > 0 ? (
                      <p className="mt-1 text-[10px] font-bold text-[#a53f29]">
                        ${loan.fine_amount.toFixed(2)}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
