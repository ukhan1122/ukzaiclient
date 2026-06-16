import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config";
import { getAuthHeaders } from "../utils/api";
import "./ManageProducts.css";

// ─── Helpers (outside component — never recreated) ────────────────────────
const emptyVariant = () => ({
  file: null, preview: null, price: "",
  toDelete: false, replaceFile: null, replacePreview: null,
  isNew: true, existingUrl: null,
});

const existingVariant = (url, price) => ({
  file: null, preview: url, price,
  toDelete: false, replaceFile: null, replacePreview: null,
  isNew: false, existingUrl: url,
});

// ─── Variant Editor (outside component — fixes focus/refresh bug) ─────────
const VariantEditor = ({ variants, onAddVariant, onRemoveVariant, onUndoRemove, onUpdatePrice, onImage }) => (
  <div className="mp-variants-section">
    <div className="mp-variants-header">
      <span className="mp-variants-label">🏷️ Variants — Image + Price</span>
      <button type="button" className="mp-add-variant-btn" onClick={onAddVariant}>
        + Add Variant
      </button>
    </div>

    {variants.length === 0 && (
      <p className="mp-no-variants">No variants yet. Click "+ Add Variant" to start.</p>
    )}

    {variants.map((v, i) => (
      <div key={i} className={`mp-variant-row${v.toDelete ? " deleted" : ""}`}>
        <label className="mp-image-upload">
          {(v.replacePreview || v.preview) ? (
            <>
              <img src={v.replacePreview || v.preview} alt=""
                onError={e => e.target.style.display = "none"} />
              {!v.toDelete && <div className="mp-img-overlay">Change</div>}
            </>
          ) : (
            <div className="mp-img-placeholder">
              <span style={{ fontSize: "28px" }}>📷</span>
              <span>Click to upload</span>
            </div>
          )}
          <input type="file" accept="image/*" style={{ display: "none" }}
            onChange={e => onImage(i, e.target.files[0])} />
        </label>

        <div className="mp-variant-right">
          <label className="mp-price-label">Price (PKR)</label>
          <input
            className="mp-price-input"
            type="number"
            placeholder="e.g. 500"
            value={v.price ?? ""}
            onChange={e => onUpdatePrice(i, e.target.value)}
            disabled={v.toDelete}
            min="0"
          />
          <div className="mp-variant-tags">
            {v.isNew          && <span className="mp-new-tag">NEW</span>}
            {v.replacePreview && <span className="mp-replaced-tag">REPLACED</span>}
          </div>
        </div>

        <div className="mp-variant-action">
          {!v.toDelete ? (
            <button type="button" className="mp-remove-btn"
              onClick={() => onRemoveVariant(i)} title="Remove">✕</button>
          ) : (
            <button type="button" className="mp-undo-btn"
              onClick={() => onUndoRemove(i)} title="Undo">↩</button>
          )}
        </div>
      </div>
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────
const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState(null);
  const [showAdd, setShowAdd]   = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const PRODUCTS_URL = `${API_URL}/api/product`;
  const emptyForm = { name: "", description: "", stock: "", variants: [emptyVariant()] };
  const [addForm,  setAddForm]  = useState(emptyForm);
  const [editForm, setEditForm] = useState({ name: "", description: "", stock: "", variants: [] });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res  = await fetch(PRODUCTS_URL);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch { showToast("Failed to load products", "error"); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  // ── Variant helpers — useCallback so they don't recreate ─────────────────
  const makeVariantHandlers = useCallback((setForm) => ({
    onAddVariant:    ()         => setForm(p => ({ ...p, variants: [...p.variants, emptyVariant()] })),
    onRemoveVariant: (i)        => setForm(p => { const v=[...p.variants]; v[i].isNew ? v.splice(i,1) : (v[i]={...v[i],toDelete:true}); return {...p,variants:v}; }),
    onUndoRemove:    (i)        => setForm(p => { const v=[...p.variants]; v[i]={...v[i],toDelete:false}; return {...p,variants:v}; }),
    onUpdatePrice:   (i, price) => setForm(p => { const v=[...p.variants]; v[i]={...v[i],price}; return {...p,variants:v}; }),
    onImage: (i, file) => {
      if (!file) return;
      const preview = URL.createObjectURL(file);
      setForm(p => {
        const v = [...p.variants];
        v[i] = v[i].isNew ? {...v[i],file,preview} : {...v[i],replaceFile:file,replacePreview:preview};
        return {...p,variants:v};
      });
    },
  }), []);

  const addHandlers  = makeVariantHandlers(setAddForm);
  const editHandlers = makeVariantHandlers(setEditForm);

  // ── Build FormData ────────────────────────────────────────────────────────
  const buildFormData = (form, isEdit = false, existingId = null) => {
    const fd = new FormData();
    fd.append("name",        form.name);
    fd.append("description", form.description);
    fd.append("stock",       form.stock);
    fd.append("price",       form.variants.find(v => !v.toDelete && v.price)?.price || "0");

    if (isEdit) {
      const keep    = form.variants.filter(v => !v.isNew && !v.toDelete && !v.replaceFile);
      const remove  = form.variants.filter(v => !v.isNew && v.toDelete);
      const newOnes = form.variants.filter(v =>  v.isNew && !v.toDelete && v.file);
      const replace = form.variants.filter(v => !v.isNew && v.replaceFile);
      const imagePrices = {};
      keep.forEach(v => { imagePrices[v.existingUrl] = Number(v.price); });
      fd.append("existingImages", JSON.stringify(keep.map(v => v.existingUrl)));
      fd.append("imagesToDelete", JSON.stringify(remove.map(v => v.existingUrl)));
      fd.append("imagePrices",    JSON.stringify(imagePrices));
      newOnes.forEach(v => fd.append("images", v.file));
      replace.forEach(v => fd.append("images", v.replaceFile));
    } else {
      form.variants.forEach(v => { if (v.file) fd.append("images", v.file); });
    }
    return fd;
  };

  // ── Add ───────────────────────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd   = buildFormData(addForm);
      const res  = await fetch(`${PRODUCTS_URL}/`, { method: "POST", headers: getAuthHeaders(), body: fd });
      const data = await res.json();
      if (res.ok) {
        showToast("Product added successfully ✅");
        setAddForm(emptyForm);
        setShowAdd(false);
        fetchProducts();
      } else { showToast(data.message || "Failed to add ❌", "error"); }
    } catch { showToast("Error adding product", "error"); }
    finally { setSubmitting(false); }
  };

  // ── Open Edit ─────────────────────────────────────────────────────────────
  const openEdit = (product) => {
    setEditId(product._id);
    const variants = (product.images || []).map(url =>
      existingVariant(url, product.imagePrices?.[url] ?? product.price)
    );
    if (variants.length === 0) variants.push(emptyVariant());
    setEditForm({ name: product.name, description: product.description, stock: product.stock, variants });
    setShowEdit(true);
  };

  // ── Update ────────────────────────────────────────────────────────────────
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd   = buildFormData(editForm, true, editId);
      const res  = await fetch(`${PRODUCTS_URL}/${editId}`, { method: "PUT", headers: getAuthHeaders(), body: fd });
      const data = await res.json();
      if (res.ok) {
        showToast("Product updated successfully ✅");
        setShowEdit(false);
        setEditId(null);
        fetchProducts();
      } else { showToast(data.message || "Failed to update ❌", "error"); }
    } catch { showToast("Error updating product", "error"); }
    finally { setSubmitting(false); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      const res  = await fetch(`${PRODUCTS_URL}/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) { showToast("Product deleted"); fetchProducts(); }
      else showToast(data.message || "Failed ❌", "error");
    } catch { showToast("Error deleting", "error"); }
  };

  // ── Modal ─────────────────────────────────────────────────────────────────
  const Modal = ({ title, onClose, onSubmit, form, setForm, handlers }) => (
    <div className="mp-overlay" onClick={onClose}>
      <div className="mp-modal" onClick={e => e.stopPropagation()}>
        <div className="mp-modal-top">
          <div>
            <p className="mp-modal-eyebrow">UKZAI STORE</p>
            <h2 className="mp-modal-title">{title}</h2>
          </div>
          <button className="mp-close-btn" type="button" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={onSubmit} className="mp-form">
          <div className="mp-field">
            <label className="mp-label">Product Name</label>
            <input className="mp-input" placeholder="e.g. Samyang Buldak Ramen"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>

          <div className="mp-field">
            <label className="mp-label">Stock Quantity</label>
            <input className="mp-input" type="number" placeholder="e.g. 50"
              value={form.stock}
              onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} required min="0" />
          </div>

          <div className="mp-field">
            <label className="mp-label">Description</label>
            <textarea className="mp-textarea" placeholder="Describe the product..."
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
          </div>

          <VariantEditor variants={form.variants} {...handlers} />

          <div className="mp-modal-actions">
            <button type="button" className="mp-cancel-btn" onClick={onClose}
              disabled={submitting}>Cancel</button>
            <button type="submit" className={`mp-submit-btn${submitting ? " loading" : ""}`}
              disabled={submitting}>
              {submitting ? (
                <span className="mp-btn-loading">
                  <span className="mp-btn-spinner"></span>
                  {title.includes("Add") ? "Adding..." : "Updating..."}
                </span>
              ) : (
                title.includes("Add") ? "Add Product" : "Update Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="mp-page">
      {toast && (
        <div className={`mp-toast ${toast.type}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* Submitting overlay */}
      {submitting && (
        <div className="mp-submitting-overlay">
          <div className="mp-submitting-box">
            <div className="mp-big-spinner"></div>
            <p className="mp-submitting-text">Please wait...</p>
            <p className="mp-submitting-sub">Uploading images to Cloudinary</p>
          </div>
        </div>
      )}

      <div className="mp-header">
        <div>
          <p className="mp-eyebrow">ADMIN PANEL</p>
          <h1 className="mp-title">Products</h1>
          <p className="mp-subtitle">{products.length} products in store</p>
        </div>
        <button className="mp-add-btn" onClick={() => setShowAdd(true)}>
          + New Product
        </button>
      </div>

      {loading ? (
        <div className="mp-center">
          <div className="mp-spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="mp-center">
          <div style={{ fontSize: "64px" }}>🍜</div>
          <h3 style={{ margin: "16px 0 8px", color: "#0f172a" }}>No products yet</h3>
          <p>Add your first product to get started</p>
          <button className="mp-add-btn" style={{ marginTop: "20px" }}
            onClick={() => setShowAdd(true)}>+ Add First Product</button>
        </div>
      ) : (
        <div className="mp-grid">
          {products.map(product => (
            <div key={product._id} className="mp-card">
              <div className="mp-card-img-row">
                {product.images?.length > 0 ? product.images.map((img, i) => (
                  <div key={i} className="mp-card-variant">
                    <img src={img} alt="" onError={e => e.target.style.display = "none"} />
                    <div className="mp-card-variant-price">
                      Rs. {product.imagePrices?.[img] ?? product.price}
                    </div>
                  </div>
                )) : (
                  <div className="mp-card-no-img">📦</div>
                )}
              </div>
              <div className="mp-card-body">
                <h3 className="mp-card-name"
                  onClick={() => navigate(`/product/${product._id}`)}>
                  {product.name}
                </h3>
                <div className="mp-card-tags">
                  <span className="mp-tag">Rs. {product.price}</span>
                  <span className="mp-tag green">Stock: {product.stock}</span>
                  <span className="mp-tag orange">{product.images?.length || 0} variants</span>
                </div>
                <p className="mp-card-desc">{product.description?.slice(0, 90)}...</p>
              </div>
              <div className="mp-card-footer">
                <button className="mp-edit-btn" onClick={() => openEdit(product)}>✏️ Edit</button>
                <button className="mp-delete-btn" onClick={() => handleDelete(product._id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="Add New Product" onClose={() => { if (!submitting) setShowAdd(false); }}
          onSubmit={handleAdd} form={addForm} setForm={setAddForm} handlers={addHandlers} />
      )}

      {showEdit && (
        <Modal title="Edit Product" onClose={() => { if (!submitting) setShowEdit(false); }}
          onSubmit={handleUpdate} form={editForm} setForm={setEditForm} handlers={editHandlers} />
      )}
    </div>
  );
};

export default ManageProducts;
