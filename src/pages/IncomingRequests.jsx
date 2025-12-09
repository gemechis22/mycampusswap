import { useState, useEffect } from 'react';
import { buyRequestsAPI } from '../config/api';
import { useAuth } from '../context/AuthContext';
import './IncomingRequests.css';

const IncomingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadRequests();
    }
  }, [isAuthenticated]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await buyRequestsAPI.getIncoming();
      setRequests(response.data.requests || []);
      setError('');
    } catch (err) {
      setError('Failed to load requests. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (request_id) => {
    setProcessingId(request_id);
    try {
      await buyRequestsAPI.accept(request_id);
      // Remove from list or update status
      setRequests(requests.filter(r => r.id !== request_id));
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to accept request.');
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request_id) => {
    setProcessingId(request_id);
    try {
      await buyRequestsAPI.reject(request_id);
      // Remove from list
      setRequests(requests.filter(r => r.id !== request_id));
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject request.');
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="requests-container">
        <div className="loading">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="requests-container">
      <div className="requests-header">
        <h1>Incoming Buy Requests</h1>
        <p>Students are interested in your items</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {requests.length === 0 ? (
        <div className="empty-state">
          <h2>No pending requests</h2>
          <p>When students request to buy your items, they'll appear here.</p>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <h3>{request.listing_title}</h3>
                <span className="request-price">
                  ${((request.price_cents || 0) / 100).toFixed(2)}
                </span>
              </div>

              <div className="request-details">
                <p>
                  <strong>Interested Buyer:</strong> {request.buyer_name || 'Anonymous'}
                </p>
                <p>
                  <strong>Email:</strong> {request.buyer_email}
                </p>
                <p>
                  <strong>Requested:</strong> {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="request-actions">
                <button
                  className="btn-accept"
                  onClick={() => handleAccept(request.id)}
                  disabled={processingId === request.id}
                >
                  {processingId === request.id ? 'Processing...' : '✓ Accept'}
                </button>
                <button
                  className="btn-reject"
                  onClick={() => handleReject(request.id)}
                  disabled={processingId === request.id}
                >
                  {processingId === request.id ? 'Processing...' : '✗ Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IncomingRequests;
