import React, { useMemo, useState } from "react";
import "./KategoriPage.css";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, LayoutGrid, StretchHorizontal } from "lucide-react";
import BookCard from "../components/BookCard";
import { books as allBooks, toCardBook } from "../data/Books";

export default function KategoriPage() {
  const { name: nama } = useParams();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState("grid");

  const categoryKey = useMemo(() => {
    return decodeURIComponent(nama || "").replace(/-/g, " ").trim().toLowerCase();
  }, [nama]);

  const books = useMemo(() => {
    const filtered = allBooks.filter((b) => {
      const cat = (b.category || "").trim().toLowerCase();
      return cat === categoryKey;
    });

    const list = filtered.length ? filtered : allBooks;

    return list.map(toCardBook);
  }, [categoryKey]);

  return (
    <div className="kategori-container">
      {/* HEADER */}
      <div className="kategori-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={28} strokeWidth={2.2} />
        </button>

        <p className="rekomendasi-text">Rekomendasi</p>

        <h2 className="kategori-title">{categoryKey}</h2>

        <div className="view-buttons">
          <LayoutGrid
            size={26}
            className={`view-icon ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
          />

          <StretchHorizontal
            size={26}
            className={`view-icon ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className={viewMode === "grid" ? "kategori-grid" : "kategori-list"}>
        {books.map((book) => (
          <BookCard
            key={book.id}
            {...book}
            view={viewMode}
          />
        ))}
      </div>
    </div>
  );
}