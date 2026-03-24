import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

const EditVehicle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        title: '', brand: '', model: '', year: new Date().getFullYear(), price: '', mileage: '',
        fuelType: 'Petrol', transmission: 'Automatic', condition: 'Used',
        district: '', city: '', description: '', videoType: 'url', videoUrl: '',
        availabilityStatus: 'Available'
    });

    const [existingImages, setExistingImages] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);

    const [newImages, setNewImages] = useState(null);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [videoFile, setVideoFile] = useState(null);

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/v1/vehicles/${id}`);
                if (data.success) {
                    const v = data.data;
                    setFormData({
                        title: v.title, brand: v.brand, model: v.model, year: v.year, price: v.price,
                        mileage: v.mileage, fuelType: v.fuelType, transmission: v.transmission,
                        condition: v.condition, district: v.district, city: v.city, description: v.description,
                        availabilityStatus: v.availabilityStatus,
                        videoType: v.videoUrl?.startsWith('http') ? 'url' : (v.videoUrl ? 'upload' : 'url'),
                        videoUrl: v.videoUrl || ''
                    });
                    setExistingImages(v.VehicleImages || []);
                }
            } catch (err) {
                setError('Failed to load vehicle details');
            }
        };
        fetchVehicle();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNewImageChange = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(files);
        setNewImagePreviews(files.map(file => URL.createObjectURL(file)));
    };

    const handleVideoChange = (e) => {
        setVideoFile(e.target.files[0]);
    };

    const handleDeleteExistingImage = (imageId) => {
        setImagesToDelete(prev => [...prev, imageId]);
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
    };

    const validateForm = () => {
        if (formData.price <= 0) return 'Price must be positive';
        if (formData.year < 1886 || formData.year > new Date().getFullYear() + 1) return 'Invalid Year';
        if (existingImages.length === 0 && (!newImages || newImages.length === 0)) {
            return 'At least one image is required';
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) return setError(validationError);

        setLoading(true);
        setError(null);

        const dataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            if (key !== 'videoType' && key !== 'videoUrl') {
                dataToSend.append(key, formData[key]);
            }
        });

        if (imagesToDelete.length > 0) {
            dataToSend.append('imagesToDelete', JSON.stringify(imagesToDelete));
        }

        // Handle video
        if (formData.videoType === 'url' && formData.videoUrl) {
            dataToSend.append('videoUrl', formData.videoUrl);
        } else if (formData.videoType === 'upload' && videoFile) {
            dataToSend.append('video', videoFile);
        } else if (formData.videoUrl === '') {
            dataToSend.append('videoUrl', '');
        }

        // Handle new images
        if (newImages) {
            for (let i = 0; i < newImages.length; i++) {
                dataToSend.append('images', newImages[i]);
            }
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/v1/vehicles/${id}`, dataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            navigate('/dashboard');
        } catch (err) {
            console.error('Error updating vehicle', err);
            setError(err.response?.data?.message || 'Server Error. Could not process update.');
            setLoading(false);
        }
    };

    return (
        <div className="padding-y-2">
            <div className="card glass-panel" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
                <div className="flex-between mb-6">
                    <h2 className="section-title" style={{ marginBottom: 0 }}>Edit Vehicle Listing</h2>
                    <Link to="/dashboard" className="btn btn-outline">Cancel</Link>
                </div>

                {error && <div className="alert alert-danger mb-4" style={{ color: 'red', border: '1px solid red', padding: '1rem', borderRadius: '4px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        <div>
                            <label>Title *</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full" />
                        </div>
                        <div>
                            <label>Brand *</label>
                            <input type="text" name="brand" value={formData.brand} onChange={handleChange} required className="w-full" />
                        </div>
                        <div>
                            <label>Model *</label>
                            <input type="text" name="model" value={formData.model} onChange={handleChange} required className="w-full" />
                        </div>
                        <div>
                            <label>Year *</label>
                            <input type="number" name="year" value={formData.year} onChange={handleChange} required className="w-full" />
                        </div>
                        <div>
                            <label>Price (LKR) *</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full" />
                        </div>
                        <div>
                            <label>Mileage (km) *</label>
                            <input type="number" name="mileage" value={formData.mileage} onChange={handleChange} required className="w-full" />
                        </div>
                        <div>
                            <label>Fuel Type</label>
                            <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full">
                                <option value="Petrol">Petrol</option>
                                <option value="Diesel">Diesel</option>
                                <option value="Electric">Electric</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                        <div>
                            <label>Transmission</label>
                            <select name="transmission" value={formData.transmission} onChange={handleChange} className="w-full">
                                <option value="Automatic">Automatic</option>
                                <option value="Manual">Manual</option>
                                <option value="Tiptronic">Tiptronic</option>
                            </select>
                        </div>
                        <div>
                            <label>Condition</label>
                            <select name="condition" value={formData.condition} onChange={handleChange} className="w-full">
                                <option value="Used">Used</option>
                                <option value="Brand New">Brand New</option>
                                <option value="Reconditioned">Reconditioned</option>
                            </select>
                        </div>
                        <div>
                            <label>District *</label>
                            <input type="text" name="district" value={formData.district} onChange={handleChange} required className="w-full" />
                        </div>
                        <div>
                            <label>City *</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full" />
                        </div>
                        <div>
                            <label>Status</label>
                            <select name="availabilityStatus" value={formData.availabilityStatus} onChange={handleChange} className="w-full">
                                <option value="Available">Available</option>
                                <option value="Sold">Sold</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full"></textarea>
                    </div>

                    <div className="mt-6 p-4" style={{ backgroundColor: 'var(--surface-light)', borderRadius: '8px' }}>
                        <h4 className="mb-2">Media Uploads</h4>

                        <div className="mb-4">
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Existing Images</label>
                            {existingImages.length > 0 ? (
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                                    {existingImages.map((img) => (
                                        <div key={img.id} style={{ position: 'relative' }}>
                                            <img src={`http://localhost:5000${img.imageUrl}`} alt="existing" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                                            <button
                                                type="button"
                                                style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', width: '20px', height: '20px', border: 'none', cursor: 'pointer', lineHeight: '18px', textAlign: 'center' }}
                                                onClick={() => handleDeleteExistingImage(img.id)}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : <span style={{ color: 'var(--text-muted)' }}>No images available.</span>}
                        </div>

                        <div className="mb-4">
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Add New Images (Max 10)</label>
                            <input type="file" multiple accept="image/png, image/jpeg, image/webp" onChange={handleNewImageChange} />
                            {newImagePreviews.length > 0 && (
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                                    {newImagePreviews.map((src, idx) => (
                                        <img key={idx} src={src} alt="new-preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Video (Optional)</label>
                            {formData.videoUrl && !videoFile && (
                                <div className="mb-2" style={{ color: 'var(--primary)' }}>
                                    Current Video: {formData.videoUrl.startsWith('http') ? <a href={formData.videoUrl} target="_blank" rel="noreferrer">External Link</a> : 'Uploaded File'}
                                    <button type="button" onClick={() => setFormData({ ...formData, videoUrl: '' })} style={{ marginLeft: '10px', color: 'red', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Remove Video</button>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                <label><input type="radio" name="videoType" value="url" checked={formData.videoType === 'url'} onChange={handleChange} /> YouTube/External URL</label>
                                <label><input type="radio" name="videoType" value="upload" checked={formData.videoType === 'upload'} onChange={handleChange} /> Upload Video File</label>
                            </div>

                            {formData.videoType === 'url' ? (
                                <input type="url" name="videoUrl" placeholder="https://youtube.com/..." value={formData.videoUrl} onChange={handleChange} className="w-full" />
                            ) : (
                                <input type="file" accept="video/mp4, video/webm, video/mkv" onChange={handleVideoChange} />
                            )}
                        </div>
                    </div>

                    <div className="flex-end mt-6">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Listing'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditVehicle;
