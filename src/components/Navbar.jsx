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
        navigate(`/search?q=${searchTerm}`);
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
            <div className="logo-circle" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
              <img src={logoSukaMuda} alt="SukaMuda" />
            </div>
          </div>

          <div className="search-section">
            <div className="search-bar">
              <span className="search-icon" onClick={handleSearch} style={{ cursor: 'pointer' }}>
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
                <IoNotificationsSharp className="icon" onClick={() => navigate('/notifications')} />
                <IoCreateOutline className="icon" onClick={() => navigate('/write')} />
                <IoMenu className="icon menu-btn" onClick={openSidebar} />
              </div>
            ) : (
              <div className="auth-buttons">
                <button className="btn-masuk" onClick={() => navigate('/login')}>Masuk</button>
                <button className="btn-daftar" onClick={() => navigate('/register')}>Daftar</button>
              </div>
            )}
          </div>
        </div>

        <div className="navbar-bottom" ref={navMenuRef}>
          <div className="navbar-bottom-scroll">
            <ul className="nav-menu">
              <li 
                ref={el => navItemRefs.current['news'] = el}
                className="nav-item" 
                onMouseEnter={() => setActiveDropdown('news')} 
                onMouseLeave={handleMouseLeave}
                onClick={(e) => handleDropdownClick(e, 'news')}
              >
                <div className="menu-header">News <span className={`arrow ${activeDropdown === 'news' ? 'up' : 'down'}`}></span></div>
                {!isMobile && activeDropdown === 'news' && (
                  <ul className="dropdown-menu">
                    {dropdownData.news.map(item => (
                      <li key={item.slug} onClick={(e) => { e.stopPropagation(); navigateToCategory(item.slug); }}>{item.label}</li>
                    ))}
                  </ul>
                )}
              </li>
              
              <li 
                ref={el => navItemRefs.current['lifestyle'] = el}
                className="nav-item" 
                onMouseEnter={() => setActiveDropdown('lifestyle')} 
                onMouseLeave={handleMouseLeave}
                onClick={(e) => handleDropdownClick(e, 'lifestyle')}
              >
                <div className="menu-header">Lifestyle <span className={`arrow ${activeDropdown === 'lifestyle' ? 'up' : 'down'}`}></span></div>
                {!isMobile && activeDropdown === 'lifestyle' && (
                  <ul className="dropdown-menu">
                    {dropdownData.lifestyle.map(item => (
                      <li key={item.slug} onClick={(e) => { e.stopPropagation(); navigateToCategory(item.slug); }}>{item.label}</li>
                    ))}
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
        </div>

        {/* ✅ FIX AKHIR: Dropdown mobile diletakkan di LUAR navbar-bottom agar tidak kepotong overflow-x: auto */}
        {isMobile && dropdownPos.visible && (
          <ul className="mobile-dropdown-fixed" style={{ top: `${dropdownPos.top}px`, left: `${dropdownPos.left}px`}}>
            {dropdownData[activeDropdown]?.map(item => (
              <li key={item.slug} onClick={() => navigateToCategory(item.slug)}>{item.label}</li>
            ))}
          </ul>
        )}
      </nav>

      {/* OVERLAY SIDEBAR */}
      <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={closeSidebar}>
        <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`} ref={sidebarRef} onClick={(e) => e.stopPropagation()}>
          
          <div className="sidebar-close-area">
            <button className="sidebar-close-btn" onClick={closeSidebar} aria-label="Tutup menu">
              <span className="x-line x-line-1"></span>
              <span className="x-line x-line-2"></span>
            </button>
          </div>

          <div className="sidebar-top-accent" />

          <div className="sidebar-profile-hero">
            <div className="profile-glow" />
            
            <div className="profile-avatar-ring">
              <div className="profile-avatar-inner">
                {user?.avatar || user?.profile_photo_url ? (
                  <img src={user.avatar || user.profile_photo_url} alt={user?.name} className="profile-avatar-img" />
                ) : (
                  <span className="profile-avatar-initials">{getInitials(user?.name)}</span>
                )}
              </div>
            </div>

            <div className="profile-text-group">
              <h2 className="profile-name">{user?.name || 'User'}</h2>
              <div className={`profile-role-badge ${user?.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                <span className="role-dot" />
                {user?.role === 'admin' ? 'Administrator' : 'Anggota'}
              </div>
            </div>

            <div className="profile-deco-line">
              <span className="deco-diamond" />
              <div className="deco-line-track" />
              <span className="deco-diamond" />
            </div>
          </div>

          <div className="sidebar-menu-area">
            <ul className="sidebar-menu-list">
              {isLoggedIn && user?.role === 'admin' && (
                <li className="sidebar-menu-item admin-special" onClick={() => navigateMenu('/admin')}>
                  <span className="menu-item-icon"><IoTrophyOutline /></span>
                  <span className="menu-item-text">Dashboard Admin</span>
                  <span className="menu-item-arrow">›</span>
                </li>
              )}
              <li className="sidebar-menu-item" onClick={() => navigateMenu('/profile')}>
                <span className="menu-item-icon"><IoPersonOutline /></span>
                <span className="menu-item-text">Profil Saya</span>
                <span className="menu-item-arrow">›</span>
              </li>
              <li className="sidebar-menu-item" onClick={() => navigateMenu('/about')}>
                <span className="menu-item-icon"><IoInformationCircleOutline /></span>
                <span className="menu-item-text">About</span>
                <span className="menu-item-arrow">›</span>
              </li>
              <li className="sidebar-menu-item" onClick={() => navigateMenu('/terms')}>
                <span className="menu-item-icon"><IoDocumentTextOutline /></span>
                <span className="menu-item-text">Syarat & Ketentuan</span>
                <span className="menu-item-arrow">›</span>
              </li>
              <li className="sidebar-menu-item" onClick={() => navigateMenu('/rules')}>
                <span className="menu-item-icon"><IoShieldCheckmarkOutline /></span>
                <span className="menu-item-text">Privacy & Policy</span>
                <span className="menu-item-arrow">›</span>
              </li>
              <li className="sidebar-menu-item" onClick={() => navigateMenu('/help')}>
                <span className="menu-item-icon"><IoHelpCircleOutline /></span>
                <span className="menu-item-text">Bantuan</span>
                <span className="menu-item-arrow">›</span>
              </li>
            </ul>
          </div>

          <div className="sidebar-premium-footer">
            <div className="footer-deco-line" />
            <button className="premium-logout-btn" onClick={() => { logout(); closeSidebar(); }}>
              <span className="logout-icon-glow">
                <IoLogOutOutline />
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