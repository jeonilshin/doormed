# Complete Order Workflow Guide

## 📋 Order Status Flow

```
pending → confirmed → preparing → ready → rider_received → 
out_for_delivery → pending_confirmation → delivered
```

---

## 👥 Who Sees What

### Customer View
**Pages with Auto-Refresh (10 seconds):**
- Dashboard (`/dashboard`)
- Deliveries (`/dashboard/deliveries`)

**What They See:**
- All their orders regardless of status
- Real-time status updates
- Order tracking timeline
- In-app notifications for status changes

### Admin View
**Pages with Auto-Refresh (10 seconds):**
- Orders Management (`/admin/orders`)
- Support Messages (`/admin/support`)

**What They See:**
- All orders (active or archived)
- Can manage order status
- Can assign riders
- Can archive/delete orders

### Rider View
**Pages with Auto-Refresh (10 seconds):**
- Rider Dashboard (`/rider/dashboard`)

**What They See:**
- Only orders assigned to them
- Statuses: `rider_received`, `out_for_delivery`, `pending_confirmation`, `delivered`

---

## 🔄 Complete Workflow

### Step 1: Customer Places Order
- Customer adds items to cart
- Proceeds to checkout
- Confirms address and payment
- Order created with status: **pending**
- Receipt email sent to customer

### Step 2: Admin Confirms Order
**Action:** Admin clicks "Confirm Order"
- Status changes to: **confirmed**
- Customer receives in-app notification: "Order Confirmed"
- Customer sees update in dashboard (within 10 seconds)

### Step 3: Admin Starts Preparing
**Action:** Admin clicks "Start Preparing"
- Status changes to: **preparing**
- **No notification sent** (silent operation)
- Only visible in order tracking

### Step 4: Admin Marks Ready
**Action:** Admin clicks "Mark Ready"
- Status changes to: **ready**
- Customer receives in-app notification: "Order Ready for Delivery"
- Order is now ready to be assigned to a rider

### Step 5: Admin Assigns Rider
**Action:** Admin selects rider from dropdown and clicks "Assign"
- Status changes to: **rider_received**
- Customer receives in-app notification: "Rider Assigned - [Rider Name]"
- **Rider now sees the order** in their dashboard
- Rider information appears in admin order details

### Step 6: Rider Confirms Pickup
**Action:** Rider clicks "Confirm Pickup & Start Delivery"
- Status changes to: **out_for_delivery**
- Customer receives in-app notification: "Out for Delivery - [Rider Name]"
- Admin sees status update

### Step 7: Rider Uploads Delivery Photo
**Action:** Rider clicks "Mark as Delivered" and uploads photo
- Status changes to: **pending_confirmation**
- Photo uploaded to Cloudinary
- Rider sees "Awaiting Admin Confirmation"
- Admin can view the delivery photo

### Step 8: Admin Confirms Delivery
**Action:** Admin reviews photo and clicks "Confirm Delivery"
- Status changes to: **delivered**
- Customer receives in-app notification: "Order Delivered"
- Order complete!

---

## 🔔 Notification Summary

| Event | Notification Type | Recipient |
|-------|------------------|-----------|
| Order Placed | Email (Receipt) | Customer |
| Order Confirmed | In-App | Customer |
| Start Preparing | None (Silent) | - |
| Order Ready | In-App | Customer |
| Rider Assigned | In-App | Customer |
| Out for Delivery | In-App | Customer |
| Order Delivered | In-App | Customer |

---

## ⏱️ Auto-Refresh Intervals

| Page | Interval | What Refreshes |
|------|----------|----------------|
| Customer Dashboard | 10 seconds | Dashboard stats, upcoming deliveries |
| Customer Deliveries | 10 seconds | Order list, status updates |
| Admin Orders | 10 seconds | Order list (active or archived) |
| Admin Support | 10 seconds | Support messages |
| Rider Dashboard | 10 seconds | Assigned deliveries |
| Notification Bell | 15 seconds | Unread notifications |

---

## 🚫 Common Issues

### "Rider doesn't see the order"
**Cause:** Order hasn't been assigned to the rider yet.
**Solution:** Admin must assign the rider after marking order as "ready".

### "Customer doesn't see status change"
**Cause:** Auto-refresh hasn't triggered yet.
**Solution:** Wait up to 10 seconds, or manually refresh the page.

### "Notification doesn't appear"
**Cause:** Notification bell refreshes every 15 seconds.
**Solution:** Wait up to 15 seconds for notification to appear.

---

## 📦 Archive & Delete

### Archive Orders
- Available for any order in active tab
- Moves order to archived tab
- Useful for completed/cancelled orders
- Can be unarchived anytime

### Delete Orders
- Only available in archived tab
- Permanently deletes order and related data
- Requires confirmation
- Cannot be undone

---

## 🎯 Best Practices

1. **Confirm orders promptly** - Customers are waiting
2. **Assign riders when ready** - Don't leave orders in "ready" status
3. **Review delivery photos** - Ensure proof of delivery before confirming
4. **Archive old orders** - Keep active orders list clean
5. **Monitor notifications** - Stay updated on order status changes

---

## 🔧 Technical Details

### Database Fields
- `status`: Current order status
- `archived`: Boolean for archived orders
- `paymentMethod`: credit_card, gcash, or cod
- `deliveryPhoto`: Cloudinary URL
- `riderId`: Assigned rider ID
- Timestamps: `confirmedAt`, `preparingAt`, `readyAt`, `riderReceivedAt`

### API Endpoints
- `GET /api/admin/orders?archived=false` - Active orders
- `GET /api/admin/orders?archived=true` - Archived orders
- `POST /api/admin/orders/[id]/confirm` - Confirm order
- `POST /api/admin/orders/[id]/prepare` - Start preparing
- `POST /api/admin/orders/[id]/ready` - Mark ready
- `POST /api/admin/orders/[id]/assign-rider` - Assign rider
- `POST /api/admin/orders/[id]/confirm-delivery` - Confirm delivery
- `POST /api/admin/orders/[id]/archive` - Archive order
- `POST /api/admin/orders/[id]/unarchive` - Unarchive order
- `DELETE /api/admin/orders/[id]/delete` - Delete order
- `POST /api/rider/orders/[id]/pickup` - Confirm pickup
- `POST /api/rider/orders/[id]/deliver` - Upload delivery photo

---

## ✅ Testing Checklist

- [ ] Customer places order
- [ ] Admin confirms order
- [ ] Customer receives notification (within 15 seconds)
- [ ] Admin starts preparing
- [ ] Admin marks ready
- [ ] Customer receives notification
- [ ] Admin assigns rider
- [ ] Rider sees order in dashboard (within 10 seconds)
- [ ] Customer receives notification with rider name
- [ ] Rider confirms pickup
- [ ] Customer receives "out for delivery" notification
- [ ] Rider uploads delivery photo
- [ ] Admin reviews and confirms delivery
- [ ] Customer receives "delivered" notification
- [ ] Order appears as delivered in customer dashboard

---

**Last Updated:** February 8, 2026
