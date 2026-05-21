import React, { useEffect, useMemo, useState } from "react";
import "./AdminAccessRequestPage.css";
import { Navigate } from "react-router-dom";

import Header from "../../components/Header";
import SideMenu from "../../components/SideMenu";
import ConfirmModal from "../../components/ConfirmModal";
import { useToast } from "../../components/Toast";

import { getSessionUser } from "../../utils/session";
import { supabase } from "../../utils/supabaseClient";
import defaultAvatar from "../../assets/default-avatar.jpg";

const STATUS_OPTIONS = ["Semua Status", "Pending", "Diterima", "Ditolak"];
const ITEMS_PER_PAGE = 10;

function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase();
}

function getStatusText(status) {
  const normalized = normalizeStatus(status);

  if (normalized === "diterima") return "Diterima";
  if (normalized === "ditolak") return "Ditolak";
  return "Pending";
}

function getStatusClassName(status) {
  const normalized = normalizeStatus(status);

  if (normalized === "diterima") return "is-approved";
  if (normalized === "ditolak") return "is-rejected";
  return "is-pending";
}

function formatDate(value) {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleDateString("id-ID");
  } catch {
    return "-";
  }
}

function getReturnDateFromBorrowDate(borrowDate) {
  const baseDate = borrowDate ? new Date(borrowDate) : new Date();
  baseDate.setDate(baseDate.getDate() + 3);
  return baseDate.toISOString();
}

function isPastReturnDate(returnDate) {
  if (!returnDate) return false;
  return new Date(returnDate) < new Date();
}

function getRequestTitle(item) {
  const username = item?.profiles?.username || "pengguna ini";
  const bookTitle = item?.books?.title || "buku ini";
  return `${username} - ${bookTitle}`;
}

