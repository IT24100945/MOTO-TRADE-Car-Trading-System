import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { socket } from '../services/socket';

const SellerDashboard = () => {
    const [stats, setStats] = useState({ totalListings: 0, availableVehicles: 0, soldVehicles: 0 });
    const [vehicles, setVehicles] = useState([]);

    useEffect(() => {
        fetchDashboardData();

        socket.on('vehicle_sold', (data) => {
            setVehicles(prev => prev.map(v => v.id === data.id ? { ...v, availabilityStatus: 'Sold' } : v));
        });

        return () => {
            socket.off('vehicle_sold');
        };
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('http://localhost:5000/api/v1/vehicles/dashboard', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (data.success) {
                setStats({
                    totalListings: data.data.totalListings,
                    availableVehicles: data.data.availableVehicles,
                    soldVehicles: data.data.soldVehicles
                });
                setVehicles(data.data.recentListings);
            }
        } catch (error) {
            console.error('Error fetching dashboard data', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this listing? All related images and videos will be removed.')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/v1/vehicles/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                fetchDashboardData();
            } catch (error) {
                console.error('Error deleting vehicle', error);
                alert(error.response?.data?.message || 'Error deleting vehicle');
            }
        }
    };

    const handleMarkSold = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/v1/vehicles/${id}/sold`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchDashboardData();
        } catch (error) {
            console.error('Error marking as sold', error);
        }
    };

    return (
        <div className="dashboard padding-y-2">
            <div className="flex-between mb-8 flex-wrap" style={{ gap: '1rem' }}>
                <h1 className="section-title" style={{ marginBottom: 0 }}>Seller Dashboard</h1>
                <Link to="/dashboard/add-vehicle" className="btn btn-primary">+ Add New Listing</Link>
            </div>

            <div className="grid mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div className="card glass-panel flex-column flex-center" style={{ padding: '2rem' }}>
                    <h3 style={{ color: 'var(--text-muted)' }}>Total Listings</h3>
                    <p style={{ fontSize: '3rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary), #FF6B6B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stats.totalListings}</p>
                </div>
                <div className="card glass-panel flex-column flex-center" style={{ padding: '2rem' }}>
                    <h3 style={{ color: 'var(--text-muted)' }}>Available</h3>
                    <p style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--success)' }}>{stats.availableVehicles}</p>
                </div>
                <div className="card glass-panel flex-column flex-center" style={{ padding: '2rem' }}>
                    <h3 style={{ color: 'var(--text-muted)' }}>Sold</h3>
                    <p style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text-muted)' }}>{stats.soldVehicles}</p>
                </div>
            </div>

            <h2 className="mb-4">Your Listings</h2>
            <div className="grid" style={{ gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {vehicles.map(vehicle => (
                    <div key={vehicle.id} className="card glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '200px', backgroundColor: 'var(--surface-light)', position: 'relative' }}>
                            {vehicle.VehicleImages && vehicle.VehicleImages.length > 0 ? (
                                <img src={`http://localhost:5000${vehicle.VehicleImages[0].imageUrl}`} alt={vehicle.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div className="flex-center" style={{ width: '100%', height: '100%', color: 'var(--text-muted)' }}>No Image</div>
                            )}
                            <div style={{ position: 'absolute', top: 10, right: 10 }}>
                                <span className={`badge ${vehicle.availabilityStatus === 'Available' ? 'badge-available' : 'badge-sold'}`}>{vehicle.availabilityStatus}</span>
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 className="mb-2">{vehicle.title}</h3>
                            <p className="text-gradient mb-4" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>LKR {vehicle.price.toLocaleString()}</p>
                            <div className="flex-between mb-4" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <span>{vehicle.year}</span>
                                <span>•</span>
                                <span>{vehicle.mileage} km</span>
                                <span>•</span>
                                <span>{vehicle.transmission}</span>
                            </div>
                            <div className="flex-between mt-auto" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                <Link to={`/dashboard/edit-vehicle/${vehicle.id}`} className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '0.9rem' }}>Edit</Link>
                                {vehicle.availabilityStatus === 'Available' && (
                                    <button onClick={() => handleMarkSold(vehicle.id)} className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '0.9rem' }}>Mark Sold</button>
                                )}
                                <button onClick={() => handleDelete(vehicle.id)} className="btn btn-danger" style={{ padding: '8px 12px', fontSize: '0.9rem' }}>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
                {vehicles.length === 0 && (
                    <p style={{ color: 'var(--text-muted)' }}>You have not added any vehicles yet.</p>
                )}
            </div>
        </div>
    );
};

export default SellerDashboard;
