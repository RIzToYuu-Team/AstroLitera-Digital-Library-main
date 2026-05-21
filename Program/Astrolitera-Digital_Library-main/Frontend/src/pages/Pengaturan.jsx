import React, { useEffect, useRef, useState } from "react";
import "./Pengaturan.css";
import Header from "../components/Header";
import SideMenu from "../components/SideMenu";
import ConfirmModal from "../components/ConfirmModal";
import defaultAvatar from "../assets/default-avatar.jpg";
import { BadgeCheck, XCircle, Camera } from "lucide-react";
import { useToast } from "../components/Toast";
import { supabase } from "../utils/supabaseClient";
import { getSessionUser, setSessionUser } from "../utils/session";

export default function Pengaturan() {
  const showToast = useToast();
  const fileInputRef = useRef(null);

  const sessionUser = getSessionUser();
  const isAdmin = sessionUser?.role === "Admin";

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [oldPhotoUrl, setOldPhotoUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const [form, setForm] = useState({
    namaLengkap: "",
    email: "",
    nis: "",
    nip: "",
    tanggalLahir: "",
    jenisKelamin: "",
    foto_profil: "",
    status: "",
  });

  const displayName =
    form.namaLengkap && form.namaLengkap.trim() !== ""
      ? form.namaLengkap
      : "Anonim";

  const identityLabel = isAdmin
    ? "Nomor Induk Pegawai/NIP"
    : "Nomor Induk Sekolah/NIS";

  const identityValue = isAdmin ? form.nip : form.nis;

  const profileImgSrc =
    form.foto_profil && form.foto_profil.trim() !== ""
      ? form.foto_profil
      : defaultAvatar;

  useEffect(() => {
    fetchProfile();
  }, [sessionUser?.id]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function fetchProfile() {
    if (!sessionUser?.id) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionUser.id)
        .single();

      if (error) throw error;

      setForm({
        namaLengkap: data.username || "",
        email: data.email || "",
        nis: data.nis || "",
        nip: data.nip || "",
        tanggalLahir: data.tanggal_lahir || "",
        jenisKelamin: data.jenis_kelamin || "",
        foto_profil: data.foto_profil || "",
        status: data.status || "",
      });

      setOldPhotoUrl(data.foto_profil || "");
    } catch (err) {
      console.error(err);
      showToast?.("error", "Gagal memuat data profil");
    }
  }

  function updateField(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function onPickPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast?.("error", "File harus berupa gambar");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);

    setForm((prev) => ({
      ...prev,
      foto_profil: newPreviewUrl,
    }));

    e.target.value = "";
  }

  function getFotoProfilPath(value) {
    if (!value) return "";

    if (!value.startsWith("http://") && !value.startsWith("https://")) {
      return value;
    }

    try {
      const url = new URL(value);
      const marker = "/storage/v1/object/public/foto_profil/";
      const index = url.pathname.indexOf(marker);

      if (index === -1) return "";

      return decodeURIComponent(url.pathname.slice(index + marker.length));
    } catch {
      return "";
    }
  }

  async function uploadNewPhotoIfNeeded() {
    if (!selectedFile) {
      return form.foto_profil;
    }

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

    const oldFilePath = getFotoProfilPath(oldPhotoUrl);

    if (oldFilePath) {
      const { error: removeError } = await supabase.storage
        .from("foto_profil")
        .remove([oldFilePath]);

      if (removeError) {
        console.error(removeError);
        showToast?.(
          "warning",
          "Gagal menghapus foto lama, tapi perubahan tetap disimpan"
        );
      }
    }

    return publicUrlData.publicUrl;
  }

  async function handleSave() {
    if (!sessionUser?.id) {
      showToast?.("error", "User tidak valid");
      return;
    }

    try {
      const uploadedUrl = await uploadNewPhotoIfNeeded();

      const { error } = await supabase
        .from("profiles")
        .update({
          username: form.namaLengkap,
          tanggal_lahir: form.tanggalLahir,
          jenis_kelamin: form.jenisKelamin,
          foto_profil: uploadedUrl,
        })
        .eq("id", sessionUser.id);

      if (error) throw error;

      const updatedSession = {
        ...sessionUser,
        username: form.namaLengkap,
        foto_profil: uploadedUrl,
        status: form.status,
      };

      setSessionUser(updatedSession);
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("session-changed"));

      setSelectedFile(null);
      setOldPhotoUrl(uploadedUrl);

      setForm((prev) => ({
        ...prev,
        foto_profil: uploadedUrl,
      }));

      showToast?.("success", "Perubahan disimpan");
    } catch (err) {
      console.error(err);
      showToast?.("error", err.message || "Gagal menyimpan perubahan");
    }
  }

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
          <aside className="settings-sidebar">
            <div className="settings-profile">
              <div className="settings-profile-img">
                <img src={profileImgSrc} alt="profile" />
              </div>

              <div className="settings-profile-info">
                <div className="settings-name">{displayName}</div>

                {form.status === "Diterima" ? (
                  <div className="settings-status-verified">
                    <BadgeCheck size={16} />
                    <span>Terverifikasi</span>
                  </div>
                ) : (
                  <div className="settings-status-unverified">
                    <XCircle size={16} />
                    <span>Belum Terverifikasi</span>
                  </div>
                )}
              </div>
            </div>

            <div className="settings-menu">
              <button type="button" className="settings-menu-item active">
                Profil
              </button>
            </div>
          </aside>

          <section className="settings-content">
            <h1 className="settings-title">Biodata</h1>

            <div className="settings-main">
              <div className="settings-avatar-section">
                <div
                  className="settings-avatar"
                  onClick={openFilePicker}
                  role="button"
                  tabIndex={0}
                >
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

                <p className="settings-avatar-hint">
                  Klik foto profil untuk mengganti foto
                </p>
              </div>

              <div className="settings-form">
                <h3 className="settings-subtitle">Informasi Pengguna</h3>

                <Field
                  label="Nama Lengkap"
                  value={form.namaLengkap}
                  placeholder="Masukkan nama lengkap"
                  onChange={(value) => updateField("namaLengkap", value)}
                />

                <Field
                  label="Email"
                  value={form.email}
                  placeholder="Email tidak dapat diubah"
                  readOnly
                />

                <Field
                  label={identityLabel}
                  value={identityValue}
                  placeholder={`${identityLabel} tidak dapat diubah`}
                  readOnly
                />

                <Field
                  label="Tanggal Lahir"
                  type="date"
                  value={form.tanggalLahir}
                  placeholder="Masukkan tanggal lahir"
                  onChange={(value) => updateField("tanggalLahir", value)}
                />

                <RadioField
                  label="Jenis Kelamin"
                  value={form.jenisKelamin}
                  options={["Laki-laki", "Perempuan"]}
                  onChange={(value) => updateField("jenisKelamin", value)}
                />

                <button
                  type="button"
                  className="settings-save"
                  onClick={() => setConfirmOpen(true)}
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Simpan perubahan profil?"
        message="Perubahan pada nama, tanggal lahir, jenis kelamin, dan foto profil akan disimpan."
        cancelText="Batal"
        confirmText="Simpan"
        type="primary"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          await handleSave();
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
  type = "text",
  readOnly = false,
}) {
  return (
    <div className="settings-field">
      <label>{label}</label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        className={readOnly ? "is-readonly" : ""}
        onChange={(e) => {
          if (!readOnly && onChange) {
            onChange(e.target.value);
          }
        }}
      />
    </div>
  );
}

function RadioField({ label, value, options = [], onChange }) {
  return (
    <div className="settings-field">
      <label>{label}</label>

      <div className="settings-radio-group">
        {options.map((option) => (
          <label key={option} className="settings-radio">
            <input
              type="radio"
              name={label}
              value={option}
              checked={value === option}
              onChange={(e) => onChange(e.target.value)}
            />

            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}