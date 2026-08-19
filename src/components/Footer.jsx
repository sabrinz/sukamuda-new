import React from "react";
import { Link } from "react-router-dom";
import { IoLogoInstagram } from "react-icons/io5";
import { FaTiktok } from "react-icons/fa";
import { FaThreads } from "react-icons/fa6";
import "./Footer.css";
import logoSukaMuda from "../assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="profile-footer">
      <div className="footer-content">
        {/* ================================================= */}
        {/* ===== LOGO + SOCIAL ============================= */}
        {/* ================================================= */}

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

            {/* Instagram */}
            <a
              href="https://www.instagram.com/sukamudacoid/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram SukaMuda"
            >
              <span className="social-icon-wrap instagram">
                <IoLogoInstagram
                  className="instagram-icon"
                  aria-hidden="true"
                />
              </span>
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@suka.muda"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok SukaMuda"
            >
              <span className="social-icon-wrap tiktok">
                <FaTiktok
                  className="tiktok-icon"
                  aria-hidden="true"
                />
              </span>
            </a>

            {/* Threads */}
            <a
              href="https://www.threads.com/@sukamudacoid"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Threads SukaMuda"
            >
              <span className="social-icon-wrap threads">
                <FaThreads
                  className="threads-icon"
                  aria-hidden="true"
                />
              </span>
            </a>
          </div>
        </div>

        {/* ================================================= */}
        {/* ===== LINK HALAMAN ============================== */}
        {/* ================================================= */}

        <nav
          className="footer-links"
          aria-label="Navigasi Footer"
        >
          <div className="footer-row">
            <Link to="/about">Tentang Kami</Link>
            <Link to="/privacy">Kebijakan Privasi</Link>
          </div>

          <div className="footer-row">
            <Link to="/terms">Syarat & Ketentuan</Link>
            <Link to="/rules">Aturan & Kebijakan</Link>
          </div>

          <div className="footer-row">
            <Link to="/help">Bantuan</Link>
            <Link to="/faq">FAQ</Link>
          </div>
        </nav>

        {/* ================================================= */}
        {/* ===== KATEGORI ================================= */}
        {/* ================================================= */}

        <div className="footer-categories">
          <h2 className="footer-heading">Kategori</h2>

          <nav
            className="category-grid"
            aria-label="Kategori Footer"
          >
            <div className="category-row">
              <Link to="/category/news">News</Link>
              <Link to="/category/tech">Tech</Link>
            </div>

            <div className="category-row">
              <Link to="/category/sport">
                Sport & E-Sport
              </Link>

              <Link to="/category/music">
                Music & Film
              </Link>
            </div>

            <div className="category-row">
              <Link to="/category/otomotif">
                Otomotif
              </Link>

              <Link to="/category/science">
                Science
              </Link>
            </div>

            <div className="category-row">
              <Link to="/category/lifestyle">
                Lifestyle
              </Link>

              <Link to="/category/health">
                Health
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {/* ================================================= */}
      {/* ===== COPYRIGHT ================================= */}
      {/* ================================================= */}

      <div className="footer-bottom">
        <p>
          &copy; {currentYear} SukaMuda. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;