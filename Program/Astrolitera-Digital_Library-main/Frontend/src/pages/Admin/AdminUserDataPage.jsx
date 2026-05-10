import React, { useEffect, useMemo, useState } from "react";
import "./AdminUserDataPage.css";
import { useToast } from "../../components/Toast";
import Header from "../../components/Header";
import SideMenu from "../../components/SideMenu";
import { Navigate } from "react-router-dom";
import { getSessionUser } from "../../utils/session";
import { supabase } from "../../utils/supabaseClient";
import defaultAvatar from "../../assets/default-avatar.jpg";

const tabs = ["Menunggu Persetujuan", "Anggota Aktif"];

const statusOptions = ["Semua Status", "Diterima", "Pending", "Ditolak"];

export default function AdminUserDataPage() {
  const sessionUser = getSessionUser();
  const showToast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Menunggu Persetujuan");
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
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setUsers(data || []);

    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal memuat data pengguna");
    } finally {
      setCurrentPage(1);
    }
  }

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (query.trim()) {
      const lowerQuery = query.toLowerCase();

      result = result.filter(
        (item) =>
          item.username?.toLowerCase().includes(lowerQuery) ||
          String(item.nis || "")
            .toLowerCase()
            .includes(lowerQuery) ||
          String(item.nip || "")
            .toLowerCase()
            .includes(lowerQuery)
      );
    }

    if (activeTab === "Menunggu Persetujuan") {
      result = result.filter(
        (item) => item.status === "Pending"
      );
    }

    if (activeTab === "Anggota Aktif") {
      result = result.filter(
        (item) =>
          item.status === "Diterima" ||
          item.status === "Ditolak"
      );
    }

    if (statusFilter !== "Semua Status") {
      result = result.filter(
        (item) => item.status === statusFilter
      );
    }

    return result;
  }, [users, activeTab, query, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentUser = filteredUsers.slice(startIndex, endIndex);
  function handleViewUser(user) {
    showToast?.("info", `
    Nama: ${user.username}
    Email: ${user.email}
    Status: ${user.status}
    `, 3000);
  }

  async function handleApproveUser(id) {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          status: "Diterima"
        })
        .eq("id", id);

      if (error) throw error;
      showToast?.("success", "Pengguna berhasil diterima", 3000);
      fetchUsers();

    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal menyetujui pengguna", 3000);
    }
  }

  async function handleDeleteUser(id) {
    const confirmed = window.confirm("Yakin ingin menghapus pengguna ini?");

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setUsers((prev) =>
        prev.filter((user) => user.id !== id)
      );

    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal menghapus user", 3000);
    }
  }

  const getStatusClassName = (status) => {
    if (status === "Diterima") return "is-approved";
    if (status === "Ditolak") return "is-rejected";
    return "is-pending";
  };

  return (
    <div className="admin-user-page">
      <Header
        showSearch={false}
        showMenu={true}
        onMenuClick={() => setMenuOpen(true)} />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="admin-user-content">
        <section className="admin-user-heading">
          <h1>Kelola Pengguna</h1>
          <p>Kelola semua data anggota perpustakaan</p>
        </section>

        <section className="admin-user-toolbar">
          <div className="admin-user-search">
            <span className="admin-user-search__icon">⌕</span>
            <input
              type="text"
              placeholder="Cari pengguna yang kamu cari"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="admin-user-filter">
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

        <section className="admin-user-panel">
          <div className="admin-user-tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={activeTab === tab ? "is-active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="admin-user-table-wrap">
            <table className="admin-user-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Foto</th>
                  <th>Nama</th>
                  <th>NIS</th>
                  <th>Tanggal</th>
                  {activeTab === "Anggota Aktif" && <th>Status</th>}
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length > 0 ? (
                  currentUser.map((item, index) => (
                    <tr key={item.id}>
                      <td>
                        <span className="admin-user-order">{startIndex + index + 1}</span>
                      </td>
                      <td>
                        <img
                          className="admin-user-avatar"
                          src={item.foto_profil || defaultAvatar}
                          alt={item.username}
                        />
                      </td>
                      <td>
                        <strong className="admin-user-name">
                          {item.username}
                        </strong>
                      </td>
                      <td>{item.nis || item.nip || "-"}</td>
                      <td>
                        {new Date(item.created_at).toLocaleDateString("id-ID")}
                      </td>
                      {activeTab === "Anggota Aktif" && (
                        <td>
                          <span
                            className={`admin-user-status ${getStatusClassName(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>
                      )}
                      <td>
                        <div className="admin-user-actions">
                          {activeTab === "Menunggu Persetujuan" ? (
                            <>
                              <button
                                type="button"
                                className="is-edit"
                                onClick={() => handleApproveUser(item.id)}
                              >
                                Setujui
                              </button>
                              <button type="button" className="is-delete">
                                Hapus
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="is-delete"
                                onClick={() => handleDeleteUser(item.id)}
                              >
                                Hapus
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeTab === "Anggota Aktif" ? 7 : 6}>
                      <div className="admin-user-empty">
                        Data pengguna belum ditemukan.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="admin-user-footer">
            <span>
              Menampilkan{" "}
              {filteredUsers.length === 0 ? 0 : startIndex + 1}
              -
              {Math.min(endIndex, filteredUsers.length)} dari{" "}
              {filteredUsers.length} data
            </span>

            <div className="admin-user-pagination">
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
                disabled={currentPage >= totalPages || totalPages === 0}
              >
                ›
              </button>
            </div>
          </footer>
        </section>
      </main>
    </div >
  );
}
