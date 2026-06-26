import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

        if (userId) {
            fetchAuthor();
        }
    }, [userId]);

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="spinner"></div>
                <p>Memuat profil penulis...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-error">
                <h2>Profil tidak tersedia</h2>
                <p>{error}</p>
                <Link to="/">Kembali ke Beranda</Link>
            </div>
        );
    }

    return (
        <div className="public-profile-page">
            <section className="profile-hero-card">
                <div className="profile-avatar">
                    {author.avatar ? (
                        <img src={author.avatar} alt={author.name} />
                    ) : (
                        <span>{author.name?.charAt(0) || 'P'}</span>
                    )}
                </div>
                <div className="profile-headline">
                    <h1>{author.name}</h1>
                    {author.profession && <p className="profile-role">{author.profession}</p>}
                    {author.schoolName && <p className="profile-school">{author.schoolName}</p>}
                    {author.bio && <p className="profile-bio">{author.bio}</p>}
                </div>
            </section>

            <section className="profile-articles-section">
                <div className="section-header">
                    <h2>Artikel oleh {author.name}</h2>
                    <span>{author.articles?.length ?? 0} artikel dipublikasikan</span>
                </div>
                <div className="author-articles-grid">
                    {author.articles?.length > 0 ? (
                        author.articles.map((article) => (
                            <Link key={article.id} to={`/article/${article.slug}`} className="author-article-card">
                                <div className="article-card-content">
                                    <h3>{article.title}</h3>
                                    <p>{article.summary || 'Artikel tanpa ringkasan singkat.'}</p>
                                    <span className="publish-date">{new Date(article.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="empty-article-state">
                            <p>Penulis ini belum memiliki artikel yang dipublikasikan.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default PublicProfile;
