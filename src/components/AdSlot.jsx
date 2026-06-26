import React, { useEffect } from 'react';
import './AdSlot.css';

// ============================================================
// CARA PAKAI:
//
// MODE 1 - Placeholder (kotak kosong, buat development):
//   <AdSlot type="horizontal" mode="placeholder" label="Iklan" />
//   <AdSlot type="vertical" mode="placeholder" label="Iklan" />
//
// MODE 2 - Banner gambar sendiri:
//   <AdSlot type="horizontal" mode="image"
//     imageUrl="https://urlgambarmu.com/banner.jpg"
//     linkUrl="https://linkiklan.com"
//   />
//
// MODE 3 - Google AdSense:
//   <AdSlot type="horizontal" mode="adsense"
//     adClient="ca-pub-XXXXXXXXXX"
//     adSlot="XXXXXXXXXX"
//   />
// ============================================================

const AdSlot = ({
  type = 'horizontal',
  mode = 'placeholder',  // 'placeholder' | 'image' | 'adsense'
  label = 'Iklan',
  imageUrl = '',
  linkUrl = '#',
  adClient = '',   
  adSlot = '',     
}) => {

  const adClass = type === 'vertical' ? 'ad-slot-box vertical' : 'ad-slot-box horizontal';

  // Aktifkan AdSense saat komponen mount
  useEffect(() => {
    if (mode === 'adsense') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [mode]);

  // MODE 1: Placeholder (kotak kosong)
  if (mode === 'placeholder') {
    return (
      <div className={adClass}>
        {label}
      </div>
    );
  }

  // MODE 2: Banner gambar sendiri
  if (mode === 'image') {
    return (
      <div className={adClass} style={{ padding: 0, border: 'none' }}>
        <a href={linkUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%' }}>
          <img
            src={imageUrl}
            alt="Iklan"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', display: 'block' }}
          />
        </a>
      </div>
    );
  }

  // MODE 3: Google AdSense
  if (mode === 'adsense') {
    return (
      <div className={adClass} style={{ padding: 0, border: 'none', overflow: 'hidden' }}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: '100%' }}
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

export default AdSlot;