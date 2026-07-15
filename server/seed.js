import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Import Models
import User from './models/User.js';
import Category from './models/Category.js';
import Brand from './models/Brand.js';
import Product from './models/Product.js';
import Coupon from './models/Coupon.js';
import Banner from './models/Banner.js';
import Cart from './models/Cart.js';
import Wishlist from './models/Wishlist.js';
import Review from './models/Review.js';
import Order from './models/Order.js';

dotenv.config();

const seedData = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB Connection successful. Cleaning collections...');

    // Delete existing records
    await User.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();
    await Product.deleteMany();
    await Coupon.deleteMany();
    await Banner.deleteMany();
    await Cart.deleteMany();
    await Wishlist.deleteMany();
    await Review.deleteMany();
    await Order.deleteMany();

    console.log('Collections cleared. Seeding Users...');

    // 1. Seed Users
    // Admin User
    const admin = await User.create({
      name: 'Stunning Beauty Admin',
      email: 'admin@ecommerce.com',
      password: 'admin123',
      phone: '9876543210',
      role: 'Admin',
      isVerified: true
    });
    await Cart.create({ user: admin._id, items: [] });
    await Wishlist.create({ user: admin._id, products: [] });

    // Customer User
    const customer = await User.create({
      name: 'Neha Sharma',
      email: 'john@gmail.com',
      password: 'user123',
      phone: '9876543211',
      role: 'Customer',
      isVerified: true
    });
    await Cart.create({ user: customer._id, items: [] });
    await Wishlist.create({ user: customer._id, products: [] });

    console.log('Users seeded. Seeding 8 Beauty Categories...');

    // 2. Seed Categories
    const categoriesList = [
      {
        name: 'Skincare',
        slug: 'skincare',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
        description: 'Premium serums, moisturizers, sunscreens, and daily skincare routines.'
      },
      {
        name: 'Makeup',
        slug: 'makeup',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
        description: 'Trending lipsticks, foundations, eyeliners, and highlighters.'
      },
      {
        name: 'Haircare',
        slug: 'haircare',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
        description: 'Nourishing shampoos, hair oils, hair masks, and repair serums.'
      },
      {
        name: 'Fragrance',
        slug: 'fragrance',
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80',
        description: 'Luxury perfumes, body mists, and signature fragrances.'
      },
      {
        name: 'Bath & Body',
        slug: 'body',
        image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80',
        description: 'Refreshing body washes, rich lotions, scrubs, and body oils.'
      },
      {
        name: 'Wellness',
        slug: 'wellness',
        image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80',
        description: 'Aromatherapy essential oils, herbal teas, and wellness supplements.'
      },
      {
        name: 'Tools & Brushes',
        slug: 'tools',
        image: 'https://images.unsplash.com/photo-1607602131475-475c477cfb87?auto=format&fit=crop&w=600&q=80',
        description: 'Professional makeup brushes, jade rollers, and styling tools.'
      },
      {
        name: 'Gifts & Sets',
        slug: 'sets',
        image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=600&q=80',
        description: 'Beautifully curated gift boxes and skincare value sets.'
      }
    ];

    const seededCategories = await Category.insertMany(categoriesList);
    const catMap = {};
    seededCategories.forEach(cat => {
      catMap[cat.slug] = cat._id;
    });

    console.log('Categories seeded. Seeding Brands...');

    // 3. Seed Brands
    const brandsList = [
      { name: 'L\'Oreal', logo: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&w=150&q=80', description: 'World leader in professional hair and skincare.' },
      { name: 'Estee Lauder', logo: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=150&q=80', description: 'Luxury skincare, makeup, and fragrance.' },
      { name: 'The Ordinary', logo: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=150&q=80', description: 'Clinical formulations with integrity.' },
      { name: 'Laneige', logo: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=150&q=80', description: 'Hydrating Korean beauty and skincare.' },
      { name: 'CeraVe', logo: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=150&q=80', description: 'Dermatologist-recommended barrier care.' },
      { name: 'Fenty Beauty', logo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=150&q=80', description: 'Inclusive makeup by Rihanna.' },
      { name: 'Chanel', logo: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=150&q=80', description: 'High-end luxury perfumes and makeup.' },
      { name: 'Dyson', logo: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&w=150&q=80', description: 'Premium hair styling technologies.' }
    ];

    const seededBrands = await Brand.insertMany(brandsList);
    const brandMap = {};
    seededBrands.forEach(b => {
      const slug = b.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      brandMap[slug] = b._id;
    });

    console.log('Brands seeded. Seeding Beauty Products...');

    // 4. Seed Products
    const productsList = [
      // ─── SKINCARE ───
      {
        title: 'The Ordinary Niacinamide 10% + Zinc 1%',
        slug: 'the-ordinary-niacinamide-10-zinc-1',
        description: 'A high-strength vitamin and mineral blemish formula that targets breakouts, minimizes pores, and regulates sebum production.',
        shortDescription: 'Regulating serum for blemishes and pores.',
        price: 850,
        discountPrice: 799,
        stock: 50,
        SKU: 'ORD-NIAZNC-30',
        category: catMap['skincare'],
        brand: brandMap['theordinary'],
        images: [{ url: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600&q=80', publicId: 'ordinary_niacinamide' }],
        thumbnail: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600&q=80',
        tags: ['serum', 'niacinamide', 'skincare', 'ordinary', 'pores'],
        rating: 4.7,
        reviewCount: 154,
        featured: true,
        trending: true,
        bestSeller: true,
        newArrival: false,
        specifications: [
          { key: 'Volume', value: '30 ml' },
          { key: 'Skin Type', value: 'All Skin Types' },
          { key: 'Key Ingredient', value: 'Niacinamide (Vitamin B3)' }
        ],
        status: 'active'
      },
      {
        title: 'Laneige Lip Sleeping Mask Berry',
        slug: 'laneige-lip-sleeping-mask-berry',
        description: 'A leave-on lip mask that soothes and moisturizes for smoother, more supple lips overnight. Enriched with vitamin C and antioxidants.',
        shortDescription: 'Overnight hydrating lip treatment mask.',
        price: 1450,
        discountPrice: 1290,
        stock: 35,
        SKU: 'LAN-LIPMASK-20',
        category: catMap['skincare'],
        brand: brandMap['laneige'],
        images: [{ url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80', publicId: 'laneige_lip_mask' }],
        thumbnail: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
        tags: ['lip-balm', 'lip-care', 'laneige', 'mask', 'moisturizer'],
        rating: 4.8,
        reviewCount: 220,
        featured: true,
        trending: true,
        bestSeller: true,
        newArrival: false,
        specifications: [
          { key: 'Volume', value: '20 g' },
          { key: 'Flavor', value: 'Berry' }
        ],
        status: 'active'
      },
      {
        title: 'CeraVe Moisturizing Cream',
        slug: 'cerave-moisturizing-cream',
        description: 'Developed with dermatologists, this rich, non-greasy cream provides 24-hour hydration with three essential ceramides to restore skin protective barrier.',
        shortDescription: 'Rich barrier-repairing moisturizing cream.',
        price: 1250,
        discountPrice: 1099,
        stock: 60,
        SKU: 'CER-MOIST-340',
        category: catMap['skincare'],
        brand: brandMap['cerave'],
        images: [{ url: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80', publicId: 'cerave_cream' }],
        thumbnail: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80',
        tags: ['moisturizer', 'cerave', 'skincare', 'dry-skin', 'ceramides'],
        rating: 4.6,
        reviewCount: 95,
        featured: false,
        trending: false,
        bestSeller: true,
        newArrival: true,
        specifications: [
          { key: 'Weight', value: '340 g' },
          { key: 'Skin Type', value: 'Dry to Very Dry Skin' }
        ],
        status: 'active'
      },

      // ─── MAKEUP ───
      {
        title: 'Fenty Beauty Gloss Bomb Universal Lip Luminizer',
        slug: 'fenty-beauty-gloss-bomb',
        description: 'The ultimate gotta-have-it lip gloss with explosive shine that feels as good as it looks. One swipe gives an instant fuller lip look.',
        shortDescription: 'Universal high-shine moisturizing lip gloss.',
        price: 2100,
        discountPrice: 1899,
        stock: 40,
        SKU: 'FTY-GLSBMB-GLW',
        category: catMap['makeup'],
        brand: brandMap['fentybeauty'],
        images: [{ url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80', publicId: 'fenty_gloss' }],
        thumbnail: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
        tags: ['makeup', 'lip-gloss', 'fenty', 'lipstick', 'shine'],
        rating: 4.7,
        reviewCount: 88,
        featured: true,
        trending: true,
        bestSeller: false,
        newArrival: true,
        specifications: [
          { key: 'Volume', value: '9 ml' },
          { key: 'Shade', value: 'Fenty Glow (Rose Nude)' }
        ],
        status: 'active'
      },
      {
        title: 'Estee Lauder Double Wear Stay-in-Place Foundation',
        slug: 'estee-lauder-double-wear',
        description: 'A 24-hour liquid foundation that looks fresh, natural, and matte through heat, humidity, and nonstop activity. Medium-to-full buildable coverage.',
        shortDescription: 'Flawless 24h matte liquid foundation.',
        price: 4900,
        discountPrice: 4499,
        stock: 25,
        SKU: 'EST-DBLWR-FDN',
        category: catMap['makeup'],
        brand: brandMap['esteelauder'],
        images: [{ url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80', publicId: 'estee_foundation' }],
        thumbnail: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
        tags: ['foundation', 'makeup', 'face', 'estee-lauder', 'matte'],
        rating: 4.8,
        reviewCount: 64,
        featured: true,
        trending: false,
        bestSeller: true,
        newArrival: false,
        specifications: [
          { key: 'Volume', value: '30 ml' },
          { key: 'Finish', value: 'Matte' },
          { key: 'Sun Protection', value: 'SPF 10' }
        ],
        status: 'active'
      },

      // ─── HAIRCARE ───
      {
        title: 'L\'Oreal Professionnel Absolut Repair Oil',
        slug: 'loreal-absolut-repair-oil',
        description: 'A 10-in-1 multi-benefit leave-in hair serum treatment for normal to sensitized hair. Deeply nourishes, repairs, detangles, and adds premium shine.',
        shortDescription: 'Professional 10-in-1 hair repair serum oil.',
        price: 1350,
        discountPrice: 1199,
        stock: 30,
        SKU: 'LOR-ABSRPR-90',
        category: catMap['haircare'],
        brand: brandMap['loreal'],
        images: [{ url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80', publicId: 'loreal_hair_oil' }],
        thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
        tags: ['haircare', 'hair-oil', 'loreal', 'serum', 'shine'],
        rating: 4.5,
        reviewCount: 42,
        featured: false,
        trending: true,
        bestSeller: true,
        newArrival: true,
        specifications: [
          { key: 'Volume', value: '90 ml' },
          { key: 'Hair Type', value: 'Damaged, Dry Hair' }
        ],
        status: 'active'
      },

      // ─── FRAGRANCE ───
      {
        title: 'Chanel Coco Mademoiselle Eau de Parfum',
        slug: 'chanel-coco-mademoiselle',
        description: 'The essence of a bold, free woman. An oriental fragrance with a strong character, yet surprisingly fresh. Elegant notes of orange, patchouli, and rose.',
        shortDescription: 'Elegant signature oriental fresh floral perfume.',
        price: 12500,
        discountPrice: 11900,
        stock: 15,
        SKU: 'CHL-COCOMAD-100',
        category: catMap['fragrance'],
        brand: brandMap['chanel'],
        images: [{ url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80', publicId: 'chanel_mademoiselle' }],
        thumbnail: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80',
        tags: ['perfume', 'luxury', 'chanel', 'fragrance', 'floral'],
        rating: 4.9,
        reviewCount: 52,
        featured: true,
        trending: true,
        bestSeller: true,
        newArrival: false,
        specifications: [
          { key: 'Volume', value: '100 ml' },
          { key: 'Concentration', value: 'Eau de Parfum (EDP)' }
        ],
        status: 'active'
      },

      // ─── BATH & BODY ───
      {
        title: 'Sol de Janeiro Brazilian Bum Bum Cream',
        slug: 'sol-de-janeiro-bum-bum-cream',
        description: 'An award-winning, deliciously scented body cream that visibly tightens and smooths the look of your skin. Infused with caffeine-rich Guaraná.',
        shortDescription: 'Deliciously scented tightening body cream.',
        price: 4500,
        discountPrice: 3999,
        stock: 20,
        SKU: 'SDJ-BUMBUM-240',
        category: catMap['body'],
        brand: brandMap['esteelauder'], // Associated for seed mapping consistency
        images: [{ url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80', publicId: 'bum_bum_cream' }],
        thumbnail: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80',
        tags: ['body-cream', 'moisturizer', 'sol-de-janeiro', 'scented', 'body'],
        rating: 4.8,
        reviewCount: 76,
        featured: false,
        trending: true,
        bestSeller: false,
        newArrival: true,
        specifications: [
          { key: 'Volume', value: '240 ml' },
          { key: 'Scent Family', value: 'Cheirosa 62 (Warm Gourmand)' }
        ],
        status: 'active'
      },

      // ─── WELLNESS ───
      {
        title: 'Forest Essentials Lavender Essential Oil',
        slug: 'forest-essentials-lavender-oil',
        description: 'Pure, organic steam-distilled French Lavender essential oil. Promotes relaxation, soothes stress, and helps achieve sound sleep.',
        shortDescription: 'Pure steam-distilled soothing lavender essential oil.',
        price: 1850,
        discountPrice: 1699,
        stock: 25,
        SKU: 'FE-LAVOIL-15',
        category: catMap['wellness'],
        brand: brandMap['esteelauder'],
        images: [{ url: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80', publicId: 'lavender_oil' }],
        thumbnail: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80',
        tags: ['essential-oil', 'wellness', 'aromatherapy', 'sleep', 'relax'],
        rating: 4.6,
        reviewCount: 38,
        featured: false,
        trending: false,
        bestSeller: false,
        newArrival: true,
        specifications: [
          { key: 'Volume', value: '15 ml' },
          { key: 'Method', value: 'Steam Distilled' }
        ],
        status: 'active'
      },

      // ─── TOOLS & BRUSHES ───
      {
        title: 'Dyson Airwrap Multi-Styler Complete',
        slug: 'dyson-airwrap-complete',
        description: 'Dry, curl, shape, smooth and hide flyaways with no extreme heat. Re-engineered attachments harness Coanda airflow to style hair with ease.',
        shortDescription: 'Next-generation intelligent hair styling multi-styler.',
        price: 49900,
        discountPrice: 45900,
        stock: 8,
        SKU: 'DYS-ARWRP-CMP',
        category: catMap['tools'],
        brand: brandMap['dyson'],
        images: [{ url: 'https://images.unsplash.com/photo-1607602131475-475c477cfb87?auto=format&fit=crop&w=600&q=80', publicId: 'dyson_airwrap' }],
        thumbnail: 'https://images.unsplash.com/photo-1607602131475-475c477cfb87?auto=format&fit=crop&w=600&q=80',
        tags: ['hair-dryer', 'styler', 'dyson', 'hair', 'premium-tool'],
        rating: 4.8,
        reviewCount: 45,
        featured: true,
        trending: true,
        bestSeller: true,
        newArrival: false,
        specifications: [
          { key: 'Power', value: '1300 Watts' },
          { key: 'Heat Settings', value: '3 Precise Temp Settings' },
          { key: 'Weight', value: '660 g' }
        ],
        status: 'active'
      },

      // ─── GIFTS & SETS ───
      {
        title: 'Laneige Glowing Hydration Skincare Trio',
        slug: 'laneige-hydration-trio-set',
        description: 'A beautifully packaged set of Laneige hydrating bestsellers: Lip Sleeping Mask Berry (8g), Water Bank Cream (20ml), and Cream Skin Refiner (50ml).',
        shortDescription: 'Ultimate hydration skincare value gift set.',
        price: 2800,
        discountPrice: 2490,
        stock: 30,
        SKU: 'LAN-HYDSET-3X',
        category: catMap['sets'],
        brand: brandMap['laneige'],
        images: [{ url: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=600&q=80', publicId: 'laneige_glow_set' }],
        thumbnail: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=600&q=80',
        tags: ['skincare-set', 'laneige', 'hydration', 'gift', 'cream-skin'],
        rating: 4.9,
        reviewCount: 30,
        featured: false,
        trending: true,
        bestSeller: false,
        newArrival: true,
        specifications: [
          { key: 'Includes', value: 'Lip Mask (8g), Water Bank (20ml), Refiner (50ml)' },
          { key: 'Benefit', value: 'Deep Hydration & Glow' }
        ],
        status: 'active'
      }
    ];

    const seededProducts = await Product.insertMany(productsList);

    // 5. Seed Coupons
    await Coupon.insertMany([
      {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 500,
        maxDiscountAmount: 200,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 100,
        status: 'active'
      },
      {
        code: 'GLOW500',
        discountType: 'fixed',
        discountValue: 500,
        minOrderAmount: 3000,
        maxDiscountAmount: 500,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 50,
        status: 'active'
      }
    ]);

    // 6. Seed Banners for Hero carousel
    await Banner.insertMany([
      {
        title: 'Unlock Radiant, Healthy Glow',
        subtitle: 'Shop the premium skincare and hydration collection',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80',
        link: '/products?cat=skincare',
        position: 'Hero',
        status: 'active'
      },
      {
        title: 'Flawless Beauty Redefined',
        subtitle: 'Explore inclusive formulas by Fenty Beauty and Estee Lauder',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80',
        link: '/products?cat=makeup',
        position: 'Hero',
        status: 'active'
      },
      {
        title: 'Signature Luxury Fragrance',
        subtitle: 'Discover timeless scents from Chanel and luxury houses',
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=80',
        link: '/products?cat=fragrance',
        position: 'Hero',
        status: 'active'
      }
    ]);

    // 7. Seed single initial review
    await Review.create({
      user: customer._id,
      product: seededProducts[0]._id,
      title: 'Amazing performance!',
      comment: 'My skin cleared up within a week of using it. Highly recommend it to anyone with oily skin and large pores!',
      rating: 5,
      verifiedPurchase: true
    });

    console.log('Database seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
