import React from "react";
import "./style.css";
import { ArrowLeft, Library, Users, BookOpenCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Tentang() {
  const navigate = useNavigate();

  return (
    <div className="page-container">

      <header className="page-header">
        <ArrowLeft className="back-icon" onClick={() => navigate("/home")} />
        <h1>Tentang Kami</h1>
      </header>

      <div className="page-content fancy-card">

        <div className="section">
          <Library size={40} className="section-icon" />
          <h2>AstroLitera Digital Library</h2>
          <p>
            AstroLitera adalah platform perpustakaan digital modern yang dirancang 
            khusus untuk siswa dan guru. Kami menghadirkan akses mudah ke berbagai 
            koleksi e-book untuk meningkatkan minat baca, memperluas wawasan, dan 
            mendukung proses pembelajaran di lingkungan sekolah.
          </p>
        </div>

        <div className="divider"></div>

        <div className="section">
          <Users size={36} className="section-icon" />
          <h3>Misi Kami</h3>
          <p>
            - Menyediakan akses literasi yang mudah dan cepat. <br />
            - Mendorong kebiasaan membaca sejak dini. <br />
            - Menghadirkan pengalaman membaca digital yang nyaman, ringan, dan menarik.
          </p>
        </div>

        <div className="divider"></div>

        <div className="section">
          <BookOpenCheck size={36} className="section-icon" />
          <h3>Kenapa AstroLitera?</h3>
          <p>
            Tampilan bersih, fitur interaktif, dan akses kapan saja membuat AstroLitera 
            menjadi pilihan terbaik untuk kebutuhan bahan bacaan digital di sekolah.
          </p>
        </div>

      </div>
    </div>
  );
}

export default Tentang;
