"use client";

import React, { useState } from "react";
import { Search, Plus, Mail, Phone, Edit2, Trash2, Users } from "lucide-react";
import { Member } from "@/lib/types";

interface MembersViewProps {
  members: Member[];
  loading: boolean;
  onSearch: (q: string) => void;
  onFilterStatus: (s: string) => void;
  statusFilter: string;
  onOpenAddModal: () => void;
  onOpenEditModal: (member: Member) => void;
  onDeleteMember: (id: number) => void;
  onViewMemberDetails: (member: Member) => void;
}

export function MembersView({
  members,
  loading,
  onSearch,
  onFilterStatus,
  statusFilter,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteMember,
  onViewMemberDetails,
}: MembersViewProps) {
  const [searchInput, setSearchInput] = useState("");

  return (
    <div className="space-y-5 p-4 md:p-8">
      <div className="flex flex-col gap-3 rounded-[1.6rem] bg-white p-4 shadow-sm ring-1 ring-[#eadfD0] lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7b68]" />
          <input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="Search a name, email, or member code"
            className="w-full rounded-2xl border border-[#eadfD0] bg-[#f7f3eb] py-3 pl-11 pr-4 text-sm outline-none focus:border-[#245c45] focus:bg-white"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Active", "Suspended"].map((status) => (
            <button
              key={status}
              onClick={() => onFilterStatus(status)}
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                statusFilter === status ? "bg-[#16352a] text-[#f6f1e7]" : "bg-[#f7f3eb] text-[#5c5348]"
              }`}
            >
              {status === "All" ? "Everyone" : status}
            </button>
          ))}
        </div>
        <button onClick={onOpenAddModal} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#16352a] px-4 py-3 text-sm font-bold text-white">
          <Plus className="h-4 w-4" /> Add a person
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#16352a] border-t-transparent" />
        </div>
      ) : members.length === 0 ? (
        <div className="rounded-[1.6rem] border border-dashed border-[#d9d0c3] bg-white/70 px-6 py-16 text-center">
          <Users className="mx-auto h-8 w-8 text-[#8a7b68]" />
          <h3 className="mt-3 font-display text-2xl">No one matches</h3>
          <p className="mt-2 text-sm text-[#6b6258]">Add a member, or search with a shorter name.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => {
            const borrowed = member.active_loans_count || 0;
            const room = Math.max(member.max_borrow_limit - borrowed, 0);
            const initials = member.name.split(" ").map((n) => n[0]).slice(0, 2).join("");
            return (
              <article key={member.id} className="rounded-[1.6rem] bg-white p-5 shadow-sm ring-1 ring-[#eadfD0]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7c9a5] font-display text-lg text-[#16352a]">
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-display text-2xl leading-tight">{member.name}</h3>
                      <p className="text-xs font-bold uppercase tracking-wide text-[#8a7b68]">{member.member_code}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#f7f3eb] px-2.5 py-1 text-xs font-bold text-[#245c45]">{member.membership_type}</span>
                </div>
                <div className="mt-4 space-y-1.5 text-sm text-[#5c5348]">
                  <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {member.email}</p>
                  {member.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {member.phone}</p>}
                </div>
                <div className="mt-4 rounded-2xl bg-[#f7f3eb] p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b6258]">Books out now</span>
                    <span className="font-bold">{borrowed} of {member.max_borrow_limit}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className={`h-full rounded-full ${borrowed >= member.max_borrow_limit ? "bg-[#c46b3a]" : "bg-[#2f6f54]"}`}
                      style={{ width: `${Math.min((borrowed / Math.max(member.max_borrow_limit, 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-[#6b6258]">
                    {member.status === "Active" ? `Can still take ${room} more` : member.status}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <button onClick={() => onViewMemberDetails(member)} className="text-sm font-bold text-[#245c45]">
                    See their books
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => onOpenEditModal(member)} aria-label="Edit member" className="rounded-xl bg-[#f7f3eb] p-2.5"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => onDeleteMember(member.id)} aria-label="Remove member" className="rounded-xl bg-[#f8e4da] p-2.5 text-[#9a4124]"><Trash2 className="h-4 w-4" /></button>
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
