import React, { useEffect, useState, useContext, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaUserCircle, FaShoppingCart, FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import { CartContext } from "../../pages/Cartcontext";
import "./Header.css";

const Header = () => {
  const [userName,       setUserName]       = useState("");
  const [userRole,       setUserRole]       = useState("");
  const [dropdownOpen,   setDropdownOpen]   = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount, setCartCount } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("role");
    setUserName("");
    setUserRole("");
    setCartCount(0);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/login");
  }, [navigate, setCartCount]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const loginTime  = localStorage.getItem("loginTime");
    const storedRole = localStorage.getItem("role");

    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name || "");

      let role = storedRole || user.role;
      if (!role) {
        role = (user.email === "explain816@gmail.com" || user.name === "Admin") ? "admin" : "user";
      }
      setUserRole(role);

      if (loginTime && Date.now() - parseInt(loginTime, 10) > 3600000) {
        handleLogout();
      }
    } else {
      setUserName("");
      setUserRole("");
    }

    if (location.pathname === "/cart") setCartCount(0);
  }, [location.pathname, setCartCount, handleLogout]);

  const closeAllMenus   = () => { setMobileMenuOpen(false); setDropdownOpen(false); };
  const handleCartClick = () => { navigate("/cart"); setCartCount(0); setMobileMenuOpen(false); };
  const handleIconClick = () => { if (!userName) navigate("/login"); else setDropdownOpen(o => !o); };
  const handleProfile   = () => { closeAllMenus(); navigate(userRole === "admin" ? "/admin" : "/profile"); };

  const userInitial = userName ? userName.charAt(0).toUpperCase() : null;

  return (
    <header className="header">
      <div className="header-container">

        {/* Hamburger */}
        <button className="menu-toggle" onClick={() => { setMobileMenuOpen(o => !o); setDropdownOpen(false); }}>
          {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>

        {/* Logo */}
        <div className="logo-section">
          <Link to="/" className="logo" onClick={closeAllMenus}>
            <span className="logo-text">UKZAI</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="desktop-nav">
          <ul>
            {[
              { to:"/",        label:"Home"        },
              { to:"/latest",  label:"New Arrivals" },
              { to:"/shipping",label:"Shipping"     },
              { to:"/about",   label:"About"        },
              { to:"/contact", label:"Contact"      },
            ].map(item => (
              <li key={item.to}>
                <Link to={item.to} onClick={closeAllMenus}
                  className={location.pathname === item.to ? "nav-active" : ""}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Auth */}
        <div className="auth-section">
          <div className="cart-icon" onClick={handleCartClick}>
            <FaShoppingCart size={20} />
            {cartCount > 0 && location.pathname !== "/cart" && (
              <span className="cart-count">{cartCount}</span>
            )}
          </div>

          <div className="user-profile" onClick={handleIconClick}>
            <div className="user-avatar">
              {userInitial ? userInitial : <FaUserCircle size={24} />}
            </div>
            {userName && <span className="user-name">{userName}</span>}
            <FaChevronDown size={12} className={`dropdown-arrow ${dropdownOpen ? "open" : ""}`} />
          </div>

          {dropdownOpen && userName && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={handleProfile}>
                {userRole === "admin" ? "Admin Dashboard" : "My Account"}
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item logout" onClick={handleLogout}>Sign Out</div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      <nav className={`mobile-nav ${mobileMenuOpen ? "active" : ""}`}>
        <div className="mobile-nav-content">
          <div className="mobile-user-info">
            {userName ? (
              <>
                <div className="mobile-user-avatar">
                  {userInitial ? userInitial : <FaUserCircle size={32} />}
                </div>
                <div className="mobile-user-details">
                  <div className="mobile-user-name">{userName}</div>
                  <div className="mobile-user-role">{userRole === "admin" ? "Administrator" : "Customer"}</div>
                </div>
              </>
            ) : (
              <button className="mobile-login-btn" onClick={() => { closeAllMenus(); navigate("/login"); }}>
                Sign In
              </button>
            )}
          </div>

          <ul className="mobile-nav-list">
            {[
              { to:"/",        label:"Home"         },
              { to:"/latest",  label:"New Arrivals"  },
              { to:"/shipping",label:"Shipping Info" },
              { to:"/about",   label:"About Us"      },
              { to:"/contact", label:"Contact"       },
            ].map(item => (
              <li key={item.to}><Link to={item.to} onClick={closeAllMenus}>{item.label}</Link></li>
            ))}
            {userName && (
              <>
                <li>
                  <Link to={userRole === "admin" ? "/admin" : "/profile"} onClick={closeAllMenus}>
                    {userRole === "admin" ? "Admin Dashboard" : "My Account"}
                  </Link>
                </li>
                <li>
                  <button className="mobile-logout-btn" onClick={handleLogout}>Sign Out</button>
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
