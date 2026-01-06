import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CartContext } from "./Cartcontext";
import "./Productpage.css";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { setCartCount } = useContext(CartContext);

  const API_URL = "https://ukzai.onrender.com/api/product";

  const getImageUrl = (img) => {
    if (!img) return '';
    return img + '?v=' + Date.now();
  };

  // ✅ Auto-format product description
  const formatProductDescription = (description) => {
    if (!description) return "No description available for this product.";
    
    // If description is already formatted with markdown-like structure
    if (description.includes('**') || description.includes('-') || description.includes(':')) {
      return description;
    }

    // For Samyang products, create a structured description
    if (description.toLowerCase().includes('samyang') || description.toLowerCase().includes('buldak')) {
      return `**Brand:** Samyang Foods
**Product Line:** Buldak Bokkeummyun (불닭볶음면)
**Flavor:** Hot Chicken Flavor
**Type:** Korean Stir-fried Noodles
**Heat Level:** 🌶️🌶️🌶️🌶️🌶️ (Extremely Spicy)

**Product Details:**
• Net Weight: 140g (4.93 oz)
• Origin: South Korea
• Cooking Time: 4-5 minutes
• Preparation: Stir-fried noodles

**Flavor Profile:**
Intense spicy chicken flavor with authentic Korean gochugaru (red pepper) and gochujang base. Features a perfect balance of heat, sweetness, and savory umami with garlic undertones.

**Cooking Instructions:**
1. Boil noodles for 4-5 minutes until cooked
2. Drain water completely
3. Add seasoning sauce and mix thoroughly
4. Optional: Customize with cheese, vegetables, or protein

**Package Contents:**
• Noodle cake
• Spicy seasoning sauce packet
• Seasoning flakes (sesame seeds, seaweed)`;
    }

    // For other products, return as is or add basic formatting
    return description;
  };

  // ✅ Parse formatted description into HTML
  const renderFormattedDescription = (description) => {
    const formattedDesc = formatProductDescription(description);
    
    return formattedDesc.split('\n').map((line, index) => {
      // Handle bold text
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <div key={index} className="description-line">
            {parts.map((part, i) => 
              i % 2 === 1 ? (
                <strong key={i} className="description-bold">{part}</strong>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </div>
        );
      }
      
      // Handle bullet points
      if (line.trim().startsWith('•')) {
        return (
          <div key={index} className="description-bullet">
            <span className="bullet-point">•</span>
            <span>{line.substring(1).trim()}</span>
          </div>
        );
      }
      
      // Handle numbered lists
      if (/^\d+\./.test(line.trim())) {
        return (
          <div key={index} className="description-numbered">
            <span>{line}</span>
          </div>
        );
      }
      
      // Handle section headers (lines that are mostly text and end with colon)
      if (line.trim().endsWith(':') && line.length > 5) {
        return (
          <div key={index} className="description-section-header">
            {line}
          </div>
        );
      }
      
      // Handle empty lines as spacing
      if (line.trim() === '') {
        return <div key={index} className="description-spacing"></div>;
      }
      
      // Regular text
      return (
        <div key={index} className="description-regular">
          {line}
        </div>
      );
    });
  };

  // ✅ Extract key features for quick overview
  const extractKeyFeatures = (description) => {
    const features = [];
    const desc = description?.toLowerCase() || '';
    
    if (desc.includes('spicy') || desc.includes('hot')) {
      features.push('🔥 Spicy Flavor');
    }
    if (desc.includes('korean')) {
      features.push('🇰🇷 Korean Cuisine');
    }
    if (desc.includes('instant') || desc.includes('quick')) {
      features.push('⚡ Quick Preparation');
    }
    if (desc.includes('premium') || desc.includes('quality')) {
      features.push('⭐ Premium Quality');
    }
    if (desc.includes('chicken')) {
      features.push('🍗 Chicken Flavor');
    }
    if (desc.includes('noodle') || desc.includes('ramen')) {
      features.push('🍜 Noodle Dish');
    }
    
    return features.length > 0 ? features : ['⭐ Premium Quality', '🚚 Fast Shipping', '💳 Secure Payment'];
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProduct();
  }, [id]);

  const increaseQty = () => {
    if (quantity < product.stock) setQuantity((prev) => prev + 1);
  };

  const decreaseQty = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleAddToCart = () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex((item) => item._id === product._id);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        _id: product._id, 
         name: selectedImage === 1 ? `${product.name} 5 Pack` : product.name, // updated title
         price: selectedImage === 1 ? 2500 : product.price, // updated price
        images: product.images,
        quantity,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setCartCount((prev) => prev + quantity);
    
    navigate("/cart");
  };

  if (!product) {
    return (
      <div className="product-page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  const keyFeatures = extractKeyFeatures(product.description);

  return (
    <div className="product-page-container">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb">
        <button className="breadcrumb-back" onClick={() => navigate(-1)}>
          ← Back to Products
        </button>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </nav>

      <div className="product-detail">
        {/* Image Gallery */}
        <div className="image-section">
          <div className="main-image">
            {product.images && product.images.length > 0 ? (
              <img
                src={getImageUrl(product.images[selectedImage])}
                alt={product.name}
                onError={(e) => {
                  console.log('Product image failed to load');
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            ) : (
              <div className="no-image-placeholder">
                <span>📷</span>
                <p>No Image Available</p>
              </div>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="image-thumbnails">
              {product.images.map((img, index) => (
                <div
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`${product.name} ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
      <div className="product-info">
  <div className="product-header">
     <h1 className="product-title">
      {product.name}{" "}
      {selectedImage === 1 && (
        <span style={{ color: "red" }}>5 Pack</span>
      )}
    </h1>
    <div className="product-rating">
      <span className="stars">★★★★★</span>
      <span className="rating-text">(4.8/5)</span>
    </div>
</div>


       
          {/* Key Features Quick Overview */}
          <div className="key-features">
            <h4>Quick Features</h4>
            <div className="features-tags">
              {keyFeatures.map((feature, index) => (
                <span key={index} className="feature-tag">
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="stock-status">
            <div className={`stock-badge ${product.stock > 10 ? 'in-stock' : 'low-stock'}`}>
              {product.stock > 10 ? '✅ In Stock' : '⚠️ Low Stock'}
            </div>
            <span className="stock-count">{product.stock} units available</span>
          </div>

          <div className="quantity-section">
            <label className="quantity-label">Quantity:</label>
            <div className="quantity-control">
              <button 
                className="qty-btn decrease" 
                onClick={decreaseQty}
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="qty-display">{quantity}</span>
              <button 
                className="qty-btn increase" 
                onClick={increaseQty}
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>

        

      
<div className="action-buttons">
  <button
    className="btn primary-btn add-to-cart"
    onClick={handleAddToCart}
  >
    <span className="btn-icon">🛒</span>
    Add {quantity} to Cart - {selectedImage === 1
      ? (2500 * quantity).toFixed(2) + ' PKR'
      : (product.price * quantity).toFixed(2) + ' PKR'}
  </button>
</div>

          {/* Product Description */}
          <div className="description-section">
            <h3>📋 Product Details</h3>
            <div className="description-content formatted-description">
              {renderFormattedDescription(product.description)}
            </div>
          </div>

          {/* Shipping & Policies */}
          <div className="policies-section">
            <h3>🚚 Shipping & Policies</h3>
            <div className="policies-list">
              <div className="policy-item">
                <span className="policy-icon">📦</span>
                <div>
                  <strong>Free Shipping</strong>
                  <p>On orders over 1000 PKR</p>
                </div>
              </div>
              <div className="policy-item">
                <span className="policy-icon">↩️</span>
                <div>
                  <strong>Easy Returns</strong>
                  <p>7-day return policy</p>
                </div>
              </div>
              <div className="policy-item">
                <span className="policy-icon">🔒</span>
                <div>
                  <strong>Secure Payment</strong>
                  <p>100% payment protection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;