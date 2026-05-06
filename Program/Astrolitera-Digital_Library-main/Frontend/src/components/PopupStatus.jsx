import { Link, useNavigate } from "react-router-dom";
import "./PopupStatus.css";
import img1 from "../assets/success.png";
import img2 from "../assets/pending.png";
import img3 from "../assets/error.png";
import { X } from "lucide-react";

const PopupStatus = ({ type, onClose }) => {
  const navigate = useNavigate();

  const data = {
    success: {
      title: "PENDAFTARAN BERHASIL!",
      desc: "Akun kamu sudah diverifikasi oleh Admin. Silahkan masuk menggunakan akun yang sudah kamu daftarkan.",
      color: "blue",
      img: img1,
      btn: "Login Sekarang",
      link: "/login",
    },
    pending: {
      title: "PENDAFTARAN TERKIRIM",
      desc: "Akun kamu akan diverifikasi oleh Admin terlebih dahulu sebelum dapat digunakan. Silakan cek kembali setelah dikonfirmasi.",
      color: "indigo",
      img: img2,
      btn: "Mengerti",
      link: "/home",
    },
    error: {
      title: "PENDAFTARAN GAGAL",
      desc: "Beberapa data belum sesuai. Periksa kembali isian kamu dan coba lagi.",
      color: "red",
      img: img3,
      btn: "Perbaiki Data",
      link: "/register",
    },
  };

  const c = data[type];
  if (!c) return null;

  const handleClose = () => {
    // default behaviour: go home as guest
    if (typeof onClose === "function") return onClose();
    navigate("/home");
  };

  return (
    <div className="popup-overlay" role="dialog" aria-modal="true">
      <div className="popup-card">
        {(type === "pending" || type === "success") && (
          <button
            type="button"
            className="popup-close"
            onClick={handleClose}
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        )}

        <img src={c.img} alt={type} className="popup-img" />

        <h3 className={`popup-title ${c.color}`}>{c.title}</h3>

        <p className="popup-desc">{c.desc}</p>

        <Link
          to={c.link}
          className={`popup-btn ${c.color}`}
          onClick={() => {
            if (type === "pending" && typeof onClose === "function") onClose();
          }}
        >
          {c.btn}
        </Link>

        {type === "error" && (
          <Link
            to={{ pathname: "/home" }}
            state={{ guest: true }}
            className="popup-guest"
          >
            lanjut sebagai tamu
          </Link>
        )}
      </div>
    </div>
  );
};

export default PopupStatus;
