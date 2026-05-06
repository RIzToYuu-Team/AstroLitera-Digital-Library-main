import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard";
import { ArrowLeft, LayoutGrid, StretchHorizontal } from "lucide-react";
import "./KategoriPage.css"; // boleh reuse CSS grid/list kamu biar cepat

export default function ViewAllPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const title = state?.title || "All Books";
  const books = state?.books || [];

  const [viewMode, setViewMode] = useState("grid");

  // kalau user refresh page, state bisa hilang → balik aja
  const safeBooks = useMemo(() => {
    return Array.isArray(books) ? books : [];
  }, [books]);

  return (
    <div className="kategori-container">
      <div className="kategori-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={28} strokeWidth={2.2} />
        </button>

        <h2 className="kategori-title">{title}</h2>

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

      <div className={viewMode === "grid" ? "kategori-grid" : "kategori-list"}>
        {safeBooks.map((book) => (
          <BookCard key={book.id} {...book} view={viewMode} />
        ))}
      </div>
    </div>
  );
}