import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../admin/Cartcontext";
import "./Cart.css";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState({ name: "", email: "", address: "" });
  const [totalPrice, setTotalPrice] = useState(0);
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

    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
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

  // ✅ Place order & call backend
  const handleConfirm = async () => {
    if (cartItems.length === 0) {
      alert("Cart is empty!");
      return;
    }

    try {
      const token = localStorage.getItem("token"); // ✅ JWT from login

      const response = await fetch("http://localhost:5000/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token, // ✅ send token
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.images[0],
          })),
          totalPrice,
          shippingAddress: {
            name: user.name,
            email: user.email,
            address: user.address,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to place order");
        return;
      }

      alert("✅ Order placed successfully!");
      console.log("Order saved in DB:", data);

      // Clear cart after order placed
      localStorage.removeItem("cart");
      setCartItems([]);
      setTotalPrice(0);
      setCartCount(0);

      // Navigate to profile/dashboard
      navigate("/profile");
    } catch (err) {
      console.error("Order error:", err);
      alert("❌ Something went wrong!");
    }
  };

  return (
    <div className="cart-page-container">
      <h1>Checkout</h1>

      <div className="cart-main">
        {/* Left: User Info */}
        <div className="user-details">
          <h2>User Information</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Address:</strong> {user.address}</p>
        </div>

        {/* Right: Cart Items & Summary */}
        <div className="cart-items-wrapper">
          <div className="cart-items">
            {cartItems.length > 0 ? (
              cartItems.map((item, index) => (
                <div className="cart-item" key={item._id}>
                  <img src={`http://localhost:5000/${item.images[0]}`} alt={item.name} />
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="price">Price: {item.price} PKR</p>
                    <div className="quantity-control">
                      <button className="qty-btn" onClick={() => decreaseQty(index)}>−</button>
                      <span className="qty">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => increaseQty(index)}>+</button>
                      <button className="qty-btn remove" onClick={() => removeItem(index)}>🗑️</button>
                    </div>
                    <p className="total">Total: {(item.price * item.quantity).toFixed(2)} PKR</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-items">No items in cart.</p>
            )}
          </div>

          <div className="cart-summary">
            <h2>Grand Total: <span>{totalPrice.toFixed(2)} PKR</span></h2>
            <button className="btn confirm" onClick={handleConfirm}>✅ Place Order</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
