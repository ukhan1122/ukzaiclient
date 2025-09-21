import AdminDashboard from './admin/Admindashboard';
import ManageProducts from './admin/ManageProducts';
import ProductPage from './admin/Productpage';
import CartPage from './admin/CartPage';
import UserDashboard from './User/UserDashboard'; // ✅ Import UserDashboard
import './App.css';
import Login from './Authentication/Login';
import Signup from './Authentication/Signup';
import Body from './component/Body/Body';
import Footer from './component/Footer/Footer';
import Header from './component/Header/Header';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Body />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<UserDashboard />} /> {/* ✅ User Dashboard route */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<ManageProducts />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
