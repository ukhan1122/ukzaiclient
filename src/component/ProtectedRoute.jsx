import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem("token");
   const role  = localStorage.getItem("role"); // ← read role separately
  const user  = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) return <Navigate to="/login" />;
  if (adminOnly && role !== "admin") return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;