import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="navbar glass-panel">
            <div className="container flex-between" style={{ padding: '16px 24px' }}>
                <div className="logo">
                    <Link to="/" style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>
                        MOTO<span style={{ color: 'white' }}>TRADE</span>
                    </Link>
                </div>

                <nav className="nav-links flex-center gap-6">
                    <Link to="/">Explore Cars</Link>
                    <Link to="/compare">Compare</Link>

                    {user ? (
                        <>
                            {user.role === 'Seller' && (
                                <Link to="/dashboard" className="btn btn-outline" style={{ padding: '8px 16px' }}>Dashboard</Link>
                            )}
                            <div className="user-menu flex-center gap-4">
                                <span style={{ color: 'var(--text-muted)' }}>Hi, {user.username}</span>
                                <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '8px 16px' }}>Logout</button>
                            </div>
                        </>
                    ) : (
                        <div className="auth-links flex-center gap-4">
                            <Link to="/login" className="btn btn-outline" style={{ padding: '8px 16px' }}>Login</Link>
                            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px' }}>Register</Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
