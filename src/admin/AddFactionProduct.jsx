import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { navigateToNewProduct } from './productNavigation';

const AddFactionProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    ratings: 0,
    category: 'faction',
    brand: '',
    seller: '',
    stock: '',
    gender: 'unisex'
  });

  const [sizes, setSizes] = useState([{ size: '', stock: '' }]);
  const [imageUrls, setImageUrls] = useState(['']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSizeChange = (index, field, value) => {
    const updated = [...sizes];
    updated[index][field] = value;
    setSizes(updated);
  };

  const addSizeRow = () => setSizes([...sizes, { size: '', stock: '' }]);
  const removeSizeRow = (index) => setSizes(sizes.filter((_, i) => i !== index));

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

      // Basic frontend validation to avoid common mongoose validation errors
      const requiredFields = ['name', 'price', 'brand', 'category', 'gender'];
      for (const f of requiredFields) {
        if (!formData[f] && formData[f] !== 0) {
          setError(`${f.charAt(0).toUpperCase() + f.slice(1)} is required`);
          setSubmitting(false);
          return;
        }
      }

      if (Number.isNaN(Number(formData.price))) {
        setError('Price must be a valid number');
        setSubmitting(false);
        return;
      }

      const imagesFiltered = imageUrls.filter((url) => url.trim() !== '').map((u) => ({ image: u.trim() }));
      if (imagesFiltered.length === 0) {
        setError('Please provide at least one image URL');
        setSubmitting(false);
        return;
      }

      const normalizedSizes = sizes
        .filter((s) => s.size && String(s.size).trim() !== '')
        .map((s) => ({ size: String(s.size).trim(), stock: Number(s.stock) || 0 }));

      if (normalizedSizes.length > 0) {
        for (const s of normalizedSizes) {
          if (Number.isNaN(Number(s.stock))) {
            setError('Each size must have a valid stock number');
            setSubmitting(false);
            return;
          }
        }
      }

      const computedStock = Number(formData.stock) || (normalizedSizes.length ? normalizedSizes.reduce((sum, x) => sum + (Number(x.stock) || 0), 0) : 0);

      const payload = {
        name: String(formData.name).trim(),
        price: Number(formData.price),
        description: formData.description || '',
        brand: String(formData.brand).trim(),
        category: String(formData.category).trim(),
        images: imagesFiltered,
        sizes: normalizedSizes,
        stock: computedStock,
        seller: formData.seller || 'Flipkart',
        gender: (formData.gender || 'unisex')
      };

      const { data } = await axios.post('http://localhost:4000/admin/faction', payload, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (data && (data.message || data.success)) {
        setSuccess(data.message || 'Product created successfully!');
        setTimeout(() => navigateToNewProduct(navigate), 1200);
      }
    } catch (err) {
      const serverMsg = err?.response?.data?.details || err?.response?.data?.message;
      setError(serverMsg || err.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-lg mt-6">
      <h2 className="text-xl font-semibold mb-4">Add New Product</h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full border rounded p-2"
          required
        />

        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full border rounded p-2"
          required
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border rounded p-2"
          required
        />

        <input
          type="number"
          name="ratings"
          value={formData.ratings}
          onChange={handleChange}
          placeholder="Ratings (0-5)"
          min="0"
          max="5"
          className="w-full border rounded p-2"
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        >
          <option value="Clothing">Clothing</option>
        </select>

        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        >
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="unisex">Unisex</option>
        </select>

        <input
          type="text"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          placeholder="Brand"
          className="w-full border rounded p-2"
          required
        />

        <input
          type="text"
          name="seller"
          value={formData.seller}
          onChange={handleChange}
          placeholder="Seller"
          className="w-full border rounded p-2"
          required
        />

        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          placeholder="Total Stock"
          className="w-full border rounded p-2"
          required
        />

        <div>
          <label className="block font-medium mb-1">Sizes & Stock</label>
          {sizes.map((s, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Size (e.g. M)"
                value={s.size}
                onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                className="w-1/2 border rounded p-2"
              />
              <input
                type="number"
                placeholder="Stock"
                value={s.stock}
                onChange={(e) => handleSizeChange(index, 'stock', e.target.value)}
                className="w-1/2 border rounded p-2"
              />
              {sizes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSizeRow(index)}
                  className="text-red-500 px-2"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addSizeRow}
            className="text-blue-600 text-sm"
          >
            + Add size
          </button>
        </div>

        <div>
          <label className="block font-medium mb-1">Image URLs</label>
          {imageUrls.map((url, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Image URL"
                value={url}
                onChange={(e) => handleImageChange(index, e.target.value)}
                className="w-full border rounded p-2"
              />
              {imageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageRow(index)}
                  className="text-red-500 px-2"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addImageRow}
            className="text-blue-600 text-sm"
          >
            + Add image
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60"
        >
          {submitting ? 'Adding...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default AddFactionProduct;
