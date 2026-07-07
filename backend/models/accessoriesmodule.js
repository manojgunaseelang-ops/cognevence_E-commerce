const mongoose = require('mongoose');

const Accessory = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  ratings: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot be more than 5']
  },
  images: [{
    _id: false, // Prevents MongoDB from generating unnecessary IDs for images
    image: { type: String, required: true, trim: true }
  }],
  category: {
    type: String,
    required: true,
    default: 'Accessories'
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  sizes: [{
    _id: false, // Prevents MongoDB from generating unnecessary IDs for sizes
    size: { type: String, required: true },
    stock: { type: Number, required: true, min: 0 }
  }],
  seller: {
    type: String,
    required: true,
    enum: ['Amazon', 'Ebay', 'LensKart', 'Flipkart', 'Myntra']
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Total stock cannot be negative']
  },
  gender: {
    type: String,
    required: true,
    enum: ['men', 'women', 'unisex'],
    lowercase: true
  }
}, {
  timestamps: true // Automatically generates 'createdAt' and 'updatedAt'
});

const Accessorydata = mongoose.model('Accessorydata', Accessory);
module.exports = Accessorydata;