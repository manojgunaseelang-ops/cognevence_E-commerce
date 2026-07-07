const mongoose = require('mongoose');
const kitchenschema = new mongoose.Schema({
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
    index: true // Highly recommended for filtering by 'Home & Kitchen' or 'Sports'
  },
  brand: {
    type: String,
    required: true,
    index: true // Highly recommended for filtering by brands like 'Instant Pot' or 'Bowflex'
  },
  sizes: {
    type: [String], // Stays flexible if you add sizes later (e.g., shoe sizes, tent capacities)
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
  timestamps: true // Automatically manages 'createdAt' and 'updatedAt' fields
});

// Avoid re-compiling the model if it's already defined elsewhere in your project
module.exports = mongoose.model('KitchenProduct', kitchenschema);
