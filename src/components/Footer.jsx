import React from "react";
import { Link } from "react-router-dom";
import { IoLogoInstagram } from "react-icons/io5";
import { FaTiktok } from "react-icons/fa";
import { FaThreads } from "react-icons/fa6";

import "./Footer.css";
import logoSukaMuda from "../assets/logo.png";

const FOOTER_LINKS = [
  {
    label: "Tentang Kami",
    to: "/about",
  },
  {
    label: "Kebijakan Privasi",
    to: "/privacy",
  },
  {
    label: "Syarat & Ketentuan",
    to: "/terms",
  },
  {
    label: "Aturan & Kebijakan",
    to: "/rules",
  },
  {
    label: "Bantuan",
    to: "/help",
  },
  {
    label: "FAQ",
    to: "/faq",
  },
];

const FOOTER_CATEGORIES = [
  {
    label: "News",
    to: "/category/news",
  },
  {
    label: "Tech",
    to: "/category/tech",
  },
  {
    label: "Sport & E-Sport",
    to: "/category/sport",
  },
  {
    label: "Music & Film",
    to: "/category/music",
  },
  {
    label: "Otomotif",
    to: "/category/otomotif",
  },
  {
    label: "Science",
    to: "/category/science",
  },
  {
    label: "Lifestyle",
    to: "/category/lifestyle",
  },
  {
    label: "Health",
    to: "/category/health",
  },
];

const SOCIAL_LINKS = [
  {
    label: "Instagram SukaMuda",
    href: "https://www.instagram.com/sukamudacoid/",
    className: "instagram",
    icon: IoLogoInstagram,
    iconClassName: "instagram-icon",
  },
  {
    label: "TikTok SukaMuda",
    href: "https://www.tiktok.com/@suka.muda",
    className: "tiktok",
    icon: FaTiktok,
    iconClassName: "tiktok-icon",
  },
  {
    label: "Threads SukaMuda",
    href: "https://www.threads.com/@sukamudacoid",
    className: "threads",
    icon: FaThreads,
    iconClassName: "threads-icon",
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="profile-footer">
      <div className="footer-content">
        {/* =================================================
            BRAND + SOCIAL
        ================================================= */}

        <div className="footer-logo-section">
          <Link
            to="/"
            className="footer-logo-circle"
            aria-label="SukaMuda - Beranda"
          >
            <img
              src={logoSukaMuda}
              alt="Logo SukaMuda"
              width="88"
              height="88"
              loading="lazy"
              decoding="async"
            />
          </Link>

          <div
            className="social-follow"
            role="group"
            aria-label="Media sosial SukaMuda"
          >
            <span>Ikuti SukaMuda</span>

            {SOCIAL_LINKS.map(
              ({ label, href, className, icon: Icon, iconClassName }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  <span className={`social-icon-wrap ${className}`}>
                    <Icon className={iconClassName} aria-hidden="true" />
                  </span>
                </a>
              ),
            )}
          </div>
        </div>

        {/* =================================================
            INFORMASI
        ================================================= */}

        <nav className="footer-links" aria-label="Navigasi informasi">
          <div className="footer-row">
            {FOOTER_LINKS.slice(0, 2).map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="footer-row">
            {FOOTER_LINKS.slice(2, 4).map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="footer-row">
            {FOOTER_LINKS.slice(4, 6).map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* =================================================
            KATEGORI
        ================================================= */}

        <section
          className="footer-categories"
          aria-labelledby="footer-category-title"
        >
          <h2 id="footer-category-title" className="footer-heading">
            Kategori
          </h2>

          <nav className="category-grid" aria-label="Kategori artikel">
            <div className="category-row">
              {FOOTER_CATEGORIES.slice(0, 2).map((item) => (
                <Link key={item.to} to={item.to}>
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="category-row">
              {FOOTER_CATEGORIES.slice(2, 4).map((item) => (
                <Link key={item.to} to={item.to}>
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="category-row">
              {FOOTER_CATEGORIES.slice(4, 6).map((item) => (
                <Link key={item.to} to={item.to}>
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="category-row">
              {FOOTER_CATEGORIES.slice(6, 8).map((item) => (
                <Link key={item.to} to={item.to}>
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </section>
      </div>

      {/* =================================================
          COPYRIGHT
      ================================================= */}

      <div className="footer-bottom">
        <p>&copy; {currentYear} SukaMuda. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;