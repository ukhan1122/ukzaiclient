import AdminDashboard from './admin/Admindashboard';
import ManageProducts from './admin/ManageProducts';
import UserDashboard from './User/UserDashboard';
import './App.css';
import Login from './Authentication/Login';
import Signup from './Authentication/Signup';
import Footer from './component/Footer/Footer';
import Header from './component/Header/Header';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OrderManagement from './admin/OrderManagement';
import { CartProvider } from './pages/Cartcontext'; 
import ProtectedRoute from './component/ProtectedRoute';
import ProductPage from './pages/Productpage';
import CartPage from './pages/CartPage';  
import Body from './pages/Home';
function App() {
  return (
    <CartProvider> {/* ✅ Wrap the app with CartProvider */}
      <div className="App">
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Body />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/product/:id" element={<ProductPage />} />
         
<Route path="/cart"    element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
<Route path="/profile" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
<Route path="/admin"   element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
<Route path="/admin/products" element={<ProtectedRoute adminOnly><ManageProducts /></ProtectedRoute>} />
<Route path="/admin/Order"    element={<ProtectedRoute adminOnly><OrderManagement /></ProtectedRoute>} />

          </Routes>
          <Footer />
        </Router>
      </div>
    </CartProvider>
  );
}

export default App;
