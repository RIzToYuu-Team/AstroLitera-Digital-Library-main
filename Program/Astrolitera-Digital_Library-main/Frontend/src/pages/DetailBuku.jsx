import React, { useEffect, useMemo, useState } from "react";
import "./DetailBuku.css";
import {
  ArrowLeft,
  Star,
  Bookmark,
  BookOpen,
  Info,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { useToast } from "../components/Toast";
import RequestAccessPopup from "../components/RequestAccessPopup";
import ConfirmModal from "../components/ConfirmModal";
import { supabase } from "../utils/supabaseClient";
import { getSessionUser } from "../utils/session";

function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase();
}

function isBorrowStillValid(borrow) {
  if (!borrow?.return_date) return true;
  return new Date(borrow.return_date) >= new Date();
}

function DetailBuku() {
  const showToast = useToast();
  const navigate = useNavigate();
  const { id } = useParams();

  const sessionUser = getSessionUser();
  const isAdmin = sessionUser?.role === "Admin";

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState("sinopsis");
  const [requestOpen, setRequestOpen] = useState(false);

  const [bookmarked, setBookmarked] = useState(false);
  const [wishlistId, setWishlistId] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [newComment, setNewComment] = useState("");

  const [borrowData, setBorrowData] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  const borrowStatus = normalizeStatus(borrowData?.status);

  const genreList = useMemo(() => {
    if (!book?.genre) return [];

    return String(book.genre)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [book]);

  const isPelajaranBook = useMemo(() => {
    const category = book?.category || book?.kategori || "";
    return String(category).trim().toLowerCase() === "pelajaran";
  }, [book]);

  const isReadButtonDisabled =
    !isPelajaranBook &&
    book?.stock <= 0 &&
    !(borrowStatus === "diterima" && isBorrowStillValid(borrowData));

  useEffect(() => {
    fetchBook();
    fetchReviews();

    if (sessionUser?.id) {
      fetchWishlistStatus();
      fetchBorrowStatus();
    }
  }, [id]);

  function goToReader() {
    if (!book?.file_url) {
      showToast?.("error", "File buku belum tersedia");
      return;
    }

    navigate("/bookReader", {
      state: {
        pdfSrc: book.file_url,
        title: book.title,
        bookId: book.id,
      },
    });
  }

  async function fetchBook() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setBook(data);
    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal memuat detail buku");
    } finally {
      setLoading(false);
    }
  }

  async function fetchBorrowStatus() {
    if (!sessionUser?.id) return;

    try {
      const { data, error } = await supabase
        .from("borrow")
        .select("*")
        .eq("user_id", sessionUser.id)
        .eq("book_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      setBorrowData(data || null);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchWishlistStatus() {
    if (!sessionUser?.id) return;

    try {
      const { data, error } = await supabase
        .from("wishlist")
        .select("*")
        .eq("user_id", sessionUser.id)
        .eq("book_id", id)
        .maybeSingle();

      if (error) throw error;

      setBookmarked(Boolean(data));
      setWishlistId(data?.id || null);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchReviews() {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          profiles:user_id (
            username
          )
        `)
        .eq("book_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReviews(data || []);
    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal memuat ulasan");
    }
  }

  async function toggleBookmark() {
    if (!sessionUser?.id) {
      showToast?.("error", "Silakan login terlebih dahulu");
      navigate("/login");
      return;
    }

    try {
      if (bookmarked && wishlistId) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("id", wishlistId);

        if (error) throw error;

        setBookmarked(false);
        setWishlistId(null);
        showToast?.("info", "Dihapus dari Bookmark");
        return;
      }

      const { data, error } = await supabase
        .from("wishlist")
        .insert([
          {
            user_id: sessionUser.id,
            book_id: book.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setBookmarked(true);
      setWishlistId(data.id);
      showToast?.("success", "Ditambahkan ke Bookmark");
    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal mengubah bookmark");
    }
  }

  function handleReadBook() {
    if (!sessionUser?.id) {
      showToast?.("error", "Silakan login terlebih dahulu");
      navigate("/login");
      return;
    }

    if (isPelajaranBook) {
      goToReader();
      return;
    }

    if (borrowStatus === "diterima") {
      if (isBorrowStillValid(borrowData)) {
        goToReader();
        return;
      }

      showToast?.(
        "info",
        "Masa akses buku sudah habis. Kamu bisa mengajukan ulang"
      );
      setRequestOpen(true);
      return;
    }

    if (borrowStatus === "pending") {
      showToast?.(
        "info",
        "Permintaan akses buku ini masih menunggu persetujuan admin"
      );
      return;
    }

    if (borrowStatus === "ditolak") {
      showToast?.(
        "info",
        "Permintaan sebelumnya ditolak. Kamu bisa mengajukan ulang"
      );
      setRequestOpen(true);
      return;
    }

    setRequestOpen(true);
  }

  async function submitAccessRequest() {
    if (!sessionUser?.id) {
      showToast?.("error", "Silakan login terlebih dahulu");
      navigate("/login");
      return;
    }

    try {
      const { data: existing, error: checkError } = await supabase
        .from("borrow")
        .select("*")
        .eq("user_id", sessionUser.id)
        .eq("book_id", book.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (checkError) throw checkError;

      const existingStatus = normalizeStatus(existing?.status);
      const borrowDate = new Date().toISOString();

      if (existingStatus === "pending") {
        showToast?.("info", "Kamu sudah mengajukan akses buku ini");
        setRequestOpen(false);
        return;
      }

      if (existingStatus === "diterima" && isBorrowStillValid(existing)) {
        showToast?.("success", "Akses buku ini sudah diterima");
        setRequestOpen(false);
        return;
      }

      if (existingStatus === "ditolak" || existingStatus === "diterima") {
        const { data, error } = await supabase
          .from("borrow")
          .update({
            status: "Pending",
            borrow_date: borrowDate,
            return_date: null,
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;

        setBorrowData(data);
        showToast?.("success", "Permintaan akses berhasil diajukan ulang");
        setRequestOpen(false);
        return;
      }

      const { data, error } = await supabase
        .from("borrow")
        .insert([
          {
            user_id: sessionUser.id,
            book_id: book.id,
            status: "Pending",
            borrow_date: borrowDate,
            return_date: null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setBorrowData(data);
      showToast?.("success", "Permintaan akses berhasil diajukan");
      setRequestOpen(false);
    } catch (err) {
      console.error(err);
      showToast?.(
        "error",
        err.message || "Gagal mengajukan akses buku"
      );
    }
  }

  async function kirimUlasanBaru() {
    if (!sessionUser?.id) {
      showToast?.("error", "Silakan login terlebih dahulu");
      navigate("/login");
      return;
    }

    if (!newComment.trim()) {
      showToast?.("error", "Ulasan tidak boleh kosong");
      return;
    }

    try {
      const { error } = await supabase
        .from("reviews")
        .insert([
          {
            user_id: sessionUser.id,
            book_id: book.id,
            review: newComment.trim(),
          },
        ]);

      if (error) throw error;

      setNewComment("");
      await fetchReviews();

      showToast?.("success", "Ulasan berhasil dikirim");
    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal mengirim ulasan");
    }
  }

  function openDeleteReviewConfirm(review) {
    setReviewToDelete(review);
    setConfirmOpen(true);
  }

  function closeDeleteReviewConfirm() {
    setReviewToDelete(null);
    setConfirmOpen(false);
  }

  async function deleteUlasan(review) {
    if (!review?.id) return;

    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", review.id);

      if (error) throw error;

      setReviews((prev) => prev.filter((item) => item.id !== review.id));
      showToast?.("success", "Ulasan berhasil dihapus");
    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal menghapus ulasan");
    }
  }

  function getReadButtonText() {
    if (isPelajaranBook) return "Baca Buku";

    if (borrowStatus === "diterima" && isBorrowStillValid(borrowData)) {
      return "Baca Buku";
    }

    if (borrowStatus === "diterima" && !isBorrowStillValid(borrowData)) {
      return "Ajukan Ulang";
    }

    if (borrowStatus === "pending") return "Menunggu Persetujuan";

    if (borrowStatus === "ditolak") return "Ajukan Ulang";

    return "Ajukan Akses";
  }

  if (loading) {
    return <div className="detail-container">Memuat data buku...</div>;
  }

  if (!book) {
    return <div className="detail-container">Buku tidak ditemukan.</div>;
  }

  return (
    <div className="detail-container">
      <ArrowLeft className="back-btn" onClick={() => navigate(-1)} />

      <div className="detail-main">
        <img
          src={book.cover_url}
          className="detail-cover"
          alt={book.title}
        />

        <div className="detail-right">
          <div className="detail-info">
            <h2>{book.title}</h2>
            <p className="detail-author">{book.author}</p>

            <div className="detail-rating">
              <Star size={18} fill="#f5c518" color="#f5c518" />
              <span>{reviews.length} ulasan</span>
            </div>

            <span className="status">
              {book.stock > 0 ? "Tersedia" : "Stok Habis"}
            </span>

            <div className="genre-row">
              {genreList.map((genre) => (
                <span key={genre} className="genre">
                  {genre}
                </span>
              ))}
            </div>

            <Bookmark
              size={42}
              className="bookmark-btn"
              onClick={toggleBookmark}
              fill={bookmarked ? "#f1c232" : "none"}
              color="#f1c232"
              style={{ cursor: "pointer" }}
            />
          </div>

          <div className="tabs">
            <button
              type="button"
              className={`tab-btn ${tab === "sinopsis" ? "active" : ""}`}
              onClick={() => setTab("sinopsis")}
            >
              <BookOpen size={20} /> Sinopsis
            </button>

            <button
              type="button"
              className={`tab-btn ${tab === "info" ? "active" : ""}`}
              onClick={() => setTab("info")}
            >
              <Info size={20} /> Informasi Buku
            </button>

            <button
              type="button"
              className={`tab-btn ${tab === "ulasan" ? "active" : ""}`}
              onClick={() => setTab("ulasan")}
            >
              <MessageSquare size={20} /> Ulasan
            </button>
          </div>

          <div
            className={`content-box ${
              tab === "ulasan" ? "ulasan-mode" : "normal-mode"
            }`}
          >
            {tab === "sinopsis" && (
              <p className="sinopsis">
                {book.synopsis || "Sinopsis belum tersedia."}
              </p>
            )}

            {tab === "info" && (
              <div className="info-grid">
                <div>
                  <strong>Kategori:</strong>
                  <br />
                  {book.category || "-"}
                </div>

                <div>
                  <strong>Penerbit:</strong>
                  <br />
                  {book.publisher || "-"}
                </div>

                <div>
                  <strong>Penulis:</strong>
                  <br />
                  {book.author || "-"}
                </div>

                <div>
                  <strong>Jumlah Halaman:</strong>
                  <br />
                  {book.pages || "-"}
                </div>

                <div>
                  <strong>ISBN:</strong>
                  <br />
                  {book.isbn || "-"}
                </div>

                <div>
                  <strong>Stok:</strong>
                  <br />
                  {book.stock ?? "-"}
                </div>
              </div>
            )}

            {tab === "ulasan" && (
              <div className="ulasan-wrapper">
                <div className="ulasan-input-box">
                  <p className="label-ulasan">Berikan Ulasan Anda</p>

                  <textarea
                    className="input-ulasan"
                    value={newComment}
                    placeholder="Tulis pendapatmu..."
                    onChange={(e) => setNewComment(e.target.value)}
                  />

                  <button
                    type="button"
                    className="kirim-ulasan-btn"
                    onClick={kirimUlasanBaru}
                  >
                    Kirim Ulasan
                  </button>
                </div>

                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="ulasan-item">
                      <div className="ulasan-header">
                        <div className="profile-circle" />

                        <div>
                          <p className="nama">
                            {review.profiles?.username || "Anonim"}
                          </p>

                          <p className="komentar">{review.review}</p>

                          <div className="ulasan-actions">
                            {(sessionUser?.id === review.user_id || isAdmin) && (
                              <button
                                type="button"
                                className="hapus-btn"
                                onClick={() => openDeleteReviewConfirm(review)}
                                title={
                                  isAdmin && sessionUser?.id !== review.user_id
                                    ? "Hapus ulasan user"
                                    : "Hapus ulasan"
                                }
                              >
                                <Trash2 size={16} color="#ff4444" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Belum ada ulasan.</p>
                )}
              </div>
            )}

            {tab !== "ulasan" && (
              <button
                type="button"
                className="read-btn"
                onClick={handleReadBook}
                disabled={isReadButtonDisabled}
              >
                {getReadButtonText()}
              </button>
            )}
          </div>
        </div>
      </div>

      <RequestAccessPopup
        open={requestOpen}
        title="Ajukan Akses Buku"
        onClose={() => setRequestOpen(false)}
        onSubmit={submitAccessRequest}
      />

      <ConfirmModal
        open={confirmOpen}
        title="Yakin ingin menghapus ulasan ini?"
        message="Ulasan akan dihapus secara permanen dan tidak dapat dipulihkan kembali."
        cancelText="Batal"
        confirmText="Hapus"
        type="danger"
        onCancel={closeDeleteReviewConfirm}
        onConfirm={async () => {
          if (!reviewToDelete) return;

          await deleteUlasan(reviewToDelete);
          closeDeleteReviewConfirm();
        }}
      />
    </div>
  );
}

export default DetailBuku;