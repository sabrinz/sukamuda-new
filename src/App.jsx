import React, { Suspense, lazy, useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Lazy load pages (load saat dibutuhkan)
const Home = lazy(() => import("./pages/Home"));
const Category = lazy(() => import("./pages/Category"));
const ArticleDetail = lazy(() => import("./pages/ArticleDetail"));
const VideoReelsPage = lazy(() => import("./pages/VideoReelsPage"));
const Search = lazy(() => import("./pages/Search"));
const About = lazy(() => import("./pages/About"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Register = lazy(() => import("./pages/Register"));
const VerifyOtp = lazy(() => import("./pages/VerifyOtp"));
const Interests = lazy(() => import("./pages/Interests"));
const Success = lazy(() => import("./pages/Success"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Write = lazy(() => import("./pages/Write"));
const WriteSuccess = lazy(() => import("./pages/WriteSuccess"));
const Rules = lazy(() => import("./pages/Rules"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Help = lazy(() => import("./pages/Help"));
const FAQ = lazy(() => import("./pages/FAQ"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  const location = useLocation();

  // Cegah dobel tracking di dev (React.StrictMode)
  const lastPathRef = useRef(null);

  // GA4 SPA pageview tracking + scroll reset
  useEffect(() => {
    const pagePath = location.pathname + location.search;

    // cegah duplikat event untuk path yang sama
    if (lastPathRef.current === pagePath) return;
    lastPathRef.current = pagePath;

    // Scroll ke atas tiap pindah halaman
    window.scrollTo(0, 0);

    // aman: kalau gtag belum ada, jangan error
    if (typeof window.gtag !== "function") return;

    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location]);

  return (
    <AuthProvider>
      <Helmet>
        <title>Sukamuda - Media Informasi dan Kreativitas Anak Muda</title>
        <meta
          name="description"
          content="Sukamuda adalah media informasi dan ruang kreativitas anak muda Indonesia."
        />
      </Helmet>

      <div className="app-container">
        <Navbar />

        {/* FIX A11y: main landmark */}
        <main id="main-content" className="app-main">
          <Suspense fallback={<div className="loading-screen" role="status" aria-live="polite">Memuat...</div>}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/category/:slug" element={<Category />} />
              <Route path="/article/:slug" element={<ArticleDetail />} />
              <Route path="/video-reels" element={<VideoReelsPage />} />
              <Route path="/search" element={<Search />} />
              <Route path="/about" element={<About />} />
              <Route path="/rules" element={<Rules />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/help" element={<Help />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/user/:userId" element={<PublicProfile />} />

              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/interests" element={<Interests />} />
              <Route path="/success" element={<Success />} />

              {/* Protected */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/write"
                element={
                  <ProtectedRoute>
                    <Write />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/write-success"
                element={
                  <ProtectedRoute>
                    <WriteSuccess />
                  </ProtectedRoute>
                }
              />

              {/* 404 - harus paling bawah */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;