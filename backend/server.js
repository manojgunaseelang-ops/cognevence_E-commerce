require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Accessories = require('./models/accessoriesmodule');
const Electronic = require('./models/electronicmodule');
const Faction = require('./models/faction');
const Kitchen = require('./models/kitchen');
const Mobile = require('./models/mobileProductModel');
const SportShoe = require('./models/sportShoeProductModel');
const Order = require('./models/orderModel');
const User = require('./models/usermodule');
const { normalizeProductReference } = require('./utils/productReference');
const JWT_SECRET = process.env.JWT_SECRET || 'wellstore_secret_2026';
const accessoriesData = require('./data/accessories');
const electronicData = require('./data/electronic');
const factionData = require('./data/factiondata');
const kitchenData = require('./data/kitchen');
const mobileData = require('./data/mobileproduct');
const sportData = require('./data/sportshoeproduct');
app.use(cors());
app.use(express.json());

// Admin auth middleware
const adminAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || req.headers.Authorization;
    if (!auth) return res.status(401).json({ message: 'Authorization header required' });
    const parts = auth.split(' ');
    const token = parts.length === 2 ? parts[1] : parts[0];
    if (!token) return res.status(401).json({ message: 'Token required' });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(payload.userId);
    if (!user || !user.isAdmin) return res.status(403).json({ message: 'Admin access required' });
    req.user = user;
    next();
  } catch (err) {
    console.error('Admin auth error:', err);
    res.status(500).json({ message: 'Server error during auth' });
  }
};

// Public endpoint to inspect current user from token
app.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization || req.headers.Authorization;
    if (!auth) return res.json({ user: null });
    const parts = auth.split(' ');
    const token = parts.length === 2 ? parts[1] : parts[0];
    if (!token) return res.json({ user: null });
    let payload;
    try { payload = jwt.verify(token, JWT_SECRET); } catch (e) { return res.json({ user: null }); }
    const user = await User.findById(payload.userId).select('-password');
    res.json({ user });
  } catch (err) {
    console.error('Get /me error:', err);
    res.status(500).json({ user: null });
  }
});
// Admin init endpoint removed by request.
// Note: initialization of admin users must be handled externally or via DB scripts.
const seedCollection = async (Model, data) => {
  const count = await Model.countDocuments();
  if (count === 0) {
    await Model.insertMany(data);
    console.log(`Seeded ${data.length} documents into ${Model.collection.collectionName}`);
  }
};

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/well-store';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB:', MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@'));
    try {
      await seedCollection(Accessories, accessoriesData);
      await seedCollection(Electronic, electronicData);
      await seedCollection(Faction, factionData);
      await seedCollection(Kitchen, kitchenData);
      await seedCollection(Mobile, mobileData);
      await seedCollection(SportShoe, sportData);
    } catch (seedError) {
      console.error('Error seeding initial data:', seedError);
    }
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
app.get('/accessories', async (req, res) => {
  try {
    console.log('Received GET /accessories');
    const items = await Accessories.find();
    if (items.length === 0) {
      await Accessories.insertMany(accessoriesData);
      return res.json({ data: accessoriesData });
    }
    res.json({ data: items });
  } catch (error) {
    console.error('Error fetching accessories:', error && error.stack ? error.stack : error);
    res.status(500).json({ error: 'Unable to fetch accessories' });
  }
});

app.get('/electronic', async (req, res) => {
  try {
    const items = await Electronic.find();
    if (items.length === 0) {
      await Electronic.insertMany(electronicData);
      return res.json({ data: electronicData });
    }
    res.json({ data: items });
  } catch (error) {
    console.error('Error fetching electronics:', error);
    res.status(500).json({ error: 'Unable to fetch electronics', details: error.message });
  }
});

app.get('/faction', async (req, res) => {
  try {
    const items = await Faction.find();
    if (items.length === 0) {
      await Faction.insertMany(factionData);
      return res.json({ data: factionData });
    }
    res.json({ data: items });
  } catch (error) {
    console.error('Error fetching faction:', error);
    res.status(500).json({ error: 'Unable to fetch faction data' });
  }
});

