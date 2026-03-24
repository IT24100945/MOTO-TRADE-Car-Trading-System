import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { socket } from '../services/socket';

const Home = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters state
    const [filters, setFilters] = useState({
        brand: '',
        model: '',
        minPrice: '',
        maxPrice: '',
        yearMin: '',
        yearMax: '',
        fuelType: '',
        transmission: '',
        district: '',
        availabilityStatus: '',
        sort: 'newest'
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        fetchVehicles();

        socket.on('new_vehicle', (vehicle) => {
            setVehicles(prev => [vehicle, ...prev]);
        });

        socket.on('vehicle_sold', (data) => {
            setVehicles(prev => prev.map(v => v.id === data.id ? { ...v, availabilityStatus: 'Sold' } : v));
        });

        return () => {
            socket.off('new_vehicle');
            socket.off('vehicle_sold');
        };
    }, []);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const { data } = await axios.get(`http://localhost:5000/api/v1/vehicles?${queryParams}`);
            if (data.success) {
                setVehicles(data.data);
            }
        } catch (error) {
            console.error('Error fetching vehicles', error);
        }
        setLoading(false);
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const applyFilters = () => {
        fetchVehicles();
    };

    const handleSearchChange = async (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (value.length > 2) {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/v1/vehicles/suggestions?query=${value}`);
                setSuggestions(data.data);
            } catch (error) { }
        } else {
            setSuggestions([]);
        }
    };

    const selectSuggestion = (suggestion) => {
        setSearchQuery(`${suggestion.brand} ${suggestion.model}`);
        setFilters({ ...filters, brand: suggestion.brand, model: suggestion.model });
        setSuggestions([]);
        fetchVehicles();
    };

    return (
        <div className="home padding-y-2">
            <div className="hero flex-center flex-column text-center mb-8" style={{ padding: '8rem 1rem', background: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.95)), url("https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop") center/cover', borderRadius: '24px' }}>
                <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>Your Trusted Car Marketplace</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.5rem', maxWidth: '800px', marginBottom: '3rem' }}>Buy, Sell & Customize Your Ride</p>

                <div style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
                    <input
                        type="text"
                        placeholder="Search by brand, model, or city..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        style={{ padding: '16px 24px', fontSize: '1.1rem', borderRadius: '50px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'white' }}
                    />
                    {suggestions.length > 0 && (
                        <div className="card glass-panel" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '10px', zIndex: 10, padding: '10px' }}>
                            {suggestions.map(s => (
                                <div key={s.id} onClick={() => selectSuggestion(s)} style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
                                    {s.brand} {s.model} ({s.year}) - {s.city}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }}>
                <aside className="filters card glass-panel" style={{ padding: '1.5rem', position: 'sticky', top: '2rem' }}>
                    <h3 className="mb-4">Advanced Filters</h3>

                    <div className="flex-column gap-4 mb-6">
                        <label>Brand</label>
                        <input type="text" name="brand" value={filters.brand} onChange={handleFilterChange} placeholder="e.g. Toyota" />

                        <label>Price Range (LKR)</label>
                        <div className="flex-between gap-4">
                            <input type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} placeholder="Min" />
                            <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} placeholder="Max" />
                        </div>

                        <label>Year</label>
                        <div className="flex-between gap-4">
                            <input type="number" name="yearMin" value={filters.yearMin} onChange={handleFilterChange} placeholder="From" />
                            <input type="number" name="yearMax" value={filters.yearMax} onChange={handleFilterChange} placeholder="To" />
                        </div>

                        <label>Fuel Type</label>
                        <select name="fuelType" value={filters.fuelType} onChange={handleFilterChange}>
                            <option value="">All</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Electric">Electric</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>

                        <label>Transmission</label>
                        <select name="transmission" value={filters.transmission} onChange={handleFilterChange}>
                            <option value="">All</option>
                            <option value="Automatic">Automatic</option>
                            <option value="Manual">Manual</option>
                            <option value="Tiptronic">Tiptronic</option>
                        </select>

                        <label>Sort By</label>
                        <select name="sort" value={filters.sort} onChange={handleFilterChange}>
                            <option value="newest">Newest Listed</option>
                            <option value="priceAsc">Price: Low to High</option>
                            <option value="priceDesc">Price: High to Low</option>
                            <option value="oldest">Oldest Year</option>
                            <option value="mileageAsc">Lowest Mileage</option>
                        </select>
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={applyFilters}>Apply Filters</button>
                </aside>

                <main>
                    {loading ? (
                        <div className="flex-center" style={{ height: '300px' }}><div className="spinner"></div></div>
                    ) : vehicles.length === 0 ? (
                        <div className="flex-center flex-column" style={{ height: '300px', color: 'var(--text-muted)' }}>
                            <h2>No cars found.</h2>
                            <p>Try adjusting your filters.</p>
                        </div>
                    ) : (
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                            {vehicles.map(vehicle => (
                                <Link to={`/vehicle/${vehicle.id}`} key={vehicle.id} className="card glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ height: '220px', backgroundColor: 'var(--surface-light)', position: 'relative' }}>
                                        {vehicle.VehicleImages && vehicle.VehicleImages.length > 0 ? (
                                            <img src={`http://localhost:5000${vehicle.VehicleImages[0].imageUrl}`} alt={vehicle.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div className="flex-center" style={{ width: '100%', height: '100%', color: 'var(--text-muted)' }}>No Image</div>
                                        )}
                                        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: '8px' }}>
                                            <span className={`badge ${vehicle.availabilityStatus === 'Available' ? 'badge-available' : 'badge-sold'}`}>
                                                {vehicle.availabilityStatus}
                                            </span>
                                            {vehicle.condition === 'Brand New' && <span className="badge" style={{ background: 'var(--primary)', color: 'white' }}>NEW</span>}
                                        </div>
                                    </div>

                                    <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div className="flex-between mb-2">
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{vehicle.brand} {vehicle.model}</span>
                                            <span style={{ fontWeight: 600 }}>{vehicle.year}</span>
                                        </div>
                                        <h3 className="mb-3" style={{ fontSize: '1.3rem', lineHeight: 1.3 }}>{vehicle.title}</h3>

                                        <div className="grid mt-auto mb-4" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                            <div className="flex-center" style={{ background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '6px' }}>⚙️ {vehicle.transmission}</div>
                                            <div className="flex-center" style={{ background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '6px' }}>⛽ {vehicle.fuelType}</div>
                                            <div className="flex-center" style={{ background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '6px' }}>🛣️ {vehicle.mileage} km</div>
                                            <div className="flex-center" style={{ background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '6px' }}>📍 {vehicle.district}</div>
                                        </div>

                                        <div className="flex-between">
                                            <p className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: '800' }}>Rs {vehicle.price.toLocaleString()}</p>
                                            <button className="btn btn-outline" style={{ padding: '8px 16px', borderRadius: '20px' }}>View Details</button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Home;
