const mongoose = require('mongoose');

const sportShoeProductSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, default: 'Sports' },
    subCategory: { type: String, required: true, trim: true, default: 'Running Shoes' },
    gender: { type: String, enum: ['men', 'women', 'unisex'], required: true },
    description: { type: String, trim: true, default: '' },
    pricing: {
      basePrice: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
      discountPercentage: { type: Number, default: 0 },
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      reviewCount: { type: Number, default: 0 },
    },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, trim: true },
        isMain: { type: Boolean, default: false },
      },
    ],
    variants: [
      {
        sku: { type: String, required: true, unique: true },
        size: { type: String, required: true },
        stock: { type: Number, default: 0 },
      },
    ],
    totalStock: { type: Number, default: 0 },
    seller: {
      name: { type: String, required: true, trim: true },
      id: { type: String, required: true, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

const SportShoeProduct = mongoose.model('SportShoeProduct', sportShoeProductSchema);
module.exports = SportShoeProduct;
