import React, { useMemo, useState } from "react";
import "./AdminAccessRequestPage.css";
import { Navigate } from "react-router-dom";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { getSessionUser, clearSessionUser } from "../../utils/session";
import SideMenu from "../../components/SideMenu";
import { supabase } from "../../utils/supabaseClient";

const sessionUser = getSessionUser();



const requestData = [
  {
    id: 1,
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
    name: "Anonim",
    bookTitle: "Pergi",
    author: "Tere Liye",
    cover:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=120&q=80",
    date: "09 - 11 - 2024",
    status: "Menunggu",
  },
  {
    id: 2,
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    name: "Anonim1",
    bookTitle: "Pergi",
    author: "Tere Liye",
    cover:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=120&q=80",
    date: "10 - 11 - 2024",
    status: "Disetujui",
  },
  {
    id: 3,
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    name: "Anonim2",
    bookTitle: "Pergi",
    author: "Tere Liye",
    cover:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=120&q=80",
    date: "11 - 11 - 2024",
    status: "Ditolak",
  },
  {
    id: 4,
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
    name: "Alya",
    bookTitle: "Bumi",
    author: "Tere Liye",
    cover:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=120&q=80",
    date: "12 - 11 - 2024",
    status: "Menunggu",
  },
  {
    id: 5,
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
    name: "Alya",
    bookTitle: "Bumi",
    author: "Tere Liye",
    cover:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=120&q=80",
    date: "12 - 11 - 2024",
    status: "Menunggu",
  },
  {
    id: 6,
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
    name: "Alya",
    bookTitle: "Bumi",
    author: "Tere Liye",
    cover:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=120&q=80",
    date: "12 - 11 - 2024",
    status: "Menunggu",
  },
];

const statusOptions = ["Semua Status", "Disetujui", "Menunggu", "Ditolak"];

export default function AdminAccessRequestPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  if (sessionUser?.role !== "Admin") {
    return <Navigate to="/home" />;
  }

  const filteredRequests = useMemo(() => {
    return requestData.filter((item) => {
      const matchesQuery =
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.bookTitle.toLowerCase().includes(query.toLowerCase()) ||
        item.author.toLowerCase().includes(query.toLowerCase());

      const matchesStatus =
        statusFilter === "Semua Status" || item.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentReq = filteredRequests.slice(startIndex, endIndex);

  const getStatusClassName = (status) => {
    if (status === "Disetujui") return "is-approved";
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
                            src={item.photo}
                            alt={item.name}
                          />
                        </td>
                        <td>
                          <strong className="admin-access-name">{item.name}</strong>
                        </td>
                        <td>
                          <div className="admin-access-book">
                            <img
                              className="admin-access-book__cover"
                              src={item.cover}
                              alt={item.bookTitle}
                            />
                            <div className="admin-access-book__meta">
                              <strong>{item.bookTitle}</strong>
                              <span>{item.author}</span>
                            </div>
                          </div>
                        </td>
                        <td>{item.date}</td>
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
                            {item.status === "Menunggu" && (
                              <>
                                <button type="button" className="is-approve">
                                  Setujui
                                </button>
                                <button type="button" className="is-reject">
                                  Tolak
                                </button>
                              </>
                            )}

                            {item.status === "Disetujui" && (
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
                Menampilkan {filteredRequests.length === 0 ? 0 : 1}-{Math.min(endIndex, filteredRequests.length)} dari{" "}
                120 data
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
                  disabled={currentPage === totalPages}
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