app.get('/kitchen', async (req, res) => {
  try {
    const items = await Kitchen.find();
    if (items.length === 0) {
      await Kitchen.insertMany(kitchenData);
      return res.json({ data: kitchenData });
    }
    res.json({ data: items });
  } catch (error) {
    console.error('Error fetching kitchen data:', error);
    res.status(500).json({ error: 'Unable to fetch kitchen data' });
  }
});

app.get('/kitchen/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid kitchen product ID' });
  }

  try {
    const item = await Kitchen.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Kitchen product not found' });
    }
    res.json({ data: item });
  } catch (error) {
    console.error('Error fetching kitchen detail:', error);
    res.status(500).json({ error: 'Unable to fetch kitchen product details' });
  }
});

app.get('/accessories/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid accessory product ID' });
  }

  try {
    const item = await Accessories.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Accessory not found' });
    }
    res.json({ data: item });
  } catch (error) {
    console.error('Error fetching accessory detail:', error);
    res.status(500).json({ error: 'Unable to fetch accessory details' });
  }
});

app.get('/electronic/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid electronic product ID' });
  }

  try {
    const item = await Electronic.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Electronic product not found' });
    }
    res.json({ data: item });
  } catch (error) {
    console.error('Error fetching electronic detail:', error);
    res.status(500).json({ error: 'Unable to fetch electronic product details' });
  }
});

app.get('/faction/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid faction product ID' });
  }

  try {
    const item = await Faction.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Fashion product not found' });
    }
    res.json({ data: item });
  } catch (error) {
    console.error('Error fetching faction detail:', error);
    res.status(500).json({ error: 'Unable to fetch fashion product details' });
  }
});

app.get('/mobileproduct', async (req, res) => {
  try {
    const query = {};
    const { brand, minPrice, maxPrice } = req.query;

    if (brand) {
      query.brand = { $regex: new RegExp(brand, 'i') };
    }

    if (minPrice !== undefined && minPrice !== '') {
      query.price = { ...query.price, $gte: Number(minPrice) };
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      query.price = { ...query.price, $lte: Number(maxPrice) };
    }

    let items = await Mobile.find(query);
    if (items.length === 0 && mobileData.length > 0) {
      await Mobile.insertMany(mobileData);
      items = await Mobile.find(query);
    }

    res.json({ data: items });
  } catch (error) {
    console.error('Error fetching mobile products:', error);
    res.status(500).json({ error: 'Unable to fetch mobile products' });
  }
});

app.get('/sport-shoes', async (req, res) => {
  try {
    const query = {};
    const { brand, gender, minPrice, maxPrice } = req.query;

    if (brand) {
      query.brand = { $regex: new RegExp(brand, 'i') };
    }

    if (gender) {
      query.gender = gender;
    }

    if (minPrice !== undefined && minPrice !== '') {
      query['pricing.basePrice'] = { ...query['pricing.basePrice'], $gte: Number(minPrice) };
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      query['pricing.basePrice'] = { ...query['pricing.basePrice'], $lte: Number(maxPrice) };
    }

    let items = await SportShoe.find(query);
    if (items.length === 0 && sportData.length > 0) {
      await SportShoe.insertMany(sportData);
      items = await SportShoe.find(query);
    }

    res.json({ data: items });
  } catch (error) {
    console.error('Error fetching sport shoes:', error);
    res.status(500).json({ error: 'Unable to fetch sport shoes' });
  }
});

