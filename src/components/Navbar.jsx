import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import "./Navbar.css";
import logoSukaMuda from "../assets/logo.png";

import {
  IoNotificationsSharp,
  IoCreateOutline,
  IoMenu,
  IoLogOutOutline,
  IoTrophyOutline,
  IoPersonOutline,
  IoInformationCircleOutline,
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoHelpCircleOutline,
} from "react-icons/io5";

import { FaSearch } from "react-icons/fa";

import { useAuth } from "../context/AuthContext";

/* =========================================================
   CONSTANTS
   ========================================================= */

const MOBILE_BREAKPOINT = 768;

const dropdownData = {
  news: [
    {
      slug: "school",
      label: "School",
    },
    {
      slug: "college",
      label: "College",
    },
    {
      slug: "general",
      label: "General",
    },
  ],

  lifestyle: [
    {
      slug: "style",
      label: "Style",
    },
    {
      slug: "culinary",
      label: "Culinary",
    },
    {
      slug: "traveling",
      label: "Traveling",
    },
  ],
};

const mainCategories = [
  {
    slug: "sport",
    label: "Sport & E-Sport",
  },
  {
    slug: "music",
    label: "Music & Film",
  },
  {
    slug: "otomotif",
    label: "Otomotif",
  },
  {
    slug: "science",
    label: "Science",
  },
  {
    slug: "health",
    label: "Health",
  },
  {
    slug: "tech",
    label: "Tech",
  },
  {
    slug: "podcast",
    label: "Podcast",
  },
];

/* =========================================================
   HELPERS
   ========================================================= */

const getInitials = (name) => {
  const normalized = String(name || "").trim();

  if (!normalized) {
    return "?";
  }

  return normalized
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getProfileImageUrl = (user) => {
  const raw = String(user?.profile_photo_url || user?.avatar || "").trim();

  if (!raw) return "";

  try {
    const base =
      typeof window === "undefined"
        ? "https://sukamuda.co.id"
        : window.location.origin;
    const url = new URL(raw, base);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "";
    }

    const version =
      user?.updated_at || user?.avatar_updated_at || user?.profile_updated_at;

    if (version) url.searchParams.set("v", String(version));
    return url.href;
  } catch {
    return "";
  }
};

/* =========================================================
   COMPONENT
   ========================================================= */

