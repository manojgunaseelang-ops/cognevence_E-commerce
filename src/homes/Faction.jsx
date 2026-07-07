import { useState, useEffect } from 'react';
import { addCartItem } from '../utils/cart';
import Navbar from '../Navbar';
import { useNotification } from '../components/NotificationProvider';
import { useLoading } from '../components/LoadingProvider';
import { DEFAULT_IMAGE_PLACEHOLDER } from '../utils/images';
const API_BASE = 'http://localhost:4000';

const getProductStock = (product) => {
  if (product?.sizes?.length) {
    return product.sizes.reduce((sum, sizeObject) => sum + (Number(sizeObject.stock) || 0), 0);
  }
  return Number(product?.stock) || 0;
};

export default function Faction() {
  const [factionData, setFactionData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [modalError, setModalError] = useState('');
  const [detailError, setDetailError] = useState('');
  const [filters, setFilters] = useState({ brand: '', gender: '', minPrice: '', maxPrice: '' });

  const notification = useNotification();
  const { withLoading } = useLoading();

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPadding = document.body.style.paddingRight;

    if (selectedProduct) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = scrollBarWidth > 0 ? `${scrollBarWidth}px` : originalPadding;
    } else {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPadding;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPadding;
    };
  }, [selectedProduct]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE}/faction`);
        const data = await response.json();
        setFactionData(data.data || []);
      } catch (error) {
        console.error('Error fetching faction data:', error);
        setDetailError('Unable to load fashion products. Please try again later.');
      }
    };

    withLoading(fetchData).catch((error) => {
      console.error('Error during faction page load:', error);
    });
  }, [withLoading]);

  const handleFetchDetail = async (id) => {
    setDetailError('');
    setModalError('');
    try {
      await withLoading(async () => {
        const response = await fetch(`${API_BASE}/faction/${id}`);
        const data = await response.json();
        if (!response.ok) {
          setDetailError(data.error || 'Unable to load product details');
          return;
        }
        setSelectedProduct(data.data);
        setSelectedSize(data.data.sizes?.[0]?.size || '');
        setSelectedQuantity(1);
      });
    } catch (error) {
      console.error('Error loading faction detail:', error);
      setDetailError('Unable to fetch fashion product details.');
    }
  };

  const handleAddToCart = (product) => {
    const totalStock = getProductStock(product);
    if (totalStock <= 0) {
      notification.showNotification('Product is out of stock', 'error');
      return;
    }
    if (product.sizes?.length > 0) {
      handleFetchDetail(product._id);
      setModalError('Please choose a size before adding to cart.');
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
  };

  const handleViewProduct = (product) => {
    if (product._id) {
      handleFetchDetail(product._id);
    } else {
      setDetailError('Product identifier missing.');
    }
  };

  const handleAddToCartFromModal = () => {
    if (!selectedProduct) return;
    setModalError('');

    if (selectedProduct.sizes?.length > 0 && !selectedSize) {
      setModalError('Please choose a size before adding to cart.');
      return;
    }

    const availableStock = selectedProduct.sizes?.length
      ? selectedProduct.sizes.find((size) => size.size === selectedSize)?.stock ?? 0
      : getProductStock(selectedProduct);

    if (selectedQuantity < 1) {
      setModalError('Quantity must be at least 1.');
      return;
    }

    if (selectedQuantity > availableStock) {
      setModalError(`Only ${availableStock} item(s) available for selected size.`);
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
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredProducts = factionData.filter((item) => {
    const brandMatch = filters.brand ? item.brand.toLowerCase().includes(filters.brand.toLowerCase()) : true;
    const genderMatch = filters.gender ? item.gender === filters.gender : true;
    const minPriceMatch = filters.minPrice ? item.price >= Number(filters.minPrice) : true;
    const maxPriceMatch = filters.maxPrice ? item.price <= Number(filters.maxPrice) : true;
    return brandMatch && genderMatch && minPriceMatch && maxPriceMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 page-with-navbar">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Fashion & Clothing</h2>
            <p className="mt-1 text-sm text-gray-600">Explore trendy fashion picks for every style.</p>
          </div>
          {detailError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {detailError}
            </div>
          )}
        </div>

        <div className="mb-6 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-4">
          <input
            type="text"
            name="brand"
            value={filters.brand}
            onChange={handleFilterChange}
            placeholder="Filter by brand"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <select
            name="gender"
            value={filters.gender}
            onChange={handleFilterChange}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All genders</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="unisex">Unisex</option>
          </select>
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
          {filteredProducts.map((item) => (
            <div key={item._id || item.id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <img src={item.images?.[0]?.image || DEFAULT_IMAGE_PLACEHOLDER} alt={item.name} className="h-56 w-full object-contain p-3" />
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <p className="mt-1 text-sm text-gray-600">Brand: {item.brand}</p>
                <p className="mt-1 text-sm text-gray-600">Category: {item.category}</p>
                <p className="mt-2 text-xl font-bold text-blue-600">₹{Number(item.price || 0).toLocaleString()}</p>
                <p className="mt-1 text-sm text-gray-500">Stock: {getProductStock(item)}</p>
                <div className="mt-auto flex gap-2 pt-4">
                  <button type="button" onClick={() => handleViewProduct(item)} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                    View
                  </button>
                  <button type="button" onClick={() => handleAddToCart(item)} disabled={getProductStock(item) <= 0} className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400">
                    Add to Cart
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
                  <img src={selectedProduct.images?.[0]?.image || DEFAULT_IMAGE_PLACEHOLDER} alt={selectedProduct.name} className="h-[320px] w-full rounded-2xl border border-gray-200 bg-white object-contain p-3 sm:h-[380px]" />
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
                    <option value="">Select size</option>
                    {selectedProduct.sizes.map((sizeObject) => (
                      <option key={sizeObject.size} value={sizeObject.size}>
                        {sizeObject.size} ({sizeObject.stock} available)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="mt-5 text-sm text-gray-600">No size selection needed for this item.</p>
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
                <button type="button" onClick={handleAddToCartFromModal} className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                  Add to Cart
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
}