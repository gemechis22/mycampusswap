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
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const MAX_IMAGES = 5;

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
      // Use FormData to send files + other data
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price_cents', Math.round(parseFloat(price) * 100));
      formData.append('category_id', parseInt(categoryId));
      formData.append('condition', condition);
      formData.append('quantity', 1);
      
      // Add all images
      images.forEach((imgObj) => {
        formData.append('images', imgObj.file);
      });

      // Create listing with FormData
      await listingsAPI.create(formData);

      setSuccess(true);
      
      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setCategoryId('1');
      setCondition('good');
      setImages([]);

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
    const files = Array.from(e.target.files || []);
    
    // Check total count
    if (images.length + files.length > MAX_IMAGES) {
      setError(`You can only upload up to ${MAX_IMAGES} images`);
      return;
    }

    const newImages = [];
    for (const file of files) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be less than 5MB');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push({
          file,
          preview: reader.result,
          id: Date.now() + Math.random()
        });
        
        if (newImages.length === files.length) {
          setImages([...images, ...newImages]);
          setError('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (id) => {
    setImages(images.filter(img => img.id !== id));
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
            <label>Images (up to {MAX_IMAGES})</label>
            <div className="images-gallery">
              {images.map((imgObj) => (
                <div key={imgObj.id} className="image-thumbnail">
                  <img src={imgObj.preview} alt="Preview" />
                  <button 
                    type="button" 
                    className="btn-remove-thumbnail"
                    onClick={() => removeImage(imgObj.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {images.length < MAX_IMAGES && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={loading}
                />
                <small>
                  You can upload {MAX_IMAGES - images.length} more images. Max 5MB each.
                </small>
              </>
            )}
            {images.length === MAX_IMAGES && (
              <small className="max-reached">Maximum {MAX_IMAGES} images reached</small>
            )}
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
