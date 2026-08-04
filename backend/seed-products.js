const path = require('path');
// Locate the .env file in the parent directory (project root)
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// If running natively on the host (not inside Docker), 'db' won't resolve.
// Docker maps port 5432 of the 'db' container to 5433 on localhost.
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@db:5432')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('@db:5432', '@localhost:5433');
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const realisticProducts = [
  // --- AUCTION / ACTIVE BIDS ITEMS ---
  {
    title: "Vintage Rolex Submariner (Auction)",
    description: "Rare 1980s Rolex Submariner in pristine condition. Live bidding active.",
    price: 45000.00,
    category: "Refurbished Electronics",
    imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=600&q=80",
    tags: ["Auction", "Rare"]
  },
  {
    title: "Antique Hand-Carved Mahogany Wardrobe",
    description: "19th century mahogany wardrobe, intricate detailing. Bidding closes soon.",
    price: 15500.00,
    category: "Home & Woodwork",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
    tags: ["Auction", "Antique"]
  },

  // --- STANDARD PRODUCTS ---
  {
    title: "Apple Watch Series 7 (Refurbished)",
    description: "Excellent condition Apple Watch Series 7. Fully tested and restored.",
    price: 2500.00,
    category: "Refurbished Electronics",
    imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Sony WH-1000XM4 Wireless Headphones",
    description: "Industry-leading noise canceling headphones in pristine refurbished condition.",
    price: 1850.00,
    category: "Refurbished Electronics",
    imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Dell XPS 15 Workstation PC",
    description: "Powerful workstation PC for creators and professionals.",
    price: 12500.00,
    category: "Refurbished Electronics",
    imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Premium Kente Cloth Fabric",
    description: "Authentic handwoven Kente cloth from Ghana. Vibrant colors, traditional patterns.",
    price: 1200.00,
    category: "Artisanal & Kente",
    imageUrl: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Handcrafted Beaded Necklace",
    description: "Traditional African beadwork, perfect for ceremonies and elegant wear.",
    price: 450.00,
    category: "Artisanal & Kente",
    imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Organic Shea Butter (Raw) 5kg",
    description: "Pure, unrefined Grade A Shea Butter sourced from Northern Ghana.",
    price: 850.00,
    category: "Health & Botanicals",
    imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Dried Hibiscus Flowers (Sobolo) 10kg",
    description: "Premium dried hibiscus flowers for teas and beverages. Bulk export pack.",
    price: 1400.00,
    category: "Agri-Business & Spices",
    imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Premium Robusta Coffee Beans 50kg",
    description: "High-yield Robusta beans. Freshly harvested and sun-dried.",
    price: 3200.00,
    category: "Agri-Business & Spices",
    imageUrl: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Hand-Carved Wooden Stool (Asese Dwa)",
    description: "Traditional Ashanti stool carved from single block of premium cedar wood.",
    price: 950.00,
    category: "Home & Woodwork",
    imageUrl: "https://images.unsplash.com/photo-1506898667547-42e22a46e125?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Moringa Powder (Organic) 20kg",
    description: "Superfood organic moringa leaf powder. High nutritional value.",
    price: 2100.00,
    category: "Health & Botanicals",
    imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Cocoa Butter Blocks 10kg",
    description: "Raw, food-grade cocoa butter blocks perfect for cosmetics and chocolate.",
    price: 1800.00,
    category: "Agri-Business & Spices",
    imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Handwoven Bolga Basket (XL)",
    description: "Authentic elephant-grass handwoven market basket with leather handles.",
    price: 350.00,
    category: "Artisanal & Kente",
    imageUrl: "https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Gold-Plated Ashanti Royalty Ring",
    description: "Traditional symbols crafted into high-durability 18k gold plated statement jewelry.",
    price: 3200.00,
    category: "Artisanal & Kente",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "MacBook Pro 16-inch M3 Max (Refurbished)",
    description: "Extreme power for developers and audio/visual producers. Fully certified restoration.",
    price: 28500.00,
    category: "Refurbished Electronics",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Samsung Galaxy S23 Ultra (Refurbished)",
    description: "Pristine flagship smartphone with S-Pen, amazing camera system and battery life.",
    price: 9200.00,
    category: "Refurbished Electronics",
    imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Raw African Black Soap Bar (10-Pack)",
    description: "Authentic Ghanaian organic black soap enriched with plantain skins and palm ash.",
    price: 300.00,
    category: "Health & Botanicals",
    imageUrl: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Pure Baobab Oil (Organic 500ml)",
    description: "Cold-pressed organic baobab seed oil rich in vitamins and nourishing essential antioxidants.",
    price: 650.00,
    category: "Health & Botanicals",
    imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Cashew Nut Raw Kernels (25kg Bulk)",
    description: "Premium sun-dried export quality raw cashew nut kernels from reliable harvests.",
    price: 3800.00,
    category: "Agri-Business & Spices",
    imageUrl: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Fresh Ginger Root Export Grade (50kg)",
    description: "Aromatic, robust pungent ginger root cleaned and packed for international bulk shipment.",
    price: 2900.00,
    category: "Agri-Business & Spices",
    imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Hand-Spun Indigo Dye Fabric (5 Yards)",
    description: "Rich West African natural indigo dyed cotton textiles with intricate geometric motifs.",
    price: 890.00,
    category: "Artisanal & Kente",
    imageUrl: "https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "iPad Pro 12.9 M2 Chip (Refurbished)",
    description: "Ultra-responsive Liquid Retina XDR display tablet for creative design and workflows.",
    price: 11000.00,
    category: "Refurbished Electronics",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Carved Mahogany Dining Set (6 Seater)",
    description: "Heirloom handcrafted dining set made entirely of mature seasoned West African mahogany.",
    price: 18500.00,
    category: "Home & Woodwork",
    imageUrl: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Traditional Brass Drum (Djembe XL)",
    description: "Resonating solid goatskin head drum with brass accents and genuine carved wood base.",
    price: 1650.00,
    category: "Home & Woodwork",
    imageUrl: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Organic Virgin Coconut Oil (5 Liters)",
    description: "Unrefined cold-pressed pure coconut oil for culinary and therapeutic personal care use.",
    price: 550.00,
    category: "Health & Botanicals",
    imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "PlayStation 5 Console (Refurbished)",
    description: "Next-gen gaming excellence. Full system diagnostic clean pass with original wireless controller.",
    price: 6400.00,
    category: "Refurbished Electronics",
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80"
  }
];

