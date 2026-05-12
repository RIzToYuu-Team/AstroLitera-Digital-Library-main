import React, { useEffect, useMemo, useState } from "react";
import "./AdminBookDataPage_v2.css";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { getSessionUser } from "../../utils/session";
import SideMenu from "../../components/SideMenu";
import { supabase } from "../../utils/supabaseClient";
import { useToast } from "../../components/Toast";

export default function AdminBookDataPage() {
  const showToast = useToast();
  const [showModal, setShowModal] = useState(false);
  const sessionUser = getSessionUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [books, setBooks] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [bookFile, setBookFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    publisher: "",
    genre: "",
    stock: "",
    pages: "",
    isbn: "",
    synopsis: "",
    category: "",
  });
  const [editingBook, setEditingBook] = useState(null);
  const isEditMode = Boolean(editingBook);

  if (sessionUser?.role !== "Admin") {
    return <Navigate to="/home" />;
  }

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
      showToast?.("error", "Gagal Mengambil data Buku");
    }
  }

  async function handleAddBook(e) {
    e.preventDefault();

    try {
      if (!coverFile || !bookFile) {
        showToast?.("error", "Cover dan file buku wajib diisi");
        return;
      }

      if (!coverFile.type.startsWith("image/")) {
        showToast?.("error", "Cover harus berupa gambar");
        return;
      }

      if (bookFile.type !== "application/pdf") {
        showToast?.("error", "File buku harus PDF");
        return;
      }

      if (coverFile.size > 2 * 1024 * 1024) {
        showToast?.("error", "Cover maksimal 2MB");
        return;
      }

      if (bookFile.size > 20 * 1024 * 1024) {
        showToast?.("error", "File buku maksimal 20MB");
        return;
      }


      const uniqueId = crypto.randomUUID() || Date.now();
      const coverName = `${uniqueId}-${coverFile.name}`;
      const fileName = `${uniqueId}-${bookFile.name}`;
      const coverPath = coverName;
      const filePath = fileName;

      const { error: coverError } = await supabase.storage
        .from("book_cover")
        .upload(coverName, coverFile);

      if (coverError) throw coverError;

      const { error: fileError } = await supabase.storage
        .from("books_file")
        .upload(fileName, bookFile);

      if (fileError) throw fileError;

      const {
        data: { publicUrl: coverUrl },
      } = supabase.storage
        .from("book_cover")
        .getPublicUrl(coverName);

      const {
        data: { publicUrl: fileUrl },
      } = supabase.storage
        .from("books_file")
        .getPublicUrl(fileName);

      const { error } = await supabase
        .from("books")
        .insert([
          {
            title: formData.title,
            author: formData.author,
            publisher: formData.publisher,
            genre: formData.genre,
            cover_url: coverUrl,
            file_url: fileUrl,
            cover_path: coverPath,
            file_path: filePath,
            stock: formData.stock ? Number(formData.stock) : null,
            pages: formData.pages ? Number(formData.pages) : null,
            isbn: formData.isbn,
            synopsis: formData.synopsis,
            category: formData.category,
          },
        ]);

      if (error) throw error;

      await fetchBooks();
      setShowModal(false);

      setFormData({
        title: "",
        author: "",
        publisher: "",
        genre: "",
        stock: "",
        pages: "",
        isbn: "",
        synopsis: "",
        category: "",
      });

      setCoverFile(null);
      setBookFile(null);

      showToast?.("success", "Buku berhasil ditambahkan");

    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal menambahkan buku");
    }
  }

  async function handleDeleteBook(book) {
    const confirmed = window.confirm(
      `Hapus buku "${book.title}"?`
    );

    if (!confirmed) return;

    try {
      if (book.cover_path) {
        const { error: coverDeleteError } = await supabase.storage
          .from("book_cover")
          .remove([book.cover_path]);

        if (coverDeleteError) {
          console.error(coverDeleteError);
        }
      }

      if (book.file_path) {
        const { error: fileDeleteError } = await supabase.storage
          .from("books_file")
          .remove([book.file_path]);

        if (fileDeleteError) {
          console.error(fileDeleteError);
        }
      }

      const { error } = await supabase
        .from("books")
        .delete()
        .eq("id", book.id);

      if (error) throw error;

      setBooks((prev) =>
        prev.filter((item) => item.id !== book.id)
      );

      showToast?.("success", "Buku berhasil dihapus");

    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal menghapus buku");
    }
  }

  function handleEditBook(book) {
    setEditingBook(book);

    setFormData({
      title: book.title || "",
      author: book.author || "",
      publisher: book.publisher || "",
      genre: book.genre || "",
      stock: book.stock || "",
      pages: book.pages || "",
      isbn: book.isbn || "",
      synopsis: book.synopsis || "",
      category: book.category || "",
    });

    setCoverFile(null);
    setBookFile(null);

    setShowModal(true);
  }

  async function handleUpdateBook(e) {
    e.preventDefault();

    try {
      let coverUrl = editingBook.cover_url;
      let fileUrl = editingBook.file_url;
      let coverPath = editingBook.cover_path;
      let filePath = editingBook.file_path;

      if (coverFile) {
        if (!coverFile.type.startsWith("image/")) {
          showToast?.("error", "Cover harus berupa gambar");
          return;
        }

        const newCoverName =
          `${crypto.randomUUID()}-${coverFile.name}`;

        const { error: uploadCoverError } =
          await supabase.storage
            .from("book_cover")
            .upload(newCoverName, coverFile);

        if (uploadCoverError) throw uploadCoverError;

        if (editingBook.cover_path) {
          await supabase.storage
            .from("book_cover")
            .remove([editingBook.cover_path]);
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("book_cover")
          .getPublicUrl(newCoverName);

        coverUrl = publicUrl;
        coverPath = newCoverName;
      }

      if (bookFile) {
        if (bookFile.type !== "application/pdf") {
          showToast?.("error", "File harus PDF");
          return;
        }

        const newFileName =
          `${crypto.randomUUID()}-${bookFile.name}`;

        const { error: uploadFileError } =
          await supabase.storage
            .from("books_file")
            .upload(newFileName, bookFile);

        if (uploadFileError) throw uploadFileError;

        if (editingBook.file_path) {
          await supabase.storage
            .from("books_file")
            .remove([editingBook.file_path]);
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("books_file")
          .getPublicUrl(newFileName);

        fileUrl = publicUrl;
        filePath = newFileName;
      }

      const { error } = await supabase
        .from("books")
        .update({
          title: formData.title,
          author: formData.author,
          publisher: formData.publisher,
          genre: formData.genre,
          stock: formData.stock
            ? Number(formData.stock)
            : null,
          pages: formData.pages
            ? Number(formData.pages)
            : null,
          isbn: formData.isbn,
          synopsis: formData.synopsis,
          category: formData.category,
          cover_url: coverUrl,
          file_url: fileUrl,
          cover_path: coverPath,
          file_path: filePath,
        })
        .eq("id", editingBook.id);

      if (error) throw error;

      await fetchBooks();

      showToast?.("success", "Buku berhasil diperbarui");

      setTimeout(() => {
        setShowModal(false);
        setEditingBook(null);

        setCoverFile(null);
        setBookFile(null);

        setFormData({
          title: "",
          author: "",
          publisher: "",
          genre: "",
          stock: "",
          pages: "",
          isbn: "",
          synopsis: "",
          category: "",
        });
      }, 0);

      showToast?.("success", "Buku berhasil diperbarui");
    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal memperbarui buku");
    }
  }

  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (query.trim()) {
      const lowerQuery = query.toLowerCase();

      result = result.filter(
        (book) =>
          (book.title || "").toLowerCase().includes(lowerQuery) ||
          (book.genre || "").toLowerCase().includes(lowerQuery)
      );
    }

    result.sort((a, b) => {
      if (sortMode === "latest") {
        return new Date(b.created_at) - new Date(a.created_at);
      }

      if (sortMode === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }

      if (sortMode === "az") {
        return (a.title || "").localeCompare(b.title || "");
      }

      return 0;
    });

    return result;
  }, [books, query, sortMode]);

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBooks = filteredBooks.slice(startIndex, endIndex);

  return (
    <div className="admin-book-page">
      <Header
        showSearch={false}
        showMenu={true}
        onMenuClick={() => setMenuOpen(true)} />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="admin-book-content">
        <section className="admin-book-heading">
          <div>
            <h1>Kelola Buku</h1>
            <p>Kelola semua data buku perpustakaan</p>
          </div>

          <button
            type="button"
            className="admin-book-add-btn"
            onClick={() => setShowModal(true)}
          >
            Tambah Buku
          </button>
        </section>

        <section className="admin-book-panel">
          <div className="admin-book-toolbar">
            <div className="admin-book-search">
              <span className="admin-book-search__icon">⌕</span>
              <input
                type="text"
                placeholder="Cari judul buku yang kamu cari"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <div className="admin-book-actions">
              <select
                className="admin-book-sort-select"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value)}
              >
                <option value="latest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="az">A-Z</option>
              </select>
            </div>
          </div>

          <div className="admin-book-table-wrap">
            <table className="admin-book-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Cover</th>
                  <th>Judul</th>
                  <th>Genre</th>
                  <th>Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredBooks.length > 0 ? (
                  currentBooks.map((book, index) => (
                    <tr key={book.id}>
                      <td>{startIndex + index + 1}</td>
                      <td>
                        <img
                          className="admin-book-cover"
                          src={book.cover_url}
                          alt={book.title}
                        />
                      </td>
                      <td>
                        <div className="admin-book-title-cell">
                          <strong>{book.title}</strong>
                          <span>{book.author}</span>
                        </div>
                      </td>
                      <td>{book.genre}</td>
                      <td>{new Date(book.created_at).toLocaleDateString("id-ID")}</td>
                      <td>
                        <div className="admin-book-row-actions">
                          <button
                            type="button"
                            onClick={() => handleEditBook(book)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBook(book)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      <div className="admin-book-empty">
                        Data buku belum ditemukan.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="admin-book-footer">
            <span>
              Menampilkan {filteredBooks.length === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, filteredBooks.length)} dari{" "}
              {books.length} data
            </span>

            <div className="admin-book-pagination">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  type="button"
                  className={currentPage === i + 1 ? "is-active" : ""}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
              >
                ›
              </button>
            </div>
          </footer>
        </section>
      </main>
      {showModal && (
        <div className="admin-book-modal-overlay">
          <div className="admin-book-upload-layout">

            <button
              type="button"
              className="admin-book-back-btn"
              onClick={() => {
                setShowModal(false);
                setEditingBook(null);
              }}
            >
              ←
            </button>

            <div className="admin-book-cover-panel">
              <h2>Upload Cover</h2>

              <label className="admin-book-cover-upload">
                {coverFile ? (
                  <img
                    src={URL.createObjectURL(coverFile)}
                    alt="Preview"
                    className="admin-book-cover-preview"
                  />
                ) : editingBook?.cover_url ? (
                  <img
                    src={editingBook.cover_url}
                    alt="Cover"
                    className="admin-book-cover-preview"
                  />
                ) : (
                  <div className="admin-book-cover-placeholder">
                    <span>📷</span>
                    <p>Klik untuk mengganti cover.</p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => setCoverFile(e.target.files[0])}
                />
              </label>

              <small>Format: JPG, PNG. Maks 2MB</small>
            </div>

            <div className="admin-book-form-panel">
              <h2>Informasi Buku</h2>

              <form
                onSubmit={
                  isEditMode
                    ? handleUpdateBook
                    : handleAddBook
                }
              >

                <div className="admin-book-grid">

                  <div className="admin-book-field">
                    <label>Judul Buku</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="admin-book-field">
                    <label>Penulis</label>
                    <input
                      type="text"
                      required
                      value={formData.author}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          author: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="admin-book-field">
                    <label>Kategori</label>

                    <select
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="">Pilih Kategori</option>
                      <option value="Pelajaran">Pelajaran</option>
                      <option value="Novel">Novel</option>
                    </select>
                  </div>

                  <div className="admin-book-field">
                    <label>Genre</label>
                    <input
                      type="text"
                      required
                      value={formData.genre}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          genre: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="admin-book-field">
                    <label>Penerbit</label>
                    <input
                      type="text"
                      value={formData.publisher}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          publisher: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="admin-book-field">
                    <label>ISBN</label>
                    <input
                      type="text"
                      value={formData.isbn}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isbn: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="admin-book-field">
                    <label>Jumlah Halaman</label>
                    <input
                      type="number"
                      value={formData.pages}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pages: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="admin-book-field">
                    <label>Stok</label>

                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="admin-book-upload-file">
                    <label>Upload File Buku</label>

                    <div className="admin-book-upload-box">
                      <p>
                        {bookFile
                          ? bookFile.name
                          : "Drag & drop atau pilih file untuk upload"}
                      </p>

                      <label className="admin-book-file-btn">
                        Pilih File

                        <input
                          type="file"
                          accept="application/pdf"
                          hidden
                          onChange={(e) => setBookFile(e.target.files[0])}
                        />
                      </label>

                      <small>Format: PDF. Maks 20MB</small>
                    </div>
                  </div>

                  <div className="admin-book-field admin-book-synopsis">
                    <label>Sinopsis</label>
                    <textarea
                      rows="8"
                      value={formData.synopsis}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          synopsis: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="admin-book-submit-wrap">
                  <button type="submit" className="admin-book-submit-btn">
                    {isEditMode ? "Simpan Perubahan" : "Tambahkan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
