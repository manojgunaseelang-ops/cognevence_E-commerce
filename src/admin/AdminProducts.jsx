import React, { useState, useEffect } from 'react';
import { DEFAULT_IMAGE_PLACEHOLDER } from '../utils/images';

export default function AdminProducts() {
  const [selectedCategory, setSelectedCategory] = useState('mobileproduct');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    brand: '',
    category: '',
    description: '',
    stock: '',
    seller: 'Well-Store',
    images: [],
    gender: '',
  });
  const [imageUrl, setImageUrl] = useState('');
  const [products, setProducts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [overwrite, setOverwrite] = useState(false);
  const [viewMode, setViewMode] = useState('add'); // 'add' | 'edit' | 'delete'

  const categoryOptions = [
    { value: 'mobileproduct', label: 'Mobile Products' },
    { value: 'sport-shoes', label: 'Sport Shoes' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'kitchen', label: 'Kitchen Products' },
    { value: 'faction', label: 'Fashion' },
  ];

  const genderOptions = ['men', 'women', 'unisex'];

  // Map selectedCategory to public GET endpoint
  const getListEndpoint = (cat) => {
    if (cat === 'electronics') return '/electronic';
    return `/${cat}`;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`http://localhost:4000${getListEndpoint(selectedCategory)}`);
        const json = await res.json();
        const list = json.data || json.items || json;
        setProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Error fetching products for admin list:', err);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setFormData({
      name: '',
      price: '',
      brand: '',
      category: '',
      description: '',
      stock: '',
      seller: 'Well-Store',
      images: [],
      gender: '',
    });
    setImageUrl('');
    setMessage(null);
    setProducts([]);
    setIsEditing(false);
    setEditingId(null);
    setOverwrite(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, { image: imageUrl.trim() }]
      }));
      setImageUrl('');
    }
  };

  const startEdit = (product) => {
    setIsEditing(true);
    setEditingId(product._id || product.id || product._doc?._id || null);
    setFormData(prev => ({
      ...prev,
      name: product.name || '',
      price: product.price || (product.pricing && product.pricing.basePrice) || '',
      brand: product.brand || '',
      category: product.category || '',
      description: product.description || '',
      stock: product.stock || product.totalStock || 0,
      seller: product.seller || 'Well-Store',
      images: product.images ? product.images.map(img => ({ image: img.image || img })) : [],
      gender: product.gender || '',
    }));
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setOverwrite(false);
    setFormData({
      name: '',
      price: '',
      brand: '',
      category: '',
      description: '',
      stock: '',
      seller: 'Well-Store',
      images: [],
      gender: '',
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isEditing || !editingId) return;

    try {
      setLoading(true);
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
      };

      const overwriteQuery = overwrite ? '?overwrite=true' : '';
      const auth = localStorage.getItem('wellStoreAuth');
      const parsedAuth = auth ? JSON.parse(auth) : null;
      const headers = { 'Content-Type': 'application/json' };
      if (parsedAuth && parsedAuth.token) headers['Authorization'] = `Bearer ${parsedAuth.token}`;

      const res = await fetch(`http://localhost:4000/admin/${selectedCategory}/${editingId}${overwriteQuery}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Product updated' });
        // update local list
        setProducts(prev => prev.map(p => (p._id === editingId || p.id === editingId ? data.product : p)));
        cancelEdit();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update product' });
      }
    } catch (err) {
      console.error('Error updating product:', err);
      setMessage({ type: 'error', text: 'Error updating product' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleDelete = async (product) => {
    const id = product._id || product.id || product.slug;
    if (!id) {
      setMessage({ type: 'error', text: 'Cannot determine product id for deletion' });
      return;
    }
    if (!window.confirm(`Delete product "${product.name}"?`)) return;

    try {
      setLoading(true);
      const auth = localStorage.getItem('wellStoreAuth');
      const parsedAuth = auth ? JSON.parse(auth) : null;
      const headers = {};
      if (parsedAuth && parsedAuth.token) headers['Authorization'] = `Bearer ${parsedAuth.token}`;

      const res = await fetch(`http://localhost:4000/admin/${selectedCategory}/${id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Product deleted' });
        setProducts(prev => prev.filter(p => ((p._id || p.id || p.slug) !== id)));
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete product' });
      }
    } catch (err) {
      console.error('Delete error:', err);
      setMessage({ type: 'error', text: 'Error deleting product' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.brand || !formData.category) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    if (formData.images.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one product image' });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        price: parseInt(formData.price),
        stock: parseInt(formData.stock) || 0,
      };

      const response = await fetch(`http://localhost:4000/admin/${selectedCategory}`, {
        method: 'POST',
        headers: (() => {
          const h = { 'Content-Type': 'application/json' };
          try {
            const auth = localStorage.getItem('wellStoreAuth');
            const parsedAuth = auth ? JSON.parse(auth) : null;
            if (parsedAuth && parsedAuth.token) h['Authorization'] = `Bearer ${parsedAuth.token}`;
          } catch (e) {}
          return h;
        })(),
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: `${formData.name} added successfully!` });
        setFormData({
          name: '',
          price: '',
          brand: '',
          category: '',
          description: '',
          stock: '',
          seller: 'Well-Store',
          images: [],
          gender: '',
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to add product' });
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setMessage({ type: 'error', text: 'Error adding product' });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = () => {
    const cat = categoryOptions.find(c => c.value === selectedCategory);
    return cat ? cat.label : '';
  };

  return (
    <div className="admin-products-container">
      <div className="products-header">
        <h1>🛡️ Admin - Product Management</h1>
        <p>Add, Edit, or Delete products across all categories</p>
        <div className="admin-mode-nav" style={{ marginTop: 8 }}>
          <button className={`btn ${viewMode==='add' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => { setViewMode('add'); cancelEdit(); }}>➕ Add (POST)</button>
          <button className={`btn ${viewMode==='edit' ? 'btn-primary' : 'btn-outline-secondary'}`} style={{ marginLeft: 8 }} onClick={() => { setViewMode('edit'); setIsEditing(false); setEditingId(null); }}>✏️ Edit (PUT)</button>
          <button className={`btn ${viewMode==='delete' ? 'btn-danger' : 'btn-outline-secondary'}`} style={{ marginLeft: 8 }} onClick={() => { setViewMode('delete'); setIsEditing(false); setEditingId(null); }}>🗑️ Delete (DELETE)</button>
        </div>
      </div>

      <div className="products-content">
        <div className="category-selector">
          <h3>Select Category</h3>
          <select 
            className="form-select" 
            value={selectedCategory} 
            onChange={handleCategoryChange}
          >
            {categoryOptions.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {message && (
          <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`} role="alert">
            {message.text}
            <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
          </div>
        )}

        <div className="product-management">

          <form onSubmit={isEditing ? handleSave : handleSubmit} className="product-form">
            <h3>{isEditing ? `Edit ${getCategoryLabel()} Product` : `Add New ${getCategoryLabel()} Product`}</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Enter price"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Brand *</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Enter brand name"
                required
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Enter category"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Enter stock quantity"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Seller</label>
              <input
                type="text"
                name="seller"
                value={formData.seller}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Enter seller name"
              />
            </div>
          </div>

          {(selectedCategory === 'faction' || selectedCategory === 'sport-shoes') && (
            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="">Select Gender</option>
                {genderOptions.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter product description"
              rows="4"
            ></textarea>
          </div>

          <div className="image-section">
            <h4>Product Images</h4>
            <div className="image-input-group">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="form-control"
                placeholder="Enter image URL"
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddImage}
              >
                Add Image
              </button>
            </div>

            {formData.images.length > 0 && (
              <div className="images-preview">
                <h5>Added Images ({formData.images.length})</h5>
                <div className="preview-grid">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="image-preview-item">
                      <img src={img.image} alt={`Product ${idx}`} onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE_PLACEHOLDER; }} />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveImage(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            {isEditing && (
              <>
                <label className="overwrite-toggle"><input type="checkbox" checked={overwrite} onChange={(e)=>setOverwrite(e.target.checked)} /> Replace entire document</label>
                <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
              </>
            )}

            <button
              type="submit"
              className="btn btn-success btn-lg"
              disabled={loading}
            >
              {loading ? (isEditing ? 'Saving...' : 'Adding Product...') : (isEditing ? 'Save Changes' : 'Add Product')}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