// Global search across product collections
app.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ data: [] });
    const regex = new RegExp(q, 'i');

    const limitPer = 15;
    const [accessories, electronics, factions, kitchens, mobiles, shoes] = await Promise.all([
      Accessories.find({ $or: [{ name: regex }, { brand: regex }, { category: regex }, { description: regex }] }).limit(limitPer),
      Electronic.find({ $or: [{ name: regex }, { brand: regex }, { category: regex }, { description: regex }] }).limit(limitPer),
      Faction.find({ $or: [{ name: regex }, { brand: regex }, { category: regex }, { description: regex }] }).limit(limitPer),
      Kitchen.find({ $or: [{ name: regex }, { brand: regex }, { category: regex }, { description: regex }] }).limit(limitPer),
      Mobile.find({ $or: [{ name: regex }, { brand: regex }, { category: regex }, { description: regex }] }).limit(limitPer),
      SportShoe.find({ $or: [{ name: regex }, { brand: regex }, { category: regex }, { description: regex }] }).limit(limitPer),
    ]);

    const tag = (doc, type) => ({
      ...doc.toObject ? doc.toObject() : doc,
      _productType: type,
    });

    const combined = [
      ...accessories.map(d => tag(d, 'accessories')),
      ...electronics.map(d => tag(d, 'electronics')),
      ...factions.map(d => tag(d, 'faction')),
      ...kitchens.map(d => tag(d, 'kitchen')),
      ...mobiles.map(d => tag(d, 'mobileproduct')),
      ...shoes.map(d => tag(d, 'sport-shoes')),
    ];

    res.json({ data: combined });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ data: [], message: 'Search failed' });
  }
});

app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.post('/orders', async (req, res) => {
  try {
    const { userEmail, totalAmount, items, address } = req.body;

    if (!userEmail || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order payload must include userEmail and items' });
    }

    // Resolve delivery address: priority to payload address, fallback to user's saved address
    let deliveryAddress = address || null;
    try {
      if (!deliveryAddress) {
        const user = await User.findOne({ email: userEmail.toLowerCase().trim() });
        if (user && user.address && Object.keys(user.address).length > 0) {
          deliveryAddress = user.address;
        }
      } else {
        // If payload provided address, try to persist it to the user's profile
        await User.findOneAndUpdate(
          { email: userEmail.toLowerCase().trim() },
          { $set: { address: deliveryAddress } },
          { new: true }
        );
      }
    } catch (err) {
      console.error('Error resolving or saving delivery address:', err);
    }

    const deliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days from now

    const order = new Order({
      userEmail: userEmail.toLowerCase().trim(),
      totalAmount: Number(totalAmount) || 0,
      items: items.map((item) => ({
        productId: item.productId || item._id || item.id || item.slug || '',
        name: item.name,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        selectedSize: item.selectedSize || '',
        image: item.image || '',
        brand: item.brand || '',
        category: item.category || '',
      })),
      deliveryAddress: deliveryAddress || {},
      paymentMethod: req.body.paymentMethod || 'COD',
      deliveryDate,
      status: 'confirmed',
    });

    await order.save();
    // Reduce inventory immediately if order is confirmed
    try {
      if (order.status === 'confirmed') {
        await reduceStockForOrder(order);
      }
    } catch (invErr) {
      console.error('Inventory adjustment error after order:', invErr);
    }

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Server error while placing the order' });
  }
});

const sanitizeAddress = (address = {}) => ({
  name: address.name || address.fullName || '',
  fullName: address.fullName || address.name || '',
  phone: address.phone || '',
  pincode: address.pincode || '',
  addressLine: address.addressLine || address.line1 || '',
  line1: address.line1 || '',
  line2: address.line2 || '',
  locality: address.locality || '',
  landmark: address.landmark || '',
  alternatePhone: address.alternatePhone || '',
  addressType: address.addressType || 'HOME',
  city: address.city || '',
  state: address.state || '',
});

