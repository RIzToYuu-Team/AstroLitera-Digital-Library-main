import React, { useRef, useState, useEffect } from "react";
import "./Pengaturan.css";
import Header from "../components/Header";
import SideMenu from "../components/SideMenu";
import defaultAvatar from "../assets/default-avatar.jpg";
import { BadgeCheck, Camera } from "lucide-react";
import { useToast } from "../components/Toast";
import { supabase } from "../utils/supabaseClient";
import { getSessionUser, setSessionUser } from "../utils/session";

export default function Pengaturan() {
  const showToast = useToast();
  const fileInputRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const sessionUser = getSessionUser();
  const [oldPhotoUrl, setOldPhotoUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const [form, setForm] = useState({
    namaLengkap: "",
    email: "",
    nis: "",
    tanggalLahir: "",
    jenisKelamin: "",
    fotoProfil: "",
  });

  const profileImgSrc =
    form.fotoProfil && form.fotoProfil.trim() !== ""
      ? form.fotoProfil
      : defaultAvatar;
  useEffect(() => {
    async function fetchProfile() {
      if (!sessionUser?.id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionUser.id)
        .single();

      if (error || !data) {
        showToast?.("error", "Gagal memuat data profil");
        return;
      }

      setForm({
        namaLengkap: data.username || "",
        email: data.email || "",
        nis: data.nis || "",
        tanggalLahir: data.tanggal_lahir || "",
        jenisKelamin: data.jenis_kelamin || "",
        fotoProfil: data.foto_profil || "",
      });

      setOldPhotoUrl(data.foto_profil || "");
    }

    fetchProfile();
  }, [sessionUser?.id]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const onPickPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;

    setSelectedFile(file);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreview = URL.createObjectURL(file);

    setPreviewUrl(newPreview);

    setForm((prev) => ({
      ...prev,
      fotoProfil: newPreview,
    }));

    e.target.value = "";
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function getFilePathFromUrl(url) {
    if (!url) return null;
    const marker = "/foto_profil/";
    const index = url.indexOf(marker);
    if (index === -1) return null;
    return url.substring(index + marker.length);
  }

  const handleSave = async () => {
    if (!sessionUser?.id) {
      showToast?.("error", "User tidak valid");
      return;
    }

    try {
      let uploadedUrl = form.fotoProfil;

      const oldFilePath = getFilePathFromUrl(oldPhotoUrl);

      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${sessionUser.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("foto_profil")
          .upload(fileName, selectedFile, {
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("foto_profil")
          .getPublicUrl(fileName);

        uploadedUrl = publicUrlData.publicUrl;

        if (oldFilePath) {
          const { data: removeData, error: removeError } =
            await supabase.storage
              .from("foto_profil")
              .remove([oldFilePath]);
          if (removeError) {
            console.error(removeError);
            showToast?.("warning", "Gagal menghapus foto lama, tapi perubahan tetap disimpan");
          }
        }
      }

      // Update profile table
      const { error } = await supabase
        .from("profiles")
        .update({
          username: form.namaLengkap,
          email: form.email,
          nis: form.nis,
          tanggal_lahir: form.tanggalLahir,
          jenis_kelamin: form.jenisKelamin,
          foto_profil: uploadedUrl,
        })
        .eq("id", sessionUser.id);

      if (error) throw error;

      // Update local session
      const updatedSession = {
        ...sessionUser,
        username: form.namaLengkap,
        nis: form.nis,
        fotoProfil: uploadedUrl,
      };

      setSessionUser(updatedSession);

      window.dispatchEvent(new Event("storage"));

      setSelectedFile(null);
      setOldPhotoUrl(uploadedUrl);

      showToast?.("success", "Perubahan disimpan");

    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal menyimpan perubahan");
    }
  };
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