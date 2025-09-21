import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CartContext } from "./Cartcontext"; // ✅ cart count context
import "./Productpage.css";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { setCartCount } = useContext(CartContext);

  // ✅ Fetch product details (dummy API for now)
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/product/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <p>Loading...</p>;

  // ✅ Increase quantity
  const increaseQty = () => {
    if (quantity < product.stock) setQuantity((prev) => prev + 1);
  };

  // ✅ Decrease quantity
  const decreaseQty = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  // ✅ Add to cart + Navigate to Cart page
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

    // ✅ Navigate to cart page
    navigate("/cart");
  };

  return (
    <div className="product-page-container">
      <button className="btn back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="product-detail">
        {/* Images Gallery */}
        <div className="images-gallery">
          {product.images && product.images.length > 0 ? (
            product.images.map((img, i) => (
              <img
                key={i}
                src={`http://localhost:5000/${img}`}
                alt={`${product.name}-${i}`}
              />
            ))
          ) : (
            <p>No Images</p>
          )}
        </div>

        {/* Product Info */}
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
