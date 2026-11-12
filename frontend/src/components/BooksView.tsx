"use client";

import React, { useState } from "react";
import {
  Plus,
  MapPin,
  Edit2,
  Trash2,
  Bookmark,
  LayoutGrid,
  List as ListIcon,
  BookOpen,
  Library,
  Search,
} from "lucide-react";
import { Book } from "@/lib/types";
import {
  Badge,
  Button,
  EmptyState,
  LoadingState,
  SearchInput,
  cn,
} from "@/components/ui";

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
  "from-[#123c2e] to-[#3f8a68]",
  "from-[#5b3a24] to-[#c07a48]",
  "from-[#1d3557] to-[#4a7fa8]",
  "from-[#4d2433] to-[#a9586d]",
  "from-[#34384f] to-[#7f9f8b]",
  "from-[#6a4a12] to-[#c9a24a]",
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
    <div className="mx-auto max-w-[1440px] space-y-5 p-4 md:p-8">
      {/* Toolbar */}
      <div className="rounded-3xl bg-white p-4 shadow-[0_1px_2px_rgba(20,30,25,0.04),0_18px_40px_-30px_rgba(20,30,25,0.4)] ring-1 ring-[#e7e0d3] md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            className="flex-1"
            value={searchInput}
            onChange={(value) => {
              setSearchInput(value);
              onSearch(value);
            }}
            placeholder="Search by title, author, or ISBN"
          />

          <label className="inline-flex cursor-pointer select-none items-center gap-2 rounded-xl bg-[#fbf9f4] px-3.5 py-2.5 text-xs font-bold text-[#3f4a43] ring-1 ring-[#e3dccd]">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(event) => setAvailableOnly(event.target.checked)}
              className="h-4 w-4 accent-[#2f7d5b]"
            />
            In stock only
          </label>

          <div className="inline-flex rounded-xl bg-[#f1ece2] p-1">
            <button
              onClick={() => setViewMode("grid")}
              aria-label="Card view"
              className={cn(
                "rounded-lg px-3 py-2 transition",
                viewMode === "grid" ? "bg-white text-[#0f3d2e] shadow-sm" : "text-[#8a9187]"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              aria-label="List view"
              className={cn(
                "rounded-lg px-3 py-2 transition",
                viewMode === "table" ? "bg-white text-[#0f3d2e] shadow-sm" : "text-[#8a9187]"
              )}
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>

          <Button onClick={onOpenAddModal}>
            <Plus className="h-4 w-4" /> Add a book
          </Button>
        </div>

        <div className="scrollbar-none mt-4 flex gap-2 overflow-x-auto pb-1">
          {["All", ...genres].map((genre) => (
            <button
              key={genre}
              onClick={() => onFilterGenre(genre)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition",
                selectedGenre === genre
                  ? "bg-[#0f3d2e] text-[#f7f3ec] shadow-sm"
                  : "bg-[#f1ece2] text-[#5c645b] hover:bg-[#e9e2d4]"
              )}
            >
              {genre === "All" ? "Every genre" : genre}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState label="Fetching the shelves..." />
      ) : books.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="No books match that search"
          description="Try a different word, clear the genre filter, or add the title if it is new to the library."
          action={
            <Button onClick={onOpenAddModal}>
              <Plus className="h-4 w-4" /> Add a book
            </Button>
          }
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {books.map((book) => {
            const inStock = book.available_copies > 0;
            const ratio = book.total_copies
              ? Math.round((book.available_copies / book.total_copies) * 100)
              : 0;
            return (
              <article
                key={book.id}
                className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgba(20,30,25,0.04),0_18px_40px_-30px_rgba(20,30,25,0.4)] ring-1 ring-[#e7e0d3] transition hover:-translate-y-1 hover:shadow-[0_28px_50px_-30px_rgba(20,30,25,0.5)]"
              >
                <div className={cn("relative h-44 bg-gradient-to-br", toneFor(book.title))}>
                  <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_45%)]" />
                  {book.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.cover_image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(event) => {
                        (event.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#17201b]">
                      {book.genre}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold",
                      inStock ? "bg-[#e6f2ea] text-[#1f6a4a]" : "bg-[#fbe9e2] text-[#a53f29]"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        inStock ? "bg-[#2f7d5b]" : "bg-[#b4462f]"
                      )}
                    />
                    {inStock ? "Available" : "All out"}
                  </span>
                  <p className="absolute bottom-3 left-3 right-3 line-clamp-2 font-display text-lg leading-tight text-white drop-shadow">
                    {book.title}
                  </p>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <p className="truncate text-sm font-semibold text-[#6b7269]">{book.author}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold text-[#6b7269]">
                    <span className="rounded-full bg-[#f1ece2] px-2.5 py-1">{book.isbn}</span>
                    {book.shelf_location ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#f1ece2] px-2.5 py-1">
                        <MapPin className="h-3 w-3" /> {book.shelf_location}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className={inStock ? "text-[#1f6a4a]" : "text-[#a53f29]"}>
                        {book.available_copies} of {book.total_copies} ready
                      </span>
                      <span className="text-[#9aa196]">{ratio}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#f1ece2]">
                      <div
                        className={cn("h-full rounded-full", inStock ? "bg-[#2f7d5b]" : "bg-[#c98a78]")}
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-auto flex gap-2 pt-4">
                    <Button
                      size="sm"
                      className="flex-1"
                      disabled={!inStock}
                      onClick={() => onQuickIssue(book)}
                    >
                      {inStock ? "Check out" : "Unavailable"}
                    </Button>
                    <button
                      onClick={() => onReserveBook(book)}
                      aria-label="Place a hold"
                      title="Place a hold"
                      className="rounded-xl bg-[#f1ece2] p-2.5 text-[#0f3d2e] transition hover:bg-[#e9e2d4]"
                    >
                      <Bookmark className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onOpenEditModal(book)}
                      aria-label="Edit book"
                      title="Edit book"
                      className="rounded-xl bg-[#f1ece2] p-2.5 text-[#0f3d2e] transition hover:bg-[#e9e2d4]"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteBook(book.id)}
                      aria-label="Remove book"
                      title="Remove book"
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
      ) : (
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgba(20,30,25,0.04),0_18px_40px_-30px_rgba(20,30,25,0.4)] ring-1 ring-[#e7e0d3]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#fbf9f4] text-xs uppercase tracking-wide text-[#8a9187]">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Book</th>
                  <th className="px-5 py-3.5 font-bold">Genre</th>
                  <th className="px-5 py-3.5 font-bold">Shelf</th>
                  <th className="px-5 py-3.5 font-bold">Ready</th>
                  <th className="px-5 py-3.5 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1ece2]">
                {books.map((book) => {
                  const inStock = book.available_copies > 0;
                  return (
                    <tr key={book.id} className="transition hover:bg-[#fbf9f4]">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex h-10 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-[10px] font-bold text-white",
                              toneFor(book.title)
                            )}
                          >
                            <Library className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-[#17201b]">{book.title}</p>
                            <p className="truncate text-xs text-[#8a9187]">{book.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone="neutral">{book.genre}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-[#6b7269]">{book.shelf_location || "—"}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "font-bold",
                            inStock ? "text-[#1f6a4a]" : "text-[#a53f29]"
                          )}
                        >
                          {book.available_copies}/{book.total_copies}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" disabled={!inStock} onClick={() => onQuickIssue(book)}>
                            {inStock ? "Check out" : "Out"}
                          </Button>
                          <Button
                            size="sm"
                            variant="subtle"
                            onClick={() => onOpenEditModal(book)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => onDeleteBook(book.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && books.length > 0 ? (
        <p className="flex items-center justify-center gap-2 pb-2 text-xs text-[#9aa196]">
          <Search className="h-3.5 w-3.5" />
          Showing {books.length} title{books.length === 1 ? "" : "s"}
        </p>
      ) : null}
    </div>
  );
}
