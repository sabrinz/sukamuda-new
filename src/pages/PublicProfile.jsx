import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    IoDocumentTextOutline,
    IoSparkles,
    IoArrowForward,
    IoArrowBack,
    IoNewspaperOutline,
    IoGridOutline,
} from 'react-icons/io5';
import axios from '../utils/axiosConfig';
import './PublicProfile.css';

const baseUrl = import.meta.env.VITE_API_URL || 'https://sukamuda.co.id';

function PublicProfile() {
    const { userId } = useParams();
    const [author, setAuthor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;
        const fetchAuthor = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`/api/users/${userId}`);
                if (active) setAuthor(response.data.data);
            } catch (err) {
                if (active) setError(err.response?.data?.message || 'Gagal memuat profil penulis.');
            } finally {
                if (active) setLoading(false);
            }
        };
        if (userId) fetchAuthor();
        return () => { active = false; };
    }, [userId]);

    if (loading) return <PublicSkeleton />;

    if (error) {
        return (
            <div className="pub-page">
                <Helmet>
                    <title>Penulis Tidak Ditemukan - Sukamuda</title>
                    <meta name="robots" content="noindex" />
                    <link rel="canonical" href={baseUrl + "/user/" + userId} />
                </Helmet>
                <div className="pub-topbar">
                    <div className="pub-topbar-inner">
                        <Link to="/" className="pub-back">
                            <IoArrowBack size={15} aria-hidden="true" />
                            <span>Beranda</span>
                        </Link>
                    </div>
                </div>
                <div className="pub-error-wrap">
                    <div className="pub-error">
                        <div className="pub-error-ring" aria-hidden="true">
                            <span>!</span>
                        </div>
                        <h3>Profil Tidak Ditemukan</h3>
                        <p role="alert">{error}</p>
                        <Link to="/" className="pub-error-btn">
                            <IoArrowBack size={13} aria-hidden="true" />
                            Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const initials = author.name?.charAt(0).toUpperCase() || 'P';
    const articles = author.articles || [];
    const articleCount = articles.length;
    const canonicalUrl = baseUrl + "/user/" + userId;
    const authorAvatar = author.avatar
        ? (author.avatar.startsWith('http') ? author.avatar : baseUrl + "/storage/" + author.avatar)
        : null;

    const schemaProfile = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "name": `Profil ${author.name} - Sukamuda`,
        "url": canonicalUrl,
        "mainEntity": {
            "@type": "Person",
            "name": author.name,
            "url": canonicalUrl,
            "jobTitle": author.profession || null,
            "description": author.bio || null,
            "image": authorAvatar || null,
            "worksFor": {
                "@type": "Organization",
                "name": "Sukamuda",
                "url": baseUrl
            }
        },
        "inLanguage": "id-ID"
    };

    const schemaBreadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Beranda",
                "item": baseUrl
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": author.name
            }
        ]
    };

    return (
        <div className="pub-page">

            <Helmet>
                <title>{author.name} - Sukamuda</title>
                <link rel="canonical" href={canonicalUrl} />
                <meta name="description" content={author.bio || `Profil ${author.name} di Sukamuda. ${articleCount} artikel dipublikasikan.`} />
                <meta property="og:title" content={`${author.name} - Sukamuda`} />
                <meta property="og:description" content={author.bio || `Profil ${author.name} di Sukamuda.`} />
                <meta property="og:image" content={authorAvatar || baseUrl + "/logo.png"} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:type" content="profile" />
                <script type="application/ld+json">
                    {JSON.stringify(schemaProfile)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(schemaBreadcrumb)}
                </script>
            </Helmet>

            {/* ═══ TOPBAR ═══ */}
            <div className="pub-topbar">
                <div className="pub-topbar-inner">
                    <Link to="/" className="pub-back">
                        <IoArrowBack size={15} aria-hidden="true" />
                        <span>Beranda</span>
                    </Link>
                </div>
            </div>

            {/* ═══ COVER ═══ */}
            <header className="pub-hero">
                <div className="pub-cover-wrap">
                    <div
                        className="pub-cover"
                        style={author.coverPhoto ? { backgroundImage: `url(${author.coverPhoto})` } : undefined}
                        role={author.coverPhoto ? 'img' : undefined}
                        aria-label={author.coverPhoto ? 'Foto sampul profil' : undefined}
                    >
                        <div className="pub-cover-grad" aria-hidden="true" />
                        <div className="pub-cover-noise" aria-hidden="true" />
                    </div>
                </div>
            </header>

            {/* ═══ INFO CARD ═══ */}
            <section className="pub-info">
                <div className="pub-info-inner">

                    <div className="pub-avatar-area">
                        <div className="pub-avatar-ring">
                            <div
                                className="pub-avatar"
                                style={author.avatar ? { backgroundImage: `url(${author.avatar})` } : undefined}
                                role={author.avatar ? 'img' : undefined}
                                aria-label={author.avatar ? `Foto profil ${author.name}` : undefined}
                            >
                                {!author.avatar && <span className="pub-avatar-letter" aria-hidden="true">{initials}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="pub-text-area">
                        <h1 className="pub-name">{author.name}</h1>

                        <div className="pub-meta-line">
                            {author.profession && (
                                <span className="pub-role-chip">
                                    <IoSparkles size={11} aria-hidden="true" />
                                    {author.profession}
                                </span>
                            )}
                            {author.schoolName && (
                                <span className="pub-school-chip">{author.schoolName}</span>
                            )}
                        </div>

                        {author.bio && <p className="pub-bio">{author.bio}</p>}

                        <div className="pub-bottom-row">
                            {Array.isArray(author.interests) && author.interests.length > 0 && (
                                <div className="pub-pills">
                                    {author.interests.map((it) => (
                                        <span key={it} className="pub-pill">{it}</span>
                                    ))}
                                </div>
                            )}
                            <div className="pub-count-badge">
                                <IoNewspaperOutline size={14} aria-hidden="true" />
                                <strong>{articleCount}</strong>
                                <span>Artikel</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ ARTICLES ═══ */}
            <main className="pub-main">
                <div className="pub-section-head">
                    <div className="pub-section-title">
                        <IoGridOutline size={16} aria-hidden="true" />
                        <h2>Semua Artikel</h2>
                    </div>
                    <span className="pub-section-count">{articleCount} dipublikasikan</span>
                </div>

                {articles.length > 0 ? (
                    <div className="pub-grid">
                        {articles.map((a, i) => {
                            const date = a.createdAt
                                ? new Date(a.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                : '';
                            const imgSrc = a.image
                                ? (a.image.startsWith('http') ? a.image : baseUrl + "/storage/" + a.image)
                                : null;
                            return (
                                <Link
                                    key={a.id}
                                    to={`/article/${a.slug}`}
                                    className="pub-card"
                                    style={{ animationDelay: `${i * 0.05}s` }}
                                >
                                    <div className="pub-card-visual">
                                        {imgSrc ? (
                                            <img src={imgSrc} alt={a.title || 'Thumbnail artikel'} loading="lazy" decoding="async" width={400} height={225} />
                                        ) : (
                                            <div className="pub-card-visual-ph" aria-hidden="true">
                                                <IoDocumentTextOutline size={24} />
                                            </div>
                                        )}
                                        {a.category && <span className="pub-card-tag">{a.category}</span>}
                                        <div className="pub-card-visual-shade" aria-hidden="true" />
                                    </div>
                                    <div className="pub-card-body">
                                        <p className="pub-card-date">{date}</p>
                                        <h3 className="pub-card-title">{a.title || 'Tanpa Judul'}</h3>
                                        {a.summary && <p className="pub-card-excerpt">{a.summary}</p>}
                                        <div className="pub-card-read">
                                            Baca Selengkapnya
                                            <IoArrowForward size={12} aria-hidden="true" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="pub-empty">
                        <div className="pub-empty-visual" aria-hidden="true">
                            <IoDocumentTextOutline size={28} />
                        </div>
                        <p className="pub-empty-title">Belum Ada Artikel</p>
                        <p className="pub-empty-desc">Penulis ini belum mempublikasikan artikel apapun. Cek kembali nanti.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

/* ═══ SKELETON ═══ */
const PublicSkeleton = () => (
    <div className="pub-page" aria-busy="true" aria-label="Memuat profil penulis">
        <div className="pub-topbar" aria-hidden="true">
            <div className="pub-topbar-inner">
                <div className="pub-skel w80 h7" />
            </div>
        </div>
        <header className="pub-hero" aria-hidden="true">
            <div className="pub-cover-wrap"><div className="pub-cover pub-skel-bg"><div className="pub-cover-grad" /><div className="pub-cover-noise" /></div></div>
        </header>
        <section className="pub-info" aria-hidden="true">
            <div className="pub-info-inner">
                <div className="pub-avatar-area">
                    <div className="pub-skel-circle-wrap">
                        <div className="pub-avatar pub-skel-circle" />
                    </div>
                </div>
                <div className="pub-text-area">
                    <div className="pub-skel w45 h9 mb10" />
                    <div className="pub-skel w30 h6 mb10" />
                    <div className="pub-skel w65 h5 mb6" />
                    <div className="pub-skel w55 h5" />
                </div>
            </div>
        </section>
        <main className="pub-main" aria-hidden="true">
            <div className="pub-skel w25 h6 mb16" />
            <div className="pub-grid">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="pub-card pub-skel-card" style={{ animationDelay: '0s' }}>
                        <div className="pub-skel-img" />
                        <div style={{ padding: '16px 18px 18px' }}>
                            <div className="pub-skel w30 h5 mb8" />
                            <div className="pub-skel w90 h7 mb8" />
                            <div className="pub-skel w70 h5 mb10" />
                            <div className="pub-skel w40 h5" />
                        </div>
                    </div>
                ))}
            </div>
        </main>
    </div>
);

export default PublicProfile;