import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Testimonial from './models/Testimonial.js';

dotenv.config();

// Sample testimonials data
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
    },
    {
        name: "David Thompson",
        email: "david@example.com",
        rating: 5,
        message: "Amazing anniversary cake! The attention to detail was incredible. It exceeded our expectations in every way.",
        occasion: "Anniversary",
        isApproved: true,
        featured: true
    },
    {
        name: "Jessica Martinez",
        email: "jessica@example.com",
        rating: 5,
        message: "Best chocolate cake I've ever had! Moist, rich, and perfectly balanced. Can't wait to order again for our next celebration.",
        occasion: "Birthday",
        isApproved: true,
        featured: false
    }
];

const initializeTestimonials = async () => {
    try {
        // Connect to MongoDB
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Check existing testimonials
        const existingCount = await Testimonial.countDocuments();
        console.log(`\n📊 Current testimonials in database: ${existingCount}`);

        if (existingCount > 0) {
            console.log('\n⚠️  Database already contains testimonials.');
            console.log('Do you want to:');
            console.log('1. Keep existing and add new ones (if not duplicates)');
            console.log('2. Skip initialization');
            console.log('\nProceeding with option 1: Adding non-duplicate testimonials...\n');
        }

        let addedCount = 0;
        let skippedCount = 0;

        for (const testimonialData of sampleTestimonials) {
            // Check if testimonial with same email already exists
            const exists = await Testimonial.findOne({ email: testimonialData.email });

            if (exists) {
                console.log(`⏭️  Skipped: ${testimonialData.name} (already exists)`);
                skippedCount++;
            } else {
                await Testimonial.create(testimonialData);
                console.log(`✅ Added: ${testimonialData.name}`);
                addedCount++;
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('✨ Testimonial Initialization Complete!');
        console.log('='.repeat(50));
        console.log(`📊 Added: ${addedCount} testimonials`);
        console.log(`⏭️  Skipped: ${skippedCount} testimonials (duplicates)`);
        console.log(`📈 Total testimonials in database: ${await Testimonial.countDocuments()}`);
        console.log(`👍 Approved testimonials: ${await Testimonial.countDocuments({ isApproved: true })}`);
        console.log('\n🌐 Your testimonials should now be visible on your website!');
        console.log(`🔗 Check: ${process.env.CLIENT_URL || 'your website'}`);
        console.log('='.repeat(50) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error initializing testimonials:', error);
        process.exit(1);
    }
};

initializeTestimonials();
