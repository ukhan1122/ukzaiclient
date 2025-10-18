import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../admin/Cartcontext";
import "./Body.css";

const Body = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState({});
  const [intervals, setIntervals] = useState({});
  const navigate = useNavigate();
  const { cartCount, setCartCount } = useContext(CartContext);

  const API_URL = "https://ukzai.onrender.com/api/product";

  const fetchProducts = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleMouseEnter = (product) => {
    if (product.images && product.images.length > 1) {
      setHoveredIndex((prev) => ({
        ...prev,
        [product._id]: ((prev[product._id] || 0) + 1) % product.images.length,
      }));

      const intervalId = setInterval(() => {
        setHoveredIndex((prev) => ({
          ...prev,
          [product._id]: ((prev[product._id] || 0) + 1) % product.images.length,
        }));
      }, 2000);

      setIntervals((prev) => ({ ...prev, [product._id]: intervalId }));
    }
  };

  const handleMouseLeave = (product) => {
    clearInterval(intervals[product._id]);
    setHoveredIndex((prev) => ({ ...prev, [product._id]: 0 }));
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex((item) => item._id === product._id);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setCartCount(cartCount + 1);
  };

  return (
    <div className="body-container">
      {/* Promotional Banner */}
      <div className="promotional-banner">
        <div className="banner-content">
          <div className="banner-text">
            <h2 className="banner-title">🔥 HOT DEAL!</h2>
            <h3 className="banner-subtitle">Buldak Noodles Special Offer</h3>
            <div className="price-container">
              <span className="original-price">Rs. 600</span>
              <span className="discounted-price">Rs. 550</span>
            </div>
            <p className="banner-description">
              Limited Time Offer! Get your favorite spicy noodles at discounted price
            </p>
            <div className="banner-contact">
              <span className="shop-name">UKZai.shop</span>
              <span className="phone-number">📞 +92 324 1417765</span>
            </div>
          </div>
          <div className="banner-image">
            <div className="eating-scene">
              {/* Table */}
              <div className="table"></div>
              
              {/* Person 1 - Left */}
              <div className="person person-1">
                <div className="head">
                  <div className="face">
                    <div className="eye left-eye"></div>
                    <div className="eye right-eye"></div>
                    <div className="mouth spicy-mouth"></div>
                  </div>
                </div>
                <div className="body">
                  <div className="arm left-arm"></div>
                  <div className="arm right-arm"></div>
                </div>
                <div className="chair chair-1"></div>
                <div className="noodle-bowl bowl-1">
                  <div className="noodles"></div>
                  <div className="chopsticks"></div>
                  <div className="steam steam-1"></div>
                  <div className="steam steam-2"></div>
                </div>
                
                {/* Speech Bubble 1 */}
                <div className="speech-bubble bubble-1">
                  <span>So SPICY! 🔥</span>
                </div>
              </div>

              {/* Person 2 - Right */}
              <div className="person person-2">
                <div className="head">
                  <div className="face">
                    <div className="eye left-eye"></div>
                    <div className="eye right-eye"></div>
                    <div className="mouth happy-mouth"></div>
                  </div>
                </div>
                <div className="body">
                  <div className="arm left-arm"></div>
                  <div className="arm right-arm"></div>
                </div>
                <div className="chair chair-2"></div>
                <div className="noodle-bowl bowl-2">
                  <div className="noodles"></div>
                  <div className="chopsticks"></div>
                  <div className="steam steam-1"></div>
                  <div className="steam steam-2"></div>
                </div>
                
                {/* Speech Bubble 2 */}
                <div className="speech-bubble bubble-2">
                  <span>But so GOOD! 😋</span>
                </div>
              </div>

              {/* Person 1 Second Speech */}
              <div className="speech-bubble bubble-3">
                <span>Worth every bite! 🍜</span>
              </div>

              {/* Fire Effects */}
              <div className="fire-effect fire-1">🔥</div>
              <div className="fire-effect fire-2">🔥</div>
              <div className="fire-effect fire-3">🔥</div>
            </div>
          </div>
        </div>
        <div className="banner-timer">
          <span>⏰ Offer ends soon! Grab yours now!</span>
        </div>
      </div>

      <h2 className="section-title">Featured Products</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="product-grid">
        {products.length > 0 ? (
          products.map((product) => {
            const currentIndex = hoveredIndex[product._id] || 0;
            return (
              <div
                className="product-card"
                key={product._id}
                onMouseEnter={() => handleMouseEnter(product)}
                onMouseLeave={() => handleMouseLeave(product)}
                onClick={() => navigate(`/product/${product._id}`)}
              >
                {product.images && product.images.length > 0 && (
                  <div className="slide-container">
                    <div
                      className="slide-images"
                      style={{
                        transform: `translateX(-${currentIndex * 100}%)`,
                        width: `${product.images.length * 100}%`,
                      }}
                    >
                      {product.images.map((img, i) => (
                        <img key={i} src={img} alt={product.name} /> 
                      ))}
                    </div>
                  </div>
                )}
                <h3>{product.name}</h3>
                
                {/* Price Section - Show regular price with strikethrough if available */}
                {product.regularPrice ? (
                  <div className="price-section">
                    <p className="price">Rs. {product.price}</p>
                    <p className="regular-price">Rs. 600</p>
                  </div>
                ) : (
                  <div className="price-section">
                    <p className="price">Rs. {product.price}</p>
                    <p className="regular-price">Rs. 600</p>
                  </div>
                )}
                
                <button className="btn" onClick={(e) => handleAddToCart(e, product)}>
                  Add to Cart
                </button>
              </div>
            );
          })
        ) : (
          <p className="no-products">Loading products, please wait...</p>
        )}
      </div>
    </div>
  );
};

export default Body;