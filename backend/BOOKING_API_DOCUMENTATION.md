# Tour Booking API Documentation

## Logic Tổng Quan

### 1. Tour Types (Loại Tour)
- **domestic**: Tour trong nước - **PHẢI** chọn giường/ghế
- **international**: Tour nước ngoài - **KHÔNG** cần chọn giường/ghế

### 2. Vehicle Types (Loại Xe) - Chỉ dùng cho Domestic Tours
- **bed**: Xe giường nằm
  - 24 giường: 6 giường đôi (D1a, D1b, D2a, D2b, D3a, D3b) + 4 giường đơn (S1, S2, S3, S4)
  - Giường đôi tính phí thêm: `couple_bed_price` VND
  - Giường đơn: MIỄN PHÍ

- **seat**: Xe ghế ngồi
  - 29 ghế: A1, A2, ..., A29
  - Không tính phí thêm

### 3. Ví Dụ Cấu Trúc Tour

```json
{
  "_id": "ObjectId",
  "title": "Tour Hà Nội - Sapa 3 ngày",
  "tour_type": "domestic",
  "vehicle_type": "bed",
  "couple_bed_price": 200000,
  "max_seats": 24,
  "available_seats": 18,
  "beds": [
    { "code": "D1a", "type": "double", "isBooked": false },
    { "code": "D1b", "type": "double", "isBooked": false },
    { "code": "D2a", "type": "double", "isBooked": true },
    { "code": "D2b", "type": "double", "isBooked": false },
    { "code": "D3a", "type": "double", "isBooked": false },
    { "code": "D3b", "type": "double", "isBooked": false },
    { "code": "S1", "type": "single", "isBooked": false },
    { "code": "S2", "type": "single", "isBooked": true },
    { "code": "S3", "type": "single", "isBooked": false },
    { "code": "S4", "type": "single", "isBooked": false }
  ],
  "price": {
    "adult": 5000000,
    "child": 3000000,
    "infant": 0
  }
}
```

---

## API Endpoints

### 1. GET /api/tours/:id - Lấy Chi Tiết Tour

**Response**: Trả về tour object như ví dụ trên

**Frontend Use Case**:
```javascript
// Khi khách vào trang chi tiết tour
const tourDetails = await fetch(`/api/tours/${tourId}`).then(r => r.json());

// Hiển thị danh sách giường/ghế
const availableSeats = tourDetails.data.beds.filter(b => !b.isBooked);
```

---

### 2. POST /api/bookings - Tạo Booking

#### Request Body:

```json
{
  "tourId": "ObjectId",
  "guest_size": {
    "adult": 2,
    "child": 1,
    "infant": 0
  },
  "selected_beds": ["D1a", "D1b", "S1"],
  "contact_info": {
    "full_name": "Nguyễn Văn A",
    "phone": "0987654321",
    "email": "user@example.com"
  },
  "hotel_addon": {
    "hotel_id": "hotel123",
    "hotel_name": "Hotel Name",
    "price_per_night": 1000000
  },
  "userId": "ObjectId"
}
```

#### Logic Chi Tiết:

**Nếu tour_type = "domestic"**:
1. Kiểm tra: `selected_beds.length === totalGuests` (adult + child + infant)
   - ❌ Lỗi nếu không đủ
2. Kiểm tra mỗi ghế:
   - Phải tồn tại trong tour
   - Chưa bị `isBooked = true`
3. Tính phí giường đôi:
   ```
   doubleBedsCount = selected_beds.filter(code => bed.type === "double").length
   couple_price = doubleBedsCount × couple_bed_price
   ```
4. Tính tổng tiền:
   ```
   base_total = (adult × adult_price) 
              + (child × child_price) 
              + (infant × infant_price) 
              + couple_price 
              + (hotel_addon?.price_per_night || 0)
   
   total_price = base_total × (1 - sale_percentage / 100)
   ```

**Nếu tour_type = "international"**:
1. **Bỏ qua** `selected_beds` hoàn toàn
2. Chỉ kiểm tra: `available_seats >= totalGuests`
3. Tính giá: Không có couple_price
   ```
   base_total = (adult × adult_price) 
              + (child × child_price) 
              + (infant × infant_price) 
              + (hotel_addon?.price_per_night || 0)
   ```

