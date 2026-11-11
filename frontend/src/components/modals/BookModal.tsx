"use client";

import React, { useState, useEffect } from "react";
import { X, BookOpen, AlertCircle } from "lucide-react";
import { Book } from "@/lib/types";

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookToEdit?: Book | null;
  onSuccess: () => void;
  apiSave: (data: Partial<Book>, id?: number) => Promise<any>;
}

export function BookModal({
  isOpen,
  onClose,
  bookToEdit,
  onSuccess,
  apiSave,
}: BookModalProps) {
  const [formData, setFormData] = useState<Partial<Book>>({
    title: "",
    author: "",
    isbn: "",
    genre: "Computer Science",
    publisher: "",
    publish_year: new Date().getFullYear(),
    total_copies: 3,
    shelf_location: "Rack A-01",
    cover_image: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookToEdit) {
      setFormData({
        title: bookToEdit.title,
        author: bookToEdit.author,
        isbn: bookToEdit.isbn,
        genre: bookToEdit.genre,
        publisher: bookToEdit.publisher || "",
        publish_year: bookToEdit.publish_year || new Date().getFullYear(),
        total_copies: bookToEdit.total_copies,
        shelf_location: bookToEdit.shelf_location || "",
        cover_image: bookToEdit.cover_image || "",
        description: bookToEdit.description || "",
      });
    } else {
      setFormData({
        title: "",
        author: "",
        isbn: `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        genre: "Computer Science",
        publisher: "Universal Press",
        publish_year: new Date().getFullYear(),
        total_copies: 3,
        shelf_location: "Rack A-01",
        cover_image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600",
        description: "",
      });
    }
    setError(null);
  }, [bookToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.isbn || !formData.genre) {
      setError("Please fill in Title, Author, ISBN, and Genre.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await apiSave(formData, bookToEdit?.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save book.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="h-5 w-5" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {bookToEdit ? "Edit this book" : "Add a book"}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Book Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="e.g. Clean Architecture"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Author *
              </label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="e.g. Robert C. Martin"
              />
            </div>

            {/* ISBN */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                ISBN Code *
              </label>
              <input
                type="text"
                required
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="978-..."
              />
            </div>

            {/* Genre */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Genre / Category *
              </label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {[
                  "Computer Science",
                  "Classic Literature",
                  "Sci-Fi",
                  "History",
                  "Psychology",
                  "Self-Help",
                  "Astrophysics",
                  "Finance",
                  "Philosophy",
                  "Mathematics",
                  "Biography",
                ].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Copies */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Total Physical Copies
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.total_copies}
                onChange={(e) => setFormData({ ...formData, total_copies: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Shelf Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Shelf Location / Rack
              </label>
              <input
                type="text"
                value={formData.shelf_location}
                onChange={(e) => setFormData({ ...formData, shelf_location: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="e.g. Rack CS-04"
              />
            </div>

            {/* Publisher */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Publisher
              </label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="e.g. O'Reilly Media"
              />
            </div>

            {/* Cover Image URL */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Cover Image URL
              </label>
              <input
                type="url"
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Book Summary / Synopsis
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="Short description of the book..."
              />
            </div>
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
              {submitting ? "Saving..." : bookToEdit ? "Save changes" : "Add this book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

