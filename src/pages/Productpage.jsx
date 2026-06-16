import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CartContext } from "./Cartcontext";
import API_URL from "../config";
import "./Productpage.css";

const RATINGS      = [4.5, 3.5, 5.0, 4.0, 4.8, 3.8, 4.2, 5.0, 4.6, 3.5];
const REVIEW_COUNTS= [128,  64, 312,  89, 201,  47, 156,  98, 234,  71];

const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating))                          stars.push(<span key={i} className="pp-star full">★</span>);
    else if (i === Math.ceil(rating) && rating % 1 !== 0) stars.push(<span key={i} className="pp-star half">★</span>);
    else                                                   stars.push(<span key={i} className="pp-star empty">★</span>);
  }
  return <div className="pp-stars">{stars}</div>;
};

const extractFeatures = (desc = "") => {
  const d = desc.toLowerCase();
  const features = [];
  if (d.includes("spicy") || d.includes("hot"))           features.push({ icon:"🔥", label:"Spicy Flavor" });
  if (d.includes("korean"))                               features.push({ icon:"🇰🇷", label:"Korean Cuisine" });
  if (d.includes("instant") || d.includes("quick"))      features.push({ icon:"⚡", label:"Quick Prep" });
  if (d.includes("premium") || d.includes("quality"))    features.push({ icon:"⭐", label:"Premium Quality" });
  if (d.includes("chicken"))                              features.push({ icon:"🍗", label:"Chicken Flavor" });
  if (d.includes("noodle") || d.includes("ramen"))       features.push({ icon:"🍜", label:"Noodle Dish" });
  if (features.length === 0) {
    features.push({ icon:"⭐", label:"Premium Quality" });
    features.push({ icon:"🚚", label:"Fast Shipping" });
    features.push({ icon:"🔒", label:"Secure Payment" });
  }
  return features;
};

