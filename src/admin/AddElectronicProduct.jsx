import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { navigateToNewProduct } from './productNavigation';

const AddElectronicProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    ratings: 0,
    category: '',
    brand: '',
    sizes: '',
    seller: '',
    stock: ''
  });

  const [images, setImages] = useState([]); // simple list of image URLs
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price) || 0,
        ratings: Number(formData.ratings) || 0,
        stock: Number(formData.stock) || 0,
        sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
        images: images.length ? images.filter(Boolean).map(url => ({ image: url })) : []
      };

      const authRaw = localStorage.getItem('wellStoreAuth');
      const token = authRaw ? (JSON.parse(authRaw).token || '') : '';

      const res = await axios.post('http://localhost:4000/admin/electronics', payload, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      setSuccess(res.data.message || 'Product created successfully');
      setFormData({ name: '', price: '', description: '', ratings: 0, category: '', brand: '', sizes: '', seller: '', stock: '' });
      setImages([]);
      setTimeout(() => navigateToNewProduct(navigate), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const addImage = () => setImages(prev => [...prev, '']);
  const setImageAt = (i, val) => setImages(prev => prev.map((v, idx) => idx === i ? val : v));
  const removeImage = (i) => setImages(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div className="admin-add-electronic" style={{ marginTop: 16 }}>
      <h3>Add Electronic Product</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={submit}>
        <input className="form-control mb-2" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input className="form-control mb-2" name="price" type="number" placeholder="Price" value={formData.price} onChange={handleChange} required />
        <textarea className="form-control mb-2" name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
        <input className="form-control mb-2" name="ratings" type="number" placeholder="Ratings" min="0" max="5" value={formData.ratings} onChange={handleChange} />
        <input className="form-control mb-2" name="category" placeholder="Category" value={formData.category} onChange={handleChange} required />
        <input className="form-control mb-2" name="brand" placeholder="Brand" value={formData.brand} onChange={handleChange} required />
        <input className="form-control mb-2" name="sizes" placeholder="Sizes (comma separated)" value={formData.sizes} onChange={handleChange} />

        <label>Images</label>
        {images.map((img, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input className="form-control" placeholder="Image URL" value={img} onChange={e => setImageAt(idx, e.target.value)} />
            <button type="button" className="btn btn-outline-secondary" onClick={() => removeImage(idx)}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-secondary mb-2" onClick={addImage}>Add Image</button>

        <input className="form-control mb-2" name="seller" placeholder="Seller" value={formData.seller} onChange={handleChange} />
        <input className="form-control mb-2" name="stock" type="number" placeholder="Stock" value={formData.stock} onChange={handleChange} required />

        <button className="btn btn-success" type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add Product'}</button>
      </form>
    </div>
  );
};

export default AddElectronicProduct;
