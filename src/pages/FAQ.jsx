import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import './FAQ.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [visible, setVisible] = useState(new Set());
  const refs = useRef([]);

  const faqData = [
    {
      q: 'Apa itu SukaMuda?',
      a: 'SukaMuda adalah platform media informasi dan wadah kreativitas bagi anak muda untuk berbagi berita, gaya hidup, hingga hobi.',
    },
    {
      q: 'Siapa saja yang boleh membaca/menggunakan web ini?',
      a: 'Siapa saja! Walaupun fokusnya untuk anak muda (pelajar/mahasiswa), konten kami terbuka untuk umum.',
    },
    {
      q: 'Bagaimana cara saya mengirim artikel?',
      a: 'Kamu harus masuk (Login) terlebih dahulu, klik menu Write, isi kategori, judul, dan konten tulisanmu, lalu tekan kirim.',
    },
    {
      q: 'Kategori apa saja yang tersedia?',
      a: 'Kami memiliki beragam kategori, yaitu Edukasi, Teknologi, Fashion & Kecantikan, Opini, Inspirasi, dan Gaya Hidup.',
    },
    {
      q: 'Bolehkah saya menyertakan gambar di artikel?',
      a: 'Tentu! Kamu wajib mengunggah thumbnail dan bisa menambahkan gambar di dalam isi artikel melalui editor yang tersedia.',
    },
    {
      q: 'Apakah tulisan saya langsung terbit?',
      a: 'Setiap tulisan akan masuk ke sistem kami terlebih dahulu untuk dipastikan tidak melanggar aturan komunitas.',
    },
    {
      q: 'Apakah mendaftar di SukaMuda gratis?',
      a: 'Ya, pendaftaran akun di SukaMuda 100% gratis.',
    },
    {
      q: 'Bagaimana jika saya lupa kata sandi?',
      a: 'Gunakan fitur "Lupa Kata Sandi" di halaman login — kami akan mengirim kode OTP ke email kamu untuk mengatur ulang kata sandi.',
    },
    {
      q: 'Apakah data pribadi saya aman?',
      a: 'Kami menjaga privasi pengguna dengan ketat sesuai dengan kebijakan Privacy Policy kami.',
    },
    {
      q: 'Hal apa saja yang dilarang dalam penulisan artikel?',
      a: 'Dilarang keras memposting konten yang mengandung SARA, ujaran kebencian, pornografi, atau berita bohong (hoax).',
    },
    {
      q: 'Bagaimana jika saya melihat konten yang tidak pantas?',
      a: 'Kamu bisa melaporkannya kepada admin melalui menu Bantuan agar segera kami tindak lanjuti.',
    },
  ];

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
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    refs.current.forEach((element) => {
      if (element) io.observe(element);
    });

    return () => io.disconnect();
  }, []);

  const reg = (element, id) => {
    if (
      element &&
      !refs.current.some((ref) => ref?.id === id)
    ) {
      refs.current.push(element);
    }
  };

  const on = (id) => visible.has(id);

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="fq-root">
      <Helmet>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7608424206122269"
          crossOrigin="anonymous"
        ></script>

        <title>
          Frequently Asked Questions (FAQ) - Sukamuda
        </title>

        <link
          rel="canonical"
          href="https://sukamuda.co.id/faq"
        />

        <meta
          name="description"
          content="Temukan jawaban untuk pertanyaan yang paling sering ditanyakan seputar platform digital Sukamuda."
        />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqData.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.a,
              },
            })),
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
                name: 'FAQ',
                item: 'https://sukamuda.co.id/faq',
              },
            ],
          })}
        </script>
      </Helmet>

      <div
        className="fq-grid-bg"
        aria-hidden="true"
      />

      <div className="fq-wrap">
        {/* NAV */}
        <nav
          className={`fq-nav ${on('nav') ? 'fq-on' : ''}`}
          id="nav"
          ref={(element) => reg(element, 'nav')}
          aria-label="Navigasi Utama"
        >
          <span className="fq-logo">
            sukamuda
          </span>

          <div className="fq-nav-right">
            <span
              className="fq-nav-line"
              aria-hidden="true"
            />

            <span className="fq-nav-tag">
              FAQ
            </span>
          </div>
        </nav>

        {/* MAIN */}
        <main
          className="fq-main"
          id="main-content"
        >
          {/* HERO */}
          <header
            className={`fq-hero ${
              on('hero') ? 'fq-on' : ''
            }`}
            id="hero"
            ref={(element) => reg(element, 'hero')}
          >
            <div className="fq-hero-top">
              <div className="fq-hero-badge">
                <span
                  className="fq-badge-dot"
                  aria-hidden="true"
                />

                <span>
                  Pertanyaan Umum
                </span>
              </div>
            </div>

            <div className="fq-hero-body">
              <h1 className="fq-hero-title">
                <span className="fq-h1-line">
                  Frequently Asked
                </span>

                <span className="fq-h1-line fq-h1-accent">
                  Questions
                </span>
              </h1>

              <p className="fq-hero-desc">
                Temukan jawaban untuk pertanyaan
                yang paling sering ditanyakan
                seputar Sukamuda.
              </p>
            </div>

            <div className="fq-hero-bottom">
              <div
                className="fq-hero-bar"
                aria-hidden="true"
              />
            </div>
          </header>

          {/* FAQ */}
          <section
            className={`fq-sec ${
              on('faq-section') ? 'fq-on' : ''
            }`}
            id="faq-section"
            ref={(element) =>
              reg(element, 'faq-section')
            }
            aria-labelledby="faq-section-title"
          >
            <div
              className="fq-label-row"
              id="faq-section-title"
            >
              <span className="fq-label">
                01
              </span>

              <span className="fq-label-text">
                Pertanyaan & Jawaban
              </span>
            </div>

            <div className="fq-list">
              {faqData.map((item, index) => {
                const isOpen =
                  openIndex === index;

                return (
                  <article
                    key={item.q}
                    id={`faq-${index}`}
                    ref={(element) =>
                      reg(
                        element,
                        `faq-${index}`
                      )
                    }
                    className={`fq-item ${
                      isOpen
                        ? 'fq-item-open'
                        : ''
                    } ${
                      on(`faq-${index}`)
                        ? 'fq-item-vis'
                        : ''
                    }`}
                    style={{
                      transitionDelay: `${index * 45}ms`,
                    }}
                  >
                    <button
                      type="button"
                      className="fq-q"
                      onClick={() =>
                        toggle(index)
                      }
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                    >
                      <span className="fq-q-left">
                        <span
                          className="fq-q-num"
                          aria-hidden="true"
                        >
                          {String(
                            index + 1
                          ).padStart(2, '0')}
                        </span>

                        <span className="fq-q-text">
                          {item.q}
                        </span>
                      </span>

                      <span
                        className="fq-q-toggle"
                        aria-hidden="true"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line
                            x1="12"
                            y1="5"
                            x2="12"
                            y2="19"
                          />

                          <line
                            x1="5"
                            y1="12"
                            x2="19"
                            y2="12"
                          />
                        </svg>
                      </span>
                    </button>

                    <div
                      className={`fq-answer ${
                        isOpen
                          ? 'fq-answer-open'
                          : ''
                      }`}
                      id={`faq-answer-${index}`}
                    >
                      <div className="fq-answer-inner">
                        <p>
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* HELP CTA */}
          <section
            className={`fq-sec ${
              on('tease') ? 'fq-on' : ''
            }`}
            id="tease"
            ref={(element) =>
              reg(element, 'tease')
            }
            aria-label="Bantuan lebih lanjut"
          >
            <div className="fq-tease-card">
              <div
                className="fq-tease-icon"
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

              <div className="fq-tease-body">
                <h4>
                  Tidak menemukan jawaban?
                </h4>

                <p>
                  Hubungi tim kami langsung
                  melalui pusat bantuan.
                </p>
              </div>

              <button
                type="button"
                className="fq-tease-btn"
                onClick={() =>
                  window.location.href =
                    '/help'
                }
              >
                Hubungi Kami

                <svg
                  aria-hidden="true"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
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
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="fq-foot">
          <div
            className="fq-foot-line"
            aria-hidden="true"
          />

          <div className="fq-foot-in">
            <span className="fq-foot-logo">
              sukamuda
            </span>

            <span className="fq-foot-c">
              © {new Date().getFullYear()} —
              Dibuat untuk generasi muda
              Indonesia
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default FAQ;