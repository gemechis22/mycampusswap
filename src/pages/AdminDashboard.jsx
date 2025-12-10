import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI } from '../config/api';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [pendingListings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      if (!isAdmin()) {
        navigate('/');
        return;
      }
      loadPendingListings();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const loadPendingListings = async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getPending();
      setListings(response.data.listings || []);
      setError('');
    } catch (err) {
      setError('Failed to load pending listings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (listingId) => {
    if (!confirm('Approve this listing?')) return;
    
    try {
      setProcessingId(listingId);
      await listingsAPI.approve(listingId);
      
      // Remove from pending list
      setListings(pendingListings.filter(l => l.id !== listingId));
      alert('Listing approved! It will now appear on the Browse page.');
    } catch (err) {
      alert('Failed to approve listing: ' + (err.response?.data?.error || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (listingId) => {
    if (!confirm('Reject this listing? This cannot be undone.')) return;
    
    try {
      setProcessingId(listingId);
      await listingsAPI.reject(listingId);
      
      // Remove from pending list
      setListings(pendingListings.filter(l => l.id !== listingId));
      alert('Listing rejected.');
    } catch (err) {
      alert('Failed to reject listing: ' + (err.response?.data?.error || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Review and approve pending listings</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {pendingListings.length === 0 ? (
        <div className="empty-state">
          <h2>No pending listings</h2>
          <p>All listings have been reviewed!</p>
        </div>
      ) : (
        <div className="pending-listings">
          <div className="stats-card">
            <span className="stats-number">{pendingListings.length}</span>
            <span className="stats-label">Pending Reviews</span>
          </div>

          <div className="listings-list">
            {pendingListings.map((listing) => (
              <div key={listing.id} className="admin-listing-card">
                <div className="listing-main">
                  <div className="listing-image-section">
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
                  </div>

                  <div className="listing-details">
                    <h3>{listing.title}</h3>
                    <p className="description">{listing.description}</p>
                    
                    <div className="listing-info-grid">
                      <div className="info-item">
                        <span className="label">Price</span>
                        <span className="value price">
                          ${((listing.price_cents || 0) / 100).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="info-item">
                        <span className="label">Category</span>
                        <span className="value">{listing.category_name}</span>
                      </div>
                      
                      <div className="info-item">
                        <span className="label">Condition</span>
                        <span className="value condition">
                          {listing.condition.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="info-item">
                        <span className="label">Seller</span>
                        <span className="value">{listing.seller_name}</span>
                      </div>
                      
                      <div className="info-item">
                        <span className="label">Posted</span>
                        <span className="value">
                          {new Date(listing.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="listing-actions">
                  <button
                    onClick={() => handleApprove(listing.id)}
                    disabled={processingId === listing.id}
                    className="btn-approve"
                  >
                    {processingId === listing.id ? '...' : '✓ Approve'}
                  </button>
                  
                  <button
                    onClick={() => handleReject(listing.id)}
                    disabled={processingId === listing.id}
                    className="btn-reject"
                  >
                    {processingId === listing.id ? '...' : '✗ Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
