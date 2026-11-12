"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { DashboardView } from "@/components/DashboardView";
import { BooksView } from "@/components/BooksView";
import { LoansView } from "@/components/LoansView";
import { MembersView } from "@/components/MembersView";
import { ReservationsView } from "@/components/ReservationsView";
import { ConfirmDialog } from "@/components/ui";

import { IssueBookModal } from "@/components/modals/IssueBookModal";
import { BookModal } from "@/components/modals/BookModal";
import { MemberModal } from "@/components/modals/MemberModal";
import { ReturnModal } from "@/components/modals/ReturnModal";
import { MemberDetailModal } from "@/components/modals/MemberDetailModal";
import { ReservationModal } from "@/components/modals/ReservationModal";

import { api } from "@/lib/api";
import { Book, Member, Loan, Reservation, DashboardStats } from "@/lib/types";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type Toast = { id: number; message: string; type: "success" | "error" };

type PendingDelete =
  | { kind: "book"; id: number; label: string }
  | { kind: "member"; id: number; label: string }
  | null;

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [attentionLoans, setAttentionLoans] = useState<Loan[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Filters
  const [bookSearch, setBookSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [availableOnly, setAvailableOnly] = useState(false);

  const [loanStatusFilter, setLoanStatusFilter] = useState("all");
  const [loanSearch, setLoanSearch] = useState("");

  const [memberSearch, setMemberSearch] = useState("");
  const [memberStatusFilter, setMemberStatusFilter] = useState("All");

  const [reservationFilter, setReservationFilter] = useState("all");

  // Loading
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [loadingReservations, setLoadingReservations] = useState(false);

  // Toast
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ id: Date.now(), message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(timer);
  }, [toast]);

  // Modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [initialBookIdForIssue, setInitialBookIdForIssue] = useState<number | undefined>(undefined);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedLoanForReturn, setSelectedLoanForReturn] = useState<Loan | null>(null);

  const [isMemberDetailOpen, setIsMemberDetailOpen] = useState(false);
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState<Member | null>(null);

  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [bookForReservation, setBookForReservation] = useState<Book | null>(null);

  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [deleting, setDeleting] = useState(false);

  // Loaders
  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      setStats(await api.getDashboardStats());
    } catch (error) {
      console.error("Error loading stats:", error);
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadBooks = useCallback(async () => {
    setLoadingBooks(true);
    try {
      const [bookList, genreList] = await Promise.all([
        api.getBooks({
          search: bookSearch,
          genre: selectedGenre,
          available_only: availableOnly,
        }),
        api.getGenres().catch(() => []),
      ]);
      setBooks(bookList);
      setGenres(genreList);
    } catch (error) {
      console.error("Error loading books:", error);
    } finally {
      setLoadingBooks(false);
    }
  }, [bookSearch, selectedGenre, availableOnly]);

  const loadMembers = useCallback(async () => {
    setLoadingMembers(true);
    try {
      setMembers(await api.getMembers({ search: memberSearch, status: memberStatusFilter }));
    } catch (error) {
      console.error("Error loading members:", error);
    } finally {
      setLoadingMembers(false);
    }
  }, [memberSearch, memberStatusFilter]);

  const loadLoans = useCallback(async () => {
    setLoadingLoans(true);
    try {
      setLoans(await api.getLoans({ status: loanStatusFilter, search: loanSearch }));
    } catch (error) {
      console.error("Error loading loans:", error);
    } finally {
      setLoadingLoans(false);
    }
  }, [loanStatusFilter, loanSearch]);

  const loadReservations = useCallback(async () => {
    setLoadingReservations(true);
    try {
      setReservations(await api.getReservations(reservationFilter));
    } catch (error) {
      console.error("Error loading reservations:", error);
    } finally {
      setLoadingReservations(false);
    }
  }, [reservationFilter]);

  const loadAttentionLoans = useCallback(async () => {
    try {
      setAttentionLoans(await api.getLoans({ status: "overdue" }));
    } catch (error) {
      console.error("Error loading overdue loans:", error);
    }
  }, []);

  // Initial + debounced loading
  useEffect(() => {
    loadStats();
    loadAttentionLoans();
  }, [loadStats, loadAttentionLoans]);

  useEffect(() => {
    const timer = setTimeout(loadBooks, 250);
    return () => clearTimeout(timer);
  }, [loadBooks]);

  useEffect(() => {
    const timer = setTimeout(loadMembers, 250);
    return () => clearTimeout(timer);
  }, [loadMembers]);

  useEffect(() => {
    const timer = setTimeout(loadLoans, 250);
    return () => clearTimeout(timer);
  }, [loadLoans]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const refreshAll = useCallback(() => {
    loadStats();
    loadBooks();
    loadMembers();
    loadLoans();
    loadReservations();
    loadAttentionLoans();
  }, [loadStats, loadBooks, loadMembers, loadLoans, loadReservations, loadAttentionLoans]);

  // Actions
  const handleQuickIssue = (book: Book) => {
    setInitialBookIdForIssue(book.id);
    setIsIssueModalOpen(true);
  };

  const openReservation = (book: Book) => {
    if (members.length === 0) {
      showToast("Register a member before placing a hold.", "error");
      return;
    }
    setBookForReservation(book);
    setIsReservationModalOpen(true);
  };

  const handleConfirmReservation = async (memberId: number) => {
    if (!bookForReservation) return;
    await api.createReservation({ book_id: bookForReservation.id, member_id: memberId });
    const member = members.find((item) => item.id === memberId);
    showToast(`Hold placed on "${bookForReservation.title}" for ${member?.name ?? "the member"}.`);
    refreshAll();
  };

  const handleRunDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      if (pendingDelete.kind === "book") {
        await api.deleteBook(pendingDelete.id);
        showToast(`"${pendingDelete.label}" removed from the catalog.`);
      } else {
        await api.deleteMember(pendingDelete.id);
        showToast(`${pendingDelete.label} removed from the directory.`);
      }
      setPendingDelete(null);
      refreshAll();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not complete that request.",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleExtendLoan = async (loanId: number) => {
    try {
      await api.extendLoan(loanId, 7);
      showToast("Loan extended by 7 days.");
      refreshAll();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to extend loan.", "error");
    }
  };

  const handleFulfillReservation = async (id: number) => {
    try {
      await api.fulfillReservation(id);
      showToast("Hold fulfilled — the book is ready for pickup.");
      refreshAll();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to fulfill hold.", "error");
    }
  };

  const handleCancelReservation = async (id: number) => {
    try {
      await api.cancelReservation(id);
      showToast("Hold cancelled.");
      refreshAll();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to cancel hold.", "error");
    }
  };

  return (
    <div className="flex min-h-screen flex-col text-[#17201b]">
      {toast ? (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className="animate-toast-in fixed bottom-24 right-4 z-[60] flex max-w-sm items-start gap-3 rounded-2xl bg-[#0f3d2e] px-4 py-3 text-sm font-semibold text-[#f7f3ec] shadow-2xl md:bottom-6 md:right-6"
        >
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
              toast.type === "success" ? "bg-[#2f7d5b]" : "bg-[#b4462f]"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5" />
            )}
          </span>
          <span className="flex-1 leading-snug">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            className="rounded-lg p-0.5 text-[#b7cfc2] transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <Header
        activeTab={activeTab}
        onOpenIssueModal={() => {
          setInitialBookIdForIssue(undefined);
          setIsIssueModalOpen(true);
        }}
        onOpenAddBookModal={() => {
          setBookToEdit(null);
          setIsBookModalOpen(true);
        }}
      />

      <div className="flex flex-1 items-start">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              stats={{
                activeLoansCount: stats?.active_loans,
                overdueLoansCount: stats?.overdue_loans,
              }}
            />

            <main className="min-w-0 flex-1 pb-24 md:pb-8">
              {activeTab === "dashboard" ? (
                <DashboardView
                  stats={stats}
                  loans={attentionLoans}
                  loading={loadingStats}
                  onNavigate={setActiveTab}
                  onOpenIssueModal={() => {
                    setInitialBookIdForIssue(undefined);
                    setIsIssueModalOpen(true);
                  }}
                  onOpenAddBookModal={() => {
                    setBookToEdit(null);
                    setIsBookModalOpen(true);
                  }}
                  onOpenAddMemberModal={() => {
                    setMemberToEdit(null);
                    setIsMemberModalOpen(true);
                  }}
                  onRetry={refreshAll}
                />
              ) : null}

              {activeTab === "books" ? (
                <BooksView
                  books={books}
                  genres={genres}
                  loading={loadingBooks}
                  onSearch={setBookSearch}
                  onFilterGenre={setSelectedGenre}
                  selectedGenre={selectedGenre}
                  availableOnly={availableOnly}
                  setAvailableOnly={setAvailableOnly}
                  onOpenAddModal={() => {
                    setBookToEdit(null);
                    setIsBookModalOpen(true);
                  }}
                  onOpenEditModal={(book) => {
                    setBookToEdit(book);
                    setIsBookModalOpen(true);
                  }}
                  onDeleteBook={(id) => {
                    const book = books.find((item) => item.id === id);
                    setPendingDelete({ kind: "book", id, label: book?.title ?? "this book" });
                  }}
                  onQuickIssue={handleQuickIssue}
                  onReserveBook={openReservation}
                />
              ) : null}

              {activeTab === "loans" ? (
                <LoansView
                  loans={loans}
                  loading={loadingLoans}
                  statusFilter={loanStatusFilter}
                  onFilterStatus={setLoanStatusFilter}
                  onSearch={setLoanSearch}
                  onOpenIssueModal={() => {
                    setInitialBookIdForIssue(undefined);
                    setIsIssueModalOpen(true);
                  }}
                  onOpenReturnModal={(loan) => {
                    setSelectedLoanForReturn(loan);
                    setIsReturnModalOpen(true);
                  }}
                  onExtendLoan={handleExtendLoan}
                />
              ) : null}

              {activeTab === "members" ? (
                <MembersView
                  members={members}
                  loading={loadingMembers}
                  onSearch={setMemberSearch}
                  onFilterStatus={setMemberStatusFilter}
                  statusFilter={memberStatusFilter}
                  onOpenAddModal={() => {
                    setMemberToEdit(null);
                    setIsMemberModalOpen(true);
                  }}
                  onOpenEditModal={(member) => {
                    setMemberToEdit(member);
                    setIsMemberModalOpen(true);
                  }}
                  onDeleteMember={(id) => {
                    const member = members.find((item) => item.id === id);
                    setPendingDelete({
                      kind: "member",
                      id,
                      label: member?.name ?? "this member",
                    });
                  }}
                  onViewMemberDetails={(member) => {
                    setSelectedMemberForDetail(member);
                    setIsMemberDetailOpen(true);
                  }}
                />
              ) : null}

              {activeTab === "reservations" ? (
                <ReservationsView
                  reservations={reservations}
                  loading={loadingReservations}
                  statusFilter={reservationFilter}
                  onFilterStatus={setReservationFilter}
                  onFulfill={handleFulfillReservation}
                  onCancel={handleCancelReservation}
                />
              ) : null}
            </main>
      </div>

      <IssueBookModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        books={books}
        members={members}
        initialBookId={initialBookIdForIssue}
        onIssueSuccess={() => {
          showToast("Book checked out successfully.");
          refreshAll();
        }}
        apiIssue={api.issueBook}
      />

      <BookModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        bookToEdit={bookToEdit}
        onSuccess={() => {
          showToast(bookToEdit ? "Book details updated." : "Book added to the catalog.");
          refreshAll();
        }}
        apiSave={(data, id) => (id ? api.updateBook(id, data) : api.createBook(data))}
      />

      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        memberToEdit={memberToEdit}
        onSuccess={() => {
          showToast(memberToEdit ? "Member profile updated." : "New member registered.");
          refreshAll();
        }}
        apiSave={(data, id) => (id ? api.updateMember(id, data) : api.createMember(data))}
      />

      <ReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        loan={selectedLoanForReturn}
        onSuccess={() => {
          showToast("Book returned and inventory updated.");
          refreshAll();
        }}
        apiReturn={api.returnBook}
      />

      <MemberDetailModal
        isOpen={isMemberDetailOpen}
        onClose={() => setIsMemberDetailOpen(false)}
        member={selectedMemberForDetail}
      />

      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        book={bookForReservation}
        members={members}
        onConfirm={handleConfirmReservation}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleRunDelete}
        loading={deleting}
        confirmLabel={pendingDelete?.kind === "member" ? "Remove member" : "Remove book"}
        title={
          pendingDelete?.kind === "member" ? "Remove this member?" : "Remove this book?"
        }
        description={
          pendingDelete?.kind === "member" ? (
            <>
              <span className="font-bold text-[#17201b]">{pendingDelete.label}</span> will be
              removed from the directory. Members with active loans cannot be removed.
            </>
          ) : (
            <>
              <span className="font-bold text-[#17201b]">{pendingDelete?.label}</span> will be
              removed from the catalog. Books with active loans cannot be removed.
            </>
          )
        }
      />
    </div>
  );
}
