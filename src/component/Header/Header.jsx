import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaUserCircle, FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import { CartContext } from "../../admin/Cartcontext";
import "./Header.css";

const Header = () => {
  const [userName, setUserName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount, setCartCount } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const loginTime = localStorage.getItem("loginTime");

    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name || "");

      if (loginTime) {
        const now = Date.now();
        if (now - parseInt(loginTime, 10) > 3600000) {
          handleLogout();
        }
      }
    } else {
      setUserName("");
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

  const userInitial = userName ? userName.charAt(0).toUpperCase() : null;

  return (
    <header className="header">
      {/* Hamburger menu on left */}
      <button className="menu-toggle" onClick={toggleMobileMenu}>
        {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Logo in center */}
      <div className="logo">
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }} onClick={closeAllMenus}>
          UKZAI
        </Link>
      </div>

      {/* Auth section on right */}
      <div className="auth-dropdown-container">
        <div className="cart-icon" onClick={handleCartClick}>
          <FaShoppingCart size={28} color="#3cff00" />
          {cartCount > 0 && location.pathname !== "/cart" && (
            <span className="cart-count">
              {cartCount}
            </span>
          )}
        </div>

        <div className="user-circle" onClick={handleIconClick}>
          {userInitial ? userInitial : <FaUserCircle size={32} />}
        </div>

        {dropdownOpen && userName && (
          <div className="dropdown-menu">
            <Link to="/profile" onClick={closeAllMenus}>Profile</Link>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>

      {/* Navigation menu - appears below when hamburger is clicked */}
      <nav className={`nav ${mobileMenuOpen ? 'active' : ''}`}>
        <ul>
          <li><Link to="/" onClick={closeAllMenus}>Home</Link></li>
          <li><Link to="/contact" onClick={closeAllMenus}>Contact Us</Link></li>
          <li><Link to="/about" onClick={closeAllMenus}>About</Link></li>
          <li><Link to="/shipping" onClick={closeAllMenus}>Shipping</Link></li>
          <li><Link to="/latest" onClick={closeAllMenus}>Latest Product</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;