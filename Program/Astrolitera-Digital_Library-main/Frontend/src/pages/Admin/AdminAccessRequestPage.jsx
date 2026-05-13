import React, { useEffect, useMemo, useState } from "react";
import "./AdminAccessRequestPage.css";
import { useToast } from "../../components/Toast";
import Header from "../../components/Header";
import SideMenu from "../../components/SideMenu";
import { Navigate } from "react-router-dom";
import { getSessionUser } from "../../utils/session";
import { supabase } from "../../utils/supabaseClient";
import defaultAvatar from "../../assets/default-avatar.jpg";

const statusOptions = ["Semua Status", "Diterima", "Pending", "Ditolak"];

export default function AdminAccessRequestPage() {
  const sessionUser = getSessionUser();
  const showToast = useToast();

  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [requests, setRequests] = useState([]);

  const itemsPerPage = 10;

  if (sessionUser?.role !== "Admin") {
    return <Navigate to="/home" />;
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
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
      setCurrentPage(1);
    }
  }

  const filteredRequests = useMemo(() => {
    let result = [...requests];

    if (query.trim()) {
      const lowerQuery = query.toLowerCase();

      result = result.filter((item) => {
        const username = item.profiles?.username || "";
        const title = item.books?.title || "";
        const author = item.books?.author || "";

        return (
          username.toLowerCase().includes(lowerQuery) ||
          title.toLowerCase().includes(lowerQuery) ||
          author.toLowerCase().includes(lowerQuery)
        );
      });
    }

    if (statusFilter !== "Semua Status") {
      result = result.filter((item) => item.status === statusFilter);
    }

    return result;
  }, [requests, query, statusFilter]);

  function getReturnDateFromBorrowDate(borrowDate) {
    const baseDate = borrowDate ? new Date(borrowDate) : new Date();

    baseDate.setDate(baseDate.getDate() + 3);

    return baseDate.toISOString();
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

      showToast?.("success", "Permintaan akses diterima");
      fetchRequests();
    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal menerima permintaan akses");
    }
  }

  async function handleReject(id) {
    try {
      const { error } = await supabase
        .from("borrow")
        .update({
          status: "Ditolak",
          return_date: null,
        })
        .eq("id", id);

      if (error) throw error;

      showToast?.("success", "Permintaan akses ditolak");
      fetchRequests();
    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal menolak permintaan akses");
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Hapus data pengajuan ini?");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("borrow")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setRequests((prev) => prev.filter((item) => item.id !== id));
      showToast?.("success", "Data pengajuan berhasil dihapus");
    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal menghapus data pengajuan");
    }
  }

  function getStatusClassName(status) {
    if (status === "Diterima") return "is-approved";
    if (status === "Ditolak") return "is-rejected";
    return "is-pending";
  }

  function getStatusText(status) {
    if (status === "Diterima") return "Diterima";
    if (status === "Ditolak") return "Ditolak";
    return "Pending";
  }

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentReq = filteredRequests.slice(startIndex, endIndex);

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
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "Semua Status"
                      ? "Semua Status"
                      : getStatusText(option)}
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
                  {filteredRequests.length > 0 ? (
                    currentReq.map((item, index) => (
                      <tr key={item.id}>
                        <td>
                          <span className="admin-access-order">
                            {startIndex + index + 1}.
                          </span>
                        </td>

                        <td>
                          <img
                            className="admin-access-avatar"
                            src={
                              item.profiles?.foto_profil ||
                              defaultAvatar
                            }
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
                              src={
                                item.books?.cover_url ||
                                "/default-book.png"
                              }
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

                        <td>
                          {item.borrow_date
                            ? new Date(item.borrow_date).toLocaleDateString(
                                "id-ID"
                              )
                            : "-"}
                        </td>

                        <td>
                          {item.return_date
                            ? new Date(item.return_date).toLocaleDateString(
                                "id-ID"
                              )
                            : "-"}
                        </td>

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
                            {item.status === "Pending" && (
                              <>
                                <button
                                  type="button"
                                  className="is-approve"
                                  onClick={() => handleApprove(item)}
                                >
                                  Setujui
                                </button>

                                <button
                                  type="button"
                                  className="is-reject"
                                  onClick={() => handleReject(item.id)}
                                >
                                  Tolak
                                </button>
                              </>
                            )}

                            {item.status === "Diterima" && (
                              <button
                                type="button"
                                className="is-reject"
                                onClick={() => handleReject(item.id)}
                              >
                                Tolak
                              </button>
                            )}

                            {item.status === "Ditolak" && (
                              <button
                                type="button"
                                className="is-delete"
                                onClick={() => handleDelete(item.id)}
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
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
                  disabled={currentPage === 1}
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    type="button"
                    className={currentPage === i + 1 ? "is-active" : ""}
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
                  disabled={currentPage >= totalPages || totalPages === 0}
                >
                  ›
                </button>
              </div>
            </footer>
          </section>
        </main>
      </div>
    </div>
  );
}