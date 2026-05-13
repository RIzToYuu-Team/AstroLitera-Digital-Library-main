import React, { useEffect, useMemo, useState } from "react";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SideMenu from "../components/SideMenu";
import bannerImg from "../assets/banner.png";
import BookRow from "../components/BookRow";
import { useToast } from "../components/Toast";
import { supabase } from "../utils/supabaseClient";

function HomePage() {
  const navigate = useNavigate();
  const showToast = useToast();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setBooks(data || []);
    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal memuat data buku");
    }
  }

  function toCardBook(book) {
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      genre: book.genre,
      category: book.category,
      cover: book.cover_url,
      cover_url: book.cover_url,
      file_url: book.file_url,
      synopsis: book.synopsis,
      stock: book.stock,
      pages: book.pages,
      isbn: book.isbn,
      created_at: book.created_at,
    };
  }

  const { recommendations, latestBooks, lessonBooks, novels } = useMemo(() => {
    const mappedBooks = books.map(toCardBook);

    const recommendations = mappedBooks.slice(0, 10);

    const latestBooks = [...mappedBooks]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);

    const lessonBooks = mappedBooks.filter(
      (book) => (book.category || "").toLowerCase() === "pelajaran"
    );

    const novels = mappedBooks.filter(
      (book) => (book.category || "").toLowerCase() === "novel"
    );

    return {
      recommendations,
      latestBooks,
      lessonBooks,
      novels,
    };
  }, [books]);

  return (
    <div className="page-wrapper">
      <Header
        showSearch={true}
        showMenu={true}
        onMenuClick={() => setMenuOpen(true)}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Ketik judul buku yang kamu cari"
        onSearchSubmit={() => {
          const q = searchQuery.trim();

          if (!q) return;

          navigate(`/search?q=${encodeURIComponent(q)}`);
        }}
      />

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="home-container">
        <div className="banner">
          <img src={bannerImg} alt="Banner Perpustakaan" />
        </div>

        <BookRow title="Rekomendasi" books={recommendations} />
        <BookRow title="Buku Terbaru" books={latestBooks} />
        <BookRow title="Buku Pelajaran" books={lessonBooks} />
        <BookRow title="Buku Novel" books={novels} />

        <Footer />
      </div>
    </div>
  );
}

export default HomePage;