import React, { useEffect, useRef } from 'react';
import './AdSlot.css';

const AdSlot = ({
  type = 'horizontal',
  mode = 'placeholder',
  label = 'Iklan',
  imageUrl = '',
  linkUrl = '#',
  adClient = '',
  adSlot = '',
}) => {
  const imgRef = useRef(null);
  
  // Penanda agar iklan mutlak hanya di-push 1x
  const isPushed = useRef(false);

  // Otomatis ubah jadi placeholder kalau dijalankan di localhost
  const isLocal = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  const activeMode = isLocal ? 'placeholder' : mode;

  // Push iklan
  useEffect(() => {
    // Hanya eksekusi jika mode adsense dan belum pernah di-push
    if (activeMode === 'adsense' && !isPushed.current) {
      try {
        isPushed.current = true;
        
        // TAMBAHAN: Beri jeda 200ms agar DOM & CSS selesai me-render ukuran layout
        setTimeout(() => {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }, 200);
        
      } catch (e) {
        console.error('AdSense push error:', e);
      }
    }
  }, [activeMode]);

  // Hapus shimmer saat gambar sudah load (untuk mode image)
  const handleImageLoad = () => {
    if (imgRef.current && imgRef.current.parentElement) {
      imgRef.current.parentElement.classList.add('imgLoaded');
    }
  };

  const sizeLabel = type === 'horizontal' ? '728 × 90' : '160 × 250';

  // ── 1. Tampilan Placeholder (Otomatis saat di Localhost) ──
  if (activeMode === 'placeholder') {
    return (
      <div className={`ad-slot-box ${type} ad-placeholder`}>
        <span className="ad-placeholder-icon">◻</span>
        <span className="ad-placeholder-label">{label}</span>
        <span className="ad-placeholder-size">{sizeLabel}</span>
      </div>
    );
  }

  // ── 2. Tampilan Iklan Gambar Custom ──
  if (activeMode === 'image') {
    return (
      <div className={`ad-slot-box ${type} ad-image`}>
        <a href={linkUrl} target="_blank" rel="noopener noreferrer">
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Iklan"
            loading="lazy"
            onLoad={handleImageLoad}
          />
        </a>
      </div>
    );
  }

  // ── 3. Tampilan Google AdSense ──
  if (activeMode === 'adsense') {
    return (
      // TAMBAHAN: Paksa ukuran minimum secara inline agar lebarnya tidak terdeteksi 0
      <div 
        className={`ad-slot-box ${type} ad-adsense`} 
        style={{ width: '100%', minWidth: '200px', minHeight: '50px', overflow: 'hidden' }}
      >
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return null;
};

// Bungkus dengan React.memo untuk mencegah re-render saat halaman di-scroll
export default React.memo(AdSlot);