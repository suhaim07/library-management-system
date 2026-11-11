"use client";

import React, { useState, useEffect } from "react";
import { X, User, BookOpen, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Member, Loan } from "@/lib/types";
import { api } from "@/lib/api";

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export function MemberDetailModal({ isOpen, onClose, member }: MemberDetailModalProps) {
  const [memberDetails, setMemberDetails] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member && isOpen) {
      setLoading(true);
      api.getMember(member.id)
        .then((data) => setMemberDetails(data))
        .catch(() => setMemberDetails(member))
        .finally(() => setLoading(false));
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const loans = memberDetails?.loans || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              {member.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{member.name}</h3>
              <p className="text-xs text-slate-400 font-mono">{member.member_code} • {member.membership_type}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Member Profile Quick Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Email</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{member.email}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Borrow Limit</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{member.max_borrow_limit} books max</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Status</span>
            <span className="inline-flex items-center space-x-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              <span>{member.status}</span>
            </span>
          </div>
        </div>

        {/* Borrowing History */}
        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Circulation History ({loans.length} records)
          </h4>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading history...</div>
          ) : loans.length === 0 ? (
            <div className="mt-3 rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-slate-800">
              No borrowing activity recorded for this member.
            </div>
          ) : (
            <div className="mt-3 max-h-64 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
              {loans.map((l) => (
                <div key={l.id} className="flex items-center justify-between p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{l.book_title}</p>
                    <p className="text-[11px] text-slate-400">
                      Loaned: {l.loan_date} • Due: {l.due_date}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        l.status === "returned"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : l.status === "overdue"
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                          : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                      }`}
                    >
                      {l.status}
                    </span>
                    {l.fine_amount > 0 && (
                      <p className="mt-0.5 text-[10px] text-rose-500 font-semibold">
                        Fine: ${l.fine_amount.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

