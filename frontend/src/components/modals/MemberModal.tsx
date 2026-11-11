"use client";

import React, { useState, useEffect } from "react";
import { X, Users, AlertCircle } from "lucide-react";
import { Member } from "@/lib/types";

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: Member | null;
  onSuccess: () => void;
  apiSave: (data: Partial<Member>, id?: number) => Promise<any>;
}

export function MemberModal({
  isOpen,
  onClose,
  memberToEdit,
  onSuccess,
  apiSave,
}: MemberModalProps) {
  const [formData, setFormData] = useState<Partial<Member>>({
    name: "",
    email: "",
    phone: "",
    address: "",
    membership_type: "Standard",
    max_borrow_limit: 5,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (memberToEdit) {
      setFormData({
        name: memberToEdit.name,
        email: memberToEdit.email,
        phone: memberToEdit.phone || "",
        address: memberToEdit.address || "",
        membership_type: memberToEdit.membership_type,
        max_borrow_limit: memberToEdit.max_borrow_limit,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        membership_type: "Student",
        max_borrow_limit: 5,
      });
    }
    setError(null);
  }, [memberToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setError("Please provide Name and Email.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await apiSave(formData, memberToEdit?.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save member.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
            <Users className="h-5 w-5" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {memberToEdit ? "Edit this person" : "Add a person"}
            </h3>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="e.g. Eleanor Vance"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="eleanor@university.edu"
            />
          </div>

          {/* Phone & Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Membership Tier
              </label>
              <select
                value={formData.membership_type}
                onChange={(e) => {
                  const val = e.target.value;
                  const limit = val === "Faculty" ? 12 : val === "Premium" ? 8 : 5;
                  setFormData({ ...formData, membership_type: val, max_borrow_limit: limit });
                }}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="Student">Student (5 books)</option>
                <option value="Faculty">Faculty (12 books)</option>
                <option value="Premium">Premium Patron (8 books)</option>
                <option value="Standard">Standard (5 books)</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Address / Department
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="Campus Hall B, Room 304"
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
              className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-50 transition"
            >
              {submitting ? "Saving..." : memberToEdit ? "Save changes" : "Add this person"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

