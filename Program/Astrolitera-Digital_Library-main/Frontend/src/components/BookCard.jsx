import React from "react";
import "./BookCard.css";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./Toast";
import { useEffect, useState } from "react";

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
    return () => window.removeEventListener("favoriteBooks:changed", onChanged);
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
        <img src={cover} alt={title} className="book-cover" />
      </div>

      <div className="book-content">
        <div className="book-info">
          <h3 className="book-title">{title}</h3>
          <p className="book-author">By {author}</p>

          {view === "list" && genre && (
            <div className="genre-tags">
              {genre.map((g, i) => (
                <span className="genre-tag" key={i}>
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>

        {view === "list" && synopsis && <p className="sinopsis">{synopsis}</p>}
      </div>
    </div>
  );
}

export default BookCard;
