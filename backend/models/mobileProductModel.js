const mongoose = require('mongoose');
const mobileProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, default: 0 },
    description: { type: String, trim: true, default: '' },
    ratings: { type: Number, default: 0 },
    images: [
      {
        image: { type: String, trim: true },
      },
    ],
    category: { type: String, trim: true, default: '' },
    brand: { type: String, trim: true, default: '' },
    sizes: [
      {
        size: { type: String, trim: true },
        stock: { type: Number, default: 0 },
      },
    ],
    seller: { type: String, trim: true, default: '' },
    stock: { type: Number, default: 0 },
    gender: { type: String, enum: ['men', 'women', 'unisex'], trim: true },
    ram: { type: String, trim: true, default: '' },
    rom: { type: String, trim: true, default: '' },
    display: { type: String, trim: true, default: '' },
    processor: { type: String, trim: true, default: '' },
  },
  {
    timestamps: true,
  }
);

const MobileProduct = mongoose.model('MobileProduct', mobileProductSchema);
module.exports = MobileProduct;
