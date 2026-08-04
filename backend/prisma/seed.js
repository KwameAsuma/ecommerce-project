const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with test data...');
  
  // Create admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tradehub.com' },
    update: {},
    create: {
      name: 'TradeHub Admin',
      email: 'admin@tradehub.com',
      passwordHash: adminPassword,
      role: 'admin',
    },
  });
  
  // Create merchant
  const merchantPassword = await bcrypt.hash('merchant123', 10);
  const merchant = await prisma.user.upsert({
    where: { email: 'merchant@tradehub.com' },
    update: {},
    create: {
      name: 'Global Exports Co.',
      email: 'merchant@tradehub.com',
      passwordHash: merchantPassword,
      role: 'merchant',
      phone: '0541234567',
      storeDescription: 'Premium exports from Ghana.',
    },
  });

  console.log('Checking existing products...');
  const productCount = await prisma.nativeProduct.count();
  
  if (productCount === 0) {
    console.log('Creating test products...');
    const products = [
      {
        title: 'Premium Handwoven Kente Cloth',
        description: 'Authentic Ghanaian Kente cloth woven by master artisans in Bonwire. Perfect for special occasions and royal events.',
        price: 850.00,
        stockCount: 15,
        category: 'Clothes',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
      },
      {
        title: 'Organic Raw Shea Butter',
        description: '100% pure, unrefined shea butter sourced directly from women cooperatives in Northern Ghana.',
        price: 120.00,
        stockCount: 50,
        category: 'Health & Botanicals',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
      },
      {
        title: 'Refurbished Sony WH-1000XM4',
        description: 'Industry leading noise canceling headphones. Fully refurbished and tested.',
        price: 2500.00,
        stockCount: 5,
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
      },
      {
        title: 'Apple Watch Series 8',
        description: 'Latest Apple Watch with health tracking features.',
        price: 3500.00,
        stockCount: 3,
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
      },
      {
        title: 'Rolex Submariner Date (m126610lv-0002)',
        description: 'Authentic Rolex Submariner Date with classic green Cerachrom bezel (Kermit/Starbucks). Full box and verification papers included.',
        price: 165000.00,
        stockCount: 1,
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop',
      }
    ];

    for (const product of products) {
      await prisma.nativeProduct.create({
        data: {
          vendorId: merchant.id,
          ...product
        }
      });
    }
  }

  const auctionCount = await prisma.auction.count();
  if (auctionCount === 0) {
    console.log('Creating test auctions...');
    const auctions = [
      {
        title: 'Bulk Premium Cocoa Beans (100kg)',
        basePrice: 5000.00,
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
        brand: 'Ghana Cocoa Board',
        condition: 'New',
        description: 'High-quality, sun-dried cocoa beans ready for export.'
      },
      {
        title: 'Vintage Hand-Carved Wooden Stool',
        basePrice: 800.00,
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        imageUrl: 'https://images.unsplash.com/photo-1505156868547-9b49f4df4e04?q=80&w=800&auto=format&fit=crop',
        brand: 'Ashanti Crafts',
        condition: 'Used',
        description: 'Authentic Ashanti wooden stool with intricate Adinkra symbols.'
      },
      {
        title: 'Rolex Submariner Date (m126610lv-0002)',
        basePrice: 165000.00,
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop',
        brand: 'Rolex',
        condition: 'New / Unworn',
        description: 'Authentic Rolex Submariner Date with classic green Cerachrom bezel (Kermit/Starbucks). Full box and verification papers included.'
      }
    ];

    for (const auction of auctions) {
      await prisma.auction.create({
        data: {
          importerId: merchant.id,
          ...auction
        }
      });
    }
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
