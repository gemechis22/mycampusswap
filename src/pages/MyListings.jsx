import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI } from '../config/api';
import { useAuth } from '../context/AuthContext';
import './MyListings.css';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAuthenticated) {
      loadMyListings();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const loadMyListings = async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getMy();
      setListings(response.data.listings || []);
      setError('');
    } catch (err) {
      setError('Failed to load your listings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pending Review', class: 'badge-pending' },
      active: { text: 'Active', class: 'badge-active' },
      rejected: { text: 'Rejected', class: 'badge-rejected' },
      reserved: { text: 'Reserved', class: 'badge-reserved' },
      sold: { text: 'Sold', class: 'badge-sold' },
    };
    return badges[status] || { text: status, class: '' };
  };

  if (loading) {
    return (
      <div className="my-listings-container">
        <div className="loading">Loading your listings...</div>
      </div>
    );
  }

  return (
    <div className="my-listings-container">
      <div className="page-header">
        <h1>My Listings</h1>
        <button onClick={() => navigate('/create')} className="btn-create">
          + New Listing
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {listings.length === 0 ? (
        <div className="empty-state">
          <h2>No listings yet</h2>
          <p>Create your first listing to start selling!</p>
          <button onClick={() => navigate('/create')} className="btn-primary">
            Create Listing
          </button>
        </div>
      ) : (
        <div className="my-listings-grid">
          {listings.map((listing) => {
            const badge = getStatusBadge(listing.status);
            return (
              <div key={listing.id} className="my-listing-card">
                <div className="listing-image">
                  {listing.images && listing.images.length > 0 ? (
                    <>
                      <img src={listing.images[0].image_data} alt={listing.title} />
                      {listing.images.length > 1 && (
                        <div className="image-count-badge">{listing.images.length} photos</div>
                      )}
                    </>
                  ) : listing.image_url ? (
                    <img src={listing.image_url} alt={listing.title} />
                  ) : (
                    <div className="placeholder-image">📦</div>
                  )}
                  <span className={`status-badge ${badge.class}`}>
                    {badge.text}
                  </span>
                </div>

                <div className="listing-content">
                  <h3>{listing.title}</h3>
                  <p className="description">{listing.description}</p>
                  
                  <div className="listing-info">
                    <span className="price">
                      ${((listing.price_cents || 0) / 100).toFixed(2)}
                    </span>
                    <span className="category">{listing.category_name}</span>
                  </div>

                  <div className="listing-dates">
                    <span>Created: {new Date(listing.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyListings;
