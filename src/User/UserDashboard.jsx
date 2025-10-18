import React, { useEffect, useState } from "react";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    phone: ""
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDataAndOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch user data from localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser({
            name: userData.name || "",
            email: userData.email || "",
            address: userData.address || "",
            city: userData.city || "",
            postalCode: userData.postalCode || "",
            phone: userData.phone || ""
          });
        }

        // Fetch orders
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
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserDataAndOrders();
  }, []);

  // Function to get correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/80x80?text=No+Image";
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/')) {
      return `https://ukzai.onrender.com${imagePath}`;
    }
    
    return `https://ukzai.onrender.com/${imagePath}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return '#28a745';
      case 'shipped': return '#17a2b8';
      case 'processing': return '#ffc107';
      case 'pending': return '#6f42c1';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  // Format order ID for display (first 8 characters)
  const formatOrderId = (orderId) => {
    if (!orderId) return 'N/A';
    return orderId.substring(0, 8).toUpperCase();
  };

  if (loading) {
    return (
      <div className="user-dashboard-container">
        <div className="loading-spinner">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="user-dashboard-container">
      <div className="dashboard-header">
        <h1>My Account</h1>
        <p className="welcome-message">Welcome back, {user.name || 'User'}!</p>
      </div>
      
      <div className="dashboard-content">
        {/* Left: Personal Info */}
        <div className="personal-info-section">
          <div className="info-card">
            <div className="card-header">
              <h2>Personal Information</h2>
              <div className="profile-icon">👤</div>
            </div>
            <div className="info-content">
              <div className="info-row">
                <div className="info-label">Full Name</div>
                <div className="info-value">{user.name || "Not provided"}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Email Address</div>
                <div className="info-value">{user.email || "Not provided"}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Phone Number</div>
                <div className="info-value">{user.phone || "Not provided"}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Shipping Address</div>
                <div className="info-value">
                  {user.address ? (
                    <div className="address-block">
                      <div>{user.address}</div>
                      <div>{user.city}, {user.postalCode}</div>
                    </div>
                  ) : (
                    "Not provided"
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Orders */}
        <div className="orders-section">
          <div className="section-header">
            <div className="section-title">
              <h2>Order History</h2>
              <span className="orders-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          {orders.length > 0 ? (
            <div className="orders-list">
              {orders.map((order) => (
                <div className="order-card" key={order._id}>
                  {/* Order Header */}
                  <div className="order-header">
                    <div className="order-basic-info">
                      <div className="order-id">
                        <span className="label">Order ID:</span>
                        <span className="value">{formatOrderId(order._id)}</span>
                      </div>
                      <div className="order-date">
                        <span className="label">Order Date:</span>
                        <span className="value">{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                    <div className="order-status-section">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status || 'Pending'}
                      </span>
                      <div className="order-total-amount">
                        ₨{order.totalPrice?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  {order.shippingAddress && (
                    <div className="shipping-section">
                      <div className="section-title">Shipping Details</div>
                      <div className="shipping-details">
                        <div className="shipping-row">
                          <span className="icon">📍</span>
                          <div className="shipping-info">
                            <div className="shipping-address">
                              {order.shippingAddress.address && (
                                <div>{order.shippingAddress.address}</div>
                              )}
                              {order.shippingAddress.city && order.shippingAddress.postalCode && (
                                <div>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</div>
                              )}
                            </div>
                          </div>
                        </div>    
                        {order.shippingAddress.phone && (
                          <div className="shipping-row">
                            <span className="icon">📞</span>
                            <div className="shipping-info">
                              <div className="shipping-phone">{order.shippingAddress.phone}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="order-items-section">
                    <div className="section-title">Items Ordered</div>
                    <div className="order-items-list">
                      {order.items && order.items.map((item, index) => {
                        const firstImage = item.images && item.images.length > 0 ? item.images[0] : null;
                        const imageUrl = getImageUrl(firstImage);

                        return (
                          <div className="order-item" key={index}>
                            <div className="item-image-container">
                              <img 
                                src={imageUrl} 
                                alt={item.name} 
                                onError={(e) => {
                                  e.target.src = "https://via.placeholder.com/80x80?text=No+Image";
                                }}
                                loading="lazy"
                              />
                            </div>
                            <div className="item-details">
                              <h4 className="item-name">{item.name}</h4>
                              <div className="item-pricing">
                                <span className="item-price">₨{item.price}</span>
                                <span className="item-quantity">× {item.quantity}</span>
                                <span className="item-total">₨{(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-orders">
              <div className="no-orders-icon">📦</div>
              <h3>No Orders Yet</h3>
              <p>You haven't placed any orders yet. Start shopping to see your order history here.</p>
              <button className="shop-now-btn" onClick={() => window.location.href = '/'}>
                Start Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;