import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { navigateToNewProduct } from './productNavigation';

const AddMobileProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    ratings: 0,
    category: '',
    brand: '',
    seller: '',
    stock: '',
    gender: '',
    ram: '',
    rom: '',
    display: '',
    processor: ''
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

      const requiredFields = ['name', 'price', 'brand', 'category'];
      for (const field of requiredFields) {
        if (!formData[field]) {
          setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
          setSubmitting(false);
          return;
        }
      }

      const imagesFiltered = imageUrls
        .filter((url) => url.trim() !== '')
        .map((url) => ({ image: url.trim() }));
      if (imagesFiltered.length === 0) {
        setError('Please provide at least one image URL');
        setSubmitting(false);
        return;
      }

      const normalizedSizes = sizes
        .filter((s) => s.size.trim() !== '')
        .map((s) => ({ size: s.size.trim(), stock: Number(s.stock) || 0 }));

      for (const variant of normalizedSizes) {
        if (Number.isNaN(Number(variant.stock))) {
          setError('Each variant must have a valid stock number');
          setSubmitting(false);
          return;
        }
      }

      const computedStock = Number(formData.stock) || (normalizedSizes.length > 0 ? normalizedSizes.reduce((sum, item) => sum + (Number(item.stock) || 0), 0) : 0);

      const payload = {
        name: String(formData.name).trim(),
        price: Number(formData.price) || 0,
        description: formData.description || '',
        ratings: Number(formData.ratings) || 0,
        category: String(formData.category).trim(),
        brand: String(formData.brand).trim(),
        seller: formData.seller || 'Flipkart',
        stock: computedStock,
        gender: formData.gender || undefined,
        ram: formData.ram || '',
        rom: formData.rom || '',
        display: formData.display || '',
        processor: formData.processor || '',
        sizes: normalizedSizes,
        images: imagesFiltered
      };

      const res = await axios.post('http://localhost:4000/admin/mobileproduct', payload, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const data = res.data || {};
      if (data.message || data.success) {
        setSuccess(data.message || 'Mobile product created successfully!');
        setTimeout(() => navigateToNewProduct(navigate), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create mobile product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-lg mt-6">
      <h2 className="text-xl font-semibold mb-4">Add New Mobile Product</h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="w-full border rounded p-2" required />
        <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Price" className="w-full border rounded p-2" required />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full border rounded p-2" />
        <input type="number" name="ratings" value={formData.ratings} onChange={handleChange} placeholder="Ratings (0-5)" min="0" max="5" className="w-full border rounded p-2" />
        <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Category (e.g. Smartphones)" className="w-full border rounded p-2" />
        <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="Brand (e.g. Samsung, Apple)" className="w-full border rounded p-2" />

        <div className="grid grid-cols-2 gap-3">
          <input type="text" name="ram" value={formData.ram} onChange={handleChange} placeholder="RAM (e.g. 8GB)" className="border rounded p-2" />
          <input type="text" name="rom" value={formData.rom} onChange={handleChange} placeholder="ROM/Storage (e.g. 128GB)" className="border rounded p-2" />
          <input type="text" name="display" value={formData.display} onChange={handleChange} placeholder="Display (e.g. 6.5 inch AMOLED)" className="border rounded p-2" />
          <input type="text" name="processor" value={formData.processor} onChange={handleChange} placeholder="Processor (e.g. Snapdragon 8 Gen 3)" className="border rounded p-2" />
        </div>

        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border rounded p-2">
          <option value="">Not specified</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="unisex">Unisex</option>
        </select>

        <input type="text" name="seller" value={formData.seller} onChange={handleChange} placeholder="Seller" className="w-full border rounded p-2" />
        <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="Total Stock" className="w-full border rounded p-2" />

        <div>
          <label className="block font-medium mb-1">Variants (e.g. Storage) & Stock</label>
          {sizes.map((s, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input type="text" placeholder="Variant (e.g. 256GB)" value={s.size} onChange={(e) => handleSizeChange(index, 'size', e.target.value)} className="w-1/2 border rounded p-2" />
              <input type="number" placeholder="Stock" value={s.stock} onChange={(e) => handleSizeChange(index, 'stock', e.target.value)} className="w-1/2 border rounded p-2" />
              {sizes.length > 1 && (
                <button type="button" onClick={() => removeSizeRow(index)} className="text-red-500 px-2">✕</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addSizeRow} className="text-blue-600 text-sm">+ Add variant</button>
        </div>

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

        <button type="submit" disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60">{submitting ? 'Adding...' : 'Add Mobile Product'}</button>
      </form>
    </div>
  );
};

export default AddMobileProduct;
