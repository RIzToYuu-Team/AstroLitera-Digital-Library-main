import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import SideMenu from "../components/SideMenu";
import BookCard from "../components/BookCard";
import { books } from "../data/Books";
import { LayoutGrid, StretchHorizontal, ChevronDown } from "lucide-react";
import "./Favorit.css";
import "./SearchResult.css";

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

  // Samain seperti SearchResult
  const [sortMode, setSortMode] = useState("relevance"); // relevance | rating_desc | az | za
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedJenis, setSelectedJenis] = useState([]); // ["Pelajaran","Novel","Kamus"]
  const [openSections, setOpenSections] = useState(new Set(["jenis"]));

  const [favoriteIds, setFavoriteIds] = useState(() => readFavoriteIds());

  useEffect(() => {
    const onChanged = () => setFavoriteIds(readFavoriteIds());
    window.addEventListener("favoriteBooks:changed", onChanged);
    return () => window.removeEventListener("favoriteBooks:changed", onChanged);
  }, []);

  const toggleJenis = (label) => {
    setSelectedJenis((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  };

  const toggleSection = (key) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const favoriteBooks = useMemo(() => {
    const idSet = new Set(favoriteIds);
    let list = books.filter((b) => idSet.has(b.id));

    // Search hanya di Favorit
    if ((searchText || "").trim()) {
      const q = searchText.trim().toLowerCase();
      list = list.filter((b) => (b.title || "").toLowerCase().includes(q));
    }

    // Filter Jenis Buku (samain mapping SearchResult)
    if (selectedJenis.length) {
      list = list.filter((b) => {
        const cat = (b.category || "").toLowerCase();
        const title = (b.title || "").toLowerCase();

        return selectedJenis.some((j) => {
          if (j === "Pelajaran") return cat === "pendidikan";
          if (j === "Novel") return cat === "novel";
          if (j === "Kamus") return cat === "kamus" || title.includes("kamus");
          return true;
        });
      });
    }

    // Sort (samain SearchResult)
    if (sortMode === "rating_desc") {
      list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortMode === "az") {
      list = [...list].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortMode === "za") {
      list = [...list].sort((a, b) => (b.title || "").localeCompare(a.title || ""));
    } else {
      // relevance: pakai urutan penyimpanan (recent)
      const order = new Map(favoriteIds.map((id, idx) => [id, idx]));
      list = [...list].sort(
        (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
      );
    }

    return list;
  }, [favoriteIds, searchText, selectedJenis, sortMode]);

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
        onSearchSubmit={() => { }}
      />

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Controls: view + sort + filter (sama feel kayak SearchResult) */}
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

      {/* Body: filter + results */}
      <div className="search-body favorit-body">
        {filterOpen && (
          <aside className="search-filter-panel">
            {/* Jenis Buku */}
            <div className="filter-group">
              <button type="button" className="filter-header" onClick={() => toggleSection("jenis")}>
                <span>Jenis Buku</span>
                <ChevronDown
                  size={18}
                  className={`filter-chevron ${openSections.has("jenis") ? "open" : ""}`}
                />
              </button>

              {openSections.has("jenis") && (
                <div className="filter-body">
                  {["Pelajaran", "Novel", "Kamus"].map((label) => (
                    <button
                      key={label}
                      type="button"
                      className={`filter-pill ${selectedJenis.includes(label) ? "active" : ""}`}
                      onClick={() => toggleJenis(label)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Genre (dummy) */}
            <div className="filter-group">
              <button type="button" className="filter-header" onClick={() => toggleSection("genre")}>
                <span>Genre</span>
                <ChevronDown
                  size={18}
                  className={`filter-chevron ${openSections.has("genre") ? "open" : ""}`}
                />
              </button>

              {openSections.has("genre") && (
                <div className="filter-body filter-body--text">
                  <div className="filter-placeholder">Dummy. Nanti kamu isi.</div>
                </div>
              )}
            </div>

            {/* Penulis (dummy) */}
            <div className="filter-group">
              <button type="button" className="filter-header" onClick={() => toggleSection("penulis")}>
                <span>Penulis</span>
                <ChevronDown
                  size={18}
                  className={`filter-chevron ${openSections.has("penulis") ? "open" : ""}`}
                />
              </button>

              {openSections.has("penulis") && (
                <div className="filter-body filter-body--text">
                  <div className="filter-placeholder">Dummy. Nanti kamu isi.</div>
                </div>
              )}
            </div>

            {/* Tahun Terbit (dummy) */}
            <div className="filter-group">
              <button type="button" className="filter-header" onClick={() => toggleSection("tahun")}>
                <span>Tahun Terbit</span>
                <ChevronDown
                  size={18}
                  className={`filter-chevron ${openSections.has("tahun") ? "open" : ""}`}
                />
              </button>

              {openSections.has("tahun") && (
                <div className="filter-body filter-body--text">
                  <div className="filter-placeholder">Dummy. Nanti kamu isi.</div>
                </div>
              )}
            </div>
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
