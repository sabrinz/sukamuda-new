import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import axios from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import RejectionModal from '../components/RejectionModal';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AdminDashboard.css';
import {
    FaEye,
    FaPen,
    FaCheck,
    FaTimes,
    FaUndo,
    FaTrash,
    FaFire
} from 'react-icons/fa';

const AdminDashboard = () => {
    const queryClient = useQueryClient();
    const { user, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [previewArticle, setPreviewArticle] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [trendingTarget, setTrendingTarget] = useState(null);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, draft: 0 });

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [activeView, setActiveView] = useState('articles');
    const [reports, setReports] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(false);
    const [trash, setTrash] = useState([]);
    const [trashLoading, setTrashLoading] = useState(false);

    const [chartData, setChartData] = useState([]);
    const [statsLoading, setStatsLoading] = useState(false);

    const COLORS = [
        '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF',
        '#FF19A3', '#19FF5A', '#FFCE19', '#19D4FF', '#FF3333',
        '#8A2BE2', '#32CD32', '#FF4500'
    ];

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: '',
        article: null,
        title: '',
        description: ''
    });

    const [rejectionModal, setRejectionModal] = useState({
        isOpen: false,
        articleId: null,
        articleTitle: null,
        isLoading: false
    });

    const categoryList = [
        { slug: 'school', label: 'School' },
        { slug: 'college', label: 'College' },
        { slug: 'general', label: 'General' },
        { slug: 'style', label: 'Style' },
        { slug: 'culinary', label: 'Culinary' },
        { slug: 'traveling', label: 'Traveling' },
        { slug: 'sport', label: 'Sport & E-Sport' },
        { slug: 'music', label: 'Music & Film' },
        { slug: 'otomotif', label: 'Otomotif' },
        { slug: 'science', label: 'Science' },
        { slug: 'health', label: 'Health' },
        { slug: 'tech', label: 'Tech' },
        { slug: 'podcast', label: 'Podcast' }
    ];

    useEffect(() => {
        if (!isLoggedIn || user?.role !== 'admin') {
            navigate('/');
        }
    }, [isLoggedIn, user, navigate]);

    const fetchArticles = async (isSearch = false) => {
        try {
            if (!isSearch) setLoading(true);

            const response = await axios.get(`/api/articles`, {
                params: {
                    page: currentPage,
                    status: filterStatus !== 'all' ? filterStatus : null,
                    category: filterCategory !== 'all' ? filterCategory : null,
                    search: searchQuery
                }
            });

            const dataFromServer = response.data.data || [];
            setArticles(dataFromServer);

            if (response.data.last_page) {
                setTotalPages(response.data.last_page);
            }

            setStats(prev => ({
                ...prev,
                total: response.data.total || 0
            }));

        } catch (error) {
            console.error("Gagal mengambil data berita:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReports = async () => {
        setReportsLoading(true);
        try {
            const response = await axios.get('/api/reports');
            setReports(response.data.data || []);
        } catch (error) {
            console.error("Gagal mengambil data laporan:", error);
        } finally {
            setReportsLoading(false);
        }
    };

    const fetchTrash = async (isSearch = false) => {
        setTrashLoading(true);
        try {
            const response = await axios.get('/api/articles/trash', {
                params: {
                    page: currentPage,
                    category: filterCategory !== 'all' ? filterCategory : null,
                    search: searchQuery
                }
            });
            setTrash(response.data.data || []);

            if (response.data.last_page) {
                setTotalPages(response.data.last_page);
            }
        } catch (error) {
            console.error("Gagal mengambil data sampah artikel:", error);
        } finally {
            setTrashLoading(false);
        }
    };

    const fetchChartStats = async () => {
        setStatsLoading(true);
        try {
            const response = await axios.get('/api/articles', {
                params: { status: 'approved', per_page: 1000 }
            });

            const allApproved = response.data.data || [];
            const categoryCounts = {};
            let totalApproved = 0;

            allApproved.forEach(art => {
                if (art.status === 'approved') {
                    categoryCounts[art.category] = (categoryCounts[art.category] || 0) + 1;
                    totalApproved++;
                }
            });

            const formattedData = Object.keys(categoryCounts).map(key => {
                const count = categoryCounts[key];
                const percentage = totalApproved > 0 ? ((count / totalApproved) * 100).toFixed(1) : 0;
                return {
                    name: getCategoryLabel(key),
                    value: count,
                    percentage: parseFloat(percentage)
                };
            });

            setChartData(formattedData);
        } catch (error) {
            console.error("Gagal mengambil data statistik:", error);
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        if (isLoggedIn && user?.role === 'admin') {
            if (activeView === 'trash') {
                fetchTrash();
            } else if (activeView === 'reports') {
                fetchReports();
            } else if (activeView === 'stats') {
                fetchChartStats();
            } else {
                fetchArticles(false);
            }
        }
    }, [currentPage, filterStatus, filterCategory, activeView]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (isLoggedIn && user?.role === 'admin') {
                const scrollY = window.scrollY;

                setCurrentPage(1);
                const fetcher = activeView === 'trash' ? fetchTrash : fetchArticles;

                if (activeView !== 'stats' && activeView !== 'reports') {
                    fetcher(true).then(() => {
                        window.scrollTo(0, scrollY);
                    });
                }
            }
        }, 600);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    useEffect(() => {
        if (isLoggedIn && user?.role === 'admin' && activeView === 'reports') {
            fetchReports();
        }
    }, [activeView]);

    const handleUpdateStatus = async (id, newStatus, rejectionReason = null) => {
        const label = newStatus === 'approved' ? 'menyetujui' : 'menolak';
        if (!window.confirm(`Yakin ingin ${label} berita ini?`)) return;

        setActionLoading(id);
        try {
            const payload = { status: newStatus };
            if (newStatus === 'rejected' && rejectionReason) {
                payload.rejection_reason = rejectionReason;
            }
            await axios.patch(`/api/articles/${id}/status`, payload);
            fetchArticles();
            setRejectionModal({ isOpen: false, articleId: null, articleTitle: null, isLoading: false });
        } catch (error) {
            alert("Gagal memperbarui status berita.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectArticle = (articleId, articleTitle) => {
        setRejectionModal({
            isOpen: true,
            articleId: articleId,
            articleTitle: articleTitle,
            isLoading: false
        });
    };

    const handleRejectionConfirm = async (reason) => {
        setRejectionModal(prev => ({ ...prev, isLoading: true }));
        try {
            await axios.patch(`/api/articles/${rejectionModal.articleId}/status`, {
                status: 'rejected',
                rejection_reason: reason
            });
            fetchArticles();
            setRejectionModal({ isOpen: false, articleId: null, articleTitle: null, isLoading: false });
        } catch (error) {
            alert("Gagal menolak berita.");
            setRejectionModal(prev => ({ ...prev, isLoading: false }));
        }
    };

    const handleRejectionCancel = () => {
        setRejectionModal({ isOpen: false, articleId: null, articleTitle: null, isLoading: false });
    };

    const openConfirmModal = (type, article) => {
        const titleMap = {
            trash: 'Pindahkan ke sampah?',
            restore: 'Pulihkan artikel?',
            permanent: 'Hapus permanen dari sampah?'
        };

        const descriptionMap = {
            trash: 'Artikel akan dipindahkan ke sampah dan bisa dipulihkan kembali nanti.',
            restore: 'Artikel akan dikembalikan ke status pending dan dikeluarkan dari sampah.',
            permanent: 'Artikel akan dihapus secara permanen dan tidak bisa dikembalikan.'
        };

        setConfirmModal({
            isOpen: true,
            type,
            article,
            title: titleMap[type],
            description: descriptionMap[type]
        });
    };

    const closeConfirmModal = () => {
        setConfirmModal({ isOpen: false, type: '', article: null, title: '', description: '' });
    };

    const confirmModalAction = async () => {
        if (!confirmModal.article) return;

        const id = confirmModal.article.id;
        setActionLoading(id);

        try {
            if (confirmModal.type === 'trash') {
                await axios.delete(`/api/articles/${id}`);
                if (activeView === 'trash') {
                    fetchTrash();
                } else if (activeView === 'reports') {
                    fetchReports();
                } else {
                    fetchArticles();
                }
                alert('Berita berhasil dipindahkan ke sampah!');
            }
            if (confirmModal.type === 'restore') {
                await axios.patch(`/api/articles/${id}/restore`);
                alert('Berita berhasil dikembalikan ke pending!');
                if (activeView === 'trash') {
                    fetchTrash();
                } else if (activeView === 'reports') {
                    fetchReports();
                } else {
                    fetchArticles();
                }
            }
            if (confirmModal.type === 'permanent') {
                await axios.delete(`/api/articles/${id}/permanent`);
                alert('Berita berhasil dihapus permanen dari sampah!');
                fetchTrash();
            }

            queryClient.invalidateQueries(['trendingArticles']);
            queryClient.invalidateQueries(['publicArticles']);
        } catch (error) {
            if (confirmModal.type === 'trash') {
                alert('Gagal memindahkan berita ke sampah.');
            } else if (confirmModal.type === 'restore') {
                alert('Gagal memulihkan berita dari sampah.');
            } else if (confirmModal.type === 'permanent') {
                alert('Gagal menghapus artikel secara permanen.');
            }
        } finally {
            setActionLoading(null);
            closeConfirmModal();
        }
    };

    const handleToggleTrending = async (article) => {
        if (!article) return;
        setActionLoading(article.id);
        try {
            await axios.patch(`/api/articles/${article.id}/toggle-trending`);
            fetchArticles();
            queryClient.invalidateQueries(['trendingArticles']);
            queryClient.invalidateQueries(['publicArticles']);
        } catch (error) {
            alert("Gagal mengubah status trending");
        } finally {
            setActionLoading(null);
            setTrendingTarget(null);
        }
    };

    const openTrendingConfirm = (article) => {
        setTrendingTarget(article);
    };

    const closeTrendingConfirm = () => {
        setTrendingTarget(null);
    };

    const getArticleImage = (art) => {
        if (!art.image) return "https://via.placeholder.com/150?text=SukaMuda";
        return art.image.startsWith('http') ? art.image : `http://localhost:8000/storage/${art.image}`;
    };

    const getCategoryLabel = (slug) => {
        const cat = categoryList.find(c => c.slug === slug);
        return cat ? cat.label : slug.charAt(0).toUpperCase() + slug.slice(1);
    };

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontWeight="bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    if (loading && articles.length === 0 && activeView === 'articles') {
        return (
            <div className="admin-loading-full">
                <div className="admin-spinner" />
                <p>Memuat Data SukaMuda...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-container">
            <header className="admin-header">
                <div className="admin-header-left">
                    <div className="admin-logo">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                        <div>
                            <h1>Panel Kendali Admin</h1>
                            <p>Halo <strong>{user?.name}</strong> — moderasi berita dengan bijak.</p>
                        </div>
                    </div>
                </div>
                <div className="admin-header-right">
                    <button
                        className={`btn-view-toggle ${activeView === 'stats' ? 'active' : ''}`}
                        onClick={() => { setActiveView('stats'); }}
                    >
                        Statistik
                    </button>
                    <button
                        className={`btn-view-toggle ${activeView === 'articles' ? 'active' : ''}`}
                        onClick={() => { setActiveView('articles'); setCurrentPage(1); }}
                    >
                        Artikel
                    </button>
                    <button
                        className={`btn-view-toggle ${activeView === 'reports' ? 'active' : ''}`}
                        onClick={() => { setActiveView('reports'); setCurrentPage(1); }}
                    >
                        Laporan ({reports.length})
                    </button>
                    <button
                        className={`btn-view-toggle ${activeView === 'trash' ? 'active' : ''}`}
                        onClick={() => { setActiveView('trash'); setCurrentPage(1); }}
                    >
                        Sampah ({trash.length})
                    </button>
                    <Link to="/write" className="btn-create-new">
                        Tulis Artikel Baru
                    </Link>
                </div>
            </header>

            {activeView === 'articles' && (
                <div className="admin-stats-grid">
                    <div className="stat-card stat-total" onClick={() => { setFilterStatus('all'); setFilterCategory('all'); setSearchQuery(''); setCurrentPage(1); }}>
                        <div className="stat-info">
                            <span className="stat-number">{stats.total}</span>
                            <span className="stat-label">Total Artikel</span>
                        </div>
                    </div>
                </div>
            )}

            {activeView === 'articles' && (
                <div className="admin-toolbar">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Cari judul atau penulis..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="toolbar-right">
                        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="filter-select">
                            <option value="all">Semua Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }} className="filter-select">
                            <option value="all">Semua Kategori</option>
                            {categoryList.map(cat => (
                                <option key={cat.slug} value={cat.slug}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {activeView === 'articles' && (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Artikel</th>
                                <th>Penulis</th>
                                <th>Kategori</th>
                                <th>Status</th>
                                <th>Aksi</th>
                                <th>Dilihat</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.length > 0 ? articles.map((art, index) => (
                                <tr key={art.id}>
                                    <td>{index + 1 + (currentPage - 1) * 15}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <img src={getArticleImage(art)} alt="" style={{ width: '40px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} />
                                            <span style={{ fontWeight: '600' }}>{art.title}</span>
                                        </div>
                                    </td>
                                    <td>{art.user?.name || 'Anonim'}</td>
                                    <td>
                                        <span className="badge-category">{getCategoryLabel(art.category)}</span>
                                    </td>
                                    <td><span className={`status-badge status-${art.status}`}>{art.status.toUpperCase()}</span></td>
                                    <td>
                                        <div className="action-group">
                                            <button
                                                className="btn-action"
                                                onClick={() => setPreviewArticle(art)}
                                                title="Preview"
                                            >
                                                <FaEye />
                                            </button>
                                            <button
                                                className="btn-action"
                                                onClick={() => navigate('/write', { state: { draft: art, returnPath: '/admin' } })}
                                                title="Edit"
                                            >
                                                <FaPen />
                                            </button>
                                            {art.status === 'pending' && (
                                                <>
                                                    <button
                                                        className="btn-action"
                                                        onClick={() => handleUpdateStatus(art.id, 'approved')}
                                                        disabled={actionLoading === art.id}
                                                        title="Approve"
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                    <button
                                                        className="btn-action btn-reject"
                                                        onClick={() => handleRejectArticle(art.id, art.title)}
                                                        disabled={actionLoading === art.id}
                                                        title="Reject"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </>
                                            )}
                                            {art.status === 'approved' && (
                                                <button
                                                    className="btn-action"
                                                    onClick={() => handleUpdateStatus(art.id, 'pending')}
                                                    disabled={actionLoading === art.id}
                                                    title="Tarik ke Pending"
                                                >
                                                    <FaUndo />
                                                </button>
                                            )}
                                            <button
                                                className="btn-action"
                                                onClick={() => openConfirmModal('trash', art)}
                                                disabled={actionLoading === art.id}
                                                title="Pindahkan ke Sampah"
                                            >
                                                <FaTrash />
                                            </button>
                                            <button
                                                className={`btn-action ${art.is_trending ? 'active-trending' : ''}`}
                                                onClick={() => openTrendingConfirm(art)}
                                                title="Trending"
                                            >
                                                <FaFire />
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#555', fontWeight: '500' }}>
                                            <FaEye /> {art.views || 0}x
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="empty-state">Data tidak ditemukan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeView === 'reports' && (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Artikel Dilaporkan</th>
                                <th>Pelapor</th>
                                <th>Alasan</th>
                                <th>Tanggal</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportsLoading ? (
                                <tr>
                                    <td colSpan="6" className="empty-state">Memuat laporan...</td>
                                </tr>
                            ) : reports.length > 0 ? reports.map((report, index) => (
                                <tr key={report.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <img src={getArticleImage(report.article)} alt="" style={{ width: '40px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} />
                                            <div>
                                                <div style={{ fontWeight: '600' }}>{report.article?.title}</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>Penulis: {report.article?.user?.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{report.user?.name || 'Anonim'}</td>
                                    <td style={{ maxWidth: '200px', wordWrap: 'break-word' }}>{report.reason}</td>
                                    <td>{new Date(report.created_at).toLocaleDateString('id-ID')}</td>
                                    <td>
                                        <div className="action-group">
                                            <button
                                                className="btn-action"
                                                onClick={() => setPreviewArticle(report.article)}
                                                title="Lihat Artikel"
                                            >
                                                <FaEye />
                                            </button>
                                            <button
                                                className="btn-action"
                                                onClick={() => openConfirmModal('trash', report.article)}
                                                disabled={actionLoading === report.article.id}
                                                title="Pindahkan artikel ke sampah"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="empty-state">Belum ada laporan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeView === 'trash' && (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Artikel</th>
                                <th>Penulis</th>
                                <th>Kategori</th>
                                <th>Dihapus</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trashLoading ? (
                                <tr>
                                    <td colSpan="6" className="empty-state">Memuat sampah...</td>
                                </tr>
                            ) : trash.length > 0 ? trash.map((art, index) => (
                                <tr key={art.id}>
                                    <td>{index + 1 + (currentPage - 1) * 15}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <img src={getArticleImage(art)} alt="" style={{ width: '40px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} />
                                            <span style={{ fontWeight: '600' }}>{art.title}</span>
                                        </div>
                                    </td>
                                    <td>{art.user?.name || 'Anonim'}</td>
                                    <td>
                                        <span className="badge-category">{getCategoryLabel(art.category)}</span>
                                    </td>
                                    <td>{new Date(art.deleted_at).toLocaleDateString('id-ID')}</td>
                                    <td>
                                        <div className="action-group">
                                            <button
                                                className="btn-action"
                                                onClick={() => setPreviewArticle(art)}
                                                title="Preview"
                                            >
                                                <FaEye />
                                            </button>
                                            <button
                                                className="btn-action"
                                                onClick={() => openConfirmModal('restore', art)}
                                                disabled={actionLoading === art.id}
                                                title="Restore"
                                            >
                                                <FaUndo />
                                            </button>
                                            <button
                                                className="btn-action btn-reject"
                                                onClick={() => openConfirmModal('permanent', art)}
                                                disabled={actionLoading === art.id}
                                                title="Hapus Permanen"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="empty-state">Sampah kosong.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeView === 'stats' && (
                <div className="admin-table-wrapper" style={{ padding: '30px', minHeight: '400px' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
                        Statistik Artikel
                    </h2>

                    {statsLoading ? (
                        <div className="admin-spinner" style={{ margin: '0 auto' }} />
                    ) : chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={450}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={160}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name, props) => [`${value} Artikel (${props.payload.percentage}%)`, name]} />
                                <Legend
                                    layout="vertical"
                                    verticalAlign="middle"
                                    align="left"
                                    iconType="circle"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state">Belum ada data artikel yang di-approve.</div>
                    )}
                </div>
            )}

            {totalPages > 1 && activeView !== 'stats' && activeView !== 'reports' && (
                <div className="admin-pagination">
                    <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Sebelumnya</button>
                    <span className="page-info">Halaman {currentPage} dari {totalPages}</span>
                    <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Selanjutnya</button>
                </div>
            )}

            {previewArticle && (
                <div className="modal-overlay" onClick={() => setPreviewArticle(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{previewArticle.title}</h3>
                        </div>
                        <div className="modal-body">
                            <div className="modal-meta">
                                <strong>Penulis:</strong> {previewArticle.user?.name} | <strong>Kategori:</strong> {getCategoryLabel(previewArticle.category)}
                            </div>
                            <img src={getArticleImage(previewArticle)} alt="Hero" style={{ width: '100%', borderRadius: '8px', margin: '15px 0' }} />
                            <div className="modal-article-content" dangerouslySetInnerHTML={{ __html: previewArticle.content }} />
                        </div>
                    </div>
                </div>
            )}

            {trendingTarget && (
                <div className="modal-overlay" onClick={closeTrendingConfirm}>
                    <div className="modal-content trending-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                {trendingTarget.is_trending
                                    ? 'Batalkan Trending?'
                                    : 'Jadikan Trending?'}
                            </h3>
                        </div>

                        <div className="modal-body">
                            <p>
                                Apakah artikel ini akan ditampilkan di tampilan trending?
                            </p>

                            <p>
                                <strong>{trendingTarget.title}</strong>
                            </p>

                            <div className="trending-modal-actions">
                                <button
                                    className="btn-action2"
                                    onClick={closeTrendingConfirm}
                                >
                                    Batal
                                </button>

                                <button
                                    className="btn-action active-trending"
                                    onClick={() => handleToggleTrending(trendingTarget)}
                                    disabled={actionLoading === trendingTarget.id}
                                >
                                    {trendingTarget.is_trending
                                        ? 'Hapus dari Trending'
                                        : 'Tampilkan di Trending'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {confirmModal.isOpen && (
                <div className="modal-overlay" onClick={closeConfirmModal}>
                    <div className="modal-content trending-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{confirmModal.title}</h3>
                        </div>
                        <div className="modal-body">
                            <p>{confirmModal.description}</p>
                            <p><strong>{confirmModal.article?.title}</strong></p>
                            <div className="trending-modal-actions">
                                <button className="btn-action2" onClick={closeConfirmModal}>
                                    Batal
                                </button>
                                <button
                                    className="btn-action btn-reject"
                                    onClick={confirmModalAction}
                                    disabled={actionLoading === confirmModal.article?.id}
                                >
                                    {confirmModal.type === 'permanent'
                                        ? 'Hapus Permanen'
                                        : confirmModal.type === 'restore'
                                            ? 'Pulihkan'
                                            : 'Lanjutkan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <RejectionModal
                isOpen={rejectionModal.isOpen}
                articleTitle={rejectionModal.articleTitle}
                onConfirm={handleRejectionConfirm}
                onCancel={handleRejectionCancel}
                isLoading={rejectionModal.isLoading}
            />
        </div>
    );
}

export default AdminDashboard;