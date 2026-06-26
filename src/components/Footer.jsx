import React from 'react';
import { Link } from 'react-router-dom';
import { IoLogoInstagram } from 'react-icons/io5';
import { FaTiktok } from 'react-icons/fa'; // tambah ini
import './Footer.css';
import logoSukaMuda from '../assets/logo.png';
import { SiThreads } from 'react-icons/si';

const Footer = () => {
  return (
    <footer className="profile-footer">
      <div className="footer-content">

        {/* Bagian Kiri */}
        <div className="footer-logo-section">
          <div className="footer-logo-circle">
            <img src={logoSukaMuda} alt="SukaMuda" />
          </div>
          <div className="social-follow">
            <span>Follow us</span>

            <a
              href="https://www.instagram.com/sukamudacoid/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IoLogoInstagram className="instagram-icon" />
            </a>

            <a
              href="https://www.tiktok.com/@suka.muda?is_from_webapp=1&sender_device=pc"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTiktok className="tiktok-icon" />
            </a>

            <a 
              href="https://www.threads.net/@sukamudaid" 
              target="_blank" 
              rel="noopener noreferrer"
              >
              <SiThreads className="threads-icon" />
            </a>

          </div>
        </div>

        {/* Bagian Tengah */}
        <div className="footer-links">
          <Link to="/About">Tentang</Link>
          <Link to="/Terms">Syarat dan ketentuan</Link>
          <Link to="/Rules">Kebijakan Privasi & Kebijakan Penggunaan</Link>
          <Link to="/redaksi">Redaksi</Link>
          <Link to="/Help">Bantuan</Link>
          <Link to="/faq">FAQ</Link>
        </div>

        {/* Bagian Kanan */}
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
    </footer>
  );
};

export default Footer;