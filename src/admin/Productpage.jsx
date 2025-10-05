import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CartContext } from "./Cartcontext";
import "./Productpage.css";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { setCartCount } = useContext(CartContext);

  const API_URL = "https://ukzai.onrender.com/api/product";

  // ✅ FIXED: Cache busting image URLs
  const getImageUrl = (img) => {
    if (!img) return '';
    return img + '?v=' + Date.now();
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
        name: product.name,
        price: product.price,
        images: product.images,
        quantity,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setCartCount((prev) => prev + quantity);
    navigate("/cart");
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div className="product-page-container">
      <button className="btn back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="product-detail">
        <div className="images-gallery">
          {product.images && product.images.length > 0 ? (
            product.images.map((img, i) => (
              <img
                key={i}
                src={getImageUrl(img)}
                alt={`${product.name}-${i}`}
                onError={(e) => {
                  console.log('Product image failed to load:', img);
                  e.target.style.display = 'none';
                }}
              />
            ))
          ) : (
            <p>No Images</p>
          )}
        </div>

        <div className="product-info">
          <h2 className="product-name">{product.name}</h2>

          <div className="price-quantity-row">
            <p className="price">
              Price: <span>{product.price} PKR</span>
            </p>
            <div className="quantity-control">
              <button className="qty-btn" onClick={decreaseQty}>
                −
              </button>
              <span className="qty">{quantity}</span>
              <button className="qty-btn" onClick={increaseQty}>
                +
              </button>
            </div>
          </div>

          <p className="stock">
            Available Stock: <span>{product.stock}</span>
          </p>
          <p className="desc">{product.description}</p>
          <p className="total-price">
            Total: <span>{(product.price * quantity).toFixed(2)} PKR</span>
          </p>

          <button className="btn add-to-cart" onClick={handleAddToCart}>
            🛒 Add {quantity} to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;