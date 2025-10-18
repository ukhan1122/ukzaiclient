import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../admin/Cartcontext";
import "./Cart.css";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState({ 
    name: "", 
    email: "", 
    address: "", 
    city: "", 
    postalCode: "", 
    phone: "" 
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const navigate = useNavigate();
  const { setCartCount } = useContext(CartContext);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);

    const total = storedCart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotalPrice(total);

    setCartCount(storedCart.reduce((acc, item) => acc + item.quantity, 0));

    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to place your order");
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      // Ensure all user fields have values, even if undefined in storage
      setUser({
        name: userData.name || "",
        email: userData.email || "",
        address: userData.address || "",
        city: userData.city || "",
        postalCode: userData.postalCode || "",
        phone: userData.phone || ""
      });
    }
  }, [setCartCount]);

  const increaseQty = (index) => {
    const updated = [...cartItems];
    updated[index].quantity += 1;
    updateCart(updated);
  };

  const decreaseQty = (index) => {
    const updated = [...cartItems];
    if (updated[index].quantity > 1) {
      updated[index].quantity -= 1;
      updateCart(updated);
    }
  };

  const removeItem = (index) => {
    const updated = [...cartItems];
    updated.splice(index, 1);
    updateCart(updated);
  };

  const updateCart = (items) => {
    setCartItems(items);
    localStorage.setItem("cart", JSON.stringify(items));
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotalPrice(total);
    setCartCount(items.reduce((acc, item) => acc + item.quantity, 0));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // SAFE validation function that handles undefined values
  const validateForm = () => {
    const requiredFields = [
      { field: user.name, name: "Full Name" },
      { field: user.email, name: "Email Address" },
      { field: user.address, name: "Street Address" },
      { field: user.city, name: "City" },
      { field: user.postalCode, name: "Postal Code" },
      { field: user.phone, name: "Phone Number" }
    ];

    for (let { field, name } of requiredFields) {
      // Safe check for undefined/null and then trim
      if (!field || (typeof field === 'string' && !field.trim())) {
        return `${name} is required`;
      }
    }

    // Email validation (safe check)
    if (user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        return "Please enter a valid email address";
      }
    }

    // Phone number validation (safe check)
    if (user.phone) {
      const phoneRegex = /^[0-9+\-\s()]{10,}$/;
      if (!phoneRegex.test(user.phone)) {
        return "Please enter a valid phone number";
      }
    }

    return null;
  };

  // SAFE form validation check
  const isFormValid = () => {
    const fields = ['name', 'email', 'address', 'city', 'postalCode', 'phone'];
    return fields.every(field => {
      const value = user[field];
      return value && typeof value === 'string' && value.trim() !== '';
    });
  };

  const handleConfirm = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to place your order");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      
      const response = await fetch("https://ukzai.onrender.com/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.images && item.images[0] ? item.images[0] : '',
          })),
          totalPrice,
          shippingAddress: user,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setError("Session expired. Please login again.");
          navigate("/login");
          return;
        }
        throw new Error(data.message || "Failed to place order");
      }

      // Clear cart after successful order
      localStorage.removeItem("cart");
      setCartItems([]);
      setTotalPrice(0);
      setCartCount(0);

      // Show order confirmation on same page
      setOrderPlaced(true);
      setOrderDetails({
        orderId: data.order?._id || Date.now().toString(),
        total: totalPrice
      });

    } catch (err) {
      console.error("Order error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueShopping = () => {
    setOrderPlaced(false);
    setOrderDetails(null);
    navigate("/");
  };

  if (!localStorage.getItem("token")) {
    return (
      <div className="cart-page-container">
        <div className="login-required">
          <h2>Login Required</h2>
          <p>Please login to view your cart and place orders</p>
          <button 
            className="btn primary" 
            onClick={() => navigate("/login")}
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  // Show order confirmation if order was placed
  if (orderPlaced && orderDetails) {
    return (
      <div className="cart-page-container">
        <div className="order-confirmation">
          <div className="confirmation-icon">✓</div>
          <h1>We've Received Your Order!</h1>
          <p className="confirmation-message">
            Thank you for your purchase. Your order has been confirmed and is being processed.
          </p>
          
          <div className="order-details-card">
            <div className="detail-row">
              <span className="label">Order ID:</span>
              <span className="value">{orderDetails.orderId}</span>
            </div>
            <div className="detail-row">
              <span className="label">Total Amount:</span>
              <span className="value">₨{orderDetails.total.toFixed(2)}</span>
            </div>
            <div className="detail-row">
              <span className="label">Status:</span>
              <span className="value status-confirmed">Confirmed</span>
            </div>
          </div>

          <div className="next-steps">
            <h3>What's Next?</h3>
            <ul>
              <li>You'll receive an email confirmation shortly</li>
              <li>We'll notify you when your order ships</li>
              <li>Expected delivery: 3-5 business days</li>
            </ul>
          </div>

          <div className="confirmation-actions">
            <button 
              className="btn primary"
              onClick={handleContinueShopping}
            >
              Continue Shopping
            </button>
            <button 
              className="btn secondary"
              onClick={() => navigate("/profile")}
            >
              View My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <div className="cart-steps">
          <span className="step active">Cart</span>
          <span className="step">Shipping</span>
          <span className="step">Payment</span>
          <span className="step">Confirmation</span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
          {error.includes("login") && (
            <button 
              className="btn-link" 
              onClick={() => navigate("/login")}
            >
              Login here
            </button>
          )}
        </div>
      )}

      <div className="cart-main">
        {/* Left: Cart Items */}
        <div className="cart-section">
          <div className="section-header">
            <h2>Order Summary ({cartItems.length} items)</h2>
          </div>
          
          <div className="cart-items">
            {cartItems.length > 0 ? (
              cartItems.map((item, index) => (
                <div className="cart-item" key={`${item._id}-${index}`}>
                  <div className="item-image">
                    {item.images && item.images[0] ? (
                      <img src={item.images[0]} alt={item.name} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>
                  
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="price">₨{item.price}</p>
                    
                    <div className="quantity-control">
                      <div className="qty-selector">
                        <button 
                          className="qty-btn" 
                          onClick={() => decreaseQty(index)}
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="qty">{item.quantity}</span>
                        <button 
                          className="qty-btn" 
                          onClick={() => increaseQty(index)}
                        >
                          +
                        </button>
                      </div>
                      <button 
                        className="remove-btn" 
                        onClick={() => removeItem(index)}
                      >
                        Remove
                      </button>
                    </div>
                    
                    <p className="item-total">
                      Total: ₨{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-cart">
                <h3>Your cart is empty</h3>
                <p>Add some products to get started</p>
                <button 
                  className="btn primary" 
                  onClick={() => navigate("/")}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary & Address */}
        <div className="order-summary-section">
          {/* Shipping Address */}
          <div className="address-section">
            <div className="section-header">
              <h2>Shipping Address</h2>
            </div>

            <div className="address-form">
              <div className="form-row">
                <div className="input-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name *"
                    value={user.name || ""}
                    onChange={handleInputChange}
                    required
                    className={!user.name ? 'required-field' : ''}
                  />
                </div>
                <div className="input-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address *"
                    value={user.email || ""}
                    onChange={handleInputChange}
                    required
                    className={!user.email ? 'required-field' : ''}
                  />
                </div>
              </div>
              
              <div className="input-group">
                <input
                  type="text"
                  name="address"
                  placeholder="Street Address *"
                  value={user.address || ""}
                  onChange={handleInputChange}
                  required
                  className={!user.address ? 'required-field' : ''}
                />
              </div>
              
              <div className="form-row">
                <div className="input-group">
                  <input
                    type="text"
                    name="city"
                    placeholder="City *"
                    value={user.city || ""}
                    onChange={handleInputChange}
                    required
                    className={!user.city ? 'required-field' : ''}
                  />
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Postal Code *"
                    value={user.postalCode || ""}
                    onChange={handleInputChange}
                    required
                    className={!user.postalCode ? 'required-field' : ''}
                  />
                </div>
              </div>
              
              <div className="input-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number *"
                  value={user.phone || ""}
                  onChange={handleInputChange}
                  required
                  className={!user.phone ? 'required-field' : ''}
                />
              </div>
              
              <div className="required-note">
                <small>* Required fields</small>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          {cartItems.length > 0 && (
            <div className="summary-section">
              <div className="section-header">
                <h2>Order Total</h2>
              </div>
              
              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₨{totalPrice.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>₨{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button 
                className={`btn confirm ${isLoading ? 'loading' : ''}`}
                onClick={handleConfirm}
                disabled={isLoading || cartItems.length === 0 || !isFormValid()}
                title={!isFormValid() ? "Please fill all required fields" : ""}
              >
                {isLoading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;