import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import logoSukaMuda from '../assets/logo.png';
import { IoNotificationsSharp, IoCreateOutline, IoMenu, IoLogOutOutline, IoTrophyOutline, IoPersonOutline, IoInformationCircleOutline, IoDocumentTextOutline, IoShieldCheckmarkOutline, IoHelpCircleOutline } from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import { FaSearch } from 'react-icons/fa';

const Navbar = () => {
  const { isLoggedIn, logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, visible: false });

  const navigate = useNavigate();
  const sidebarRef = useRef();
  const navMenuRef = useRef();
  const navItemRefs = useRef({});

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchTerm.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        setSearchTerm("");
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('.mobile-dropdown-fixed')) return;
      if (navMenuRef.current && !navMenuRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
        setActiveDropdown(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const navigateToCategory = (slug) => {
    navigate(`/category/${slug}`);
    setActiveDropdown(null);
  };

  const navigateMenu = (path) => navigate(path);

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleMouseLeave = () => {
    if (!isMobile) setActiveDropdown(null);
  };

  const handleDropdownClick = (e, key) => {
    if (isMobile) {
      const node = navItemRefs.current[key];
      if (node) {
        const rect = node.getBoundingClientRect();
        const containerRect = document.querySelector('.navbar-bottom').getBoundingClientRect();
        setDropdownPos({
          top: containerRect.bottom,
          left: rect.left,
          visible: containerRect.bottom > 0
        });
      }
    }
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  const dropdownData = {
    news: [
      { slug: 'school', label: 'School' },
      { slug: 'college', label: 'College' },
      { slug: 'general', label: 'General' }
    ],
    lifestyle: [
      { slug: 'style', label: 'Style' },
      { slug: 'culinary', label: 'Culinary' },
      { slug: 'traveling', label: 'Traveling' }
    ]
  };

  return (
    <>
      <nav className="navbar-container">
        <div className="navbar-top">
          <div className="logo-section">
            <button type="button" className="logo-circle" onClick={() => navigate('/')} aria-label="Ke beranda SukaMuda">
              <img src={logoSukaMuda} alt="SukaMuda" width="110" height="110" decoding="async" />
            </button>
          </div>

          <div className="search-section">
            <div className="search-bar">
              <button type="button" className="search-icon" onClick={handleSearch} aria-label="Cari">
                <FaSearch aria-hidden="true" />
              </button>
              <input
                type="text"
                placeholder="Pencarian"
                aria-label="Pencarian"
                enterKeyHint="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>

          <div className="nav-actions">
            {isLoggedIn ? (
              <div className="logged-in-icons">
                <button type="button" className="icon-btn" onClick={() => navigate('/notifications')} aria-label="Notifikasi">
                  <IoNotificationsSharp className="icon" aria-hidden="true" />
                </button>
                <button type="button" className="icon-btn" onClick={() => navigate('/write')} aria-label="Tulis artikel">
                  <IoCreateOutline className="icon" aria-hidden="true" />
                </button>
                <button type="button" className="icon-btn" onClick={openSidebar} aria-label="Buka menu">
                  <IoMenu className="icon menu-btn" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button type="button" className="btn-masuk" onClick={() => navigate('/login')}>Masuk</button>
                <button type="button" className="btn-daftar" onClick={() => navigate('/register')}>Daftar</button>
              </div>
            )}
          </div>
        </div>

        <div className="navbar-bottom" ref={navMenuRef}>
          <div className="navbar-bottom-scroll">
            <ul className="nav-menu">
              <li
                ref={(el) => { navItemRefs.current.news = el; }}
                className="nav-item"
                onMouseEnter={() => setActiveDropdown('news')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className="menu-header"
                  aria-expanded={activeDropdown === 'news'}
                  aria-controls={activeDropdown === 'news' ? 'news-dropdown' : undefined}
                  onClick={(event) => handleDropdownClick(event, 'news')}
                >
                  News
                  <span
                    className={`arrow ${activeDropdown === 'news' ? 'up' : 'down'}`}
                    aria-hidden="true"
                  />
                </button>

                {!isMobile && activeDropdown === 'news' && (
                  <ul id="news-dropdown" className="dropdown-menu">
                    {dropdownData.news.map((item) => (
                      <li key={item.slug}>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigateToCategory(item.slug);
                          }}
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>

              <li
                ref={(el) => { navItemRefs.current.lifestyle = el; }}
                className="nav-item"
                onMouseEnter={() => setActiveDropdown('lifestyle')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className="menu-header"
                  aria-expanded={activeDropdown === 'lifestyle'}
                  aria-controls={activeDropdown === 'lifestyle' ? 'lifestyle-dropdown' : undefined}
                  onClick={(event) => handleDropdownClick(event, 'lifestyle')}
                >
                  Lifestyle
                  <span
                    className={`arrow ${activeDropdown === 'lifestyle' ? 'up' : 'down'}`}
                    aria-hidden="true"
                  />
                </button>

                {!isMobile && activeDropdown === 'lifestyle' && (
                  <ul id="lifestyle-dropdown" className="dropdown-menu">
                    {dropdownData.lifestyle.map((item) => (
                      <li key={item.slug}>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigateToCategory(item.slug);
                          }}
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>

              {[
                { slug: 'sport', label: 'Sport & E-Sport' },
                { slug: 'music', label: 'Music & Film' },
                { slug: 'otomotif', label: 'Otomotif' },
                { slug: 'science', label: 'Science' },
                { slug: 'health', label: 'Health' },
                { slug: 'tech', label: 'Tech' },
                { slug: 'podcast', label: 'Podcast' }
              ].map((item) => (
                <li className="nav-item" key={item.slug}>
                  <button
                    type="button"
                    className="nav-item-button"
                    onClick={() => navigateToCategory(item.slug)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {isMobile && dropdownPos.visible && activeDropdown && (
          <ul
            id={`${activeDropdown}-mobile-dropdown`}
            className="mobile-dropdown-fixed"
            style={{ top: `${dropdownPos.top}px`, left: `${dropdownPos.left}px` }}
          >
            {dropdownData[activeDropdown]?.map((item) => (
              <li key={item.slug}>
                <button
                  type="button"
                  onClick={() => navigateToCategory(item.slug)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>

      {/* OVERLAY SIDEBAR */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
        onClick={closeSidebar}
        aria-hidden={!isSidebarOpen}
      >
        <div
          className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}
          ref={sidebarRef}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Menu pengguna"
        >
          
          <div className="sidebar-close-area">
            <button type="button" className="sidebar-close-btn" onClick={closeSidebar} aria-label="Tutup menu">
              <span className="x-line x-line-1"></span>
              <span className="x-line x-line-2"></span>
            </button>
          </div>

          <div className="sidebar-top-accent" aria-hidden="true" />

          <div className="sidebar-profile-hero">
            <div className="profile-glow" aria-hidden="true" />
            
            <div className="profile-avatar-ring">
              <div className="profile-avatar-inner">
                {user?.avatar || user?.profile_photo_url ? (
                  <img 
  src={user.avatar || user.profile_photo_url} 
  alt={user?.name ? `Foto profil ${user.name}` : 'Foto profil'} 
  className="profile-avatar-img" 
  decoding="async"
  width="80" 
  height="80" 
/>
                ) : (
                  <span className="profile-avatar-initials">{getInitials(user?.name)}</span>
                )}
              </div>
            </div>

            <div className="profile-text-group">
              <h2 className="profile-name">{user?.name || 'User'}</h2>
              <div className={`profile-role-badge ${user?.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                <span className="role-dot" aria-hidden="true" />
                {user?.role === 'admin' ? 'Administrator' : 'Anggota'}
              </div>
            </div>

            <div className="profile-deco-line" aria-hidden="true">
              <span className="deco-diamond" />
              <div className="deco-line-track" />
              <span className="deco-diamond" />
            </div>
          </div>

          <div className="sidebar-menu-area">
            <ul className="sidebar-menu-list">
              {isLoggedIn && user?.role === 'admin' && (
                <li>
                  <button
                    type="button"
                    className="sidebar-menu-item admin-special"
                    onClick={() => navigateMenu('/admin')}
                  >
                    <span className="menu-item-icon"><IoTrophyOutline aria-hidden="true" /></span>
                    <span className="menu-item-text">Dashboard Admin</span>
                    <span className="menu-item-arrow" aria-hidden="true">›</span>
                  </button>
                </li>
              )}

              <li>
                <button type="button" className="sidebar-menu-item" onClick={() => navigateMenu('/profile')}>
                  <span className="menu-item-icon"><IoPersonOutline aria-hidden="true" /></span>
                  <span className="menu-item-text">Profil Saya</span>
                  <span className="menu-item-arrow" aria-hidden="true">›</span>
                </button>
              </li>

              <li>
                <button type="button" className="sidebar-menu-item" onClick={() => navigateMenu('/about')}>
                  <span className="menu-item-icon"><IoInformationCircleOutline aria-hidden="true" /></span>
                  <span className="menu-item-text">About</span>
                  <span className="menu-item-arrow" aria-hidden="true">›</span>
                </button>
              </li>

              <li>
                <button type="button" className="sidebar-menu-item" onClick={() => navigateMenu('/terms')}>
                  <span className="menu-item-icon"><IoDocumentTextOutline aria-hidden="true" /></span>
                  <span className="menu-item-text">Syarat & Ketentuan</span>
                  <span className="menu-item-arrow" aria-hidden="true">›</span>
                </button>
              </li>

              <li>
                <button type="button" className="sidebar-menu-item" onClick={() => navigateMenu('/rules')}>
                  <span className="menu-item-icon"><IoShieldCheckmarkOutline aria-hidden="true" /></span>
                  <span className="menu-item-text">Privacy & Policy</span>
                  <span className="menu-item-arrow" aria-hidden="true">›</span>
                </button>
              </li>

              <li>
                <button type="button" className="sidebar-menu-item" onClick={() => navigateMenu('/help')}>
                  <span className="menu-item-icon"><IoHelpCircleOutline aria-hidden="true" /></span>
                  <span className="menu-item-text">Bantuan</span>
                  <span className="menu-item-arrow" aria-hidden="true">›</span>
                </button>
              </li>
            </ul>
          </div>

          <div className="sidebar-premium-footer">
            <div className="footer-deco-line" aria-hidden="true" />
            <button type="button" className="premium-logout-btn" onClick={() => { logout(); closeSidebar(); }}>
              <span className="logout-icon-glow">
                <IoLogOutOutline aria-hidden="true" />
              </span>
              <span className="logout-text">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
