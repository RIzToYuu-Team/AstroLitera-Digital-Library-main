import React, { useEffect, useMemo, useState } from "react";
import "./AdminUserDataPage.css";
import { useToast } from "../../components/Toast";
import Header from "../../components/Header";
import SideMenu from "../../components/SideMenu";
import ConfirmModal from "../../components/ConfirmModal";
import { Navigate } from "react-router-dom";
import { getSessionUser, clearSessionUser } from "../../utils/session";
import { supabase } from "../../utils/supabaseClient";
import defaultAvatar from "../../assets/default-avatar.jpg";

const TABS = ["Menunggu Persetujuan", "Anggota Aktif"];
const STATUS_OPTIONS = ["Semua Status", "Diterima", "Pending", "Ditolak"];
const ITEMS_PER_PAGE = 10;

function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase();
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

export default function AdminUserDataPage() {
  const sessionUser = getSessionUser();
  const showToast = useToast();

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Menunggu Persetujuan");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [currentPage, setCurrentPage] = useState(1);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmUser, setConfirmUser] = useState(null);

  if (sessionUser?.role !== "Admin") {
    return <Navigate to="/home" />;
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, query, statusFilter]);

  const confirmConfig = useMemo(() => {
    if (!confirmAction || !confirmUser) return null;

    const username = confirmUser.username || "pengguna ini";

    if (confirmAction === "approve") {
      return {
        title: "Setujui pengguna ini?",
        message: `Akun "${username}" akan diterima sebagai anggota aktif.`,
        confirmText: "Setujui",
        type: "primary",
      };
    }

    if (confirmAction === "reject") {
      return {
        title: "Tolak pengguna ini?",
        message: `Akun "${username}" akan ditandai sebagai ditolak.`,
        confirmText: "Tolak",
        type: "danger",
      };
    }

    return {
      title: "Hapus pengguna ini?",
      message: `Data "${username}" akan dihapus permanen, termasuk foto profil dan kartu perpustakaan jika ada.`,
      confirmText: "Hapus",
      type: "danger",
    };
  }, [confirmAction, confirmUser]);

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
    }
  }

  const filteredUsers = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();

    return users.filter((item) => {
      const status = normalizeStatus(item.status);

      const matchesQuery =
        !lowerQuery ||
        (item.username || "").toLowerCase().includes(lowerQuery) ||
        String(item.nis || "").toLowerCase().includes(lowerQuery) ||
        String(item.nip || "").toLowerCase().includes(lowerQuery);

      const matchesTab =
        activeTab === "Menunggu Persetujuan"
          ? status === "pending"
          : status === "diterima" || status === "ditolak";

      const matchesStatus =
        statusFilter === "Semua Status" ||
        status === normalizeStatus(statusFilter);

      return matchesQuery && matchesTab && matchesStatus;
    });
  }, [users, activeTab, query, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  function openConfirm(action, user) {
    setConfirmAction(action);
    setConfirmUser(user);
  }

  function closeConfirm() {
    setConfirmAction(null);
    setConfirmUser(null);
  }

  async function runConfirmedAction() {
    if (!confirmAction || !confirmUser) return;

    if (confirmAction === "approve") {
      await handleApproveUser(confirmUser);
    }

    if (confirmAction === "reject") {
      await handleRejectUser(confirmUser);
    }

    if (confirmAction === "delete") {
      await handleDeleteUser(confirmUser);
    }

    closeConfirm();
  }

  function handleViewUser(user) {
    setSelectedUser(user);
    setShowViewModal(true);
  }

  function closeViewModal() {
    setSelectedUser(null);
    setShowViewModal(false);
  }

  async function handleApproveUser(user) {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "Diterima" })
        .eq("id", user.id);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id ? { ...item, status: "Diterima" } : item
        )
      );

      showToast?.("success", "Pengguna berhasil diterima", 3000);
    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal menyetujui pengguna", 3000);
    }
  }

  async function handleRejectUser(user) {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "Ditolak" })
        .eq("id", user.id);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id ? { ...item, status: "Ditolak" } : item
        )
      );

      showToast?.("success", "Pengguna berhasil ditolak", 3000);
    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal menolak pengguna", 3000);
    }
  }

  function getStoragePath(value, bucketName) {
    if (!value) return "";

    if (!value.startsWith("http://") && !value.startsWith("https://")) {
      return value;
    }

    try {
      const url = new URL(value);
      const marker = `/storage/v1/object/public/${bucketName}/`;
      const index = url.pathname.indexOf(marker);

      if (index === -1) return "";

      return decodeURIComponent(
        url.pathname.slice(index + marker.length)
      );
    } catch {
      return "";
    }
  }

  async function removeStorageFile(bucketName, value) {
    const path = getStoragePath(value, bucketName);
    if (!path) return;

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([path]);

    if (error) throw error;
  }

  async function handleDeleteUser(user) {
    try {
      if (user.foto_profil) {
        await removeStorageFile("foto_profil", user.foto_profil);
      }

      if (user.kartu_perpustakaan) {
        await removeStorageFile("kartu_perpustakaan", user.kartu_perpustakaan);
      }

      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (error) throw error;

      const currentSession = getSessionUser();

      if (currentSession?.id === user.id) {
        clearSessionUser();
        window.dispatchEvent(new Event("session-changed"));
      }

      setUsers((prev) => prev.filter((item) => item.id !== user.id));

      showToast?.("success", "User berhasil dihapus", 3000);
    } catch (err) {
      console.error(err);
      showToast?.("error", err.message || "Gagal menghapus user", 3000);
    }
  }

  function getKartuUrl(value) {
    if (!value) return "";

    if (value.startsWith("http://") || value.startsWith("https://")) {
      return value;
    }

    const { data } = supabase.storage
      .from("kartu_perpustakaan")
      .getPublicUrl(value);

    return data.publicUrl;
  }

  return (
    <div className="admin-user-page">
      <Header
        showSearch={false}
        showMenu={true}
        onMenuClick={() => setMenuOpen(true)}
      />

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
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="admin-user-panel">
          <div className="admin-user-tabs">
            {TABS.map((tab) => (
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
                {currentUsers.length > 0 ? (
                  currentUsers.map((item, index) => (
                    <tr key={item.id}>
                      <td>
                        <span className="admin-user-order">
                          {startIndex + index + 1}
                        </span>
                      </td>

                      <td>
                        <img
                          className="admin-user-avatar"
                          src={item.foto_profil || defaultAvatar}
                          alt={item.username || "User"}
                        />
                      </td>

                      <td>
                        <strong className="admin-user-name">
                          {item.username || "-"}
                        </strong>
                      </td>

                      <td>{item.nis || item.nip || "-"}</td>

                      <td>{formatDate(item.created_at)}</td>

                      {activeTab === "Anggota Aktif" && (
                        <td>
                          <span
                            className={`admin-user-status ${getStatusClassName(
                              item.status
                            )}`}
                          >
                            {item.status || "-"}
                          </span>
                        </td>
                      )}

                      <td>
                        <div className="admin-user-actions">
                          <button
                            type="button"
                            className="is-view"
                            onClick={() => handleViewUser(item)}
                          >
                            Lihat
                          </button>

                          {activeTab === "Menunggu Persetujuan" ? (
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
                                className="is-delete"
                                onClick={() => openConfirm("reject", item)}
                              >
                                Tolak
                              </button>
                            </>
                          ) : (
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

      {showViewModal && selectedUser && (
        <div className="admin-user-view-overlay">
          <div className="admin-user-view-card">
            <button
              type="button"
              className="admin-user-view-close"
              onClick={closeViewModal}
            >
              ×
            </button>

            <aside className="admin-user-view-sidebar">
              <div className="admin-user-view-profile">
                <div className="admin-user-view-avatar">
                  <img
                    src={selectedUser.foto_profil || defaultAvatar}
                    alt={selectedUser.username || "User"}
                  />
                </div>

                <div>
                  <h2>{selectedUser.username || "Anonim"}</h2>
                  <p>{selectedUser.status || "Status tidak tersedia"}</p>
                </div>
              </div>
            </aside>

            <section className="admin-user-view-content">
              <h1>Detail Pengguna</h1>

              <div className="admin-user-view-grid">
                <ViewField label="NIS" value={selectedUser.nis || "-"} />
                <ViewField label="Nama" value={selectedUser.username || "-"} />
                <ViewField label="Kelas" value={selectedUser.kelas || "-"} />
                <ViewField label="Email" value={selectedUser.email || "-"} />

                <div className="admin-user-view-field admin-user-view-kartu">
                  <label>Kartu Perpustakaan</label>

                  {selectedUser.kartu_perpustakaan ? (
                    <div className="admin-user-view-kartu-preview">
                      <img
                        src={getKartuUrl(selectedUser.kartu_perpustakaan)}
                        alt={`Kartu perpustakaan ${selectedUser.username || ""
                          }`}
                      />
                    </div>
                  ) : (
                    <div className="admin-user-view-value">
                      Tidak ada kartu perpustakaan
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

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

function ViewField({ label, value }) {
  return (
    <div className="admin-user-view-field">
      <label>{label}</label>
      <div className="admin-user-view-value">{value}</div>
    </div>
  );
}