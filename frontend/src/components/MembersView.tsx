"use client";

import React, { useState } from "react";
import {
  Plus,
  Mail,
  Phone,
  Edit2,
  Trash2,
  Users,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { Member } from "@/lib/types";
import {
  Badge,
  Button,
  EmptyState,
  LoadingState,
  SearchInput,
  Segmented,
  cn,
} from "@/components/ui";

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

const avatarTones = [
  "from-[#0f3d2e] to-[#2f7d5b]",
  "from-[#3d2a1c] to-[#b07a3f]",
  "from-[#1d3557] to-[#4a7fa8]",
  "from-[#4d2433] to-[#a9586d]",
  "from-[#34384f] to-[#7f9f8b]",
];

function toneFor(name: string) {
  const sum = name.split("").reduce((n, c) => n + c.charCodeAt(0), 0);
  return avatarTones[sum % avatarTones.length];
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

  const tabs = [
    { id: "All", label: "Everyone" },
    { id: "Active", label: "Active" },
    { id: "Suspended", label: "Suspended" },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-5 p-4 md:p-8">
      <div className="rounded-3xl bg-white p-4 shadow-[0_1px_2px_rgba(20,30,25,0.04),0_18px_40px_-30px_rgba(20,30,25,0.4)] ring-1 ring-[#e7e0d3] md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            className="flex-1"
            value={searchInput}
            onChange={(value) => {
              setSearchInput(value);
              onSearch(value);
            }}
            placeholder="Search a name, email, or member code"
          />
          <Segmented tabs={tabs} value={statusFilter} onChange={onFilterStatus} />
          <Button onClick={onOpenAddModal}>
            <Plus className="h-4 w-4" /> Add a member
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingState label="Opening the member directory..." />
      ) : members.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No one matches that search"
          description="Try a shorter name, clear the status filter, or register a new member."
          action={
            <Button onClick={onOpenAddModal}>
              <Plus className="h-4 w-4" /> Add a member
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => {
            const borrowed = member.active_loans_count ?? 0;
            const room = Math.max(member.max_borrow_limit - borrowed, 0);
            const active = member.status === "Active";
            const atLimit = borrowed >= member.max_borrow_limit;
            const initials = member.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("");
            const percentage = Math.min(
              (borrowed / Math.max(member.max_borrow_limit, 1)) * 100,
              100
            );

            return (
              <article
                key={member.id}
                className="group flex flex-col rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(20,30,25,0.04),0_18px_40px_-30px_rgba(20,30,25,0.4)] ring-1 ring-[#e7e0d3] transition hover:-translate-y-0.5 hover:shadow-[0_24px_44px_-30px_rgba(20,30,25,0.5)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br font-display text-lg text-white shadow-inner",
                        toneFor(member.name)
                      )}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold leading-tight text-[#17201b]">
                        {member.name}
                      </h3>
                      <p className="truncate text-[11px] font-bold uppercase tracking-wide text-[#9aa196]">
                        {member.member_code}
                      </p>
                    </div>
                  </div>
                  <Badge tone={active ? "success" : "danger"}>{member.status}</Badge>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-[#6b7269]">
                  <p className="flex items-center gap-2 truncate">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-[#9aa196]" />
                    <span className="truncate">{member.email}</span>
                  </p>
                  {member.phone ? (
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-[#9aa196]" />
                      {member.phone}
                    </p>
                  ) : null}
                  {member.address ? (
                    <p className="flex items-center gap-2 truncate">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#9aa196]" />
                      <span className="truncate">{member.address}</span>
                    </p>
                  ) : null}
                </div>

                <div className="mt-4 rounded-2xl bg-[#fbf9f4] p-3.5 ring-1 ring-[#f0eade]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#6b7269]">Borrowing</span>
                    <span className="font-bold text-[#17201b]">
                      {borrowed} / {member.max_borrow_limit}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#efe9dd]">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        atLimit ? "bg-[#b4462f]" : "bg-[#2f7d5b]"
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-[#8a9187]">
                      {active
                        ? atLimit
                          ? "At their limit"
                          : `Can take ${room} more`
                        : "Account not active"}
                    </span>
                    <Badge tone="gold">{member.membership_type}</Badge>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                  <button
                    onClick={() => onViewMemberDetails(member)}
                    className="inline-flex items-center gap-1 text-sm font-bold text-[#2f7d5b] transition hover:text-[#0f3d2e]"
                  >
                    View history
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onOpenEditModal(member)}
                      aria-label="Edit member"
                      title="Edit member"
                      className="rounded-xl bg-[#f1ece2] p-2.5 text-[#0f3d2e] transition hover:bg-[#e9e2d4]"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteMember(member.id)}
                      aria-label="Remove member"
                      title="Remove member"
                      className="rounded-xl bg-[#fbe9e2] p-2.5 text-[#a53f29] transition hover:bg-[#f6ddd3]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
