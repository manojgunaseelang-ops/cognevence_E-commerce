const mongoose = require('mongoose');
const electronic = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  ratings: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  images: [{
    image: {
      type: String,
      required: true
    }
  }],
  category: {
    type: String,
    required: true,
    index: true // Useful for quick filtering by category
  },
  brand: {
    type: String,
    required: true,
    index: true // Useful for quick filtering by brand
  },
  sizes: {
    type: [String], // Array of strings (empty in your dataset, but ready for items like 'S', 'M', 'L')
    default: []
  },
  seller: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true // Automatically creates 'createdAt' and 'updatedAt' fields
});
const ElectronicProduct = mongoose.model('electronicproduct', electronic);
module.exports = ElectronicProduct;