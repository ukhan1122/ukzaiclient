import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-top">

        {/* Brand */}
        <div className="footer-brand">
          <span className="footer-logo">UKZAI</span>
          <p className="footer-brand-desc">
            Pakistan's #1 destination for authentic Korean Buldak noodles.
            Delivered fresh to your door in Lahore & Karachi.
          </p>
          <div className="footer-socials">
            <a href="https://wa.me/923407939853" target="_blank" rel="noreferrer" className="social-btn">💬 WhatsApp</a>
            <a href="mailto:explain816@gmail.com" className="social-btn">✉️ Email</a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4 className="footer-heading">Shop</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/latest">New Arrivals</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/profile">My Orders</Link></li>
          </ul>
        </div>

        {/* Help */}
        <div className="footer-col">
          <h4 className="footer-heading">Help</h4>
          <ul className="footer-links">
            <li><Link to="/shipping">Shipping Info</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h4 className="footer-heading">Contact</h4>
          <ul className="footer-contact">
            <li>📞 +92 335 0888249</li>
            <li>📞 +92 340 7939853</li>
            <li>📍 Lahore, Pakistan</li>
          </ul>
        </div>

      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <p>© {year} UKZAI Store. All rights reserved.</p>
        <p className="footer-made">Made with 🔥 in Pakistan</p>
      </div>
    </footer>
  );
};

export default Footer;
