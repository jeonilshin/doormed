# DoorMedExpress - Online Pharmacy & Medicine Delivery Platform

## 📋 Project Overview

**DoorMedExpress** is a comprehensive full-stack web application for online pharmacy services with medicine delivery in the Philippines. The platform connects customers, pharmacists (admins), and delivery riders in a seamless medication ordering and delivery ecosystem.

**Tech Stack**: Next.js 14, TypeScript, Prisma, PostgreSQL (Neon), Tailwind CSS, Cloudinary, Xendit Payment Gateway

**Project Type**: Full-Stack Web Application  
**Duration**: Multi-phase development  
**Status**: Production Ready ✅

---

## 🎯 Core Features

### 1. Customer Portal
- **User Authentication & Email Verification**
  - Secure signup with email verification
  - Password reset functionality
  - JWT-based authentication
  - Role-based access control (customer, admin, rider)

- **Personalized Onboarding Flow**
  - Health profile setup (medical conditions, allergies)
  - Address management with Philippine location data (provinces, cities, barangays)
  - Prescription upload to Cloudinary
  - Personalized medication recommendations

- **Medicine Shop**
  - Browse medications by category
  - Search and filter functionality
  - Product details with dosage information
  - Prescription requirement indicators
  - Real-time inventory tracking
  - Shopping cart with quantity management

- **Subscription System**
  - Monthly medication subscriptions
  - Multiple subscription plans (One-Time Trial, 30 Days, Semi-Annual, Annual)
  - Automatic recurring deliveries
  - Subscription management (pause, cancel, modify)

- **Order Management**
  - One-time orders and subscription orders
  - Multiple payment methods (Credit Card, GCash, Cash on Delivery)
  - Real-time order tracking with status updates
  - Order history and delivery tracking

- **Family Member Management**
  - Add family members to account
  - Manage medications for family members
  - Separate health profiles per family member

- **Real-Time Notifications**
  - In-app notification bell with unread count
  - Auto-refresh every 15 seconds
  - Notifications for order status updates
  - Mark as read functionality

- **Customer Dashboard**
  - Overview of active medications
  - Upcoming deliveries
  - Subscription status
  - Quick access to support

- **Support System**
  - Direct messaging with admin
  - Conversation history
  - Real-time message updates

### 2. Admin Panel
- **Dashboard Analytics**
  - Total revenue tracking
  - Order statistics (pending, preparing, delivered)
  - User growth metrics
  - Low stock alerts

- **Order Management**
  - View all orders with filtering and search
  - Order status workflow management
  - Assign riders to orders
  - View customer details and delivery addresses
  - Payment method tracking
  - Delivery photo review and confirmation
  - Auto-refresh every 10 seconds

- **Inventory Management**
  - Add/edit/delete medications
  - Stock quantity tracking
  - Low stock threshold alerts
  - Image upload to Cloudinary
  - SKU and manufacturer tracking
  - Expiry date management

- **User Management**
  - View all registered users
  - User role management
  - Account status monitoring

- **Rider Management**
  - View active riders
  - Assign riders to orders
  - Track rider deliveries

- **Support Management**
  - View all customer conversations
  - Respond to customer inquiries
  - Archive resolved conversations
  - Auto-refresh every 10 seconds

### 3. Rider Portal
- **Rider Dashboard**
  - View assigned deliveries
  - Order details with customer information
  - Delivery address with full Philippine location
  - Auto-refresh every 10 seconds

- **Delivery Workflow**
  - Confirm pickup from pharmacy
  - Mark as "Out for Delivery"
  - Camera integration for delivery photos
  - Mobile camera support with rear camera activation
  - Upload delivery proof to Cloudinary
  - Delivery confirmation workflow

- **Delivery Statistics**
  - Assigned orders count
  - Out for delivery count
  - Pending confirmation count
  - Delivered today count

---

## 🔄 Complete Order Flow

### Customer Journey
1. **Browse & Shop** → Add medications to cart
2. **Checkout** → Confirm address, select payment method
3. **Payment** → Credit Card/GCash (Xendit) or Cash on Delivery
4. **Receipt Email** → Automatic email confirmation

