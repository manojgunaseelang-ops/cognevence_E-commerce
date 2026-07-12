import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { navigateToNewProduct } from './productNavigation';

export default function AddAccessory() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    brand: '',
    category: 'Accessories',
    seller: '',
    stock: '',
    gender: '',
    images: [''],
    sizes: [{ size: '', stock: '' }]
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleImageChange = (idx, val) => {
    const next = [...form.images];
    next[idx] = val;
    setField('images', next);
  };

  const addImage = () => setField('images', [...form.images, '']);
  const removeImage = (idx) => setField('images', form.images.filter((_, i) => i !== idx));

  const handleSizeChange = (idx, key, val) => {
    const next = form.sizes.map((s, i) => i === idx ? { ...s, [key]: val } : s);
    setField('sizes', next);
  };
  const addSize = () => setField('sizes', [...form.sizes, { size: '', stock: '' }]);
  const removeSize = (idx) => setField('sizes', form.sizes.filter((_, i) => i !== idx));

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const authRaw = localStorage.getItem('wellStoreAuth');
      const token = authRaw ? (JSON.parse(authRaw).token || '') : '';

      const payload = {
        name: form.name.trim(),
        price: Number(form.price) || 0,
        description: form.description || '',
        brand: form.brand || '',
        category: form.category || 'Accessories',
        images: form.images.filter(Boolean).map(u => ({ image: u })),
        sizes: form.sizes
          .map(s => ({ size: String(s.size || '').trim(), stock: Number(s.stock) || 0 }))
          .filter(s => s.size),
        stock: Number(form.stock) || 0,
        seller: form.seller || 'Flipkart',
        gender: (['men','women','unisex'].includes((form.gender||'').toLowerCase()) ? form.gender.toLowerCase() : 'unisex')
      };

      const res = await axios.post('http://localhost:4000/admin/accessories', payload, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      setMessage({ type: 'success', text: res.data.message || 'Accessory added' });
      setForm({ name: '', price: '', description: '', brand: '', category: 'Accessories', seller: '', stock: '', gender: '', images: [''], sizes: [{ size: '', stock: '' }] });
      setTimeout(() => navigateToNewProduct(navigate), 1200);
    } catch (err) {
      console.error(err);
      const text = err?.response?.data?.message || err.message || 'Failed to add accessory';
      setMessage({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-add-accessory">
      <h3>Add Accessory</h3>
      {message && (
        <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>{message.text}</div>
      )}
      <form onSubmit={submit}>
        <input className="form-control mb-2" name="name" placeholder="Name" value={form.name} onChange={e => setField('name', e.target.value)} required />
        <input className="form-control mb-2" name="price" placeholder="Price" type="number" value={form.price} onChange={e => setField('price', e.target.value)} required />
        <input className="form-control mb-2" name="brand" placeholder="Brand" value={form.brand} onChange={e => setField('brand', e.target.value)} required />
        <input className="form-control mb-2" name="category" placeholder="Category" value={form.category} onChange={e => setField('category', e.target.value)} />
        <textarea className="form-control mb-2" name="description" placeholder="Description" value={form.description} onChange={e => setField('description', e.target.value)} />

        <label>Images</label>
        {form.images.map((img, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input className="form-control" placeholder="Image URL" value={img} onChange={e => handleImageChange(idx, e.target.value)} />
            <button type="button" className="btn btn-outline-secondary" onClick={() => removeImage(idx)}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-secondary mb-2" onClick={addImage}>Add Image</button>

        <label>Sizes</label>
        {form.sizes.map((s, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input className="form-control" placeholder="Size" value={s.size} onChange={e => handleSizeChange(idx, 'size', e.target.value)} />
            <input className="form-control" placeholder="Stock" type="number" value={s.stock} onChange={e => handleSizeChange(idx, 'stock', e.target.value)} />
            <button type="button" className="btn btn-outline-secondary" onClick={() => removeSize(idx)}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-secondary mb-2" onClick={addSize}>Add Size</button>

        <input className="form-control mb-2" name="stock" placeholder="Total stock" type="number" value={form.stock} onChange={e => setField('stock', e.target.value)} />
        <input className="form-control mb-2" name="seller" placeholder="Seller" value={form.seller} onChange={e => setField('seller', e.target.value)} />

        <select className="form-control mb-2" value={form.gender} onChange={e => setField('gender', e.target.value)}>
          <option value="">Gender</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="unisex">Unisex</option>
        </select>

        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Add Accessory'}</button>
      </form>
    </div>
  );
}
