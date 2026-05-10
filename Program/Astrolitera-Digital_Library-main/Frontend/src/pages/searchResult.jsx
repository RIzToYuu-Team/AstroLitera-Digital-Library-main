import React, { useEffect, useMemo, useRef, useState } from "react";
import "./searchResult.css";
import "./KategoriPage.css";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  LayoutGrid,
  StretchHorizontal,
  Search,
  ChevronDown,
} from "lucide-react";
import BookCard from "../components/BookCard";
import { books, toCardBook } from "../data/Books";

/**
 * Source-of-truth: URL query params (biar refresh/back behave kayak web umum).
 * - q     : search text
 * - view  : grid | list
 * - sort  : relevance | rating_desc | az | za
 * - jenis : CSV multi-select, contoh: jenis=Pelajaran,Novel
 */
function useQueryParams() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function parseCsvParam(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => decodeURIComponent(s).trim())
    .filter(Boolean);
}

function toCsvParam(arr) {
  return (arr || [])
    .map((s) => encodeURIComponent(String(s)))
    .join(",");
}

export default function SearchResult() {
  const navigate = useNavigate();
  const query = useQueryParams();

  // ===== URL params =====
  const urlQ = query.get("q") || "";
  const urlView = query.get("view") || "grid";
  const urlSort = query.get("sort") || "relevance";
  const urlJenisCsv = query.get("jenis") || "";

  // ===== UI state =====
  const [searchInput, setSearchInput] = useState(urlQ);
  const [viewMode, setViewMode] = useState(urlView === "list" ? "list" : "grid");
  const [sortMode, setSortMode] = useState(urlSort);

  // Filter panel (sidebar) open/close
  const [filterOpen, setFilterOpen] = useState(false);

  // Multi-select filter: Jenis Buku
  const [jenisBuku, setJenisBuku] = useState(() => parseCsvParam(urlJenisCsv));

  // Accordion state: boleh buka >1 section sekaligus
  const [openSections, setOpenSections] = useState(() => new Set(["jenis"]));

  // ===== sync state ketika URL berubah (back/forward) =====
  useEffect(() => setSearchInput(urlQ), [urlQ]);
  useEffect(() => setViewMode(urlView === "list" ? "list" : "grid"), [urlView]);
  useEffect(() => setSortMode(urlSort), [urlSort]);
  useEffect(() => setJenisBuku(parseCsvParam(urlJenisCsv)), [urlJenisCsv]);

  // ===== helpers =====
  const normalizedQuery = (searchInput || "").trim().toLowerCase();

  const toggleSection = (key) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleJenis = (label) => {
    setJenisBuku((prev) => {
      const set = new Set(prev);
      if (set.has(label)) set.delete(label);
      else set.add(label);
      return Array.from(set);
    });
  };

  // ===== results (search + filter + sort) =====
  const results = useMemo(() => {
    const base = books
      .map(toCardBook)
      .filter((b) => {
        if (!normalizedQuery) return true;
        const t = (b.title || "").toLowerCase();
        const a = (b.author || "").toLowerCase();
        return t.includes(normalizedQuery) || a.includes(normalizedQuery);
      });

    // Dummy mapping Jenis Buku (sesuai yang kamu minta: nanti kamu ganti)
    const afterJenis = base.filter((b) => {
      if (!jenisBuku || jenisBuku.length === 0) return true;

      const cat = String(b.category || "").toLowerCase();
      const title = String(b.title || "").toLowerCase();

      return jenisBuku.some((jb) => {
        if (jb === "Pelajaran") return cat === "pendidikan";
        if (jb === "Novel") return cat === "novel";
        if (jb === "Kamus") return cat === "kamus" || title.includes("kamus");
        return true;
      });
    });

    if (sortMode === "rating_desc") {
      return [...afterJenis].sort((x, y) => Number(y.rating || 0) - Number(x.rating || 0));
    }
    if (sortMode === "az") {
      return [...afterJenis].sort((x, y) => String(x.title || "").localeCompare(String(y.title || "")));
    }
    if (sortMode === "za") {
      return [...afterJenis].sort((x, y) => String(y.title || "").localeCompare(String(x.title || "")));
    }
    return afterJenis; // relevance: default order
  }, [normalizedQuery, sortMode, jenisBuku]);

  // ===== URL sync (debounced) =====
  // Ini yang bikin:
  // - refresh/back behave normal (nggak balik ke input lama kalau sudah dihapus)
  // - shareable link
  const debounceRef = useRef(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();

      const q = (searchInput || "").trim();
      if (q) params.set("q", q);
      if (viewMode && viewMode !== "grid") params.set("view", viewMode);
      if (sortMode && sortMode !== "relevance") params.set("sort", sortMode);

      const jenisCsv = toCsvParam(jenisBuku);
      if (jenisCsv) params.set("jenis", jenisCsv);

      const qs = params.toString();
      navigate(qs ? `/search?${qs}` : "/search", { replace: true });
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput, viewMode, sortMode, jenisBuku, navigate]);

  const handleBack = () => {
    // behave web umum: balik ke home, input home tidak ikut kebawa
    navigate("/home");
  };

  return (
    <div className="search-page">
      {/* ===== Header: back + title + input ===== */}
      <div className="search-topbar">
        <div className="search-topbar-row">
          <button className="search-back" onClick={handleBack} aria-label="Kembali">
            <ArrowLeft size={26} />
          </button>

          <div className="search-title">Hasil Pencarian</div>

          <div className="search-input-wrap">
            <Search size={18} className="search-icon"/>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ketik judul buku yang kamu cari"
            />
          </div>
        </div>
      </div>

      {/* ===== Controls: view + sort + filter btn ===== */}
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

      {/* ===== Body: sidebar + results ===== */}
      <div className="search-body">
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
                      className={`filter-pill ${jenisBuku.includes(label) ? "active" : ""}`}
                      onClick={() => toggleJenis(label)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Genre (dummy + contoh submenu) */}
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
                  {/* Dummy sekarang — nanti kamu ganti pakai struktur "submenu" di bawah */}
                  <div className="filter-placeholder">
                    Dummy. Nanti kamu bisa isi submenu (contoh ada di chat).
                  </div>
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
