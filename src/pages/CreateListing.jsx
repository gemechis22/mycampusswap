import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI } from '../config/api';
import { useAuth } from '../context/AuthContext';
import './CreateListing.css';

const CreateListing = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('1');
  const [condition, setCondition] = useState('good');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Categories from your database seed
  const categories = [
    { id: 1, name: 'Textbooks' },
    { id: 2, name: 'Electronics' },
    { id: 3, name: 'Furniture' },
    { id: 4, name: 'Clothing' },
    { id: 5, name: 'Sports Equipment' },
    { id: 6, name: 'Study Materials' },
    { id: 7, name: 'Kitchen Items' },
    { id: 8, name: 'Dorm Essentials' },
    { id: 9, name: 'Art Supplies' },
    { id: 10, name: 'Other' },
  ];

  useEffect(() => {
    // Wait for auth to load before checking
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    // Validation
    if (parseFloat(price) <= 0) {
      setError('Price must be greater than 0');
      setLoading(false);
      return;
    }

    try {
      // Use FormData to send file + other data
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price_cents', Math.round(parseFloat(price) * 100));
      formData.append('category_id', parseInt(categoryId));
      formData.append('condition', condition);
      formData.append('quantity', 1);
      
      if (image) {
        formData.append('image', image);
      }

      // Create listing with FormData
      await listingsAPI.create(formData);

      setSuccess(true);
      
      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setCategoryId('1');
      setCondition('good');
      setImage(null);
      setImagePreview(null);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/my-listings');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="create-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="create-container">
      <div className="create-card">
        <h1>Create New Listing</h1>
        <p className="create-subtitle">
          Your listing will be reviewed by an admin before going live
        </p>

        {success && (
          <div className="success-message">
            ✓ Listing created successfully! Waiting for admin approval...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              placeholder="e.g., TI-84 Calculator"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              placeholder="Describe the item's condition, age, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              maxLength={500}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (CAD) *</label>
              <input
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0.01"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Image</label>
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button 
                  type="button" 
                  className="btn-remove-image"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                >
                  Remove
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
            />
            <small>Max file size: 5MB. Supported: JPG, PNG, GIF</small>
          </div>

          <div className="form-group">
            <label>Condition *</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              required
            >
              <option value="new">New</option>
              <option value="like_new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading || success}>
            {loading ? 'Creating...' : success ? 'Created!' : 'Create Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;
