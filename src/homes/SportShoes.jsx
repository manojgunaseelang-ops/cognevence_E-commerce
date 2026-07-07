import { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import { getProductImage, handleImageError } from '../utils/images';
import Loader from '../components/Loader';
import { addCartItem } from '../utils/cart';
import { useNotification } from '../components/NotificationProvider';

const SportShoes = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    brand: '',
    gender: '',
    minPrice: '',
    maxPrice: '',
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [validationError, setValidationError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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
      if (filterParams.brand) queryParams.append('brand', filterParams.brand);
      if (filterParams.gender) queryParams.append('gender', filterParams.gender);
      if (filterParams.minPrice) queryParams.append('minPrice', filterParams.minPrice);
      if (filterParams.maxPrice) queryParams.append('maxPrice', filterParams.maxPrice);
      const response = await fetch(`http://localhost:4000/sport-shoes?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }
      const data = await response.json();
      setProducts(data.data || []);
    } catch (err) {
      console.error('Error fetching sport shoes:', err);
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
    fetchProducts(newFilters);
  };

  const handleReset = () => {
    setFilters({
      brand: '',
      gender: '',
      minPrice: '',
      maxPrice: '',
    });
    fetchProducts({});
  };

  const notification = useNotification();

  const getProductId = (product) => {
    if (!product) return '';
    return product._id || product.id || product.sku || `${product.name}-${selectedSize || ''}`;
  };

  const handleAddToCart = (product) => {
    const hasVariants = Array.isArray(product?.variants) && product.variants.length > 0;

    if (hasVariants) {
      if (!selectedSize || selectedProduct?._id !== product._id) {
        setSelectedProduct(product);
        setSelectedSize('');
        setValidationError('Please select a size before adding to cart.');
        return false;
      }

      const selectedVariant = product.variants.find((variant) => String(variant.size) === String(selectedSize));
      if (!selectedVariant) {
        setValidationError('Selected size is unavailable. Please choose another size.');
        return false;
      }

      if (Number(selectedVariant.stock || 0) <= 0) {
        notification.showNotification('Selected size is out of stock', 'error');
        return false;
      }

      addCartItem({
        _id: selectedVariant.sku || getProductId(product),
        name: product.name,
        brand: product.brand,
        price: Number(product.pricing?.basePrice || product.price || 0),
        images: [{ image: product.images?.[0]?.url || product.images?.[0]?.image || '' }],
        selectedSize,
        quantity: 1,
      });

      notification.showNotification(`${product.name} (${selectedSize}) added to cart`, 'success');
      setSelectedProduct(null);
      setSelectedSize('');
      setValidationError('');
      return true;
    }

    const totalStock = Number(product.totalStock || product.stock || 0);
    if (totalStock <= 0) {
      notification.showNotification('This product is out of stock', 'error');
      return false;
    }

    const normalized = {
      _id: getProductId(product),
      name: product.name,
      brand: product.brand,
      price: Number(product.pricing?.basePrice || product.price || 0),
      images: [{ image: product.images?.[0]?.url || product.images?.[0]?.image || '' }],
      selectedSize: undefined,
      quantity: 1,
    };

    addCartItem(normalized);
    notification.showNotification(`${product.name} added to cart`, 'success');
    return true;
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setSelectedSize('');
    setValidationError('');
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const calculateDiscountedPrice = (basePrice, discountPercentage) => {
    return basePrice - (basePrice * discountPercentage) / 100;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div>
          <Loader text="Loading sport shoes..." variant="overlay" />
        </div>
      </>
    );
  }

  const isComponentBusy = actionLoading;

  if (error) {
    return (
      <>
        <Navbar />
        <div>
          <div>Error: {error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 page-with-navbar relative">
        {isComponentBusy && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm">
            <Loader text="Processing" variant="overlay" />
          </div>
        )}
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sport Running Shoes</h1>
              <p className="mt-1 text-sm text-gray-600">Step into comfort with performance-ready sneakers.</p>
            </div>
          </div>

          <div className="mb-6 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-5">
            <div>
              <label htmlFor="brand" className="mb-1 block text-sm font-semibold text-gray-700">Brand</label>
              <select id="brand" name="brand" value={filters.brand} onChange={handleFilterChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500">
                <option value="">All Brands</option>
                <option value="Nike">Nike</option>
                <option value="Adidas">Adidas</option>
                <option value="Puma">Puma</option>
                <option value="Asics">Asics</option>
                <option value="Reebok">Reebok</option>
                <option value="Brooks">Brooks</option>
                <option value="Campus">Campus</option>
                <option value="Under Armour">Under Armour</option>
              </select>
            </div>

            <div>
              <label htmlFor="gender" className="mb-1 block text-sm font-semibold text-gray-700">Gender</label>
              <select id="gender" name="gender" value={filters.gender} onChange={handleFilterChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500">
                <option value="">All</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>

            <div>
              <label htmlFor="minPrice" className="mb-1 block text-sm font-semibold text-gray-700">Min Price</label>
              <input id="minPrice" type="text" inputMode="numeric" pattern="[0-9]*" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} placeholder="Min" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>

            <div>
              <label htmlFor="maxPrice" className="mb-1 block text-sm font-semibold text-gray-700">Max Price</label>
              <input id="maxPrice" type="text" inputMode="numeric" pattern="[0-9]*" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} placeholder="Max" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>

            <div className="flex items-end">
              <button type="button" onClick={handleReset} className="w-full rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600">
                Reset Filters
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.length > 0 ? (
              products.map((product) => (
                <article key={product._id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className="relative">
                    <img src={getProductImage(product)} alt={product.name} onError={handleImageError} className="h-56 w-full object-cover" />
                    {product.pricing.discountPercentage > 0 && (
                      <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-semibold text-white">
                        -{product.pricing.discountPercentage}%
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
                    <p className="mt-2 text-sm text-gray-600">{product.description}</p>

                    <div className="mt-4 text-sm text-gray-700">
                      <span className="font-semibold">Price: </span>
                      {product.pricing.discountPercentage > 0 ? (
                        <>
                          <span className="mr-2 text-gray-400 line-through">₹{product.pricing.basePrice.toLocaleString()}</span>
                          <span className="font-bold text-green-600">₹{calculateDiscountedPrice(product.pricing.basePrice, product.pricing.discountPercentage).toLocaleString()}</span>
                        </>
                      ) : (
                        <span className="font-bold text-green-600">₹{product.pricing.basePrice.toLocaleString()}</span>
                      )}
                    </div>

                    <div className="mt-auto flex gap-2 pt-4">
                      <button type="button" onClick={() => handleViewProduct(product)} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                        View Details
                      </button>
                      <button type="button" onClick={() => handleAddToCart(product)} className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600 md:col-span-2 xl:col-span-3">
                No sport shoes found matching your filters.
              </div>
            )}
          </div>
        </div>

        {selectedProduct && (
          <div className="product-view-overlay" onClick={closeModal}>
            <div className="product-view-modal" onClick={(e) => e.stopPropagation()}>
              <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
                <div className="flex items-center justify-center rounded-2xl bg-gray-50 p-3 sm:p-4">
                  <img src={getProductImage(selectedProduct)} alt={selectedProduct.name} onError={handleImageError} className="h-[320px] w-full rounded-2xl border border-gray-200 bg-white object-contain p-3 sm:h-[380px]" />
                </div>
                <div>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">{selectedProduct.name}</h2>
                      <p className="mt-2 text-sm text-gray-600">{selectedProduct.description}</p>
                    </div>
                    <button type="button" onClick={closeModal} className="text-2xl text-gray-500" aria-label="Close">×</button>
                  </div>

                  <p className="mb-3 text-xl font-bold text-blue-600">₹{selectedProduct.pricing.basePrice?.toLocaleString() || 'N/A'}</p>
                  <p className="mb-2 text-sm text-gray-700"><span className="font-semibold">Brand:</span> {selectedProduct.brand}</p>

                  <div className="mb-4 grid gap-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-700 sm:grid-cols-2">
                <div>
                  <p className="font-semibold">Variant count</p>
                  <p>{selectedProduct.variants?.length || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold">Discount</p>
                  <p>{selectedProduct.pricing.discountPercentage}%</p>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="modalSizeSelector" className="mb-2 block text-sm font-semibold text-gray-700">Select Size</label>
                <select id="modalSizeSelector" value={selectedSize} onChange={(e) => { setSelectedSize(e.target.value); setValidationError(''); }} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500">
                  <option value="">Choose a size</option>
                  {selectedProduct.variants?.map((variant) => (
                    <option key={variant.sku} value={variant.size}>
                      {variant.size} {variant.stock ? `(${variant.stock} in stock)` : '(Out of stock)'}
                    </option>
                  ))}
                </select>
              </div>

              {validationError && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">⚠️ {validationError}</div>}

              <div className="flex gap-3">
                <button type="button" onClick={() => { if (handleAddToCart(selectedProduct)) closeModal(); }} className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
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
      </div>
    </>
  );
};

export default SportShoes;