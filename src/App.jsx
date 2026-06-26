import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; 
import Home from './pages/Home';
import Category from './pages/Category';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp'; 
import ForgotPassword from './pages/ForgotPassword';
import Interests from './pages/Interests'; 
import Success from './pages/Success';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Write from './pages/Write';
import WriteSuccess from './pages/WriteSuccess.jsx';
import Rules from './pages/Rules';
import Terms from './pages/Terms';
import Help from './pages/Help'; 
import ArticleDetail from './pages/ArticleDetail';
import FAQ from './pages/FAQ.jsx';
import PublicProfile from './pages/PublicProfile';
import VideoReelsPage from './pages/VideoReelsPage';

// IMPORT HALAMAN ADMIN & SEARCH
import AdminDashboard from './pages/AdminDashboard';
import Search from './pages/Search';

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <Navbar /> 

        <Routes> 
          <Route path="/" element={<Home />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/article/:slug" element={<ArticleDetail />} />
          <Route path="/video-reels" element={<VideoReelsPage />} />
          <Route path="/search" element={<Search />} />
          <Route path="/about" element={<About />} />
          
          {/* ROUTE LOGIN & FORGOT PASSWORD */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} /> 
          <Route path="/interests" element={<Interests />} />
          <Route path="/success" element={<Success />} />
          
          {/* PROTECTED ROUTES (Hanya untuk yang sudah login) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/user/:userId" element={<PublicProfile />} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/write" element={<ProtectedRoute><Write /></ProtectedRoute>} />
          <Route path="/write-success" element={<ProtectedRoute><WriteSuccess /></ProtectedRoute>} />
          
          <Route path="/rules" element={<Rules />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/help" element={<Help />} />
          <Route path="/faq" element={<FAQ />} />
        </Routes>

        <Footer /> 
      </div>
    </AuthProvider>
  );
}

export default App;