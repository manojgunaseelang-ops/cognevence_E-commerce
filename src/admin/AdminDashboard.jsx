import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import Loader from '../components/Loader';
export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard' | 'products' | 'orders'
  const navigate = useNavigate();

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
          navigate('/dashboard');
        }
      } catch (e) {
        navigate('/');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

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
          onClick={() => setActiveSection('dashboard')}
        >
          🛡️ Dashboard
        </button>
        <button
          className={`admin-tab ${activeSection === 'products' ? 'active' : ''}`}
          onClick={() => setActiveSection('products')}
        >
          📦 Products
        </button>
        <button
          className={`admin-tab ${activeSection === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveSection('orders')}
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
            <div className="admin-dashboard-card" onClick={() => setActiveSection('products')}>
              <div className="card-icon">📦</div>
              <h2>Product Management</h2>
              <p>Add, Edit, or Delete products from your store</p>
              <div className="card-features">
                <span className="badge badge-primary">POST</span>
                <span className="badge badge-warning">PUT</span>
                <span className="badge badge-danger">DELETE</span>
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
      {activeSection === 'products' && <AdminProducts />}

      {/* Orders Section */}
      {activeSection === 'orders' && <AdminOrders />}
    </div>
  );
}