// Endpoint to get a user's saved address and saved address list
app.get('/user/address', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email query parameter is required' });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      address: user.address || {},
      addresses: Array.isArray(user.addresses) ? user.addresses : [],
    });
  } catch (err) {
    console.error('Get user address error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to save/update a user's address and manage multiple saved addresses
app.put('/user/address', async (req, res) => {
  try {
    const { email, address, addressId } = req.body;
    if (!email || !address) return res.status(400).json({ message: 'Email and address are required' });
    const sanitizedAddress = sanitizeAddress(address);
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });

    let updatedAddresses = Array.isArray(user.addresses)
      ? user.addresses.map((addr) => ({ ...(addr.toObject ? addr.toObject() : addr) }))
      : [];
    let savedAddressId = addressId;

    if (addressId && mongoose.Types.ObjectId.isValid(addressId)) {
      const existingIndex = updatedAddresses.findIndex((addr) => addr._id?.toString() === addressId.toString());
      if (existingIndex >= 0) {
        updatedAddresses[existingIndex] = {
          ...updatedAddresses[existingIndex],
          ...sanitizedAddress,
        };
      } else {
        updatedAddresses.push(sanitizedAddress);
      }
    } else {
      updatedAddresses.push(sanitizedAddress);
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: { address: sanitizedAddress, addresses: updatedAddresses } },
      { new: true }
    );

    if (!savedAddressId) {
      const lastAddress = updatedUser.addresses[updatedUser.addresses.length - 1];
      savedAddressId = lastAddress?._id?.toString() || null;
    }

    res.json({
      message: 'Address saved',
      address: updatedUser.address || {},
      addresses: updatedUser.addresses || [],
      addressId: savedAddressId,
    });
  } catch (err) {
    console.error('Save user address error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/orders', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email query parameter is required' });
    }

    const orders = await Order.find({ userEmail: email.toLowerCase().trim() }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// Admin: Get all orders
app.get('/admin/orders', async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    console.error('Admin order fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// Admin: Update order status
app.put('/admin/orders/:orderId', adminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const existing = await Order.findById(orderId);
    if (!existing) return res.status(404).json({ message: 'Order not found' });

    const prevStatus = existing.status;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: { status } },
      { new: true }
    );

    // If transitioning to confirmed from a non-confirmed status, adjust inventory
    if (status === 'confirmed' && prevStatus !== 'confirmed') {
      try {
        await reduceStockForOrder(order);
      } catch (invErr) {
        console.error('Inventory adjustment error during order confirm:', invErr);
      }
    }

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    console.error('Order update error:', error);
    res.status(500).json({ message: 'Server error while updating order' });
  }
});

app.put('/reset-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

// ===== ADMIN PRODUCT MANAGEMENT =====

// Protect all /admin routes (except /admin/init which is defined above)
app.use('/admin', adminAuth);

// Admin: Create product endpoints
// These endpoints are protected by `adminAuth` via `app.use('/admin', adminAuth)` above.

const normalizeImages = (images) => {
  if (!Array.isArray(images)) return [];
  return images.map(img => {
    if (typeof img === 'string') return { image: img };
    if (img && typeof img === 'object') return { image: img.image || img.url || '' };
    return null;
  }).filter(Boolean);
};

const normalizeSizesArr = (sizes) => {
  if (!Array.isArray(sizes)) return [];
  return sizes.map(s => ({ size: String(s.size || s.label || '').trim(), stock: Math.max(0, Number(s.stock ?? s.count ?? 0)) })).filter(s => s.size);
};

// Admin: Add Electronics Product
app.post('/admin/electronics', async (req, res) => {
  try {
    const { name, price, description, brand, category, images, stock, seller, sizes } = req.body;
    if (!name || price === undefined || !brand || !category) return res.status(400).json({ message: 'Name, price, brand, and category are required' });

    const newProduct = new Electronic({
      name: String(name).trim(),
      price: Number(price) || 0,
      description: description || '',
      brand: String(brand).trim(),
      category: String(category).trim(),
      images: normalizeImages(images),
      stock: Number(stock) || 0,
      seller: seller || 'Flipkart',
      sizes: Array.isArray(sizes) ? sizes : []
    });

    await newProduct.save();
    res.status(201).json({ message: 'Electronics product added successfully', product: newProduct });
  } catch (error) {
    console.error('Error adding electronics product:', error);
    res.status(500).json({ message: 'Error adding electronics product', details: error.message });
  }
});

// Admin: Add Accessories Product
app.post('/admin/accessories', async (req, res) => {
  try {
    const { name, price, description, brand, category, images, stock, seller, sizes, gender } = req.body;
    if (!name || price === undefined || !brand || !category) return res.status(400).json({ message: 'Name, price, brand, and category are required' });

    const allowedSellers = ['Amazon', 'Ebay', 'LensKart', 'Flipkart', 'Myntra'];
    const chosenSeller = allowedSellers.includes(seller) ? seller : 'Flipkart';

    const newProduct = new Accessories({
      name: String(name).trim(),
      price: Number(price) || 0,
      description: description || '',
      brand: String(brand).trim(),
      category: String(category).trim(),
      images: normalizeImages(images),
      sizes: normalizeSizesArr(sizes),
      stock: Number(stock) || (Array.isArray(sizes) ? sizes.reduce((s, x) => s + (Number(x.stock) || 0), 0) : 0),
      seller: chosenSeller,
      gender: (['men','women','unisex'].includes((gender||'').toLowerCase()) ? gender.toLowerCase() : 'unisex')
    });

    await newProduct.save();
    res.status(201).json({ message: 'Accessories product added successfully', product: newProduct });
  } catch (error) {
    console.error('Error adding accessories product:', error);
    res.status(500).json({ message: 'Error adding accessories product', details: error.message });
  }
});

// Admin: Add Kitchen Product (removed)
// Admin: Add Kitchen Product
app.post('/admin/kitchen', async (req, res) => {
  try {
    const { name, price, description, brand, category, images, stock, seller, sizes, ratings } = req.body;
    if (!name || price === undefined || !brand || !category) return res.status(400).json({ message: 'Name, price, brand, and category are required' });

    const newProduct = new Kitchen({
      name: String(name).trim(),
      price: Number(price) || 0,
      description: description || '',
      ratings: Number(ratings) || 0,
      brand: String(brand).trim(),
      category: String(category).trim(),
      images: normalizeImages(images),
      sizes: Array.isArray(sizes) ? sizes.map(s => String(s).trim()).filter(Boolean) : (typeof sizes === 'string' ? sizes.split(',').map(s => s.trim()).filter(Boolean) : []),
      stock: Number(stock) || 0,
      seller: seller || 'Flipkart'
    });

    await newProduct.save();
    res.status(201).json({ message: 'Kitchen product added successfully', product: newProduct });
  } catch (error) {
    console.error('Error adding kitchen product:', error);
    res.status(500).json({ message: 'Error adding kitchen product', details: error.message });
  }
});

// Admin: Add Faction (Fashion) Product
app.post('/admin/faction', async (req, res) => {
  try {
    const { name, price, description, brand, category, images, stock, seller, sizes, gender } = req.body;
    if (!name || price === undefined || !brand || !category) return res.status(400).json({ message: 'Name, price, brand, and category are required' });

    const cats = ['Sports', 'Clothing'];
    const chosenCat = cats.includes(category) ? category : 'Clothing';

    const normalizedSizes = normalizeSizesArr(sizes);
    const aggregatedStock = normalizedSizes.length ? normalizedSizes.reduce((s, x) => s + (Number(x.stock) || 0), 0) : (Number(stock) || 0);

    const newProduct = new Faction({
      name: String(name).trim(),
      price: Number(price) || 0,
      description: description || '',
      brand: String(brand).trim(),
      category: chosenCat,
      images: normalizeImages(images),
      sizes: normalizedSizes,
      stock: aggregatedStock,
      seller: seller || 'Flipkart',
      gender: (['men','women','unisex'].includes((gender||'').toLowerCase()) ? gender.toLowerCase() : 'unisex')
    });

    await newProduct.save();
    res.status(201).json({ message: 'Fashion product added successfully', product: newProduct });
  } catch (error) {
    console.error('Error adding fashion product:', error);
    res.status(500).json({ message: 'Error adding fashion product', details: error.message });
  }
});

// Admin: Add Mobile Product
app.post('/admin/mobileproduct', async (req, res) => {
  try {
    const { name, price, description, brand, category, images, stock, seller, sizes, gender, ratings, ram, rom, display, processor } = req.body;

    if (!name || price === undefined || !brand || !category) {
      return res.status(400).json({ message: 'Name, price, brand, and category are required' });
    }

    const normalizedSizes = Array.isArray(sizes)
      ? sizes.map((s) => ({ size: String(s.size || s.label || '').trim(), stock: Number(s.stock || s.count || 0) })).filter((s) => s.size)
      : [];

    const computedStock = normalizedSizes.length
      ? normalizedSizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0)
      : Number(stock) || 0;

    const newProduct = new Mobile({
      name: String(name).trim(),
      price: Number(price) || 0,
      description: description || '',
      ratings: Number(ratings) || 0,
      brand: String(brand).trim(),
      category: String(category).trim(),
      images: normalizeImages(images),
      sizes: normalizedSizes,
      stock: computedStock,
      seller: seller || 'Flipkart',
      gender: (['men','women','unisex'].includes((gender || '').toLowerCase()) ? gender.toLowerCase() : undefined),
      ram: ram || '',
      rom: rom || '',
      display: display || '',
      processor: processor || ''
    });

    await newProduct.save();
    res.status(201).json({ message: 'Mobile product added successfully', product: newProduct });
  } catch (error) {
    console.error('Error adding mobile product:', error);
    res.status(500).json({ message: 'Error adding mobile product', details: error.message });
  }
});

// Admin: Add Sport Shoe Product
app.post('/admin/sport-shoes', async (req, res) => {
  try {
    const {
      id,
      name,
      slug,
      brand,
      category,
      subCategory,
      gender,
      description,
      pricing,
      seller,
      images,
      variants
    } = req.body;

    if (!id || !name || !slug || !brand || !category || !subCategory || !gender || !pricing || !pricing.basePrice || !seller || !seller.name || !seller.id) {
      return res.status(400).json({ message: 'id, name, slug, brand, category, subCategory, gender, pricing.basePrice, seller.name and seller.id are required' });
    }

    const filteredImages = Array.isArray(images)
      ? images
          .filter((img) => img && (img.url || '').trim() !== '')
          .map((img) => ({ url: String(img.url).trim(), alt: String(img.alt || '').trim(), isMain: Boolean(img.isMain) }))
      : [];

    const filteredVariants = Array.isArray(variants)
      ? variants
          .filter((v) => v && (v.sku || '').trim() !== '' && (v.size || '').trim() !== '')
          .map((v) => ({ sku: String(v.sku).trim(), size: String(v.size).trim(), stock: Number(v.stock) || 0 }))
      : [];

    const totalStock = filteredVariants.length
      ? filteredVariants.reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0)
      : 0;

    const newProduct = new SportShoe({
      id: String(id).trim(),
      name: String(name).trim(),
      slug: String(slug).trim(),
      brand: String(brand).trim(),
      category: String(category).trim(),
      subCategory: String(subCategory).trim(),
      gender: ['men', 'women', 'unisex'].includes(String(gender).toLowerCase()) ? String(gender).toLowerCase() : 'unisex',
      description: String(description || '').trim(),
      pricing: {
        basePrice: Number(pricing.basePrice) || 0,
        currency: String(pricing.currency || 'INR').trim(),
        discountPercentage: Number(pricing.discountPercentage) || 0
      },
      rating: {
        average: Number(req.body.rating?.average) || 0,
        reviewCount: Number(req.body.rating?.reviewCount) || 0
      },
      images: filteredImages,
      variants: filteredVariants,
      totalStock,
      seller: {
        name: String(seller.name).trim(),
        id: String(seller.id).trim()
      }
    });

    await newProduct.save();
    res.status(201).json({ message: 'Sport shoe product added successfully', product: newProduct });
  } catch (error) {
    console.error('Error adding sport shoe product:', error);
    res.status(500).json({ message: 'Error adding sport shoe product', details: error.message });
  }
});