const ProductPage = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [product, setProduct]       = useState(null);
  const [quantity, setQuantity]     = useState(1);
  const [selected, setSelected]     = useState(0);
  const [imgZoom, setImgZoom]       = useState(false);
  const { addToCart } = useContext(CartContext);

  const PRODUCT_URL = `${API_URL}/api/product`;

  useEffect(() => {
    fetch(`${PRODUCT_URL}/${id}`)
      .then(r => r.json())
      .then(d => setProduct(d))
      .catch(err => console.error(err));
  }, [id]);

  if (!product) return (
    <div className="pp-loading">
      <div className="pp-spinner"></div>
      <p>Loading product...</p>
    </div>
  );

  const imgs     = product.images || [];
  const getPrice = (idx) => {
    const img = imgs[idx];
    return (img && product.imagePrices?.[img]) ? product.imagePrices[img] : product.price;
  };
  const price    = getPrice(selected);
  const total    = price * quantity;
  const features = extractFeatures(product.description);
  const rating   = RATINGS[id?.charCodeAt(0) % RATINGS.length] || 4.5;
  const reviews  = REVIEW_COUNTS[id?.charCodeAt(0) % REVIEW_COUNTS.length] || 128;

  const getLabel = (idx) => {
    if (imgs.length <= 1) return null;
    return idx === 0 ? "Single Pack" : "5-Pack Bundle";
  };

  const handleAddToCart = () => {
    const img = imgs[selected];
    addToCart({
      ...product,
      cartItemId: `${product._id}-${selected}`,
      quantity,
      selectedImage: img,
      selectedImageIndex: selected,
      price,
      name: selected === 1 ? `${product.name} — 5 Pack` : product.name,
    });
    navigate("/cart");
  };

  return (
    <div className="pp-page">

      {/* Breadcrumb */}
      <nav className="pp-breadcrumb">
        <button className="pp-back" onClick={() => navigate(-1)}>← Back</button>
        <span className="pp-sep">/</span>
        <span className="pp-crumb">Products</span>
        <span className="pp-sep">/</span>
        <span className="pp-crumb active">{product.name}</span>
      </nav>

      <div className="pp-layout">

        {/* ── LEFT: Images ── */}
        <div className="pp-images">
          <div className={`pp-main-img${imgZoom ? " zoomed" : ""}`}
            onClick={() => setImgZoom(z => !z)}>
            {imgs.length > 0 ? (
              <>
                <img src={imgs[selected]} alt={product.name}
                  onError={e => e.target.style.opacity = "0"} />
                {getLabel(selected) && (
                  <span className="pp-img-badge">{getLabel(selected)}</span>
                )}
                <span className="pp-zoom-hint">{imgZoom ? "Click to zoom out" : "Click to zoom"}</span>
              </>
            ) : (
              <div className="pp-no-img">📷<p>No image</p></div>
            )}
          </div>

          {imgs.length > 1 && (
            <div className="pp-thumbs">
              {imgs.map((img, i) => (
                <div key={i}
                  className={`pp-thumb${selected === i ? " active" : ""}`}
                  onClick={() => setSelected(i)}>
                  <img src={img} alt={`variant ${i+1}`}
                    onError={e => e.target.style.opacity = "0"} />
                  {getLabel(i) && <span className="pp-thumb-label">{getLabel(i)}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Info ── */}
        <div className="pp-info">

          {/* Title & Rating */}
          <div className="pp-header">
            <div className="pp-eyebrow">UKZAI STORE · KOREAN NOODLES</div>
            <h1 className="pp-title">
              {product.name}
              {selected === 1 && <span className="pp-pack-label"> — 5 Pack</span>}
            </h1>
            <div className="pp-rating-row">
              <StarRating rating={rating} />
              <span className="pp-rating-num">{rating.toFixed(1)}</span>
              <span className="pp-rating-count">({reviews} reviews)</span>
              <span className="pp-dot">·</span>
              <span className="pp-stock-pill">
                {product.stock > 10 ? "✅ In Stock" : "⚠️ Low Stock"}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="pp-price-box">
            <span className="pp-price">Rs. {price.toLocaleString()}</span>
            {imgs.length > 1 && (
              <span className="pp-price-note">
                {selected === 0 ? "Single pack price" : "5-pack bundle price"}
              </span>
            )}
          </div>

          {/* Variant selector */}
          {imgs.length > 1 && (
            <div className="pp-variants">
              <p className="pp-variants-label">Select Variant:</p>
              <div className="pp-variant-btns">
                {imgs.map((img, i) => (
                  <button key={i}
                    className={`pp-variant-btn${selected === i ? " active" : ""}`}
                    onClick={() => { setSelected(i); setQuantity(1); }}>
                    <img src={img} alt="" onError={e => e.target.style.display="none"} />
                    <div>
                      <div className="pp-variant-name">{getLabel(i)}</div>
                      <div className="pp-variant-price">Rs. {getPrice(i)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          <div className="pp-features">
            {features.map((f, i) => (
              <span key={i} className="pp-feature-tag">
                {f.icon} {f.label}
              </span>
            ))}
          </div>

          {/* Quantity */}
          <div className="pp-qty-row">
            <span className="pp-qty-label">Quantity</span>
            <div className="pp-qty-ctrl">
              <button className="pp-qty-btn" onClick={() => setQuantity(q => Math.max(1, q-1))}
                disabled={quantity <= 1}>−</button>
              <span className="pp-qty-val">{quantity}</span>
              <button className="pp-qty-btn" onClick={() => setQuantity(q => Math.min(product.stock, q+1))}
                disabled={quantity >= product.stock}>+</button>
            </div>
            <span className="pp-stock-text">{product.stock} units available</span>
          </div>

          {/* Total & CTA */}
          <div className="pp-cta-section">
            <div className="pp-total">
              <span>Total</span>
              <span className="pp-total-price">Rs. {total.toLocaleString()}</span>
            </div>
            <button className="pp-add-btn" onClick={handleAddToCart}>
              🛒 Add {quantity} to Cart — Rs. {total.toLocaleString()}
            </button>
          </div>

          {/* Policies */}
          <div className="pp-policies">
            {[
              { icon:"📦", title:"Free Shipping", sub:"On orders above Rs. 1000" },
              { icon:"↩️", title:"Easy Returns",  sub:"7-day return policy"       },
              { icon:"🔒", title:"Secure Payment",sub:"100% payment protection"   },
            ].map((p,i) => (
              <div key={i} className="pp-policy">
                <span className="pp-policy-icon">{p.icon}</span>
                <div>
                  <div className="pp-policy-title">{p.title}</div>
                  <div className="pp-policy-sub">{p.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="pp-desc">
            <div className="pp-desc-header">📋 Product Details</div>
            <div className="pp-desc-body">
              {product.description?.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductPage;
