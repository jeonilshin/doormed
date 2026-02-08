# Rider Registration & Testing Guide

## 🚴 How to Register Riders

### Step 1: Go to Rider Signup Page
Navigate to: `http://localhost:3000/rider/signup`

### Step 2: Fill in Rider Information
**Required Fields:**
- First Name
- Last Name
- Email (must be unique)
- Phone Number (e.g., +63 XXX XXX XXXX)
- Password (minimum 6 characters)
- Vehicle Type (Motorcycle, Car, or Bicycle)
- Vehicle Plate Number (e.g., ABC 1234)
- Driver's License Number (e.g., N01-12-345678)

### Step 3: Submit Registration
- Click "Register as Rider"
- Account is automatically approved (status: active)
- Redirect to login page

### Step 4: Login as Rider
- Go to: `http://localhost:3000/rider/login`
- Enter email and password
- Access rider dashboard

---

## 🧪 Testing with 2 Riders

### Create Two Rider Accounts:

**Rider 1:**
- Email: `rider1@test.com`
- Password: `password123`
- Name: John Doe
- Phone: +63 912 345 6789
- Vehicle: Motorcycle
- Plate: ABC 1234

**Rider 2:**
- Email: `rider2@test.com`
- Password: `password123`
- Name: Jane Smith
- Phone: +63 923 456 7890
- Vehicle: Car
- Plate: XYZ 5678

---

## 🔄 New Workflow: First-Come-First-Served

### How It Works:

1. **Admin marks order as "Ready"**
   - Order status changes to `ready`
   - Order appears in ALL riders' dashboards
   - Shows as "Available Orders" in stats

2. **Riders see available orders**
   - Auto-refreshes every 10 seconds
   - Blue "Claim This Order" button appears
   - Shows customer info and delivery address

3. **First rider to claim gets the order**
   - Rider clicks "Claim This Order"
   - Order is assigned to that rider
   - Status changes to `rider_received`
   - Customer receives notification with rider name
   - Order disappears from other riders' dashboards

4. **If another rider tries to claim**
   - Gets error: "Order is no longer available"
   - Order already claimed by someone else

5. **Claimed rider continues workflow**
   - Confirm Pickup → Out for Delivery
   - Upload Delivery Photo → Pending Confirmation
   - Admin Confirms → Delivered

---

## 📊 Rider Dashboard Stats

**Available Orders** (Blue)
- Orders with status `ready`
- Not assigned to any rider yet
- Any rider can claim

**My Orders** (Cyan)
- Orders assigned to this rider
- Status: `rider_received`
- Ready to pick up

**Out for Delivery** (Orange)
- Orders this rider is currently delivering
- Status: `out_for_delivery`

**Pending Confirmation** (Amber)
- Orders waiting for admin to confirm delivery
- Status: `pending_confirmation`
- Delivery photo uploaded

---

## 🎯 Testing Scenario

### Test the First-Come-First-Served System:

1. **Login as Admin**
   - Create an order or use existing order
   - Mark order as "Ready"

2. **Open Two Browser Windows**
   - Window 1: Login as Rider 1
   - Window 2: Login as Rider 2

3. **Both riders see the order**
   - Both dashboards show "Available Orders: 1"
   - Both see the same order with "Claim This Order" button

4. **Rider 1 claims the order**
   - Click "Claim This Order"
   - Alert: "Order claimed successfully!"
   - Order moves to "My Orders"
   - Customer receives notification

5. **Rider 2's view updates**
   - Within 10 seconds, order disappears
   - "Available Orders" count decreases
   - If Rider 2 tries to claim: Error message

6. **Rider 1 completes delivery**
   - Confirm Pickup
   - Mark as Delivered (upload photo)
   - Admin confirms delivery

---

## 🔧 Admin Changes

### Removed Manual Assignment
- No more rider dropdown in admin
- Admin only marks order as "Ready"
- Riders claim orders themselves
- First-come-first-served system

### Admin Still Can:
- View which rider claimed the order
- See rider information in order details
- Confirm delivery after photo upload
- Archive/delete orders

---

## 🚀 Benefits of New System

1. **Faster Response**
   - Riders can claim orders immediately
   - No waiting for admin to assign

2. **Fair Distribution**
   - First rider to respond gets the order
   - Encourages quick response times

3. **Rider Autonomy**
   - Riders choose which orders to take
   - Can see order details before claiming

4. **Reduced Admin Work**
   - No manual rider assignment needed
   - Admin just marks "ready"

---

## 📱 Mobile Testing

The rider dashboard works great on mobile:
- Responsive design
- Touch-friendly buttons
- Camera integration for delivery photos
- Real-time updates

Test on mobile by:
1. Access `http://YOUR_IP:3000/rider/login` on phone
2. Login as rider
3. See available orders
4. Claim and deliver

---

## 🔐 Security Features

- JWT authentication for riders
- Separate rider token (not admin token)
- Order claiming race condition handled
- Only one rider can claim each order
- Rider can only see their own claimed orders

---

## 📝 Quick Commands

**Register Rider 1:**
```
Navigate to: http://localhost:3000/rider/signup
Fill form and submit
```

**Register Rider 2:**
```
Navigate to: http://localhost:3000/rider/signup
Use different email
Fill form and submit
```

**Login as Rider:**
```
Navigate to: http://localhost:3000/rider/login
Enter credentials
```

**Test Claiming:**
```
1. Admin marks order as ready
2. Both riders see it (refresh if needed)
3. First to click "Claim" gets it
4. Other rider sees it disappear
```

---

**Ready to test!** 🎉

Register your two riders and start testing the first-come-first-served delivery system!
