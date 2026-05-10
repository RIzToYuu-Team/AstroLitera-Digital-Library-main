import React from "react";
import "./style.css";
import {
  ArrowLeft,
  ShieldCheck,
  BookOpen,
  UserCheck,
  Lock,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Kebijakan() {
  const navigate = useNavigate();

  return (
    <div className="info-page">
      <header className="info-header">
        <div className="info-back" onClick={() => navigate("/home")}>
          <ArrowLeft size={18} />
          <span>Kembali</span>
        </div>

        <h1>Kebijakan Penggunaan</h1>
      </header>

      <main className="info-wrapper">
        <section className="info-card policy-card">
          <div className="info-hero">
            <div className="info-icon-box">
              <ShieldCheck size={36} />
            </div>

            <h2>Kebijakan & Aturan</h2>
            <p>
              AstroLitera digunakan untuk mendukung kegiatan literasi dan
              pembelajaran digital di lingkungan sekolah.
            </p>
          </div>

          <div className="policy-content">
            <div className="policy-intro">
              <p>
                Pengguna AstroLitera diwajibkan menggunakan platform ini secara
                bertanggung jawab. Seluruh buku digital yang tersedia hanya
                diperbolehkan untuk keperluan pembelajaran, penelitian, dan
                referensi.
              </p>
            </div>

            <div className="policy-grid">
              <div className="policy-box">
                <BookOpen size={22} />
                <div>
                  <h3>Penggunaan Buku</h3>
                  <p>
                    Buku digital hanya digunakan untuk membaca, belajar, dan
                    kebutuhan referensi pengguna.
                  </p>
                </div>
              </div>

              <div className="policy-box">
                <UserCheck size={22} />
                <div>
                  <h3>Etika Pengguna</h3>
                  <p>
                    Pengguna wajib menjaga sopan santun saat menggunakan fitur
                    yang tersedia di AstroLitera.
                  </p>
                </div>
              </div>

              <div className="policy-box">
                <Lock size={22} />
                <div>
                  <h3>Keamanan Akun</h3>
                  <p>
                    Pengguna bertanggung jawab menjaga data akun agar tidak
                    disalahgunakan oleh pihak lain.
                  </p>
                </div>
              </div>

              <div className="policy-box">
                <AlertCircle size={22} />
                <div>
                  <h3>Larangan</h3>
                  <p>
                    Dilarang menyebarkan ulang buku tanpa izin, merusak sistem,
                    atau menyalahgunakan fitur website.
                  </p>
                </div>
              </div>
            </div>

            <p className="policy-note">
              Dengan menggunakan AstroLitera, pengguna dianggap telah memahami
              dan menyetujui seluruh kebijakan yang berlaku.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Kebijakan;