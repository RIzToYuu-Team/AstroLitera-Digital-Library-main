import React, { useMemo } from "react";
import "./SideMenu.css";
import { ArrowLeft, Home, Bookmark, Clock, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../assets/default-avatar.jpg"; 

/**
 * SideMenu rules:
 * - Avatar selalu <img>
 * - Guest (belum login) -> pakai default avatar
 * - Logged-in -> pakai fotoProfil/kartu jika ada, kalau tidak ada -> default avatar
 *
 * NOTE: NIS, nama, foto profil nantinya bisa diambil dari halaman Pengaturan.
 */

const DEFAULT_AVATAR_SRC = defaultAvatar;

function SideMenu({ open, onClose }) {
  const navigate = useNavigate();

  const sessionUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("sessionUser") || "null");
    } catch {
      return null;
    }
  }, [open]);

  const isLoggedIn = !!sessionUser;

  // Nama + NIS (sementara dari sessionUser; nanti bisa pindah ke Pengaturan)
  const profileName = isLoggedIn ? sessionUser?.nama || "Anonim" : "Pengunjung";
  const profileSub = isLoggedIn ? sessionUser?.nis || "" : "Akses terbatas";

  // Foto user: prioritas fotoProfil, fallback kartu, fallback default
  const userPhoto =
    (isLoggedIn && (sessionUser?.fotoProfil || sessionUser?.kartu)) || "";

  const profileImgSrc =
    typeof userPhoto === "string" && userPhoto.trim() !== ""
      ? userPhoto
      : DEFAULT_AVATAR_SRC;

  const go = (path) => {
    onClose?.();
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("sessionUser");
    onClose?.();
    navigate("/home");
  };

  return (
    <>
      {open && <div className="side-overlay" onClick={onClose} />}

      <aside className={`side-drawer ${open ? "open" : ""}`} aria-hidden={!open}>
        {/* Header: back */}
        <div className="side-top">
          <button
            type="button"
            className="side-back"
            onClick={onClose}
            aria-label="Kembali"
          >
            <ArrowLeft size={22} />
            <span>Kembali</span>
          </button>
        </div>

        {/* Profile block */}
        <div className="side-profile">
          <div className="side-avatar">
            <img src={profileImgSrc} alt="Foto profil" />
          </div>

          <div className="side-user">
            <div className="side-name">{profileName}</div>
            <div className="side-sub">{profileSub}</div>
          </div>
        </div>

        <div className="side-divider" />

        {/* Menu */}
        <nav className="side-nav">
          <button type="button" className="side-item" onClick={() => go("/home")}>
            <Home size={18} />
            <span>Home</span>
          </button>

          <button
            type="button"
            className="side-item"
            onClick={() => go("/favorite")}
          >
            <Bookmark size={18} />
            <span>Favorit</span>
          </button>

          <button
            type="button"
            className="side-item"
            onClick={() => go("/aktivitas")}
          >
            <Clock size={18} />
            <span>Aktivitas</span>
          </button>

          <button
            type="button"
            className="side-item"
            onClick={() => go("/settings")}
          >
            <Settings size={18} />
            <span>Pengaturan</span>
          </button>
        </nav>

        {/* Bottom action */}
        <div className="side-bottom">
          {isLoggedIn ? (
            <button type="button" className="side-primary" onClick={handleLogout}>
              Keluar
            </button>
          ) : (
            <button type="button" className="side-primary" onClick={() => go("/register")}>
              Daftar
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

export default SideMenu;