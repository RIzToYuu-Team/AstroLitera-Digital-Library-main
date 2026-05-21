import React from "react";
import "./ConfirmModal.css";

export default function ConfirmModal({
  open,
  title = "Yakin ingin melanjutkan?",
  message = "Aksi ini tidak dapat dibatalkan.",
  cancelText = "Batal",
  confirmText = "Hapus",
  type = "danger",
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="confirm-overlay">
      <div className="confirm-card">
        <h2 className="confirm-title">{title}</h2>

        <p className="confirm-message">{message}</p>

        <div className="confirm-actions">
          <button
            type="button"
            className="confirm-btn confirm-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={`confirm-btn confirm-submit ${
              type === "danger" ? "is-danger" : "is-primary"
            }`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}