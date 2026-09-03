import React, { useEffect, useId, useRef, useState } from "react";
import "./RejectionModal.css";

function RejectionModal({
  isOpen,
  articleTitle = "",
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  const uid = useId().replace(/:/g, "");
  const titleId = `rejection-title-${uid}`;
  const descriptionId = `rejection-description-${uid}`;
  const reasonId = `rejection-reason-${uid}`;
  const countId = `rejection-count-${uid}`;
  const errorId = `rejection-error-${uid}`;

  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const modalRef = useRef(null);
  const textareaRef = useRef(null);
  const previousFocusRef = useRef(null);

  function cancel() {
    if (isLoading) return;
    setReason("");
    setError("");
    if (typeof onCancel === "function") onCancel();
  }

  function confirm() {
    if (isLoading) return;

    const normalizedReason = reason.trim();
    if (!normalizedReason) {
      setError("Mohon masukkan alasan penolakan.");
      textareaRef.current?.focus();
      return;
    }

    setError("");
    if (typeof onConfirm === "function") onConfirm(normalizedReason);
  }

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return undefined;

    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (!isLoading) {
          event.preventDefault();
          cancel();
        }
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) return;

      const focusable = Array.from(
        modalRef.current.querySelectorAll(
          'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusable.length === 0) {
        event.preventDefault();
        modalRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;

      const previousFocus = previousFocusRef.current;
      if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus();
      }
    };
  }, [isOpen, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
    }
  }, [isOpen, articleTitle]);

  if (!isOpen) return null;

  return (
    <div
      className="rejection-modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) cancel();
      }}
    >
      <section
        ref={modalRef}
        className="rejection-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={isLoading}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="rejection-modal-header">
          <h2 id={titleId}>Tolak Artikel</h2>
          <button
            type="button"
            className="rejection-modal-close"
            onClick={cancel}
            disabled={isLoading}
            aria-label="Tutup dialog penolakan"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="rejection-modal-content">
          <p id={descriptionId} className="rejection-modal-article-title">
            Artikel: <strong>{articleTitle || "Tanpa judul"}</strong>
          </p>

          <label htmlFor={reasonId} className="rejection-modal-reason-label">
            Alasan penolakan <span aria-hidden="true">*</span>
          </label>
          <textarea
            ref={textareaRef}
            id={reasonId}
            className="rejection-modal-reason-textarea"
            placeholder="Jelaskan alasan artikel ditolak dan perbaikan yang diperlukan..."
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              if (error) setError("");
            }}
            maxLength={1000}
            rows={6}
            disabled={isLoading}
            required
            aria-invalid={Boolean(error)}
            aria-describedby={`${countId}${error ? ` ${errorId}` : ""}`}
          />

          <div className="rejection-modal-meta">
            {error ? (
              <p id={errorId} className="rejection-modal-error" role="alert">
                {error}
              </p>
            ) : (
              <span aria-hidden="true" />
            )}
            <p id={countId} className="rejection-modal-char-count">
              {reason.length}/1000
            </p>
          </div>
        </div>

        <footer className="rejection-modal-footer">
          <button
            type="button"
            className="rejection-modal-cancel"
            onClick={cancel}
            disabled={isLoading}
          >
            Batal
          </button>
          <button
            type="button"
            className="rejection-modal-confirm"
            onClick={confirm}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? "Memproses..." : "Tolak Artikel"}
          </button>
        </footer>
      </section>
    </div>
  );
}

export default RejectionModal;
