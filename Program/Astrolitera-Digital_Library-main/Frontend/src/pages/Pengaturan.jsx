import React, { useMemo, useRef, useState, useEffect } from "react";
import "./Pengaturan.css";
import Header from "../components/Header";
import SideMenu from "../components/SideMenu";
import defaultAvatar from "../assets/default-avatar.jpg";
import { BadgeCheck, Camera, Eye, EyeOff } from "lucide-react";
import { useToast } from "../components/Toast";
import { supabase } from "../utils/supabaseClient";

export default function Pengaturan() {
  const showToast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const sessionUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("sessionUser") || "null");
    } catch {
      return null;
    }
  }, []);

  // Form: kosongin value default, pakai placeholder (kecuali kalau ada data dari user)
  const [form, setForm] = useState({
    namaLengkap: sessionUser?.username || "",
    email: sessionUser?.email || "",
    nis: sessionUser?.nis || "",
    tanggalLahir: sessionUser?.tanggalLahir || "",
    jenisKelamin: sessionUser?.jenisKelamin || "",
    fotoProfil: sessionUser?.fotoProfil || "",
  });

  // Preview foto: ikuti form (langsung update saat upload)
  const profileImgSrc = form.fotoProfil && form.fotoProfil.trim() !== "" ? form.fotoProfil : defaultAvatar;

  const fileInputRef = useRef(null);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const onPickPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ringan (optional)
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result || "");
      updateField("fotoProfil", base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    // Simpan ke sessionUser (menu & halaman lain baca dari sini)
    const nextSession = {
      ...(sessionUser || {}),
      namaLengkap: form.username,
      email: form.email, // nama tampilan dipakai buat SideMenu
      nis: form.nis,
      tanggalLahir: form.tanggalLahir,
      jenisKelamin: form.jenisKelamin,
      fotoProfil: form.fotoProfil,
    };

    localStorage.setItem("sessionUser", JSON.stringify(nextSession));

    // Optional: update juga di users[] kalau kamu mau konsisten
    try {
      const usersRaw = localStorage.getItem("users");
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      if (Array.isArray(users) && nextSession?.nis) {
        const idx = users.findIndex((u) => String(u.nis) === String(nextSession.nis));
        if (idx >= 0) {
          users[idx] = { ...users[idx], ...nextSession };
          localStorage.setItem("users", JSON.stringify(users));
        }
      }
    } catch {
      // ignore
    }

    showToast?.("success", "Perubahan disimpan");
  };

  // Kalau sessionUser null, untuk sekarang tetep render UI (biar kamu desain dulu)
  // Nanti kamu bisa bungkus dengan guard.
  const displayName = form.namaLengkap && form.namaLengkap.trim() !== "" ? form.namaLengkap : "Anonim";

  return (
    <div className="settings-root">
      <Header
        showSearch={false}
        showBack={false}
        showMenu={true}
        onMenuClick={() => setMenuOpen(true)}
      />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="settings-page">
        <div className="settings-container">

          {/* LEFT */}
          <aside className="settings-sidebar">
            <div className="settings-profile">
              <div className="settings-profile-img">
                <img src={profileImgSrc} alt="profile" />
              </div>

              <div className="settings-profile-info">
                <div className="settings-name">{displayName}</div>
                <div className="settings-status">
                  <BadgeCheck size={16} />
                  <span>Terverifikasi</span>
                </div>
              </div>
            </div>

            <div className="settings-menu">
              <button type="button" className="settings-menu-item active">
                Profil
              </button>
            </div>
          </aside>

          {/* RIGHT */}
          <section className="settings-content">
            <h1 className="settings-title">Biodata</h1>

            <div className="settings-main">
              {/* AVATAR BESAR */}
              <div className="settings-avatar" onClick={openFilePicker} role="button" tabIndex={0}>
                <img src={profileImgSrc} alt="avatar" />
                <div className="settings-avatar-overlay">
                  <Camera size={28} />
                  <div>Klik untuk mengganti foto</div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onPickPhoto}
                  style={{ display: "none" }}
                />
              </div>

              {/* FORM */}
              <div className="settings-form">
                <h3 className="settings-subtitle">Informasi Pengguna</h3>

                <Field
                  label="Nama Lengkap"
                  value={form.namaLengkap}
                  placeholder="Masukkan nama lengkap"
                  onChange={(v) => updateField("namaLengkap", v)}
                />

                <Field
                  label="Email"
                  value={form.email}
                  placeholder="Masukkan email"
                  onChange={(v) => updateField("email", v)}
                />

                <Field
                  label="Nomor Induk Sekolah/NIS"
                  value={form.nis}
                  placeholder="Masukkan NIS"
                  onChange={(v) => updateField("nis", v)}
                />

                <Field
                  label="Tanggal Lahir"
                  type="date"
                  value={form.tanggalLahir}
                  placeholder="Masukkan tanggal lahir (YYYY-MM-DD)"
                  onChange={(v) => updateField("tanggalLahir", v)}
                />

                <RadioField
                  label="Jenis Kelamin"
                  value={form.jenisKelamin}
                  options={["Laki-laki", "Perempuan"]}
                  onChange={(v) => updateField("jenisKelamin", v)}
                />

                <button className="settings-save" onClick={handleSave}>
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function Field({ label, value, placeholder, onChange, type = "text" }) {
  return (
    <div className="settings-field">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function PasswordField({
  label,
  value,
  placeholder,
  onChange,
  showPassword,
  onToggle,
}) {
  return (
    <div className="settings-field">
      <label>{label}</label>

      <div className="settings-password-wrap">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />

        <button
          type="button"
          className="settings-password-toggle"
          onClick={onToggle}
          aria-label={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function RadioField({
  label,
  value,
  options = [],
  onChange,
}) {
  return (
    <div className="settings-field">
      <label>{label}</label>

      <div className="settings-radio-group">
        {options.map((opt) => (
          <label key={opt} className="settings-radio">
            <input
              type="radio"
              name={label}
              value={opt}
              checked={value === opt}
              onChange={(e) => onChange(e.target.value)}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}