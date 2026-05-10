import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import SideMenu from "../components/SideMenu";
import BookCard from "../components/BookCard";
import FilterPanel from "../components/FilterPanel";
import { books } from "../data/Books";
import { LayoutGrid, StretchHorizontal } from "lucide-react";
import "./Favorit.css";

const STORAGE_KEY = "favoriteBooks";

function readFavoriteIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

function Favorit() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const [viewMode, setViewMode] = useState("grid");
  const [searchText, setSearchText] = useState("");
  const [sortMode, setSortMode] = useState("relevance");
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    jenis: [],
    genre: "",
    penulis: "",
    tahun: "",
    rating: "",
  });

  const [favoriteIds, setFavoriteIds] = useState(() => readFavoriteIds());

  useEffect(() => {
    const onChanged = () => setFavoriteIds(readFavoriteIds());
    window.addEventListener("favoriteBooks:changed", onChanged);
    return () => window.removeEventListener("favoriteBooks:changed", onChanged);
  }, []);

  const favoriteBooks = useMemo(() => {
    const idSet = new Set(favoriteIds);
    let list = books.filter((b) => idSet.has(b.id));

    if ((searchText || "").trim()) {
      const q = searchText.trim().toLowerCase();
      list = list.filter((b) => {
        const title = (b.title || "").toLowerCase();
        const author = (b.author || "").toLowerCase();
        return title.includes(q) || author.includes(q);
      });
    }

    list = list.filter((b) => {
      const category = String(b.category || "").toLowerCase();
      const title = String(b.title || "").toLowerCase();
      const author = String(b.author || "").toLowerCase();
      const year = String(b.year || "");
      const rating = Number(b.rating || 0);

      const matchJenis =
        !filters.jenis?.length ||
        filters.jenis.some((jenis) => {
          if (jenis === "Pelajaran") return category === "pendidikan";
          if (jenis === "Novel") return category === "novel";
          if (jenis === "Kamus") return category === "kamus" || title.includes("kamus");
          return true;
        });

      const matchGenre =
        !filters.genre || category === filters.genre.toLowerCase();

      const matchPenulis =
        !filters.penulis || author.includes(filters.penulis.toLowerCase());

      const matchTahun =
        !filters.tahun || year === String(filters.tahun);

      const matchRating =
        !filters.rating || rating >= Number(filters.rating);

      return matchJenis && matchGenre && matchPenulis && matchTahun && matchRating;
    });

    if (sortMode === "rating_desc") {
      list = [...list].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (sortMode === "az") {
      list = [...list].sort((a, b) =>
        String(a.title || "").localeCompare(String(b.title || ""))
      );
    } else if (sortMode === "za") {
      list = [...list].sort((a, b) =>
        String(b.title || "").localeCompare(String(a.title || ""))
      );
    } else {
      const order = new Map(favoriteIds.map((id, idx) => [id, idx]));
      list = [...list].sort(
        (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
      );
    }

    return list;
  }, [favoriteIds, searchText, filters, sortMode]);

  return (
    <div className="favorit-page">
      <Header
        showSearch={true}
        showMenu={true}
        showBack={false}
        onMenuClick={() => setMenuOpen(true)}
        searchValue={searchText}
        onSearchChange={setSearchText}
        searchPlaceholder="Cari di Favorit..."
        onSearchSubmit={() => {}}
      />

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="search-controls favorit-controls">
        <div className="search-view-buttons">
          <button
            type="button"
            className={`search-view-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            aria-label="Grid"
          >
            <LayoutGrid size={26} />
          </button>

          <button
            type="button"
            className={`search-view-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            aria-label="List"
          >
            <StretchHorizontal size={26} />
          </button>
        </div>

        <div className="search-sort">
          <select value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
            <option value="relevance">Urutkan</option>
            <option value="rating_desc">Rating tertinggi</option>
            <option value="az">A - Z</option>
            <option value="za">Z - A</option>
          </select>

          <button
            className="search-filter-btn"
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
          >
            Filter
          </button>
        </div>
      </div>

      <div className="search-body favorit-body">
        {filterOpen && (
          <aside className="search-filter-panel">
            <FilterPanel onChange={setFilters} />
          </aside>
        )}

        <main className={`favorit-main ${favoriteBooks.length === 0 ? "is-empty" : "has-books"}`}>
          {favoriteBooks.length === 0 ? (
            <div className="favorit-empty">
              <p>Belum ada buku favorit yang ditambahkan.</p>

              <div className="favorit-empty-actions">
                <button className="favorit-primary" onClick={() => navigate("/search")}>
                  Cari buku
                </button>
              </div>
            </div>
          ) : (
            <div className={`favorit-list ${viewMode === "grid" ? "grid" : "list"}`}>
              {favoriteBooks.map((b) => (
                <BookCard
                  key={b.id}
                  id={b.id}
                  cover={b.cover}
                  title={b.title}
                  author={b.author}
                  rating={b.rating}
                  view={viewMode}
                  genre={b.genre}
                  synopsis={b.synopsis}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Favorit;