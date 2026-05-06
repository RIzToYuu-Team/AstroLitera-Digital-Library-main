import React, { useState, useEffect } from "react";
import "./DetailBuku.css";
import { ArrowLeft, Star, Bookmark, BookOpen, Info, MessageSquare, ThumbsUp, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { books } from "../data/Books";
import { useToast } from "../components/Toast";
import RequestAccessPopup from "../components/RequestAccessPopup";

function DetailBuku() {
  const showToast = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const book =
    books.find((b) => b.id === Number(id)) || books[0];

  const [tab, setTab] = useState("sinopsis");

  // REQUEST AKSES (AKTIVITAS)
  const ACCESS_KEY = "bookAccessRequests";

  const readAccessRequests = () => {
    try {
      const raw = localStorage.getItem(ACCESS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  };

  const writeAccessRequests = (list) => {
    localStorage.setItem(ACCESS_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("bookAccessRequests:changed"));
  };

  const [requestOpen, setRequestOpen] = useState(false);

  const submitAccessRequest = () => {
    const nowIso = new Date().toISOString();
    const list = readAccessRequests();
    const idx = list.findIndex((x) => Number(x.bookId) === Number(book.id));

    if (idx >= 0) {
      const curr = list[idx] || {};
      if (curr.status === "menunggu") {
        showToast?.(
          "info",
          "Kamu sudah mengajukan akses untuk buku ini. Silakan cek statusnya di menu Aktivitas."
        );
        setRequestOpen(false);
        return;
      }
      if (curr.status === "disetujui") {
        showToast?.("success", "Akses buku ini sudah disetujui. Silakan baca dari menu Aktivitas.");
        setRequestOpen(false);
        return;
      }
      // ditolak -> boleh request ulang
      list[idx] = { ...curr, status: "menunggu", requestedAt: nowIso };
      writeAccessRequests(list);
      showToast?.(
        "success",
        "Permintaan akses berhasil diajukan ulang. Silakan cek statusnya di menu Aktivitas."
      );
      setRequestOpen(false);
      return;
    }

    // request baru
    list.unshift({ bookId: Number(book.id), status: "menunggu", requestedAt: nowIso });
    writeAccessRequests(list);

    showToast?.(
      "success",
      "Permintaan akses berhasil diajukan. Silakan cek statusnya di menu Aktivitas."
    );
    setRequestOpen(false);
  };


  //LOCAL STORAGE MANAGEMENT
  const storageKey = "ulasan-" + book.title.replace(/\s+/g, "-").toLowerCase();

  const loadUlasan = () => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  };

  const saveUlasan = (data) => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  };

  const defaultUlasan = [
    {
      nama: "Anonim 1",
      rating: 4,
      komentar: "Cerita sangat menarik, penuh makna!",
      like: 16,
      liked: false,
      balasan: [
        { nama: "Anonim A", komentar: "Setuju banget!" },
        { nama: "Anonim B", komentar: "Keren asli bukunya." },
      ],
    },
    {
      nama: "Anonim 2",
      rating: 5,
      komentar: "Karya masterpiece. Wajib baca!",
      like: 28,
      liked: false,
      balasan: [],
    },
  ];

  const [ulasanList, setUlasanList] = useState(() => {
    const saved = loadUlasan();
    return saved || defaultUlasan;
  });

  useEffect(() => {
    saveUlasan(ulasanList);
  }, [ulasanList]);

  // INPUT ULASAN PENGGUNA
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  const kirimUlasanBaru = () => {
    if (newRating === 0 || newComment.trim() === "") return;

    const newUlasan = {
      nama: "Pengguna",
      rating: newRating,
      komentar: newComment,
      like: 0,
      liked: false,
      balasan: [],
    };

    setUlasanList([newUlasan, ...ulasanList]);
    setNewRating(0);
    setNewComment("");
  };

  //BALASAN
  const [replyOpen, setReplyOpen] = useState(null);
  const [replyText, setReplyText] = useState("");

  const kirimBalasan = (index) => {
    if (replyText.trim() === "") return;

    const updated = [...ulasanList];
    updated[index].balasan.push({
      nama: "Anonim",
      komentar: replyText,
    });

    setUlasanList(updated);
    setReplyText("");
  };

  //LIKE TOGGLE
  const handleLike = (index) => {
    const updated = [...ulasanList];
    const item = updated[index];

    if (item.liked) {
      item.like -= 1;
      item.liked = false;
    } else {
      item.like += 1;
      item.liked = true;
    }

    setUlasanList(updated);
  };

  // HAPUS ULASAN PENGGUNA
  const deleteUlasan = (index) => {
    const updated = ulasanList.filter((_, i) => i !== index);
    setUlasanList(updated);
  };

  //BOOKMARK STATE + NOTIFIKASI
  const [bookmarked, setBookmarked] = useState(false);

  const toggleBookmark = () => {
    const newState = !bookmarked;
    setBookmarked(newState);

    showToast?.(newState ? "success" : "info", newState ? "Ditambahkan ke Bookmark" : "Dihapus dari Bookmark");
};

  return (
    <div className="detail-container">
      
      <ArrowLeft className="back-btn" onClick={() => navigate(-1)} />

      {/* BAGIAN ATAS */}
      <div className="detail-top">
        <img src={book.cover} className="detail-cover" />

        <div className="detail-info">
          <h2>{book.title}</h2>
          <p className="detail-author">{book.author}</p>

          <div className="detail-rating">
            <Star size={18} fill="#f5c518" color="#f5c518" />
            <span>{book.rating}/5</span>
          </div>

          <span className="status">{book.status}</span>

          <div className="genre-row">
            {book.genre.map((g, i) => (
              <span key={i} className="genre">{g}</span>
            ))}
          </div>

          <Bookmark
            size={32}
            className="bookmark-btn"
            onClick={toggleBookmark}
            fill={bookmarked ? "#f1c232" : "none"}   // warna kuning kalau aktif
            color={bookmarked ? "#f1c232" : "#414141ff"}
            style={{ cursor: "pointer" }}
          />

        </div>
      </div>

      {/* TABS */}
      <div className="tabs">
        <button
          className={`tab-btn ${tab === "sinopsis" ? "active" : ""}`}
          onClick={() => setTab("sinopsis")}
        >
          <BookOpen size={18} /> Sinopsis
        </button>

        <button
          className={`tab-btn ${tab === "info" ? "active" : ""}`}
          onClick={() => setTab("info")}
        >
          <Info size={18} /> Informasi
        </button>

        <button
          className={`tab-btn ${tab === "ulasan" ? "active" : ""}`}
          onClick={() => setTab("ulasan")}
        >
          <MessageSquare size={18} /> Ulasan
        </button>
      </div>

      {/* CONTENT BOX */}
      <div className={`content-box ${tab === "ulasan" ? "ulasan-mode" : "normal-mode"}`}>

        {tab === "sinopsis" && (
          <p className="sinopsis">{book.synopsis}</p>
        )}

        {tab === "info" && (
          <div className="info-grid">
            <div><strong>Bahasa:</strong><br />{book.language}</div>
            <div><strong>Tanggal Rilis:</strong><br />{book.publicationDate}</div>
            <div><strong>Penerbit:</strong><br />{book.publisher}</div>
            <div><strong>Penulis:</strong><br />{book.author}</div>
            <div><strong>Jumlah Halaman:</strong><br />{book.page}</div>
            <div><strong>Format:</strong><br />{book.format}</div>
          </div>
        )}
        {tab === "ulasan" && (
          <div className="ulasan-wrapper">
            <div className="ulasan-input-box">
              <p className="label-ulasan">Berikan Ulasan Anda</p>

              <div className="rating-selector">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={26}
                    fill={newRating > i ? "#f5c518" : "none"}
                    color="#f5c518"
                    className="rating-star"
                    onClick={() => setNewRating(i + 1)}
                  />
                ))}
              </div>

              <textarea
                className="input-ulasan"
                value={newComment}
                placeholder="Tulis pendapatmu…"
                onChange={(e) => setNewComment(e.target.value)}
              />

              <button className="kirim-ulasan-btn" onClick={kirimUlasanBaru}>
                Kirim Ulasan
              </button>
            </div>

            {/* LIST ULASAN */}
            {ulasanList.map((u, index) => (
              <div key={index} className="ulasan-item">

                {/* HEADER */}
                <div className="ulasan-header">
                  <div className="profile-circle" />

                  <div>
                    <p className="nama">{u.nama}</p>

                    <div className="rating-small">
                      {Array.from({ length: u.rating }).map((_, i) => (
                        <Star key={i} size={14} fill="#f5c518" color="#f5c518" />
                      ))}
                    </div>

                    <p className="komentar">{u.komentar}</p>

                    <div className="ulasan-actions">

                      <span className="like" onClick={() => handleLike(index)}>
                        <ThumbsUp
                          size={16}
                          fill={u.liked ? "#ffffff" : "none"}
                          color={u.liked ? "#ffffff" : "#cccccc"}
                        />
                        {u.like}
                      </span>

                      <span
                        className="balasan-toggle"
                        onClick={() =>
                          setReplyOpen(replyOpen === index ? null : index)
                        }
                      >
                        {u.balasan.length} Balasan
                      </span>

                      {u.nama === "Pengguna" && (
                        <span className="hapus-btn" onClick={() => deleteUlasan(index)}>
                          <Trash2 size={16} color="#ff4444" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {replyOpen === index && (
                  <div className="balasan-list">
                    {u.balasan.map((b, i) => (
                      <div key={i} className="balasan-item">
                        <div className="profile-circle small" />
                        <div>
                          <p className="nama">{b.nama}</p>
                          <p className="komentar">{b.komentar}</p>
                        </div>
                      </div>
                    ))}

                    <div className="balasan-input">
                      <input
                        type="text"
                        placeholder="Ketik balasan…"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <button onClick={() => kirimBalasan(index)}>Kirim</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* BACA SEKARANG */}
        {tab !== "ulasan" && (
          <button className="read-btn" onClick={() => setRequestOpen(true)}>
            Baca Sekarang
          </button>
        )}
      </div>

      <RequestAccessPopup
        open={requestOpen}
        title="Ajukan Akses Buku"
        onClose={() => setRequestOpen(false)}
        onSubmit={submitAccessRequest}
      />

    </div>
  );
}

export default DetailBuku;
