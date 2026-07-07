import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import Loader from '../components/Loader';
import { useNotification } from '../components/NotificationProvider';

export default function Yoursoredr() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const notification = useNotification();

  const fetchOrders = async (email) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`http://localhost:4000/orders?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load orders');
      }
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getAuth = () => {
    if (typeof window === 'undefined') return null;
    const authString = localStorage.getItem('wellStoreAuth');
    if (!authString) return null;
    try {
      const parsed = JSON.parse(authString);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (err) {
      localStorage.removeItem('wellStoreAuth');
      return null;
    }
  };
  useEffect(() => {
    const auth = getAuth();
    const email = auth?.email?.toString()?.toLowerCase()?.trim();
    if (!email) {
      notification.showNotification('Login is required to view your orders.', 'warning');
      navigate('/login');
      return;
    }

    fetchOrders(email);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 page-with-navbar">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Your Orders</h1>
            <p className="mt-1 text-sm text-slate-500">Refresh after status updates to see the latest delivered state.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const auth = getAuth();
              const email = auth?.email?.toString()?.toLowerCase()?.trim();
              if (email) fetchOrders(email);
            }}
            className="inline-flex items-center justify-center rounded-2xl border border-blue-500 bg-white px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Refresh Orders
          </button>
        </div>
        {loading ? (
          <div className="mt-8">
            <Loader text="Loading your orders..." variant="overlay" />
          </div>
        ) : error ? (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
            <p className="text-lg font-medium">You don't have any orders yet.</p>
            <p className="mt-2 text-sm text-slate-500">Shop now to see your purchase history appear here.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Order #{order._id.slice(-6).toUpperCase()}</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">{order.status}</h2>
                    <p className="mt-2 text-sm text-slate-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                    <p className="text-sm text-slate-500">Delivery by {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'Not available'}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4 text-right sm:text-left md:text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Payment</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{order.paymentMethod || 'COD'}</p>
                    <p className="mt-1 text-sm text-slate-500">Total: <span className="font-semibold text-slate-900">₹{order.totalAmount.toFixed(2)}</span></p>
                  </div>
                </div>

                {order.deliveryAddress && (
                  order.deliveryAddress.fullName ||
                  order.deliveryAddress.name ||
                  order.deliveryAddress.line1 ||
                  order.deliveryAddress.addressLine ||
                  order.deliveryAddress.line2 ||
                  order.deliveryAddress.locality ||
                  order.deliveryAddress.city ||
                  order.deliveryAddress.state ||
                  order.deliveryAddress.pincode ||
                  order.deliveryAddress.landmark
                ) && (
                  <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Delivery Address</p>
                    <p className="mt-3 text-sm font-semibold text-slate-900">
                      {order.deliveryAddress.fullName || order.deliveryAddress.name || 'Customer'} · {order.deliveryAddress.phone || 'N/A'}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {order.deliveryAddress.line1 ? `${order.deliveryAddress.line1}` : ''}
                      {order.deliveryAddress.addressLine ? `${order.deliveryAddress.line1 ? ', ' : ''}${order.deliveryAddress.addressLine}` : ''}
                      {order.deliveryAddress.line2 ? `, ${order.deliveryAddress.line2}` : ''}
                      {order.deliveryAddress.landmark ? `, ${order.deliveryAddress.landmark}` : ''}
                      {order.deliveryAddress.locality ? `, ${order.deliveryAddress.locality}` : ''}
                      {order.deliveryAddress.city ? `, ${order.deliveryAddress.city}` : ''}
                      {order.deliveryAddress.state ? `, ${order.deliveryAddress.state}` : ''}
                      {order.deliveryAddress.pincode ? ` - ${order.deliveryAddress.pincode}` : ''}
                    </p>
                  </div>
                )}

                <div className="mt-6 space-y-4">
                  {order.items.map((item, index) => (
                    <div key={`${order._id}-${item.productId}-${index}`} className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.name} {item.selectedSize ? `(${item.selectedSize})` : ''}</p>
                        <p className="mt-1 text-sm text-slate-500">Qty: {item.quantity} · ₹{item.price.toFixed(2)}</p>
                      </div>
                      <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
