import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import logoSukaMuda from '../assets/logo.png';
import { IoNotificationsSharp, IoCreateOutline, IoMenu, IoClose } from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import { FaSearch } from 'react-icons/fa';

const Navbar = () => {
  const { isLoggedIn, logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const sidebarRef = useRef();
  const navMenuRef = useRef();

  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  // --- FUNGSI SEARCH ---
  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchTerm.trim()) {
        navigate(`/search?q=${searchTerm}`);
        setSearchTerm("");
      }
    }
  };

  // Menutup sidebar & dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }

      if (navMenuRef.current && !navMenuRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Helper untuk navigasi kategori dengan auto-close dropdown
  const navigateToCategory = (slug) => {
    navigate(`/category/${slug}`);
    setActiveDropdown(null);
    setIsSidebarOpen(false);
  };

  return (
    <>
      <nav className="navbar-container">
        <div className="navbar-top">
          <div className="logo-section">
            <div className="logo-circle" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
              <img src={logoSukaMuda} alt="SukaMuda" />
            </div>
          </div>

          {/* --- SEARCH SECTION --- */}
         <div className="search-section">
  <div className="search-bar">
    <span
      className="search-icon"
      onClick={handleSearch}
      style={{ cursor: 'pointer' }}
    >
      <FaSearch />
    </span>
              <input
                type="text"
                placeholder="Pencarian"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>

          <div className="nav-actions">
            {isLoggedIn ? (
              <div className="logged-in-icons">
                <IoNotificationsSharp
                  className="icon"
                  onClick={() => navigate('/notifications')}
                />
                <IoCreateOutline
                  className="icon"
                  onClick={() => navigate('/write')}
                />
                <IoMenu className="icon menu-btn" onClick={toggleSidebar} />
              </div>
            ) : (
              <div className="auth-buttons">
                <button className="btn-daftar" onClick={() => navigate('/register')}>Daftar</button>
                <button className="btn-masuk" onClick={() => navigate('/login')}>Masuk</button>
              </div>
            )}
          </div>
        </div>

        {/* --- NAVBAR BAWAH (Menu Kategori & Dropdown) --- */}
        <div className="navbar-bottom" ref={navMenuRef}>
          <ul className="nav-menu">
            <li
              className="nav-item"
              onMouseEnter={() => setActiveDropdown('news')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <div className="menu-header">
                News <span className={`arrow ${activeDropdown === 'news' ? 'up' : 'down'}`}></span>
              </div>
              {activeDropdown === 'news' && (
                <ul className="dropdown-menu">
                  <li onClick={() => navigateToCategory('school')}>School</li>
                  <li onClick={() => navigateToCategory('college')}>College</li>
                  <li onClick={() => navigateToCategory('general')}>General</li>
                </ul>
              )}
            </li>

            <li
              className="nav-item"
              onMouseEnter={() => setActiveDropdown('lifestyle')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <div className="menu-header">
                Lifestyle <span className={`arrow ${activeDropdown === 'lifestyle' ? 'up' : 'down'}`}></span>
              </div>
              {activeDropdown === 'lifestyle' && (
                <ul className="dropdown-menu">
                  <li onClick={() => navigateToCategory('style')}>Style</li>
                  <li onClick={() => navigateToCategory('culinary')}>Culinary</li>
                  <li onClick={() => navigateToCategory('traveling')}>Traveling</li>
                </ul>
              )}
            </li>

            <li className="nav-item" onClick={() => navigateToCategory('sport')}>Sport & E-Sport</li>
            <li className="nav-item" onClick={() => navigateToCategory('music')}>Music & Film</li>
            <li className="nav-item" onClick={() => navigateToCategory('otomotif')}>Otomotif</li>
            <li className="nav-item" onClick={() => navigateToCategory('science')}>Science</li>
            <li className="nav-item" onClick={() => navigateToCategory('health')}>Health</li>
            <li className="nav-item" onClick={() => navigateToCategory('tech')}>Tech</li>
            <li className="nav-item" onClick={() => navigateToCategory('podcast')}>Podcast</li>
          </ul>
        </div>
      </nav>

      {/* --- SIDEBAR POP UP --- */}
      <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}>
        <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`} ref={sidebarRef}>
          <div className="sidebar-header">
            <div className="sidebar-icons">
              <IoClose className="s-icon close-btn" onClick={toggleSidebar} />
            </div>
          </div>

          <div className="sidebar-content">
            {isLoggedIn && (
              <div className="sidebar-user-info" style={{ padding: '0 20px 20px' }}>
                <p style={{ fontWeight: 'bold', margin: 0 }}>Halo, {user?.name || 'User'}</p>
                <p style={{ fontSize: '12px', color: 'gray', margin: 0 }}>
                  {user?.role === 'admin' ? 'Administrator' : 'Anggota'}
                </p>
              </div>
            )}

            <ul className="sidebar-menu-list">
              {isLoggedIn && user?.role === 'admin' && (
                <li
                  onClick={() => { navigate('/admin'); toggleSidebar(); }}
                  style={{
                    color: '#f97316',
                    fontWeight: 'bold',
                    borderLeft: '4px solid #f97316',
                    paddingLeft: '16px'
                  }}
                >
                  Dashboard Admin
                </li>
              )}
              <li onClick={() => { navigate('/profile'); toggleSidebar(); }}>Profil Saya</li>
              <li onClick={() => { navigate('/about'); toggleSidebar(); }}>About</li>
              <li onClick={() => { navigate('/terms'); toggleSidebar(); }}>Syarat & Ketentuan</li>
              <li onClick={() => { navigate('/rules'); toggleSidebar(); }}>Privacy & Policy</li>
              <li onClick={() => { navigate('/help'); toggleSidebar(); }}>Bantuan</li>
            </ul>
          </div>

          <div className="sidebar-footer">
            <button className="btn-logout" onClick={() => { logout(); toggleSidebar(); }}>
              Keluar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;