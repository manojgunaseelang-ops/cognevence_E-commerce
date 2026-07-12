import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { navigateToNewProduct } from './productNavigation';

const AddKitchenProduct = () => {
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

  const [imageUrls, setImageUrls] = useState(['']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index, value) => {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  };

  const addImageRow = () => setImageUrls([...imageUrls, '']);
  const removeImageRow = (index) => setImageUrls(imageUrls.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const authRaw = localStorage.getItem('wellStoreAuth');
      const token = authRaw ? (JSON.parse(authRaw).token || '') : '';

      const payload = {
        ...formData,
        price: Number(formData.price),
        ratings: Number(formData.ratings),
        stock: Number(formData.stock),
        sizes: formData.sizes
          ? formData.sizes.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        images: imageUrls
          .filter((url) => url.trim() !== '')
          .map((url) => ({ image: url.trim() }))
      };

      const res = await axios.post('http://localhost:4000/admin/kitchen', payload, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const data = res.data || {};
      if (data.message || data.success) {
        setSuccess(data.message || 'Product created successfully!');
        setFormData({ name: '', price: '', description: '', ratings: 0, category: '', brand: '', sizes: '', seller: '', stock: '' });
        setImageUrls(['']);
        setTimeout(() => navigateToNewProduct(navigate), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-lg mt-6">
      <h2 className="text-xl font-semibold mb-4">Add New Kitchen Product</h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="w-full border rounded p-2" required />
        <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Price" className="w-full border rounded p-2" required />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full border rounded p-2" required />
        <input type="number" name="ratings" value={formData.ratings} onChange={handleChange} placeholder="Ratings (0-5)" min="0" max="5" className="w-full border rounded p-2" />
        <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Category (e.g. Home & Kitchen)" className="w-full border rounded p-2" required />
        <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="Brand (e.g. Instant Pot)" className="w-full border rounded p-2" required />
        <input type="text" name="sizes" value={formData.sizes} onChange={handleChange} placeholder="Sizes (comma separated, optional)" className="w-full border rounded p-2" />
        <input type="text" name="seller" value={formData.seller} onChange={handleChange} placeholder="Seller" className="w-full border rounded p-2" required />
        <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="Stock" className="w-full border rounded p-2" required />

        <div>
          <label className="block font-medium mb-1">Image URLs</label>
          {imageUrls.map((url, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input type="text" placeholder="Image URL" value={url} onChange={(e) => handleImageChange(index, e.target.value)} className="w-full border rounded p-2" />
              {imageUrls.length > 1 && (
                <button type="button" onClick={() => removeImageRow(index)} className="text-red-500 px-2">✕</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addImageRow} className="text-blue-600 text-sm">+ Add image</button>
        </div>

        <button type="submit" disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60">{submitting ? 'Adding...' : 'Add Product'}</button>
      </form>
    </div>
  );
};

export default AddKitchenProduct;
