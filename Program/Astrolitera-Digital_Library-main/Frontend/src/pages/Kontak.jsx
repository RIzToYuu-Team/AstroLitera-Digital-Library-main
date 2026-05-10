import React from "react";
import "./style.css";
import { ArrowLeft, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Kontak() {
  const navigate = useNavigate();

  return (
    <div className="info-page">
      <header className="info-header">
        <div className="info-back" onClick={() => navigate("/home")}>
          <ArrowLeft size={18} />
          <span>Kembali</span>
        </div>

        <h1>Kontak</h1>
      </header>

      <main className="info-wrapper">
        <section className="info-card contact-card">
          <div className="info-hero">
            <div className="info-icon-box">
              <MessageCircle size={36} />
            </div>

            <h2>Hubungi Kami</h2>
            <p>
              Jika membutuhkan bantuan atau informasi seputar AstroLitera,
              silakan hubungi kami melalui kontak berikut.
            </p>
          </div>

          <div className="contact-list">
            <div className="contact-box">
              <div className="contact-icon">
                <Mail size={22} />
              </div>
              <div>
                <h3>Email</h3>
                <p>astrolitera.support@gmail.com</p>
              </div>
            </div>

            <div className="contact-box">
              <div className="contact-icon">
                <Phone size={22} />
              </div>
              <div>
                <h3>Telepon</h3>
                <p>0812-8281-5992</p>
              </div>
            </div>

            <div className="contact-box">
              <div className="contact-icon">
                <MapPin size={22} />
              </div>
              <div>
                <h3>Lokasi</h3>
                <p>SMKN 1 Cibinong, Bogor</p>
              </div>
            </div>
          </div>

          <p className="contact-note">
            Kami siap membantu kebutuhan informasi dan dukungan teknis pengguna
            AstroLitera Digital Library.
          </p>
        </section>
      </main>
    </div>
  );
}

export default Kontak;