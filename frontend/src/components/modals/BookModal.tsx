"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { Book } from "@/lib/types";
import {
  Button,
  Field,
  Modal,
  cn,
  inputClass,
} from "@/components/ui";

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookToEdit?: Book | null;
  onSuccess: () => void;
  apiSave: (data: Partial<Book>, id?: number) => Promise<unknown>;
}

const genres = [
  "Computer Science",
  "Classic Literature",
  "Sci-Fi",
  "Fantasy",
  "Mystery",
  "History",
  "Psychology",
  "Self-Help",
  "Astrophysics",
  "Finance",
  "Philosophy",
  "Mathematics",
  "Biography",
];

const emptyForm: Partial<Book> = {
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
};

export function BookModal({ isOpen, onClose, bookToEdit, onSuccess, apiSave }: BookModalProps) {
  const [formData, setFormData] = useState<Partial<Book>>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
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
        ...emptyForm,
        isbn: `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      });
    }
    setError(null);
  }, [bookToEdit, isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.title || !formData.author || !formData.isbn || !formData.genre) {
      setError("Please fill in the title, author, ISBN, and genre.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiSave(formData, bookToEdit?.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save the book.");
    } finally {
      setSubmitting(false);
    }
  };

  const genreOptions = Array.from(new Set([...genres, formData.genre || ""])).filter(Boolean);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="lg"
      icon={<BookOpen className="h-5 w-5" />}
      title={bookToEdit ? "Edit this book" : "Add a book"}
      subtitle={
        bookToEdit
          ? "Update the details of this title in the catalog."
          : "Add a new title to the collection."
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="book-form" size="sm" disabled={submitting}>
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {submitting ? "Saving..." : bookToEdit ? "Save changes" : "Add this book"}
          </Button>
        </div>
      }
    >
      <form id="book-form" onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div className="flex items-center gap-2 rounded-xl bg-[#fbe9e2] px-3.5 py-3 text-xs font-semibold text-[#a53f29] ring-1 ring-[#f0d3c8]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="flex gap-4">
          <div
            className={cn(
              "hidden h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#0f3d2e] to-[#3f8a68] ring-1 ring-[#e3dccd] sm:block"
            )}
          >
            {formData.cover_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={formData.cover_image}
                alt=""
                className="h-full w-full object-cover"
                onError={(event) => {
                  (event.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/60">
                <ImageIcon className="h-6 w-6" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <Field label="Book title" required>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                className={inputClass}
                placeholder="e.g. Clean Architecture"
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Author" required>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(event) => setFormData({ ...formData, author: event.target.value })}
                  className={inputClass}
                  placeholder="e.g. Robert C. Martin"
                />
              </Field>
              <Field label="ISBN" required>
                <input
                  type="text"
                  required
                  value={formData.isbn}
                  onChange={(event) => setFormData({ ...formData, isbn: event.target.value })}
                  className={inputClass}
                  placeholder="978-..."
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Genre / category" required>
            <select
              value={formData.genre}
              onChange={(event) => setFormData({ ...formData, genre: event.target.value })}
              className={inputClass}
            >
              {genreOptions.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Publisher">
            <input
              type="text"
              value={formData.publisher}
              onChange={(event) => setFormData({ ...formData, publisher: event.target.value })}
              className={inputClass}
              placeholder="e.g. O'Reilly Media"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Total copies">
            <input
              type="number"
              min={1}
              max={500}
              value={formData.total_copies}
              onChange={(event) =>
                setFormData({ ...formData, total_copies: Number(event.target.value) })
              }
              className={inputClass}
            />
          </Field>
          <Field label="Publish year">
            <input
              type="number"
              min={0}
              max={new Date().getFullYear()}
              value={formData.publish_year}
              onChange={(event) =>
                setFormData({ ...formData, publish_year: Number(event.target.value) })
              }
              className={inputClass}
            />
          </Field>
          <Field label="Shelf / rack">
            <input
              type="text"
              value={formData.shelf_location}
              onChange={(event) =>
                setFormData({ ...formData, shelf_location: event.target.value })
              }
              className={inputClass}
              placeholder="Rack CS-04"
            />
          </Field>
        </div>

        <Field label="Cover image URL" hint="Optional. Leave empty to use a generated cover.">
          <input
            type="url"
            value={formData.cover_image}
            onChange={(event) => setFormData({ ...formData, cover_image: event.target.value })}
            className={inputClass}
            placeholder="https://..."
          />
        </Field>

        <Field label="Description / synopsis">
          <textarea
            rows={3}
            value={formData.description}
            onChange={(event) => setFormData({ ...formData, description: event.target.value })}
            className={cn(inputClass, "resize-none")}
            placeholder="A short description of the book..."
          />
        </Field>
      </form>
    </Modal>
  );
}
