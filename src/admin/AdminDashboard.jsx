import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import AddAccessory from './AddAccessory';
import AddElectronicProduct from './AddElectronicProduct';
import AddFactionProduct from './AddFactionProduct';
import AddKitchenProduct from './AddKitchenProduct';
import AddMobileProduct from './AddMobileProduct';
import AddSportShoeProduct from './AddSportShoeProduct';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import Loader from '../components/Loader';
export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard' | 'products' | 'orders'
  const [activeForm, setActiveForm] = useState(''); // 'accessory' | 'electronic' | 'faction' | 'kitchen' | 'mobile' | 'sport'
  const [newProductMenuOpen, setNewProductMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is admin by asking backend /me with token
    (async () => {
      try {
        const auth = localStorage.getItem('wellStoreAuth');
        if (!auth) return navigate('/');
        const parsed = JSON.parse(auth);
        const token = parsed && parsed.token;
        if (!token) return navigate('/');
        const res = await fetch('http://localhost:4000/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const user = data.user;
        if (user && user.isAdmin) {
          setIsAdmin(true);
          setAdminUser(user);
        } else {
          navigate('/home');
        }
      } catch (e) {
        navigate('/');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const goToSection = (section, form = '') => {
    setActiveSection(section);
    setActiveForm(form);
    if (section === 'orders') {
      navigate('/admin/orders');
    } else if (section === 'products') {
      navigate('/admin/products');
    } else {
      navigate('/admin');
    }
  };

  useEffect(() => {
    if (location.pathname.startsWith('/admin/orders')) {
      setActiveSection('orders');
      setActiveForm('');
      return;
    }

    if (location.pathname.startsWith('/admin/products')) {
      setActiveSection('products');
      return;
    }

    setActiveSection('dashboard');
    setActiveForm('');
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="admin-dashboard-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Loader text="Loading admin dashboard..." variant="dashboard" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-dashboard-wrapper">
      {/* Top bar: show signed-in admin and logout */}
      <div className="admin-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #eaeaea' }}>
        <div>
          <strong>Admin Panel</strong>
        </div>
        {adminUser && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ fontSize: 14 }}>
              <div style={{ fontWeight: 600 }}>{adminUser.name || 'Admin'}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{adminUser.email}</div>
            </div>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => { localStorage.removeItem('wellStoreAuth'); navigate('/'); }}>
              Logout
            </button>
          </div>
        )}
      </div>
      {/* Admin Navigation Tabs */}
      <div className="admin-navbar-tabs">
        <button
          className={`admin-tab ${activeSection === 'dashboard' ? 'active' : ''}`}
          onClick={() => goToSection('dashboard')}
        >
          🛡️ Dashboard
        </button>
       
        <div className="admin-new-product-dropdown" style={{ position: 'relative' }}>
          <button
            className={`admin-tab ${activeForm ? 'active' : ''}`}
            onClick={() => setNewProductMenuOpen((open) => !open)}
            type="button"
          >
            ➕ New Product
          </button>
          {newProductMenuOpen && (
            <div className="admin-new-product-menu" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 10, background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, boxShadow: '0 10px 20px rgba(0,0,0,0.08)', width: 220, padding: 8 }}>
              <button className="admin-tab menu-item" type="button" onClick={() => { goToSection('products', 'accessory'); setNewProductMenuOpen(false); }} style={{ width: '100%', textAlign: 'left' }}>Add Accessory</button>
              <button className="admin-tab menu-item" type="button" onClick={() => { goToSection('products', 'electronic'); setNewProductMenuOpen(false); }} style={{ width: '100%', textAlign: 'left' }}>Add Electronic</button>
              <button className="admin-tab menu-item" type="button" onClick={() => { goToSection('products', 'faction'); setNewProductMenuOpen(false); }} style={{ width: '100%', textAlign: 'left' }}>Add Fashion</button>
              <button className="admin-tab menu-item" type="button" onClick={() => { goToSection('products', 'kitchen'); setNewProductMenuOpen(false); }} style={{ width: '100%', textAlign: 'left' }}>Add Kitchen</button>
              <button className="admin-tab menu-item" type="button" onClick={() => { goToSection('products', 'mobile'); setNewProductMenuOpen(false); }} style={{ width: '100%', textAlign: 'left' }}>Add Mobile</button>
              <button className="admin-tab menu-item" type="button" onClick={() => { goToSection('products', 'sport'); setNewProductMenuOpen(false); }} style={{ width: '100%', textAlign: 'left' }}>Add Sport Shoe</button>
            </div>
          )}
        </div>
        <button
          className={`admin-tab ${activeSection === 'orders' ? 'active' : ''}`}
          onClick={() => goToSection('orders')}
        >
          📋 Orders
        </button>
      </div>

      {/* Dashboard Section */}
      {activeSection === 'dashboard' && (
        <div className="admin-dashboard-container">
          <div className="admin-dashboard-header">
            <h1>🛡️ Admin Dashboard</h1>
            <p>Manage your store's products and orders</p>
          </div>

          <div className="admin-dashboard-grid">
            {/* Product Management Card */}
            <div className="admin-dashboard-card" onClick={() => { setActiveSection('products'); setActiveForm(''); }}>
              <div className="card-icon">📦</div>
              <h2>Product Management</h2>
              <p>Add, edit, or delete products and package details from your store</p>
              <div className="card-features" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                <button className="btn btn-sm btn-warning" type="button" onClick={(e) => e.stopPropagation()}>PUT</button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSection('products');
                    setActiveForm('');
                  }}
                >
                  DELETE
                </button>
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-sm btn-outline-primary"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewProductMenuOpen(true);
                  }}
                >
                  Add Package
                </button>
              </div>
            </div>

            {/* Order Management Card */}
            <div className="admin-dashboard-card" onClick={() => setActiveSection('orders')}>
              <div className="card-icon">📋</div>
              <h2>Order Management</h2>
              <p>View and manage all customer orders</p>
              <div className="card-features">
                <span className="badge badge-info">VIEW</span>
                <span className="badge badge-success">UPDATE STATUS</span>
              </div>
            </div>
          </div>

          <div className="admin-dashboard-footer">
            <p>Welcome to the Admin Panel</p>
            <small>Click on any card or use the tabs above to manage your store</small>
            {adminUser && (
              <div style={{ marginTop: 8 }}>
                <strong>Signed in as:</strong> {adminUser.name || 'Admin'} — {adminUser.email}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Section */}
      {activeSection === 'products' && (
        <>
          <div style={{ marginTop: 20 }}>
            <h2>Admin Product Management</h2>
          </div>

          {(activeForm === 'accessory' || activeForm === 'electronic' || activeForm === 'faction' || activeForm === 'kitchen' || activeForm === 'mobile' || activeForm === 'sport') ? (
            <div style={{ marginTop: 20, minHeight: '80vh' }}>
              {activeForm === 'accessory' && (
                <>
                  <h2>Add Accessory (Admin)</h2>
                  <AddAccessory />
                </>
              )}
              {activeForm === 'electronic' && (
                <>
                  <h2>Add Electronic Product (Admin)</h2>
                  <AddElectronicProduct />
                </>
              )}
              {activeForm === 'faction' && (
                <>
                  <h2>Add Fashion Product (Admin)</h2>
                  <AddFactionProduct />
                </>
              )}
              {activeForm === 'kitchen' && (
                <>
                  <h2>Add Kitchen Product (Admin)</h2>
                  <AddKitchenProduct />
                </>
              )}
              {activeForm === 'mobile' && (
                <>
                  <h2>Add Mobile Product (Admin)</h2>
                  <AddMobileProduct />
                </>
              )}
              {activeForm === 'sport' && (
                <>
                  <h2>Add Sport Shoe Product (Admin)</h2>
                  <AddSportShoeProduct />
                </>
              )}
              <div style={{ marginTop: 12 }}>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setActiveForm('')}>Back to Products</button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 20 }}>
              <AdminProducts />
            </div>
          )}
        </>
      )}

      {/* Orders Section */}
      {activeSection === 'orders' && <AdminOrders />}
    </div>
  );
}
