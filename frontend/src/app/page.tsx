"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { DashboardView } from "@/components/DashboardView";
import { BooksView } from "@/components/BooksView";
import { LoansView } from "@/components/LoansView";
import { MembersView } from "@/components/MembersView";
import { ReservationsView } from "@/components/ReservationsView";
import { ClassicDesktopView } from "@/components/ClassicDesktopView";

import { IssueBookModal } from "@/components/modals/IssueBookModal";
import { BookModal } from "@/components/modals/BookModal";
import { MemberModal } from "@/components/modals/MemberModal";
import { ReturnModal } from "@/components/modals/ReturnModal";
import { MemberDetailModal } from "@/components/modals/MemberDetailModal";

import { api } from "@/lib/api";
import { Book, Member, Loan, Reservation, DashboardStats } from "@/lib/types";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function Home() {
  const [viewTheme, setViewTheme] = useState<"classic" | "modern">("modern");
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Filter states
  const [bookSearch, setBookSearch] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);

  const [loanStatusFilter, setLoanStatusFilter] = useState<string>("all");
  const [loanSearch, setLoanSearch] = useState<string>("");

  const [memberSearch, setMemberSearch] = useState<string>("");
  const [memberStatusFilter, setMemberStatusFilter] = useState<string>("All");

  const [reservationFilter, setReservationFilter] = useState<string>("all");

  // Loading states
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [loadingBooks, setLoadingBooks] = useState<boolean>(false);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(false);
  const [loadingLoans, setLoadingLoans] = useState<boolean>(false);
  const [loadingReservations, setLoadingReservations] = useState<boolean>(false);

  // Toast / Notification banner
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Modals state
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

  // Fetch helpers
  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      console.error("Error loading stats:", err);
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
    } catch (err: any) {
      console.error("Error loading books:", err);
    } finally {
      setLoadingBooks(false);
    }
  }, [bookSearch, selectedGenre, availableOnly]);

  const loadMembers = useCallback(async () => {
    setLoadingMembers(true);
    try {
      const data = await api.getMembers({
        search: memberSearch,
        status: memberStatusFilter,
      });
      setMembers(data);
    } catch (err: any) {
      console.error("Error loading members:", err);
    } finally {
      setLoadingMembers(false);
    }
  }, [memberSearch, memberStatusFilter]);

  const loadLoans = useCallback(async () => {
    setLoadingLoans(true);
    try {
      const data = await api.getLoans({
        status: loanStatusFilter,
        search: loanSearch,
      });
      setLoans(data);
    } catch (err: any) {
      console.error("Error loading loans:", err);
    } finally {
      setLoadingLoans(false);
    }
  }, [loanStatusFilter, loanSearch]);

  const loadReservations = useCallback(async () => {
    setLoadingReservations(true);
    try {
      const data = await api.getReservations(reservationFilter);
      setReservations(data);
    } catch (err: any) {
      console.error("Error loading reservations:", err);
    } finally {
      setLoadingReservations(false);
    }
  }, [reservationFilter]);

  // Initial load
  useEffect(() => {
    loadStats();
    loadBooks();
    loadMembers();
    loadLoans();
    loadReservations();
  }, [loadStats, loadBooks, loadMembers, loadLoans, loadReservations]);

  // Refresh all
  const refreshAll = () => {
    loadStats();
    loadBooks();
    loadMembers();
    loadLoans();
    loadReservations();
  };

  // Quick Issue shortcut
  const handleQuickIssue = (book: Book) => {
    setInitialBookIdForIssue(book.id);
    setIsIssueModalOpen(true);
  };

  // Quick Reserve shortcut
  const handleReserveBook = async (book: Book) => {
    if (members.length === 0) {
      showToast("No members found. Please register a member first.", "error");
      return;
    }
    try {
      await api.createReservation({
        book_id: book.id,
        member_id: members[0].id,
      });
      showToast(`Reserved "${book.title}" for ${members[0].name}`);
      refreshAll();
    } catch (err: any) {
      showToast(err.message || "Failed to reserve book", "error");
    }
  };

  // Delete Book
  const handleDeleteBook = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await api.deleteBook(id);
      showToast("Book deleted from inventory");
      refreshAll();
    } catch (err: any) {
      showToast(err.message || "Cannot delete book", "error");
    }
  };

  // Delete Member
  const handleDeleteMember = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await api.deleteMember(id);
      showToast("Member removed successfully");
      refreshAll();
    } catch (err: any) {
      showToast(err.message || "Cannot delete member", "error");
    }
  };

  // Extend Loan
  const handleExtendLoan = async (loanId: number) => {
    try {
      await api.extendLoan(loanId, 7);
      showToast("Loan extended by +7 days");
      refreshAll();
    } catch (err: any) {
      showToast(err.message || "Failed to extend loan", "error");
    }
  };

  // Reservation Actions
  const handleFulfillReservation = async (id: number) => {
    try {
      await api.fulfillReservation(id);
      showToast("Reservation fulfilled!");
      refreshAll();
    } catch (err: any) {
      showToast(err.message || "Failed to fulfill", "error");
    }
  };

  const handleCancelReservation = async (id: number) => {
    try {
      await api.cancelReservation(id);
      showToast("Reservation cancelled");
      refreshAll();
    } catch (err: any) {
      showToast(err.message || "Failed to cancel", "error");
    }
  };

  return (
    <div className="flex min-h-screen flex-col text-stone-900">
      {toast && (
        <div className="fixed bottom-24 right-4 z-50 flex max-w-sm items-center gap-2 rounded-2xl bg-[#16352a] px-4 py-3 text-sm font-semibold text-[#f6f1e7] shadow-xl md:bottom-6 md:right-6">
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-[#b7e4c7]" />
          ) : (
            <AlertCircle className="h-4 w-4 text-[#f4c7b8]" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {viewTheme === "classic" ? (
        <ClassicDesktopView
          books={books}
          members={members}
          loans={loans}
          onRefreshAll={refreshAll}
          onOpenAddBookModal={() => {
            setBookToEdit(null);
            setIsBookModalOpen(true);
          }}
          onOpenAddMemberModal={() => {
            setMemberToEdit(null);
            setIsMemberModalOpen(true);
          }}
          onOpenIssueModal={(bookId) => {
            setInitialBookIdForIssue(bookId);
            setIsIssueModalOpen(true);
          }}
          onOpenReturnModal={(loan) => {
            setSelectedLoanForReturn(loan);
            setIsReturnModalOpen(true);
          }}
          onSwitchToModern={() => setViewTheme("modern")}
          showToast={showToast}
        />
      ) : (
        <>
          {/* Header */}
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
            onSwitchToClassic={() => setViewTheme("classic")}
          />

          {/* Main Layout: Sidebar + Content */}
          <div className="flex flex-1 overflow-hidden">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              stats={{
                activeLoansCount: stats?.active_loans,
                overdueLoansCount: stats?.overdue_loans,
              }}
            />

            <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
              {activeTab === "dashboard" && (
                <DashboardView
                  stats={stats}
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
                />
              )}

              {activeTab === "books" && (
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
                  onDeleteBook={handleDeleteBook}
                  onQuickIssue={handleQuickIssue}
                  onReserveBook={handleReserveBook}
                />
              )}

              {activeTab === "loans" && (
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
              )}

              {activeTab === "members" && (
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
                  onOpenEditModal={(m) => {
                    setMemberToEdit(m);
                    setIsMemberModalOpen(true);
                  }}
                  onDeleteMember={handleDeleteMember}
                  onViewMemberDetails={(m) => {
                    setSelectedMemberForDetail(m);
                    setIsMemberDetailOpen(true);
                  }}
                />
              )}

              {activeTab === "reservations" && (
                <ReservationsView
                  reservations={reservations}
                  loading={loadingReservations}
                  statusFilter={reservationFilter}
                  onFilterStatus={setReservationFilter}
                  onFulfill={handleFulfillReservation}
                  onCancel={handleCancelReservation}
                />
              )}
            </main>
          </div>
        </>
      )}

      {/* Modals */}
      <IssueBookModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        books={books}
        members={members}
        initialBookId={initialBookIdForIssue}
        onIssueSuccess={() => {
          showToast("Book loan issued successfully!");
          refreshAll();
        }}
        apiIssue={api.issueBook}
      />

      <BookModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        bookToEdit={bookToEdit}
        onSuccess={() => {
          showToast(bookToEdit ? "Book updated!" : "Book added to catalog!");
          refreshAll();
        }}
        apiSave={(data, id) => (id ? api.updateBook(id, data) : api.createBook(data))}
      />

      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        memberToEdit={memberToEdit}
        onSuccess={() => {
          showToast(memberToEdit ? "Member profile updated!" : "New patron registered!");
          refreshAll();
        }}
        apiSave={(data, id) => (id ? api.updateMember(id, data) : api.createMember(data))}
      />

      <ReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        loan={selectedLoanForReturn}
        onSuccess={() => {
          showToast("Book returned and inventory updated!");
          refreshAll();
        }}
        apiReturn={api.returnBook}
      />

      <MemberDetailModal
        isOpen={isMemberDetailOpen}
        onClose={() => setIsMemberDetailOpen(false)}
        member={selectedMemberForDetail}
      />
    </div>
  );
}
