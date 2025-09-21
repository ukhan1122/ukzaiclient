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
        const token = localStorage.getItem("token"); // get JWT
        const res = await fetch("https://ukzai.onrender.com/orders/myorders", {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ send token
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        console.log("Fetched orders:", data);

        setOrders(data.orders || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };
    fetchOrders();
  }, []);

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
                  <span>
                    <strong>Order ID:</strong> {order._id}
                  </span>
                  <span>
                    <strong>Status:</strong> {order.status}
                  </span>
                  <span>
                    <strong>Total:</strong> {order.totalPrice} PKR
                  </span>
                </div>
                <div className="order-items">
                  {order.items.map((item, index) => {
                    console.log("Order item:", item); // ✅ debug log
                    const imageUrl =
                      item.images && item.images.length > 0
                        ? `http://localhost:5000/${item.images[0]}`
                        : "https://via.placeholder.com/100"; // fallback

                    return (
                      <div className="order-item" key={index}>
                        <img src={imageUrl} alt={item.name} />
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
