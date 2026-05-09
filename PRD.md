# Product Requirements Document (PRD): Babyghal Beauty Shop

## 1. Product Overview
**Name:** Babyghal Beauty Shop Portal
**Brief:** A centralized Point of Sale (POS), Inventory, and Public Storefront system specifically tailored for a beauty shop (dealing in cosmetics, skincare, hair, braids, etc.). It allows public customers to view the catalog and place orders via WhatsApp, while empowering staff and administrators to manage inventory, record sales, track debts, and analyze profit metrics securely.

## 2. Target Audience
- **Customers (Public Users):** People looking to browse and purchase beauty and hair products online.
- **Staff Members:** Shop attendants managing day-to-day sales, checkout, and checking inventory levels.
- **Administrators/Owners:** Business owners needing full oversight into revenue, profits, debt tracking, inventory valuation, and supplier (seller) management.

## 3. Core Features & Capabilities

### 3.1. Public Storefront (E-commerce UI)
- **Product Catalog:** Customers can view all available products with high-quality images, category filters, and search functionality.
- **Detailed Mentions:** Includes beauty-specific product data like "Best Used When", "Best Used With", "Results After", and specific braid details (Color, Type).
- **Shopping Cart:** Add/Remove products, modify quantities, view subtotal and applicable discounts.
- **WhatsApp Checkout:** A simplified, no-payment-gateway checkout that converts the user's cart into a formatted WhatsApp message to finalize their order directly with the shop.

### 3.2. POS & Sales Management
- **Record Sales:** Staff/Admins can record walk-in purchases.
- **Payment tracking:** Support for 'Paid', 'Deposit', and 'Debt' statuses. Track amount paid vs. debt amount.
- **Discount Support:** Ability to issue basic discounts at checkout.
- **Profit Tracking:** Automatic calculation of profit based on buying price vs. actual selling price for each sale.

### 3.3. Inventory & Catalog Management
- **Products CRUD:** Add, edit, and delete products from the catalog.
- **Low Stock Alerts:** Dashboard highlights products falling to 5 items or below. Quick toggles to view "Low Stock Only".
- **Dynamic Pricing:** Record the original buying price (first_price), the current running cost (last_price), and the retail price (selling_price).
- **Out of Stock Management:** Auto-labels out-of-stock items, preventing checkout for zero quantities.

### 3.4. Administrator & Role Management
- **Role-Based Access Control (RBAC):**
  - *Staff:* Can access inventory and record sales.
  - *Admin:* Gets access to wholesale costs (buying prices), full profit margin reports, agent/seller management, and overriding fixed prices.
- **Reporting Dashboard:** Summary views of daily/monthly profit, total sales, debt accumulation, and identification of highest and lowest profit margin products.

### 3.5. Seller / Supplier Tracking
- Add and manage specific suppliers or agents that provide stock to the shop.
- Link inventory directly back to the original supplier/seller for accurate accountability.

## 4. User Flows
1. **Public Checkout:** Browse Store -> Add to Cart -> Click Checkout -> Enter Details -> Open WhatsApp -> Owner confirms order.
2. **Staff Sale:** Login (Staff PIN) -> Dashboard -> Record Sale -> Enter cash/mobile payment -> Inventory automatically deducted.
3. **Debt Clearance:** Admin/Staff view pending debts -> Customer returns to pay -> Update sale status to 'Paid' -> Cleared at timestamp updated.

## 5. Technical Requirements
- **Frontend Stack:** React, TypeScript, Tailwind CSS, Framer Motion for smooth transitions.
- **Icons:** Lucide React.
- **Persistence (Planned):** Configured to connect to a relational database (PostgreSQL) or NoSQL (Firebase), depending on deployment setup.
- **Hosting:** Vercel, Firebase App Hosting, or Google Cloud Run.

## 6. Future Enhancements (Phase 2)
1. **Online Payment Gateway:** Integrate Mpesa Daraja API or Stripe for automated online checkout.
2. **Customer CRM:** Track repeat customers and issue loyalty points.
3. **Receipt Generation:** Automatically generate printable or shareable PDF receipts upon sale completion.
4. **Expense Tracking:** Ability to subtract shop expenses (rent, utilities) from net profit.
