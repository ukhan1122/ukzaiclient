import React from "react";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        {/* About Section */}
        <div className="footer-section">
          <h3>About Us</h3>
          <p>
            Welcome to <strong>Ukzai Store</strong>, your one-stop shop for
            stylish and affordable products. We bring you the best deals every
            day.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/" aria-label="Go to homepage">Home</a></li>
            <li><a href="/shop" aria-label="Browse our shop">Shop</a></li>
            <li><a href="/categories" aria-label="View product categories">Categories</a></li>
            <li><a href="/about" aria-label="Learn more about us">About</a></li>
            <li><a href="/contact" aria-label="Contact us">Contact</a></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div className="footer-section">
          <h3>Customer Service</h3>
          <ul>
            <li><a href="/faq" aria-label="Frequently asked questions">FAQ</a></li>
            <li><a href="/shipping" aria-label="Shipping and returns information">Shipping & Returns</a></li>
            <li><a href="/privacy" aria-label="Privacy policy">Privacy Policy</a></li>
            <li><a href="/terms" aria-label="Terms and conditions">Terms & Conditions</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>Email: explain816@gmail.com</p>
          <p>Phone: +92 3350888249 / 3407939853</p>
          <p>Address: Lahore, Pakistan</p>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom">
        <p>© {currentYear} Ukzai Store. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;