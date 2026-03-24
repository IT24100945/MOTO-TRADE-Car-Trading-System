import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const VehicleDetails = () => {
    const { id } = useParams();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        fetchVehicle();
    }, [id]);

    const fetchVehicle = async () => {
        try {
            const { data } = await axios.get(`http://localhost:5000/api/v1/vehicles/${id}`);
            setVehicle(data.data);
        } catch (error) {
            console.error('Error fetching vehicle', error);
        }
        setLoading(false);
    };

    if (loading) return <div className="flex-center" style={{ height: '80vh' }}><div className="spinner"></div></div>;
    if (!vehicle) return <div className="flex-center" style={{ height: '80vh' }}><h2>Vehicle not found</h2></div>;

    return (
        <div className="container padding-y-2">
            <div className="mb-6">
                <Link to="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>&larr; Back to listings</Link>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '3rem' }}>

                {/* Left Column - Images */}
                <div className="gallery">
                    <div className="main-image mb-4 card glass-panel" style={{ height: '500px', backgroundColor: 'var(--surface-light)', borderRadius: '16px', overflow: 'hidden' }}>
                        {vehicle.VehicleImages && vehicle.VehicleImages.length > 0 ? (
                            <img src={`http://localhost:5000${vehicle.VehicleImages[activeImage].imageUrl}`} alt={vehicle.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div className="flex-center" style={{ width: '100%', height: '100%', color: 'var(--text-muted)' }}>No Image</div>
                        )}
                    </div>

                    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                        {vehicle.VehicleImages && vehicle.VehicleImages.map((img, idx) => (
                            <div
                                key={img.id}
                                className="card glass-panel"
                                onClick={() => setActiveImage(idx)}
                                style={{ height: '80px', cursor: 'pointer', opacity: activeImage === idx ? 1 : 0.5, border: activeImage === idx ? '2px solid var(--primary)' : '1px solid transparent' }}
                            >
                                <img src={`http://localhost:5000${img.imageUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column - Details */}
                <div className="details card glass-panel p-6" style={{ padding: '2rem' }}>
                    <div className="flex-between mb-2">
                        <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>{vehicle.brand} {vehicle.model}</span>
                        <span className={`badge ${vehicle.availabilityStatus === 'Available' ? 'badge-available' : 'badge-sold'}`}>{vehicle.availabilityStatus}</span>
                    </div>

                    <h1 className="mb-4" style={{ fontSize: '2.5rem', lineHeight: 1.2 }}>{vehicle.title}</h1>
                    <p className="text-gradient mb-8" style={{ fontSize: '3rem', fontWeight: 800 }}>LKR {vehicle.price.toLocaleString()}</p>

                    <div className="specs grid gap-4 mb-8" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        <div className="spec-item flex-between" style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '12px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Year</span>
                            <span style={{ fontWeight: 'bold' }}>{vehicle.year}</span>
                        </div>
                        <div className="spec-item flex-between" style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '12px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Mileage</span>
                            <span style={{ fontWeight: 'bold' }}>{vehicle.mileage} km</span>
                        </div>
                        <div className="spec-item flex-between" style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '12px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Transmission</span>
                            <span style={{ fontWeight: 'bold' }}>{vehicle.transmission}</span>
                        </div>
                        <div className="spec-item flex-between" style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '12px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Fuel Type</span>
                            <span style={{ fontWeight: 'bold' }}>{vehicle.fuelType}</span>
                        </div>
                        <div className="spec-item flex-between" style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '12px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Condition</span>
                            <span style={{ fontWeight: 'bold' }}>{vehicle.condition}</span>
                        </div>
                        <div className="spec-item flex-between" style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '12px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Location</span>
                            <span style={{ fontWeight: 'bold' }}>{vehicle.district}, {vehicle.city}</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="mb-4">Description</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
                            {vehicle.description || 'No description provided.'}
                        </p>
                    </div>

                    <div className="flex-center gap-4 mt-auto">
                        <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.2rem' }}>Contact Seller</button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default VehicleDetails;
