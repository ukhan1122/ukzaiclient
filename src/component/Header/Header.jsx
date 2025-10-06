import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaUserCircle, FaShoppingCart, FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import { CartContext } from "../../admin/Cartcontext";
import "./Header.css";

const Header = () => {
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount, setCartCount } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const loginTime = localStorage.getItem("loginTime");

    console.log("Stored User:", storedUser);

    if (storedUser) {
      const user = JSON.parse(storedUser);
      console.log("Parsed User:", user);
      setUserName(user.name || "");
      
      // Detect role - if no role field, check by email or name
      let role = user.role;
      if (!role) {
        // Fallback: Check if user is admin by email or name
        if (user.email === "explain816@gmail.com" || user.name === "Admin") {
          role = "admin";
        } else {
          role = "user";
        }
      }
      setUserRole(role);

      if (loginTime) {
        const now = Date.now();
        if (now - parseInt(loginTime, 10) > 3600000) {
          handleLogout();
        }
      }
    } else {
      setUserName("");
      setUserRole("");
    }

    if (location.pathname === "/cart") {
      setCartCount(0);
    }
  }, [location.pathname, setCartCount]);

  const handleIconClick = () => {
    if (!userName) navigate("/login");
    else setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loginTime");
    setUserName("");
    setUserRole("");
    setCartCount(0);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const handleCartClick = () => {
    navigate("/cart");
    setCartCount(0);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setDropdownOpen(false);
  };

  const closeAllMenus = () => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleProfileClick = () => {
    closeAllMenus();
    console.log("User Role:", userRole);
    // Navigate to admin dashboard if user is admin, otherwise to user profile
    if (userRole === "admin") {
      navigate("/admin");
    } else {
      navigate("/profile");
    }
  };

  const userInitial = userName ? userName.charAt(0).toUpperCase() : null;

  return (
    <header className="header">
      <div className="header-container">
        {/* Left: Hamburger menu for mobile */}
        <button className="menu-toggle" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>

        {/* Center: Logo */}
        <div className="logo-section">
          <Link to="/" className="logo" onClick={closeAllMenus}>
            <span className="logo-text">UKZAI</span>
            {/* <span className="logo-subtitle">Premium Store</span> */}
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <ul>
            <li><Link to="/" onClick={closeAllMenus}>Home</Link></li>
            <li><Link to="/latest" onClick={closeAllMenus}>New Arrivals</Link></li>
            <li><Link to="/shipping" onClick={closeAllMenus}>Shipping</Link></li>
            <li><Link to="/about" onClick={closeAllMenus}>About</Link></li>
            <li><Link to="/contact" onClick={closeAllMenus}>Contact</Link></li>
          </ul>
        </nav>

        {/* Right: Auth Section */}
        <div className="auth-section">
          <div className="cart-icon" onClick={handleCartClick}>
            <FaShoppingCart size={20} />
            {cartCount > 0 && location.pathname !== "/cart" && (
              <span className="cart-count">
                {cartCount}
              </span>
            )}
          </div>

          <div className="user-profile" onClick={handleIconClick}>
            <div className="user-avatar">
              {userInitial ? userInitial : <FaUserCircle size={24} />}
            </div>
            {userName && (
              <span className="user-name">{userName}</span>
            )}
            <FaChevronDown size={12} className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} />
          </div>

          {dropdownOpen && userName && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={handleProfileClick}>
                {userRole === "admin" ? "Admin Dashboard" : "My Account"}
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item" onClick={handleLogout}>
                Sign Out
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className={`mobile-nav ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-nav-content">
          <div className="mobile-user-info">
            {userName ? (
              <>
                <div className="mobile-user-avatar">
                  {userInitial ? userInitial : <FaUserCircle size={32} />}
                </div>
                <div className="mobile-user-details">
                  <div className="mobile-user-name">{userName}</div>
                  <div className="mobile-user-role">{userRole === 'admin' ? 'Administrator' : 'Customer'}</div>
                </div>
              </>
            ) : (
              <button 
                className="mobile-login-btn"
                onClick={() => {
                  closeAllMenus();
                  navigate("/login");
                }}
              >
                Sign In
              </button>
            )}
          </div>
          
          <ul className="mobile-nav-list">
            <li><Link to="/" onClick={closeAllMenus}>Home</Link></li>
            <li><Link to="/latest" onClick={closeAllMenus}>New Arrivals</Link></li>
            <li><Link to="/shipping" onClick={closeAllMenus}>Shipping Info</Link></li>
            <li><Link to="/about" onClick={closeAllMenus}>About Us</Link></li>
            <li><Link to="/contact" onClick={closeAllMenus}>Contact</Link></li>
            {userName && (
              <>
                <li><Link to={userRole === "admin" ? "/admin" : "/profile"} onClick={closeAllMenus}>
                  {userRole === "admin" ? "Admin Dashboard" : "My Account"}
                </Link></li>
                <li>
                  <button onClick={handleLogout} className="mobile-logout-btn">
                    Sign Out
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;