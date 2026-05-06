import React, { useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { books } from "../data/Books";
import BookReader from "../components/BookReader";

function HalamanBaca() {
  const { id } = useParams();
  const location = useLocation(); // keep ini kalau nanti mau ambil query (page/zoom)

  const book = useMemo(() => {
    const bookIdNum = Number(id);
    if (!Number.isFinite(bookIdNum)) return null;
    return books.find((b) => Number(b.id) === bookIdNum) || null;
  }, [id]);

  if (!book) {
    return <div className="page-container">Buku tidak ditemukan.</div>;
  }

  return (
    <div className="page-container">
      <BookReader pdfSrc={book.pdfUrl} title={book.title} />
    </div>
  );
}

export default HalamanBaca;