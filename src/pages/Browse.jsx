import { useState, useEffect } from 'react';
import { listingsAPI, buyRequestsAPI } from '../config/api';
import { useAuth } from '../context/AuthContext';
import './Browse.css';

const Browse = () => {
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

  const initialFilters = {
    categoryId: '',
    priceMin: '',
    priceMax: '',
    condition: '',
  };

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestingListingId, setRequestingListingId] = useState(null);
  const [requestSuccess, setRequestSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    loadListings(initialFilters);
  }, []);

  const buildQueryParams = (currentFilters, search = '') => {
    const params = {};

    if (search.trim()) {
      params.search = search.trim();
    }
    if (currentFilters.categoryId) {
      params.category_id = currentFilters.categoryId;
    }
    if (currentFilters.priceMin) {
      params.price_min = currentFilters.priceMin;
    }
    if (currentFilters.priceMax) {
      params.price_max = currentFilters.priceMax;
    }
    if (currentFilters.condition) {
      params.condition = currentFilters.condition;
    }

    return params;
  };

  const loadListings = async (filtersOverride = filters, searchOverride = searchQuery) => {
    try {
      setLoading(true);
      const queryParams = buildQueryParams(filtersOverride, searchOverride);
      const response = await listingsAPI.getActive(queryParams);
      setListings(response.data.listings || []);
      setError('');
    } catch (err) {
      setError('Failed to load listings. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setError('');
    loadListings(filters, searchQuery);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleApplyFilters = () => {
    if (filters.priceMin && filters.priceMax && Number(filters.priceMin) > Number(filters.priceMax)) {
      setError('Min price cannot be greater than max price.');
      return;
    }

    setError('');
    loadListings(filters, searchQuery);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setError('');
    loadListings(initialFilters, searchQuery);
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

      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search listings by title, description..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleSearchKeyPress}
        />
        <button className="btn-search" onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <button className="btn-toggle-filters" onClick={() => setShowFilters(!showFilters)}>
        {showFilters ? '▼ Hide Filters' : '▶ Show Filters'}
      </button>

      {showFilters && (
        <div className="filters-card">
        <div className="filters-row">
          <div className="filter-field">
            <label>Category</label>
            <select
              value={filters.categoryId}
              onChange={(e) => setFilters((prev) => ({ ...prev, categoryId: e.target.value }))}
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Price min (CAD)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={filters.priceMin}
              onChange={(e) => setFilters((prev) => ({ ...prev, priceMin: e.target.value }))}
            />
          </div>

          <div className="filter-field">
            <label>Price max (CAD)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="100.00"
              value={filters.priceMax}
              onChange={(e) => setFilters((prev) => ({ ...prev, priceMax: e.target.value }))}
            />
          </div>

          <div className="filter-field">
            <label>Condition</label>
            <select
              value={filters.condition}
              onChange={(e) => setFilters((prev) => ({ ...prev, condition: e.target.value }))}
            >
              <option value="">Any</option>
              <option value="new">New</option>
              <option value="like_new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
        </div>

        <div className="filters-actions">
          <button className="btn-secondary" type="button" onClick={handleClearFilters} disabled={loading}>
            Clear
          </button>
          <button className="btn-primary" type="button" onClick={handleApplyFilters} disabled={loading}>
            {loading ? 'Loading...' : 'Apply filters'}
          </button>
        </div>

        <div className="active-filters">
          {filters.categoryId && (
            <span className="filter-pill">Category: {categories.find((c) => String(c.id) === String(filters.categoryId))?.name || 'Selected'}</span>
          )}
          {filters.priceMin && (
            <span className="filter-pill">Min: ${Number(filters.priceMin).toFixed(2)}</span>
          )}
          {filters.priceMax && (
            <span className="filter-pill">Max: ${Number(filters.priceMax).toFixed(2)}</span>
          )}
          {filters.condition && (
            <span className="filter-pill">Condition: {filters.condition.replace('_', ' ')}</span>
          )}
          {!filters.categoryId && !filters.priceMin && !filters.priceMax && !filters.condition && (
            <span className="filter-pill muted">Showing all listings</span>
          )}
        </div>
        </div>
      )}

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
