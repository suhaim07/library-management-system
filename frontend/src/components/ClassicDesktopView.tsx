"use client";

import React, { useState, useEffect } from "react";
import { Book, Member, Loan } from "@/lib/types";
import { api } from "@/lib/api";

interface ClassicDesktopViewProps {
  books: Book[];
  members: Member[];
  loans: Loan[];
  onRefreshAll: () => void;
  onOpenAddBookModal: () => void;
  onOpenAddMemberModal: () => void;
  onOpenIssueModal: (bookId?: number) => void;
  onOpenReturnModal: (loan: Loan) => void;
  onSwitchToModern?: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

type TableMode = "loans" | "students" | "books";

export function ClassicDesktopView({
  books,
  members,
  loans,
  onRefreshAll,
  onOpenAddBookModal,
  onOpenAddMemberModal,
  onOpenIssueModal,
  onOpenReturnModal,
  onSwitchToModern,
  showToast,
}: ClassicDesktopViewProps) {
  // Input fields from UI
  const [studentInput, setStudentInput] = useState("");
  const [bookInput, setBookInput] = useState("");

  // Table display mode
  const [tableMode, setTableMode] = useState<TableMode>("loans");
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

  // Active dropdown menu
  const [openMenu, setOpenMenu] = useState<"add" | "admin" | null>(null);

  // Status message bar (Tkinter / Desktop status)
  const [statusMsg, setStatusMsg] = useState<string>("System Ready. Database connected.");

  // Filtered lists
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>(loans);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>(members);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>(books);

  useEffect(() => {
    setFilteredLoans(loans);
    setFilteredMembers(members);
    setFilteredBooks(books);
  }, [loans, members, books]);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = () => setOpenMenu(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // 1. Search Student (next to input)
  const handleSearchStudentInput = () => {
    const query = studentInput.trim().toLowerCase();
    if (!query) {
      setFilteredLoans(loans);
      setTableMode("loans");
      setStatusMsg(`Showing all ${loans.length} loan records.`);
      return;
    }
    const matchedLoans = loans.filter(
      (l) =>
        (l.member_name && l.member_name.toLowerCase().includes(query)) ||
        (l.member_code && l.member_code.toLowerCase().includes(query))
    );
    setFilteredLoans(matchedLoans);
    setTableMode("loans");
    setStatusMsg(`Found ${matchedLoans.length} loan record(s) for student '${studentInput}'.`);
  };

  // 2. Find Book (next to input)
  const handleFindBookInput = () => {
    const query = bookInput.trim().toLowerCase();
    if (!query) {
      setFilteredLoans(loans);
      setTableMode("loans");
      setStatusMsg(`Showing all ${loans.length} loan records.`);
      return;
    }
    const matchedLoans = loans.filter(
      (l) =>
        (l.book_title && l.book_title.toLowerCase().includes(query)) ||
        (l.book_isbn && l.book_isbn.toLowerCase().includes(query)) ||
        String(l.book_id) === query
    );
    setFilteredLoans(matchedLoans);
    setTableMode("loans");
    setStatusMsg(`Found ${matchedLoans.length} loan record(s) for book '${bookInput}'.`);
  };

  // 3. Search Student Button (bottom row)
  const handleSearchStudentButton = () => {
    const query = studentInput.trim().toLowerCase();
    if (query) {
      const matched = members.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.member_code.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query)
      );
      setFilteredMembers(matched);
      setStatusMsg(`Filtered ${matched.length} student(s) matching '${studentInput}'.`);
    } else {
      setFilteredMembers(members);
      setStatusMsg(`Displaying all ${members.length} registered students/members.`);
    }
    setTableMode("students");
  };