// ===== ADMIN: UPDATE PRODUCTS =====

// Helper to validate ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Generic update handler factory
const makeUpdateHandler = (Model, numericFields = []) => async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid product ID' });

    const overwrite = String(req.query.overwrite || '').toLowerCase() === 'true';

    if (overwrite) {
      // Full document replacement: use request body as new document (preserve _id)
      const newDoc = { ...req.body };
      delete newDoc._id;
      // Cast numeric fields
      for (const field of numericFields) {
        if (newDoc[field] !== undefined) {
          const n = Number(newDoc[field]);
          newDoc[field] = Number.isNaN(n) ? newDoc[field] : n;
        }
      }

      const replaceResult = await Model.replaceOne({ _id: id }, newDoc);
      if (replaceResult.matchedCount === 0) return res.status(404).json({ message: 'Product not found' });
      const updated = await Model.findById(id);
      return res.json({ message: 'Product replaced', product: updated });
    }

    // Partial update (default)
    const updates = { ...req.body };
    // Cast numeric fields
    for (const field of numericFields) {
      if (updates[field] !== undefined) {
        const n = Number(updates[field]);
        updates[field] = Number.isNaN(n) ? updates[field] : n;
      }
    }

    const updated = await Model.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product updated', product: updated });
  } catch (err) {
    console.error('Product update error:', err);
    res.status(500).json({ message: 'Server error while updating product' });
  }
};

