import React, { useEffect, useState } from "react";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john@example.com",
    address: "123 Main Street, City, Country",
  });
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://ukzai.onrender.com/api/orders/myorders", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("Fetched orders:", data);
        setOrders(data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };
    fetchOrders();
  }, []);

  // Function to get correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/100";
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/')) {
      return `https://ukzai.onrender.com${imagePath}`;
    }
    
    return `https://ukzai.onrender.com/${imagePath}`;
  };

  // Format order ID for display
  const formatOrderId = (orderId) => {
    if (!orderId) return 'N/A';
    return orderId.length > 12 ? `${orderId.substring(0, 12)}...` : orderId;
  };

  return (
    <div className="user-dashboard-container">
      <h1>My Dashboard</h1>
      <div className="dashboard-content">
        {/* Left: Personal Info */}
        <div className="personal-info">
          <h2>Personal Information</h2>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Address:</strong> {user.address}
          </p>
        </div>

        {/* Right: Orders */}
        <div className="user-orders">
          <h2>My Orders</h2>
          {orders.length > 0 ? (
            orders.map((order) => (
              <div className="order-card" key={order._id}>
                <div className="order-header">
                  <span data-label="Order ID:">
                    <strong>Order ID:</strong> {formatOrderId(order._id)}
                  </span>
                  <span data-label="Status:">
                    <strong>Status:</strong> {order.status || 'Processing'}
                  </span>
                  <span data-label="Total:">
                    <strong>Total:</strong> {order.totalPrice?.toFixed(2) || '0.00'} PKR
                  </span>
                </div>
                <div className="order-items">
                  {order.items && order.items.map((item, index) => {
                    const firstImage = item.images && item.images.length > 0 ? item.images[0] : null;
                    const imageUrl = getImageUrl(firstImage);

                    return (
                      <div className="order-item" key={index}>
                        <img 
                          src={imageUrl} 
                          alt={item.name} 
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/100";
                          }}
                          loading="lazy"
                        />
                        <div className="item-details">
                          <h3>{item.name}</h3>
                          <p>Price: {item.price} PKR</p>
                          <p>Quantity: {item.quantity}</p>
                          <p>
                            Total: {(item.price * item.quantity).toFixed(2)} PKR
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <p className="no-orders">You have no orders yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;