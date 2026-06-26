import React from 'react';
import './Help.css';

export default function Help() {
  // Setup teks otomatis
  const emailTujuan = "bantuan@sukamuda50.com";
  const subjek = "Bantuan Layanan SukaMuda";
  const isiPesan = "Halo Tim SukaMuda,\n\nSaya butuh bantuan/ingin bertanya mengenai:\n\n[Tulis pesanmu di sini...]";

  // Encode URL agar spasi dan enter terbaca dengan benar di link
  const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailTujuan}&su=${encodeURIComponent(subjek)}&body=${encodeURIComponent(isiPesan)}`;

  return (
    <div className="help-section">
      <div className="help-content">
        <h3 className="help-title">Butuh Bantuan?</h3>
        <p className="help-description">
          Punya pertanyaan atau kendala seputar layanan SukaMuda? Tim kami siap membantu.
        </p>
        
        <a 
          href={gmailLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="help-link"
        >
          {/* Ikon Amplop */}
          <svg 
            className="help-envelope-icon" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
            />
          </svg>
          bantuan@sukamuda50.com
        </a>
      </div>
    </div>
  );
}