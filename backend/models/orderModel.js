const mongoose = require('mongoose');
const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    selectedSize: { type: String, trim: true },
    image: { type: String, trim: true, default: '' },
    brand: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, default: '' },
  },
  { _id: false }
);
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      default: [],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    deliveryAddress: {
      fullName: { type: String, trim: true, default: '' },
      line1: { type: String, trim: true, default: '' },
      line2: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      pincode: { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
      locality: { type: String, trim: true, default: '' },
      landmark: { type: String, trim: true, default: '' },
      addressType: { type: String, trim: true, default: 'HOME' },
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'ONLINE'],
      default: 'COD',
    },
    deliveryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    placedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
