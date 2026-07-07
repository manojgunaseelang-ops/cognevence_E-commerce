import { useState, useEffect } from 'react';
import Loader from '../components/Loader';

const fetchAllOrders = async (setOrders, setLoading, setError) => {
  try {
    setLoading(true);
    const headers = {};
    try {
      const auth = localStorage.getItem('wellStoreAuth');
      const parsed = auth ? JSON.parse(auth) : null;
      if (parsed && parsed.token) headers['Authorization'] = `Bearer ${parsed.token}`;
    } catch {
      // ignore parsing errors
    }
    const response = await fetch('http://localhost:4000/admin/orders', { headers });
    const data = await response.json();
    if (data.orders) {
      setOrders(data.orders);
      setError(null);
    } else {
      setError('Failed to fetch orders');
    }
  } catch (err) {
    console.error('Error fetching orders:', err);
    setError('Error fetching orders');
  } finally {
    setLoading(false);
  }
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState({});

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const headers = {};
      try {
        const auth = localStorage.getItem('wellStoreAuth');
        const parsed = auth ? JSON.parse(auth) : null;
        if (parsed && parsed.token) headers['Authorization'] = `Bearer ${parsed.token}`;
      } catch (e) {}
      const response = await fetch('http://localhost:4000/admin/orders', { headers });
      const data = await response.json();
      if (data.orders) {
        setOrders(data.orders);
        setError(null);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdateLoading({ ...updateLoading, [orderId]: true });
      const headers = { 'Content-Type': 'application/json' };
      try {
        const auth = localStorage.getItem('wellStoreAuth');
        const parsed = auth ? JSON.parse(auth) : null;
        if (parsed && parsed.token) headers['Authorization'] = `Bearer ${parsed.token}`;
      } catch (e) {}
      const response = await fetch(`http://localhost:4000/admin/orders/${orderId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (response.ok) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
      } else {
        setError(data.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Error updating order status');
    } finally {
      setUpdateLoading({ ...updateLoading, [orderId]: false });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const statusBadgeClass = (status) => {
    const statusClasses = {
      'pending': 'badge-warning',
      'confirmed': 'badge-info',
      'shipped': 'badge-primary',
      'delivered': 'badge-success',
      'cancelled': 'badge-danger'
    };
    return statusClasses[status] || 'badge-secondary';
  };

  if (loading) {
    return (
      <div className="admin-container">
        <Loader text="Loading orders..." variant="overlay" />
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>🛡️ Admin - Order Management</h1>
        <p>View and manage all customer orders and their delivery status</p>
        <button className="btn btn-sm btn-primary" onClick={fetchAllOrders} style={{ marginTop: 12 }}>
          🔄 Refresh Orders
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="alert alert-info">No orders found</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-striped">
            <thead className="table-dark">
              <tr>
                <th>Order ID</th>
                <th>Customer Email</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Order Date</th>
                <th>Delivery Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="order-id">
                    <small>{order._id.substring(order._id.length - 6).toUpperCase()}</small>
                  </td>
                  <td>{order.userEmail}</td>
                  <td>₹{order.totalAmount}</td>
                  <td>{order.paymentMethod}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>{formatDate(order.deliveryDate)}</td>
                  <td>
                    <span className={`badge ${statusBadgeClass(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      disabled={updateLoading[order._id]}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="admin-summary">
        <div className="summary-card">
          <h5>Total Orders</h5>
          <p className="display-6">{orders.length}</p>
        </div>
        <div className="summary-card">
          <h5>Total Revenue</h5>
          <p className="display-6">₹{orders.reduce((sum, order) => sum + order.totalAmount, 0)}</p>
        </div>
        <div className="summary-card">
          <h5>Delivered</h5>
          <p className="display-6">{orders.filter(o => o.status === 'delivered').length}</p>
        </div>
        <div className="summary-card">
          <h5>Pending</h5>
          <p className="display-6">{orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length}</p>
        </div>
      </div>
    </div>
  );
}
