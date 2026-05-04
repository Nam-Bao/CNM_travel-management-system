// QUICK REFERENCE: Frontend Integration Guide

// ============================================
// 1. FETCH TOUR DETAILS
// ============================================
async function fetchTourDetails(tourId) {
    const res = await fetch(`/api/tours/${tourId}`);
    const tour = await res.json();
    return tour.data;
}

// ============================================
// 2. DETERMINE IF SEATS ARE REQUIRED
// ============================================
function needsSeating(tour) {
    return tour.tour_type === "domestic";
}

// ============================================
// 3. GET AVAILABLE SEATS
// ============================================
function getAvailableSeats(tour) {
    if (tour.tour_type === "international") {
        return { available: tour.available_seats, seats: [] };
    }

    const seats = tour.beds.filter(b => !b.isBooked);
    return {
        available: seats.length,
        seats,
        vehicleType: tour.vehicle_type,
        coupleBedPrice: tour.couple_bed_price || 0
    };
}

// ============================================
// 4. DISPLAY SEATS (BED TOUR)
// ============================================
function displayBedTour(tour) {
    const doubleBeds = tour.beds.filter(b => b.type === "double");
    const singleBeds = tour.beds.filter(b => b.type === "single");

    console.log("DOUBLE BEDS (Couple fee: " + tour.couple_bed_price + "VND):");
    doubleBeds.forEach(b => {
        console.log(`  ${b.code} - ${b.isBooked ? "BOOKED" : "AVAILABLE"}`);
    });

    console.log("\nSINGLE BEDS (Free):");
    singleBeds.forEach(b => {
        console.log(`  ${b.code} - ${b.isBooked ? "BOOKED" : "AVAILABLE"}`);
    });
}

// ============================================
// 5. DISPLAY SEATS (SEAT TOUR)
// ============================================
function displaySeatTour(tour) {
    console.log("SEATS:");
    for (let i = 1; i <= tour.beds.length; i++) {
        const bed = tour.beds[i - 1];
        console.log(`  A${i} - ${bed.isBooked ? "BOOKED" : "AVAILABLE"}`);
    }
}

// ============================================
// 6. VALIDATE SEAT SELECTION
// ============================================
function validateSeatSelection(tour, selectedSeats, totalGuests) {
    // Check count
    if (selectedSeats.length !== totalGuests) {
        return {
            valid: false,
            error: `Vui lòng chọn ${totalGuests - selectedSeats.length} chỗ còn lại`
        };
    }

    // Check all seats exist
    const invalidSeats = selectedSeats.filter(
        code => !tour.beds.find(b => b.code === code)
    );
    if (invalidSeats.length > 0) {
        return {
            valid: false,
            error: `Ghế không tồn tại: ${invalidSeats.join(", ")}`
        };
    }

    // Check no booked seats
    const bookedSeats = selectedSeats.filter(
        code => tour.beds.find(b => b.code === code && b.isBooked)
    );
    if (bookedSeats.length > 0) {
        return {
            valid: false,
            error: `Ghế đã bị đặt: ${bookedSeats.join(", ")}`
        };
    }

    return { valid: true };
}

// ============================================
// 7. CALCULATE PRICE
// ============================================
function calculatePrice(tour, selectedSeats, guestSize, hotelAddonPrice = 0) {
    const { adult, child, infant } = guestSize;

    // Base prices
    const adultPrice = (tour.price.adult || 0) * adult;
    const childPrice = (tour.price.child || 0) * child;
    const infantPrice = (tour.price.infant || 0) * infant;

    // Couple bed price (only for domestic bed tours)
    let couplePrice = 0;
    if (tour.tour_type === "domestic" && tour.vehicle_type === "bed" && tour.couple_bed_price) {
        const doubleBedCount = selectedSeats.filter(code => {
            const bed = tour.beds.find(b => b.code === code);
            return bed ? .type === "double";
        }).length;
        couplePrice = doubleBedCount * tour.couple_bed_price;
    }

    // Total before discount
    const baseTotal = adultPrice + childPrice + infantPrice + couplePrice + hotelAddonPrice;

    // Apply discount
    const discount = tour.sale_percentage || 0;
    const finalPrice = baseTotal * (1 - discount / 100);

    return {
        adultPrice: { value: adultPrice, count: adult },
        childPrice: { value: childPrice, count: child },
        infantPrice: { value: infantPrice, count: infant },
        couplePrice: { value: couplePrice, count: couplePrice > 0 ? 1 : 0 },
        hotelAddonPrice,
        subtotal: baseTotal,
        discountPercent: discount,
        discountAmount: baseTotal - finalPrice,
        total: finalPrice
    };
}

