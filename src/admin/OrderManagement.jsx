import React, { useState, useEffect } from "react";
import "./OrderManagement.css";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, completed, cancelled

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔹 Fetching orders with token:", token);
      
      const response = await fetch("https://ukzai.onrender.com/api/orders", {
        headers: {
          "Authorization": token,
          "Content-Type": "application/json"
        },
      });
      
      console.log("🔹 Response status:", response.status);
      
      const data = await response.json();
      console.log("🔹 Orders data:", data);
      
      if (response.ok) {
        setOrders(data);
      } else {
        console.error("Failed to fetch orders:", data.message);
        alert(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Error fetching orders. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://ukzai.onrender.com/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (response.ok) {
        // Update local state
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        alert(`✅ Order status updated to ${newStatus}`);
      } else {
        alert(data.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Error updating order status");
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "status-pending",
      completed: "status-completed",
      cancelled: "status-cancelled",
      processing: "status-processing"
    };
    return <span className={`status-badge ${statusClasses[status] || ''}`}>{status}</span>;
  };

  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="order-management">
      <div className="order-header">
        <h1>Order Management</h1>
        <div className="filter-controls">
          <button 
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Orders ({orders.length})
          </button>
          <button 
            className={`filter-btn ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending ({orders.filter(o => o.status === "pending").length})
          </button>
          <button 
            className={`filter-btn ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completed ({orders.filter(o => o.status === "completed").length})
          </button>
          <button 
            className={`filter-btn ${filter === "cancelled" ? "active" : ""}`}
            onClick={() => setFilter("cancelled")}
          >
            Cancelled ({orders.filter(o => o.status === "cancelled").length})
          </button>
        </div>
      </div>

      <div className="orders-stats">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-number">{orders.length}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number pending">{orders.filter(o => o.status === "pending").length}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-number completed">{orders.filter(o => o.status === "completed").length}</p>
        </div>
        <div className="stat-card">
          <h3>Cancelled</h3>
          <p className="stat-number cancelled">{orders.filter(o => o.status === "cancelled").length}</p>
        </div>
      </div>

      <div className="orders-container">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <h3>No orders found</h3>
            <p>No orders match the current filter.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header-info">
                <div className="order-meta">
                  <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                  <p className="order-date">
                    {formatDate(order.createdAt)}
                  </p>
                  {order.user && (
                    <p className="customer-name">
                      Customer: {order.user.name || order.user.email}
                    </p>
                  )}
                </div>
                <div className="order-status">
                  {getStatusBadge(order.status)}
                  <p className="order-total">Total: {order.totalPrice?.toFixed(2)} PKR</p>
                </div>
              </div>

              {/* Customer Information */}
              <div className="customer-info">
                <h4>Customer Information</h4>
                <div className="customer-details">
                  <p><strong>Name:</strong> {order.shippingAddress?.name || order.user?.name || 'N/A'}</p>
                  <p><strong>Email:</strong> {order.shippingAddress?.email || order.user?.email || 'N/A'}</p>
                  <p><strong>Address:</strong> {order.shippingAddress?.address || 'N/A'}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="order-items">
                <h4>Order Items ({order.items?.length || 0})</h4>
                {order.items && order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <img 
                      src={item.images && item.images[0] ? item.images[0] : 'https://via.placeholder.com/60x60?text=No+Image'} 
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/60x60?text=No+Image';
                      }}
                    />
                    <div className="item-details">
                      <p className="item-name">{item.name}</p>
                      <p className="item-price">{item.price} PKR × {item.quantity}</p>
                    </div>
                    <div className="item-total">
                      {(item.price * item.quantity).toFixed(2)} PKR
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Actions */}
              <div className="order-actions">
                {order.status === "pending" && (
                  <>
                    <button 
                      className="btn btn-processing"
                      onClick={() => updateOrderStatus(order._id, "processing")}
                    >
                      Mark as Processing
                    </button>
                    <button 
                      className="btn btn-complete"
                      onClick={() => updateOrderStatus(order._id, "completed")}
                    >
                      Mark Complete
                    </button>
                    <button 
                      className="btn btn-cancel"
                      onClick={() => updateOrderStatus(order._id, "cancelled")}
                    >
                      Cancel Order
                    </button>
                  </>
                )}
                {order.status === "processing" && (
                  <>
                    <button 
                      className="btn btn-complete"
                      onClick={() => updateOrderStatus(order._id, "completed")}
                    >
                      Mark Complete
                    </button>
                    <button 
                      className="btn btn-cancel"
                      onClick={() => updateOrderStatus(order._id, "cancelled")}
                    >
                      Cancel Order
                    </button>
                  </>
                )}
                {(order.status === "completed" || order.status === "cancelled") && (
                  <button 
                    className="btn btn-pending"
                    onClick={() => updateOrderStatus(order._id, "pending")}
                  >
                    Mark as Pending
                  </button>
                )}
                <button 
                  className="btn btn-refresh"
                  onClick={fetchOrders}
                >
                  Refresh
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderManagement;