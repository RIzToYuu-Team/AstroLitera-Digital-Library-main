import React, { useRef, useState, useEffect } from "react";
import BookCard from "./BookCard";
import "./BookRow.css";
import { useNavigate } from "react-router-dom";

function BookRow({ title, books = [] }) {
  const rowRef = useRef(null);
  const navigate = useNavigate();

  const [dragging, setDragging] = useState(false);
  const [rowHasScroll, setRowHasScroll] = useState(false);

  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const moved = useRef(0);

  useEffect(() => {
    const checkScroll = () => {
      const el = rowRef.current;
      if (!el) return;
      setRowHasScroll(el.scrollWidth > el.clientWidth);
    };

    checkScroll();
    window.addEventListener("resize", checkScroll);

    return () => window.removeEventListener("resize", checkScroll);
  }, [books]);

  const handleMouseDown = (e) => {
    const el = rowRef.current;
    if (!el) return;

    isDown.current = true;
    moved.current = 0;
    setDragging(false);

    startX.current = e.pageX - el.offsetLeft;
    scrollLeft.current = el.scrollLeft;
  };

  const handleMouseMove = (e) => {
    const el = rowRef.current;
    if (!isDown.current || !el) return;

    e.preventDefault();

    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.6;

    moved.current = Math.max(moved.current, Math.abs(walk));

    if (moved.current > 6) {
      setDragging(true);
    }

    el.scrollLeft = scrollLeft.current - walk;
  };

  const stopDragging = () => {
    isDown.current = false;

    setTimeout(() => {
      setDragging(false);
    }, 0);
  };

  const goToViewAll = () => {
    navigate("/view-all", {
      state: {
        title,
        books,
      },
    });
  };

  return (
    <section className="book-row-container">
      <div className="row-header">
        <h2>{title}</h2>

        {books.length > 0 && (
          <button
            type="button"
            className="lihat-semua"
            onClick={goToViewAll}
          >
            Lihat Semua →
          </button>
        )}
      </div>

      <div
        className={`book-row ${dragging ? "dragging" : ""} ${rowHasScroll ? "has-scroll" : ""
          }`}
        ref={rowRef}
        onMouseDown={handleMouseDown}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        onMouseMove={handleMouseMove}
      >
        {books.map((book) => (
          <BookCard
            key={book.id}
            {...book}
            disableClick={dragging}
          />
        ))}
      </div>
    </section>
  );
}

export default BookRow;