import React, { useState, useEffect } from 'react';
import { addCartItem } from '../utils/cart';
import Navbar from '../Navbar';
import { getProductImage, handleImageError } from '../utils/images';
import Loader from '../components/Loader';
import { useNotification } from '../components/NotificationProvider';

const API_BASE = 'http://localhost:4000';

const getProductStock = (product) => {
  if (product?.sizes?.length) {
    return product.sizes.reduce((sum, size) => sum + (Number(size.stock) || 0), 0);
  }
  return Number(product?.stock) || 0;
};

const getSelectedSizeStock = (product, selectedSize) => {
  if (!product) return 0;
  if (product.sizes?.length) {
    return product.sizes.find((size) => size.size === selectedSize)?.stock ?? 0;
  }
  return getProductStock(product);
};

const KitchenProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [modalError, setModalError] = useState('');
  const [detailError, setDetailError] = useState('');
  const [buttonLoadingId, setButtonLoadingId] = useState(null);
  const [modalAdding, setModalAdding] = useState(false);
  const [filters, setFilters] = useState({ brand: '', minPrice: '', maxPrice: '' });

  useEffect(() => {
    fetch(`${API_BASE}/kitchen`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch kitchen data');
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setDetailError('Unable to load kitchen products. Please refresh or try again later.');
        setLoading(false);
      });
  }, []);

  const handleFetchDetail = async (id) => {
    setDetailError('');
    setModalError('');

    try {
      const response = await fetch(`${API_BASE}/kitchen/${id}`);
      const data = await response.json();
      if (!response.ok) {
        setDetailError(data.error || 'Unable to load product details.');
        return;
      }
      setSelectedProduct(data.data);
      setSelectedSize(data.data.sizes?.[0]?.size || '');
      setSelectedQuantity(1);
    } catch (err) {
      console.error('Error fetching kitchen detail:', err);
      setDetailError('Unable to fetch kitchen product details.');
    }
  };

  const notification = useNotification();

  const handleAddToCart = async (product) => {
    if (!product) return;
    const totalStock = getProductStock(product);
    if (totalStock <= 0) {
      notification.showNotification('This product is out of stock', 'error');
      return;
    }

    setButtonLoadingId(product._id);
    await new Promise((resolve) => requestAnimationFrame(resolve));

    try {
      if (product.sizes?.length > 0) {
        await handleFetchDetail(product._id);
        setModalError('Please select a size and quantity to add this product to cart.');
        return;
      }

      addCartItem({
        _id: product._id,
        name: product.name,
        price: product.price,
        images: [{ image: product.images?.[0]?.image || '' }],
        brand: product.brand,
        category: product.category,
        stock: totalStock,
        quantity: 1,
      });
      notification.showNotification(`${product.name} added to cart`, 'success');
    } finally {
      setButtonLoadingId(null);
    }
  };

  const handleViewProduct = (product) => {
    if (product._id) {
      handleFetchDetail(product._id);
    } else {
      setDetailError('Product identifier missing.');
    }
  };

  const handleAddToCartFromModal = async () => {
    if (!selectedProduct) return;
    setModalError('');
    setModalAdding(true);
    await new Promise((resolve) => requestAnimationFrame(resolve));

    try {
      if (selectedProduct.sizes?.length > 0 && !selectedSize) {
        setModalError('Please choose a size before adding to cart.');
        return;
      }

      const availableStock = getSelectedSizeStock(selectedProduct, selectedSize);

      if (selectedQuantity < 1) {
        setModalError('Quantity must be at least 1.');
        return;
      }

      if (selectedQuantity > availableStock) {
        setModalError(`Only ${availableStock} item(s) available for the selected option.`);
        return;
      }

      addCartItem({
        _id: selectedProduct._id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        images: [{ image: selectedProduct.images?.[0]?.image || '' }],
        brand: selectedProduct.brand,
        category: selectedProduct.category,
        stock: getProductStock(selectedProduct),
        selectedSize: selectedSize || undefined,
        quantity: selectedQuantity,
      });
      notification.showNotification(`${selectedProduct.name} added to cart`, 'success');
      setSelectedProduct(null);
    } finally {
      setModalAdding(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredProducts = products.filter((product) => {
    const brandMatch = filters.brand ? product.brand.toLowerCase().includes(filters.brand.toLowerCase()) : true;
    const minPriceMatch = filters.minPrice ? product.price >= Number(filters.minPrice) : true;
    const maxPriceMatch = filters.maxPrice ? product.price <= Number(filters.maxPrice) : true;
    return brandMatch && minPriceMatch && maxPriceMatch;
  });

  if (loading) return <Loader text="Loading products..." variant="overlay" />;
  if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 page-with-navbar">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Kitchen & Home Essentials</h2>
            <p className="mt-1 text-sm text-gray-600">Discover practical picks for everyday cooking and living.</p>
          </div>
          {detailError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {detailError}
            </div>
          )}
        </div>

        <div className="mb-6 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-3">
          <input
            type="text"
            name="brand"
            value={filters.brand}
            onChange={handleFilterChange}
            placeholder="Filter by brand"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleFilterChange}
            placeholder="Min price"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            placeholder="Max price"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600 md:col-span-2 xl:col-span-3">
              No products match these filters.
            </div>
          )}
          {filteredProducts.map((product) => (
            <div key={product._id || product.id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <img
                src={getProductImage(product)}
                alt={product.name}
                className="h-56 w-full object-contain p-3"
                onError={handleImageError}
              />
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <p className="mt-1 text-sm uppercase tracking-wide text-gray-500">{product.brand} | {product.category}</p>
                <p className="mt-2 text-sm text-gray-600">{product.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-bold text-blue-600">₹{Number(product.price || 0).toLocaleString()}</span>
                  <span className="text-sm font-medium text-amber-500">⭐ {product.ratings}</span>
                </div>
                <p className={`mt-2 text-sm ${getProductStock(product) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {getProductStock(product) > 0 ? `In Stock: ${getProductStock(product)}` : 'Out of Stock'}
                </p>
                <div className="mt-auto flex gap-2 pt-4">
                  <button type="button" onClick={() => handleViewProduct(product)} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                    View
                  </button>
                  <button
                    type="button"
                    disabled={getProductStock(product) <= 0 || buttonLoadingId === product._id}
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {buttonLoadingId === product._id ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="btn-spinner" aria-hidden="true" />
                        Adding...
                      </span>
                    ) : (
                      'Add to Cart'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedProduct && (
          <div className="product-view-overlay" onClick={() => setSelectedProduct(null)}>
            <div className="product-view-modal" onClick={(e) => e.stopPropagation()}>
              <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
                <div className="flex items-center justify-center rounded-2xl bg-gray-50 p-3 sm:p-4">
                  <img
                    src={getProductImage(selectedProduct)}
                    alt={selectedProduct.name}
                    className="h-[320px] w-full rounded-2xl border border-gray-200 bg-white object-contain p-3 sm:h-[380px]"
                    onError={handleImageError}
                  />
                </div>
                <div>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900">{selectedProduct.name}</h3>
                      <p className="mt-2 text-sm text-gray-600">{selectedProduct.description}</p>
                    </div>
                    <button className="text-2xl text-gray-500" onClick={() => setSelectedProduct(null)}>
                      ×
                    </button>
                  </div>
                  <div className="grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
                <p><span className="font-semibold">Brand:</span> {selectedProduct.brand}</p>
                <p><span className="font-semibold">Category:</span> {selectedProduct.category}</p>
                <p><span className="font-semibold">Price:</span> ₹{Number(selectedProduct.price || 0).toLocaleString()}</p>
                <p><span className="font-semibold">Stock:</span> {getProductStock(selectedProduct)}</p>
              </div>

              {selectedProduct.sizes?.length > 0 ? (
                <div className="mt-5">
                  <label htmlFor="selectedSize" className="mb-2 block text-sm font-semibold text-gray-700">Size:</label>
                  <select
                    id="selectedSize"
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">Choose size</option>
                    {selectedProduct.sizes.map((sizeObject) => (
                      <option key={sizeObject.size} value={sizeObject.size}>
                        {sizeObject.size} ({sizeObject.stock || 0} available)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="mt-5 text-sm text-gray-600">No size selection required for this product.</p>
              )}

              <div className="mt-5">
                <label htmlFor="selectedQuantity" className="mb-2 block text-sm font-semibold text-gray-700">Quantity:</label>
                <input
                  id="selectedQuantity"
                  type="number"
                  min="1"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              {modalError && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{modalError}</div>}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={handleAddToCartFromModal}
                  disabled={modalAdding}
                  className="flex-1 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  {modalAdding ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="btn-spinner" aria-hidden="true" />
                      Adding...
                    </span>
                  ) : (
                    'Add to Cart'
                  )}
                </button>
                <button type="button" onClick={() => setSelectedProduct(null)} className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
        )}
      </div>
    </div>
  );
};

export default KitchenProducts;