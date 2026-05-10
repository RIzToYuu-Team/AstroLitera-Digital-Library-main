import React, { useState, useEffect } from "react";
import "./SideMenu.css";
import { ArrowLeft, Home, Bookmark, Clock, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../assets/default-avatar.jpg";
import { getSessionUser, clearSessionUser } from "../utils/session";

function SideMenu({ open, onClose }) {
  const navigate = useNavigate();

  const [sessionUser, setSessionUser] = useState(getSessionUser());

  useEffect(() => {
    const sync = () => setSessionUser(getSessionUser());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const isLoggedIn = Boolean(sessionUser?.id);

  const profileName = isLoggedIn
    ? sessionUser?.username || "Anonim"
    : "Pengunjung";

  const profileSub = isLoggedIn
    ? sessionUser?.nis || ""
    : "Akses terbatas";

  const userPhoto = sessionUser?.fotoProfil || sessionUser?.kartu || "";

  const profileImgSrc =
    userPhoto && userPhoto.trim() !== ""
      ? userPhoto
      : defaultAvatar;

  const go = (path) => {
    onClose?.();
    navigate(path);
  };

  const handleLogout = () => {
    clearSessionUser();
    setSessionUser(null);
    onClose?.();
    navigate("/login");
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