  // 4. Search Book Button (bottom row)
  const handleSearchBookButton = () => {
    const query = bookInput.trim().toLowerCase();
    if (query) {
      const matched = books.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.author.toLowerCase().includes(query) ||
          b.isbn.toLowerCase().includes(query) ||
          String(b.id) === query
      );
      setFilteredBooks(matched);
      setStatusMsg(`Filtered ${matched.length} book(s) matching '${bookInput}'.`);
    } else {
      setFilteredBooks(books);
      setStatusMsg(`Displaying all ${books.length} books in catalog.`);
    }
    setTableMode("books");
  };

  // 5. Issue Book Button
  const handleIssueBookButton = async () => {
    // If student and book inputs are filled, try direct issue
    const studentQuery = studentInput.trim().toLowerCase();
    const bookQuery = bookInput.trim().toLowerCase();

    const matchedMember = members.find(
      (m) =>
        m.name.toLowerCase() === studentQuery ||
        m.member_code.toLowerCase() === studentQuery ||
        String(m.id) === studentQuery
    );

    const matchedBook = books.find(
      (b) =>
        b.title.toLowerCase() === bookQuery ||
        b.isbn.toLowerCase() === bookQuery ||
        String(b.id) === bookQuery
    );

    if (matchedMember && matchedBook) {
      if (matchedBook.available_copies <= 0) {
        showToast(`Cannot issue: '${matchedBook.title}' has no copies available.`, "error");
        setStatusMsg(`Error: No copies available for ${matchedBook.title}.`);
        return;
      }
      try {
        await api.issueBook({
          book_id: matchedBook.id,
          member_id: matchedMember.id,
          due_days: 14,
        });
        showToast(`Book '${matchedBook.title}' issued to '${matchedMember.name}'!`);
        setStatusMsg(`Successfully issued '${matchedBook.title}' to '${matchedMember.name}'.`);
        onRefreshAll();
        setTableMode("loans");
      } catch (err: any) {
        showToast(err.message || "Failed to issue book", "error");
        setStatusMsg(`Error issuing book: ${err.message}`);
      }
    } else {
      // Open the issue book modal
      onOpenIssueModal(matchedBook?.id);
    }
  };

  // 6. Return Book Button
  const handleReturnBookButton = async () => {
    // If a loan row is selected, return it
    if (selectedRowId && tableMode === "loans") {
      const selectedLoan = loans.find((l) => l.id === selectedRowId);
      if (selectedLoan) {
        if (selectedLoan.status === "returned") {
          showToast("This loan is already returned.", "error");
          return;
        }
        onOpenReturnModal(selectedLoan);
        return;
      }
    }

    // Try finding by student or book query
    const studentQuery = studentInput.trim().toLowerCase();
    const bookQuery = bookInput.trim().toLowerCase();

    const activeLoan = loans.find(
      (l) =>
        l.status !== "returned" &&
        ((studentQuery && l.member_name?.toLowerCase().includes(studentQuery)) ||
          (bookQuery && l.book_title?.toLowerCase().includes(bookQuery)) ||
          (bookQuery && String(l.book_id) === bookQuery))
    );

    if (activeLoan) {
      onOpenReturnModal(activeLoan);
    } else {
      showToast("Please select an active loan from the table to return.", "error");
      setStatusMsg("Select a row in the table below, then click 'Return Book'.");
      setTableMode("loans");
    }
  };

  // 7. Logout Button
  const handleLogout = () => {
    setStudentInput("");
    setBookInput("");
    setSelectedRowId(null);
    setFilteredLoans(loans);
    setTableMode("loans");
    setStatusMsg("Logged out. Session cleared.");
    showToast("Session reset / logged out.");
  };

  // Row selection handler
  const handleRowClick = (item: any) => {
    if (tableMode === "loans") {
      setSelectedRowId(item.id);
      setStudentInput(item.member_name || "");
      setBookInput(item.book_title || String(item.book_id));
      setStatusMsg(`Selected Loan #${item.id}: ${item.book_title} issued to ${item.member_name}`);
    } else if (tableMode === "students") {
      setSelectedRowId(item.id);
      setStudentInput(item.name || item.member_code);
      setStatusMsg(`Selected Student: ${item.name} (${item.member_code})`);
    } else if (tableMode === "books") {
      setSelectedRowId(item.id);
      setBookInput(item.title || String(item.id));
      setStatusMsg(`Selected Book: ${item.title} (ID: ${item.id}, ${item.available_copies} available)`);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-[#787878] text-black font-['Courier_New',Courier,monospace] select-none min-h-screen">
      {/* 1. Desktop Window Title Bar */}
      <div className="w-full bg-[#f0f0f0] border-b border-[#cccccc] flex items-center justify-between px-3 py-1.5 text-xs font-sans text-slate-800 shadow-xs">
        <div className="flex items-center space-x-2">
          {/* Classic Python/App Icon */}
          <div className="w-4 h-4 rounded-xs bg-[#2b5b84] text-white flex items-center justify-center font-bold text-[9px] shadow-2xs">
            L
          </div>
          <span className="font-semibold tracking-wide text-[13px] text-[#222222]">
            LIBRARY MANAGEMENT SYSTEMS
          </span>
        </div>

        {/* Window controls (Minimize, Maximize, Close) */}
        <div className="flex items-center space-x-2 text-slate-600">
          <button
            className="w-5 h-4 flex items-center justify-center hover:bg-slate-300 text-xs font-bold transition"
            title="Minimize"
          >
            —
          </button>
          <button
            className="w-5 h-4 flex items-center justify-center hover:bg-slate-300 text-xs transition"
            title="Maximize"
          >
            □
          </button>
          <button
            onClick={handleLogout}
            className="w-6 h-4 flex items-center justify-center hover:bg-red-600 hover:text-white text-xs transition"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 2. Menu Bar */}
      <div className="w-full bg-[#ffffff] border-b border-[#bbbbbb] px-3 py-1 flex items-center space-x-4 text-xs font-sans text-slate-800 relative z-30 shadow-2xs">
        {/* Add Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(openMenu === "add" ? null : "add");
            }}
            className={`px-2 py-0.5 rounded-xs transition hover:bg-[#e5e5e5] ${
              openMenu === "add" ? "bg-[#e5e5e5]" : ""
            }`}
          >
            Add
          </button>
          {openMenu === "add" && (
            <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-[#999999] shadow-md py-1 z-40 text-left">
              <button
                onClick={() => {
                  onOpenAddBookModal();
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1 text-left hover:bg-[#0078d7] hover:text-white transition flex items-center justify-between"
              >
                <span>Add Book</span>
                <span className="text-[10px] text-slate-400">Ctrl+B</span>
              </button>
              <button
                onClick={() => {
                  onOpenAddMemberModal();
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1 text-left hover:bg-[#0078d7] hover:text-white transition flex items-center justify-between"
              >
                <span>Add Student</span>
                <span className="text-[10px] text-slate-400">Ctrl+S</span>
              </button>
              <div className="border-t border-[#e0e0e0] my-1" />
              <button
                onClick={() => {
                  setFilteredLoans(loans);
                  setTableMode("loans");
                  onRefreshAll();
                  setStatusMsg("Refreshed all library records.");
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1 text-left hover:bg-[#0078d7] hover:text-white transition"
              >
                Refresh Data
              </button>
            </div>
          )}
        </div>

        {/* Admin Tools Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(openMenu === "admin" ? null : "admin");
            }}
            className={`px-2 py-0.5 rounded-xs transition hover:bg-[#e5e5e5] ${
              openMenu === "admin" ? "bg-[#e5e5e5]" : ""
            }`}
          >
            Admin Tools
          </button>
          {openMenu === "admin" && (
            <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-[#999999] shadow-md py-1 z-40 text-left">
              <button
                onClick={() => {
                  setFilteredLoans(loans);
                  setTableMode("loans");
                  setStatusMsg("Showing all circulation loans.");
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1 text-left hover:bg-[#0078d7] hover:text-white transition"
              >
                View All Loans
              </button>
              <button
                onClick={() => {
                  const overdue = loans.filter((l) => l.status === "overdue" || (l.days_overdue && l.days_overdue > 0));
                  setFilteredLoans(overdue);
                  setTableMode("loans");
                  setStatusMsg(`Found ${overdue.length} overdue loan(s).`);
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1 text-left hover:bg-[#0078d7] hover:text-white transition"
              >
                View Overdue Items & Fines
              </button>
              <div className="border-t border-[#e0e0e0] my-1" />
              <button
                onClick={() => {
                  handleSearchStudentButton();
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1 text-left hover:bg-[#0078d7] hover:text-white transition"
              >
                View Student Directory
              </button>
              <button
                onClick={() => {
                  handleSearchBookButton();
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1 text-left hover:bg-[#0078d7] hover:text-white transition"
              >
                View Catalog Inventory
              </button>
              {onSwitchToModern && (
                <>
                  <div className="border-t border-[#e0e0e0] my-1" />
                  <button
                    onClick={() => {
                      onSwitchToModern();
                      setOpenMenu(null);
                    }}
                    className="w-full px-3 py-1 text-left hover:bg-[#0078d7] hover:text-white transition font-semibold text-indigo-700"
                  >
                    Switch to Modern Web View ➔
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Quick Modern View Switcher Pill */}
        {onSwitchToModern && (
          <button
            onClick={onSwitchToModern}
            className="ml-auto text-[11px] font-sans font-medium text-slate-600 hover:text-indigo-700 hover:underline transition"
          >
            Switch to Modern UI ↗
          </button>
        )}
      </div>

      {/* 3. Main GUI Body (Tkinter Gray Screen) */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-6 flex flex-col items-center">
        {/* Main Title */}
        <h1 className="text-2xl md:text-3xl font-black text-black tracking-[0.2em] text-center mt-2 mb-8">
          LIBRARY MANAGEMENT SYSTEM
        </h1>

        {/* Input Form Fields Container */}
        <div className="w-full max-w-3xl space-y-4 text-black">
          {/* Row 1: ENTER STUDENT */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <label className="w-44 text-right font-black text-sm tracking-wider uppercase text-black shrink-0">
              ENTER STUDENT
            </label>
            <input
              type="text"
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchStudentInput()}
              className="flex-1 w-full bg-white text-black px-3 py-1.5 border-2 border-[#555555] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.4)] focus:outline-hidden font-sans text-sm"
              placeholder=""
            />
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleSearchStudentInput}
                className="w-24 bg-white text-black text-xs font-sans font-semibold py-1.5 px-3 border border-[#666666] shadow-[1px_1px_0px_#000000] active:translate-y-0.5 active:shadow-none hover:bg-[#f2f2f2] transition"
              >
                Search
              </button>
              <button
                onClick={handleLogout}
                className="w-24 bg-[#ff0000] text-black text-xs font-sans font-black py-1.5 px-3 border border-[#990000] shadow-[1px_1px_0px_#000000] active:translate-y-0.5 active:shadow-none hover:bg-[#e60000] transition"
              >
                LOGOUT
              </button>
            </div>
          </div>

          {/* Row 2: ENTER THE BOOK ID */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <label className="w-44 text-right font-black text-sm tracking-wider uppercase text-black shrink-0">
              ENTER THE BOOK ID
            </label>
            <input
              type="text"
              value={bookInput}
              onChange={(e) => setBookInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFindBookInput()}
              className="flex-1 w-full bg-white text-black px-3 py-1.5 border-2 border-[#555555] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.4)] focus:outline-hidden font-sans text-sm"
              placeholder=""
            />
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleFindBookInput}
                className="w-24 bg-white text-black text-xs font-sans font-semibold py-1.5 px-3 border border-[#666666] shadow-[1px_1px_0px_#000000] active:translate-y-0.5 active:shadow-none hover:bg-[#f2f2f2] transition"
              >
                Find
              </button>
              {/* Invisible placeholder for alignment with LOGOUT button */}
              <div className="w-24 hidden sm:block"></div>
            </div>
          </div>
        </div>

        {/* Four Action Buttons Row */}
        <div className="w-full max-w-3xl flex flex-wrap items-center justify-center gap-4 mt-8 mb-6 font-sans">
          <button
            onClick={handleSearchStudentButton}
            className="w-36 sm:w-40 bg-white text-black text-xs font-semibold py-2 px-3 border border-[#555555] shadow-[1px_1px_0px_#000000] active:translate-y-0.5 active:shadow-none hover:bg-[#f2f2f2] transition text-center"
          >
            Search Student
          </button>
          <button
            onClick={handleSearchBookButton}
            className="w-36 sm:w-40 bg-white text-black text-xs font-semibold py-2 px-3 border border-[#555555] shadow-[1px_1px_0px_#000000] active:translate-y-0.5 active:shadow-none hover:bg-[#f2f2f2] transition text-center"
          >
            Search Book
          </button>
          <button
            onClick={handleIssueBookButton}
            className="w-36 sm:w-40 bg-white text-black text-xs font-semibold py-2 px-3 border border-[#555555] shadow-[1px_1px_0px_#000000] active:translate-y-0.5 active:shadow-none hover:bg-[#f2f2f2] transition text-center"
          >
            Issue Book
          </button>
          <button
            onClick={handleReturnBookButton}
            className="w-36 sm:w-40 bg-white text-black text-xs font-semibold py-2 px-3 border border-[#555555] shadow-[1px_1px_0px_#000000] active:translate-y-0.5 active:shadow-none hover:bg-[#f2f2f2] transition text-center"
          >
            Return Book
          </button>
        </div>

        {/* Section Heading */}
        <div className="mt-4 mb-3 text-center">
          <h2 className="text-sm md:text-base font-black tracking-widest uppercase underline text-black">
            INFORMATION DETAILS
          </h2>
          <p className="text-[11px] text-[#222222] font-sans mt-0.5">
            {tableMode === "loans"
              ? "Displaying Circulation Loans (Click a row to select record)"
              : tableMode === "students"
              ? "Displaying Student Directory (Click row to auto-fill Student input)"
              : "Displaying Catalog Books (Click row to auto-fill Book input)"}
          </p>
        </div>

        {/* Information Details Table (Windows TreeView style) */}
        <div className="w-full max-w-3xl bg-white border-2 border-[#555555] shadow-[1px_1px_3px_rgba(0,0,0,0.3)] mb-4 overflow-hidden">
          <div className="overflow-x-auto max-h-72 overflow-y-scroll">
            <table className="w-full text-left font-sans text-xs border-collapse">
              {/* Table Header */}
              <thead className="bg-[#f2f2f2] border-b-2 border-[#cccccc] sticky top-0 z-10 text-slate-800 font-bold">
                {tableMode === "loans" ? (
                  <tr>
                    <th className="px-3 py-2 border-r border-[#dddddd] w-12 text-center">ID</th>
                    <th className="px-3 py-2 border-r border-[#dddddd] w-48">Student</th>
                    <th className="px-3 py-2 border-r border-[#dddddd]">Book</th>
                    <th className="px-3 py-2 border-r border-[#dddddd] w-28">Issue Date</th>
                    <th className="px-3 py-2 w-32">Return Date</th>
                  </tr>
                ) : tableMode === "students" ? (
                  <tr>
                    <th className="px-3 py-2 border-r border-[#dddddd] w-12 text-center">ID</th>
                    <th className="px-3 py-2 border-r border-[#dddddd]">Student Name</th>
                    <th className="px-3 py-2 border-r border-[#dddddd] w-28">Code</th>
                    <th className="px-3 py-2 border-r border-[#dddddd] w-32">Type</th>
                    <th className="px-3 py-2 w-28 text-center">Active Loans</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-3 py-2 border-r border-[#dddddd] w-12 text-center">ID</th>
                    <th className="px-3 py-2 border-r border-[#dddddd]">Title</th>
                    <th className="px-3 py-2 border-r border-[#dddddd] w-36">Author</th>
                    <th className="px-3 py-2 border-r border-[#dddddd] w-28">Available</th>
                    <th className="px-3 py-2 w-28">Rack / Shelf</th>
                  </tr>
                )}
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-[#eeeeee] text-slate-800">
                {tableMode === "loans" ? (
                  filteredLoans.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-400 font-sans italic">
                        No loan records found. Click &apos;Add&apos; &gt; &apos;Add Book&apos; or &apos;Issue Book&apos; to begin.
                      </td>
                    </tr>
                  ) : (
                    filteredLoans.map((loan) => {
                      const isSelected = selectedRowId === loan.id;
                      const isReturned = loan.status === "returned";
                      const isOverdue = loan.status === "overdue" || (loan.days_overdue && loan.days_overdue > 0);

                      return (
                        <tr
                          key={loan.id}
                          onClick={() => handleRowClick(loan)}
                          className={`cursor-pointer transition ${
                            isSelected
                              ? "bg-[#0078d7] text-white"
                              : "hover:bg-[#f0f8ff]"
                          }`}
                        >
                          <td className="px-3 py-2 border-r border-[#eeeeee] text-center font-mono">
                            {loan.id}
                          </td>
                          <td className="px-3 py-2 border-r border-[#eeeeee] font-medium truncate max-w-44">
                            {loan.member_name} ({loan.member_code})
                          </td>
                          <td className="px-3 py-2 border-r border-[#eeeeee] truncate max-w-64 font-medium">
                            {loan.book_title}
                          </td>
                          <td className="px-3 py-2 border-r border-[#eeeeee] font-mono text-[11px]">
                            {loan.loan_date}
                          </td>
                          <td className="px-3 py-2 font-mono text-[11px]">
                            {isReturned ? (
                              <span className={isSelected ? "text-emerald-200" : "text-emerald-700 font-semibold"}>
                                {loan.return_date || "Returned"}
                              </span>
                            ) : isOverdue ? (
                              <span className={isSelected ? "text-rose-200" : "text-rose-600 font-bold"}>
                                Overdue ({loan.due_date})
                              </span>
                            ) : (
                              <span className={isSelected ? "text-slate-100" : "text-slate-600"}>
                                Due: {loan.due_date}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )
                ) : tableMode === "students" ? (
                  filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-400 font-sans italic">
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((m) => {
                      const isSelected = selectedRowId === m.id;
                      return (
                        <tr
                          key={m.id}
                          onClick={() => handleRowClick(m)}
                          className={`cursor-pointer transition ${
                            isSelected ? "bg-[#0078d7] text-white" : "hover:bg-[#f0f8ff]"
                          }`}
                        >
                          <td className="px-3 py-2 border-r border-[#eeeeee] text-center font-mono">{m.id}</td>
                          <td className="px-3 py-2 border-r border-[#eeeeee] font-medium">{m.name}</td>
                          <td className="px-3 py-2 border-r border-[#eeeeee] font-mono text-[11px]">{m.member_code}</td>
                          <td className="px-3 py-2 border-r border-[#eeeeee]">{m.membership_type}</td>
                          <td className="px-3 py-2 text-center font-bold">
                            {m.active_loans_count || 0} / {m.max_borrow_limit}
                          </td>
                        </tr>
                      );
                    })
                  )
                ) : (
                  filteredBooks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-400 font-sans italic">
                        No books found.
                      </td>
                    </tr>
                  ) : (
                    filteredBooks.map((b) => {
                      const isSelected = selectedRowId === b.id;
                      return (
                        <tr
                          key={b.id}
                          onClick={() => handleRowClick(b)}
                          className={`cursor-pointer transition ${
                            isSelected ? "bg-[#0078d7] text-white" : "hover:bg-[#f0f8ff]"
                          }`}
                        >
                          <td className="px-3 py-2 border-r border-[#eeeeee] text-center font-mono">{b.id}</td>
                          <td className="px-3 py-2 border-r border-[#eeeeee] font-medium truncate max-w-60">{b.title}</td>
                          <td className="px-3 py-2 border-r border-[#eeeeee] truncate max-w-36">{b.author}</td>
                          <td className="px-3 py-2 border-r border-[#eeeeee]">
                            <span
                              className={`font-semibold ${
                                b.available_copies > 0
                                  ? isSelected ? "text-emerald-200" : "text-emerald-700"
                                  : isSelected ? "text-rose-200" : "text-rose-600"
                              }`}
                            >
                              {b.available_copies} / {b.total_copies}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-mono text-[11px]">{b.shelf_location || "Stack A"}</td>
                        </tr>
                      );
                    })
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Windows Desktop Status Bar */}
        <div className="w-full max-w-3xl bg-[#eeeeee] border border-[#999999] px-3 py-1 flex items-center justify-between text-[11px] font-sans text-slate-700">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>{statusMsg}</span>
          </div>
          <div className="space-x-3 text-slate-500 hidden sm:block">
            <span>Books: {books.length}</span>
            <span>Students: {members.length}</span>
            <span>Active Loans: {loans.filter((l) => l.status === "active").length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

