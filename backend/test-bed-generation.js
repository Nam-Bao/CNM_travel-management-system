// Test script for bed generation logic
const mongoose = require("mongoose");
const Tour = require("./src/modules/tours/tour.model");

async function testBedGeneration() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/travel-management";
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("✅ Connected to MongoDB\n");

        // Test 1: Create domestic bed tour
        console.log("📋 TEST 1: Creating domestic BED tour...");
        const domesticBedTour = await Tour.create({
            title: "Test Domestic Bed Tour",
            price: { adult: 5000000, child: 3000000, infant: 0 },
            duration: "3 days",
            start_date: new Date("2024-06-15"),
            end_date: new Date("2024-06-18"),
            max_seats: 24,
            available_seats: 24,
            tour_type: "domestic",
            vehicle_type: "bed",
            couple_bed_price: 200000,
            description: "Test tour with bed vehicle",
        });

        console.log("Bed codes:", domesticBedTour.beds.map(b => b.code).join(", "));
        console.log("Double beds:", domesticBedTour.beds.filter(b => b.type === "double").map(b => b.code).join(", "));
        console.log("Single beds:", domesticBedTour.beds.filter(b => b.type === "single").map(b => b.code).join(", "));

        // Verify structure
        const doubleBeds = domesticBedTour.beds.filter(b => b.type === "double");
        const singleBeds = domesticBedTour.beds.filter(b => b.type === "single");

        if (doubleBeds.length === 6 && singleBeds.length === 4) {
            console.log("✅ Bed generation is CORRECT (6 double + 4 single = 10 total)\n");
        } else {
            console.log(`❌ Bed generation WRONG (got ${doubleBeds.length} double + ${singleBeds.length} single)\n`);
        }

        // Test 2: Create domestic seat tour
        console.log("📋 TEST 2: Creating domestic SEAT tour...");
        const domesticSeatTour = await Tour.create({
            title: "Test Domestic Seat Tour",
            price: { adult: 2500000, child: 1500000, infant: 0 },
            duration: "2 days",
            start_date: new Date("2024-07-01"),
            end_date: new Date("2024-07-03"),
            max_seats: 29,
            available_seats: 29,
            tour_type: "domestic",
            vehicle_type: "seat",
            description: "Test tour with seat vehicle",
        });

        console.log("Seat codes:", domesticSeatTour.beds.map(b => b.code).join(", "));
        const seatCount = domesticSeatTour.beds.length;

        if (seatCount === 29) {
            console.log("✅ Seat generation is CORRECT (29 seats)\n");
        } else {
            console.log(`❌ Seat generation WRONG (got ${seatCount} seats)\n`);
        }

        // Test 3: Create international tour
        console.log("📋 TEST 3: Creating INTERNATIONAL tour...");
        const internationalTour = await Tour.create({
            title: "Test International Tour",
            price: { adult: 50000000, child: 30000000, infant: 0 },
            duration: "5 days",
            start_date: new Date("2024-08-15"),
            end_date: new Date("2024-08-20"),
            max_seats: 100,
            available_seats: 100,
            tour_type: "international",
            vehicle_type: "seat",
            description: "Test international tour",
        });

        console.log("International tour beds:", internationalTour.beds.length);
        if (internationalTour.beds.length === 0) {
            console.log("✅ International tour has NO beds (correct)\n");
        } else {
            console.log(`⚠️ International tour has ${internationalTour.beds.length} beds\n`);
        }

        console.log("🎉 All tests completed!");
        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error("❌ Error:", error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
}

testBedGeneration();