import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import SideMenu from "../components/SideMenu";
import BookCard from "../components/BookCard";
import FilterPanel from "../components/FilterPanel";
import { LayoutGrid, StretchHorizontal } from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import { getSessionUser } from "../utils/session";
import { useToast } from "../components/Toast";
import "./Favorit.css";

function Favorit() {
  const navigate = useNavigate();
  const showToast = useToast();
  const sessionUser = getSessionUser();

  const [menuOpen, setMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchText, setSearchText] = useState("");
  const [sortMode, setSortMode] = useState("latest");
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    jenis: [],
    genre: "",
    penulis: "",
    tahun: "",
    rating: "",
  });

  const [wishlistRows, setWishlistRows] = useState([]);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  async function fetchFavorites() {
    if (!sessionUser?.id) {
      setWishlistRows([]);
      setFavoriteBooks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data: wishlistData, error: wishlistError } = await supabase
        .from("wishlist")
        .select("*")
        .eq("user_id", sessionUser.id)
        .order("created_at", { ascending: false });

      if (wishlistError) throw wishlistError;

      const rows = wishlistData || [];
      setWishlistRows(rows);

      const bookIds = rows
        .map((item) => item.book_id)
        .filter(Boolean);

      if (bookIds.length === 0) {
        setFavoriteBooks([]);
        return;
      }

      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select("*")
        .in("id", bookIds);

      if (booksError) throw booksError;

      const bookMap = new Map(
        (booksData || []).map((book) => [book.id, book])
      );

      const orderedBooks = rows
        .map((row) => {
          const book = bookMap.get(row.book_id);

          if (!book) return null;

          return {
            ...book,
            wishlist_id: row.id,
            wishlist_status: row.status,
            wishlist_created_at: row.created_at,
          };
        })
        .filter(Boolean);

      setFavoriteBooks(orderedBooks);
    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal memuat data favorit");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveFavorite(book) {
    const confirmed = window.confirm(
      `Hapus "${book.title}" dari favorit?`
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("id", book.wishlist_id);

      if (error) throw error;

      setFavoriteBooks((prev) =>
        prev.filter((item) => item.wishlist_id !== book.wishlist_id)
      );

      setWishlistRows((prev) =>
        prev.filter((item) => item.id !== book.wishlist_id)
      );

      showToast?.("success", "Buku dihapus dari favorit");
    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal menghapus favorit");
    }
  }

  const filteredBooks = useMemo(() => {
    let list = [...favoriteBooks];

    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();

      list = list.filter((book) => {
        const title = String(book.title || "").toLowerCase();
        const author = String(book.author || "").toLowerCase();
        const genre = String(book.genre || "").toLowerCase();

        return (
          title.includes(q) ||
          author.includes(q) ||
          genre.includes(q)
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
      list.sort(
        (a, b) =>
          new Date(b.wishlist_created_at || b.created_at) -
          new Date(a.wishlist_created_at || a.created_at)
      );
    }

    if (sortMode === "oldest") {
      list.sort(
        (a, b) =>
          new Date(a.wishlist_created_at || a.created_at) -
          new Date(b.wishlist_created_at || b.created_at)
      );
    }

    if (sortMode === "az") {
      list.sort((a, b) =>
        String(a.title || "").localeCompare(String(b.title || ""))
      );
    }

    if (sortMode === "za") {
      list.sort((a, b) =>
        String(b.title || "").localeCompare(String(a.title || ""))
      );
    }

    return list;
  }, [favoriteBooks, searchText, filters, sortMode]);

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
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value)}
          >
            <option value="latest">Terbaru ditambahkan</option>
            <option value="oldest">Terlama ditambahkan</option>
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

      <div className="search-body favorit-body">
        {filterOpen && (
          <aside className="search-filter-panel">
            <FilterPanel onChange={setFilters} />
          </aside>
        )}

        <main
          className={`favorit-main ${filteredBooks.length === 0 ? "is-empty" : "has-books"
            }`}
        >
          {loading ? (
            <div className="favorit-empty">
              <p>Memuat data favorit...</p>
            </div>
          ) : !sessionUser?.id ? (
            <div className="favorit-empty">
              <p>Silakan login untuk melihat buku favorit.</p>

              <div className="favorit-empty-actions">
                <button
                  className="favorit-primary"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
              </div>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="favorit-empty">
              <p>Belum ada buku favorit yang ditambahkan.</p>

              <div className="favorit-empty-actions">
                <button
                  className="favorit-primary"
                  onClick={() => navigate("/search")}
                >
                  Cari buku
                </button>
              </div>
            </div>
          ) : (
            <div className={`favorit-list ${viewMode === "grid" ? "grid" : "list"}`}>
              {filteredBooks.map((book) => (
                <div key={book.wishlist_id || book.id} className="favorit-card-wrap">
                  <BookCard
                    id={book.id}
                    cover={book.cover_url}
                    title={book.title}
                    author={book.author}
                    rating={0}
                    view={viewMode}
                    genre={book.genre}
                    synopsis={book.synopsis}
                  />

                  <button
                    type="button"
                    className="favorit-remove-btn"
                    onClick={() => handleRemoveFavorite(book)}
                  >
                    Hapus dari Favorit
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Favorit;