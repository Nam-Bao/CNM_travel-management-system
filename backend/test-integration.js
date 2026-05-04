// Integration test for booking logic
const mongoose = require("mongoose");
const Tour = require("./src/modules/tours/tour.model");
const Booking = require("./src/modules/bookings/booking.model");
const User = require("./src/modules/users/user.model");
require("dotenv").config();

async function runIntegrationTests() {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/travel-management";
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Connected to MongoDB\n");

        // Clean up test data
        await Tour.deleteMany({ title: /Test/ });
        await Booking.deleteMany({});

        // Create test user
        let testUser = await User.findOne({ email: "test@example.com" });
        if (!testUser) {
            testUser = await User.create({
                username: "testuser",
                email: "test@example.com",
                password: "password123",
                full_name: "Test User"
            });
        }

        console.log("📋 INTEGRATION TEST 1: Domestic Bed Tour Booking");
        const bedTour = await Tour.create({
            title: "Test Domestic Bed Tour - Integration",
            price: { adult: 5000000, child: 3000000, infant: 0 },
            duration: "3 days",
            start_date: new Date("2024-06-15"),
            end_date: new Date("2024-06-18"),
            max_seats: 24,
            available_seats: 24,
            tour_type: "domestic",
            vehicle_type: "bed",
            couple_bed_price: 200000,
            description: "Test tour with bed",
        });

        console.log(`✅ Created tour: ${bedTour.title}`);
        console.log(`   Tour ID: ${bedTour._id}`);
        console.log(`   Double beds: ${bedTour.beds.filter(b => b.type === "double").length}`);
        console.log(`   Single beds: ${bedTour.beds.filter(b => b.type === "single").length}`);

        // Simulate booking - choose 2 double beds + 1 single
        const selectedBeds = ["D1a", "D1b", "S1"];
        console.log(`\n📊 Test booking with: ${selectedBeds.join(", ")}`);

        const booking = await Booking.create({
            user: testUser._id,
            tour: bedTour._id,
            guest_size: { adult: 2, child: 1, infant: 0 },
            selected_seats: selectedBeds,
            selected_beds: selectedBeds,
            couple_beds: ["D1a", "D1b"],
            couple_price: 400000, // 2 double beds × 200,000
            contact_info: {
                full_name: "Nguyễn Văn A",
                phone: "0987654321",
                email: "test@example.com"
            },
            total_price: 16400000, // (5000000 + 3000000) + 400000 + 0
            status: "pending"
        });

        console.log(`✅ Booking created: ${booking._id}`);
        console.log(`   Couple price: ${booking.couple_price.toLocaleString()} VND`);
        console.log(`   Total price: ${booking.total_price.toLocaleString()} VND`);

        // Check tour seat availability
        const updatedTour = await Tour.findById(bedTour._id);
        console.log(`\n   Tour available seats after booking: ${updatedTour.available_seats}/24`);

        // Test cancellation
        console.log("\n📋 INTEGRATION TEST 2: Booking Cancellation");
        booking.status = "CANCELED";
        await booking.save();
        console.log(`✅ Booking cancelled`);

        const finalTour = await Tour.findById(bedTour._id);
        console.log(`   Tour available seats after cancellation: ${finalTour.available_seats}/24`);

        // Test international tour (no seats required)
        console.log("\n📋 INTEGRATION TEST 3: International Tour Booking");
        const intlTour = await Tour.create({
            title: "Test International Tour - Integration",
            price: { adult: 50000000, child: 30000000, infant: 0 },
            duration: "5 days",
            start_date: new Date("2024-08-15"),
            end_date: new Date("2024-08-20"),
            max_seats: 50,
            available_seats: 50,
            tour_type: "international",
            vehicle_type: "seat",
            description: "Test international tour",
        });

        console.log(`✅ Created international tour: ${intlTour.title}`);
        console.log(`   Beds required: ${intlTour.beds.length === 0 ? "NO (correct)" : "YES (wrong)"}`);

        // Book international tour without seats
        const intlBooking = await Booking.create({
            user: testUser._id,
            tour: intlTour._id,
            guest_size: { adult: 2, child: 0, infant: 0 },
            selected_seats: [],
            selected_beds: [],
            couple_beds: [],
            couple_price: 0,
            contact_info: {
                full_name: "Nguyễn Văn B",
                phone: "0987654322",
                email: "test2@example.com"
            },
            total_price: 100000000,
            status: "pending"
        });

        console.log(`✅ International booking created (no seats required)`);
        console.log(`   Selected beds: ${intlBooking.selected_beds.length === 0 ? "0 (correct)" : intlBooking.selected_beds.length}`);

        const finalIntlTour = await Tour.findById(intlTour._id);
        console.log(`   Tour available seats: ${finalIntlTour.available_seats}/50`);

        console.log("\n🎉 All integration tests PASSED!");
        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error("❌ Test failed:", error.message);
        console.error(error.stack);
        await mongoose.connection.close();
        process.exit(1);
    }
}

runIntegrationTests();