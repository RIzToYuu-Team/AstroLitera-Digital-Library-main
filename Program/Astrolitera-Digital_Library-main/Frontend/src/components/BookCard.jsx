import React, { useEffect, useMemo, useState } from "react";
import "./BookCard.css";
import { useNavigate } from "react-router-dom";
import { useToast } from "./Toast";

function BookCard({
  id,
  cover,
  title,
  author,
  rating,
  view,
  genre,
  synopsis,
  disableClick = false,
}) {
  const navigate = useNavigate();
  const showToast = useToast();

  const storageKey = "favoriteBooks";

  const genreList = useMemo(() => {
    if (Array.isArray(genre)) {
      return genre;
    }

    if (typeof genre === "string") {
      return genre
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  }, [genre]);

  const getFavIds = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      const ids = raw ? JSON.parse(raw) : [];
      return Array.isArray(ids) ? ids : [];
    } catch {
      return [];
    }
  };

  const [isFav, setIsFav] = useState(() => getFavIds().includes(id));

  useEffect(() => {
    const onChanged = () => setIsFav(getFavIds().includes(id));

    window.addEventListener("favoriteBooks:changed", onChanged);

    return () => {
      window.removeEventListener("favoriteBooks:changed", onChanged);
    };
  }, [id]);

  const handleClick = () => {
    if (disableClick) return;
    navigate(`/book/${id}`);
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();

    const ids = getFavIds();
    const already = ids.includes(id);

    let next;

    if (already) {
      next = ids.filter((x) => x !== id);
      localStorage.setItem(storageKey, JSON.stringify(next));
      setIsFav(false);
      showToast?.("info", "Dihapus dari Favorit");
    } else {
      next = [...ids, id];
      localStorage.setItem(storageKey, JSON.stringify(next));
      setIsFav(true);
      showToast?.("success", "Disimpan ke Favorit");
    }

    window.dispatchEvent(new Event("favoriteBooks:changed"));
  };

  return (
    <div
      className={`book-card ${view === "list" ? "list-mode" : "grid"}`}
      onClick={handleClick}
      style={{ cursor: disableClick ? "default" : "pointer" }}
    >
      <div className="book-cover-wrap">
        <img
          src={cover}
          alt={title || "Cover buku"}
          className="book-cover"
        />
      </div>

      <div className="book-content">
        <div className="book-info">
          <h3 className="book-title">{title || "Judul tidak tersedia"}</h3>
          <p className="book-author">By {author || "Penulis tidak tersedia"}</p>

          {view === "list" && genreList.length > 0 && (
            <div className="genre-tags">
              {genreList.map((g, i) => (
                <span className="genre-tag" key={`${g}-${i}`}>
                  {g}
                </span>
              ))}
            </div>
          )}

          {view === "list" && synopsis && (
            <p className="book-list-synopsis">
              {synopsis}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookCard;