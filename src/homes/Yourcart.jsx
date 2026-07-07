import Navbar from "../Navbar";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, removeCartItem, updateCartQuantity, saveCart } from '../utils/cart';
import { useNotification } from '../components/NotificationProvider';
const ADDRESS_STORAGE_KEY = 'wellStoreAddress';

const defaultAddressState = {
  name: '',
  fullName: '',
  phone: '',
  pincode: '',
  line1: '',
  line2: '',
  locality: '',
  addressLine: '',
  city: '',
  state: '',
  landmark: '',
  alternatePhone: '',
  addressType: 'HOME'
};

export default function Yourcart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(1); // 1 = cart, 2 = address, 3 = payment
  const [singleItemToOrder, setSingleItemToOrder] = useState(null); // Tracks if user clicked single item "Place Order"
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  // Address State fields
  const [address, setAddress] = useState({ ...defaultAddressState });

  const navigate = useNavigate();

  const getAuth = () => {
    if (typeof window === 'undefined') return null;
    const authString = localStorage.getItem('wellStoreAuth');
    if (!authString) return null;
    try {
      const auth = JSON.parse(authString);
      return auth && typeof auth === 'object' ? auth : null;
    } catch (err) {
      localStorage.removeItem('wellStoreAuth');
      return null;
    }
  };

  const getSavedAddress = () => {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem(ADDRESS_STORAGE_KEY) || 'null');
    } catch (err) {
      localStorage.removeItem(ADDRESS_STORAGE_KEY);
      return null;
    }
  };

  const getSavedAddressList = () => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(`${ADDRESS_STORAGE_KEY}_list`) || '[]');
    } catch (err) {
      localStorage.removeItem(`${ADDRESS_STORAGE_KEY}_list`);
      return [];
    }
  };

  const notification = useNotification();

  const ensureLoggedIn = () => {
    if (typeof window === 'undefined') return false;
    const auth = getAuth();
    const email = auth?.email?.toString()?.toLowerCase()?.trim();
    if (!email) {
      notification.showNotification('Login is required before placing an order.', 'warning');
      navigate('/login');
      return false;
    }
    return true;
  };

  useEffect(() => {
    setCartItems(getCart());

    const savedLocalAddress = getSavedAddress();
    if (savedLocalAddress) {
      setAddress((prev) => ({
        ...prev,
        ...savedLocalAddress,
        name: savedLocalAddress.name || savedLocalAddress.fullName || prev.name,
        fullName: savedLocalAddress.fullName || savedLocalAddress.name || prev.fullName,
        addressLine: savedLocalAddress.addressLine || savedLocalAddress.line1 || prev.addressLine,
        line1: savedLocalAddress.line1 || savedLocalAddress.addressLine || prev.line1,
      }));
    }

    const savedList = getSavedAddressList();
    if (savedList.length > 0) {
      setSavedAddresses(savedList);
      if (!selectedAddressId && savedList[0]?._id) {
        setSelectedAddressId(savedList[0]._id.toString());
      }
    }

    const auth = getAuth();
    const email = auth?.email?.toString()?.toLowerCase()?.trim();
    if (email) {
      fetch(`http://localhost:4000/user/address?email=${encodeURIComponent(email)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data && Array.isArray(data.addresses)) {
            setSavedAddresses(data.addresses);
            const firstId = data.addresses[0]?._id?.toString();
            if (firstId) {
              setSelectedAddressId(firstId);
              const saved = data.addresses.find((addr) => addr._id?.toString() === firstId) || data.addresses[0];
              setAddress((prev) => ({
                ...prev,
                ...saved,
                name: saved.name || saved.fullName || prev.name,
                fullName: saved.fullName || saved.name || prev.fullName,
                addressLine: saved.addressLine || saved.line1 || prev.addressLine,
                line1: saved.line1 || saved.addressLine || prev.line1,
                line2: saved.line2 || prev.line2,
                locality: saved.locality || prev.locality,
                landmark: saved.landmark || prev.landmark,
                alternatePhone: saved.alternatePhone || prev.alternatePhone,
                addressType: saved.addressType || prev.addressType,
                city: saved.city || prev.city,
                state: saved.state || prev.state,
                pincode: saved.pincode || prev.pincode,
              }));
            }
          } else if (data && data.address) {
            const saved = data.address;
            setAddress((prev) => ({
              ...prev,
              ...saved,
              name: saved.name || saved.fullName || prev.name,
              fullName: saved.fullName || saved.name || prev.fullName,
              addressLine: saved.addressLine || saved.line1 || prev.addressLine,
              line1: saved.line1 || saved.addressLine || prev.line1,
              line2: saved.line2 || prev.line2,
              locality: saved.locality || prev.locality,
              landmark: saved.landmark || prev.landmark,
              alternatePhone: saved.alternatePhone || prev.alternatePhone,
              addressType: saved.addressType || prev.addressType,
              city: saved.city || prev.city,
              state: saved.state || prev.state,
              pincode: saved.pincode || prev.pincode,
            }));
          }
        })
        .catch((err) => console.error('Error loading user address context:', err));
    }
  }, []);

  useEffect(() => {
    const onCartUpdated = () => setCartItems(getCart());
    if (typeof window !== 'undefined') {
      window.addEventListener('cartUpdated', onCartUpdated);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('cartUpdated', onCartUpdated);
      }
    };
  }, []);

  const handleRemove = (id) => {
    const updatedCart = removeCartItem(id);
    setCartItems(updatedCart);
  };

  const handleQuantityChange = (id, value) => {
    const quantity = Number(value);
    if (isNaN(quantity) || quantity < 1) return;
    const updatedCart = updateCartQuantity(id, quantity);
    setCartItems(updatedCart);
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'name') {
        next.fullName = value;
      }
      if (name === 'fullName') {
        next.name = value;
      }
      return next;
    });
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Initiates checkout for the whole cart
  const handleProceedToAddressAll = () => {
    if (!ensureLoggedIn()) return;
    if (cartItems.length === 0) {
      notification.showNotification('Your cart is empty. Add items before placing an order.', 'warning');
      return;
    }
    setSingleItemToOrder(null);
    setActiveStep(2);
  };

  const handleProceedToAddressSingle = (item) => {
    if (!ensureLoggedIn()) return;
    setSingleItemToOrder(item);
    setActiveStep(2);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!ensureLoggedIn()) return;

    const requiredFields = ['name', 'phone', 'pincode', 'locality', 'city', 'state'];
    const missingField = requiredFields.find((field) => !address[field]?.toString().trim());
    if (missingField) {
      notification.showNotification('Please fill all required address details before proceeding.', 'warning');
      return;
    }
    if (!address.addressLine?.toString().trim() && !address.line1?.toString().trim()) {
      notification.showNotification('Please provide either Address Line 1 or Address details before proceeding.', 'warning');
      return;
    }

    const auth = getAuth();
    const email = auth?.email?.toString()?.toLowerCase()?.trim();
    if (!email) {
      notification.showNotification('Unable to resolve your account. Please log in again.', 'error');
      navigate('/login');
      return;
    }

    try {
      const payloadAddress = {
        ...address,
        name: address.name || address.fullName || '',
        fullName: address.fullName || address.name || '',
        addressLine: address.addressLine || address.line1 || '',
      };
      const response = await fetch('http://localhost:4000/user/address', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, address: payloadAddress, addressId: selectedAddressId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save address');
      if (data.addresses) {
        setSavedAddresses(data.addresses);
        localStorage.setItem(`${ADDRESS_STORAGE_KEY}_list`, JSON.stringify(data.addresses));
      }
      if (data.addressId) {
        setSelectedAddressId(data.addressId);
      }
      setActiveStep(3);
    } catch (err) {
      console.error(err);
      notification.showNotification(err.message || 'Failed to save address.', 'error');
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(address));
    if (savedAddresses.length > 0) {
      localStorage.setItem(`${ADDRESS_STORAGE_KEY}_list`, JSON.stringify(savedAddresses));
    }
  }, [address, savedAddresses]);

  const handleFinalizeOrder = async () => {
    if (!ensureLoggedIn()) return;
    const auth = getAuth();
    const email = auth?.email?.toString()?.toLowerCase()?.trim();
    if (!email) {
      notification.showNotification('Unable to resolve your account. Please log in again.', 'error');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    const targetedItems = singleItemToOrder ? [singleItemToOrder] : cartItems;
    const computedTotal = singleItemToOrder ? singleItemToOrder.price * singleItemToOrder.quantity : total;

    try {
      const orderPayload = {
        userEmail: email,
        totalAmount: computedTotal,
        address,
        paymentMethod,
        items: targetedItems.map((item) => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize || '',
          image: item.images?.[0]?.image || '',
          brand: item.brand || '',
          category: item.category || '',
        })),
      };

      const response = await fetch('http://localhost:4000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      if (singleItemToOrder) {
        const updatedCart = removeCartItem(singleItemToOrder._id);
        setCartItems(updatedCart);
      } else {
        saveCart([]);
        setCartItems([]);
      }

      notification.showNotification('Order placed successfully!', 'success');
      navigate('/yourorders');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to place order.');
      notification.showNotification(err.message || 'Failed to place order.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNewAddress = () => {
    setSelectedAddressId('');
    setAddress({ ...defaultAddressState });
  };

  const handleAddressSelection = (addressId) => {
    setSelectedAddressId(addressId);
    const selected = savedAddresses.find((addr) => addr._id?.toString() === addressId);
    if (selected) {
      setAddress((prev) => ({
        ...prev,
        ...selected,
        name: selected.name || selected.fullName || prev.name,
        fullName: selected.fullName || selected.name || prev.fullName,
        addressLine: selected.addressLine || selected.line1 || prev.addressLine,
        line1: selected.line1 || selected.addressLine || prev.line1,
        line2: selected.line2 || prev.line2,
        locality: selected.locality || prev.locality,
        landmark: selected.landmark || prev.landmark,
        alternatePhone: selected.alternatePhone || prev.alternatePhone,
        addressType: selected.addressType || prev.addressType,
        city: selected.city || prev.city,
        state: selected.state || prev.state,
        pincode: selected.pincode || prev.pincode,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 page-with-navbar">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6" style={{ fontFamily: 'Roboto, Arial, sans-serif' }}>
        <h1 className="text-2xl font-semibold">Your Checkout Flow</h1>

        {cartItems.length === 0 ? (
          <p className="mt-3"> there is no item in your cart </p>
        ) : (
          <div className="lg:flex lg:items-start lg:gap-8 mt-4">
            <div className="w-full lg:w-3/4">
              
              {/* STEP 1: CART ITEMS ACCORDION BAR */}
              <div className="bg-white mb-6 shadow-sm rounded-[24px] overflow-hidden">
                <div className="flex items-center gap-3 bg-blue-600 p-5 text-white">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 font-bold">1</span>
                  <h5 className="text-lg font-semibold">ORDER SUMMARY ({cartItems.length} ITEMS)</h5>
                </div>

                {activeStep === 1 && (
                  <div className="space-y-4 bg-white p-5">
                    {cartItems.map((item) => (
                      <div key={item._id} className="grid gap-4 rounded-3xl border border-gray-200 p-4 shadow-sm sm:grid-cols-[100px,minmax(0,1fr),220px]">
                        <div className="flex items-center justify-center">
                          <img
                            src={item.images?.[0]?.image}
                            alt={item.name}
                            className="h-[100px] w-full max-w-[100px] object-contain rounded-2xl"
                          />
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-base font-semibold text-gray-900">{item.name}</h5>
                          <p className="text-sm text-gray-500">{item.brand}</p>
                          <p className="text-base font-semibold text-blue-600">₹{item.price}</p>
                        </div>
                        <div className="flex flex-col items-end justify-between gap-3">
                          <div className="w-full max-w-[90px]">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Qty</label>
                            <input
                              type="number"
                              min="1"
                              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                            />
                          </div>
                          <div className="flex w-full justify-end gap-2">
                            <button
                              className="rounded-xl border border-blue-500 bg-white px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                              onClick={() => handleProceedToAddressSingle(item)}
                              disabled={loading}
                            >
                              Order This
                            </button>
                            <button
                              className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                              onClick={() => handleRemove(item._id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* STEP 2: DELIVERY ADDRESS */}
              <div className="bg-white mb-6 rounded-[24px] shadow-sm overflow-hidden">
                <div className={`flex items-center gap-3 p-5 ${activeStep === 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${activeStep === 2 ? 'bg-white text-blue-600' : 'bg-slate-400 text-white'}`}>2</span>
                  <h5 className="text-lg font-semibold">DELIVERY ADDRESS</h5>
                </div>

                {activeStep === 2 && (
                  <>
                    {savedAddresses.length > 0 && (
                      <div className="space-y-4 bg-slate-100 p-5 rounded-t-[24px]">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">Saved addresses</p>
                            <p className="text-sm text-slate-500">Select a saved address to use it or edit it below.</p>
                          </div>
                          <button
                            type="button"
                            onClick={handleNewAddress}
                            className="rounded-full border border-blue-500 bg-white px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                          >
                            Add new address
                          </button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {savedAddresses.map((item) => {
                            const addrId = item._id?.toString();
                            return (
                              <label
                                key={addrId || `${item.phone}-${item.pincode}`}
                                className={`cursor-pointer rounded-3xl border p-4 transition ${selectedAddressId === addrId ? 'border-blue-500 bg-white shadow-sm' : 'border-gray-200 bg-slate-50 hover:border-blue-300'}`}
                              >
                                <div className="flex items-start gap-3">
                                  <input
                                    type="radio"
                                    name="savedAddress"
                                    value={addrId}
                                    checked={selectedAddressId === addrId}
                                    onChange={() => handleAddressSelection(addrId)}
                                    className="mt-1 h-4 w-4 accent-blue-600"
                                  />
                                  <div className="space-y-1 text-sm">
                                    <div className="flex items-center justify-between gap-3">
                                      <span className="font-semibold text-slate-900">{item.name || item.fullName || 'Saved address'}</span>
                                      {selectedAddressId === addrId && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">Selected</span>}
                                    </div>
                                    <p className="text-slate-600">
                                      {item.addressLine || item.line1 || 'No address line provided'}
                                      {item.line2 ? `, ${item.line2}` : ''}
                                    </p>
                                    <p className="text-slate-600">
                                      {item.locality ? `${item.locality}, ` : ''}{item.city}{item.state ? `, ${item.state}` : ''} {item.pincode ? `- ${item.pincode}` : ''}
                                    </p>
                                    <p className="text-slate-600">Phone: {item.phone || item.alternatePhone || 'N/A'}</p>
                                    <p className="text-xs uppercase tracking-wide text-slate-500">{item.addressType || 'HOME'}</p>
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  <form onSubmit={handleSaveAddress} className="space-y-4 bg-slate-50 p-5 rounded-b-[24px]">
                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        type="text"
                        name="name"
                        value={address.name}
                        onChange={handleAddressChange}
                        required
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Full Name"
                      />
                      <input
                        type="tel"
                        name="phone"
                        maxLength="10"
                        value={address.phone}
                        onChange={handleAddressChange}
                        required
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="10-digit mobile number"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        type="text"
                        name="pincode"
                        maxLength="6"
                        value={address.pincode}
                        onChange={handleAddressChange}
                        required
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Pincode"
                      />
                      <input
                        type="text"
                        name="locality"
                        value={address.locality}
                        onChange={handleAddressChange}
                        required
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Locality"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        type="text"
                        name="line1"
                        value={address.line1}
                        onChange={handleAddressChange}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Address line 1 / House no."
                      />
                      <input
                        type="text"
                        name="line2"
                        value={address.line2}
                        onChange={handleAddressChange}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Address line 2 (Optional)"
                      />
                    </div>
                    <textarea
                      name="addressLine"
                      value={address.addressLine}
                      onChange={handleAddressChange}
                      rows="3"
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Address details (Area and Street)"
                      style={{ resize: 'none' }}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        type="text"
                        name="city"
                        value={address.city}
                        onChange={handleAddressChange}
                        required
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="City/District/Town"
                      />
                      <input
                        type="text"
                        name="state"
                        value={address.state}
                        onChange={handleAddressChange}
                        required
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="State"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        type="text"
                        name="landmark"
                        value={address.landmark}
                        onChange={handleAddressChange}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Landmark (Optional)"
                      />
                      <input
                        type="tel"
                        name="alternatePhone"
                        maxLength="10"
                        value={address.alternatePhone}
                        onChange={handleAddressChange}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Alternate Phone (Optional)"
                      />
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Address Type</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-sm shadow-sm transition hover:border-blue-300">
                            <input
                              type="radio"
                              name="addressType"
                              value="HOME"
                              checked={address.addressType === 'HOME'}
                              onChange={handleAddressChange}
                              className="h-4 w-4 accent-blue-600"
                            />
                            <span>Home (All day delivery)</span>
                          </label>
                          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-sm shadow-sm transition hover:border-blue-300">
                            <input
                              type="radio"
                              name="addressType"
                              value="WORK"
                              checked={address.addressType === 'WORK'}
                              onChange={handleAddressChange}
                              className="h-4 w-4 accent-blue-600"
                            />
                            <span>Work (10 AM - 5 PM delivery)</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Payment Option</p>
                        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-sm shadow-sm transition hover:border-blue-300">
                          <input
                            className="h-4 w-4 accent-blue-600"
                            type="radio"
                            name="paymentMethod"
                            value="COD"
                            checked={paymentMethod === 'COD'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <span>Cash on Delivery</span>
                        </label>
                        <p className="text-sm text-slate-500">Pay when the order is delivered.</p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
                      >
                        {loading ? 'CONFIRMING...' : 'SAVE & CONTINUE TO PAYMENT'}
                      </button>
                      <button
                        type="button"
                        className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        onClick={() => setActiveStep(1)}
                      >
                        BACK TO CART
                      </button>
                    </div>
                  </form>
                  </>
                )}
              </div>

              {/* STEP 3: PAYMENT SELECTION */}
              {activeStep === 3 && (
                <div className="bg-white mb-6 rounded-[24px] shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 bg-blue-600 p-5 text-white">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 font-bold">3</span>
                    <h5 className="text-lg font-semibold">PAYMENT METHOD</h5>
                  </div>
                  <div className="space-y-6 bg-slate-50 p-5">
                    <div className="space-y-3">
                      <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Select payment option</p>
                      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-sm shadow-sm transition hover:border-blue-300">
                        <input
                          className="h-4 w-4 accent-blue-600"
                          type="radio"
                          name="paymentMethod"
                          id="codOption"
                          value="COD"
                          checked={paymentMethod === 'COD'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>Cash on Delivery</span>
                      </label>
                      <p className="text-sm text-slate-500">You will pay when the order is delivered.</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        onClick={() => setActiveStep(2)}
                      >
                        Back to Address
                      </button>
                      <button
                        type="button"
                        className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                        onClick={handleFinalizeOrder}
                        disabled={loading}
                      >
                        {loading ? 'Placing Order...' : 'Confirm Order'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* SIDEBAR ORDER PRICING DATA SUMMARY */}
            <aside className="w-full lg:w-1/4 mt-6 lg:mt-0">
              <div className="lg:sticky lg:top-28">
                <div className="bg-white p-5 rounded-xl shadow-md">
                  <h5 className="text-sm text-gray-500 mb-4 uppercase tracking-wider font-semibold">Price Details</h5>
                  <div className="flex items-center justify-between mb-3 text-sm">
                    <span>Price ({singleItemToOrder ? '1 Item' : `${cartItems.length} Items`})</span>
                    <span>₹{(singleItemToOrder ? singleItemToOrder.price * singleItemToOrder.quantity : total).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3 text-sm">
                    <span>Delivery Charges</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="flex items-center justify-between mb-4 border-t border-dashed pt-3">
                    <strong className="text-base">Amount Payable</strong>
                    <strong className="text-base">₹{(singleItemToOrder ? singleItemToOrder.price * singleItemToOrder.quantity : total).toFixed(2)}</strong>
                  </div>

                  {activeStep === 1 && (
                    <button
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg"
                      onClick={handleProceedToAddressAll}
                    >
                      PLACE ORDER
                    </button>
                  )}

                  {error && <p className="text-red-600 mt-3 text-sm font-medium">{error}</p>}
                </div>
              </div>
            </aside>

          </div>
        )}
      </div>
    </div>
  );
}