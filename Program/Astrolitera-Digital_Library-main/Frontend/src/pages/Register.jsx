import { useState, useRef } from "react";
import "./Register.css";
import { Camera, X, Eye, EyeOff, ArrowLeft } from "lucide-react";
import bookImg from "../assets/book.png";
import { useNavigate } from "react-router-dom";
import PopupStatus from "../components/PopupStatus";
import { useToast } from "../components/Toast";
import { supabase } from "../utils/supabaseClient";

function Register() {
  const navigate = useNavigate();
  const showToast = useToast();

  const [form, setForm] = useState({
    nis: "",
    email: "",
    nama: "",
    kelas: "",
    password: "",
    kartu: null,
  });

  const [showPassword, setShowPassword] = useState(false);

  const [kartu, setKartu] = useState(null);
  const [kartuPreview, setKartuPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [popupType, setPopupType] = useState(null);

  const passwordRules = {
    minLen: form.password.length >= 8,
    hasLetter: /[A-Za-z]/.test(form.password),
    hasNumber: /\d/.test(form.password),
    hasSpecial: /[^A-Za-z0-9]/.test(form.password),
  };

  const getPasswordError = () => {
    if (!passwordRules.minLen) return "Password minimal 8 karakter.";
    if (!passwordRules.hasLetter || !passwordRules.hasNumber)
      return "Password harus mengandung huruf dan angka.";
    if (!passwordRules.hasSpecial)
      return "Password harus mengandung karakter khusus (misal: !@#$%).";
    return "";
  };

  function handleChange(e) {
    let { name, value } = e.target;
    if (name === "nis") {
      value = value.replace(/[^0-9]/g, "");
    }
    setForm({ ...form, [name]: value });
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      showToast?.("error", "File harus berupa gambar (JPG atau PNG).");
      return;
    }

    if (kartuPreview) {
      URL.revokeObjectURL(kartuPreview);
    }

    setKartu(file);

    const previewUrl = URL.createObjectURL(file);
    setKartuPreview(previewUrl);

    e.target.value = null;
  }

  function handleClearFile(e) {
    e.stopPropagation();
    e.preventDefault();
    setKartu(null);
    setKartuPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function closePopup() {
    setPopupType(null);
    setKartuPreview(null);
    navigate("/home");
  }

  function handleUploadClick(e) {
    e.stopPropagation();
    if (fileInputRef.current) fileInputRef.current.click();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (
      !form.nis.trim() ||
      !form.email.trim() ||
      !form.nama.trim() ||
      !form.kelas.trim() ||
      !form.password.trim() ||
      !kartu
    ) {
      showToast("error", "Data belum lengkap.");
      return;
    }
    const pwErr = getPasswordError();
    if (pwErr) {
      showToast?.("error", pwErr);
      return;
    }
    try {
      const filePath = `${Date.now()}_${kartu.name}`;

      const { error: uploadError } = await supabase.storage
        .from("kartu_perpustakaan")
        .upload(filePath, kartu);
      if (uploadError) throw uploadError;
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            nis: form.nis,
            email: form.email,
            username: form.nama,
            kelas: form.kelas,
            password: form.password,
            kartu_url: filePath,
            status: "Pending",
          },
        ]);
      if (profileError) {
        console.error("PROFILE ERROR:", profileError);
        throw profileError;
      }
      showToast("success", "Berhasil daftar!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      showToast("error", err.message);
    }
  }
  return (
    <div className="reg-container">
      {popupType && (
        <PopupStatus
          type={popupType}
          onClose={closePopup}
          kartuPreview={kartuPreview}
        />
      )}

      <div className="reg-left">
        <button
          type="button"
          className="reg-back"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
        >
          <ArrowLeft size={22} />
        </button>

        <h1 className="reg-title">Daftar</h1>

        <form onSubmit={handleSubmit} className="reg-form">
          <label>NIS :</label>
          <input
            type="text"
            name="nis"
            maxLength={10}
            inputMode="numeric"
            pattern="[0-9]*"
            value={form.nis}
            onChange={handleChange}
            placeholder="1000000000"
          />

          <label>Email :</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Masukkan Email"
          />
          <label>Nama :</label>
          <input
            type="text"
            name="nama"
            value={form.nama}
            onChange={handleChange}
            placeholder="Masukkan Nama"
          />

          <label>Kelas :</label>
          <input
            type="text"
            name="kelas"
            value={form.kelas}
            onChange={handleChange}
            placeholder="Masukkan Kelas"
          />

          <label>Kartu Perpustakaan:</label>
          <div
            className="upload-box"
            onClick={handleUploadClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              className="hidden-file-input"
              onClick={(e) => e.stopPropagation()}
              onChange={handleFileChange}
            />

            {!kartu && (
              <div className="upload-placeholder">
                <Camera size={24} color="#e0b300" />
              </div>
            )}

            {kartuPreview && (
              <img
                src={kartuPreview}
                alt="Preview"
                className="preview-image"
              />
            )}
          </div>

          <label>Kata Sandi :</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Masukkan kata sandi"
            />

            <span
              className="toggle-pass"
              onClick={() => setShowPassword(!showPassword)}
              role="button"
              tabIndex={0}
              aria-label={
                showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  setShowPassword(!showPassword);
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <button className="reg-submit" type="submit">
            Daftar
          </button>
        </form>

        <div className="reg-links">
          <p className="as-guest" onClick={() => navigate("/home")}>
            Lanjut Sebagai Tamu
          </p>
          <p className="login-text">
            Sudah Punya Akun?{" "}
            <span onClick={() => navigate("/login")} className="login-link">
              Masuk Di Sini
            </span>
          </p>
        </div>
      </div>

      <img src={bookImg} alt="Books" className="book-image" />

      <div className="reg-right">
        <div className="vertical-text">WELCOME</div>
        <p className="brand-text">
          ASTROLITERA
          <br />
          DIGITAL LIBRARY
        </p>
      </div>
    </div>
  );
}

export default Register;
