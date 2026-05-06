import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import SideMenu from "../components/SideMenu";
import { books } from "../data/Books";
import { useToast } from "../components/Toast";
import { Clock3, CheckCircle2, XCircle, RefreshCw, X } from "lucide-react";
import "./Aktivitas.css";

const ACCESS_KEY = "bookAccessRequests";

function readRequests() {
  try {
    const raw = localStorage.getItem(ACCESS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeRequests(list) {
  localStorage.setItem(ACCESS_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("bookAccessRequests:changed"));
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

export default function Aktivitas() {
  const navigate = useNavigate();
  const showToast = useToast();

  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState("semua"); // semua | menunggu | disetujui | ditolak
  const [searchText, setSearchText] = useState("");
  const [requests, setRequests] = useState(() => readRequests());

  useEffect(() => {
    const onChanged = () => setRequests(readRequests());
    window.addEventListener("bookAccessRequests:changed", onChanged);
    return () => window.removeEventListener("bookAccessRequests:changed", onChanged);
  }, []);

  const rows = useMemo(() => {
    const q = (searchText || "").trim().toLowerCase();
    const joined = requests
      .map((r) => {
        const book = books.find((b) => Number(b.id) === Number(r.bookId));
        return book ? { ...r, book } : null;
      })
      .filter(Boolean);

    let list = joined;

    if (tab !== "semua") list = list.filter((x) => x.status === tab);
    if (q) list = list.filter((x) => (x.book.title || "").toLowerCase().includes(q));

    // newest first by requestedAt
    list = [...list].sort((a, b) => (b.requestedAt || "").localeCompare(a.requestedAt || ""));
    return list;
  }, [requests, tab, searchText]);

  const cancelRequest = (bookId) => {
    const next = readRequests().filter((r) => Number(r.bookId) !== Number(bookId));
    writeRequests(next);
    showToast?.("info", "Permintaan akses dibatalkan.");
  };

  const reRequest = (bookId) => {
    const list = readRequests();
    const idx = list.findIndex((r) => Number(r.bookId) === Number(bookId));
    if (idx < 0) return;

    const curr = list[idx];
    if (curr.status === "menunggu") {
      showToast?.("info", "Permintaan masih menunggu persetujuan admin.");
      return;
    }
    list[idx] = { ...curr, status: "menunggu", requestedAt: new Date().toISOString() };
    writeRequests(list);
    showToast?.("success", "Permintaan akses diajukan ulang. Silakan tunggu persetujuan admin.");
  };

  const statusMeta = (status) => {
    if (status === "menunggu")
      return { text: "Menunggu Persetujuan", Icon: Clock3, cls: "st-wait" };
    if (status === "disetujui")
      return { text: "Disetujui", Icon: CheckCircle2, cls: "st-ok" };
    return { text: "Ditolak", Icon: XCircle, cls: "st-no" };
  };

  return (
    <div className="aktivitas-page">
      <Header
        showSearch={false}
        showMenu={true}
        showBack={false}
        onMenuClick={() => setMenuOpen(true)}
        searchValue={searchText}
        onSearchChange={setSearchText}
        searchPlaceholder="Cari Buku"
        onSearchSubmit={() => { }}
      />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="aktivitas-wrap">
        <h1 className="aktivitas-title">Aktivitas</h1>

        <div className="aktivitas-tabs">
          <button className={tab === "semua" ? "active" : ""} onClick={() => setTab("semua")}>Semua</button>
          <button className={tab === "menunggu" ? "active" : ""} onClick={() => setTab("menunggu")}>Menunggu</button>
          <button className={tab === "disetujui" ? "active" : ""} onClick={() => setTab("disetujui")}>Disetujui</button>
          <button className={tab === "ditolak" ? "active" : ""} onClick={() => setTab("ditolak")}>Ditolak</button>
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
          {rows.length === 0 ? (
            <div className="aktivitas-empty">
              Belum ada aktivitas.
            </div>
          ) : (
            rows.map((x) => {
              const { text, Icon, cls } = statusMeta(x.status);
              return (
                <div key={x.bookId} className="aktivitas-card">
                  <img className="aktivitas-cover" src={x.book.cover} alt={x.book.title} />

                  <div className="aktivitas-info">
                    <div className="aktivitas-row1">
                      <h3 className="aktivitas-booktitle">{x.book.title}</h3>
                    </div>

                    <div className="aktivitas-sub">
                      Diajukan: <strong>{formatDate(x.requestedAt)}</strong>
                    </div>

                    <div className={`aktivitas-status ${cls}`}>
                      <Icon size={18} />
                      <span>Status: <strong>{text}</strong></span>
                    </div>

                    <div className="aktivitas-actions">
                      {x.status === "menunggu" && (
                        <button className="act-btn act-cancel" onClick={() => cancelRequest(x.bookId)}>
                          <X size={16} /> Batal
                        </button>
                      )}

                      {x.status === "disetujui" && (
                        <button className="act-btn act-read" onClick={() => navigate(`/baca/${x.bookId}`)}>
                          Baca Sekarang
                        </button>
                      )}

                      {x.status === "ditolak" && (
                        <button className="act-btn act-rereq" onClick={() => reRequest(x.bookId)}>
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
      </div>
    </div>
  );
}
