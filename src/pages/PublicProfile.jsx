import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

function PublicProfile() {
    const { userId } = useParams();
    const [author, setAuthor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAuthor = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`/api/users/${userId}`);
                setAuthor(response.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Gagal memuat profil penulis.');
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchAuthor();
    }, [userId]);

    if (loading) return <PublicSkeleton />;

    if (error) {
        return (
            <div className="pub-page">
                <div className="pub-topbar">
                    <div className="pub-topbar-inner">
                        <Link to="/" className="pub-back">
                            <IoArrowBack size={15} />
                            <span>Beranda</span>
                        </Link>
                    </div>
                </div>
                <div className="pub-error-wrap">
                    <div className="pub-error">
                        <div className="pub-error-ring">
                            <span>!</span>
                        </div>
                        <h3>Profil Tidak Ditemukan</h3>
                        <p>{error}</p>
                        <Link to="/" className="pub-error-btn">
                            <IoArrowBack size={13} />
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

    return (
        <div className="pub-page">

            {/* ═══ TOPBAR ═══ */}
            <div className="pub-topbar">
                <div className="pub-topbar-inner">
                    <Link to="/" className="pub-back">
                        <IoArrowBack size={15} />
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
                    >
                        <div className="pub-cover-grad" />
                        <div className="pub-cover-noise" />
                    </div>
                </div>
            </header>

            {/* ═══ INFO CARD ═══ */}
            <section className="pub-info">
                <div className="pub-info-inner">

                    <div className="pub-avatar-area">
                        <div className="pub-avatar-ring">
                            <div className="pub-avatar" style={author.avatar ? { backgroundImage: `url(${author.avatar})` } : undefined}>
                                {!author.avatar && <span className="pub-avatar-letter">{initials}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="pub-text-area">
                        <h1 className="pub-name">{author.name}</h1>

                        <div className="pub-meta-line">
                            {author.profession && (
                                <span className="pub-role-chip">
                                    <IoSparkles size={11} />
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
                                <IoNewspaperOutline size={14} />
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
                        <IoGridOutline size={16} />
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
                            return (
                                <Link
                                    key={a.id}
                                    to={`/article/${a.slug}`}
                                    className="pub-card"
                                    style={{ animationDelay: `${i * 0.05}s` }}
                                >
                                    <div className="pub-card-visual">
                                        {a.image ? (
                                            <img src={a.image} alt={a.title} loading="lazy" />
                                        ) : (
                                            <div className="pub-card-visual-ph">
                                                <IoDocumentTextOutline size={24} />
                                            </div>
                                        )}
                                        {a.category && <span className="pub-card-tag">{a.category}</span>}
                                        <div className="pub-card-visual-shade" />
                                    </div>
                                    <div className="pub-card-body">
                                        <p className="pub-card-date">{date}</p>
                                        <h3 className="pub-card-title">{a.title || 'Tanpa Judul'}</h3>
                                        {a.summary && <p className="pub-card-excerpt">{a.summary}</p>}
                                        <div className="pub-card-read">
                                            Baca Selengkapnya
                                            <IoArrowForward size={12} />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="pub-empty">
                        <div className="pub-empty-visual">
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
    <div className="pub-page">
        <div className="pub-topbar">
            <div className="pub-topbar-inner">
                <div className="pub-skel w80 h7" />
            </div>
        </div>
        <header className="pub-hero">
            <div className="pub-cover-wrap"><div className="pub-cover pub-skel-bg"><div className="pub-cover-grad" /><div className="pub-cover-noise" /></div></div>
        </header>
        <section className="pub-info">
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
        <main className="pub-main">
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