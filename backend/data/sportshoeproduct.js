const sportShoeProducts = [
  {
    id: "prod_sp_001",
    name: "Campus Men's Maxico Running Shoes",
    slug: "campus-mens-maxico-running-shoes",
    brand: "Campus",
    category: "Sports",
    subCategory: "Running Shoes",
    gender: "men",
    description: "The high raised back cover with extra padding for running comfort.",
    pricing: {
      basePrice: 1899.00,
      currency: "INR",
      discountPercentage: 45
    },
    rating: {
      average: 3.8,
      reviewCount: 142
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80",
        alt: "Campus Men's Maxico Running Shoes - Red Profile View",
        isMain: true
      }
    ],
    variants: [
      { sku: "CAMP-MAX-M-7", size: "7", stock: 0 },
      { sku: "CAMP-MAX-M-8", size: "8", stock: 2 },
      { sku: "CAMP-MAX-M-9", size: "9", stock: 4 }
    ],
    totalStock: 6,
    seller: {
      name: "Ebay India",
      id: "sell_ebay_in"
    }
  },
  {
    id: "prod_sp_002",
    name: "Nike Air Zoom Pegasus 40",
    slug: "nike-air-zoom-pegasus-40",
    brand: "Nike",
    category: "Sports",
    subCategory: "Running Shoes",
    gender: "unisex",
    description: "A springy ride for every run, the Peg's familiar, just-for-you feel returns to help you accomplish your goals.",
    pricing: {
      basePrice: 11495.00,
      currency: "INR",
      discountPercentage: 0
    },
    rating: {
      average: 4.7,
      reviewCount: 850
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&auto=format&fit=crop&q=80",
        alt: "Nike Air Zoom Pegasus 40 - Volt Green Side Profile",
        isMain: true
      }
    ],
    variants: [
      { sku: "NIKE-PEG40-U-8", size: "8", stock: 5 },
      { sku: "NIKE-PEG40-U-9", size: "9", stock: 12 },
      { sku: "NIKE-PEG40-U-10", size: "10", stock: 8 }
    ],
    totalStock: 25,
    seller: {
      name: "Nike India",
      id: "sell_nike_in"
    }
  },
  {
    id: "prod_sp_003",
    name: "Adidas Ultraboost Light Women's",
    slug: "adidas-ultraboost-light-womens",
    brand: "Adidas",
    category: "Sports",
    subCategory: "Running Shoes",
    gender: "women",
    description: "Experience epic energy return with our lightest Ultraboost ever, fine-tuned structurally for women.",
    pricing: {
      basePrice: 16000.00,
      currency: "INR",
      discountPercentage: 0
    },
    rating: {
      average: 4.8,
      reviewCount: 412
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=500&auto=format&fit=crop&q=80",
        alt: "Adidas Ultraboost Light Women's - Orange Accent",
        isMain: true
      }
    ],
    variants: [
      { sku: "ADI-UBL-W-6", size: "6", stock: 4 },
      { sku: "ADI-UBL-W-7", size: "7", stock: 6 },
      { sku: "ADI-UBL-W-8", size: "8", stock: 3 }
    ],
    totalStock: 13,
    seller: {
      name: "Adidas Retail India",
      id: "sell_adi_retail_in"
    }
  },
  {
    id: "prod_sp_004",
    name: "Puma Velocity Nitro 3",
    slug: "puma-velocity-nitro-3",
    brand: "Puma",
    category: "Sports",
    subCategory: "Running Shoes",
    gender: "unisex",
    description: "An all-in-one running shoe featuring premium NITRO foam cushioning for responsive energy output.",
    pricing: {
      basePrice: 7999.00,
      currency: "INR",
      discountPercentage: 0
    },
    rating: {
      average: 4.2,
      reviewCount: 94
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&auto=format&fit=crop&q=80",
        alt: "Puma Velocity Nitro 3 - White and Black Athletic",
        isMain: true
      }
    ],
    variants: [
      { sku: "PUMA-VN3-U-6", size: "6", stock: 2 },
      { sku: "PUMA-VN3-U-7", size: "7", stock: 5 },
      { sku: "PUMA-VN3-U-8", size: "8", stock: 9 }
    ],
    totalStock: 16,
    seller: {
      name: "Amazon India",
      id: "sell_amazon_in"
    }
  },
  {
    id: "prod_sp_005",
    name: "Asics Gel-Kayano 30 Women's",
    slug: "asics-gel-kayano-30-womens",
    brand: "Asics",
    category: "Sports",
    subCategory: "Running Shoes",
    gender: "women",
    description: "From 5Ks to full marathons, designed to provide advanced stability and softer cushioning for female runners.",
    pricing: {
      basePrice: 13599.00,
      currency: "INR",
      discountPercentage: 20
    },
    rating: {
      average: 4.9,
      reviewCount: 215
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&auto=format&fit=crop&q=80",
        alt: "Asics Gel-Kayano 30 Women's - Pastels",
        isMain: true
      }
    ],
    variants: [
      { sku: "ASIC-GK30-W-6", size: "6", stock: 3 },
      { sku: "ASIC-GK30-W-7", size: "7", stock: 4 },
      { sku: "ASIC-GK30-W-8", size: "8", stock: 2 }
    ],
    totalStock: 9,
    seller: {
      name: "Flipkart",
      id: "sell_flipkart_direct"
    }
  },
  {
    id: "prod_sp_006",
    name: "Under Armour Charged Assert 10",
    slug: "under-armour-charged-assert-10",
    brand: "Under Armour",
    category: "Sports",
    subCategory: "Running Shoes",
    gender: "men",
    description: "Lightweight breathable mesh mesh runners built with Charged Cushioning to absorb heavy concrete impact.",
    pricing: {
      basePrice: 5499.00,
      currency: "INR",
      discountPercentage: 0
    },
    rating: {
      average: 4.1,
      reviewCount: 310
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=500&auto=format&fit=crop&q=80",
        alt: "Under Armour Charged Assert 10 - Blue Retro Mesh",
        isMain: true
      }
    ],
    variants: [
      { sku: "UA-CA10-M-8", size: "8", stock: 1 },
      { sku: "UA-CA10-M-9", size: "9", stock: 5 }
    ],
    totalStock: 6,
    seller: {
      name: "Ebay India",
      id: "sell_ebay_in"
    }
  },
  {
    id: "prod_sp_007",
    name: "Reebok Floatride Energy 5 W",
    slug: "reebok-floatride-energy-5-w",
    brand: "Reebok",
    category: "Sports",
    subCategory: "Running Shoes",
    gender: "women",
    description: "High-performance specialized foam cushioning core tailored neatly into an engineered female running layout.",
    pricing: {
      basePrice: 8999.00,
      currency: "INR",
      discountPercentage: 10
    },
    rating: {
      average: 4.5,
      reviewCount: 78
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80",
        alt: "Reebok Floatride Energy 5 W - Active Silhouette",
        isMain: true
      }
    ],
    variants: [
      { sku: "RBK-FRE5-W-6", size: "6", stock: 5 },
      { sku: "RBK-FRE5-W-7", size: "7", stock: 7 },
      { sku: "RBK-FRE5-W-8", size: "8", stock: 0 }
    ],
    totalStock: 12,
    seller: {
      name: "Amazon India",
      id: "sell_amazon_in"
    }
  },
  {
    id: "prod_sp_008",
    name: "Brooks Ghost 15 Running Shoes",
    slug: "brooks-ghost-15-running-shoes",
    brand: "Brooks",
    category: "Sports",
    subCategory: "Running Shoes",
    gender: "unisex",
    description: "Smooth transitions coupled with balanced DNA LOFT v2 cushioning for highly consistent daily training routines.",
    pricing: {
      basePrice: 10999.00,
      currency: "INR",
      discountPercentage: 0
    },
    rating: {
      average: 4.7,
      reviewCount: 512
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&auto=format&fit=crop&q=80",
        alt: "Brooks Ghost 15 Running Shoes - Performance Teal",
        isMain: true
      }
    ],
    variants: [
      { sku: "BRK-G15-U-9", size: "9", stock: 8 },
      { sku: "BRK-G15-U-10", size: "10", stock: 6 }
    ],
    totalStock: 14,
    seller: {
      name: "Runners Stop India",
      id: "sell_runners_stop_in"
    }
  },
  {
    id: "prod_sp_009",
    name: "Nike Men's Pegasus 42 Road-Running Shoes",
    slug: "nike-mens-pegasus-42-road-running-shoes",
    brand: "Nike",
    category: "Sports",
    subCategory: "Running Shoes",
    gender: "men",
    description: "Experience power in every stride thanks to the propulsive feel of a curved, full-length Air Zoom unit and a ReactX foam midsole.",
    pricing: {
      basePrice: 12995.00,
      currency: "INR",
      discountPercentage: 0
    },
    rating: {
      average: 4.7,
      reviewCount: 156
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&auto=format&fit=crop&q=80",
        alt: "Nike Men's Pegasus 42",
        isMain: true
      }
    ],
    variants: [
      { sku: "NIKE-PEG42-M-8", size: "8", stock: 4 },
      { sku: "NIKE-PEG42-M-9", size: "9", stock: 10 },
      { sku: "NIKE-PEG42-M-10", size: "10", stock: 7 }
    ],
    totalStock: 21,
    seller: {
      name: "NIKE India",
      id: "sell_nike_in"
    }
  },
  {
    id: "prod_sp_010",
    name: "Men's ASICS Gel-Nimbus 28 Running Shoes",
    slug: "asics-gel-nimbus-28-running-shoes",
    brand: "Asics",
    category: "Sports",
    subCategory: "Running Shoes",
    gender: "men",
    description: "The premium choice for runners seeking maximum plush comfort. Features an enhanced Gel cushioning layout for supreme impact absorption.",
    pricing: {
      basePrice: 16999.00,
      currency: "INR",
      discountPercentage: 0
    },
    rating: {
      average: 4.5,
      reviewCount: 1278
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&auto=format&fit=crop&q=80",
        alt: "ASICS Gel-Nimbus 28 Men",
        isMain: true
      }
    ],
    variants: [
      { sku: "ASIC-NIM28-M-7", size: "7", stock: 3 },
      { sku: "ASIC-NIM28-M-8", size: "8", stock: 6 },
      { sku: "ASIC-NIM28-M-9", size: "9", stock: 11 }
    ],
    totalStock: 20,
    seller: {
      name: "ASICS India",
      id: "sell_asics_in"
    }
  },
  {
    id: "prod_sp_011",
    name: "Puma Skyrocket Lite 2 Men Running Shoes",
    slug: "puma-skyrocket-lite-2-running-shoes",
    brand: "Puma",
    category: "Sports",
    subCategory: "Running Shoes",
    gender: "men",
    description: "Power through with ultra-lightweight PUMALITE cushioning and SOFTFOAM+ layout for an incredibly plush daily road run.",
    pricing: {
      basePrice: 2749.00,
      currency: "INR",
      discountPercentage: 45
    },
    rating: {
      average: 4.7,
      reviewCount: 284
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&auto=format&fit=crop&q=80",
        alt: "Puma Skyrocket Lite 2",
        isMain: true
      }
    ],
    variants: [
      { sku: "PUMA-SKY2-M-8", size: "8", stock: 12 },
      { sku: "PUMA-SKY2-M-9", size: "9", stock: 15 }
    ],
    totalStock: 27,
    seller: {
      name: "PUMA India",
      id: "sell_puma_in"
    }
  }
];

module.exports = sportShoeProducts;
