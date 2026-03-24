import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children, role }) => {
    const { user, loading, token } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;
    if (!user || !token) return <Navigate to="/login" />;
    if (role && user.role !== role) {
        return <Navigate to="/" />; // Redirect to home if they don't have the right role
    }

    return children;
};

export default PrivateRoute;
