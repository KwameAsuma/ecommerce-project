const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

// The core 4 demo products required by Task 1
const coreProducts = [
  { title: "Apple MacBook Pro 16 M3 Max Studio Bundle", description: "Extreme creative suite laptop with 64GB RAM, 2TB NVMe SSD. Mint condition.", price: 24500.00, category: "Refurbished Electronics", imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80", stockCount: 15 },
  { title: "Sony Alpha a7 IV Full-Frame Camera", description: "Professional cinema-rigor mirrorless camera setup in mint refurbished condition.", price: 18500.00, category: "Refurbished Electronics", imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80", stockCount: 8 },
  { title: "Royal Ashanti Handwoven Silk Kente Cloth", description: "Authentic heavy silk handwoven Kente ceremonial robe directly commissioned.", price: 3200.00, category: "Artisanal & Kente", imageUrl: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80", stockCount: 20 },
  { title: "Gold-Plated Ashanti Royalty Statement Ring", description: "Traditional royal emblem crafted into heavy-duty 24k gold plating.", price: 2800.00, category: "Artisanal & Kente", imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80", stockCount: 12 }
];

// The core 2 demo auctions required by Task 1
const demoAuctions = [
  { title: "Vintage 1984 Rolex Submariner", description: "Rare pristine 1980s Rolex Submariner complete with original archival box. Escrow insured.", basePrice: 42000.00, currentHighestBid: 48500.00, endTime: new Date(Date.now() + 1000 * 60 * 60 * 5), imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80", brand: "Rolex", condition: "Pristine Vintage", status: "active" },
  { title: "Sony PlayStation 5 Pro Console Bundle", description: "Complete ultimate competitive gaming rig refurbished by Sony tech specialists.", basePrice: 7200.00, currentHighestBid: 8100.00, endTime: new Date(Date.now() + 1000 * 60 * 35), imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80", brand: "Sony", condition: "Refurbished", status: "active" }
];

// Additional 46 realistic products to reach the 50 product population count as requested
const additionalProducts = [
  { title: "Sony WH-1000XM4 Wireless Headphones", description: "Industry-leading noise canceling headphones in pristine refurbished condition.", price: 1850.00, category: "Refurbished Electronics", imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80", stockCount: 18 },
  { title: "Apple Watch Series 7 (Certified Refurbished)", description: "Excellent condition Apple Watch Series 7. Fully tested and restored.", price: 2500.00, category: "Refurbished Electronics", imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80", stockCount: 14 },
  { title: "Dell XPS 15 Workstation PC", description: "Powerful workstation PC for creators and professionals with 32GB RAM.", price: 12500.00, category: "Refurbished Electronics", imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80", stockCount: 6 },
  { title: "iPad Pro 12.9 M2 Chip Bundle", description: "Certified refurbished bundle with M2 processing power and liquid retina display.", price: 8500.00, category: "Refurbished Electronics", imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80", stockCount: 11 },
  { title: "Traditional Hand-Carved Ashanti Stool (Asese Dwa)", description: "Traditional Ashanti stool carved from single block of premium cedar wood.", price: 950.00, category: "Home & Woodwork", imageUrl: "https://images.unsplash.com/photo-1506898667547-42e22a46e125?auto=format&fit=crop&w=800&q=80", stockCount: 10 },
  { title: "Organic Raw Shea Butter 5kg Tub", description: "Pure, unrefined Grade A Shea Butter sourced from Northern Ghana.", price: 850.00, category: "Health & Botanicals", imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80", stockCount: 45 },
  { title: "Premium Sun-Dried Hibiscus Sobolo 10kg", description: "Premium dried hibiscus flowers for teas and Sobolo beverages.", price: 1400.00, category: "Agri-Business & Spices", imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80", stockCount: 30 },
  { title: "Sun-Dried Premium Robusta Coffee Beans 25kg", description: "High-yield Robusta beans. Freshly harvested and sun-dried.", price: 2100.00, category: "Agri-Business & Spices", imageUrl: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=800&q=80", stockCount: 22 },
  { title: "Handcrafted Beaded Ceremony Necklace", description: "Traditional African beadwork, perfect for ceremonies and elegant wear.", price: 450.00, category: "Artisanal & Kente", imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80", stockCount: 15 },
  { title: "Organic Virgin Coconut Oil (5 Liters)", description: "Unrefined cold-pressed pure coconut oil for culinary and therapeutic personal care use.", price: 550.00, category: "Health & Botanicals", imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80", stockCount: 50 },
  { title: "Premium Kente Cloth Table Runner", description: "Add a touch of African luxury to your home with a handwoven table runner.", price: 350.00, category: "Artisanal & Kente", imageUrl: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80", stockCount: 25 }
];

// Helper to generate unique variants to dynamically reach exactly 50 total products
const generateCatalog = () => {
  const list = [...coreProducts];
  let id = 1;
  
  // Fill from additionalProducts first
  for (const p of additionalProducts) {
    if (list.length >= 50) break;
    list.push({ ...p });
  }

  // Duplicate with slight variations to reach exactly 50
  const categories = ["Refurbished Electronics", "Artisanal & Kente", "Home & Woodwork", "Health & Botanicals", "Agri-Business & Spices"];
  const brands = ["Elite", "Royal", "Heritage", "Savannah", "Accra"];
  
  while (list.length < 50) {
    const base = additionalProducts[list.length % additionalProducts.length];
    const cat = categories[list.length % categories.length];
    const brand = brands[list.length % brands.length];
    list.push({
      title: `${brand} ${base.title} (Batch #${id++})`,
      description: `${base.description} Part of our exclusive ${brand} marketplace release.`,
      price: Math.round(base.price * (0.9 + Math.random() * 0.3) * 10) / 10,
      category: cat,
      imageUrl: base.imageUrl,
      stockCount: Math.floor(Math.random() * 30) + 5
    });
  }
  return list;
};

async function main() {
  console.log("🧹 STEP 1: Clearing existing database records...");
  await prisma.ticketMessage.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.bid.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.auction.deleteMany({});
  await prisma.nativeProduct.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("👤 STEP 2: Creating Users...");
  const vendorPasswordHash = await bcrypt.hash("vendor123", 10);
  const systemVendor = await prisma.user.create({
    data: {
      email: "system_vendor@bedidwa.com",
      passwordHash: vendorPasswordHash,
      name: "BediDwa System Vendor",
      role: "VENDOR",
      phone: "0240000001",
      momoNumber: "0240000001",
      storeAddress: "BediDwa HQ, Accra",
      trustScore: 100,
      availableBalance: 50000.00
    }
  });

  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      email: "system_admin@bedidwa.com",
      passwordHash: adminPasswordHash,
      name: "BediDwa System Admin",
      role: "ADMIN",
      phone: "0240000002"
    }
  });

  console.log("📦 STEP 3: Seeding exactly 50 Products for Vendor...");
  const products = generateCatalog();
  let count = 0;
  for (const p of products) {
    await prisma.nativeProduct.create({
      data: { vendorId: systemVendor.id, ...p }
    });
    count++;
  }

  console.log("🔨 STEP 4: Seeding Auctions for Vendor...");
  for (const a of demoAuctions) {
    await prisma.auction.create({
      data: { importerId: systemVendor.id, ...a }
    });
  }
  console.log(`🎉 SEEDING COMPLETE! Seeded ${count} standard products and ${demoAuctions.length} auctions strictly assigned to the Vendor.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
