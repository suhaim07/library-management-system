"use client";

import React, { useEffect, useState } from "react";
import { Users, AlertCircle, Loader2 } from "lucide-react";
import { Member } from "@/lib/types";
import { Button, Field, Modal, cn, inputClass } from "@/components/ui";

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: Member | null;
  onSuccess: () => void;
  apiSave: (data: Partial<Member>, id?: number) => Promise<unknown>;
}

const membershipLimits: Record<string, number> = {
  Student: 5,
  Standard: 5,
  Premium: 8,
  Faculty: 12,
};

const emptyForm: Partial<Member> = {
  name: "",
  email: "",
  phone: "",
  address: "",
  membership_type: "Student",
  max_borrow_limit: 5,
  status: "Active",
};

export function MemberModal({
  isOpen,
  onClose,
  memberToEdit,
  onSuccess,
  apiSave,
}: MemberModalProps) {
  const [formData, setFormData] = useState<Partial<Member>>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (memberToEdit) {
      setFormData({
        name: memberToEdit.name,
        email: memberToEdit.email,
        phone: memberToEdit.phone || "",
        address: memberToEdit.address || "",
        membership_type: memberToEdit.membership_type,
        max_borrow_limit: memberToEdit.max_borrow_limit,
        status: memberToEdit.status,
      });
    } else {
      setFormData(emptyForm);
    }
    setError(null);
  }, [memberToEdit, isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.name || !formData.email) {
      setError("Please provide a name and email address.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload: Partial<Member> = { ...formData };
      if (!memberToEdit) delete payload.status;
      await apiSave(payload, memberToEdit?.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save the member.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      icon={<Users className="h-5 w-5" />}
      title={memberToEdit ? "Edit this member" : "Add a member"}
      subtitle={
        memberToEdit
          ? "Update contact details, tier, and borrowing limits."
          : "Register a new reader at the desk."
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="member-form" size="sm" disabled={submitting}>
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {submitting ? "Saving..." : memberToEdit ? "Save changes" : "Add this member"}
          </Button>
        </div>
      }
    >
      <form id="member-form" onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div className="flex items-center gap-2 rounded-xl bg-[#fbe9e2] px-3.5 py-3 text-xs font-semibold text-[#a53f29] ring-1 ring-[#f0d3c8]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <Field label="Full name" required>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            className={inputClass}
            placeholder="e.g. Eleanor Vance"
          />
        </Field>

        <Field label="Email address" required>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
            className={inputClass}
            placeholder="eleanor@university.edu"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Phone number">
            <input
              type="text"
              value={formData.phone}
              onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
              className={inputClass}
              placeholder="+1 (555) 000-0000"
            />
          </Field>

          <Field label="Membership tier">
            <select
              value={formData.membership_type}
              onChange={(event) => {
                const value = event.target.value;
                setFormData({
                  ...formData,
                  membership_type: value,
                  max_borrow_limit: membershipLimits[value] ?? formData.max_borrow_limit,
                });
              }}
              className={inputClass}
            >
              <option value="Student">Student · 5 books</option>
              <option value="Faculty">Faculty · 12 books</option>
              <option value="Premium">Premium · 8 books</option>
              <option value="Standard">Standard · 5 books</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Borrow limit" hint="Maximum books out at one time.">
            <input
              type="number"
              min={1}
              max={50}
              value={formData.max_borrow_limit}
              onChange={(event) =>
                setFormData({ ...formData, max_borrow_limit: Number(event.target.value) })
              }
              className={inputClass}
            />
          </Field>

          {memberToEdit ? (
            <Field label="Account status">
              <select
                value={formData.status}
                onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                className={inputClass}
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Expired">Expired</option>
              </select>
            </Field>
          ) : (
            <Field label="Account status" hint="New members start as Active.">
              <input
                type="text"
                value="Active"
                disabled
                className={cn(inputClass, "opacity-70")}
              />
            </Field>
          )}
        </div>

        <Field label="Address / department">
          <input
            type="text"
            value={formData.address}
            onChange={(event) => setFormData({ ...formData, address: event.target.value })}
            className={inputClass}
            placeholder="Campus Hall B, Room 304"
          />
        </Field>
      </form>
    </Modal>
  );
}
