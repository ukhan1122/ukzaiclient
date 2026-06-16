import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./Cartcontext";
import API_URL from "../config";
import "./Home.css";

const RATINGS      = [4.5, 3.5, 5.0, 4.0, 4.8, 3.8, 4.2, 5.0, 4.6, 3.5];
const REVIEW_COUNTS= [128,  64, 312,  89, 201,  47, 156,  98, 234,  71];

const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating))                           stars.push(<span key={i} className="star full">★</span>);
    else if (i === Math.ceil(rating) && rating % 1 !== 0)  stars.push(<span key={i} className="star half">★</span>);
    else                                                    stars.push(<span key={i} className="star empty">★</span>);
  }
  return <div className="star-row">{stars}</div>;
};

const Home = () => {
  const [products,     setProducts]     = useState([]);
  const [error,        setError]        = useState("");
  const [activeImg,    setActiveImg]    = useState({});
  const [heroVisible,  setHeroVisible]  = useState(false);
  const [addedId,      setAddedId]      = useState(null);
  const navigate     = useNavigate();
  const { addToCart } = useContext(CartContext);
  const gridRef      = useRef(null);
  const timerRefs    = useRef({});

  const PRODUCTS_URL = `${API_URL}/api/product`;

  useEffect(() => {
    fetch(PRODUCTS_URL)
      .then(r => r.json())
      .then(d => setProducts(Array.isArray(d) ? d : []))
      .catch(() => setError("Failed to load products"));
    setTimeout(() => setHeroVisible(true), 100);
    return () => Object.values(timerRefs.current).forEach(clearInterval);
  }, []);

  const getPrice = (product, idx) => {
    const img = product.images?.[idx];
    return img && product.imagePrices?.[img] ? product.imagePrices[img] : product.price;
  };

  const getLabel = (product, idx) => {
    if (!product.images || product.images.length <= 1) return "Single Pack";
    return idx === 0 ? "1 Pack" : "5 Pack";
  };

  const handleMouseEnter = (product) => {
    if (!product.images || product.images.length <= 1) return;
    timerRefs.current[product._id] = setInterval(() => {
      setActiveImg(prev => ({
        ...prev,
        [product._id]: ((prev[product._id] || 0) + 1) % product.images.length,
      }));
    }, 2000);
  };

  const handleMouseLeave = (product) => {
    clearInterval(timerRefs.current[product._id]);
    setActiveImg(prev => ({ ...prev, [product._id]: 0 }));
  };

  const handleAddToCart = (e, product, idx) => {
    e.stopPropagation();
    const img   = product.images?.[idx];
    const price = getPrice(product, idx);
    addToCart({ ...product, cartItemId: `${product._id}-${idx}`, quantity: 1, selectedImage: img, price });
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="home">

      {/* HERO */}
      <section className={`hero ${heroVisible ? "visible" : ""}`}>
        <div className="hero-bg">
          <div className="hero-blob blob-1"></div>
          <div className="hero-blob blob-2"></div>
          <div className="hero-blob blob-3"></div>
        </div>
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-eyebrow"><span className="fire-dot">🔥</span> FREE DELIVERY · LAHORE & KARACHI</div>
            <h1 className="hero-title">
              <span className="hero-line-1">BULDAK</span>
              <span className="hero-line-2">NOODLES</span>
              <span className="hero-line-3">Pakistan's <em>hottest</em> obsession</span>
            </h1>
            <p className="hero-desc">
              Authentic Korean fire noodles delivered fresh to your door.
              Single packs from <strong>Rs. 500</strong> · 5-Pack bundles from <strong>Rs. 2500</strong>
            </p>
            <div className="hero-actions">
              <button className="hero-btn-primary" onClick={() => gridRef.current?.scrollIntoView({ behavior: "smooth" })}>
                Shop Now →
              </button>
              <div className="hero-social-proof">
                <div className="hero-avatars">
                  {["🧑","👩","👦","👧","🧔"].map((e,i) => <span key={i} className="avatar">{e}</span>)}
                </div>
                <div>
                  <div className="hero-stars">★★★★★</div>
                  <div className="hero-proof-text">1,200+ happy customers</div>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-badge">SPICY 🌶️🌶️🌶️🌶️🌶️</div>
            <div className="hero-bowl-scene">
              <div className="bowl-glow"></div>
              <div className="hero-noodle-box">
                <div className="noodle-steam s1"></div>
                <div className="noodle-steam s2"></div>
                <div className="noodle-steam s3"></div>
                <div className="noodle-emoji">🍜</div>
                <div className="noodle-fire">🔥</div>
              </div>
              <div className="hero-tag tag-1">Single Pack<br/><b>Rs. 500</b></div>
              <div className="hero-tag tag-2">5-Pack Bundle<br/><b>Rs. 2500</b></div>
            </div>
          </div>
        </div>
        <div className="hero-strip">
          <div className="strip-track">
            {[1,2].map(copy => (
              <span key={copy} className="strip-inner">
                <span>⏰ Limited Time Deal</span>
                <span className="strip-dot">·</span>
                <span>Free delivery above Rs. 1000</span>
                <span className="strip-dot">·</span>
                <span>📞 +92 324 1417765</span>
                <span className="strip-dot">·</span>
                <span>ukzai.shop</span>
                <span className="strip-dot">·</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="trust-bar">
        {[
          { icon:"🚚", title:"Fast Delivery",    sub:"Lahore & Karachi"  },
          { icon:"✅", title:"100% Authentic",   sub:"Direct from Korea" },
          { icon:"🔒", title:"Secure Payment",   sub:"Cash on Delivery"  },
          { icon:"🌶️", title:"Genuine Buldak",  sub:"Original flavors"  },
        ].map((item, i) => (
          <div className="trust-item" key={i}>
            <span className="trust-icon">{item.icon}</span>
            <div>
              <div className="trust-title">{item.title}</div>
              <div className="trust-sub">{item.sub}</div>
            </div>
          </div>
        ))}
      </section>

      {/* PRODUCTS */}
      <section className="products-section" ref={gridRef}>
        <div className="section-head">
          <p className="section-eyebrow">FRESH STOCK · READY TO ORDER</p>
          <h2 className="section-title">Featured Products</h2>
        </div>
        {error && <p className="error-msg">{error}</p>}
        <div className="product-grid">
          {products.length > 0 ? products.map((product, pi) => {
            const idx     = activeImg[product._id] || 0;
            const price   = getPrice(product, idx);
            const rating  = RATINGS[pi % RATINGS.length];
            const reviews = REVIEW_COUNTS[pi % REVIEW_COUNTS.length];
            const isAdded = addedId === product._id;
            const imgs    = product.images || [];

            return (
              <div
                key={product._id}
                className="product-card"
                onMouseEnter={() => handleMouseEnter(product)}
                onMouseLeave={() => handleMouseLeave(product)}
                onClick={() => navigate(`/product/${product._id}`)}
              >
                {/* ── Image area ── */}
                <div className="card-img-wrap">
                  {imgs.length > 0 ? (
                    <>
                      {/* Show only the active image — no sliding, just swap */}
                      <img
                        key={idx}
                        src={imgs[idx]}
                        alt={product.name}
                        className="card-img"
                        onError={e => { e.target.style.display = "none"; }}
                      />
                      <span className="pack-badge">{getLabel(product, idx)}</span>

                      {imgs.length > 1 && (
                        <div className="card-dots">
                          {imgs.map((_, i) => (
                            <span key={i} className={`card-dot${i === idx ? " active" : ""}`}></span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="card-img-placeholder">📦</div>
                  )}
                  <div className="card-overlay">
                    <button className="overlay-btn"
                      onClick={e => { e.stopPropagation(); navigate(`/product/${product._id}`); }}>
                      Quick View
                    </button>
                  </div>
                </div>

                {/* ── Body ── */}
                <div className="card-body">
                  <h3 className="card-name">{product.name}</h3>
                  <div className="card-rating">
                    <StarRating rating={rating} />
                    <span className="rating-num">{rating.toFixed(1)}</span>
                    <span className="rating-count">({reviews})</span>
                  </div>
                  <div className="card-price-row">
                    <span className="card-price">Rs. {price}</span>
                    {imgs.length > 1 && <span className="card-variants">{imgs.length} variants</span>}
                  </div>
                  <button
                    className={`card-btn${isAdded ? " added" : ""}`}
                    onClick={e => handleAddToCart(e, product, idx)}
                  >
                    {isAdded ? "✓ Added!" : `Add to Cart · Rs. ${price}`}
                  </button>
                </div>
              </div>
            );
          }) : (
            <div className="empty-products">
              <div style={{ fontSize:"64px" }}>🍜</div>
              <p>Loading products, please wait...</p>
            </div>
          )}
        </div>
      </section>

      {/* WHY US */}
      <section className="why-section">
        <div className="section-head">
          <p className="section-eyebrow">WHY UKZAI</p>
          <h2 className="section-title">The UKZAI Difference</h2>
        </div>
        <div className="why-grid">
          {[
            { emoji:"🇰🇷", title:"Directly from Korea",    desc:"Every pack imported straight from Samyang's Korean facility." },
            { emoji:"❄️",  title:"Freshness Guaranteed",   desc:"Stored in cool conditions and shipped same-day."             },
            { emoji:"🏎️", title:"Express Delivery",        desc:"Lahore in 2 hours, Karachi next day."                       },
            { emoji:"💬",  title:"Real Reviews",            desc:"1,200+ verified buyers can't be wrong."                     },
          ].map((item, i) => (
            <div className="why-card" key={i}>
              <div className="why-emoji">{item.emoji}</div>
              <h3 className="why-title">{item.title}</h3>
              <p className="why-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
