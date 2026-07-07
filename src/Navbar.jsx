import { NavLink } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { addCartItem } from "./utils/cart";
import { getProductImage, handleImageError } from './utils/images';
import { useNotification } from './components/NotificationProvider';
export default function Navbar() {
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const searchTimerRef = useRef(null);
  // Fetch Products
 

  useEffect(() => {
   
    // determine if current logged in user is the admin
    try {
      const auth = localStorage.getItem('wellStoreAuth');
      if (auth) {
        const parsed = JSON.parse(auth);
        const email = (parsed.email || '').toLowerCase().trim();
        if (email === 'manojgunaseelan.g@gmail.com') setIsAdminUser(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Search Function
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    // debounce network search
    searchTimerRef.current = setTimeout(async () => {
      const q = value.trim();
      if (!q) {
        setFilteredProducts([]);
        return;
      }
      try {
        const res = await fetch(`http://localhost:4000/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        const list = json.data || [];
        setFilteredProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Search fetch error:', err);
        setFilteredProducts([]);
      }
    }, 300);
  };

  const clearSearch = () => {
    setSearch("");
    setFilteredProducts([]);
    setSelectedProduct(null);
  };

  const openProductView = (product) => {
    setSelectedProduct(product);
  };

  const notification = useNotification();

  const handleAddToCart = (product) => {
    addCartItem(product);
    notification.showNotification(`${product.name} added to cart!`, 'success');
    clearSearch();
  };

  const navbar = [
    { name: "Home", path: "/home" },
    { name: "Categories", path: "/categories" },
    { name: "Your Cart", path: "/yourcart" },
    { name: "Your Orders", path: "/yourorders" },
  ];

  return (
    <>
      <nav className="flipkart-navbar fixed-top">
        <div className="flipkart-navbar-inner">
          <NavLink className="flipkart-brand" to="/home">
            <span className="flipkart-brand-icon">🛍️</span>
            <span className="flipkart-brand-text">Well-Store</span>
          </NavLink>

          <form className="flipkart-searchbox" onSubmit={(e) => e.preventDefault()}>
            <input
              type="search"
              placeholder="Search for products, brands and more"
              value={search}
              onChange={handleSearch}
            />
            <button type="button" className="flipkart-search-btn">⌕</button>
          </form>

          <div className="flipkart-nav-actions">
            <ul className="flipkart-nav-links">
              {navbar.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `flipkart-nav-link ${isActive ? "active" : ""}`}
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
              {isAdminUser && (
                <li>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) => `flipkart-nav-link ${isActive ? "active" : ""}`}
                  >
                    🛡️ Admin
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Search Results Overlay */}
      {search && (
        <div className="search-overlay">
          <div className="search-panel">
            <div className="search-panel-header">
              <div className="w-100 d-flex gap-2 align-items-center">
                <input
                  className="form-control"
                  type="search"
                  placeholder="Search products..."
                  value={search}
                  onChange={handleSearch}
                  autoFocus
                />
              </div>
              <button className="btn btn-outline-secondary" onClick={clearSearch}>
                Close
              </button>
            </div>

            <div className="search-results-container">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div key={product._id} className="card search-result-card mb-3">
                    <div className="row g-0 align-items-center">
                      <div className="col-auto">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="img-fluid rounded-start"
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                          onError={handleImageError}
                        />
                      </div>
                      <div className="col">
                        <div className="card-body py-2">
                          <h5 className="card-title mb-1">{product.name}</h5>
                          <p className="card-text mb-1 text-muted" style={{ fontSize: '0.9rem' }}>
                            {product.brand} • {product.category}
                          </p>
                          <p className="card-text mb-2" style={{ fontWeight: 700 }}>
                            ₹{product.price}
                          </p>
                          <div className="d-flex gap-2 flex-wrap">
                            <button className="btn btn-primary btn-sm" onClick={() => handleAddToCart(product)}>
                              Add to Cart
                            </button>
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => openProductView(product)}>
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="mb-0">No products found</p>
              )}
            </div>
            <div className="d-flex gap-2 flex-wrap mt-3">
              <button className="btn btn-primary" onClick={() => selectedProduct && handleAddToCart(selectedProduct)}>
                Add to Cart
              </button>
              <button className="btn btn-outline-secondary" onClick={clearSearch}>
                Close Search
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}