#### Response (Success):
```json
{
  "success": true,
  "message": "🎉 Đặt tour thành công!",
  "data": {
    "_id": "ObjectId",
    "user": "ObjectId",
    "tour": "ObjectId",
    "guest_size": { "adult": 2, "child": 1, "infant": 0 },
    "selected_beds": ["D1a", "D1b", "S1"],
    "couple_beds": ["D1a", "D1b"],
    "couple_price": 400000,
    "total_price": 16400000,
    "status": "pending",
    "createdAt": "2024-05-01T10:30:00Z"
  }
}
```

#### Response (Error Examples):
```json
// Chọn ghế không đủ (domestic)
{
  "message": "Vui lòng chọn đủ 3 vị trí giường/ghế."
}

// Ghế không tồn tại
{
  "message": "Ghế không tồn tại: D5a, D5b"
}

// Ghế đã bị đặt
{
  "message": "Ghế đã bị đặt: D2a, S2"
}

// Tour hết chỗ
{
  "message": "Tour quốc tế đã hết chỗ!"
}
```

---

### 3. GET /api/bookings/:id - Lấy Chi Tiết Booking
- Được sử dụng để hiển thị thông tin booking
- Trả về booking object đầy đủ

---

### 4. DELETE /api/bookings/:id - Hủy Booking & Hoàn Chỗ

**Logic**:
1. Kiểm tra booking tồn tại + chưa hủy
2. Hoàn `available_seats` của tour
3. Nếu có `selected_beds`, reset `isBooked = false` cho mỗi ghế
4. Set booking status = "CANCELED"

**Response (Success)**:
```json
{
  "message": "Đã hủy thành công và hoàn trả vị trí chỗ ngồi."
}
```

---

## Frontend Implementation Examples

### Hiển thị danh sách ghế/giường

```javascript
const getTourSeats = async (tourId) => {
  const tour = await fetch(`/api/tours/${tourId}`).then(r => r.json());
  
  if (tour.data.tour_type === "international") {
    return { hasSeats: false };
  }
  
  return {
    hasSeats: true,
    vehicleType: tour.data.vehicle_type,
    seats: tour.data.beds,
    availableSeats: tour.data.beds.filter(b => !b.isBooked),
    coupleBedPrice: tour.data.couple_bed_price || 0
  };
};
```

### Xử lý lựa chọn ghế

```javascript
const handleSeatSelection = (selectedBeds, guestSize) => {
  const totalGuests = guestSize.adult + guestSize.child + guestSize.infant;
  
  if (selectedBeds.length !== totalGuests) {
    return {
      valid: false,
      message: `Chọn ${totalGuests - selectedBeds.length} chỗ còn lại`
    };
  }
  
  return { valid: true };
};
```

### Tính giá tiền

```javascript
const calculatePrice = (tour, selectedBeds, guestSize, hotelPrice = 0) => {
  const { adult, child, infant } = guestSize;
  
  // Base prices
  const adultPrice = (tour.price.adult || 0) * adult;
  const childPrice = (tour.price.child || 0) * child;
  const infantPrice = (tour.price.infant || 0) * infant;
  
  // Couple bed price (domestic bed tours only)
  let couplePrice = 0;
  if (tour.tour_type === "domestic" && tour.vehicle_type === "bed") {
    const doubleBedCount = selectedBeds.filter(code => {
      const bed = tour.beds.find(b => b.code === code);
      return bed?.type === "double";
    }).length;
    couplePrice = doubleBedCount * (tour.couple_bed_price || 0);
  }
  
  // Total before discount
  const baseTotal = adultPrice + childPrice + infantPrice + couplePrice + hotelPrice;
  
  // Apply discount
  const discount = tour.sale_percentage || 0;
  const finalPrice = baseTotal * (1 - discount / 100);
  
  return {
    adultPrice,
    childPrice,
    infantPrice,
    couplePrice,
    hotelPrice,
    baseTotal,
    discount,
    finalPrice
  };
};
```

---

## Summary

| Tiêu Chí | Domestic Bed | Domestic Seat | International |
|----------|-------------|--------------|--------------|
| Chọn ghế/giường | ✅ BẮT BUỘC | ✅ BẮT BUỘC | ❌ KHÔNG CẦN |
| Số lượng | 24 (6 đôi + 4 đơn) | 29 | - |
| Phí giường đôi | ✅ Có | ❌ Không | - |
| Kiểm tra sự cố | Ghế tồn tại, chưa đặt | Ghế tồn tại, chưa đặt | Chỉ kiểm tra tổng chỗ |

