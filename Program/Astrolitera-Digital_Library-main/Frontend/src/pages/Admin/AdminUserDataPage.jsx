import React, { useMemo, useState } from "react";
import "./AdminUserDataPage.css";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { getSessionUser, clearSessionUser } from "../../utils/session";
import SideMenu from "../../components/SideMenu";
import { supabase } from "../../utils/supabaseClient";


const sessionUser = getSessionUser();

const userData = [
  {
    id: 1,
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
    name: "Anonim",
    nis: "123456789",
    date: "00 - 00 - 0000",
    status: "Menunggu",
  },
  {
    id: 2,
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    name: "Anonim",
    nis: "123456789",
    date: "00 - 00 - 0000",
    status: "Menunggu",
  },
  {
    id: 3,
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
    name: "Anonim",
    nis: "123456789",
    date: "00 - 00 - 0000",
    status: "Menunggu",
  },
  {
    id: 4,
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
    name: "Anonim",
    nis: "123456789",
    date: "00 - 00 - 0000",
    status: "Menunggu",
  },
  {
    id: 5,
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
    name: "Anonim",
    nis: "123456789",
    date: "00 - 00 - 0000",
    status: "Menunggu",
  },
  {
    id: 6,
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
    name: "Anonim",
    nis: "123456789",
    date: "00 - 00 - 0000",
    status: "Menunggu",
  },
  {
    id: 7,
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
    name: "Anonim",
    nis: "123456789",
    date: "00 - 00 - 0000",
    status: "Menunggu",
  },
];

const tabs = ["Menunggu Persetujuan", "Anggota Aktif"];
const statusOptions = ["Semua Status", "Disetujui", "Menunggu", "Ditolak"];

export default function AdminUserDataPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Menunggu Persetujuan");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  if (sessionUser?.role !== "Admin") {
    return <Navigate to="/home" />;
  }

  const filteredUsers = useMemo(() => {
    let result = [...userData];

    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerQuery) ||
          item.nis.toLowerCase().includes(lowerQuery)
      );
    }

    if (activeTab === "Menunggu Persetujuan") {
      result = result.filter((item) => item.status === "Menunggu");
    }

    if (activeTab === "Anggota Aktif") {
      result = result.filter((item) =>
        ["Disetujui", "Ditolak", "Menunggu"].includes(item.status)
      );
    }

    if (statusFilter !== "Semua Status") {
      result = result.filter((item) => item.status === statusFilter);
    }

    return result;
  }, [activeTab, query, statusFilter]);


  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentUser = filteredUsers.slice(startIndex, endIndex);

  const getStatusClassName = (status) => {
    if (status === "Disetujui") return "is-approved";
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
                          src={item.photo}
                          alt={item.name}
                        />
                      </td>
                      <td>
                        <strong className="admin-user-name">{item.name}</strong>
                      </td>
                      <td>{item.nis}</td>
                      <td>{item.date}</td>
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
                              <button type="button" className="is-edit">
                                Edit
                              </button>
                              <button type="button" className="is-delete">
                                Hapus
                              </button>
                              <button type="button" className="is-view">
                                Lihat
                              </button>
                            </>
                          ) : (
                            <>
                              <button type="button" className="is-delete">
                                Hapus
                              </button>
                              <button type="button" className="is-view">
                                Lihat
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
              Menampilkan {filteredUsers.length === 0 ? 0 : 1}-{Math.min(endIndex, filteredUsers.length)} dari{" "}
              120 data
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
                disabled={currentPage === totalPages}
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
