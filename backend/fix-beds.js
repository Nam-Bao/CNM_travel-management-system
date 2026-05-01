require("dotenv").config();
const mongoose = require("mongoose");
const Tour = require("./src/modules/tours/tour.model");

const generateBeds = (vehicle_type) => {
  const generatedBeds = [];
  if (vehicle_type === "bed") {
    for (let row = 1; row <= 6; row++) {
      if (row <= 3) {
        generatedBeds.push({ code: `D${row}a`, type: "double", isBooked: false });
        generatedBeds.push({ code: `D${row}b`, type: "double", isBooked: false });
      } else {
        generatedBeds.push({ code: `S${row - 3}1`, type: "single", isBooked: false });
        generatedBeds.push({ code: `S${row - 3}2`, type: "single", isBooked: false });
      }
    }
  } else {
    for (let i = 1; i <= 29; i++) {
      generatedBeds.push({ code: `A${i}`, type: "single", isBooked: false });
    }
  }
  return generatedBeds;
};

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/travel-management")
  .then(async () => {
    console.log("Connected to DB, checking tours...");
    const tours = await Tour.find();
    let updatedCount = 0;
    
    for (let tour of tours) {
      if (!tour.beds || tour.beds.length === 0) {
        await Tour.updateOne({ _id: tour._id }, { $set: { beds: generateBeds(tour.vehicle_type || "seat") } });
        updatedCount++;
        console.log(`Updated beds for tour: ${tour.title}`);
      }
    }
    console.log(`Finished! Updated ${updatedCount} tours.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
