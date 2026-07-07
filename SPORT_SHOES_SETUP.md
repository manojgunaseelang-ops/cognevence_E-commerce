# Sport Shoes Product Management - Setup Guide

## Overview
This implementation provides a complete backend-to-frontend solution for managing and displaying sport shoe products with filtering capabilities.

## Files Created

### Backend Files

#### 1. **models/sportShoeProductModel.js**
MongoDB schema for sport shoe products with the following structure:
- Product identification (id, name, slug, brand)
- Categorization (category, subCategory, gender)
- Pricing with discount support
- Ratings and reviews
- Multiple product images
- Size variants with stock tracking
- Seller information

#### 2. **data/sportshoeproduct.js**
Seed data containing 11 sample sport shoe products from brands like Nike, Adidas, Puma, Asics, etc.
Automatically inserted into the database on first API call.

#### 3. **server.js** (Updated)
Added two new API endpoints:

**GET /sport-shoes**
- Fetches all sport shoe products
- Query parameters for filtering:
  - `brand`: Filter by shoe brand (e.g., "Nike", "Adidas")
  - `gender`: Filter by gender (e.g., "men", "women", "unisex")
  - `minPrice`: Filter by minimum price
  - `maxPrice`: Filter by maximum price
- Auto-seeds data on first request

Example:
```
GET http://localhost:4000/sport-shoes?brand=Nike&gender=men&minPrice=5000&maxPrice=15000
```

**GET /sport-shoes/:identifier**
- Fetches a single product by ID or slug
- Returns detailed product information

Example:
```
GET http://localhost:4000/sport-shoes/prod_sp_001
GET http://localhost:4000/sport-shoes/nike-air-zoom-pegasus-40
```

### Frontend Files

#### 1. **homes/SportShoes.jsx**
React component that:
- Fetches sport shoe data from the backend API
- Provides filtering interface (brand, gender, price range)
- Displays products in a responsive grid
- Shows product details including:
  - Product images
  - Ratings and reviews
  - Original and discounted pricing
  - Available sizes with stock status
  - Seller information
- Handles loading and error states

#### 2. **homes/SportShoes.css**
Professional styling with:
- Responsive grid layout
- Hover effects and animations
- Filter panel styling
- Product card design
- Mobile-friendly breakpoints

## Integration Steps

### 1. Update App.jsx
Add the import and route for the SportShoes component:

```jsx
import SportShoes from "./homes/SportShoes";

// In the Routes component:
<Route path="/sport-shoes" element={<SportShoes />} />
```

### 2. Update Navbar.jsx (Optional)
Add a navigation link to the Sport Shoes page:

```jsx
<Link to="/sport-shoes">Sport Shoes</Link>
```

### 3. Start the Backend Server
Ensure your MongoDB is running, then start the server:

```bash
cd backend
npm start
# Server will run on http://localhost:4000
```

### 4. Start the Frontend
In a new terminal:

```bash
npm run dev
# Frontend will typically run on http://localhost:5173 (Vite)
```

## API Usage Examples

### Fetch All Products
```bash
curl http://localhost:4000/sport-shoes
```

### Filter by Brand
```bash
curl "http://localhost:4000/sport-shoes?brand=Nike"
```

### Filter by Gender and Price Range
```bash
curl "http://localhost:4000/sport-shoes?gender=women&minPrice=5000&maxPrice=12000"
```

### Get Single Product by ID
```bash
curl http://localhost:4000/sport-shoes/prod_sp_002
```

### Get Single Product by Slug
```bash
curl http://localhost:4000/sport-shoes/nike-air-zoom-pegasus-40
```

## Component Features

### Filtering
- **Brand Filter**: Select from 8 available brands
- **Gender Filter**: Men, Women, or Unisex
- **Price Range**: Set minimum and maximum price limits
- **Reset Button**: Clear all filters and reload products

### Product Display
- High-quality product images
- Discount badges showing percentage off
- Star ratings with review counts
- Original and discounted prices
- Available sizes with "Out of Stock" indicators
- Seller information
- Total stock availability

### Responsive Design
- Desktop: 4-column grid
- Tablet: 2-3 column grid
- Mobile: Single column layout

## Data Structure

Each product contains:
```javascript
{
  id: String,              // Unique product ID
  name: String,            // Product name
  slug: String,            // URL-friendly identifier
  brand: String,           // Brand name
  category: String,        // Product category
  subCategory: String,     // Sub-category
  gender: String,          // Target gender
  description: String,     // Product description
  pricing: {
    basePrice: Number,     // Base price in INR
    currency: String,      // Currency code
    discountPercentage: Number  // Discount percentage
  },
  rating: {
    average: Number,       // Average rating (0-5)
    reviewCount: Number    // Number of reviews
  },
  images: Array,           // Product images
  variants: Array,         // Size variants with stock
  totalStock: Number,      // Total inventory
  seller: {
    name: String,          // Seller name
    id: String            // Seller ID
  }
}
```

## Future Enhancements

1. **Add to Cart**: Implement cart functionality
2. **Product Details Page**: Create a detailed view for individual products
3. **Wishlist**: Allow users to save favorite products
4. **Reviews**: Enable customer reviews and ratings
5. **Advanced Filters**: Add more filtering options (color, material, etc.)
6. **Search**: Implement full-text search functionality
7. **Sorting**: Add sorting by price, rating, popularity
8. **Pagination**: Implement pagination for large product lists

## Troubleshooting

### "Cannot GET /sport-shoes"
- Ensure the backend server is running on port 4000
- Check that the API endpoint is correctly configured in SportShoes.jsx

### No products displayed
- Verify MongoDB connection
- Check browser console for error messages
- Ensure data is being seeded properly

### CORS errors
- Verify CORS is enabled in server.js
- Check that the frontend URL is allowed

## Database

Products are automatically seeded on the first API request if the collection is empty. To re-seed:
1. Delete the "sportshoeproducts" collection in MongoDB
2. Make a request to the `/sport-shoes` endpoint
3. Data will be automatically restored

---

**Backend Server URL**: `http://localhost:4000`
**API Endpoints**: `/sport-shoes`, `/sport-shoes/:identifier`
**Frontend Route**: `/sport-shoes`
