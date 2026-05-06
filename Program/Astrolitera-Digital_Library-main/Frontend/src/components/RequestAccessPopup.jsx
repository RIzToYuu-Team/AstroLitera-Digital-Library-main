import React from "react";
import { X } from "lucide-react";
import "./RequestAccessPopup.css";

export default function RequestAccessPopup({ open, title, onClose, onSubmit }) {
  if (!open) return null;

  return (
    <div className="ra-overlay" role="dialog" aria-modal="true">
      <div className="ra-card">
        <div className="ra-header">
          <h3 className="ra-title">{title || "Ajukan Permintaan Baca"}</h3>
          <button
            type="button"
            className="ra-close"
            onClick={onClose}
            aria-label="Tutup"
          >
            <X size={22} />
          </button>
        </div>

        <div className="ra-body">
          <p className="ra-muted">Kamu perlu mengajukan izin ke admin untuk membaca buku ini. Permintaan akan diproses sebelum kamu bisa mulai membaca.</p>
        </div>

        <div className="ra-footer">
          <button type="button" className="ra-btn ra-btn-ghost" onClick={onClose}>
            Batal
          </button>
          <button type="button" className="ra-btn ra-btn-primary" onClick={onSubmit}>
            Ajukan Akses
          </button>
        </div>
      </div>
    </div>
  );
}
