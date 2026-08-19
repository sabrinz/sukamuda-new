import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './Help.css';

const Help = () => {
  const navigate = useNavigate();

  const [visible, setVisible] = useState(new Set());
  const refs = useRef([]);

  const emailTujuan = 'bantuan@sukamuda50.com';
  const subjek = 'Bantuan Layanan SukaMuda';

  const isiPesan =
    'Halo Tim SukaMuda,\n\nSaya butuh bantuan/ingin bertanya mengenai:\n\n[Tulis pesanmu di sini...]';

  const gmailLink =
    'https://mail.google.com/mail/?view=cm&fs=1&to=' +
    encodeURIComponent(emailTujuan) +
    '&su=' +
    encodeURIComponent(subjek) +
    '&body=' +
    encodeURIComponent(isiPesan);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible((prev) => {
              const next = new Set(prev);
              next.add(entry.target.id);
              return next;
            });
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    refs.current.forEach((element) => {
      if (element) {
        io.observe(element);
      }
    });

    return () => io.disconnect();
  }, []);

  const reg = (element, id) => {
    if (
      element &&
      !refs.current.find((item) => item?.id === id)
    ) {
      refs.current.push(element);
    }
  };

  const on = (id) => visible.has(id);

  return (
    <div className="hl-root">
      <Helmet>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7608424206122269"
          crossOrigin="anonymous"
        />

        <title>Pusat Bantuan - Sukamuda</title>

        <link
          rel="canonical"
          href="https://sukamuda.co.id/help"
        />

        <meta
          name="description"
          content="Punya pertanyaan atau kendala seputar layanan Sukamuda? Hubungi pusat bantuan tim support kami di sini."
        />

        <meta
          name="robots"
          content="index, follow"
        />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: 'Pusat Bantuan dan Kontak - Sukamuda',
            description:
              'Punya pertanyaan atau kendala seputar layanan Sukamuda? Hubungi pusat bantuan tim support kami di sini.',
            url: 'https://sukamuda.co.id/help',
            mainEntity: {
              '@type': 'Organization',
              name: 'Sukamuda',
              url: 'https://sukamuda.co.id',
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'bantuan@sukamuda50.com',
                contactType: 'customer support',
              },
            },
            isPartOf: {
              '@type': 'WebSite',
              name: 'Sukamuda',
              url: 'https://sukamuda.co.id',
            },
            inLanguage: 'id-ID',
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Beranda',
                item: 'https://sukamuda.co.id',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Bantuan',
                item: 'https://sukamuda.co.id/help',
              },
            ],
          })}
        </script>
      </Helmet>

      <div
        className="hl-grid-bg"
        aria-hidden="true"
      />

      <div className="hl-wrap">

        {/* NAV */}
        <nav
          className={`hl-nav ${
            on('nav') ? 'hl-on' : ''
          }`}
          id="nav"
          ref={(element) => reg(element, 'nav')}
          aria-label="Navigasi Utama"
        >
          <span className="hl-logo">
            sukamuda
          </span>

          <div className="hl-nav-right">
            <span
              className="hl-nav-line"
              aria-hidden="true"
            />

            <span className="hl-nav-tag">
              Support
            </span>
          </div>
        </nav>

        <main
          className="hl-main"
          id="main-content"
        >

          {/* HERO */}
          <header
            className={`hl-hero ${
              on('hero') ? 'hl-on' : ''
            }`}
            id="hero"
            ref={(element) => reg(element, 'hero')}
          >
            <div className="hl-hero-top">
              <div className="hl-hero-badge">
                <span
                  className="hl-badge-dot"
                  aria-hidden="true"
                />

                <span>
                  Pusat Bantuan
                </span>
              </div>
            </div>

            <div className="hl-hero-body">
              <h1 className="hl-hero-title">
                <span className="hl-h1-line">
                  Butuh
                </span>

                <span className="hl-h1-line hl-h1-accent">
                  Bantuan?
                </span>
              </h1>

              <p className="hl-hero-desc">
                Punya pertanyaan atau kendala
                seputar layanan Sukamuda?
                Tim kami siap membantu.
              </p>
            </div>

            <div className="hl-hero-bottom">
              <div
                className="hl-hero-bar"
                aria-hidden="true"
              />
            </div>
          </header>

          {/* 01 KONTAK */}
          <section
            className={`hl-sec ${
              on('contact') ? 'hl-on' : ''
            }`}
            id="contact"
            ref={(element) => reg(element, 'contact')}
            aria-labelledby="label-contact"
          >
            <div
              className="hl-label-row"
              id="label-contact"
            >
              <span className="hl-label">
                01
              </span>

              <span className="hl-label-text">
                Hubungi Kami
              </span>
            </div>

            <a
              href={gmailLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hl-email-card"
              aria-label="Hubungi melalui email bantuan@sukamuda50.com"
            >
              <div
                className="hl-email-icon"
                aria-hidden="true"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="2"
                    y="4"
                    width="20"
                    height="16"
                    rx="2"
                  />
                  <path d="M22 7l-10 7L2 7" />
                </svg>
              </div>

              <div className="hl-email-body">
                <h2>
                  Hubungi via Email
                </h2>

                <p>
                  bantuan@sukamuda50.com
                </p>
              </div>

              <div
                className="hl-email-arrow"
                aria-hidden="true"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line
                    x1="7"
                    y1="17"
                    x2="17"
                    y2="7"
                  />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </div>
            </a>
          </section>

          {/* 02 INFORMASI */}
          <section
            className={`hl-sec ${
              on('info') ? 'hl-on' : ''
            }`}
            id="info"
            ref={(element) => reg(element, 'info')}
            aria-labelledby="label-info"
          >
            <div
              className="hl-label-row"
              id="label-info"
            >
              <span className="hl-label">
                02
              </span>

              <span className="hl-label-text">
                Informasi Bantuan
              </span>
            </div>

            <div className="hl-info-grid">

              <article
                className="hl-info-card"
                style={{
                  transitionDelay: '0ms',
                }}
              >
                <div
                  className="hl-info-icon"
                  aria-hidden="true"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                    />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>

                <h3>
                  Waktu Respons
                </h3>

                <p>
                  Kami akan merespons dalam
                  1×24 jam kerja.
                </p>
              </article>

              <article
                className="hl-info-card"
                style={{
                  transitionDelay: '70ms',
                }}
              >
                <div
                  className="hl-info-icon"
                  aria-hidden="true"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>

                <h3>
                  Sampaikan Detail
                </h3>

                <p>
                  Sertakan informasi sebanyak
                  mungkin agar kami dapat membantu
                  lebih cepat.
                </p>
              </article>

              <article
                className="hl-info-card hl-info-wide"
                style={{
                  transitionDelay: '140ms',
                }}
              >
                <div
                  className="hl-info-icon"
                  aria-hidden="true"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>

                <h3>
                  Jelaskan Kendalamu
                </h3>

                <p>
                  Ceritakan kendala atau pertanyaan
                  secara jelas agar tim kami dapat
                  memahami masalah dan memberikan
                  bantuan yang lebih tepat.
                </p>
              </article>

            </div>
          </section>

          {/* 03 FAQ */}
          <section
            className={`hl-sec ${
              on('faq') ? 'hl-on' : ''
            }`}
            id="faq"
            ref={(element) => reg(element, 'faq')}
            aria-labelledby="label-faq"
          >
            <div
              className="hl-label-row"
              id="label-faq"
            >
              <span className="hl-label">
                03
              </span>

              <span className="hl-label-text">
                Pertanyaan Umum
              </span>
            </div>

            <article className="hl-tease-card">
              <div
                className="hl-tease-icon"
                aria-hidden="true"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                  />

                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />

                  <line
                    x1="12"
                    y1="17"
                    x2="12.01"
                    y2="17"
                  />
                </svg>
              </div>

              <div className="hl-tease-body">
                <h3>
                  Pertanyaan yang Sering
                  Ditanyakan
                </h3>

                <p>
                  Mungkin jawaban yang kamu cari
                  sudah tersedia di halaman FAQ.
                </p>
              </div>

              <button
                type="button"
                className="hl-tease-btn"
                onClick={() => navigate('/faq')}
              >
                Lihat FAQ

                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line
                    x1="5"
                    y1="12"
                    x2="19"
                    y2="12"
                  />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </article>
          </section>

          {/* CTA */}
          <section
            className={`hl-sec ${
              on('cta') ? 'hl-on' : ''
            }`}
            id="cta"
            ref={(element) => reg(element, 'cta')}
            aria-label="Call to Action"
          >
            <div className="hl-cta">
              <div
                className="hl-cta-accent"
                aria-hidden="true"
              />

              <h2>
                Masih Butuh
                <br />
                Bantuan?
              </h2>

              <p>
                Hubungi tim Sukamuda melalui
                email dan jelaskan kebutuhanmu.
                Kami akan membantu sebaik mungkin.
              </p>

              <div className="hl-cta-btns">
                <a
                  href={gmailLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hl-btn-primary"
                >
                  Kirim Email

                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line
                      x1="5"
                      y1="12"
                      x2="19"
                      y2="12"
                    />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>

                <button
                  type="button"
                  className="hl-btn-secondary"
                  onClick={() => navigate('/faq')}
                >
                  Pelajari FAQ
                </button>
              </div>

              <span className="hl-cta-note">
                <span
                  className="hl-cta-dot"
                  aria-hidden="true"
                />

                Tim Sukamuda siap membantu
              </span>
            </div>
          </section>

        </main>

        {/* FOOTER */}
        <footer className="hl-foot">
          <div
            className="hl-foot-line"
            aria-hidden="true"
          />

          <div className="hl-foot-in">
            <span className="hl-foot-logo">
              sukamuda
            </span>

            <span className="hl-foot-c">
              © {new Date().getFullYear()} —
              Dibuat untuk generasi muda Indonesia
            </span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Help;