// Electronics (update -> PUT)
app.put('/admin/electronics/:id', makeUpdateHandler(Electronic, ['price', 'stock']));

// Accessories (update -> PUT)
app.put('/admin/accessories/:id', makeUpdateHandler(Accessories, ['price', 'stock']));

// Kitchen (update -> PUT)
app.put('/admin/kitchen/:id', makeUpdateHandler(Kitchen, ['price', 'stock']));

// Faction (fashion) - specialized update to handle `sizes` array and images
app.put('/admin/faction/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid product ID' });

    const overwrite = String(req.query.overwrite || '').toLowerCase() === 'true';

    const normalizeSizes = (sizes) => {
      if (!Array.isArray(sizes)) return [];
      return sizes.map(s => ({
        size: String(s.size || s.label || '').trim(),
        stock: Math.max(0, Number(s.stock ?? s.count ?? 0))
      })).filter(s => s.size);
    };

    const normalizeImages = (images) => {
      if (!Array.isArray(images)) return [];
      return images.map(img => {
        if (typeof img === 'string') return { image: img };
        if (img && typeof img === 'object') return { image: img.image || img.url || '' };
        return { image: '' };
      }).filter(i => i.image);
    };

    if (overwrite) {
      const newDoc = { ...req.body };
      delete newDoc._id;

      if (newDoc.sizes) newDoc.sizes = normalizeSizes(newDoc.sizes);
      if (newDoc.images) newDoc.images = normalizeImages(newDoc.images);

      // If sizes provided, compute aggregated stock
      if (newDoc.sizes && newDoc.sizes.length > 0) {
        newDoc.stock = newDoc.sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
      } else if (newDoc.stock !== undefined) {
        newDoc.stock = Number(newDoc.stock) || 0;
      }

      const replaceResult = await Faction.replaceOne({ _id: id }, newDoc);
      if (replaceResult.matchedCount === 0) return res.status(404).json({ message: 'Product not found' });
      const updated = await Faction.findById(id);
      return res.json({ message: 'Product replaced', product: updated });
    }

    // Partial update
    const updates = { ...req.body };
    if (updates.sizes) updates.sizes = normalizeSizes(updates.sizes);
    if (updates.images) updates.images = normalizeImages(updates.images);

    if (updates.sizes && updates.sizes.length > 0) {
      updates.stock = updates.sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
    }

    // Cast price and stock
    if (updates.price !== undefined) updates.price = Number(updates.price) || 0;
    if (updates.stock !== undefined) updates.stock = Number(updates.stock) || 0;

    const updated = await Faction.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product updated', product: updated });
  } catch (err) {
    console.error('Faction product update error:', err);
    res.status(500).json({ message: 'Server error while updating fashion product' });
  }
});

