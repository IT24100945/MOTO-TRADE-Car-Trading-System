import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const AddVehicle = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        title: '', brand: '', model: '', year: new Date().getFullYear(), price: '', mileage: '',
        fuelType: 'Petrol', transmission: 'Automatic', condition: 'Used',
        district: '', city: '', description: '', videoType: 'url', videoUrl: ''
    });
    const [images, setImages] = useState(null);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [videoFile, setVideoFile] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
        setImagePreviews(files.map(file => URL.createObjectURL(file)));
    };

    const handleVideoChange = (e) => {
        setVideoFile(e.target.files[0]);
    };

    const validateForm = () => {
        if (formData.price <= 0) return 'Price must be positive';
        if (formData.year < 1886 || formData.year > new Date().getFullYear() + 1) return 'Invalid Year';
        if (!images || images.length === 0) return 'At least one image is required';
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

        // Handle video
        if (formData.videoType === 'url' && formData.videoUrl) {
            dataToSend.append('videoUrl', formData.videoUrl);
        } else if (formData.videoType === 'upload' && videoFile) {
            dataToSend.append('video', videoFile);
        }

        // Handle images
        if (images) {
            for (let i = 0; i < images.length; i++) {
                dataToSend.append('images', images[i]);
            }
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/v1/vehicles', dataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            navigate('/dashboard');
        } catch (err) {
            console.error('Error adding vehicle', err);
            setError(err.response?.data?.message || 'Server Error. Could not process images/video.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="padding-y-2">
            <div className="card glass-panel" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
                <div className="flex-between mb-6">
                    <h2 className="section-title" style={{ marginBottom: 0 }}>Create Vehicle Listing</h2>
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
                    </div>

                    <div className="mt-4">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full"></textarea>
                    </div>

                    <div className="mt-6 p-4" style={{ backgroundColor: 'var(--surface-light)', borderRadius: '8px' }}>
                        <h4 className="mb-2">Media Uploads</h4>

                        <div className="mb-4">
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Images (Max 10) *</label>
                            <input type="file" multiple accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} required />
                            {imagePreviews.length > 0 && (
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                                    {imagePreviews.map((src, idx) => (
                                        <img key={idx} src={src} alt="preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Video (Optional)</label>
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
                            {loading ? 'Publishing...' : 'Publish Listing'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVehicle;
