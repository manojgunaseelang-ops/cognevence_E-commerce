import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { navigateToNewProduct } from './productNavigation';

const AddSportShoeProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    slug: '',
    brand: '',
    category: 'Sports',
    subCategory: 'Running Shoes',
    gender: 'unisex',
    description: '',
    basePrice: '',
    currency: 'INR',
    discountPercentage: 0,
    sellerName: '',
    sellerId: ''
  });

  const [images, setImages] = useState([{ url: '', alt: '', isMain: true }]);
  const [variants, setVariants] = useState([{ sku: '', size: '', stock: '' }]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNameBlur = () => {
    if (formData.name && !formData.slug) {
      const slug = formData.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleImageChange = (index, field, value) => {
    const updated = [...images];
    updated[index][field] = value;
    setImages(updated);
  };

  const toggleMainImage = (index) => {
    setImages(images.map((img, i) => ({ ...img, isMain: i === index })));
  };

  const addImageRow = () => setImages([...images, { url: '', alt: '', isMain: false }]);
  const removeImageRow = (index) => setImages(images.filter((_, i) => i !== index));

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const addVariantRow = () => setVariants([...variants, { sku: '', size: '', stock: '' }]);
  const removeVariantRow = (index) => setVariants(variants.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const authRaw = localStorage.getItem('wellStoreAuth');
      const token = authRaw ? (JSON.parse(authRaw).token || '') : '';

      const payload = {
        id: formData.id,
        name: formData.name,
        slug: formData.slug,
        brand: formData.brand,
        category: formData.category,
        subCategory: formData.subCategory,
        gender: formData.gender,
        description: formData.description,
        pricing: {
          basePrice: Number(formData.basePrice) || 0,
          currency: formData.currency,
          discountPercentage: Number(formData.discountPercentage) || 0
        },
        seller: {
          name: formData.sellerName,
          id: formData.sellerId
        },
        images: images
          .filter((img) => (img.url || '').trim() !== '')
          .map((img) => ({ url: img.url.trim(), alt: (img.alt || '').trim(), isMain: !!img.isMain })),
        variants: variants
          .filter((v) => (v.sku || '').trim() !== '' && (v.size || '').trim() !== '')
          .map((v) => ({ sku: v.sku.trim(), size: v.size.trim(), stock: Number(v.stock) || 0 }))
      };

      const res = await axios.post('http://localhost:4000/admin/sport-shoes', payload, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const data = res.data || {};
      if (data.message || data.success) {
        setSuccess(data.message || 'Product created successfully!');
        setTimeout(() => navigateToNewProduct(navigate), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg mt-6">
      <h2 className="text-xl font-semibold mb-4">Add New Sport Shoe</h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <input type="text" name="id" value={formData.id} onChange={handleChange} placeholder="Product ID (unique)" className="border rounded p-2" required />
          <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="Slug (unique, auto-filled)" className="border rounded p-2" required />
        </div>

        <input type="text" name="name" value={formData.name} onChange={handleChange} onBlur={handleNameBlur} placeholder="Name" className="w-full border rounded p-2" required />

        <div className="grid grid-cols-2 gap-3">
          <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="Brand" className="border rounded p-2" required />
          <select name="gender" value={formData.gender} onChange={handleChange} className="border rounded p-2" required>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Category" className="border rounded p-2" required />
          <input type="text" name="subCategory" value={formData.subCategory} onChange={handleChange} placeholder="Sub-category" className="border rounded p-2" required />
        </div>

        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full border rounded p-2" />

        <div className="grid grid-cols-3 gap-3">
          <input type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} placeholder="Base Price" className="border rounded p-2" required />
          <input type="text" name="currency" value={formData.currency} onChange={handleChange} placeholder="Currency" className="border rounded p-2" />
          <input type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleChange} placeholder="Discount %" className="border rounded p-2" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input type="text" name="sellerName" value={formData.sellerName} onChange={handleChange} placeholder="Seller Name" className="border rounded p-2" required />
          <input type="text" name="sellerId" value={formData.sellerId} onChange={handleChange} placeholder="Seller ID" className="border rounded p-2" required />
        </div>

        <div>
          <label className="block font-medium mb-1">Images</label>
          {images.map((img, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <input type="text" placeholder="Image URL" value={img.url} onChange={(e) => handleImageChange(index, 'url', e.target.value)} className="w-1/2 border rounded p-2" />
              <input type="text" placeholder="Alt text" value={img.alt} onChange={(e) => handleImageChange(index, 'alt', e.target.value)} className="w-1/3 border rounded p-2" />
              <label className="flex items-center gap-1 text-sm whitespace-nowrap">
                <input type="radio" name="mainImage" checked={img.isMain} onChange={() => toggleMainImage(index)} /> Main
              </label>
              {images.length > 1 && (<button type="button" onClick={() => removeImageRow(index)} className="text-red-500 px-2">✕</button>)}
            </div>
          ))}
          <button type="button" onClick={addImageRow} className="text-blue-600 text-sm">+ Add image</button>
        </div>

        <div>
          <label className="block font-medium mb-1">Variants (SKU / Size / Stock)</label>
          {variants.map((v, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input type="text" placeholder="SKU (unique)" value={v.sku} onChange={(e) => handleVariantChange(index, 'sku', e.target.value)} className="w-1/3 border rounded p-2" />
              <input type="text" placeholder="Size (e.g. UK 9)" value={v.size} onChange={(e) => handleVariantChange(index, 'size', e.target.value)} className="w-1/3 border rounded p-2" />
              <input type="number" placeholder="Stock" value={v.stock} onChange={(e) => handleVariantChange(index, 'stock', e.target.value)} className="w-1/3 border rounded p-2" />
              {variants.length > 1 && (<button type="button" onClick={() => removeVariantRow(index)} className="text-red-500 px-2">✕</button>)}
            </div>
          ))}
          <button type="button" onClick={addVariantRow} className="text-blue-600 text-sm">+ Add variant</button>
        </div>

        <button type="submit" disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60">{submitting ? 'Adding...' : 'Add Sport Shoe'}</button>
      </form>
    </div>
  );
};

export default AddSportShoeProduct;
