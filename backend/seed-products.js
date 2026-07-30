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
    imageUrl: "https://images.unsplash.com/photo-1595514535310-90ed579f1bc2?auto=format&fit=crop&w=600&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1584824388155-279c6ea9fc22?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Handcrafted Beaded Necklace",
    description: "Traditional African beadwork, perfect for ceremonies and elegant wear.",
    price: 450.00,
    category: "Artisanal & Kente",
    imageUrl: "https://images.unsplash.com/photo-1601121853354-e6e866bd2ac2?auto=format&fit=crop&w=600&q=80"
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
    imageUrl: "https://images.unsplash.com/photo-1596647893902-690180a0ee44?auto=format&fit=crop&w=600&q=80"
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
    imageUrl: "https://images.unsplash.com/photo-1615486171448-4aff1a437f81?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Cocoa Butter Blocks 10kg",
    description: "Raw, food-grade cocoa butter blocks perfect for cosmetics and chocolate.",
    price: 1800.00,
    category: "Agri-Business & Spices",
    imageUrl: "https://images.unsplash.com/photo-1511381939415-e4401546683c?auto=format&fit=crop&w=600&q=80"
  }
];

async function main() {
  console.log("Starting seed script...");
  
  // Clear existing products
  await prisma.product.deleteMany({});
  console.log("Cleared old products.");

  // Seed new realistic products
  let count = 0;
  for (const p of realisticProducts) {
    // Random rating between 3.8 and 5.0
    const rating = parseFloat((Math.random() * (5.0 - 3.8) + 3.8).toFixed(1));
    
    // Default tags if not specified
    const tags = p.tags || (count % 3 === 0 ? ["Best Seller"] : count % 4 === 0 ? ["New"] : []);

    await prisma.product.create({
      data: {
        name: p.title,
        description: p.description,
        price: p.price,
        category: p.category,
        image: p.imageUrl,
        rating: rating,
        stock: Math.floor(Math.random() * 50) + 5,
        tags: tags
      }
    });
    count++;
  }

  console.log(`Successfully seeded ${count} realistic products!`);
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
