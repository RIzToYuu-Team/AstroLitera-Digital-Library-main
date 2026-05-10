import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import "./AdminUserActivityReportPage.css";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { getSessionUser, clearSessionUser } from "../../utils/session";
import SideMenu from "../../components/SideMenu";
import { supabase } from "../../utils/supabaseClient";

const sessionUser = getSessionUser();

const ITEMS_PER_PAGE = 10;

const dummyActivities = [
  {
    id: 1,
    name: "Anonim",
    activity: "Login",
    bookTitle: "Tidak Tersedia",
    author: "",
    time: "07:10",
    date: "08 - 04 - 2026",
    createdAt: "2026-04-08T07:10:00",
  },
  {
    id: 2,
    name: "Anonim1",
    activity: "Membaca Buku",
    bookTitle: "Pergi",
    author: "Tere Liye",
    time: "07:25",
    date: "08 - 04 - 2026",
    createdAt: "2026-04-08T07:25:00",
  },
  {
    id: 3,
    name: "Anonim2",
    activity: "Logout",
    bookTitle: "Pergi",
    author: "Tere Liye",
    time: "07:40",
    date: "08 - 04 - 2026",
    createdAt: "2026-04-08T07:40:00",
  },
  {
    id: 4,
    name: "Anonim3",
    activity: "Wishlist",
    bookTitle: "Bumi",
    author: "Tere Liye",
    time: "08:05",
    date: "08 - 04 - 2026",
    createdAt: "2026-04-08T08:05:00",
  },
  {
    id: 5,
    name: "Anonim4",
    activity: "Login",
    bookTitle: "Tidak Tersedia",
    author: "",
    time: "08:15",
    date: "08 - 04 - 2026",
    createdAt: "2026-04-08T08:15:00",
  },
  {
    id: 6,
    name: "Anonim5",
    activity: "Membaca Buku",
    bookTitle: "Laut Bercerita",
    author: "Leila S. Chudori",
    time: "08:30",
    date: "08 - 04 - 2026",
    createdAt: "2026-04-08T08:30:00",
  },
  {
    id: 7,
    name: "Anonim6",
    activity: "Logout",
    bookTitle: "Tidak Tersedia",
    author: "",
    time: "08:45",
    date: "08 - 04 - 2026",
    createdAt: "2026-04-08T08:45:00",
  },
  {
    id: 8,
    name: "Anonim7",
    activity: "Membaca Buku",
    bookTitle: "Hujan",
    author: "Tere Liye",
    time: "09:05",
    date: "08 - 04 - 2026",
    createdAt: "2026-04-08T09:05:00",
  },
  {
    id: 9,
    name: "Anonim8",
    activity: "Wishlist",
    bookTitle: "Pulang",
    author: "Tere Liye",
    time: "09:20",
    date: "08 - 04 - 2026",
    createdAt: "2026-04-08T09:20:00",
  },
  {
    id: 10,
    name: "Anonim9",
    activity: "Login",
    bookTitle: "Tidak Tersedia",
    author: "",
    time: "09:40",
    date: "08 - 04 - 2026",
    createdAt: "2026-04-08T09:40:00",
  },
  {
    id: 11,
    name: "Anonim10",
    activity: "Membaca Buku",
    bookTitle: "Pergi",
    author: "Tere Liye",
    time: "10:00",
    date: "08 - 04 - 2026",
    createdAt: "2026-04-08T10:00:00",
  },
  {
    id: 12,
    name: "Anonim11",
    activity: "Logout",
    bookTitle: "Tidak Tersedia",
    author: "",
    time: "10:15",
    date: "08 - 04 - 2026",
    createdAt: "2026-04-08T10:15:00",
  },
];

const activityOptions = [
  "Semua Aktivitas",
  "Login",
  "Membaca Buku",
  "Logout",
  "Wishlist",
];

const sortOptions = ["Terbaru", "Terlama"];

export default function AdminUserActivityReportPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [activityFilter, setActivityFilter] = useState("Semua Aktivitas");
  const [sortMode, setSortMode] = useState("Terbaru");
  const [currentPage, setCurrentPage] = useState(1);
  const [activities] = useState(dummyActivities);

  if (sessionUser?.role !== "Admin") {
    return <Navigate to="/home" />;
  }

  const filteredActivities = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    let result = [...activities];

    if (activityFilter !== "Semua Aktivitas") {
      result = result.filter((item) => item.activity === activityFilter);
    }

    if (query) {
      result = result.filter((item) => {
        const searchableText = [
          item.name,
          item.activity,
          item.bookTitle,
          item.author,
          item.time,
          item.date,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      });
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      if (sortMode === "Terlama") {
        return dateA - dateB;
      }

      return dateB - dateA;
    });

    return result;
  }, [activities, activityFilter, searchText, sortMode]);

  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE) || 1;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const currentActivities = filteredActivities.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, activityFilter, sortMode]);

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  return (
    <div className="admin-report-page">

      <Header
        showSearch={false}
        showMenu={true}
        onMenuClick={() => setMenuOpen(true)} />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="admin-report-content">
        <section className="admin-report-heading">
          <h1>Laporan Aktivitas Pengguna</h1>
          <p>Menampilkan aktivitas pengguna dalam sistem perpustakaan digital</p>
        </section>

        <section className="admin-report-panel">
          <div className="admin-report-toolbar">
            <div className="admin-report-search">
              <Search className="admin-report-search__icon" />
              <input
                type="text"
                placeholder="Cari pengguna yang kamu cari"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </div>

            <div className="admin-report-controls">
              <select
                value={activityFilter}
                onChange={(event) => setActivityFilter(event.target.value)}
              >
                {activityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-report-table-wrap">
            <table className="admin-report-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th>Aktivitas</th>
                  <th>Judul Buku</th>
                  <th>Waktu</th>
                  <th>Tanggal</th>
                </tr>
              </thead>

              <tbody>
                {currentActivities.length > 0 ? (
                  currentActivities.map((item, index) => (
                    <tr key={item.id}>
                      <td>
                        <span className="admin-report-number">
                          {startIndex + index + 1}.
                        </span>
                      </td>
                      <td>
                        <strong className="admin-report-name">{item.name}</strong>
                      </td>
                      <td>{item.activity}</td>
                      <td>
                        <div className="admin-report-book">
                          <strong>{item.bookTitle}</strong>
                          {item.author && <span>{item.author}</span>}
                        </div>
                      </td>
                      <td>{item.time}</td>
                      <td>{item.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      <div className="admin-report-empty">
                        Data aktivitas belum ditemukan.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="admin-report-footer">
            <span>
              Menampilkan{" "}
              {filteredActivities.length === 0 ? 0 : startIndex + 1}-
              {Math.min(endIndex, filteredActivities.length)} dari{" "}
              {filteredActivities.length} data
            </span>

            <div className="admin-report-pagination">
              <button
                type="button"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    className={currentPage === pageNumber ? "is-active" : ""}
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
