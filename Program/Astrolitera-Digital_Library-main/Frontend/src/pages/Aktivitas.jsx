import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock3, CheckCircle2, XCircle, RefreshCw, X } from "lucide-react";

import Header from "../components/Header";
import SideMenu from "../components/SideMenu";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "../components/Toast";
import { supabase } from "../utils/supabaseClient";
import { getSessionUser } from "../utils/session";

import "./Aktivitas.css";

function formatDate(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase();
}

function statusMeta(status) {
  const normalized = normalizeStatus(status);

  if (normalized === "pending") {
    return {
      text: "Menunggu Persetujuan",
      Icon: Clock3,
      cls: "st-wait",
    };
  }

  if (normalized === "diterima") {
    return {
      text: "Diterima",
      Icon: CheckCircle2,
      cls: "st-ok",
    };
  }

  if (normalized === "ditolak") {
    return {
      text: "Ditolak",
      Icon: XCircle,
      cls: "st-no",
    };
  }

  return {
    text: "Tidak diketahui",
    Icon: Clock3,
    cls: "st-wait",
  };
}

export default function Aktivitas() {
  const navigate = useNavigate();
  const showToast = useToast();
  const sessionUser = getSessionUser();

  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState("semua");
  const [searchText, setSearchText] = useState("");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  function openCancelConfirm(item) {
    setRequestToCancel(item);
    setConfirmOpen(true);
  }

  function closeCancelConfirm() {
    setRequestToCancel(null);
    setConfirmOpen(false);
  }

  async function fetchActivities() {
    if (!sessionUser?.id) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data: borrowData, error: borrowError } = await supabase
        .from("borrow")
        .select("*")
        .eq("user_id", sessionUser.id)
        .order("created_at", { ascending: false });

      if (borrowError) throw borrowError;

      const bookIds = [
        ...new Set(
          (borrowData || [])
            .map((item) => item.book_id)
            .filter(Boolean)
        ),
      ];

      if (bookIds.length === 0) {
        setActivities([]);
        return;
      }

      const { data: bookData, error: bookError } = await supabase
        .from("books")
        .select("*")
        .in("id", bookIds);

      if (bookError) throw bookError;

      const booksMap = new Map(
        (bookData || []).map((book) => [book.id, book])
      );

      const joinedData = (borrowData || [])
        .map((borrow) => ({
          ...borrow,
          book: booksMap.get(borrow.book_id),
        }))
        .filter((item) => item.book);

      setActivities(joinedData);
    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal memuat aktivitas");
    } finally {
      setLoading(false);
    }
  }

  const rows = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    let result = [...activities];

    if (tab !== "semua") {
      result = result.filter(
        (item) => normalizeStatus(item.status) === tab
      );
    }

    if (q) {
      result = result.filter((item) =>
        (item.book?.title || "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [activities, tab, searchText]);

  async function cancelRequest(item) {
    if (!item?.id || !sessionUser?.id) return;

    try {
      const { error } = await supabase
        .from("borrow")
        .delete()
        .eq("id", item.id)
        .eq("user_id", sessionUser.id)
        .eq("status", item.status);

      if (error) throw error;

      setActivities((prev) =>
        prev.filter((row) => row.id !== item.id)
      );

      showToast?.("info", "Permintaan akses dibatalkan");
    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal membatalkan permintaan");
    }
  }

  async function reRequest(item) {
    if (!item?.id || !sessionUser?.id) return;

    try {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from("borrow")
        .update({
          status: "Pending",
          borrow_date: now,
          return_date: null,
        })
        .eq("id", item.id)
        .eq("user_id", sessionUser.id);

      if (error) throw error;

      setActivities((prev) =>
        prev.map((row) =>
          row.id === item.id
            ? {
                ...row,
                status: "Pending",
                borrow_date: now,
                return_date: null,
              }
            : row
        )
      );

      showToast?.("success", "Permintaan akses diajukan ulang");
    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal mengajukan ulang akses");
    }
  }

  function handleReadBook(item) {
    if (normalizeStatus(item.status) !== "diterima") {
      showToast?.("info", "Akses buku belum disetujui admin");
      return;
    }

    if (!item.book?.file_url) {
      showToast?.("error", "File buku belum tersedia");
      return;
    }

    navigate("/bookReader", {
      state: {
        pdfSrc: item.book.file_url,
        title: item.book.title,
        bookId: item.book.id,
      },
    });
  }

  return (
    <div className="aktivitas-page">
      <Header
        showSearch={false}
        showMenu={true}
        showBack={false}
        onMenuClick={() => setMenuOpen(true)}
      />

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="aktivitas-wrap">
        <h1 className="aktivitas-title">Aktivitas</h1>

        <div className="aktivitas-tabs">
          <button
            type="button"
            className={tab === "semua" ? "active" : ""}
            onClick={() => setTab("semua")}
          >
            Semua
          </button>

          <button
            type="button"
            className={tab === "pending" ? "active" : ""}
            onClick={() => setTab("pending")}
          >
            Menunggu
          </button>

          <button
            type="button"
            className={tab === "diterima" ? "active" : ""}
            onClick={() => setTab("diterima")}
          >
            Diterima
          </button>

          <button
            type="button"
            className={tab === "ditolak" ? "active" : ""}
            onClick={() => setTab("ditolak")}
          >
            Ditolak
          </button>
        </div>

        <div className="activity-search">
          <input
            type="text"
            placeholder="Cari aktivitas..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className="aktivitas-list">
          {loading ? (
            <div className="aktivitas-empty">Memuat aktivitas...</div>
          ) : rows.length === 0 ? (
            <div className="aktivitas-empty">Belum ada aktivitas.</div>
          ) : (
            rows.map((item) => {
              const normalizedStatus = normalizeStatus(item.status);
              const { text, Icon, cls } = statusMeta(item.status);

              return (
                <div key={item.id} className="aktivitas-card">
                  <img
                    className="aktivitas-cover"
                    src={item.book.cover_url}
                    alt={item.book.title}
                  />

                  <div className="aktivitas-info">
                    <div className="aktivitas-row1">
                      <h3 className="aktivitas-booktitle">
                        {item.book.title}
                      </h3>
                    </div>

                    <div className="aktivitas-sub">
                      Diajukan:{" "}
                      <strong>
                        {formatDate(item.borrow_date || item.created_at)}
                      </strong>
                    </div>

                    {item.return_date && (
                      <div className="aktivitas-sub">
                        Batas baca:{" "}
                        <strong>{formatDate(item.return_date)}</strong>
                      </div>
                    )}

                    <div className={`aktivitas-status ${cls}`}>
                      <Icon size={18} />
                      <span>
                        Status: <strong>{text}</strong>
                      </span>
                    </div>

                    <div className="aktivitas-actions">
                      {normalizedStatus === "pending" && (
                        <button
                          type="button"
                          className="act-btn act-cancel"
                          onClick={() => openCancelConfirm(item)}
                        >
                          <X size={16} /> Batal
                        </button>
                      )}

                      {normalizedStatus === "diterima" && (
                        <button
                          type="button"
                          className="act-btn act-read"
                          onClick={() => handleReadBook(item)}
                        >
                          Baca Sekarang
                        </button>
                      )}

                      {normalizedStatus === "ditolak" && (
                        <button
                          type="button"
                          className="act-btn act-rereq"
                          onClick={() => reRequest(item)}
                        >
                          <RefreshCw size={16} /> Ajukan Ulang
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <ConfirmModal
        open={confirmOpen}
        title="Yakin ingin membatalkan pengajuan ini?"
        message="Permintaan akses baca buku akan dibatalkan dan dihapus dari aktivitas."
        cancelText="Batal"
        confirmText="Hapus"
        type="danger"
        onCancel={closeCancelConfirm}
        onConfirm={async () => {
          if (!requestToCancel) return;

          await cancelRequest(requestToCancel);
          closeCancelConfirm();
        }}
      />
    </div>
  );
}