import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ─── Create Admin User ───────────────────────────────────────
  const hashedPassword = await bcrypt.hash('3TLN0743975/5/5', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'subramanim7603@gmail.com' },
    update: {
      password: hashedPassword,
      role: Role.ADMIN,
    },
    create: {
      email: 'subramanim7603@gmail.com',
      password: hashedPassword,
      firstName: 'Subramani',
      lastName: 'M',
      role: Role.ADMIN,
      emailVerified: true,
    },
  });
  console.log(`✅ Professional Admin user ready: ${admin.email}`);

  // ─── Create Demo Customer ──────────────────────────────────
  const customerPassword = await bcrypt.hash('Customer123!', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@thegreat.com' },
    update: {},
    create: {
      email: 'customer@thegreat.com',
      password: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: Role.CUSTOMER,
      emailVerified: true,
    },
  });
  console.log(`✅ Customer user created: ${customer.email}`);

  // ─── Create Categories ──────────────────────────────────────
  const categoriesData = [
    { name: 'Electronics', slug: 'electronics', description: 'Gadgets, devices, and electronic accessories', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600' },
    { name: 'Clothing', slug: 'clothing', description: 'Fashion apparel for all occasions', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600' },
    { name: 'Home & Living', slug: 'home-living', description: 'Furniture, decor, and home essentials', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600' },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Gear for fitness and adventure', image: 'https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=600' },
    { name: 'Books', slug: 'books', description: 'Bestsellers, novels, and educational books', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600' },
    { name: 'Beauty & Health', slug: 'beauty-health', description: 'Skincare, wellness, and beauty products', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600' },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ ${Object.keys(categories).length} categories created`);

  // ─── Create Products ────────────────────────────────────────
  const productsData = [
    // Electronics
    {
      name: 'Wireless Noise-Cancelling Headphones',
      slug: 'wireless-nc-headphones',
      description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and Hi-Res Audio support. Features adaptive sound control and speak-to-chat technology.',
      price: 299.99,
      compareAtPrice: 349.99,
      stock: 50,
      sku: 'ELEC-001',
      featured: true,
      categoryId: categories['electronics'].id,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800',
      ],
      variants: [
        { name: 'Black', sku: 'ELEC-001-BLK', price: 299.99, stock: 20 },
        { name: 'Silver', sku: 'ELEC-001-SLV', price: 299.99, stock: 15 },
        { name: 'Blue', sku: 'ELEC-001-BLU', price: 309.99, stock: 15 },
      ],
    },
    {
      name: 'Ultra-Slim Laptop 15"',
      slug: 'ultra-slim-laptop-15',
      description: 'Blazing-fast performance with M-series chip, 16GB RAM, 512GB SSD. Stunning Retina display with ProMotion technology. All-day battery life.',
      price: 1299.99,
      compareAtPrice: 1499.99,
      stock: 30,
      sku: 'ELEC-002',
      featured: true,
      categoryId: categories['electronics'].id,
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
        'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800',
      ],
      variants: [
        { name: '256GB', sku: 'ELEC-002-256', price: 1099.99, stock: 10 },
        { name: '512GB', sku: 'ELEC-002-512', price: 1299.99, stock: 10 },
        { name: '1TB', sku: 'ELEC-002-1TB', price: 1599.99, stock: 10 },
      ],
    },
    {
      name: 'Smart Watch Pro',
      slug: 'smart-watch-pro',
      description: 'Advanced health monitoring with ECG, blood oxygen, and sleep tracking. GPS, water resistant to 50m, and 7-day battery life.',
      price: 399.99,
      stock: 75,
      sku: 'ELEC-003',
      featured: true,
      categoryId: categories['electronics'].id,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      ],
      variants: [
        { name: '41mm', sku: 'ELEC-003-41', price: 399.99, stock: 40 },
        { name: '45mm', sku: 'ELEC-003-45', price: 429.99, stock: 35 },
      ],
    },
    {
      name: 'Portable Bluetooth Speaker',
      slug: 'portable-bluetooth-speaker',
      description: 'Powerful 360-degree sound in a compact design. IP67 waterproof rating, 20-hour playtime, and built-in power bank.',
      price: 129.99,
      compareAtPrice: 159.99,
      stock: 100,
      sku: 'ELEC-004',
      categoryId: categories['electronics'].id,
      images: [
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800',
      ],
      variants: [],
    },
    // Clothing
    {
      name: 'Premium Cotton Hoodie',
      slug: 'premium-cotton-hoodie',
      description: 'Heavyweight organic cotton hoodie with a relaxed fit. Double-layered hood, kangaroo pocket, and reinforced ribbing at cuffs and hem.',
      price: 89.99,
      compareAtPrice: 110.00,
      stock: 120,
      sku: 'CLO-001',
      featured: true,
      categoryId: categories['clothing'].id,
      images: [
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
        'https://images.unsplash.com/photo-1578768079470-c3e3b2107547?w=800',
      ],
      variants: [
        { name: 'S - Black', sku: 'CLO-001-S-BLK', price: 89.99, stock: 30 },
        { name: 'M - Black', sku: 'CLO-001-M-BLK', price: 89.99, stock: 30 },
        { name: 'L - Black', sku: 'CLO-001-L-BLK', price: 89.99, stock: 30 },
        { name: 'XL - Black', sku: 'CLO-001-XL-BLK', price: 89.99, stock: 30 },
      ],
    },
    {
      name: 'Classic Denim Jacket',
      slug: 'classic-denim-jacket',
      description: 'Timeless denim jacket crafted from premium selvedge denim. Button closure, chest pockets, and a slightly cropped silhouette.',
      price: 149.99,
      stock: 60,
      sku: 'CLO-002',
      categoryId: categories['clothing'].id,
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      ],
      variants: [
        { name: 'S', sku: 'CLO-002-S', price: 149.99, stock: 15 },
        { name: 'M', sku: 'CLO-002-M', price: 149.99, stock: 15 },
        { name: 'L', sku: 'CLO-002-L', price: 149.99, stock: 15 },
        { name: 'XL', sku: 'CLO-002-XL', price: 149.99, stock: 15 },
      ],
    },
    {
      name: 'Running Sneakers Ultralight',
      slug: 'running-sneakers-ultralight',
      description: 'Engineered mesh upper with responsive foam cushioning. Lightweight design weighing only 200g. Perfect for daily runs and gym workouts.',
      price: 179.99,
      compareAtPrice: 220.00,
      stock: 80,
      sku: 'CLO-003',
      featured: true,
      categoryId: categories['clothing'].id,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
      ],
      variants: [
        { name: 'US 8', sku: 'CLO-003-8', price: 179.99, stock: 20 },
        { name: 'US 9', sku: 'CLO-003-9', price: 179.99, stock: 20 },
        { name: 'US 10', sku: 'CLO-003-10', price: 179.99, stock: 20 },
        { name: 'US 11', sku: 'CLO-003-11', price: 179.99, stock: 20 },
      ],
    },
    {
      name: 'Minimalist Leather Watch',
      slug: 'minimalist-leather-watch',
      description: 'Elegant timepiece with a Swiss quartz movement, sapphire crystal glass, and genuine Italian leather strap. 40mm case diameter.',
      price: 249.99,
      stock: 40,
      sku: 'CLO-004',
      categoryId: categories['clothing'].id,
      images: [
        'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800',
      ],
      variants: [
        { name: 'Brown Strap', sku: 'CLO-004-BRN', price: 249.99, stock: 20 },
        { name: 'Black Strap', sku: 'CLO-004-BLK', price: 249.99, stock: 20 },
      ],
    },
    // Home & Living
    {
      name: 'Modern Ceramic Table Lamp',
      slug: 'modern-ceramic-table-lamp',
      description: 'Handcrafted ceramic base with a linen drum shade. Three brightness levels with touch control. Creates a warm, ambient glow.',
      price: 79.99,
      stock: 45,
      sku: 'HOME-001',
      categoryId: categories['home-living'].id,
      images: [
        'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=800',
      ],
      variants: [
        { name: 'White', sku: 'HOME-001-WHT', price: 79.99, stock: 25 },
        { name: 'Charcoal', sku: 'HOME-001-CHR', price: 84.99, stock: 20 },
      ],
    },
    {
      name: 'Organic Cotton Throw Blanket',
      slug: 'organic-cotton-throw-blanket',
      description: 'Luxuriously soft organic cotton throw blanket with herringbone weave. Perfect for cozy evenings. Machine washable. 150cm x 200cm.',
      price: 69.99,
      compareAtPrice: 89.99,
      stock: 200,
      sku: 'HOME-002',
      categoryId: categories['home-living'].id,
      images: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      ],
      variants: [],
    },
    {
      name: 'Scented Soy Candle Set',
      slug: 'scented-soy-candle-set',
      description: 'Set of 3 hand-poured soy wax candles in Lavender, Vanilla Bean, and Cedar Wood scents. Each candle burns for 40+ hours.',
      price: 44.99,
      stock: 150,
      sku: 'HOME-003',
      categoryId: categories['home-living'].id,
      images: [
        'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800',
      ],
      variants: [],
    },
    {
      name: 'Minimalist Desk Organizer',
      slug: 'minimalist-desk-organizer',
      description: 'Premium walnut wood desk organizer with compartments for phone, pens, and accessories. Elegant natural grain finish.',
      price: 54.99,
      stock: 70,
      sku: 'HOME-004',
      categoryId: categories['home-living'].id,
      images: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800',
      ],
      variants: [],
    },
    // Sports & Outdoors
    {
      name: 'Yoga Mat Professional',
      slug: 'yoga-mat-professional',
      description: 'Extra-thick 6mm eco-friendly TPE mat with alignment lines. Non-slip surface on both sides. Includes carrying strap.',
      price: 59.99,
      compareAtPrice: 79.99,
      stock: 90,
      sku: 'SPO-001',
      categoryId: categories['sports-outdoors'].id,
      images: [
        'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800',
      ],
      variants: [
        { name: 'Sage Green', sku: 'SPO-001-GRN', price: 59.99, stock: 30 },
        { name: 'Lilac', sku: 'SPO-001-LIL', price: 59.99, stock: 30 },
        { name: 'Charcoal', sku: 'SPO-001-CHR', price: 59.99, stock: 30 },
      ],
    },
    {
      name: 'Stainless Steel Water Bottle',
      slug: 'stainless-steel-water-bottle',
      description: 'Double-wall vacuum insulated 750ml bottle. Keeps drinks cold 24hrs or hot 12hrs. Leak-proof cap with carry loop.',
      price: 34.99,
      stock: 200,
      sku: 'SPO-002',
      categoryId: categories['sports-outdoors'].id,
      images: [
        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800',
      ],
      variants: [
        { name: 'Arctic White', sku: 'SPO-002-WHT', price: 34.99, stock: 50 },
        { name: 'Ocean Blue', sku: 'SPO-002-BLU', price: 34.99, stock: 50 },
        { name: 'Midnight Black', sku: 'SPO-002-BLK', price: 34.99, stock: 50 },
        { name: 'Rose Gold', sku: 'SPO-002-RSG', price: 39.99, stock: 50 },
      ],
    },
    {
      name: 'Resistance Bands Set',
      slug: 'resistance-bands-set',
      description: 'Set of 5 natural latex resistance bands (10-50 lbs). Includes door anchor, ankle straps, handles, and carrying bag.',
      price: 29.99,
      stock: 180,
      sku: 'SPO-003',
      categoryId: categories['sports-outdoors'].id,
      images: [
        'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800',
      ],
      variants: [],
    },
    {
      name: 'Hiking Backpack 40L',
      slug: 'hiking-backpack-40l',
      description: 'Durable ripstop nylon backpack with ergonomic suspension system. Rain cover included. Multiple compartments and hydration compatible.',
      price: 119.99,
      compareAtPrice: 149.99,
      stock: 55,
      sku: 'SPO-004',
      featured: true,
      categoryId: categories['sports-outdoors'].id,
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
      ],
      variants: [
        { name: 'Forest Green', sku: 'SPO-004-GRN', price: 119.99, stock: 20 },
        { name: 'Navy', sku: 'SPO-004-NVY', price: 119.99, stock: 20 },
        { name: 'Black', sku: 'SPO-004-BLK', price: 119.99, stock: 15 },
      ],
    },
    // Books
    {
      name: 'The Art of Clean Code',
      slug: 'art-of-clean-code',
      description: 'A comprehensive guide to writing elegant, maintainable, and efficient code. Covers design patterns, refactoring, and best practices.',
      price: 39.99,
      stock: 300,
      sku: 'BOOK-001',
      categoryId: categories['books'].id,
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
      ],
      variants: [
        { name: 'Paperback', sku: 'BOOK-001-PB', price: 39.99, stock: 200 },
        { name: 'Hardcover', sku: 'BOOK-001-HC', price: 59.99, stock: 100 },
      ],
    },
    {
      name: 'Mindful Living Journal',
      slug: 'mindful-living-journal',
      description: 'Guided mindfulness journal with daily prompts, gratitude exercises, and reflection pages. 365-day format with lay-flat binding.',
      price: 24.99,
      stock: 120,
      sku: 'BOOK-002',
      categoryId: categories['books'].id,
      images: [
        'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800',
      ],
      variants: [],
    },
    {
      name: 'World Atlas Illustrated',
      slug: 'world-atlas-illustrated',
      description: 'Beautifully illustrated atlas with detailed maps, geographic data, and cultural insights for every country. 400+ pages.',
      price: 49.99,
      stock: 60,
      sku: 'BOOK-003',
      categoryId: categories['books'].id,
      images: [
        'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800',
      ],
      variants: [],
    },
    {
      name: 'Cooking Masterclass Cookbook',
      slug: 'cooking-masterclass-cookbook',
      description: 'Over 200 recipes from world-renowned chefs. Step-by-step photos, technique guides, and seasonal ingredient highlight.',
      price: 44.99,
      compareAtPrice: 59.99,
      stock: 80,
      sku: 'BOOK-004',
      categoryId: categories['books'].id,
      images: [
        'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800',
      ],
      variants: [],
    },
    // Beauty & Health
    {
      name: 'Vitamin C Brightening Serum',
      slug: 'vitamin-c-brightening-serum',
      description: 'Concentrated 20% vitamin C serum with hyaluronic acid and vitamin E. Brightens skin, reduces dark spots, and boosts collagen production.',
      price: 42.99,
      stock: 140,
      sku: 'BH-001',
      categoryId: categories['beauty-health'].id,
      images: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800',
      ],
      variants: [
        { name: '30ml', sku: 'BH-001-30', price: 42.99, stock: 70 },
        { name: '60ml', sku: 'BH-001-60', price: 72.99, stock: 70 },
      ],
    },
    {
      name: 'Natural Essential Oil Diffuser',
      slug: 'essential-oil-diffuser',
      description: 'Ultrasonic aromatherapy diffuser with 7 LED color modes and auto shut-off. 300ml capacity with up to 10 hours of continuous mist.',
      price: 39.99,
      stock: 95,
      sku: 'BH-002',
      featured: true,
      categoryId: categories['beauty-health'].id,
      images: [
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800',
      ],
      variants: [
        { name: 'Wood Grain', sku: 'BH-002-WG', price: 39.99, stock: 50 },
        { name: 'White', sku: 'BH-002-WHT', price: 39.99, stock: 45 },
      ],
    },
    {
      name: 'Bamboo Charcoal Face Mask Set',
      slug: 'bamboo-charcoal-face-mask',
      description: 'Set of 10 sheets activated bamboo charcoal face masks. Deep cleansing, pore minimizing, and oil controlling formula.',
      price: 18.99,
      compareAtPrice: 24.99,
      stock: 250,
      sku: 'BH-003',
      categoryId: categories['beauty-health'].id,
      images: [
        'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800',
      ],
      variants: [],
    },
    {
      name: 'Professional Hair Dryer',
      slug: 'professional-hair-dryer',
      description: 'Ionic technology hair dryer with 3 heat settings, 2 speed settings, and a cool shot button. Includes diffuser and concentrator nozzle.',
      price: 89.99,
      compareAtPrice: 119.99,
      stock: 65,
      sku: 'BH-004',
      categoryId: categories['beauty-health'].id,
      images: [
        'https://images.unsplash.com/photo-1522338242992-e1a54571a9f7?w=800',
      ],
      variants: [
        { name: 'Rose Gold', sku: 'BH-004-RSG', price: 89.99, stock: 35 },
        { name: 'Matte Black', sku: 'BH-004-BLK', price: 89.99, stock: 30 },
      ],
    },
  ];

  for (const p of productsData) {
    const { images, variants, ...productData } = p;
    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: productData,
    });

    // Create product images
    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.create({
        data: {
          url: images[i],
          alt: productData.name,
          position: i,
          productId: product.id,
        },
      });
    }

    // Create product variants
    for (const v of variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {},
        create: { ...v, productId: product.id },
      });
    }
  }
  console.log(`✅ ${productsData.length} products created with images & variants`);

  // ─── Create Coupons ─────────────────────────────────────────
  const coupons = [
    { code: 'SAVE10', discountPercent: 10, maxUses: 100, minOrderAmount: 50 },
    { code: 'SAVE20', discountPercent: 20, maxUses: 50, minOrderAmount: 100 },
    { code: 'WELCOME15', discountPercent: 15, maxUses: 500, minOrderAmount: 30 },
    { code: 'FREESHIP', discountPercent: 100, maxUses: 200, minOrderAmount: 75 },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: {
        ...c,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
    });
  }
  console.log(`✅ ${coupons.length} coupons created`);

  // ─── Create Sample Address ──────────────────────────────────
  await prisma.address.create({
    data: {
      userId: customer.id,
      label: 'Home',
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'US',
      phone: '+1-555-0100',
      isDefault: true,
    },
  });
  console.log('✅ Sample address created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('   Admin:    subramanim7603@gmail.com / (Your private password)');
  console.log('   Customer: customer@thegreat.com / Customer123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
