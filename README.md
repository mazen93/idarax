# 🧊 Idarax: Unified POS & SaaS Platform
> The complete operating system for modern restaurants and retail stores.

Idarax is a multi-tenant SaaS application that unifies Point of Sale (POS), Kitchen Display Systems (KDS), Inventory Management, Customer Relations (CRM), and Web Administration into a single, cohesive architecture.

---

## 🔄 System Workflows & Architecture

The following sections detail exactly how data flows through the Idarax ecosystem, from a visitor's first click to a chef fulfilling an order.

### 1. The Public Landing Page (SaaS Visitor)
* **Location:** `idarax_web/app/page.tsx`
* **Workflow:** 
   1. A potential customer visits the domain.
   2. Next.js fetches the **Landing Content** (Hero text, About, Features) and **Subscription Plans** via Server-Side Rendering (SSR) from the `CmsController` (`/cms/content`).
   3. This ensures maximum SEO performance while allowing the core team to update marketing copy without touching the code.

### 2. Tenant Registration Flow
* **Workflow:**
   1. The visitor clicks "Start Free Trial" and opens the `RegisterModal.tsx`.
   2. They complete a 2-step wizard, providing account credentials and their Business/Restaurant Name.
   3. The app calls `POST /cms/register`.
   4. **Backend Transaction (`CmsService`):**
      - Creates a new `Tenant` record (e.g., `type: 'RESTAURANT'`).
      - Creates a `User` with `role: 'SUPER_ADMIN'` and securely hashes their password.
      - Links the new user directly to the new `Tenant`.
   5. Success! The user can now log into any of the Idarax apps.

### 3. Tenant Web Dashboard (Business Owners)
* **Location:** `idarax_web/app/(dashboard)`
* **Workflow:**
   1. The business owner logs in via the web portal.
   2. They receive a JWT token containing their `tenantId` and `role`.
   3. They view the **Analytics Dashboard** to see daily sales, active orders, and inventory status.
   4. **Data Privacy:** Every request sent to the NestJS backend is intercepted by the `JwtAuthGuard`. The backend automatically appends the `tenantId` to database queries, ensuring a tenant can *never* accidentally see another tenant's data.

### 4. Application Suite (Flutter Apps)
The mobile/tablet suite is where the physical operations happen.

* **Cashier POS App:** 
  - Managers and cashiers log in to manage the main register.
  - Can take orders, manage carts, apply discounts, and process payments.
* **Waiter App:**
  - Waiters log in on mobile devices.
  - They view a real-time table map. Tapping a table allows them to open a tab and add products to an order.
* **KDS (Kitchen Display System):**
  - Tablets mounted in the kitchen.
  - **Real-time Engine:** When a waiter submits an order, the NestJS `KdsGateway` broadcasts the new order via WebSockets (Socket.io) directly to the specific kitchen station (e.g., "Grill Station" or "Drinks").
  - **BUMP Logic:** Chefs tap items to mark them as "Ready". Once all items in an order are bumped, the system notifies the Waiter/Cashier that the food is ready for pickup.

### 5. Superadmin CMS (Idarax Platform Owners)
* **Location:** `idarax_web/app/admin/cms/page.tsx`
* **Workflow:**
   1. A platform owner (Idarax team member) logs into the web dashboard.
   2. They navigate to the CMS control panel.
   3. **Content Management:** They can edit the landing page text entirely via UI. Clicking "Save" instantly updates the live database.
   4. **Plan Management:** If Idarax wants to run a promotion, the platform owner can create a new Subscription Plan, set the price, and toggle it `Active`. It immediately appears on the public landing page.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Backend API** | NestJS (TypeScript) | Scalable backend framework with modular architecture. |
| **Database** | PostgreSQL + Prisma | Relational database with strictly-typed ORM. |
| **Web App** | Next.js 14 (React) | React framework utilizing App Router for the web dashboard. |
| **Mobile/Tablet** | Flutter (Dart) | Cross-platform framework running the POS, Waiter, and KDS apps. |
| **Real-time** | Socket.io / Redis | Powers instant KDS updates and cross-device syncing. |

---

## 🚀 Getting Started (Development)

To spin up the entire stack locally:

**1. Start the Database Pipeline:**
```bash
docker-compose up -d
```

**2. Start the Backend:**
```bash
npm run start:dev
```

**3. Start the Web Dashboard:**
```bash
cd idarax_web
npm run dev
```

**4. Start the Mobile App:**
```bash
cd idarax_flutter
flutter run
```
