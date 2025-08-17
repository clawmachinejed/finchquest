// src/components/ui/Modal.tsx
'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { PropsWithChildren, ReactNode, MouseEvent, RefObject } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal
 * A lightweight, accessible, dependency‑free modal with:
 * - ARIA semantics (role=dialog, aria-modal)
 * - Focus restore on close
 * - Optional Escape/backdrop close
 * - Optional title and footer regions
 *
 * Compatibility: supports either `isOpen` or `open` (whichever your existing callers use).
 */
type Primitive = string | number | boolean | null | undefined;

export type ModalProps = PropsWithChildren<{
  /** Preferred: visibility flag */
  isOpen?: boolean;
  /** Back-compat: older code may pass `open` instead of `isOpen` */
  open?: boolean;

  /** Close handler (required) */
  onClose: () => void;

  /** Optional title (renders in a heading and ties aria-labelledby) */
  title?: ReactNode;

  /** Extra content to render in the footer row (e.g. buttons) */
  footer?: ReactNode;

  /** Custom class for the dialog container (not the backdrop) */
  className?: string;

  /** Disable closing on backdrop click (default: false = allowed) */
  disableBackdropClose?: boolean;

  /** Disable closing on Escape key (default: false = allowed) */
  disableEsc?: boolean;

  /** Element to focus after open (if provided) */
  initialFocusRef?: RefObject<HTMLElement>;

  /** Optional size "sm" | "md" | "lg" controlling max width (default "md") */
  size?: 'sm' | 'md' | 'lg';

  /** Hide the top-right close button (default false) */
  hideCloseButton?: boolean;

  /** Extra aria description text/id (accepts text; if you pass an id, use `aria-describedby` yourself) */
  description?: Primitive;
}>;

function getSizeClass(size: ModalProps['size'] = 'md'): string {
  switch (size) {
    case 'sm':
      return 'max-w-md';
    case 'lg':
      return 'max-w-3xl';
    case 'md':
    default:
      return 'max-w-xl';
  }
}

export default function Modal(props: ModalProps) {
  const {
    isOpen,
    open,
    onClose,
    title,
    footer,
    className,
    disableBackdropClose = false,
    disableEsc = false,
    initialFocusRef,
    size = 'md',
    hideCloseButton = false,
    description,
    children,
  } = props;

  const visible = (isOpen ?? open ?? false) === true;

  // SSR/Next guard for portal target
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Track last focused element to restore on close
  const lastActiveRef = useRef<HTMLElement | null>(null);

  // ids for aria
  const titleId = useId();
  const descId = useId();

  // Lock scroll while open
  useEffect(() => {
    if (!visible) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [visible]);

  // Remember last focused element *before* opening
  useEffect(() => {
    if (visible) {
      lastActiveRef.current = document.activeElement as HTMLElement | null;
    }
  }, [visible]);

  // Focus management on open/close
  useEffect(() => {
    if (!visible || !mounted) return;

    const focusTarget =
      initialFocusRef?.current ??
      (document.getElementById(titleId) as HTMLElement | null);

    // Use microtask to allow the modal to fully mount before focusing
    queueMicrotask(() => {
      focusTarget?.focus?.();
    });

    return () => {
      // Restore focus to the element that opened the modal
      queueMicrotask(() => {
        lastActiveRef.current?.focus?.();
      });
    };
  }, [visible, mounted, initialFocusRef, titleId]);

  // Escape to close
  useEffect(() => {
    if (!visible || disableEsc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [visible, disableEsc, onClose]);

  if (!visible || !mounted) return null;

  const handleBackdrop = (e: MouseEvent<HTMLDivElement>) => {
    // Only close if the click is on the backdrop itself (not inside the dialog)
    if (disableBackdropClose) return;
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Render portal at the end of <body>
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-hidden={!visible}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onMouseDown={handleBackdrop}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        className={[
          'relative z-10 w-[90vw] rounded-2xl bg-zinc-900 text-zinc-100 shadow-2xl ring-1 ring-white/10',
          'outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
          getSizeClass(size),
          className ?? '',
        ].join(' ')}
      >
        {/* Header */}
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-3 md:px-6">
            {title ? (
              <h2
                id={titleId}
                tabIndex={-1}
                className="text-base font-semibold leading-6 md:text-lg"
              >
                {title}
              </h2>
            ) : (
              <span aria-hidden className="sr-only" id={titleId} />
            )}

            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-300 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                aria-label="Close dialog"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 8.586 3.757 2.343 2.343 3.757 8.586 10l-6.243 6.243 1.414 1.414L10 11.414l6.243 6.243 1.414-1.414L11.414 10l6.243-6.243-1.414-1.414L10 8.586z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-4 py-4 md:px-6 md:py-5">
          {description ? (
            <p id={descId} className="sr-only">
              {String(description)}
            </p>
          ) : null}
          {children}
        </div>

        {/* Footer */}
        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-white/10 px-4 py-3 md:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
