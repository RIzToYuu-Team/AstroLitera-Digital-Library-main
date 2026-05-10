import React, { useEffect, useMemo, useState } from "react";
import "./AdminAccessRequestPage.css";
import { useToast } from "../../components/Toast";
import Header from "../../components/Header";
import SideMenu from "../../components/SideMenu";
import { Navigate } from "react-router-dom";
import { getSessionUser } from "../../utils/session";
import { supabase } from "../../utils/supabaseClient";

const statusOptions = ["Semua Status", "Diterima", "Pending", "Ditolak"];

export default function AdminAccessRequestPage() {
  const sessionUser = getSessionUser();
  const showToast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const itemsPerPage = 10;

  if (sessionUser?.role !== "Admin") {
    return <Navigate to="/home" />;
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from("borrow")
        .select(`
        *,
        profiles:user_id (
          id,
          username,
          foto_profil
        ),
        books:book_id (
          id,
          judul,
          penulis,
          cover_buku
        )
      `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setUsers(data || []);

    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal memuat data pengajuan");
    } finally {
      setCurrentPage(1);
    }
  }

  const filteredRequests = useMemo(() => {
    let result = [...users];

    if (query.trim()) {
      const lowerQuery = query.toLowerCase();

      result = result.filter(
        (item) =>
          item.profiles?.username
            ?.toLowerCase()
            .includes(lowerQuery) ||

          item.books?.judul
            ?.toLowerCase()
            .includes(lowerQuery) ||

          item.books?.penulis
            ?.toLowerCase()
            .includes(lowerQuery)
      );
    }

    if (statusFilter !== "Semua Status") {
      result = result.filter(
        (item) => item.status === statusFilter
      );
    }

    return result;
  }, [users, query, statusFilter]);

  async function handleApprove(id) {
    try {
      const { error } = await supabase
        .from("borrow")
        .update({
          status: "Diterima"
        })
        .eq("id", id);

      if (error) throw error;

      fetchUsers();

    } catch (err) {
      console.error(err);
    }
  }

  async function handleReject(id) {
    try {
      const { error } = await supabase
        .from("borrow")
        .update({
          status: "Ditolak"
        })
        .eq("id", id);

      if (error) throw error;

      fetchUsers();

    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    try {
      const { error } = await supabase
        .from("borrow")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setUsers((prev) =>
        prev.filter((item) => item.id !== id)
      );

    } catch (err) {
      console.error(err);
    }
  }

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentReq = filteredRequests.slice(startIndex, endIndex);

  const getStatusClassName = (status) => {
    if (status === "Diterima") return "is-approved";
    if (status === "Ditolak") return "is-rejected";
    return "is-pending";
  };

  return (
    <div className="admin-access-page">

      <div className="admin-access-main">
        <Header
          showSearch={false}
          showMenu={true}
          onMenuClick={() => setMenuOpen(true)} />
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
                placeholder="Cari pengguna yang kamu cari"
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
                    <th>Tanggal</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.length > 0 ? (
                    currentReq.map((item, index) => (
                      <tr key={item.id}>
                        <td>
                          <span className="admin-access-order">{startIndex + index + 1}.</span>
                        </td>
                        <td>
                          <img
                            className="admin-access-avatar"
                            src={item.profiles?.foto_profil || "/default-avatar.jpg"}
                            alt={item.profiles?.username}
                          />
                        </td>
                        <td>
                          <strong className="admin-access-name">{item.profiles?.username}</strong>
                        </td>
                        <td>
                          <div className="admin-access-book">
                            <img
                              className="admin-access-book__cover"
                              src={item.books?.cover_buku || "/default-book.png"}
                              alt={item.books?.judul}
                            />
                            <div className="admin-access-book__meta">
                              <strong>{item.books?.judul}</strong>
                              <span>{item.books?.penulis}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          {new Date(item.created_at)
                            .toLocaleDateString("id-ID")}
                        </td>
                        <td>
                          <span
                            className={`admin-access-status ${getStatusClassName(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <div className="admin-access-actions">
                            {item.status === "Pending" && (
                              <>
                                <button type="button" className="is-approve">
                                  Setujui
                                </button>
                                <button type="button" className="is-reject">
                                  Tolak
                                </button>
                              </>
                            )}

                            {item.status === "Diterima" && (
                              <button type="button" className="is-reject">
                                Tolak
                              </button>
                            )}

                            {item.status === "Ditolak" && (
                              <button type="button" className="is-delete">
                                Hapus
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">
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
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={
                    currentPage >= totalPages || totalPages === 0
                  }
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
