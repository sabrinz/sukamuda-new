import React from "react";
import { Link } from "react-router-dom";
import { IoLogoInstagram } from "react-icons/io5";
import { FaTiktok } from "react-icons/fa";
import "./Footer.css";
import logoSukaMuda from "../assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="profile-footer">
      <div className="footer-content">
        {/* Logo + Sosial Media */}
        <div className="footer-logo-section">
          <div className="footer-logo-circle">
            <img
              src={logoSukaMuda}
              alt="Logo SukaMuda"
              width="88"
              height="88"
              decoding="async"
            />
          </div>

          <div className="social-follow">
            <span>Follow us</span>

            <a
              href="https://www.instagram.com/sukamudacoid/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <span className="social-icon-wrap instagram">
                <IoLogoInstagram className="instagram-icon" aria-hidden="true" />
              </span>
            </a>

            <a
              href="https://www.tiktok.com/@suka.muda"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
            >
              <span className="social-icon-wrap tiktok">
                <FaTiktok className="tiktok-icon" aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>

        {/* Link Halaman */}
        <nav className="footer-links" aria-label="Navigasi Footer">
          <Link to="/about">Tentang Kami</Link>
          <Link to="/terms">Syarat & Ketentuan</Link>
          <Link to="/privacy">Kebijakan Privasi</Link>
          <Link to="/rules">Aturan & Kebijakan</Link>
          <Link to="/help">Bantuan</Link>
          <Link to="/faq">FAQ</Link>
        </nav>

        {/* Kategori */}
        <div className="footer-categories">
          {/* FIX A11y: heading hierarchy */}
          <h2 className="footer-heading">Kategori</h2>

          <nav className="category-grid" aria-label="Kategori Footer">
            <div className="cat-col">
              <Link to="/category/news">News</Link>
              <Link to="/category/lifestyle">Lifestyle</Link>
              <Link to="/category/sport">Sport & E-Sport</Link>
            </div>
            <div className="cat-col">
              <Link to="/category/otomotif">Otomotif</Link>
              <Link to="/category/health">Health</Link>
              <Link to="/category/tech">Tech</Link>
            </div>
          </nav>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} SukaMuda. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;