### Admin Workflow
1. **Order Received** → View new order (auto-refresh)
2. **Confirm Order** → Customer receives in-app notification
3. **Start Preparing** → Silent status (no notification)
4. **Mark Ready** → Customer receives in-app notification
5. **Assign Rider** → Select rider from dropdown, customer notified with rider name

### Rider Workflow
1. **Receive Assignment** → Order appears in rider dashboard
2. **Confirm Pickup** → Customer notified "Out for Delivery" with rider name
3. **Deliver Order** → Take photo with mobile camera
4. **Upload Proof** → Photo uploaded to Cloudinary, status: "Pending Confirmation"

### Admin Confirmation
1. **Review Photo** → View delivery photo in order details
2. **Confirm Delivery** → Customer notified "Order Delivered"

---

## 🔔 Real-Time Notification System

### In-App Notifications
- **Notification Bell Component**
  - Unread count badge
  - Dropdown with notification list
  - Auto-refresh every 15 seconds
  - Click to mark as read
  - Link to order details

### Notification Types
| Event | Notification |
|-------|-------------|
| Order Confirmed | "Your order has been confirmed and will be prepared soon." |
| Order Ready | "Your order is ready and will be assigned to a rider soon." |
| Rider Assigned | "Your order has been assigned to [Rider Name]." |
| Out for Delivery | "[Rider Name] is on the way to deliver your order." |
| Order Delivered | "Your order has been successfully delivered!" |

### Silent Operations
- **Preparing Status**: No notification sent, only visible in order tracking

---

## 💳 Payment Integration

### Xendit Payment Gateway
- **Credit Card Payments**
  - Card tokenization for security
  - PCI-compliant payment processing
  - Test cards available for development

- **GCash Integration**
  - E-wallet payment option
  - Popular in Philippines
  - Instant payment confirmation

- **Cash on Delivery**
  - Traditional payment option
  - Payment collected by rider

### Payment Flow
1. Customer selects payment method at checkout
2. For card/GCash: Redirect to Xendit payment page
3. Payment processed securely
4. Order confirmed upon successful payment
5. Receipt email sent automatically

---

## 🗄️ Database Architecture

### Technology
- **PostgreSQL** (Neon Database - Serverless)
- **Prisma ORM** for type-safe database access
- **Connection Pooling** with PgBouncer

### Key Models
- **User**: Customer accounts with authentication
- **HealthProfile**: Medical conditions and allergies
- **Address**: Philippine location data (province, city, barangay)
- **Medication**: Product catalog with inventory
- **Order**: One-time and subscription orders
- **OrderItem**: Order line items
- **Subscription**: Recurring medication deliveries
- **Rider**: Delivery personnel
- **Notification**: In-app notifications
- **SupportMessage**: Customer support conversations
- **FamilyMember**: Family account management

### Order Status Flow
```
pending → confirmed → preparing → ready → rider_received → 
out_for_delivery → pending_confirmation → delivered
```

---

## 📸 Media Management

### Cloudinary Integration
- **Image Upload**: Medications, prescriptions, delivery photos
- **Automatic Optimization**: Responsive images
- **Secure Storage**: Cloud-based media management
- **CDN Delivery**: Fast image loading

### Upload Types
- Medication product images (admin)
- Prescription documents (customer onboarding)
- Delivery proof photos (rider)

---

## 🌏 Philippine Localization

### Address System
- **Complete Philippine Data**
  - 81 Provinces
  - 1,634 Cities/Municipalities
  - 42,046 Barangays

- **Cascading Dropdowns**
  - Province → City → Barangay
  - Real-time filtering
  - Accurate delivery addresses

### Currency
- **Philippine Peso (₱)** formatting
- Proper currency display throughout app

---

## 🔐 Security Features

### Authentication
- **JWT Tokens**: Secure session management
- **HTTP-Only Cookies**: XSS protection
- **Password Hashing**: bcrypt encryption
- **Email Verification**: Account activation required

### Authorization
- **Role-Based Access Control**
  - Customer: Shop, orders, subscriptions
  - Admin: Full system management
  - Rider: Delivery management only

