import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

    // Debug logging
    console.log('Navbar user:', user);
    console.log('Navbar isAdmin():', isAdmin());

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-york">YORK</span>
          <span className="brand-campus">CampusSwap</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-link">Browse</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/create" className="nav-link">Sell Item</Link>
              <Link to="/my-listings" className="nav-link">My Listings</Link>
              <Link to="/incoming-requests" className="nav-link">Incoming Requests</Link>
              
                {isAdmin() && (
                <Link to="/admin" className="nav-link admin-link">Admin</Link>
              )}
              
              <div className="user-menu">
                <span className="user-name">👤 {user?.display_name}</span>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn-signup">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
