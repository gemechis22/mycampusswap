import { useState, useEffect } from 'react';
import { listingsAPI } from '../config/api';
import { useAuth } from '../context/AuthContext';
import './Browse.css';

const Browse = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getActive();
      setListings(response.data.listings || []);
      setError('');
    } catch (err) {
      setError('Failed to load listings. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="browse-container">
        <div className="loading">Loading listings...</div>
      </div>
    );
  }

  return (
    <div className="browse-container">
      <div className="browse-header">
        <h1>York University Marketplace</h1>
        <p>Buy and sell items within the York community</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {listings.length === 0 ? (
        <div className="empty-state">
          <h2>No listings yet</h2>
          <p>Be the first to post an item for sale!</p>
          {isAuthenticated && (
            <a href="/create" className="btn-primary">Create Listing</a>
          )}
        </div>
      ) : (
        <div className="listings-grid">
          {listings.map((listing) => (
            <div key={listing.id} className="listing-card">
              <div className="listing-image">
                {listing.image_url ? (
                  <img src={listing.image_url} alt={listing.title} />
                ) : (
                  <div className="placeholder-image">📦</div>
                )}
              </div>
              
              <div className="listing-content">
                <h3 className="listing-title">{listing.title}</h3>
                <p className="listing-description">{listing.description}</p>
                
                <div className="listing-footer">
                  <span className="listing-price">
                    ${((listing.price_cents || 0) / 100).toFixed(2)}
                  </span>
                  <span className="listing-seller">
                    by {listing.seller_name || 'Anonymous'}
                  </span>
                </div>
                
                <div className="listing-meta">
                  <span className="listing-category">{listing.category_name}</span>
                  <span className="listing-date">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </span>
                </div>

                {isAuthenticated && (
                  <button className="btn-contact">Contact Seller</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Browse;
