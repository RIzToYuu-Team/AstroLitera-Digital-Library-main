import React, { useEffect, useMemo, useRef, useState } from "react";
import "./searchResult.css";
import "./KategoriPage.css";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  LayoutGrid,
  StretchHorizontal,
  Search,
} from "lucide-react";
import BookCard from "../components/BookCard";
import { books, toCardBook } from "../data/Books";
import FilterPanel from "../components/FilterPanel.jsx";

function useQueryParams() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function SearchResult() {
  const navigate = useNavigate();
  const query = useQueryParams();

  const urlQ = query.get("q") || "";
  const urlView = query.get("view") || "grid";
  const urlSort = query.get("sort") || "relevance";

  const [searchInput, setSearchInput] = useState(urlQ);
  const [viewMode, setViewMode] = useState(urlView === "list" ? "list" : "grid");
  const [sortMode, setSortMode] = useState(urlSort);
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    jenis: [],
    genre: "",
    penulis: "",
    tahun: "",
    rating: "",
  });

  useEffect(() => setSearchInput(urlQ), [urlQ]);
  useEffect(() => setViewMode(urlView === "list" ? "list" : "grid"), [urlView]);
  useEffect(() => setSortMode(urlSort), [urlSort]);

  const normalizedQuery = (searchInput || "").trim().toLowerCase();

  const results = useMemo(() => {
    const base = books
      .map(toCardBook)
      .filter((b) => {
        if (!normalizedQuery) return true;

        const title = (b.title || "").toLowerCase();
        const author = (b.author || "").toLowerCase();

        return title.includes(normalizedQuery) || author.includes(normalizedQuery);
      });

    const afterFilter = base.filter((b) => {
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
      return [...afterFilter].sort((x, y) => Number(y.rating || 0) - Number(x.rating || 0));
    }

    if (sortMode === "az") {
      return [...afterFilter].sort((x, y) =>
        String(x.title || "").localeCompare(String(y.title || ""))
      );
    }

    if (sortMode === "za") {
      return [...afterFilter].sort((x, y) =>
        String(y.title || "").localeCompare(String(x.title || ""))
      );
    }

    return afterFilter;
  }, [normalizedQuery, sortMode, filters]);

  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();

      const q = (searchInput || "").trim();
      if (q) params.set("q", q);
      if (viewMode && viewMode !== "grid") params.set("view", viewMode);
      if (sortMode && sortMode !== "relevance") params.set("sort", sortMode);

      const qs = params.toString();
      navigate(qs ? `/search?${qs}` : "/search", { replace: true });
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput, viewMode, sortMode, navigate]);

  const handleBack = () => {
    navigate("/home");
  };

  return (
    <div className="search-page">
      <div className="search-topbar">
        <div className="search-topbar-row">
          <button className="search-back" onClick={handleBack} aria-label="Kembali">
            <ArrowLeft size={26} />
          </button>

          <div className="search-title">Hasil Pencarian</div>

          <div className="search-input-wrap">
            <Search size={18} className="search-icon" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ketik judul buku yang kamu cari"
            />
          </div>
        </div>
      </div>

      <div className="search-controls">
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

          <button className="search-filter-btn" onClick={() => setFilterOpen((v) => !v)}>
            Filter
          </button>
        </div>
      </div>

      <div className="search-body">
        {filterOpen && (
          <aside className="search-filter-panel">
            <FilterPanel onChange={setFilters} />
          </aside>
        )}

        <div className="search-content">
          {results.length === 0 ? (
            <div className="search-empty">
              Tidak ada hasil untuk <b>{(searchInput || "").trim()}</b>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "kategori-grid" : "kategori-list"}>
              {results.map((book) => (
                <BookCard key={book.id} {...book} view={viewMode} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}