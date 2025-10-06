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
      <h2 className="section-title"></h2>
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
          <p className="no-products">No products found</p>
        )}
      </div>
    </div>
  );
};

export default Body;