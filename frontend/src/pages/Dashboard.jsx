import { useState, useEffect } from 'react';
import axios from 'axios';
import { socket } from '../services/socket';

const Dashboard = () => {
    const [stats, setStats] = useState({ totalListings: 0, availableVehicles: 0, soldVehicles: 0 });
    const [vehicles, setVehicles] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '', brand: '', model: '', year: '', price: '', mileage: '', fuelType: 'Petrol', transmission: 'Automatic', condition: 'Used', district: '', city: '', description: '', videoUrl: ''
    });
    const [images, setImages] = useState(null);

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
            const { data } = await axios.get('http://localhost:5000/api/v1/vehicles/dashboard');
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        setImages(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSend = new FormData();
        for (const key in formData) {
            dataToSend.append(key, formData[key]);
        }
        if (images) {
            for (let i = 0; i < images.length; i++) {
                dataToSend.append('images', images[i]);
            }
        }

        try {
            await axios.post('http://localhost:5000/api/v1/vehicles', dataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setShowAddModal(false);
            fetchDashboardData();
        } catch (error) {
            console.error('Error adding vehicle', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this listing?')) {
            try {
                await axios.delete(`http://localhost:5000/api/v1/vehicles/${id}`);
                fetchDashboardData();
            } catch (error) {
                console.error('Error deleting vehicle', error);
            }
        }
    };

    const handleMarkSold = async (id) => {
        try {
            await axios.patch(`http://localhost:5000/api/v1/vehicles/${id}/sold`);
            fetchDashboardData();
        } catch (error) {
            console.error('Error marking as sold', error);
        }
    };

    return (
        <div className="dashboard padding-y-2">
            <div className="flex-between mb-8 flex-wrap" style={{ gap: '1rem' }}>
                <h1 className="section-title" style={{ marginBottom: 0 }}>Seller Dashboard</h1>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Add New Listing</button>
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

            <h2 className="mb-4">Recent Listings</h2>
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
                                <button onClick={() => handleDelete(vehicle.id)} className="btn btn-danger" style={{ padding: '8px 12px', fontSize: '0.9rem' }}>Delete</button>
                                {vehicle.availabilityStatus === 'Available' && (
                                    <button onClick={() => handleMarkSold(vehicle.id)} className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '0.9rem' }}>Mark Sold</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showAddModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
                    <div className="card glass-panel" style={{ width: '100%', maxWidth: '800px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="flex-between mb-6">
                            <h2>Add New Listing</h2>
                            <button onClick={() => setShowAddModal(false)} style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input type="text" name="title" placeholder="Listing Title" onChange={handleChange} required />
                                <input type="number" name="price" placeholder="Price (LKR)" onChange={handleChange} required />
                                <input type="text" name="brand" placeholder="Brand" onChange={handleChange} required />
                                <input type="text" name="model" placeholder="Model" onChange={handleChange} required />
                                <input type="number" name="year" placeholder="Year" onChange={handleChange} required />
                                <input type="number" name="mileage" placeholder="Mileage (km)" onChange={handleChange} required />

                                <select name="fuelType" onChange={handleChange}>
                                    <option value="Petrol">Petrol</option>
                                    <option value="Diesel">Diesel</option>
                                    <option value="Electric">Electric</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>

                                <select name="transmission" onChange={handleChange}>
                                    <option value="Automatic">Automatic</option>
                                    <option value="Manual">Manual</option>
                                    <option value="Tiptronic">Tiptronic</option>
                                </select>

                                <select name="condition" onChange={handleChange}>
                                    <option value="Used">Used</option>
                                    <option value="Brand New">Brand New</option>
                                    <option value="Reconditioned">Reconditioned</option>
                                </select>

                                <input type="text" name="district" placeholder="District" onChange={handleChange} required />
                                <input type="text" name="city" placeholder="City" onChange={handleChange} required />
                                <input type="text" name="videoUrl" placeholder="Video URL (Optional)" onChange={handleChange} />
                            </div>
                            <div className="mt-4">
                                <textarea name="description" placeholder="Description" rows="4" onChange={handleChange}></textarea>
                            </div>
                            <div className="mt-4 mb-6">
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Images (Max 5)</label>
                                <input type="file" multiple accept="image/*" onChange={handleImageChange} />
                            </div>

                            <div className="flex-end" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Publish Listing</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
