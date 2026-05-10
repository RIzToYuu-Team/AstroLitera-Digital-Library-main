import React from "react";
import "./style.css";
import {
  ArrowLeft,
  Library,
  Users,
  BookOpenCheck,
  Rocket,
  Sparkles,
  MonitorSmartphone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Tentang() {
  const navigate = useNavigate();

  const teamMembers = [
    { name: "Akhmad Thoriq Aydin Rafif", role: "Data Analyst" },
    { name: "Rizky Radiansyah", role: "Full Stack Developer" },
    { name: "Yuan Latisa", role: "UI/UX Designer" },
  ];

  return (
    <div className="info-page">
      <header className="info-header">
        <div className="info-back" onClick={() => navigate("/home")}>
          <ArrowLeft size={18} />
          <span>Kembali</span>
        </div>

        <h1>Tentang Kami</h1>
      </header>

      <main className="info-wrapper">
        <section className="info-card about-card">
          <div className="info-hero">
            <div className="info-icon-box">
              <Library size={36} />
            </div>

            <h2>AstroLitera Digital Library</h2>
            <p>
              Platform perpustakaan digital yang membantu siswa dan guru
              mengakses koleksi buku secara online dengan lebih mudah, cepat,
              dan praktis.
            </p>
          </div>

          <div className="info-section">
            <div className="section-title">
              <Sparkles size={20} className="section-icon" />
              <h3>Tentang AstroLitera</h3>
            </div>

            <p>
              AstroLitera merupakan sistem perpustakaan digital berbasis web
              yang dikembangkan untuk mendukung kegiatan literasi di sekolah.
              Melalui platform ini, pengguna dapat mencari buku, membaca buku
              digital, menambahkan buku ke wishlist, serta melihat informasi
              dan ulasan buku dengan lebih mudah.
            </p>
          </div>

          <div className="visi-grid">
            <div className="visi-card">
              <MonitorSmartphone size={25} className="visi-icon" />
              <h4>Mudah Diakses</h4>
              <p>Dapat digunakan melalui perangkat digital dengan tampilan sederhana.</p>
            </div>

            <div className="visi-card">
              <Rocket size={25} className="visi-icon" />
              <h4>Praktis</h4>
              <p>Membantu proses pencarian dan akses buku menjadi lebih cepat.</p>
            </div>

            <div className="visi-card">
              <BookOpenCheck size={25} className="visi-icon" />
              <h4>Mendukung Literasi</h4>
              <p>Mendorong kebiasaan membaca dan pembelajaran di lingkungan sekolah.</p>
            </div>
          </div>

          <div className="info-section">
            <div className="section-title">
              <Users size={20} className="section-icon" />
              <h3>Kenapa AstroLitera?</h3>
            </div>

            <p>
              AstroLitera hadir untuk membuat pengelolaan dan akses buku menjadi
              lebih modern dibandingkan cara manual. Dengan tampilan yang bersih
              dan fitur yang mudah digunakan, platform ini membantu pengguna
              mencari, membaca, dan menyimpan buku favorit dengan lebih nyaman.
            </p>
          </div>

          <div className="info-section">
            <div className="section-title">
              <Library size={20} className="section-icon" />
              <h3>Tim Pengembang</h3>
            </div>

            <div className="team-grid">
              {teamMembers.map((member, index) => (
                <div className="team-card" key={index}>
                  <div className="team-avatar">{member.name.charAt(0)}</div>
                  <div className="team-info">
                    <h4>{member.name}</h4>
                    <p>{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="info-section last-section">
            <div className="section-title">
              <Sparkles size={20} className="section-icon" />
              <h3>Teknologi yang Digunakan</h3>
            </div>

            <div className="tech-stack">
              <span>React</span>
              <span>Vite</span>
              <span>PostgreSQL</span>
              <span>Supabase</span>
              <span>Figma</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Tentang;