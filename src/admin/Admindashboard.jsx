import React from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, Admin! 🎉</p>
      <div style={{ marginTop: "20px" }}>
        <button
          style={{
            padding: "12px 24px",
            background: "green",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/admin/products")}
        >
          Manage Products
        </button>

        <button
          style={{
            marginLeft: "15px",
            padding: "12px 24px",
            background: "blue",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/admin/Order")}
        >
          Manage Users
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
