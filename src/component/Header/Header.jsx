import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaUserCircle, FaShoppingCart } from "react-icons/fa";
import { CartContext } from "../../admin/Cartcontext";
import "./Header.css";

const Header = () => {
  const [userName, setUserName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { cartCount, setCartCount } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const loginTime = localStorage.getItem("loginTime");

    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name || "");

      // Check auto logout (1 hour = 3600000 ms)
      if (loginTime) {
        const now = Date.now();
        if (now - parseInt(loginTime, 10) > 3600000) {
          handleLogout(); // auto logout
        }
      }
    } else {
      setUserName("");
    }

    // Hide cart count if on /cart page
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
    navigate("/login");
  };

  const handleCartClick = () => {
    navigate("/cart");
    setCartCount(0);
  };

  const userInitial = userName ? userName.charAt(0).toUpperCase() : null;

  return (
    <header className="header">
      <div className="logo">
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          UKZAI
        </Link>
      </div>

      <nav className="nav">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/contact">Contact Us</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/shipping">Shipping</Link></li>
          <li><Link to="/latest">Latest Product</Link></li>
        </ul>
      </nav>

      <div className="auth-dropdown-container" style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <div className="cart-icon" onClick={handleCartClick} style={{ position: "relative", cursor: "pointer" }}>
          <FaShoppingCart size={28} color="#3cff00" />
          {cartCount > 0 && location.pathname !== "/cart" && (
            <span style={{
              position: "absolute",
              top: "-8px",
              right: "-10px",
              background: "red",
              color: "#fff",
              fontSize: "14px",
              fontWeight: "bold",
              borderRadius: "50%",
              padding: "2px 6px",
            }}>
              {cartCount}
            </span>
          )}
        </div>

        <div className="user-circle" onClick={handleIconClick}>
          {userInitial ? userInitial : <FaUserCircle size={32} />}
        </div>

        {dropdownOpen && userName && (
          <div className="dropdown-menu">
            <Link to="/profile" onClick={() => setDropdownOpen(false)}>Profile</Link>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
