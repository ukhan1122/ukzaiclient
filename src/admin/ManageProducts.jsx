import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ManageProducts.css";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [addForm, setAddForm] = useState({ name: "", price: "", stock: "", description: "", images: [] });
  const [editForm, setEditForm] = useState({ name: "", price: "", stock: "", description: "", images: [], existingImages: [] });
  const [editingProduct, setEditingProduct] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [popupImages, setPopupImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [popupImage, setPopupImage] = useState(null);

  const navigate = useNavigate();
  const API_URL = "https://ukzai.onrender.com/api/product";

  // ✅ FIXED: Cache busting image URLs
  const getImageUrl = (img) => {
    if (!img) return '';
    return img + '?v=' + Date.now();
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => { setMessage(""); setError(""); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const handleAddChange = (e) => {
    if (e.target.name === "images") setAddForm({ ...addForm, images: Array.from(e.target.files) });
    else setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    if (e.target.name === "images") setEditForm({ ...editForm, images: Array.from(e.target.files) });
    else setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(addForm).forEach((key) => {
        if (key === "images") addForm.images.forEach(img => formData.append("images", img));
        else formData.append(key, addForm[key]);
      });
      const res = await fetch(`${API_URL}/`, { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) { 
        setMessage(data.message || "Product added successfully ✅"); 
        setAddForm({ name: "", price: "", stock: "", description: "", images: [] }); 
        fetchProducts(); 
      }
      else setError(data.message || "Failed to add product ❌");
    } catch { setError("Error adding product ❌"); }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) { setMessage(data.message || "Product deleted successfully 🗑️"); fetchProducts(); }
      else setError(data.message || "Failed to delete product ❌");
    } catch { setError("Error deleting product ❌"); }
  };

  const handleEdit = (product) => {
    setEditingProduct(product._id);
    setEditForm({ 
      name: product.name, 
      price: product.price, 
      stock: product.stock, 
      description: product.description, 
      images: [], 
      existingImages: product.images || [] 
    });
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      // ✅ FIXED: Send existing images AND new images
      // Send existing images as string array
      editForm.existingImages.forEach(img => formData.append("existingImages", img));
      
      // Send new images as files
      editForm.images.forEach(img => formData.append("images", img));
      
      // Send other fields
      formData.append("name", editForm.name);
      formData.append("price", editForm.price);
      formData.append("stock", editForm.stock);
      formData.append("description", editForm.description);

      const res = await fetch(`${API_URL}/${editingProduct}`, { 
        method: "PUT", 
        body: formData 
      });
      
      const data = await res.json();
      if (res.ok) { 
        setMessage(data.message || "Product updated successfully ✅"); 
        setShowModal(false); 
        setEditingProduct(null); 
        fetchProducts(); 
      }
      else setError(data.message || "Failed to update product ❌");
    } catch { setError("Error updating product ❌"); }
  };

  const handleImageClick = (images, index = 0) => {
    setPopupImages(images);
    setCurrentIndex(index);
    setPopupImage(images[index]);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % popupImages.length;
    setCurrentIndex(nextIndex);
    setPopupImage(popupImages[nextIndex]);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + popupImages.length) % popupImages.length;
    setCurrentIndex(prevIndex);
    setPopupImage(popupImages[prevIndex]);
  };

  return (
    <div className="container">
      <h1>Manage Products</h1>
      {message && <div className="notification success">{message}</div>}
      {error && <div className="notification error">{error}</div>}

      <form onSubmit={handleAdd} className="form" encType="multipart/form-data">
        <input type="text" name="name" placeholder="Product Name" value={addForm.name} onChange={handleAddChange} required />
        <input type="number" name="price" placeholder="Price" value={addForm.price} onChange={handleAddChange} required />
        <input type="number" name="stock" placeholder="Stock" value={addForm.stock} onChange={handleAddChange} required />
        <input type="text" name="description" placeholder="Description" value={addForm.description} onChange={handleAddChange} required />
        <input type="file" name="images" accept="image/*" multiple onChange={handleAddChange} />
        <button type="submit" className="btn add">Add Product</button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>Images</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? products.map(p => (
            <tr key={p._id}>
              <td>
                {p.images && p.images.length > 0 ? (
                  <div className="images-cell">
                    {p.images.map((img, i) => (
                      <img
                        key={i}
                        src={getImageUrl(img)}
                        alt={p.name}
                        onClick={() => handleImageClick(p.images, i)}
                        style={{ cursor: "pointer" }}
                        onError={(e) => {
                          console.log('Image failed to load:', img);
                          e.target.style.display = 'none';
                        }}
                      />
                    ))}
                  </div>
                ) : "No Images"}
              </td>
              <td>
                <div 
                  className="scrollable-cell" 
                  style={{ cursor: "pointer", color: "#2e7d32" }} 
                  onClick={() => navigate(`/product/${p._id}`)}
                >
                  {p.name}
                </div>
              </td>
              <td>{p.price} PKR</td>
              <td>{p.stock}</td>
              <td><div className="scrollable-cell">{p.description}</div></td>
              <td>
                <button onClick={() => handleEdit(p)} className="btn edit">Edit</button>
                <button onClick={() => handleDelete(p._id)} className="btn delete">Delete</button>
              </td>
            </tr>
          )) : (
            <tr><td colSpan="6" className="no-data">No products found</td></tr>
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Product</h2>
            <form onSubmit={handleUpdate} className="form" encType="multipart/form-data">
              <input type="text" name="name" value={editForm.name} onChange={handleEditChange} required />
              <input type="number" name="price" value={editForm.price} onChange={handleEditChange} required />
              <input type="number" name="stock" value={editForm.stock} onChange={handleEditChange} required />
              <input type="text" name="description" value={editForm.description} onChange={handleEditChange} required />
              <div className="existing-images">
                <p><strong>Current Images:</strong></p>
                {editForm.existingImages.map((img, i) => (
                  <img 
                    key={i} 
                    src={getImageUrl(img)}
                    alt={`existing-${i}`} 
                    onClick={() => handleImageClick(editForm.existingImages, i)}
                    style={{ cursor: "pointer" }}
                    onError={(e) => {
                      console.log('Existing image failed to load:', img);
                      e.target.style.display = 'none';
                    }}
                  />
                ))}
              </div>
              <div className="new-images">
                <p><strong>Add New Images (Optional):</strong></p>
                <input type="file" name="images" accept="image/*" multiple onChange={handleEditChange} />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn update">Update</button>
                <button type="button" className="btn cancel" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {popupImage && (
        <div className="image-popup" onClick={() => setPopupImage(null)}>
          <button className="popup-btn left" onClick={(e) => { e.stopPropagation(); handlePrev(); }}>‹</button>
          <img src={getImageUrl(popupImage)} alt="Preview" />
          <button className="popup-btn right" onClick={(e) => { e.stopPropagation(); handleNext(); }}>›</button>
          <div className="popup-close" onClick={() => setPopupImage(null)}>×</div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;