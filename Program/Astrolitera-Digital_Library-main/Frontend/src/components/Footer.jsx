import { Link } from "react-router-dom";
import logoImg from "../assets/logo.png";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <Link to="/home" className="footer-brand">
          <img src={logoImg} alt="Logo AstroLitera" />
          <div>
            <h3>AstroLitera</h3>
            <p>Digital Library</p>
          </div>
        </Link>

        <nav className="footer-menu">
          <Link to="/about">Tentang Kami</Link>
          <Link to="/contact">Kontak</Link>
          <Link to="/privacyPolicy">Kebijakan</Link>
        </nav>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} AstroLitera Digital Library</p>
      </div>
    </footer>
  );
}

export default Footer;