async function main() {
  console.log("Starting seed script...");
  
  // Find or create a default merchant user for products
  let vendor = await prisma.user.findFirst({ where: { role: "MERCHANT" } });
  if (!vendor) {
    vendor = await prisma.user.findFirst() || await prisma.user.create({
      data: {
        email: "merchant@tradehub.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuv",
        name: "Verified Export Merchant",
        role: "MERCHANT",
        trustScore: 98,
        availableBalance: 15000.00
      }
    });
  }

  // Clear existing products and auctions
  await prisma.bid.deleteMany({});
  await prisma.auction.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.nativeProduct.deleteMany({});
  console.log("Cleared old products and auctions.");

  // Seed new realistic products
  let count = 0;
  for (const p of realisticProducts) {
    await prisma.nativeProduct.create({
      data: {
        vendorId: vendor.id,
        title: p.title,
        description: p.description,
        price: p.price,
        category: p.category,
        imageUrl: p.imageUrl,
        stockCount: Math.floor(Math.random() * 50) + 10
      }
    });
    count++;
  }

  // Seed Live Auction Lots
  const auctionItems = [
    {
      title: "Vintage Rolex Submariner (1984 Collector Lot)",
      description: "Rare pristine 1980s Rolex Submariner with original box and Swiss authentication certificate. Live bidding active.",
      basePrice: 38000.00,
      currentHighestBid: 45000.00,
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 6), // 6 hours from now
      imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=600&q=80",
      brand: "Rolex",
      condition: "Pristine Refurbished / Certified Authentic"
    },
    {
      title: "Antique Hand-Carved Mahogany Royal Wardrobe",
      description: "Authentic 19th century mature seasoned mahogany wardrobe with intricate brass detailing. Escrow protected shipment.",
      basePrice: 12000.00,
      currentHighestBid: 15500.00,
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
      imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
      brand: "Ashanti Artisans",
      condition: "Antique Heirloom Grade A"
    },
    {
      title: "MacBook Pro 16 M3 Max Studio Bundle (Refurbished)",
      description: "Extreme creative suite laptop with 64GB RAM and professional Thunderbolt dock. Certified apple restoration.",
      basePrice: 22000.00,
      currentHighestBid: 26500.00,
      endTime: new Date(Date.now() + 1000 * 60 * 45), // 45 minutes from now!
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
      brand: "Apple",
      condition: "Grade A+ Certified Refurbished"
    },
    {
      title: "Gold-Plated Ashanti Royalty Statement Ring (24K Gold)",
      description: "Traditional royal emblem crafted into heavy-duty 24k gold plating over sterling silver base.",
      basePrice: 2400.00,
      currentHighestBid: 3200.00,
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 12), // 12 hours
      imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
      brand: "Ashanti Goldworks",
      condition: "Brand New Custom Commission"
    },
    {
      title: "Carved Mahogany Dining Suite (6-Seater Heritage Set)",
      description: "Heirloom dining set made entirely of West African hardwood with custom upholstered seats.",
      basePrice: 14000.00,
      currentHighestBid: 18500.00,
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 48), // 2 days
      imageUrl: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80",
      brand: "Native Woodwork Co.",
      condition: "Pristine Showroom Condition"
    },
    {
      title: "Sony Alpha a7 IV Full-Frame Camera + 24-70mm Lens",
      description: "Professional mirrorless setup in mint refurbished condition with low shutter count and cinema rigor.",
      basePrice: 16000.00,
      currentHighestBid: 19400.00,
      endTime: new Date(Date.now() + 1000 * 60 * 18), // 18 mins flash ending!
      imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800&auto=format&fit=crop",
      brand: "Sony",
      condition: "Refurbished Mint / 99% New"
    },
    {
      title: "iPad Pro 12.9 M2 Chip with Apple Pencil 2nd Gen",
      description: "Ultra-responsive Liquid Retina XDR display studio tablet in pristine box with original accessories.",
      basePrice: 8500.00,
      currentHighestBid: 10200.00,
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 8), // 8 hours
      imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80",
      brand: "Apple",
      condition: "Certified Refurbished"
    },
    {
      title: "Traditional Brass & Solid Cedar Djembe Drum (XL Heritage)",
      description: "Resonating authentic goatskin drum head with intricate hand-poured brass bands and carved cedar wood body.",
      basePrice: 1100.00,
      currentHighestBid: 1650.00,
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 36), // 36 hours
      imageUrl: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=600&q=80",
      brand: "Accra Acoustics",
      condition: "Authentic Hand-Carved New"
    }
  ];

  let aucCount = 0;
  for (const a of auctionItems) {
    await prisma.auction.create({
      data: {
        importer: { connect: { id: vendor.id } },
        title: a.title,
        description: a.description,
        basePrice: a.basePrice,
        currentHighestBid: a.currentHighestBid,
        endTime: a.endTime,
        imageUrl: a.imageUrl,
        brand: a.brand,
        condition: a.condition,
        status: "active"
      }
    });
    aucCount++;
  }

  console.log(`Successfully seeded ${count} realistic products and ${aucCount} live auctions!`);
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
