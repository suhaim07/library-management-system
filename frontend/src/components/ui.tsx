"use client";

import React, { useEffect } from "react";
import {
  X,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Inbox,
} from "lucide-react";

export function cn(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "gold" | "subtle";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#0f3d2e] text-[#f7f3ec] shadow-[0_8px_20px_-12px_rgba(15,61,46,0.9)] hover:bg-[#15513c]",
  secondary:
    "bg-white text-[#0f3d2e] ring-1 ring-[#e3dccd] hover:bg-[#fbf9f4] hover:ring-[#d5cbb9]",
  ghost: "text-[#5c645b] hover:bg-black/[0.04] hover:text-[#17201b]",
  danger:
    "bg-[#b4462f] text-white shadow-[0_8px_20px_-12px_rgba(180,70,47,0.9)] hover:bg-[#9c3a26]",
  gold: "bg-[#d5a64a] text-[#262115] shadow-[0_8px_20px_-12px_rgba(213,166,74,0.9)] hover:bg-[#e0b45d]",
  subtle: "bg-[#f1ece2] text-[#3f4a43] hover:bg-[#e9e2d4]",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-sm",
  icon: "h-9 w-9 p-0",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      className={cn(
        "no-tap-highlight inline-flex items-center justify-center gap-2 rounded-xl font-bold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Badge                                                               */
/* ------------------------------------------------------------------ */

export type BadgeTone =
  | "neutral"
  | "success"
  | "danger"
  | "warn"
  | "info"
  | "gold"
  | "forest";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-[#f1ece2] text-[#5c645b]",
  success: "bg-[#e6f2ea] text-[#1f6a4a]",
  danger: "bg-[#fbe9e2] text-[#a53f29]",
  warn: "bg-[#fbf0dc] text-[#96671a]",
  info: "bg-[#e7f0f8] text-[#2b5b84]",
  gold: "bg-[#f7ecd4] text-[#8a6516]",
  forest: "bg-[#0f3d2e] text-[#f7f3ec]",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold leading-none",
        badgeTones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

const modalWidths = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
};

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  footer,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  size?: keyof typeof modalWidths;
}) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-[#08170f]/50 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "animate-pop-in flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-black/5 sm:my-8 sm:rounded-3xl",
          modalWidths[size]
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#efe9dd] px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            {icon ? (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e6f2ea] text-[#0f3d2e]">
                {icon}
              </div>
            ) : null}
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-[#17201b]">{title}</h2>
              {subtitle ? (
                <p className="mt-0.5 text-sm leading-snug text-[#6b7269]">{subtitle}</p>
              ) : null}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="no-tap-highlight -mr-1 shrink-0 rounded-xl p-2 text-[#8a9187] transition hover:bg-[#f1ece2] hover:text-[#17201b]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

        {footer ? (
          <div className="border-t border-[#efe9dd] bg-[#fbf9f4] px-5 py-4 sm:px-6">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Form helpers                                                        */
/* ------------------------------------------------------------------ */

export const inputClass =
  "w-full rounded-xl border border-[#e3dccd] bg-[#fbf9f4] px-3.5 py-2.5 text-sm text-[#17201b] placeholder:text-[#9aa196] transition focus:border-[#2f7d5b] focus:bg-white focus:outline-none disabled:opacity-60";

export function Field({
  label,
  required,
  hint,
  children,
  className,
}: {
  label: React.ReactNode;
  required?: boolean;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-center gap-1 text-xs font-bold text-[#4c574e]">
        {label}
        {required ? <span className="text-[#b4462f]">*</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-[#8a9187]">{hint}</span> : null}
    </label>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  className,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a9187]" />
      <input
        type="text"
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#e3dccd] bg-[#fbf9f4] py-2.5 pl-10 pr-9 text-sm text-[#17201b] outline-none transition placeholder:text-[#9aa196] focus:border-[#2f7d5b] focus:bg-white"
      />
      {value ? (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[#9aa196] transition hover:bg-[#efe9dd] hover:text-[#17201b]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Segmented tabs                                                      */
/* ------------------------------------------------------------------ */

export function Segmented({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: { id: string; label: string; count?: number }[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "scrollbar-none inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-[#efe9dd]/80 p-1",
        className
      )}
    >
      {tabs.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "no-tap-highlight shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition",
              active
                ? "bg-white text-[#0f3d2e] shadow-sm"
                : "text-[#6b7269] hover:text-[#17201b]"
            )}
          >
            {tab.label}
            {typeof tab.count === "number" ? (
              <span
                className={cn(
                  "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] leading-none",
                  active ? "bg-[#e6f2ea] text-[#0f3d2e]" : "bg-black/5 text-[#6b7269]"
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* States                                                              */
/* ------------------------------------------------------------------ */

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3">
      <Loader2 className="h-7 w-7 animate-spin text-[#2f7d5b]" />
      <p className="text-sm text-[#8a9187]">{label}</p>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#ddd4c4] bg-white/60 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1ece2] text-[#8a9187]">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <h3 className="mt-4 text-xl font-bold text-[#17201b]">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-[#7a8177]">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} />;
}

/* ------------------------------------------------------------------ */
/* Confirm dialog                                                      */
/* ------------------------------------------------------------------ */

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  tone = "danger",
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  loading?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      icon={
        tone === "danger" ? (
          <AlertCircle className="h-5 w-5 text-[#b4462f]" />
        ) : (
          <CheckCircle2 className="h-5 w-5" />
        )
      }
      title={title}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            size="sm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="text-sm leading-relaxed text-[#5c645b]">{description}</div>
    </Modal>
  );
}
