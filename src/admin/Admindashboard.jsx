import React from "react";
import { useNavigate } from "react-router-dom";
import "./Admindashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, Admin! 🎉</p>
      </div>
      
      <div className="admin-actions">
        <div className="admin-card" onClick={() => navigate("/admin/products")}>
          <div className="card-icon">📦</div>
          <h3>Manage Products</h3>
          <p>Add, edit, or remove products from your store</p>
        </div>

        <div className="admin-card" onClick={() => navigate("/admin/Order")}>
          <div className="card-icon">📋</div>
          <h3>Manage Orders</h3>
          <p>View and manage customer orders</p>
        </div>

        <div className="admin-card" onClick={() => navigate("/admin/users")}>
          <div className="card-icon">👥</div>
          <h3>Manage Users</h3>
          <p>View and manage user accounts</p>
        </div>

        <div className="admin-card" onClick={() => navigate("/admin/analytics")}>
          <div className="card-icon">📊</div>
          <h3>Analytics</h3>
          <p>View sales and performance metrics</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;