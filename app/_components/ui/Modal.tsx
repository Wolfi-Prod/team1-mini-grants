"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  widthClassName?: string;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  description,
  footer,
  children,
  widthClassName = "max-w-lg",
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<Element | null>(null);

  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      trapFocus(e);
    };
    window.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      if (!panelRef.current) return;
      const first = panelRef.current.querySelector<HTMLElement>(FOCUSABLE);
      if (first) first.focus();
    });

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
      if (previousFocus.current instanceof HTMLElement) {
        previousFocus.current.focus();
      }
    };
  }, [open, onClose, trapFocus]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === "string" ? title : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className={cn(
          "w-full border border-[var(--color-border-muted)] bg-[var(--color-bg)]",
          widthClassName,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--color-border-muted)] px-6 py-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-[15px] font-medium leading-snug tracking-tight text-[var(--color-fg)]">
              {title}
            </h2>
            {description ? (
              <p className="text-[11px] text-[var(--color-fg-muted)]">{description}</p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Close"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X size={16} aria-hidden />
          </Button>
        </header>
        <div className="px-6 py-5">{children}</div>
        {footer ? (
          <footer className="flex items-center justify-end gap-2 border-t border-[var(--color-border-muted)] px-6 py-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
