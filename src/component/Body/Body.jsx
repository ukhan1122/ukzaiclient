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

  const handleAddToCart = (e, product, currentImageIndex = 0) => {
    e.stopPropagation();

    // Get the current image being displayed
    const currentImage = product.images?.[currentImageIndex];
    
    // Get the price for the current image, fallback to product price
    const price = currentImage && product.imagePrices?.[currentImage] 
      ? product.imagePrices[currentImage] 
      : product.price;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    // Create a unique ID based on product ID and image to treat different images as separate items
    const cartItemId = `${product._id}-${currentImageIndex}`;
    
    const existingIndex = cart.findIndex((item) => item.cartItemId === cartItemId);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ 
        ...product, 
        cartItemId,
        quantity: 1,
        selectedImage: currentImage,
        selectedImageIndex: currentImageIndex,
        price: price // Use the individual image price
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setCartCount(cartCount + 1);
  };

  // Function to get price for current image
  const getCurrentImagePrice = (product, currentImageIndex) => {
    const currentImage = product.images?.[currentImageIndex];
    if (currentImage && product.imagePrices?.[currentImage]) {
      return product.imagePrices[currentImage];
    }
    return product.price;
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
            const currentPrice = getCurrentImagePrice(product, currentIndex);
            
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
                        <div key={i} className="slide-image-wrapper">
                          <img src={img} alt={product.name} />
                          {/* Show individual price for each image */}
                          <div className="image-price-tag">
                            Rs. {product.imagePrices?.[img] || product.price}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Image counter */}
                    {product.images.length > 1 && (
                      <div className="image-counter">
                        {currentIndex + 1} / {product.images.length}
                      </div>
                    )}
                  </div>
                )}
                <h3>{product.name}</h3>
                
                {/* Dynamic Price Section */}
                <div className="price-section">
                  <p className="price">Rs. {currentPrice}</p>
                  {/* Show strikethrough if there's a regular price */}
                  {product.regularPrice && (
                    <p className="regular-price">Rs. {product.regularPrice}</p>
                  )}
                </div>
                
                {/* Package info if multiple images */}
                {product.images && product.images.length > 1 && (
                  <div className="package-info">
                    {currentIndex === 0 ? "Single Pack" : "5-Pack Bundle"}
                  </div>
                )}
                
                <button 
                  className="btn" 
                  onClick={(e) => handleAddToCart(e, product, currentIndex)}
                >
                  Add to Cart - Rs. {currentPrice}
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