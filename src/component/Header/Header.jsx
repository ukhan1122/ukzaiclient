import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaUserCircle, FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
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
            <button onClick={handleProfileClick} style={{
              background: "none",
              border: "none",
              color: "#3cff00",
              textAlign: "left",
              width: "100%",
              padding: "10px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold"
            }}>
              {userRole === "admin" ? "Admin" : "Profile"}
            </button>
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