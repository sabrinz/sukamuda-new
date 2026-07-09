import React from 'react';
import { Link } from 'react-router-dom';
import { IoLogoInstagram } from 'react-icons/io5';
import { FaTiktok } from 'react-icons/fa';
import { SiThreads } from 'react-icons/si';
import './Footer.css';
import logoSukaMuda from '../assets/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="profile-footer">
      <div className="footer-content">

        {/* Logo + Sosial Media */}
        <div className="footer-logo-section">
          <div className="footer-logo-circle">
            <img src={logoSukaMuda} alt="SukaMuda" />
          </div>
          <div className="social-follow">
            <span>Follow us</span>
            <a href="https://www.instagram.com/sukamudacoid/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <span className="social-icon-wrap instagram">
                <IoLogoInstagram className="instagram-icon" />
              </span>
            </a>
            <a href="https://www.tiktok.com/@suka.muda?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <span className="social-icon-wrap tiktok">
                <FaTiktok className="tiktok-icon" />
              </span>
            </a>
            <a href="https://www.threads.net/@sukamudaid" target="_blank" rel="noopener noreferrer" aria-label="Threads">
              <span className="social-icon-wrap threads">
                <SiThreads className="threads-icon" />
              </span>
            </a>
          </div>
        </div>

        {/* Link Halaman - 2 kolom sejajar */}
        <div className="footer-links">
          <Link to="/About">Tentang Kami</Link>
          <Link to="/redaksi">Redaksi</Link>
          <Link to="/Terms">Syarat & Ketentuan</Link>
          <Link to="/Rules">Kebijakan Privasi</Link>
          <Link to="/Help">Bantuan</Link>
          <Link to="/faq">FAQ</Link>
        </div>

        {/* Kategori - 2 kolom sejajar */}
        <div className="footer-categories">
          <h3>Kategori</h3>
          <div className="category-grid">
            <div className="cat-col">
              <Link to="/category/news">News</Link>
              <Link to="/category/lifestyle">Lifestyle</Link>
              <Link to="/category/sport">Sport & E-Sport</Link>
              <Link to="/category/music">Music & Film</Link>
              <Link to="/category/podcast">Podcast</Link>
            </div>
            <div className="cat-col">
              <Link to="/category/otomotif">Otomotif</Link>
              <Link to="/category/health">Health</Link>
              <Link to="/category/science">Science</Link>
              <Link to="/category/tech">Tech</Link>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>&copy; {currentYear} SukaMuda. All rights reserved.</p>
        <div className="footer-bottom-links">
          <a href="https://www.instagram.com/sukamudacoid/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://www.tiktok.com/@suka.muda" target="_blank" rel="noopener noreferrer">TikTok</a>
          <a href="https://www.threads.net/@sukamudaid" target="_blank" rel="noopener noreferrer">Threads</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;