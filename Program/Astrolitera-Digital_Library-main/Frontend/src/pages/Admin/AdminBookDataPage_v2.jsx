import React, { useMemo, useState } from "react";
import "./AdminBookDataPage_v2.css";

const initialBooks = [
  {
    id: 1,
    cover:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=240&q=80",
    title: "Pergi",
    genre: "Novel Fantasi",
    date: "08 - 10 - 2024",
  },
  {
    id: 2,
    cover:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=240&q=80",
    title: "Laut Bercerita",
    genre: "Novel Sejarah",
    date: "10 - 10 - 2024",
  },
  {
    id: 3,
    cover:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=240&q=80",
    title: "Bumi",
    genre: "Fiksi Remaja",
    date: "13 - 10 - 2024",
  },
  {
    id: 4,
    cover:
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=240&q=80",
    title: "Hujan",
    genre: "Drama",
    date: "15 - 10 - 2024",
  },
  {
    id: 5,
    cover:
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=240&q=80",
    title: "Hujan",
    genre: "Drama",
    date: "15 - 10 - 2024",
  },
  {
    id: 6,
    cover:
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=240&q=80",
    title: "Hujan",
    genre: "Drama",
    date: "15 - 10 - 2024",
  },
];

const formatDateSortValue = (dateString) => {
  const parts = dateString.split("-").map((item) => item.trim());
  if (parts.length !== 3) return 0;

  const [day, month, year] = parts.map(Number);
  return new Date(year, month - 1, day).getTime();
};

export default function AdminBookDataPage() {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredBooks = useMemo(() => {
    let result = [...initialBooks];

    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(lowerQuery) ||
          book.genre.toLowerCase().includes(lowerQuery)
      );
    }

    result.sort((a, b) => {
      if (sortMode === "latest") {
        return formatDateSortValue(b.date) - formatDateSortValue(a.date);
      }

      if (sortMode === "oldest") {
        return formatDateSortValue(a.date) - formatDateSortValue(b.date);
      }

      return a.title.localeCompare(b.title);
    });

    return result;
  }, [query, sortMode]);
  
      const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
  
      const currentBooks = filteredBooks.slice(startIndex, endIndex);

  const handleSortClick = () => {
    setSortMode((current) => {
      if (current === "latest") return "oldest";
      if (current === "oldest") return "az";
      return "latest";
    });
  };

  return (
    <div className="admin-book-page">
      <header className="admin-book-topbar">
        <div className="admin-book-brand">
          <div className="admin-book-brand__dot" />
          <span>AstroLitera</span>
        </div>

        <button className="admin-book-menu-btn" type="button" aria-label="Menu">
          <span />
          <span />
          <span />
        </button>
      </header>

      <main className="admin-book-content">
        <section className="admin-book-heading">
          <div>
            <h1>Kelola Buku</h1>
            <p>Kelola semua data buku perpustakaan</p>
          </div>

          <button className="admin-book-add-btn" type="button">
            Tambah Buku
          </button>
        </section>

        <section className="admin-book-panel">
          <div className="admin-book-toolbar">
            <div className="admin-book-search">
              <span className="admin-book-search__icon">⌕</span>
              <input
                type="text"
                placeholder="Cari judul buku yang kamu cari"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <div className="admin-book-actions">
              <button
                className="admin-book-sort-btn"
                type="button"
                onClick={handleSortClick}
              >
                Urutkan
              </button>

              <button className="admin-book-filter-btn" type="button">
                Filter
              </button>
            </div>
          </div>

          <div className="admin-book-table-wrap">
            <table className="admin-book-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Cover</th>
                  <th>Judul</th>
                  <th>Genre</th>
                  <th>Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredBooks.length > 0 ? (
                  currentBooks.map((book, index) => (
                    <tr key={book.id}>
                      <td>{startIndex + index + 1}</td>
                      <td>
                        <img
                          className="admin-book-cover"
                          src={book.cover}
                          alt={book.title}
                        />
                      </td>
                      <td>
                        <div className="admin-book-title-cell">
                          <strong>{book.title}</strong>
                          <span>Tere Liye</span>
                        </div>
                      </td>
                      <td>{book.genre}</td>
                      <td>{book.date}</td>
                      <td>
                        <div className="admin-book-row-actions">
                          <button type="button">Edit</button>
                          <button type="button">Hapus</button>
                          <button type="button">Lihat</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      <div className="admin-book-empty">
                        Data buku belum ditemukan.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="admin-book-footer">
            <span>
              Menampilkan {filteredBooks.length === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, filteredBooks.length)} dari{" "}
              {initialBooks.length} data
            </span>

            <div className="admin-book-pagination">
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
  );
}