// Mobile Product (update -> PUT)
app.put('/admin/mobileproduct/:id', makeUpdateHandler(Mobile, ['price', 'stock', 'ram', 'rom']));

// Sport Shoes (update -> PUT)
app.put('/admin/sport-shoes/:id', makeUpdateHandler(SportShoe, ['totalStock']));

// Generic delete handler factory with fallback fields
const makeDeleteHandler = (Model, fallbackFields = []) => async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'ID is required' });

    // Try by ObjectId
    if (isValidId(id)) {
      const doc = await Model.findByIdAndDelete(id);
      if (doc) return res.json({ message: 'Product deleted', product: doc });
    }

    // Try fallback fields (e.g., id, slug)
    for (const field of fallbackFields) {
      const query = {};
      query[field] = id;
      const doc = await Model.findOneAndDelete(query);
      if (doc) return res.json({ message: 'Product deleted', product: doc });
    }

    // Not found
    return res.status(404).json({ message: 'Product not found' });
  } catch (err) {
    console.error('Product delete error:', err);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
};

// Admin DELETE endpoints
app.delete('/admin/electronics/:id', makeDeleteHandler(Electronic));
app.delete('/admin/accessories/:id', makeDeleteHandler(Accessories));
app.delete('/admin/kitchen/:id', makeDeleteHandler(Kitchen));
app.delete('/admin/faction/:id', makeDeleteHandler(Faction));
app.delete('/admin/mobileproduct/:id', makeDeleteHandler(Mobile));
// Sport shoes may use a string `id` field; fallback to `id` and `slug`
app.delete('/admin/sport-shoes/:id', makeDeleteHandler(SportShoe, ['id', 'slug']));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Helper: reduce stock for an order's items
const reduceStockForOrder = async (order) => {
  if (!order || !Array.isArray(order.items)) return;

  for (const item of order.items) {
    const qty = Math.max(0, Number(item.quantity) || 0);
    if (qty === 0) continue;

    const selectedSize = item.selectedSize || item.size || '';
    const prodId = item.productId || item._id || item.id || item.slug || '';

    const collections = [Faction, Accessories, Electronic, Kitchen, Mobile, SportShoe];
    let found = null;
    let model = null;

    const normalizedProdId = normalizeProductReference({ _id: prodId, id: prodId, slug: prodId });

    for (const M of collections) {
      try {
        if (mongoose.Types.ObjectId.isValid(normalizedProdId)) {
          const doc = await M.findById(normalizedProdId);
          if (doc) { found = doc; model = M; break; }
        }
        const byId = await M.findOne({ id: normalizedProdId });
        if (byId) { found = byId; model = M; break; }
        const bySlug = await M.findOne({ slug: normalizedProdId });
        if (bySlug) { found = bySlug; model = M; break; }
      } catch (e) {
        // ignore
      }
    }

    if (!found || !model) {
      console.warn('Product not found for inventory adjustment:', prodId);
      continue;
    }

    const decrement = (value) => Math.max(0, (Number(value) || 0) - qty);

    if (model === SportShoe) {
      if (found.variants && Array.isArray(found.variants) && selectedSize) {
        const variant = found.variants.find((v) => String(v.size) === String(selectedSize));
        if (variant) {
          variant.stock = decrement(variant.stock);
        }
      }
      found.totalStock = decrement(found.totalStock);
      await found.save();
      continue;
    }

    let sizeUpdated = false;
    if (found.sizes && Array.isArray(found.sizes) && selectedSize) {
      const firstSizeItem = found.sizes[0];
      if (firstSizeItem && typeof firstSizeItem === 'object' && 'stock' in firstSizeItem) {
        const sizeObject = found.sizes.find((s) => String(s.size) === String(selectedSize));
        if (sizeObject) {
          sizeObject.stock = decrement(sizeObject.stock);
          sizeUpdated = true;
        }
      }
    }

    if (found.stock !== undefined) {
      found.stock = decrement(found.stock);
      await found.save();
      continue;
    }

    if (found.totalStock !== undefined) {
      found.totalStock = decrement(found.totalStock);
      await found.save();
      continue;
    }

    if (sizeUpdated) {
      await found.save();
    }
  }
};