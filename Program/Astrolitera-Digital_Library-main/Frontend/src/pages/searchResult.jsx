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
import FilterPanel from "../components/FilterPanel.jsx";
import { supabase } from "../utils/supabaseClient";
import { useToast } from "../components/Toast";

function useQueryParams() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function toCardBook(book) {
  return {
    id: book.id,
    cover: book.cover_url,
    cover_url: book.cover_url,
    title: book.title,
    author: book.author,
    genre: book.genre,
    category: book.category,
    synopsis: book.synopsis,
    stock: book.stock,
    pages: book.pages,
    isbn: book.isbn,
    publisher: book.publisher,
    created_at: book.created_at,
  };
}

export default function SearchResult() {
  const navigate = useNavigate();
  const showToast = useToast();
  const query = useQueryParams();

  const urlQ = query.get("q") || "";
  const urlView = query.get("view") || "grid";
  const urlSort = query.get("sort") || "relevance";

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => setSearchInput(urlQ), [urlQ]);
  useEffect(() => setViewMode(urlView === "list" ? "list" : "grid"), [urlView]);
  useEffect(() => setSortMode(urlSort), [urlSort]);

  async function fetchBooks() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setBooks(data || []);
    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal memuat data buku");
    } finally {
      setLoading(false);
    }
  }

  const normalizedQuery = (searchInput || "").trim().toLowerCase();

  const results = useMemo(() => {
    let list = books.map(toCardBook);

    if (normalizedQuery) {
      list = list.filter((book) => {
        const title = String(book.title || "").toLowerCase();
        const author = String(book.author || "").toLowerCase();
        const genre = String(book.genre || "").toLowerCase();
        const category = String(book.category || "").toLowerCase();
        const publisher = String(book.publisher || "").toLowerCase();
        const isbn = String(book.isbn || "").toLowerCase();

        return (
          title.includes(normalizedQuery) ||
          author.includes(normalizedQuery) ||
          genre.includes(normalizedQuery) ||
          category.includes(normalizedQuery) ||
          publisher.includes(normalizedQuery) ||
          isbn.includes(normalizedQuery)
        );
      });
    }

    list = list.filter((book) => {
      const category = String(book.category || "").toLowerCase();
      const genre = String(book.genre || "").toLowerCase();
      const author = String(book.author || "").toLowerCase();
      const year = book.created_at
        ? String(new Date(book.created_at).getFullYear())
        : "";

      const matchJenis =
        !filters.jenis?.length ||
        filters.jenis.some((jenis) => {
          const value = String(jenis || "").toLowerCase();

          if (value === "pelajaran") return category === "pelajaran";
          if (value === "novel") return category === "novel";

          return category === value;
        });

      const matchGenre =
        !filters.genre ||
        genre.includes(String(filters.genre).toLowerCase());

      const matchPenulis =
        !filters.penulis ||
        author.includes(String(filters.penulis).toLowerCase());

      const matchTahun =
        !filters.tahun || year === String(filters.tahun);

      return matchJenis && matchGenre && matchPenulis && matchTahun;
    });

    if (sortMode === "latest") {
      list = [...list].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    } else if (sortMode === "oldest") {
      list = [...list].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
    } else if (sortMode === "az") {
      list = [...list].sort((a, b) =>
        String(a.title || "").localeCompare(String(b.title || ""))
      );
    } else if (sortMode === "za") {
      list = [...list].sort((a, b) =>
        String(b.title || "").localeCompare(String(a.title || ""))
      );
    }

    return list;
  }, [books, normalizedQuery, sortMode, filters]);

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

      navigate(qs ? `/search?${qs}` : "/search", {
        replace: true,
      });
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
          <button
            className="search-back"
            onClick={handleBack}
            aria-label="Kembali"
            type="button"
          >
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
          <select value={sortMode} onChange={(e) => setSortMode(e.target.value)}>Urutkan
            <option value="relevance">Urutkan</option>
            <option value="latest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="az">A - Z</option>
            <option value="za">Z - A</option>
          </select>

          <button
            className="search-filter-btn"
            type="button"
            onClick={() => setFilterOpen((value) => !value)}
          >
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
          {loading ? (
            <div className="search-empty">Memuat data buku...</div>
          ) : results.length === 0 ? (
            <div className="search-empty">
              Tidak ada hasil untuk <b>{(searchInput || "").trim()}</b>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "kategori-grid" : "kategori-list"}>
              {results.map((book) => (
                <BookCard
                  key={book.id}
                  id={book.id}
                  cover={book.cover_url}
                  title={book.title}
                  author={book.author}
                  rating={0}
                  view={viewMode}
                  genre={book.genre}
                  synopsis={book.synopsis}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}