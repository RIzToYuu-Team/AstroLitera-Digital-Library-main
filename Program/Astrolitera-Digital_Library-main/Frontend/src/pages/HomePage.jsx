import React, { useState, useMemo } from "react";
import "./HomePage.css";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SideMenu from "../components/SideMenu";
import bannerImg from "../assets/banner.png";
import BookRow from "../components/BookRow";
import { books, toCardBook } from "../data/Books";

function HomePage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { featured, popular, bestSellers, novels } = useMemo(() => {
    const featured = books
      .filter((b) => b.isFeatured)
      .map(toCardBook);

    const popular = [...books]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 10)
      .map(toCardBook);

    const bestSellers = books
      .filter((b) => b.isBestSeller)
      .map(toCardBook);

    const novels = books
      .filter((b) => (b.category || "").toLowerCase() === "novel")
      .map(toCardBook);

    return { featured, popular, bestSellers, novels };
  }, []);

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
          const q = (searchQuery || "").trim();
          navigate(`/search?q=${encodeURIComponent(q)}`);
        }}
      />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="home-container">

        <div className="banner">
          <img src={bannerImg} alt="Banner Perpustakaan" />
        </div>

        <BookRow title="Rekomendasi" books={featured} />
        <BookRow title="Buku Populer" books={popular} />
        <BookRow title="Buku Terlaris" books={bestSellers} />
        <BookRow title="Buku Novel" books={novels} />

        {/* FOOTER */}
        <Footer />
      </div>
    </div>
  );
}

export default HomePage;
