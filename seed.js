import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Portfolio from './models/Portfolio.js';
import Testimonial from './models/Testimonial.js';

dotenv.config();

// Sample data
const samplePortfolio = [
  {
    title: "Elegant Wedding Cake",
    description: "A stunning three-tier wedding cake with delicate floral decorations and smooth buttercream finish. Perfect for your special day.",
    category: "Wedding Cakes",
    price: 450,
    images: [
      { url: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800", alt: "Wedding Cake" }
    ],
    tags: ["wedding", "elegant", "floral", "buttercream"],
    featured: true,
    servings: "80-100 servings",
    preparationTime: "5-7 days",
    isActive: true
  },
  {
    title: "Rainbow Birthday Cake",
    description: "Colorful rainbow layers with vanilla buttercream frosting. A delightful treat that brings joy to any celebration.",
    category: "Birthday Cakes",
    price: 85,
    images: [
      { url: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800", alt: "Birthday Cake" }
    ],
    tags: ["birthday", "rainbow", "colorful", "vanilla"],
    featured: true,
    servings: "12-15 servings",
    preparationTime: "2-3 days",
    isActive: true
  },
  {
    title: "Gourmet Cupcake Collection",
    description: "Assorted flavors including chocolate, vanilla, red velvet, and lemon. Beautifully decorated with premium toppings.",
    category: "Cupcakes",
    price: 45,
    images: [
      { url: "https://images.unsplash.com/photo-1426869884541-df7117556757?w=800", alt: "Cupcakes" }
    ],
    tags: ["cupcakes", "assorted", "gourmet", "party"],
    featured: false,
    servings: "12 cupcakes",
    preparationTime: "1-2 days",
    isActive: true
  },
  {
    title: "Chocolate Ganache Delight",
    description: "Rich chocolate cake layers with smooth chocolate ganache and fresh berries. A chocolate lover's dream.",
    category: "Custom Cakes",
    price: 120,
    images: [
      { url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800", alt: "Chocolate Cake" }
    ],
    tags: ["chocolate", "ganache", "berries", "luxury"],
    featured: true,
    servings: "20-25 servings",
    preparationTime: "3-4 days",
    isActive: true
  }
];

const sampleTestimonials = [
  {
    name: "Sarah Johnson",
    email: "sarah@example.com",
    rating: 5,
    message: "The wedding cake was absolutely stunning! Not only did it look beautiful, but it tasted incredible. All our guests were raving about it. Thank you for making our day so special!",
    occasion: "Wedding",
    isApproved: true,
    featured: true
  },
  {
    name: "Michael Chen",
    email: "michael@example.com",
    rating: 5,
    message: "Ordered a custom birthday cake for my daughter's 5th birthday. She was thrilled with the design and everyone loved the taste. Highly recommend!",
    occasion: "Birthday",
    isApproved: true,
    featured: true
  },
  {
    name: "Emily Rodriguez",
    email: "emily@example.com",
    rating: 5,
    message: "The cupcakes for our corporate event were a huge hit! Professional service, timely delivery, and delicious treats. Will definitely order again.",
    occasion: "Corporate Event",
    isApproved: true,
    featured: false
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await User.deleteMany();
    await Portfolio.deleteMany();
    await Testimonial.deleteMany();

    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@cakebaker.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin'
    });
    console.log(`✅ Admin user created: ${adminUser.email}`);

    console.log('🍰 Creating sample portfolio items...');
    const portfolioItems = await Portfolio.insertMany(samplePortfolio);
    console.log(`✅ Created ${portfolioItems.length} portfolio items`);

    console.log('💬 Creating sample testimonials...');
    const testimonials = await Testimonial.insertMany(sampleTestimonials);
    console.log(`✅ Created ${testimonials.length} testimonials`);

    console.log('\n✨ Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log('\n⚠️  Please change the password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
