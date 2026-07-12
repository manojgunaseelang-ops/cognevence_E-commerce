import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeDeleteProductId, setActiveDeleteProductId] = useState(null);

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'faction', label: 'Fashion' },
    { value: 'mobileproduct', label: 'Mobile' },
    { value: 'sport-shoes', label: 'Sport Shoes' },
  ];

  const getAuthToken = () => {
    const authRaw = localStorage.getItem('wellStoreAuth');
    if (!authRaw) return null;
    try {
      const parsed = JSON.parse(authRaw);
      return parsed.token;
    } catch (e) {
      return null;
    }
  };

  const normalizeProducts = (items, type) => {
    return items.map((item) => ({
      ...item,
      _type: type,
      _displayType: type.replace('-', ' '),
      _displayName: item.name || item.title || item.id || 'Unnamed Product',
      _displayStock: item.stock ?? item.totalStock ?? 0,
      _itemId: item._id || item.id,
    }));
  };

  const filteredProducts = filterCategory === 'all'
    ? products
    : products.filter((product) => product._type === filterCategory);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const [accessoriesRes, electronicsRes, kitchenRes, factionRes, mobileRes, sportRes] = await Promise.all([
        axios.get('http://localhost:4000/accessories'),
        axios.get('http://localhost:4000/electronic'),
        axios.get('http://localhost:4000/kitchen'),
        axios.get('http://localhost:4000/faction'),
        axios.get('http://localhost:4000/mobileproduct'),
        axios.get('http://localhost:4000/sport-shoes'),
      ]);

      const normalized = [
        ...normalizeProducts(accessoriesRes.data.data || [], 'accessories'),
        ...normalizeProducts(electronicsRes.data.data || [], 'electronics'),
        ...normalizeProducts(kitchenRes.data.data || [], 'kitchen'),
        ...normalizeProducts(factionRes.data.data || [], 'faction'),
        ...normalizeProducts(mobileRes.data.data || [], 'mobileproduct'),
        ...normalizeProducts(sportRes.data.data || [], 'sport-shoes'),
      ];

      setProducts(normalized);
    } catch (err) {
      console.error('Failed to fetch products', err);
      setError('Failed to load products. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const getDeleteEndpoint = (item) => {
    const type = item._type || '';
    if (type === 'accessories') return 'accessories';
    if (type === 'electronics') return 'electronics';
    if (type === 'kitchen') return 'kitchen';
    if (type === 'faction') return 'faction';
    if (type === 'mobileproduct') return 'mobileproduct';
    if (type === 'sport-shoes') return 'sport-shoes';

    const category = (item.category || '').toString().toLowerCase();
    if (category.includes('kitchen')) return 'kitchen';
    if (category.includes('electronics')) return 'electronics';
    if (category.includes('fashion') || category.includes('clothing') || category.includes('sports')) return 'faction';
    if (category.includes('mobile')) return 'mobileproduct';
    if (category.includes('shoe')) return 'sport-shoes';

    return null;
  };

  const toggleProductActions = (itemId) => {
    setActiveDeleteProductId((prev) => (prev === itemId ? null : itemId));
  };

  const handleDelete = async (item) => {
    const token = getAuthToken();
    if (!token) {
      setError('Please login as admin to delete products.');
      return;
    }

    const endpoint = getDeleteEndpoint(item);
    if (!endpoint) {
      setError('Unable to determine delete route for this product category.');
      return;
    }

    const confirmed = window.confirm(`Delete ${item._displayName} from ${item._displayType}?`);
    if (!confirmed) return;

    try {
      const idOrKey = item._itemId;
      await axios.delete(`http://localhost:4000/admin/${endpoint}/${idOrKey}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts((prev) => prev.filter((product) => product._itemId !== idOrKey || product._type !== item._type));
      setSuccess(`${item._displayName} deleted successfully.`);
      setError('');
      setActiveDeleteProductId(null);
    } catch (err) {
      console.error('Delete failed', err);
      setError(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="admin-products-page p-6">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Admin Products</h1>
        <p className="text-sm text-slate-600">Fetch all products from backend and delete them from the admin interface.</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <label className="text-sm font-medium">Filter by category:</label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2"
        >
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {loading && <div className="text-slate-600">Loading products...</div>}
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}

      {!loading && filteredProducts.length === 0 && <div className="text-slate-600">No products found.</div>}

      <div className="grid gap-4">
        {filteredProducts.map((product) => (
          <div key={`${product._type}-${product._itemId}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{product._displayType}</div>
                <h2 className="text-xl font-semibold">{product._displayName}</h2>
                <div className="mt-2 text-sm text-slate-600">
                  <div>Brand: {product.brand || '-'}</div>
                  <div>Category: {product.category || '-'}</div>
                  <div>Stock: {product._displayStock}</div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => toggleProductActions(product._itemId)}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {activeDeleteProductId === product._itemId ? 'Hide Actions' : 'Actions'}
                </button>
                {activeDeleteProductId === product._itemId && (
                  <button
                    onClick={() => handleDelete(product)}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;
