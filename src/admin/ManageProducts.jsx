import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ManageProducts.css";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addForm, setAddForm] = useState({ 
    name: "", 
    price: "", 
    stock: "", 
    description: "", 
    images: [] 
  });
  const [editForm, setEditForm] = useState({ 
    name: "", 
    price: "", 
    stock: "", 
    description: "", 
    images: [], 
    existingImages: [],
    imagesToDelete: [] // New state to track images to delete
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [popupImages, setPopupImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [popupImage, setPopupImage] = useState(null);

  const navigate = useNavigate();
  const API_URL = "https://ukzai.onrender.com/api/product";

  const getImageUrl = (img) => {
    if (!img) return '';
    const baseUrl = img.split('?')[0];
    return baseUrl + '?v=' + Date.now();
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      let productsArray = data;
      if (data.products && Array.isArray(data.products)) {
        productsArray = data.products;
      } else if (data.data && Array.isArray(data.data)) {
        productsArray = data.data;
      }
      
      if (Array.isArray(productsArray)) {
        setProducts(productsArray);
      } else {
        console.error("Unexpected API response format:", data);
        setProducts([]);
        setError("Invalid data format received from server");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load products. Please check your connection.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchProducts(); 
  }, []);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => { 
        setMessage(""); 
        setError(""); 
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const handleAddChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      setAddForm({ ...addForm, images: Array.from(files) });
    } else {
      setAddForm({ ...addForm, [name]: value });
    }
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      setEditForm({ ...editForm, images: Array.from(files) });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  // NEW FUNCTION: Handle image deletion from existing images
  const handleDeleteImage = (imageToDelete) => {
    setEditForm(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter(img => img !== imageToDelete),
      imagesToDelete: [...prev.imagesToDelete, imageToDelete] // Track deleted images
    }));
  };

  // NEW FUNCTION: Handle image drop/remove via drag and drop
  const handleImageDrop = (e, imageToDelete) => {
    e.preventDefault();
    handleDeleteImage(imageToDelete);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      formData.append("name", addForm.name);
      formData.append("price", addForm.price);
      formData.append("stock", addForm.stock);
      formData.append("description", addForm.description);
      
      addForm.images.forEach(img => {
        formData.append("images", img);
      });

      const res = await fetch(`${API_URL}/`, { 
        method: "POST", 
        body: formData 
      });
      
      const data = await res.json();
      
      if (res.ok) { 
        setMessage(data.message || "Product added successfully ✅"); 
        setAddForm({ 
          name: "", 
          price: "", 
          stock: "", 
          description: "", 
          images: [] 
        });
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        fetchProducts(); 
      } else {
        setError(data.message || "Failed to add product ❌");
      }
    } catch (err) {
      console.error("Add error:", err);
      setError("Error adding product ❌");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (res.ok) { 
        setMessage(data.message || "Product deleted successfully 🗑️"); 
        fetchProducts(); 
      } else {
        setError(data.message || "Failed to delete product ❌");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError("Error deleting product ❌");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product._id);
    setEditForm({ 
      name: product.name, 
      price: product.price, 
      stock: product.stock, 
      description: product.description, 
      images: [], 
      existingImages: product.images || [],
      imagesToDelete: [] // Reset images to delete
    });
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      // Append existing images that are not deleted
      editForm.existingImages.forEach(img => {
        formData.append("existingImages", img);
      });
      
      // Append new images
      editForm.images.forEach(img => {
        formData.append("images", img);
      });
      
      // Append images to delete
      editForm.imagesToDelete.forEach(img => {
        formData.append("imagesToDelete", img);
      });
      
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
      } else {
        setError(data.message || "Failed to update product ❌");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError("Error updating product ❌");
    }
  };

  const handleImageClick = (images, index = 0) => {
    if (!images || images.length === 0) return;
    
    setPopupImages(images);
    setCurrentIndex(index);
    setPopupImage(images[index]);
  };

  const handleNext = () => {
    if (popupImages.length === 0) return;
    const nextIndex = (currentIndex + 1) % popupImages.length;
    setCurrentIndex(nextIndex);
    setPopupImage(popupImages[nextIndex]);
  };

  const handlePrev = () => {
    if (popupImages.length === 0) return;
    const prevIndex = (currentIndex - 1 + popupImages.length) % popupImages.length;
    setCurrentIndex(prevIndex);
    setPopupImage(popupImages[prevIndex]);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  return (
    <div className="manage-products-page">
      <div className="manage-products-container">
        <h1>Manage Products</h1>
        
        {/* Notifications */}
        {message && <div className="manage-products-notification success">{message}</div>}
        {error && <div className="manage-products-notification error">{error}</div>}

        {/* Debug Info */}
        {!loading && (
          <div className="manage-products-debug">
            <strong>Products Loaded:</strong> {products.length} products found
          </div>
        )}

        {/* Add Product Form */}
        <form onSubmit={handleAdd} className="manage-products-form" encType="multipart/form-data">
          <input 
            type="text" 
            name="name" 
            placeholder="Product Name" 
            value={addForm.name} 
            onChange={handleAddChange} 
            required 
          />
          <input 
            type="number" 
            name="price" 
            placeholder="Price" 
            value={addForm.price} 
            onChange={handleAddChange} 
            required 
            min="0"
            step="0.01"
          />
          <input 
            type="number" 
            name="stock" 
            placeholder="Stock" 
            value={addForm.stock} 
            onChange={handleAddChange} 
            required 
            min="0"
          />
          <textarea 
            name="description" 
            placeholder="Description" 
            value={addForm.description} 
            onChange={handleAddChange} 
            required 
          />
          <input 
            type="file" 
            name="images" 
            accept="image/*" 
            multiple 
            onChange={handleAddChange} 
          />
          <button type="submit" className="manage-products-btn add">Add Product</button>
        </form>

        {/* Products Table */}
        {loading ? (
          <div className="manage-products-loading">Loading products...</div>
        ) : (
          <div className="manage-products-table-container">
            <table className="manage-products-table">
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
                {products.length > 0 ? products.map(product => (
                  <tr key={product._id}>
                    <td>
                      {product.images && product.images.length > 0 ? (
                        <div className="manage-products-images-cell">
                          {product.images.map((img, index) => (
                            <img
                              key={index}
                              src={getImageUrl(img)}
                              alt={product.name}
                              onClick={() => handleImageClick(product.images, index)}
                              onError={(e) => {
                                console.log('Image failed to load:', img);
                                e.target.style.display = 'none';
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        "No Images"
                      )}
                    </td>
                    <td>
                      <div 
                        className="manage-products-scrollable-cell" 
                        style={{ cursor: "pointer", color: "#2e7d32" }} 
                        onClick={() => navigate(`/product/${product._id}`)}
                        title="Click to view product details"
                      >
                        {product.name}
                      </div>
                    </td>
                    <td>{product.price} PKR</td>
                    <td>{product.stock}</td>
                    <td>
                      <div className="manage-products-scrollable-cell" title={product.description}>
                        {product.description}
                      </div>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleEdit(product)} 
                        className="manage-products-btn edit"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(product._id)} 
                        className="manage-products-btn delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="manage-products-no-data">
                      No products found. Add some products to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Modal */}
        {showModal && (
          <div className="manage-products-modal">
            <div className="manage-products-modal-content">
              <h2>Edit Product</h2>
              <form onSubmit={handleUpdate} className="manage-products-form" encType="multipart/form-data">
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Product Name"
                  value={editForm.name} 
                  onChange={handleEditChange} 
                  required 
                />
                <input 
                  type="number" 
                  name="price" 
                  placeholder="Price"
                  value={editForm.price} 
                  onChange={handleEditChange} 
                  required 
                  min="0"
                  step="0.01"
                />
                <input 
                  type="number" 
                  name="stock" 
                  placeholder="Stock"
                  value={editForm.stock} 
                  onChange={handleEditChange} 
                  required 
                  min="0"
                />
                <textarea 
                  name="description" 
                  placeholder="Description"
                  value={editForm.description} 
                  onChange={handleEditChange} 
                  required 
                />
                
                <div className="manage-products-existing-images">
                  <p><strong>Current Images:</strong> <span style={{fontSize: '12px', color: '#666'}}>(Click to view, Drag down to delete)</span></p>
                  {editForm.existingImages.length > 0 ? (
                    editForm.existingImages.map((img, index) => (
                      <div 
                        key={index} 
                        className="manage-products-image-container"
                        draggable="true"
                        onDragStart={(e) => e.dataTransfer.setData('text/plain', img)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleImageDrop(e, img)}
                      >
                        <img 
                          src={getImageUrl(img)}
                          alt={`existing-${index}`} 
                          onClick={() => handleImageClick(editForm.existingImages, index)}
                          onError={(e) => {
                            console.log('Existing image failed to load:', img);
                            e.target.style.display = 'none';
                          }}
                        />
                        <button 
                          type="button"
                          className="manage-products-remove-image"
                          onClick={() => handleDeleteImage(img)}
                          title="Delete image"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <p>No existing images</p>
                  )}
                </div>
                
                <div className="manage-products-new-images">
                  <p><strong>Add New Images (Optional):</strong></p>
                  <input 
                    type="file" 
                    name="images" 
                    accept="image/*" 
                    multiple 
                    onChange={handleEditChange} 
                  />
                </div>
                
                <div className="manage-products-modal-actions">
                  <button type="submit" className="manage-products-btn update">Update Product</button>
                  <button 
                    type="button" 
                    className="manage-products-btn cancel" 
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Image Popup */}
        {popupImage && (
          <div className="manage-products-image-popup" onClick={() => setPopupImage(null)}>
            <button 
              className="manage-products-popup-btn left" 
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            >
              ‹
            </button>
            <img 
              src={getImageUrl(popupImage)} 
              alt="Preview" 
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              className="manage-products-popup-btn right" 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
            >
              ›
            </button>
            <div 
              className="manage-products-popup-close" 
              onClick={() => setPopupImage(null)}
            >
              ×
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;