import React, { useEffect, useRef, useState } from 'react';
import './AdSlot.css';

/**
 * AdSlot
 *
 * Perubahan penting dibanding versi lama:
 * 1. Iklan TIDAK lagi di-push setelah jeda 200ms secara buta.
 *    Kita menunggu sampai elemen <ins> benar-benar punya lebar > 0.
 *    Inilah penyebab galat "No slot size for availableWidth=0".
 * 2. Menggunakan ResizeObserver + IntersectionObserver, jadi iklan hanya
 *    dipasang saat kotaknya terlihat DAN sudah punya ukuran nyata.
 * 3. Kalau setelah 10 detik lebarnya tetap 0 (misalnya slot disembunyikan
 *    lewat CSS di layar kecil), kita menyerah dengan tenang tanpa push,
 *    sehingga tidak ada galat di konsol.
 * 4. Penanda isPushed baru diset SETELAH push berhasil, bukan sebelumnya.
 */
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

  // Wadah pembungkus slot AdSense
  const boxRef = useRef(null);
  // Elemen <ins> yang diukur AdSense
  const insRef = useRef(null);
  // Penanda agar iklan mutlak hanya di-push 1x
  const isPushed = useRef(false);

  // Otomatis ubah jadi placeholder kalau dijalankan di localhost
  const isLocal =
    typeof window !== 'undefined' &&
    ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  const activeMode = isLocal ? 'placeholder' : mode;

  // Dipakai hanya untuk memaksa render ulang kalau nanti dibutuhkan
  const [, setSiap] = useState(false);

  useEffect(() => {
    if (activeMode !== 'adsense') return;
    if (isPushed.current) return;
    if (typeof window === 'undefined') return;

    let dibatalkan = false;
    let resizeObserver = null;
    let intersectionObserver = null;
    let timerMenyerah = null;
    let timerCoba = null;

    const bersihkan = () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();
      if (timerMenyerah) clearTimeout(timerMenyerah);
      if (timerCoba) clearTimeout(timerCoba);
    };

    // Cek apakah elemen benar-benar punya lebar nyata
    const lebarNyata = () => {
      const el = insRef.current || boxRef.current;
      if (!el) return 0;
      // offsetParent null berarti elemen (atau induknya) display:none
      if (el.offsetParent === null) return 0;
      return el.getBoundingClientRect().width || 0;
    };

    const cobaPush = () => {
      if (dibatalkan || isPushed.current) return;

      const lebar = lebarNyata();

      // Belum punya ukuran. Jangan push, tunggu observer memanggil lagi.
      if (lebar < 50) return;

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isPushed.current = true;
        bersihkan();
        setSiap(true);
      } catch (e) {
        // Tandai tetap terpush supaya tidak mengulang galat berkali-kali
        isPushed.current = true;
        bersihkan();
        if (import.meta.env && import.meta.env.DEV) {
          console.error('AdSense push error:', e);
        }
      }
    };

    const mulaiMengamati = () => {
      const el = insRef.current || boxRef.current;
      if (!el) return;

      // 1. Pantau perubahan ukuran
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => cobaPush());
        resizeObserver.observe(el);
      }

      // 2. Pantau saat slot masuk ke layar
      if (typeof IntersectionObserver !== 'undefined') {
        intersectionObserver = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) cobaPush();
          },
          { rootMargin: '200px' }
        );
        intersectionObserver.observe(el);
      }

      // 3. Coba sekali langsung, siapa tahu sudah siap
      cobaPush();

      // 4. Jaring pengaman untuk browser tanpa observer
      if (
        typeof ResizeObserver === 'undefined' ||
        typeof IntersectionObserver === 'undefined'
      ) {
        timerCoba = setInterval(cobaPush, 500);
      }

      // 5. Kalau 10 detik tetap nol, berhenti diam-diam tanpa galat
      timerMenyerah = setTimeout(() => {
        if (!isPushed.current) bersihkan();
      }, 10000);
    };

    // Tunggu satu frame agar tata letak selesai dihitung browser
    const raf = requestAnimationFrame(mulaiMengamati);

    return () => {
      dibatalkan = true;
      cancelAnimationFrame(raf);
      bersihkan();
      if (timerCoba) clearInterval(timerCoba);
    };
  }, [activeMode]);

  // Hapus shimmer saat gambar sudah load (untuk mode image)
  const handleImageLoad = () => {
    if (imgRef.current && imgRef.current.parentElement) {
      imgRef.current.parentElement.classList.add('imgLoaded');
    }
  };

  const sizeLabel = type === 'horizontal' ? '728 \u00d7 90' : '160 \u00d7 250';

  // ── 1. Tampilan Placeholder (Otomatis saat di Localhost) ──
  if (activeMode === 'placeholder') {
    return (
      <div className={`ad-slot-box ${type} ad-placeholder`}>
        <span className="ad-placeholder-icon" aria-hidden="true">◻</span>
        <span className="ad-placeholder-label">{label}</span>
        <span className="ad-placeholder-size">{sizeLabel}</span>
      </div>
    );
  }

  // ── 2. Tampilan Iklan Gambar Custom ──
  if (activeMode === 'image') {
    return (
      <div className={`ad-slot-box ${type} ad-image`}>
        <a href={linkUrl} target="_blank" rel="noopener noreferrer sponsored">
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
      <div
        ref={boxRef}
        className={`ad-slot-box ${type} ad-adsense`}
        style={{
          width: '100%',
          minWidth: '250px',
          minHeight: '90px',
          overflow: 'hidden',
        }}
      >
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minWidth: '250px' }}
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