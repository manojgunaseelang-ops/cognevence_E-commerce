const mongoose = require('mongoose');

const factionschema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Product name is required'],
    trim: true
  },
  price: { 
    type: Number, 
    required: [true, 'Retail price is required'],
    min: [0, 'Price cannot be a negative value']
  },
  description: { 
    type: String, 
    required: [true, 'Product description is required'] 
  },
  ratings: { 
    type: Number, 
    required: [true, 'Rating score is required'],
    min: 0,
    max: 5,
    default: 0
  },
  images: [
    {
      image: { 
        type: String, 
        required: [true, 'Image URL string is required'] 
      },
      _id: false // Prevents MongoDB from creating unnecessary sub-IDs for images
    }
  ],
  category: { 
    type: String, 
    required: [true, 'Category classification is required'],
    enum: ['Sports', 'Clothing'] // Enforces exact data buckets matching your JSON
  },
  brand: { 
    type: String, 
    required: [true, 'Brand name is required'],
    trim: true
  },
  sizes: [
    {
      size: { 
        type: String, 
        required: [true, 'Size notation is required'] 
      },
      stock: { 
        type: Number, 
        required: [true, 'Size stock count is required'], 
        min: 0 
      },
      _id: false // Prevents MongoDB from creating unnecessary sub-IDs for sizes
    }
  ],
  seller: { 
    type: String, 
    required: [true, 'Seller/Vendor name is required'] 
  },
  stock: { 
    type: Number, 
    required: [true, 'Total aggregated stock count is required'],
    min: 0
  },
  gender: { 
    type: String, 
    required: [true, 'Target gender demographic is required'],
    enum: ['men', 'women', 'unisex']
  }
}, {
  timestamps: true // Automatically generates and manages `createdAt` and `updatedAt` timestamps
});
// Export the singular Model built from the schema framework
module.exports = mongoose.model('faction', factionschema);