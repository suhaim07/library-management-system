"use client";

import React, { useState } from "react";
import { Search, Plus, BookOpen, MapPin, Edit2, Trash2, Bookmark, LayoutGrid, List as ListIcon } from "lucide-react";
import { Book } from "@/lib/types";

interface BooksViewProps {
  books: Book[];
  genres: string[];
  loading: boolean;
  onSearch: (q: string) => void;
  onFilterGenre: (g: string) => void;
  selectedGenre: string;
  availableOnly: boolean;
  setAvailableOnly: (v: boolean) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (book: Book) => void;
  onDeleteBook: (id: number) => void;
  onQuickIssue: (book: Book) => void;
  onReserveBook: (book: Book) => void;
}

const coverTones = [
  "from-[#1b4332] to-[#40916c]",
  "from-[#6b3e26] to-[#c47b4a]",
  "from-[#1d3557] to-[#457b9d]",
  "from-[#5c2a3a] to-[#b56576]",
  "from-[#3d405b] to-[#81b29a]",
];

function toneFor(title: string) {
  const sum = title.split("").reduce((n, c) => n + c.charCodeAt(0), 0);
  return coverTones[sum % coverTones.length];
}

export function BooksView({
  books,
  genres,
  loading,
  onSearch,
  onFilterGenre,
  selectedGenre,
  availableOnly,
  setAvailableOnly,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteBook,
  onQuickIssue,
  onReserveBook,
}: BooksViewProps) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchInput, setSearchInput] = useState("");

  return (
    <div className="space-y-5 p-4 md:p-8">
      <div className="rounded-[1.6rem] bg-white p-4 shadow-sm ring-1 ring-[#eadfD0] md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8a7b68]" />
            <input
              type="text"
              placeholder="Search by title, author, or ISBN"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                onSearch(e.target.value);
              }}
              className="w-full rounded-2xl border border-[#eadfD0] bg-[#f7f3eb] py-3.5 pl-12 pr-4 text-base text-[#1c1917] outline-none placeholder:text-[#8a7b68] focus:border-[#245c45] focus:bg-white"
            />
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#f7f3eb] px-4 py-3 text-sm font-bold text-[#3f4a43]">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="h-4 w-4 accent-[#245c45]"
            />
            Only books in stock
          </label>
          <div className="flex rounded-2xl bg-[#f7f3eb] p-1">
            <button onClick={() => setViewMode("grid")} className={`rounded-xl px-3 py-2 ${viewMode === "grid" ? "bg-white text-[#16352a] shadow-sm" : "text-[#6b6258]"}`} aria-label="Card view">
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode("table")} className={`rounded-xl px-3 py-2 ${viewMode === "table" ? "bg-white text-[#16352a] shadow-sm" : "text-[#6b6258]"}`} aria-label="List view">
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
          <button onClick={onOpenAddModal} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#16352a] px-4 py-3 text-sm font-bold text-white">
            <Plus className="h-4 w-4" /> Add a book
          </button>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {["All", ...genres].map((genre) => (
            <button
              key={genre}
              onClick={() => onFilterGenre(genre)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-bold ${
                selectedGenre === genre ? "bg-[#16352a] text-[#f6f1e7]" : "bg-[#f7f3eb] text-[#5c5348] hover:bg-[#efe7db]"
              }`}
            >
              {genre === "All" ? "Every genre" : genre}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#16352a] border-t-transparent" />
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="No books match that search"
          text="Try another word, clear the genre, or add the title if it is new."
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {books.map((book) => {
            const inStock = book.available_copies > 0;
            return (
              <article key={book.id} className="flex flex-col overflow-hidden rounded-[1.6rem] bg-white shadow-sm ring-1 ring-[#eadfD0]">
                <div className={`relative h-40 bg-gradient-to-br ${toneFor(book.title)}`}>
                  {book.cover_image ? (
                    <img
                      src={book.cover_image}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-[#1c1917]">{book.genre}</span>
                  <p className="absolute bottom-3 left-3 right-3 font-display text-xl leading-tight text-white line-clamp-2">{book.title}</p>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-sm font-semibold text-[#6b6258]">{book.author}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[#5c5348]">
                    <span className="rounded-full bg-[#f7f3eb] px-2.5 py-1">{book.isbn}</span>
                    {book.shelf_location && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#f7f3eb] px-2.5 py-1">
                        <MapPin className="h-3 w-3" /> {book.shelf_location}
                      </span>
                    )}
                  </div>
                  <p className={`mt-4 text-sm font-bold ${inStock ? "text-[#1c4a38]" : "text-[#9a4124]"}`}>
                    {inStock ? `${book.available_copies} of ${book.total_copies} ready to borrow` : "All copies are out"}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => onQuickIssue(book)}
                      disabled={!inStock}
                      className="flex-1 rounded-xl bg-[#16352a] px-3 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-[#d9d0c3] disabled:text-[#6b6258]"
                    >
                      {inStock ? "Check out" : "Unavailable"}
                    </button>
                    <IconButton label="Place a hold" onClick={() => onReserveBook(book)}><Bookmark className="h-4 w-4" /></IconButton>
                    <IconButton label="Edit book" onClick={() => onOpenEditModal(book)}><Edit2 className="h-4 w-4" /></IconButton>
                    <IconButton label="Remove book" danger onClick={() => onDeleteBook(book.id)}><Trash2 className="h-4 w-4" /></IconButton>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[1.6rem] bg-white shadow-sm ring-1 ring-[#eadfD0]">
          <table className="w-full text-left text-sm">
            <thead className="text-[#6b6258]">
              <tr>
                <th className="px-5 py-4 font-semibold">Book</th>
                <th className="px-5 py-4 font-semibold">Genre</th>
                <th className="px-5 py-4 font-semibold">Shelf</th>
                <th className="px-5 py-4 font-semibold">Ready</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => {
                const inStock = book.available_copies > 0;
                return (
                  <tr key={book.id} className="border-t border-[#f0e8dc]">
                    <td className="px-5 py-4">
                      <p className="font-bold">{book.title}</p>
                      <p className="text-[#6b6258]">{book.author}</p>
                    </td>
                    <td className="px-5 py-4">{book.genre}</td>
                    <td className="px-5 py-4">{book.shelf_location || "—"}</td>
                    <td className="px-5 py-4 font-bold">{book.available_copies}/{book.total_copies}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button disabled={!inStock} onClick={() => onQuickIssue(book)} className="rounded-xl bg-[#16352a] px-3 py-2 text-xs font-bold text-white disabled:opacity-40">Check out</button>
                        <button onClick={() => onOpenEditModal(book)} className="rounded-xl bg-[#f7f3eb] px-3 py-2 text-xs font-bold">Edit</button>
                        <button onClick={() => onDeleteBook(book.id)} className="rounded-xl bg-[#f8e4da] px-3 py-2 text-xs font-bold text-[#9a4124]">Remove</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function IconButton({ children, onClick, label, danger }: { children: React.ReactNode; onClick: () => void; label: string; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded-xl p-2.5 ${danger ? "bg-[#f8e4da] text-[#9a4124]" : "bg-[#f7f3eb] text-[#16352a]"}`}
    >
      {children}
    </button>
  );
}

function EmptyState({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-[1.6rem] border border-dashed border-[#d9d0c3] bg-white/70 px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f7f3eb] text-[#6b6258]">{icon}</div>
      <h3 className="mt-4 font-display text-2xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#6b6258]">{text}</p>
    </div>
  );
}
