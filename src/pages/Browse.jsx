import { useState, useEffect } from 'react';
import { listingsAPI, buyRequestsAPI } from '../config/api';
import { useAuth } from '../context/AuthContext';
import './Browse.css';

const Browse = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestingListingId, setRequestingListingId] = useState(null);
  const [requestSuccess, setRequestSuccess] = useState('');
  const { isAuthenticated, user } = useAuth();

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

  const handleRequestToBuy = async (listing_id, seller_id) => {
    if (!isAuthenticated) {
      setError('Please log in to make a request');
      return;
    }

    if (user.id === seller_id) {
      setError('Cannot request to buy your own listing');
      return;
    }

    setRequestingListingId(listing_id);
    try {
      await buyRequestsAPI.create(listing_id);
      setRequestSuccess(`Request sent! The seller will respond soon.`);
      setError('');
      // Clear success message after 3 seconds
      setTimeout(() => setRequestSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send request. Please try again.');
      console.error(err);
    } finally {
      setRequestingListingId(null);
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
      {requestSuccess && <div className="success-banner">{requestSuccess}</div>}

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
                    by {listing.seller_name || listing.display_name || 'Anonymous'}
                  </span>
                </div>
                
                <div className="listing-meta">
                  <span className="listing-category">{listing.category_name || 'Uncategorized'}</span>
                  <span className="listing-date">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </span>
                </div>

                {isAuthenticated && user.id !== listing.seller_id && (
                  <button 
                    className="btn-contact"
                    onClick={() => handleRequestToBuy(listing.id, listing.seller_id)}
                    disabled={requestingListingId === listing.id}
                  >
                    {requestingListingId === listing.id ? 'Sending...' : 'Request to Buy'}
                  </button>
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