export default function AdminAccessRequestPage() {
  const sessionUser = getSessionUser();
  const showToast = useToast();

  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  if (sessionUser?.role !== "Admin") {
    return <Navigate to="/home" />;
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter]);

  const confirmConfig = useMemo(() => {
    if (!confirmAction || !selectedRequest) return null;

    const requestTitle = getRequestTitle(selectedRequest);

    if (confirmAction === "approve") {
      return {
        title: "Setujui pengajuan akses?",
        message: `Akses baca untuk "${requestTitle}" akan diterima. Tanggal kembali akan dibuat otomatis 3 hari setelah tanggal pinjam.`,
        confirmText: "Setujui",
        type: "primary",
      };
    }

    if (confirmAction === "reject") {
      return {
        title: "Tolak pengajuan akses?",
        message: `Pengajuan akses untuk "${requestTitle}" akan ditolak.`,
        confirmText: "Tolak",
        type: "danger",
      };
    }

    return {
      title: "Hapus data pengajuan?",
      message: `Data pengajuan "${requestTitle}" akan dihapus permanen dan tidak dapat dipulihkan kembali.`,
      confirmText: "Hapus",
      type: "danger",
    };
  }, [confirmAction, selectedRequest]);

  async function fetchRequests() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("borrow")
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            foto_profil,
            nis,
            nip
          ),
          books:book_id (
            id,
            title,
            author,
            cover_url
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRequests(data || []);
    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal memuat data pengajuan");
    } finally {
      setLoading(false);
    }
  }

  const filteredRequests = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();

    return requests.filter((item) => {
      const username = item.profiles?.username || "";
      const title = item.books?.title || "";
      const author = item.books?.author || "";

      const matchesQuery =
        !lowerQuery ||
        username.toLowerCase().includes(lowerQuery) ||
        title.toLowerCase().includes(lowerQuery) ||
        author.toLowerCase().includes(lowerQuery);

      const matchesStatus =
        statusFilter === "Semua Status" ||
        normalizeStatus(item.status) === normalizeStatus(statusFilter);

      return matchesQuery && matchesStatus;
    });
  }, [requests, query, statusFilter]);

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  function openConfirm(action, item) {
    setConfirmAction(action);
    setSelectedRequest(item);
  }

  function closeConfirm() {
    setConfirmAction(null);
    setSelectedRequest(null);
  }

  async function runConfirmedAction() {
    if (!confirmAction || !selectedRequest) return;

    if (confirmAction === "approve") {
      await handleApprove(selectedRequest);
    }

    if (confirmAction === "reject") {
      await handleReject(selectedRequest);
    }

    if (confirmAction === "delete") {
      await handleDelete(selectedRequest);
    }

    closeConfirm();
  }

  async function handleApprove(item) {
    try {
      const borrowDate = item.borrow_date || new Date().toISOString();
      const returnDate = getReturnDateFromBorrowDate(borrowDate);

      const { error } = await supabase
        .from("borrow")
        .update({
          status: "Diterima",
          borrow_date: borrowDate,
          return_date: returnDate,
        })
        .eq("id", item.id);

      if (error) throw error;

      setRequests((prev) =>
        prev.map((row) =>
          row.id === item.id
            ? {
              ...row,
              status: "Diterima",
              borrow_date: borrowDate,
              return_date: returnDate,
            }
            : row
        )
      );

      showToast?.("success", "Permintaan akses diterima");
    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal menerima permintaan akses");
    }
  }

  async function handleReject(item) {
    try {
      const { error } = await supabase
        .from("borrow")
        .update({
          status: "Ditolak",
          return_date: null,
        })
        .eq("id", item.id);

      if (error) throw error;

      setRequests((prev) =>
        prev.map((row) =>
          row.id === item.id
            ? {
              ...row,
              status: "Ditolak",
              return_date: null,
            }
            : row
        )
      );

      showToast?.("success", "Permintaan akses ditolak");
    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal menolak permintaan akses");
    }
  }

  async function handleDelete(item) {
    try {
      const { error } = await supabase
        .from("borrow")
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      setRequests((prev) => prev.filter((row) => row.id !== item.id));
      showToast?.("success", "Data pengajuan berhasil dihapus");
    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal menghapus data pengajuan");
    }
  }

  return (
    <div className="admin-access-page">
      <div className="admin-access-main">
        <Header
          showSearch={false}
          showMenu={true}
          onMenuClick={() => setMenuOpen(true)}
        />

        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

        <main className="admin-access-content">
          <section className="admin-access-heading">
            <h1>Pengajuan Akses Baca</h1>
            <p>Kelola permintaan akses membaca buku perpustakaan</p>
          </section>

          <section className="admin-access-filterbar">
            <div className="admin-access-search">
              <span className="admin-access-search__icon">⌕</span>
              <input
                type="text"
                placeholder="Cari pengguna atau buku"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <div className="admin-access-filter">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="admin-access-table-panel">
            <div className="admin-access-table-wrap">
              <table className="admin-access-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Foto</th>
                    <th>Nama</th>
                    <th>Judul Buku</th>
                    <th>Tanggal Pinjam</th>
                    <th>Tanggal Kembali</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8">
                        <div className="admin-access-empty">
                          Memuat data pengajuan...
                        </div>
                      </td>
                    </tr>
                  ) : currentRequests.length > 0 ? (
                    currentRequests.map((item, index) => {
                      const normalizedStatus = normalizeStatus(item.status);
                      const expired = isPastReturnDate(item.return_date);

                      return (
                        <tr key={item.id}>
                          <td>
                            <span className="admin-access-order">
                              {startIndex + index + 1}.
                            </span>
                          </td>

                          <td>
                            <img
                              className="admin-access-avatar"
                              src={item.profiles?.foto_profil || defaultAvatar}
                              alt={item.profiles?.username || "User"}
                            />
                          </td>

                          <td>
                            <strong className="admin-access-name">
                              {item.profiles?.username || "User tidak ditemukan"}
                            </strong>
                          </td>

                          <td>
                            <div className="admin-access-book">
                              <img
                                className="admin-access-book__cover"
                                src={item.books?.cover_url || "/default-book.png"}
                                alt={item.books?.title || "Buku"}
                              />

                              <div className="admin-access-book__meta">
                                <strong>
                                  {item.books?.title || "Buku tidak ditemukan"}
                                </strong>
                                <span>{item.books?.author || "-"}</span>
                              </div>
                            </div>
                          </td>

                          <td>{formatDate(item.borrow_date)}</td>
                          <td>{formatDate(item.return_date)}</td>

                          <td>
                            <span
                              className={`admin-access-status ${getStatusClassName(
                                item.status
                              )}`}
                            >
                              {getStatusText(item.status)}
                            </span>
                          </td>

                          <td>
                            <div className="admin-access-actions">
                              {normalizedStatus === "pending" && (
                                <>
                                  <button
                                    type="button"
                                    className="is-approve"
                                    onClick={() => openConfirm("approve", item)}
                                  >
                                    Setujui
                                  </button>

                                  <button
                                    type="button"
                                    className="is-reject"
                                    onClick={() => openConfirm("reject", item)}
                                  >
                                    Tolak
                                  </button>
                                </>
                              )}

                              {normalizedStatus === "diterima" &&
                                (expired ? (
                                  <span className="admin-access-expired">
                                    Selesai
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    className="is-reject"
                                    onClick={() => openConfirm("reject", item)}
                                  >
                                    Tolak
                                  </button>
                                ))}

                              {normalizedStatus === "ditolak" && (
                                <button
                                  type="button"
                                  className="is-delete"
                                  onClick={() => openConfirm("delete", item)}
                                >
                                  Hapus
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8">
                        <div className="admin-access-empty">
                          Data pengajuan belum ditemukan.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className="admin-access-footer">
              <span>
                Menampilkan{" "}
                {filteredRequests.length === 0 ? 0 : startIndex + 1}
                -
                {Math.min(endIndex, filteredRequests.length)} dari{" "}
                {filteredRequests.length} data
              </span>

              <div className="admin-access-pagination">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={safeCurrentPage === 1}
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    type="button"
                    className={safeCurrentPage === i + 1 ? "is-active" : ""}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, totalPages)
                    )
                  }
                  disabled={safeCurrentPage >= totalPages || totalPages === 0}
                >
                  ›
                </button>
              </div>
            </footer>
          </section>
        </main>
      </div>

      <ConfirmModal
        open={Boolean(confirmConfig)}
        title={confirmConfig?.title}
        message={confirmConfig?.message}
        cancelText="Batal"
        confirmText={confirmConfig?.confirmText}
        type={confirmConfig?.type}
        onCancel={closeConfirm}
        onConfirm={runConfirmedAction}
      />
    </div>
  );
}