// ============================================
// 8. CREATE BOOKING REQUEST
// ============================================
async function createBooking(tourId, guestSize, selectedSeats, contactInfo, userId, hotelAddon = null) {
    const body = {
        tourId,
        guest_size: guestSize,
        selected_beds: selectedSeats || [], // Empty for international tours
        contact_info: contactInfo,
        hotel_addon: hotelAddon,
        userId
    };

    const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    const result = await res.json();

    if (!res.ok) {
        return { success: false, error: result.message };
    }

    return { success: true, data: result.data };
}

// ============================================
// 9. EXAMPLE: COMPLETE BOOKING FLOW
// ============================================
async function bookTourFlow() {
    try {
        // 1. Get tour details
        const tour = await fetchTourDetails("tour-id-here");

        // 2. Check if seats needed
        if (needsSeating(tour)) {
            // 3. Show available seats
            const { available, seats } = getAvailableSeats(tour);
            console.log(`Available seats: ${available}`);

            // Display seats based on vehicle type
            if (tour.vehicle_type === "bed") {
                displayBedTour(tour);
            } else {
                displaySeatTour(tour);
            }
        }

        // 4. Guest selects seats and fills form
        const guestSize = { adult: 2, child: 1, infant: 0 };
        const selectedSeats = ["D1a", "D1b", "S1"]; // Or empty for international
        const contactInfo = {
            full_name: "Nguyễn Văn A",
            phone: "0987654321",
            email: "user@example.com"
        };

        // 5. Validate selection
        const validation = validateSeatSelection(tour, selectedSeats,
            guestSize.adult + guestSize.child + guestSize.infant);
        if (!validation.valid) {
            console.error(validation.error);
            return;
        }

        // 6. Calculate final price
        const pricing = calculatePrice(tour, selectedSeats, guestSize, 0);
        console.log(`Final price: ${pricing.total.toLocaleString()} VND`);

        // 7. Submit booking
        const booking = await createBooking(
            tour._id,
            guestSize,
            selectedSeats,
            contactInfo,
            "user-id-here"
        );

        if (booking.success) {
            console.log("✅ Booking successful!");
            console.log("Booking ID:", booking.data._id);
        } else {
            console.error("❌ Booking failed:", booking.error);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

// ============================================
// 10. EXAMPLE: PRICE DISPLAY
// ============================================
function displayPriceBreakdown(pricing) {
    console.log("=== PRICE BREAKDOWN ===");
    console.log(`Adults (${pricing.adultPrice.count}): ${pricing.adultPrice.value.toLocaleString()} VND`);
    console.log(`Children (${pricing.childPrice.count}): ${pricing.childPrice.value.toLocaleString()} VND`);
    console.log(`Infants (${pricing.infantPrice.count}): ${pricing.infantPrice.value.toLocaleString()} VND`);

    if (pricing.couplePrice.value > 0) {
        console.log(`Double bed fees: ${pricing.couplePrice.value.toLocaleString()} VND`);
    }

    if (pricing.hotelAddonPrice > 0) {
        console.log(`Hotel addon: ${pricing.hotelAddonPrice.toLocaleString()} VND`);
    }

    console.log(`---`);
    console.log(`Subtotal: ${pricing.subtotal.toLocaleString()} VND`);

    if (pricing.discountPercent > 0) {
        console.log(`Discount (${pricing.discountPercent}%): -${pricing.discountAmount.toLocaleString()} VND`);
    }

    console.log(`====================`);
    console.log(`TOTAL: ${pricing.total.toLocaleString()} VND`);
}

// Export for use in React/Vue components
module.exports = {
    fetchTourDetails,
    needsSeating,
    getAvailableSeats,
    displayBedTour,
    displaySeatTour,
    validateSeatSelection,
    calculatePrice,
    createBooking,
    displayPriceBreakdown
};