import React from "react";
import "./style.css";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Kebijakan() {
  const navigate = useNavigate();

  return (
    <div className="page-container">

      <header className="page-header">
        <ArrowLeft className="back-icon" onClick={() => navigate("/home")} />
        <h1>Kebijakan Penggunaan</h1>
      </header>

      <div className="page-content fancy-card">

        <div className="section">
          <ShieldCheck size={40} className="section-icon" />
          <h2>Kebijakan & Aturan</h2>
          <p>
            Pengguna AstroLitera diwajibkan menggunakan platform ini secara bertanggung jawab.
            Seluruh buku digital yang tersedia hanya diperbolehkan untuk keperluan pembelajaran,
            penelitian, dan referensi.
          </p>
        </div>

        <div className="divider"></div>

        <h3>Ketentuan Penggunaan:</h3>
        <ul className="policy-list">
          <li>Dilarang menyebarkan ulang buku tanpa izin.</li>
          <li>Dilarang menyalahgunakan fitur atau merusak sistem.</li>
          <li>Pengguna wajib menjaga etika dan sopan santun.</li>
        </ul>

        <p className="policy-footer">
          Dengan menggunakan AstroLitera, Anda setuju untuk mematuhi seluruh kebijakan yang berlaku.
        </p>

      </div>
    </div>
  );
}

export default Kebijakan;
