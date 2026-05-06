import React, { createContext, useContext } from "react";
import { X, CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";
import "./Toast.css";

/**
 * ToastProvider + useToast:
 * - Exposes App-level showToast(type, message) without prop drilling.
 * - Keep UI component (default export) in the same file to avoid many toast files.
 */
const ToastContext = createContext(null);

export function ToastProvider({ showToast, children }) {
  return (
    <ToastContext.Provider value={showToast}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

export default function Toast({
  type = "info",
  message,
  onClose,
  loading = false,
}) {
  const Icon =
    type === "success"
      ? CheckCircle
      : type === "error"
      ? XCircle
      : type === "warning"
      ? AlertTriangle
      : Info;

  const title =
    type === "success"
      ? "Success"
      : type === "error"
      ? "Error"
      : type === "warning"
      ? "Warning"
      : "Info";

  return (
    <div
      className={`toast toast-${type} ${loading ? "toast-loading" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="toast-icon-wrap">
        <Icon size={18} />
      </div>

      <div className="toast-text">
        <strong>{title}</strong>
        <span>{message}</span>
      </div>

      <button
        className="toast-close"
        onClick={onClose}
        disabled={loading}
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
}
