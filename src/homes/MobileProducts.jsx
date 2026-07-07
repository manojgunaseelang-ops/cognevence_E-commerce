import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../Navbar";
import { getProductImage, handleImageError } from '../utils/images';
import Loader from "../components/Loader";
import { addCartItem } from '../utils/cart';
import { useNotification } from '../components/NotificationProvider';


const getProductStock = (product) => {
  if (product?.sizes?.length) {
    return product.sizes.reduce((sum, size) => sum + (Number(size.stock) || 0), 0);
  }
  return Number(product?.stock) || 0;
};

const MobileProducts = () => {
  const notification = useNotification();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    brand: '',
    minPrice: '',
    maxPrice: '',
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    fetchProducts({}, { showLoader: true });
  }, []);

  const fetchProducts = async (filterParams = {}, { showLoader = false } = {}) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      setError(null);
      const queryParams = new URLSearchParams();
      queryParams.append('mobile', 'true');
      if (filterParams.brand) queryParams.append('brand', filterParams.brand);
      if (filterParams.minPrice) queryParams.append('minPrice', filterParams.minPrice);
      if (filterParams.maxPrice) queryParams.append('maxPrice', filterParams.maxPrice);

      const url = `http://localhost:4000/mobileproduct?${queryParams.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }

      const data = await response.json();
      setProducts(data.data || []);
    } catch (err) {
      console.error('Error fetching mobile products:', err);
      setError(err.message);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    // apply immediately (consistent with SportShoes)
    fetchProducts(newFilters);
  };

  const applyFilters = () => {
    fetchProducts(filters);
  };

  const handleReset = () => {
    setFilters({
      brand: '',
      minPrice: '',
      maxPrice: '',
    });
    fetchProducts({});
  };

  const handleAddToCart = (product) => {
    if (getProductStock(product) <= 0) {
      setValidationError('This product is out of stock!');
      return false;
    }
    if (selectedQuantity < 1 || !selectedQuantity) {
      setValidationError('Please select a valid quantity');
      return false;
    }
    // Ensure price and image fields are present for cart display
    const normalized = {
      ...product,
      price: product.price || 0,
      images: [{ image: product.images?.[0]?.image || product.images?.[0]?.url || '' }],
      quantity: selectedQuantity,
    };
    addCartItem(normalized);
    notification.showNotification(`${product.name} (Qty: ${selectedQuantity}) added to cart!`, 'success');
    setSelectedQuantity(1);
    setValidationError('');
    return true;
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setSelectedQuantity(1); // Reset slider scale back to 1 on opening modal
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setValidationError('');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <Loader text="Loading mobile phones..." variant="overlay" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <div className="alert alert-danger" role="alert">
            <strong>Error:</strong> {error}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 page-with-navbar">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mobile Phones</h1>
              <p className="mt-1 text-sm text-gray-600">Explore the newest smartphones with premium specs.</p>
            </div>
          </div>

          <div className="mb-6 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-4">
            <div>
              <label htmlFor="brand" className="mb-1 block text-sm font-semibold text-gray-700">Brand</label>
              <select
                id="brand"
                name="brand"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={filters.brand}
                onChange={handleFilterChange}
              >
                <option value="">All Brands</option>
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
                <option value="OPPO">OPPO</option>
                <option value="Xiaomi">Xiaomi</option>
                <option value="Realme">Realme</option>
                <option value="OnePlus">OnePlus</option>
              </select>
            </div>

            <div>
              <label htmlFor="minPrice" className="mb-1 block text-sm font-semibold text-gray-700">Min Price</label>
              <input
                id="minPrice"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                name="minPrice"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min"
              />
            </div>

            <div>
              <label htmlFor="maxPrice" className="mb-1 block text-sm font-semibold text-gray-700">Max Price</label>
              <input
                id="maxPrice"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                name="maxPrice"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max"
              />
            </div>

            <div className="flex items-end">
              <button type="button" className="w-full rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700" onClick={handleReset}>
                Reset Filters
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product._id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="h-56 w-full object-contain p-3"
                    onError={handleImageError}
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
                    <p className="mt-3 text-sm text-slate-500">Tap View for full specifications and purchase options.</p>
                    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-gray-700">
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900">Stock: {getProductStock(product)}</p>
                        <p className="text-gray-500">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-600">₹{product.price?.toLocaleString() || 'N/A'}</p>
                        <p className="text-amber-500">⭐ {product.ratings}</p>
                      </div>
                    </div>

                    <div className="mt-auto flex gap-2 pt-4">
                      <button type="button" onClick={() => handleViewProduct(product)} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                        View
                      </button>
                      <button type="button" onClick={() => handleAddToCart(product)} className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600 md:col-span-2 xl:col-span-3">
                No products found matching your filters.
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedProduct && (
        <div className="product-view-overlay" onClick={closeModal}>
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
                    <h2 className="text-2xl font-semibold text-gray-900">{selectedProduct.name}</h2>
                    <p className="mt-2 text-sm text-gray-600">{selectedProduct.description}</p>
                  </div>
                  <button type="button" onClick={closeModal} className="text-2xl text-gray-500">✕</button>
                </div>

                <p className="mb-3 text-xl font-bold text-blue-600">₹{selectedProduct.price?.toLocaleString() || 'N/A'}</p>
                <p className="mb-2 text-sm text-gray-700"><span className="font-semibold">Brand:</span> {selectedProduct.brand}</p>

                <div className="mb-5 rounded-xl bg-gray-50 p-4">
              <h4 className="mb-3 text-sm font-semibold text-gray-800">Specifications</h4>
              <div className="grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
                <p><span className="font-semibold">RAM:</span> {selectedProduct.ram}</p>
                <p><span className="font-semibold">Storage:</span> {selectedProduct.rom}</p>
                <p><span className="font-semibold">Display:</span> {selectedProduct.display}</p>
                <p><span className="font-semibold">Processor:</span> {selectedProduct.processor}</p>
              </div>
            </div>

            <div className="mb-4 rounded-xl border border-gray-200 p-4">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Quantity: <span className="text-blue-600">{selectedQuantity}</span>
              </label>
              <input
                type="range"
                min="1"
                max={Math.min(getProductStock(selectedProduct), 10)}
                value={selectedQuantity}
                onChange={(e) => {
                  setSelectedQuantity(Number(e.target.value));
                  setValidationError('');
                }}
                className="w-full"
              />
              <p className="mt-1 text-sm text-gray-500">Max available: {getProductStock(selectedProduct)} units</p>
            </div>

            {validationError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                ⚠️ {validationError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  const ok = handleAddToCart(selectedProduct);
                  if (ok) closeModal();
                }}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Add to Cart
              </button>
              <button type="button" onClick={closeModal} className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Close
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  );
};

export default MobileProducts;