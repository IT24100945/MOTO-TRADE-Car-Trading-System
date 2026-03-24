import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Compare = () => {
    const [vehicles, setVehicles] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [comparisonData, setComparisonData] = useState([]);

    useEffect(() => {
        fetchVehicles();
    }, []);

    useEffect(() => {
        if (selectedIds.length > 0) {
            const selectedVehicles = vehicles.filter(v => selectedIds.includes(v.id));
            setComparisonData(selectedVehicles);
        } else {
            setComparisonData([]);
        }
    }, [selectedIds, vehicles]);

    const fetchVehicles = async () => {
        try {
            const { data } = await axios.get(`http://localhost:5000/api/v1/vehicles`);
            if (data.success) {
                setVehicles(data.data);
            }
        } catch (error) {
            console.error('Error fetching vehicles', error);
        }
    };

    const handleSelect = (e) => {
        const id = e.target.value;
        if (!id) return;
        if (selectedIds.includes(id)) return;
        if (selectedIds.length >= 3) {
            alert("You can only compare up to 3 vehicles.");
            return;
        }
        setSelectedIds([...selectedIds, id]);
    };

    const removeVehicle = (id) => {
        setSelectedIds(selectedIds.filter(selId => selId !== id));
    };

    // Find lowest/highest logic
    const getHighlightClass = (type, value) => {
        if (comparisonData.length < 2) return '';

        let isBest = false;

        if (type === 'price') {
            const minVal = Math.min(...comparisonData.map(v => v.price));
            isBest = value === minVal;
        } else if (type === 'mileage') {
            const minVal = Math.min(...comparisonData.map(v => v.mileage));
            isBest = value === minVal;
        } else if (type === 'year') {
            const maxVal = Math.max(...comparisonData.map(v => v.year));
            isBest = value === maxVal;
        }

        return isBest ? { backgroundColor: 'rgba(0, 230, 118, 0.1)', color: 'var(--success)', fontWeight: 'bold' } : {};
    };

    return (
        <div className="container padding-y-2">
            <h1 className="section-title text-center mb-8">Compare Vehicles</h1>

            <div className="flex-center mb-8">
                <div style={{ maxWidth: '600px', width: '100%' }}>
                    <select onChange={handleSelect} value="" style={{ padding: '16px', fontSize: '1.1rem' }}>
                        <option value="">Select a vehicle to add to comparison...</option>
                        {vehicles.map(v => (
                            <option key={v.id} value={v.id} disabled={selectedIds.includes(v.id)}>
                                {v.brand} {v.model} ({v.year}) - Rs {v.price}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {comparisonData.length > 0 ? (
                <div className="card glass-panel flex-column" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <th style={{ padding: '20px', width: '25%' }}>Feature</th>
                                {comparisonData.map(v => (
                                    <th key={v.id} style={{ padding: '20px', width: '25%' }}>
                                        <div className="flex-between">
                                            <span>{v.title}</span>
                                            <button onClick={() => removeVehicle(v.id)} style={{ color: 'var(--danger)', fontSize: '1.2rem' }}>&times;</button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ padding: '20px', borderTop: '1px solid var(--border)', fontWeight: 'bold' }}>Image</td>
                                {comparisonData.map(v => (
                                    <td key={`img-${v.id}`} style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>
                                        {v.VehicleImages && v.VehicleImages.length > 0 ? (
                                            <div style={{ width: '100%', height: '150px', borderRadius: '8px', overflow: 'hidden' }}>
                                                <img src={`http://localhost:5000${v.VehicleImages[0].imageUrl}`} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        ) : (
                                            <div className="flex-center" style={{ width: '100%', height: '150px', background: 'var(--surface-light)', borderRadius: '8px', color: 'var(--text-muted)' }}>No Image</div>
                                        )}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td style={{ padding: '20px', borderTop: '1px solid var(--border)', fontWeight: 'bold' }}>Brand & Model</td>
                                {comparisonData.map(v => (
                                    <td key={`brand-${v.id}`} style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>{v.brand} {v.model}</td>
                                ))}
                            </tr>
                            <tr>
                                <td style={{ padding: '20px', borderTop: '1px solid var(--border)', fontWeight: 'bold' }}>Price (LKR)</td>
                                {comparisonData.map(v => (
                                    <td key={`price-${v.id}`} style={{ padding: '20px', borderTop: '1px solid var(--border)', ...getHighlightClass('price', v.price) }}>
                                        {v.price.toLocaleString()}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td style={{ padding: '20px', borderTop: '1px solid var(--border)', fontWeight: 'bold' }}>Year</td>
                                {comparisonData.map(v => (
                                    <td key={`year-${v.id}`} style={{ padding: '20px', borderTop: '1px solid var(--border)', ...getHighlightClass('year', v.year) }}>
                                        {v.year}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td style={{ padding: '20px', borderTop: '1px solid var(--border)', fontWeight: 'bold' }}>Mileage</td>
                                {comparisonData.map(v => (
                                    <td key={`mil-${v.id}`} style={{ padding: '20px', borderTop: '1px solid var(--border)', ...getHighlightClass('mileage', v.mileage) }}>
                                        {v.mileage.toLocaleString()} km
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td style={{ padding: '20px', borderTop: '1px solid var(--border)', fontWeight: 'bold' }}>Fuel Type</td>
                                {comparisonData.map(v => (
                                    <td key={`fuel-${v.id}`} style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>{v.fuelType}</td>
                                ))}
                            </tr>
                            <tr>
                                <td style={{ padding: '20px', borderTop: '1px solid var(--border)', fontWeight: 'bold' }}>Transmission</td>
                                {comparisonData.map(v => (
                                    <td key={`trans-${v.id}`} style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>{v.transmission}</td>
                                ))}
                            </tr>
                            <tr>
                                <td style={{ padding: '20px', borderTop: '1px solid var(--border)', fontWeight: 'bold' }}>Condition</td>
                                {comparisonData.map(v => (
                                    <td key={`cond-${v.id}`} style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>{v.condition}</td>
                                ))}
                            </tr>
                            <tr>
                                <td style={{ padding: '20px', borderTop: '1px solid var(--border)', fontWeight: 'bold' }}>Location</td>
                                {comparisonData.map(v => (
                                    <td key={`loc-${v.id}`} style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>{v.district}, {v.city}</td>
                                ))}
                            </tr>
                            <tr>
                                <td style={{ padding: '20px', borderTop: '1px solid var(--border)', fontWeight: 'bold' }}>Action</td>
                                {comparisonData.map(v => (
                                    <td key={`act-${v.id}`} style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>
                                        <Link to={`/vehicle/${v.id}`} className="btn btn-outline" style={{ display: 'block', textAlign: 'center' }}>View Full Details</Link>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)' }}>
                        Highlights indicate lowest price, lowest mileage, and newest year among compared vehicles.
                    </div>
                </div>
            ) : (
                <div className="flex-center flex-column card glass-panel" style={{ height: '400px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚖️</div>
                    <h2>Select vehicles to compare</h2>
                    <p>Add up to 3 vehicles to see them side-by-side.</p>
                </div>
            )}
        </div>
    );
};

export default Compare;
