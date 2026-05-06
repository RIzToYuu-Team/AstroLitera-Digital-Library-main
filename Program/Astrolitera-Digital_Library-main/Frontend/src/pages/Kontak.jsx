import React from "react";
import "./style.css";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Kontak() {
  const navigate = useNavigate();

  return (
    <div className="page-container">

      <header className="page-header">
        <ArrowLeft className="back-icon" onClick={() => navigate("/home")} />
        <h1>Kontak</h1>
      </header>

      <div className="page-content fancy-card">

        <h2>Hubungi Kami</h2>

        <div className="contact-item">
          <Mail size={24} />
          <p>astrolitera.support@gmail.com</p>
        </div>

        <div className="contact-item">
          <Phone size={24} />
          <p>08xx-xxxx-xxxx</p>
        </div>

        <div className="contact-item">
          <MapPin size={24} />
          <p>SMKN 1 Cibinong, Bogor</p>
        </div>

        <p className="contact-note">
          Kami siap membantu kebutuhan informasi dan dukungan teknis Anda.
        </p>

      </div>
    </div>
  );
}

export default Kontak;