### Data Protection
- **Environment Variables**: Sensitive data in .env
- **API Route Protection**: Middleware authentication
- **Database Security**: Neon PostgreSQL with SSL

---

## 🚀 Technical Implementation

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Client-Side State Management**
- **Auto-Refresh Components** (10-15 second intervals)

### Backend
- **Next.js API Routes**
- **Prisma Client** for database queries
- **RESTful API Design**
- **Error Handling & Validation**

### Email Service
- **Resend** for transactional emails
- Email verification
- Password reset
- Order receipts

### File Upload
- **Cloudinary SDK**
- Multipart form data handling
- Image optimization

### Payment Processing
- **Xendit SDK**
- Card tokenization
- Webhook handling (future)

---

## 📱 Responsive Design

### Mobile-First Approach
- Fully responsive layouts
- Touch-friendly interfaces
- Mobile camera integration for riders
- Optimized for all screen sizes

### Desktop Features
- Multi-column layouts
- Advanced filtering and search
- Detailed data tables
- Enhanced admin tools

---

## 🎨 UI/UX Highlights

### Design System
- **Color Palette**: Green theme (#1b4332, #c9e265, #f2f7e8)
- **Typography**: Serif headings, sans-serif body
- **Consistent Components**: Buttons, cards, modals
- **Loading States**: Spinners and skeletons
- **Empty States**: Helpful messages and icons

### User Experience
- **Intuitive Navigation**: Clear menu structure
- **Real-Time Updates**: Auto-refresh without page reload
- **Instant Feedback**: Success/error messages
- **Progress Indicators**: Order tracking, onboarding steps
- **Accessibility**: Semantic HTML, ARIA labels

---

## 🧪 Testing & Quality

### Development Tools
- **TypeScript**: Compile-time error checking
- **ESLint**: Code quality enforcement
- **Prisma Studio**: Database inspection
- **Browser DevTools**: Debugging

### Testing Approach
- Manual testing of all user flows
- Order workflow end-to-end testing
- Payment integration testing (test mode)
- Mobile device testing
- Cross-browser compatibility

---

## 📊 Key Metrics & Analytics

### Admin Dashboard Metrics
- Total revenue
- Total orders
- Pending orders count
- Preparing orders count
- Ready for delivery count
- Total users
- Low stock alerts

### Order Statistics
- Orders by status
- Orders by payment method
- Daily/weekly/monthly trends
- Average order value

---

## 🔧 Configuration & Setup

### Environment Variables
```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
JWT_SECRET=...
RESEND_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
XENDIT_SECRET_KEY=...
XENDIT_PUBLIC_KEY=...
```

### Database Setup
1. Neon PostgreSQL database
2. Prisma schema migrations
3. Seed data for testing
4. Connection pooling configured

### Third-Party Services
- **Neon**: PostgreSQL database hosting
- **Resend**: Email delivery service
- **Cloudinary**: Media storage and CDN
- **Xendit**: Payment gateway (Philippines)

---

## 🎯 Business Value

### For Customers
- Convenient online medicine ordering
- Subscription for recurring medications
- Real-time delivery tracking
- Multiple payment options
- Family member management
- 24/7 access to pharmacy

### For Pharmacy (Admin)
- Streamlined order management
- Inventory tracking and alerts
- Customer relationship management
- Revenue analytics
- Efficient rider assignment
- Support ticket system

### For Riders
- Clear delivery instructions
- Customer contact information
- Delivery proof documentation
- Earnings tracking
- Route optimization ready

---

## 🚀 Future Enhancements

### Potential Features
1. **Push Notifications**: Web push for real-time alerts
2. **SMS Notifications**: Twilio integration for critical updates
3. **Rider Mobile App**: Native iOS/Android app
4. **Advanced Analytics**: Charts and reports
5. **Prescription Verification**: OCR for prescription scanning
6. **Telemedicine Integration**: Video consultations
7. **Loyalty Program**: Points and rewards
8. **Multi-Language Support**: English and Filipino
9. **AI Chatbot**: Automated customer support
10. **Route Optimization**: Google Maps integration for riders

---

## 📈 Project Achievements

### Technical Accomplishments
✅ Full-stack application with modern tech stack  
✅ Real-time notification system  
✅ Secure payment integration  
✅ Complete order management workflow  
✅ Mobile camera integration  
✅ Philippine address localization  
✅ Multi-role authentication system  
✅ Subscription management  
✅ Cloud media storage  
✅ Auto-refresh real-time updates  

### Business Features
✅ End-to-end customer journey  
✅ Admin operations dashboard  
✅ Rider delivery system  
✅ Multiple payment methods  
✅ Email notifications  
✅ Support ticket system  
✅ Family account management  
✅ Inventory management  
✅ Order tracking  
✅ Delivery confirmation workflow  

---

## 💡 Key Learnings

### Technical Skills
- Next.js 14 App Router architecture
- TypeScript for type-safe development
- Prisma ORM with PostgreSQL
- JWT authentication implementation
- Payment gateway integration
- Cloud storage integration (Cloudinary)
- Real-time data updates without WebSockets
- Mobile camera API usage
- Philippine address data handling

### Software Engineering
- RESTful API design
- Database schema design
- State management patterns
- Error handling strategies
- Security best practices
- Code organization and modularity
- Component reusability

### Product Development
- User flow design
- Multi-role system architecture
- Order workflow optimization
- Notification strategy
- Mobile-first responsive design
- User experience considerations

---

## 🎓 Technologies Mastered

### Frontend
- Next.js 14 (App Router, Server Components, API Routes)
- TypeScript (Interfaces, Types, Generics)
- Tailwind CSS (Utility-first styling)
- React Hooks (useState, useEffect, custom hooks)
- Form handling and validation
- File upload handling
- Camera API integration

### Backend
- Node.js with Next.js API Routes
- Prisma ORM (Schema, Migrations, Queries)
- PostgreSQL (Relational database design)
- JWT Authentication
- bcrypt password hashing
- RESTful API patterns
- Error handling middleware

### Third-Party Integrations
- Xendit Payment Gateway
- Cloudinary Media Management
- Resend Email Service
- Neon Serverless PostgreSQL

### DevOps & Tools
- Git version control
- Environment variable management
- Database migrations
- Seed data management
- TypeScript compilation
- ESLint configuration

---

## 📞 Project Highlights for Portfolio

### Problem Solved
Created a comprehensive online pharmacy platform that digitizes the entire medication ordering and delivery process in the Philippines, making healthcare more accessible.

### Scale & Complexity
- 40+ API endpoints
- 15+ database models
- 3 user roles (customer, admin, rider)
- 8-stage order workflow
- Real-time notifications
- Payment processing
- Media management
- 42,000+ Philippine locations

### Innovation
- Real-time in-app notifications without WebSockets
- Mobile camera integration for delivery proof
- Admin-reviewed delivery confirmation
- Philippine address cascading system
- Multi-role authentication architecture
- Subscription-based medication delivery

### Impact
- Streamlines pharmacy operations
- Improves customer experience
- Ensures delivery accountability
- Reduces manual processes
- Enables medication adherence through subscriptions

---

## 🏆 Project Statistics

- **Lines of Code**: ~15,000+
- **Components**: 50+
- **API Endpoints**: 40+
- **Database Tables**: 15+
- **User Roles**: 3
- **Order Statuses**: 8
- **Payment Methods**: 3
- **Notification Types**: 5
- **Development Time**: Multi-phase
- **Tech Stack**: 10+ technologies

---

## 📝 Conclusion

DoorMedExpress is a production-ready, full-featured online pharmacy platform that demonstrates expertise in modern web development, system architecture, and product thinking. The project showcases the ability to build complex, real-world applications with multiple user roles, payment processing, real-time updates, and third-party integrations.

The platform is scalable, secure, and designed with both user experience and business operations in mind, making it a comprehensive solution for online pharmacy services in the Philippines.

---

**Repository**: [Your GitHub Link]  
**Live Demo**: [Your Deployment Link]  
**Contact**: [Your Email]

---

*Built with ❤️ using Next.js, TypeScript, and modern web technologies*