const Navbar = () => {
  const { isLoggedIn, logout, user } = useAuth();

  const navigate = useNavigate();

  /* =======================================================
     STATE
     ======================================================= */

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [activeDropdown, setActiveDropdown] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [isMobile, setIsMobile] = useState(false);

  const [dropdownPos, setDropdownPos] = useState({
    top: 0,
    left: 0,
    visible: false,
  });

  /* =======================================================
     REFS
     ======================================================= */

  const sidebarRef = useRef(null);

  const sidebarTriggerRef = useRef(null);

  const navMenuRef = useRef(null);

  const navItemRefs = useRef({});

  const searchInputRef = useRef(null);

  /* =======================================================
     MOBILE DETECTION
     ======================================================= */

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

    const updateMobileState = (event) => {
      const matches =
        typeof event?.matches === "boolean"
          ? event.matches
          : mediaQuery.matches;

      setIsMobile(matches);

      if (!matches) {
        setDropdownPos((previous) => ({
          ...previous,
          visible: false,
        }));
      }
    };

    updateMobileState();

    try {
      mediaQuery.addEventListener("change", updateMobileState);
    } catch {
      mediaQuery.addListener(updateMobileState);
    }

    return () => {
      try {
        mediaQuery.removeEventListener("change", updateMobileState);
      } catch {
        mediaQuery.removeListener(updateMobileState);
      }
    };
  }, []);

  /* =======================================================
     SEARCH
     ======================================================= */

  const submitSearch = useCallback(() => {
    const keyword = String(searchTerm || "").trim();

    if (!keyword) {
      searchInputRef.current?.focus();
      return;
    }

    navigate(`/search?q=${encodeURIComponent(keyword)}`);

    setSearchTerm("");

    searchInputRef.current?.blur();
  }, [navigate, searchTerm]);

  const handleSearchKeyDown = useCallback(
    (event) => {
      if (event.key !== "Enter") {
        return;
      }

      event.preventDefault();

      submitSearch();
    },
    [submitSearch],
  );

  /* =======================================================
     GENERAL NAVIGATION
     ======================================================= */

  const navigateTo = useCallback(
    (path) => {
      if (!path) {
        return;
      }

      navigate(path);
    },
    [navigate],
  );

  const navigateToCategory = useCallback(
    (slug) => {
      const normalizedSlug = String(slug || "")
        .trim()
        .toLowerCase();

      if (!normalizedSlug) {
        return;
      }

      navigate(`/category/${encodeURIComponent(normalizedSlug)}`);

      setActiveDropdown(null);

      setDropdownPos((previous) => ({
        ...previous,
        visible: false,
      }));
    },
    [navigate],
  );

  /* =======================================================
     DROPDOWN
     ======================================================= */

  const closeDropdown = useCallback(() => {
    setActiveDropdown(null);

    setDropdownPos((previous) => ({
      ...previous,
      visible: false,
    }));
  }, []);

  const handleDesktopMouseEnter = useCallback(
    (key) => {
      if (isMobile) {
        return;
      }

      setActiveDropdown(key);
    },
    [isMobile],
  );

  const handleDesktopMouseLeave = useCallback(() => {
    if (!isMobile) {
      setActiveDropdown(null);
    }
  }, [isMobile]);

  const updateMobileDropdownPosition = useCallback((key) => {
    const trigger = navItemRefs.current[key];

    const navbarBottom = navMenuRef.current;

    if (!trigger || !navbarBottom) {
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();

    const navRect = navbarBottom.getBoundingClientRect();

    const dropdownItems = dropdownData[key];

    if (!Array.isArray(dropdownItems)) {
      return;
    }

    const dropdownWidth = 220;

    const maxLeft = Math.max(8, window.innerWidth - dropdownWidth - 8);

    const left = Math.min(Math.max(8, triggerRect.left), maxLeft);

    const top = Math.max(0, navRect.bottom);

    setDropdownPos({
      top,
      left,
      visible: true,
    });
  }, []);

  const toggleDropdown = useCallback(
    (event, key) => {
      event?.preventDefault();

      const next = activeDropdown === key ? null : key;

      if (isMobile && next) {
        updateMobileDropdownPosition(next);
      } else {
        setDropdownPos((previous) => ({
          ...previous,
          visible: false,
        }));
      }

      setActiveDropdown(next);
    },
    [activeDropdown, isMobile, updateMobileDropdownPosition],
  );

  /* =======================================================
     KEEP MOBILE DROPDOWN ALIGNED
     ======================================================= */

  useEffect(() => {
    if (!isMobile || !activeDropdown) return undefined;

    const reposition = () => {
      updateMobileDropdownPosition(activeDropdown);
    };

    reposition();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);

    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [activeDropdown, isMobile, updateMobileDropdownPosition]);

  /* =======================================================
     OUTSIDE CLICK
     ======================================================= */

  useEffect(() => {
    const handlePointerDown = (event) => {
      const target = event.target;

      if (
        target instanceof Element &&
        target.closest(".mobile-dropdown-fixed")
      ) {
        return;
      }

      if (navMenuRef.current && !navMenuRef.current.contains(target)) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    document.addEventListener("touchstart", handlePointerDown, {
      passive: true,
    });

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);

      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [closeDropdown]);

  /* =======================================================
     ESCAPE KEY
     ======================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      if (isSidebarOpen) {
        setIsSidebarOpen(false);

        requestAnimationFrame(() => {
          sidebarTriggerRef.current?.focus();
        });

        return;
      }

      if (activeDropdown) {
        closeDropdown();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeDropdown, closeDropdown, isSidebarOpen]);

  /* =======================================================
     SIDEBAR
     ======================================================= */

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);

    closeDropdown();
  }, [closeDropdown]);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);

    requestAnimationFrame(() => {
      sidebarTriggerRef.current?.focus();
    });
  }, []);

  const handleMenuNavigation = useCallback(
    (path) => {
      if (!path) {
        return;
      }

      navigate(path);

      setIsSidebarOpen(false);
    },
    [navigate],
  );

  /* =======================================================
     BODY SCROLL LOCK
     ======================================================= */

  useEffect(() => {
    if (!isSidebarOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSidebarOpen]);

  /* =======================================================
     SIDEBAR FOCUS
     ======================================================= */

  useEffect(() => {
    if (!isSidebarOpen) {
      return;
    }

    requestAnimationFrame(() => {
      const firstFocusable = sidebarRef.current?.querySelector(
        "button, a, input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );

      firstFocusable?.focus();
    });
  }, [isSidebarOpen]);

  /* =======================================================
     SIDEBAR FOCUS TRAP
     ======================================================= */

  useEffect(() => {
    if (!isSidebarOpen) {
      return undefined;
    }

    const handleTabKey = (event) => {
      if (event.key !== "Tab") {
        return;
      }

      const container = sidebarRef.current;

      if (!container) {
        return;
      }

      const focusable = Array.from(
        container.querySelectorAll(
          "button, a, input, select, textarea, [tabindex]:not([tabindex='-1'])",
        ),
      ).filter(
        (element) =>
          !element.hasAttribute("disabled") &&
          element.getAttribute("aria-hidden") !== "true",
      );

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];

      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleTabKey);

    return () => {
      document.removeEventListener("keydown", handleTabKey);
    };
  }, [isSidebarOpen]);

  /* =======================================================
     PROFILE IMAGE
     ======================================================= */

  const profileImage = useMemo(() => getProfileImageUrl(user), [user]);
  const [profileImageFailed, setProfileImageFailed] = useState(false);

  useEffect(() => {
    setProfileImageFailed(false);
  }, [profileImage]);

  const hasProfileImage = Boolean(profileImage) && !profileImageFailed;

  /* =======================================================
     LOGOUT
     ======================================================= */

  const handleLogout = useCallback(() => {
    logout();

    setIsSidebarOpen(false);

    closeDropdown();

    navigate("/");
  }, [logout, closeDropdown, navigate]);

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <>
      {/* ===================================================
          NAVBAR
          =================================================== */}

      <nav className="navbar-container" aria-label="Navigasi utama">
        {/* =================================================
            TOP NAVBAR
            ================================================= */}

        <div className="navbar-top">
          <div className="logo-section">
            <button
              type="button"
              className="logo-circle"
              onClick={() => navigateTo("/")}
              aria-label="Ke beranda SukaMuda"
            >
              <img
                src={logoSukaMuda}
                alt="SukaMuda"
                width="110"
                height="110"
                decoding="async"
              />
            </button>
          </div>

          <div className="search-section">
            <div className="search-bar">
              <button
                type="button"
                className="search-icon"
                onClick={submitSearch}
                aria-label="Cari"
              >
                <FaSearch aria-hidden="true" />
              </button>

              <input
                ref={searchInputRef}
                type="search"
                inputMode="search"
                placeholder="Pencarian"
                aria-label="Pencarian"
                enterKeyHint="search"
                autoComplete="off"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
            </div>
          </div>

          <div className="nav-actions">
            {isLoggedIn ? (
              <div className="logged-in-icons">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => navigateTo("/notifications")}
                  aria-label="Notifikasi"
                >
                  <IoNotificationsSharp className="icon" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => navigateTo("/write")}
                  aria-label="Tulis artikel"
                >
                  <IoCreateOutline className="icon" aria-hidden="true" />
                </button>

                <button
                  ref={sidebarTriggerRef}
                  type="button"
                  className="icon-btn"
                  onClick={openSidebar}
                  aria-label="Buka menu pengguna"
                  aria-expanded={isSidebarOpen}
                  aria-controls="user-sidebar"
                >
                  <IoMenu className="icon menu-btn" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button
                  type="button"
                  className="btn-masuk"
                  onClick={() => navigateTo("/login")}
                >
                  Masuk
                </button>

                <button
                  type="button"
                  className="btn-daftar"
                  onClick={() => navigateTo("/register")}
                >
                  Daftar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            CATEGORY NAVBAR
            ================================================= */}

        <div className="navbar-bottom" ref={navMenuRef}>
          <div className="navbar-bottom-scroll">
            <ul className="nav-menu">
              {/* =================================================
                  NEWS
                  ================================================= */}

              <li
                ref={(element) => {
                  navItemRefs.current.news = element;
                }}
                className="nav-item"
                onMouseEnter={() => handleDesktopMouseEnter("news")}
                onMouseLeave={handleDesktopMouseLeave}
              >
                <button
                  type="button"
                  className="menu-header"
                  aria-expanded={activeDropdown === "news"}
                  aria-haspopup="menu"
                  aria-controls={
                    activeDropdown === "news"
                      ? isMobile
                        ? "news-mobile-dropdown"
                        : "news-dropdown"
                      : undefined
                  }
                  onClick={(event) => toggleDropdown(event, "news")}
                >
                  News
                  <span
                    className={`arrow ${
                      activeDropdown === "news" ? "up" : "down"
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {!isMobile && activeDropdown === "news" && (
                  <ul id="news-dropdown" className="dropdown-menu" role="menu">
                    {dropdownData.news.map((item) => (
                      <li key={item.slug} role="none">
                        <button
                          type="button"
                          role="menuitem"
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

              {/* =================================================
                  LIFESTYLE
                  ================================================= */}

              <li
                ref={(element) => {
                  navItemRefs.current.lifestyle = element;
                }}
                className="nav-item"
                onMouseEnter={() => handleDesktopMouseEnter("lifestyle")}
                onMouseLeave={handleDesktopMouseLeave}
              >
                <button
                  type="button"
                  className="menu-header"
                  aria-expanded={activeDropdown === "lifestyle"}
                  aria-haspopup="menu"
                  aria-controls={
                    activeDropdown === "lifestyle"
                      ? isMobile
                        ? "lifestyle-mobile-dropdown"
                        : "lifestyle-dropdown"
                      : undefined
                  }
                  onClick={(event) => toggleDropdown(event, "lifestyle")}
                >
                  Lifestyle
                  <span
                    className={`arrow ${
                      activeDropdown === "lifestyle" ? "up" : "down"
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {!isMobile && activeDropdown === "lifestyle" && (
                  <ul
                    id="lifestyle-dropdown"
                    className="dropdown-menu"
                    role="menu"
                  >
                    {dropdownData.lifestyle.map((item) => (
                      <li key={item.slug} role="none">
                        <button
                          type="button"
                          role="menuitem"
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

              {/* =================================================
                  OTHER CATEGORIES
                  ================================================= */}

              {mainCategories.map((item) => (
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

        {/* =================================================
            MOBILE DROPDOWN
            ================================================= */}

        {isMobile && dropdownPos.visible && activeDropdown && (
          <ul
            id={`${activeDropdown}-mobile-dropdown`}
            className="mobile-dropdown-fixed"
            style={{
              top: `${dropdownPos.top}px`,
              left: `${dropdownPos.left}px`,
            }}
            role="menu"
            aria-label={
              activeDropdown === "news" ? "Kategori News" : "Kategori Lifestyle"
            }
          >
            {dropdownData[activeDropdown]?.map((item) => (
              <li key={item.slug} role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => navigateToCategory(item.slug)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>

      {/* =====================================================
          SIDEBAR OVERLAY
          ===================================================== */}

      <div
        className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeSidebar();
          }
        }}
        aria-hidden={!isSidebarOpen}
      >
        {/* =================================================
            SIDEBAR
            ================================================= */}

        <aside
          id="user-sidebar"
          className={`sidebar-container ${isSidebarOpen ? "open" : ""}`}
          ref={sidebarRef}
          role="dialog"
          aria-modal={isSidebarOpen}
          aria-labelledby="sidebar-profile-name"
          tabIndex={-1}
          onClick={(event) => event.stopPropagation()}
        >
          {/* =================================================
              CLOSE
              ================================================= */}

          <div className="sidebar-close-area">
            <button
              type="button"
              className="sidebar-close-btn"
              onClick={closeSidebar}
              aria-label="Tutup menu"
            >
              <span className="x-line x-line-1" aria-hidden="true" />

              <span className="x-line x-line-2" aria-hidden="true" />
            </button>
          </div>

          <div className="sidebar-top-accent" aria-hidden="true" />

          {/* =================================================
              PROFILE HEADER
              ================================================= */}

          <div className="sidebar-profile-hero">
            <div className="profile-glow" aria-hidden="true" />

            <div className="profile-avatar-ring">
              <div className="profile-avatar-inner">
                {hasProfileImage ? (
                  <img
                    src={profileImage}
                    alt={
                      user?.name ? `Foto profil ${user.name}` : "Foto profil"
                    }
                    className="profile-avatar-img"
                    width="80"
                    height="80"
                    decoding="async"
                    loading="lazy"
                    onError={() => setProfileImageFailed(true)}
                  />
                ) : null}

                <span
                  className="profile-avatar-fallback profile-avatar-initials"
                  style={{
                    display: hasProfileImage ? "none" : "inline-flex",
                  }}
                  aria-hidden={hasProfileImage}
                >
                  {getInitials(user?.name)}
                </span>
              </div>
            </div>

            <div className="profile-text-group">
              <h2 id="sidebar-profile-name" className="profile-name">
                {user?.name || "User"}
              </h2>

              <div
                className={`profile-role-badge ${
                  user?.role === "admin" ? "role-admin" : "role-user"
                }`}
              >
                <span className="role-dot" aria-hidden="true" />

                {user?.role === "admin" ? "Administrator" : "Anggota"}
              </div>
            </div>

            <div className="profile-deco-line" aria-hidden="true">
              <span className="deco-diamond" />

              <div className="deco-line-track" />

              <span className="deco-diamond" />
            </div>
          </div>

          {/* =================================================
              SIDEBAR MENU
              ================================================= */}

          <div className="sidebar-menu-area">
            <ul className="sidebar-menu-list">
              {/* =================================================
                  ADMIN
                  ================================================= */}

              {isLoggedIn && user?.role === "admin" && (
                <li>
                  <button
                    type="button"
                    className="sidebar-menu-item admin-special"
                    onClick={() => handleMenuNavigation("/admin")}
                  >
                    <span className="menu-item-icon">
                      <IoTrophyOutline aria-hidden="true" />
                    </span>

                    <span className="menu-item-text">Dashboard Admin</span>

                    <span className="menu-item-arrow" aria-hidden="true">
                      ›
                    </span>
                  </button>
                </li>
              )}

              {/* =================================================
                  PROFILE
                  ================================================= */}

              <li>
                <button
                  type="button"
                  className="sidebar-menu-item"
                  onClick={() => handleMenuNavigation("/profile")}
                >
                  <span className="menu-item-icon">
                    <IoPersonOutline aria-hidden="true" />
                  </span>

                  <span className="menu-item-text">Profil Saya</span>

                  <span className="menu-item-arrow" aria-hidden="true">
                    ›
                  </span>
                </button>
              </li>

              {/* =================================================
                  ABOUT
                  ================================================= */}

              <li>
                <button
                  type="button"
                  className="sidebar-menu-item"
                  onClick={() => handleMenuNavigation("/about")}
                >
                  <span className="menu-item-icon">
                    <IoInformationCircleOutline aria-hidden="true" />
                  </span>

                  <span className="menu-item-text">About</span>

                  <span className="menu-item-arrow" aria-hidden="true">
                    ›
                  </span>
                </button>
              </li>

              {/* =================================================
                  TERMS
                  ================================================= */}

              <li>
                <button
                  type="button"
                  className="sidebar-menu-item"
                  onClick={() => handleMenuNavigation("/terms")}
                >
                  <span className="menu-item-icon">
                    <IoDocumentTextOutline aria-hidden="true" />
                  </span>

                  <span className="menu-item-text">Syarat &amp; Ketentuan</span>

                  <span className="menu-item-arrow" aria-hidden="true">
                    ›
                  </span>
                </button>
              </li>

              {/* =================================================
                  RULES
                  ================================================= */}

              <li>
                <button
                  type="button"
                  className="sidebar-menu-item"
                  onClick={() => handleMenuNavigation("/rules")}
                >
                  <span className="menu-item-icon">
                    <IoShieldCheckmarkOutline aria-hidden="true" />
                  </span>

                  <span className="menu-item-text">Pedoman Editorial</span>

                  <span className="menu-item-arrow" aria-hidden="true">
                    ›
                  </span>
                </button>
              </li>

              {/* =================================================
                  PRIVACY
                  ================================================= */}

              <li>
                <button
                  type="button"
                  className="sidebar-menu-item"
                  onClick={() => handleMenuNavigation("/privacy")}
                >
                  <span className="menu-item-icon">
                    <IoShieldCheckmarkOutline aria-hidden="true" />
                  </span>

                  <span className="menu-item-text">Privacy & Policy</span>

                  <span className="menu-item-arrow" aria-hidden="true">
                    ›
                  </span>
                </button>
              </li>

              {/* =================================================
                  HELP
                  ================================================= */}

              <li>
                <button
                  type="button"
                  className="sidebar-menu-item"
                  onClick={() => handleMenuNavigation("/help")}
                >
                  <span className="menu-item-icon">
                    <IoHelpCircleOutline aria-hidden="true" />
                  </span>

                  <span className="menu-item-text">Bantuan</span>

                  <span className="menu-item-arrow" aria-hidden="true">
                    ›
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {/* =================================================
              LOGOUT
              ================================================= */}

          <div className="sidebar-premium-footer">
            <div className="footer-deco-line" aria-hidden="true" />

            <button
              type="button"
              className="premium-logout-btn"
              onClick={handleLogout}
            >
              <span className="logout-icon-glow">
                <IoLogOutOutline aria-hidden="true" />
              </span>

              <span className="logout-text">Keluar</span>
            </button>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Navbar;
