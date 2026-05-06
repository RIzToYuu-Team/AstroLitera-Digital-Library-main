import { Link } from "react-router-dom";
import logoImg from "../assets/logo.png";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-logo">
          <img src={logoImg} alt="Footer Logo" />
        </div>

        <ul className="footer-menu">
          <li><Link to="/about">Tentang</Link></li>
          <li><Link to="/contact">Kontak</Link></li>
          <li><Link to="/privacyPolicy">Kebijakan</Link></li>
        </ul>
      </div>

      <p className="footer-copy">&copy; {new Date().getFullYear()} AstroLitera </p>
    </footer>
  );
}

export default Footer;