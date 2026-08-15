# DMK Mart — Product Requirements Document (PRD)
## Bookkeeping & Billing Platform for Plastic Manufacturing

**Version:** 1.0  
**Date:** August 2024  
**Status:** Production-Ready (Demo)  
**Platform:** Next.js 16 + TypeScript + Prisma/SQLite  

---

# Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Context](#2-business-context)
3. [Technology Stack](#3-technology-stack)
4. [Architecture Overview](#4-architecture-overview)
5. [Multi-Company Structure](#5-multi-company-structure)
6. [Authentication & Access Control](#6-authentication--access-control)
7. [Module: Dashboard](#7-module-dashboard)
8. [Module: Billing](#8-module-billing)
9. [Module: Products](#9-module-products)
10. [Module: Customers](#10-module-customers)
11. [Module: Invoices](#11-module-invoices)
12. [Module: Bookkeeping — Overview](#12-module-bookkeeping--overview)
13. [Bookkeeping: Journal Entries](#13-bookkeeping-journal-entries)
14. [Bookkeeping: Trial Balance](#14-bookkeeping-trial-balance)
15. [Bookkeeping: Profit & Loss Statement](#15-bookkeeping-profit--loss-statement)
16. [Bookkeeping: Balance Sheet](#16-bookkeeping-balance-sheet)
17. [How Bookkeeping Connects Everything](#17-how-bookkeeping-connects-everything)
18. [Module: Reports](#18-module-reports)
19. [Module: Settings](#19-module-settings)
20. [AI Assistant](#20-ai-assistant)
21. [Database Schema](#21-database-schema)
22. [API Reference](#22-api-reference)
23. [Data Flow Diagrams](#23-data-flow-diagrams)
24. [GST & Taxation Logic](#24-gst--taxation-logic)
25. [Demo Data Summary](#25-demo-data-summary)

---

# 1. Executive Summary

## 1.1 What is DMK Mart?

DMK Mart is a **multi-company bookkeeping and billing platform** built specifically for plastic manufacturing businesses. It handles the complete financial workflow from product entry and sales billing to double-entry bookkeeping, invoice generation, and financial reporting — all within a clean, easy-to-use interface.

## 1.2 Key Capabilities

| Capability | Description |
|-----------|-------------|
| **Multi-Company** | 4 separate company verticals, each with its own login, products, customers, and books |
| **Product Management** | 2,320+ plastic products with 5 pricing tiers each (Retail, Wholesale, Bulk, Dealer, Special) |
| **Billing Entry** | Product autocomplete, price tier selection, auto-calculated totals with GST |
| **Double-Entry Bookkeeping** | Proper journal entries with debit/credit, voucher types, and balance validation |
| **Financial Statements** | Trial Balance, Profit & Loss, Balance Sheet generated from live journal data |
| **Invoice Generation** | Professional invoices from billing entries, downloadable/printable |
| **GST Compliance** | CGST + SGST (intra-state) and IGST (inter-state) calculation |
| **Customer Management** | Customer ledger with opening balance, credit limit, payment terms |
| **AI Assistant** | Chat-based assistant that can query live business data via 7 tools |
| **Reports** | 6 report templates with print support |

## 1.3 Design Philosophy

- **Clean over complex** — the UI is spacious, easy to scan, and avoids clutter
- **Indian business context** — INR currency, GST tax system, Indian customer names
- **Tally-inspired bookkeeping** — familiar voucher types, chart of accounts structure
- **Real-time data flow** — every billing entry automatically creates a journal entry

---

# 2. Business Context

## 2.1 The Problem

The client runs **4 plastic manufacturing verticals** producing household items (chairs, buckets, kitchenware, containers, industrial plastics). Each vertical operates as a separate company with its own:
- Product catalog (500+ products per company)
- Customer base
- Financial books
- Pricing strategies

They needed a platform that:
1. Keeps each company's data completely separate
2. Manages 500+ products with multiple pricing tiers
3. Handles billing with product search and auto-calculation
4. Maintains proper double-entry books (debit/credit)
5. Generates professional invoices
6. Produces financial statements (Trial Balance, P&L, Balance Sheet)
7. Is GST-compliant (Indian tax system)

## 2.2 The Four Companies

| Code | Name | Focus | Sample Products |
|------|------|-------|-----------------|
| DMK1 | DMK Plastics | Plastic furniture | Chairs, tables, stools, shelves, cabinets |
| DMK2 | DMK Kitchenware | Kitchen items | Buckets, mugs, jugs, bowls, plates, bottles |
| DMK3 | DMK Household | Household products | Dustbins, baskets, boxes, hangers, containers |
| DMK4 | DMK Industrial | Industrial plastics | Crates, bins, pallets, drums, jerry cans |

---

# 3. Technology Stack

## 3.1 Frontend

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Next.js** | Framework (App Router) | 16.1.3 |
| **React** | UI library | 19 |
| **TypeScript** | Type safety | 5 |
| **Tailwind CSS** | Styling | 4 |
| **shadcn/ui** | Component library (New York style) | — |
| **Recharts** | Charts and graphs | 2.15 |
| **Framer Motion** | Page transitions | 12 |
| **TanStack Query** | Server state management | 5 |
| **Zustand** | Client state management | 5 |
| **react-hook-form** | Form handling | 7 |
| **react-markdown** | Markdown rendering (AI chat) | 10 |

## 3.2 Backend

| Technology | Purpose |
|-----------|---------|
| **Next.js API Routes** | REST API endpoints |
| **Prisma ORM** | Database queries (SQLite) |
| **NextAuth.js** | Authentication (Credentials provider, JWT sessions) |
| **bcryptjs** | Password hashing |
| **z-ai-web-dev-sdk** | AI assistant (LLM integration) |
| **Socket.io** | Real-time notifications (mini-service on port 3003) |

## 3.3 Database

| Database | Purpose |
|----------|---------|
| **SQLite** | Local development database (`db/custom.db`) |
| **Prisma** | Schema definition, migrations, query client |

The schema is designed to port to **PostgreSQL** with row-level security for multi-tenant isolation in production.

---

# 4. Architecture Overview

## 4.1 Application Flow

```
┌─────────────────────────────────────────────────────┐
│                    User Browser                       │
│                   (Next.js Client)                    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                 Next.js Server (Port 3000)           │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   App Router │  │  API Routes  │  │ Middleware  │ │
│  │   (Pages)    │  │  (/api/*)    │  │ (Auth)      │ │
│  └──────┬───────┘  └──────┬───────┘  └────────────┘ │
│         │                  │                          │
│  ┌──────▼──────────────────▼──────────────────────┐ │
│  │              Prisma Client (db)                 │ │
│  └──────────────────────┬─────────────────────────┘ │
└─────────────────────────┼───────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│               SQLite Database                        │
│               (db/custom.db)                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Company  │ │ Product  │ │ Customer │            │
│  │ User     │ │ Account  │ │ Invoice  │            │
│  │ Billing  │ │ Journal  │ │ Activity │            │
│  └──────────┘ └──────────┘ └──────────┘            │
└─────────────────────────────────────────────────────┘
```

## 4.2 Realtime Service

```
┌─────────────────────────────────────────────────────┐
│           Socket.io Mini-Service (Port 3003)         │
│                                                      │
│  • Tenant-scoped rooms                               │
│  • Broadcast notifications                           │
│  • Activity feed updates                             │
│  • Typing indicators                                 │
└─────────────────────────────────────────────────────┘
```

The Caddy gateway routes traffic: the main app on port 3000 and the Socket.io service on port 3003 are accessed through a single external port using `XTransformPort` query parameter.

---

# 5. Multi-Company Structure

## 5.1 How It Works

Each company is a completely isolated workspace:

```
┌─────────────────────────────────────────────────────┐
│                    DMK Mart Platform                  │
│                                                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ DMK Plastics│ │DMK Kitchen  │ │DMK Household│   │
│  │   (DMK1)    │ │  (DMK2)     │ │   (DMK3)    │   │
│  │             │ │             │ │             │   │
│  │ • Products  │ │ • Products  │ │ • Products  │   │
│  │ • Customers│ │ • Customers│ │ • Customers│   │
│  │ • Bills    │ │ • Bills    │ │ • Bills    │   │
│  │ • Journal  │ │ • Journal  │ │ • Journal  │   │
│  │ • Invoices │ │ • Invoices │ │ • Invoices │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                       │
│  ┌─────────────┐ ┌─────────────────────────────┐   │
│  │DMK Industrial│ │   Super Admin (sees all)    │   │
│  │   (DMK4)     │ │                             │   │
│  └─────────────┘ └─────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## 5.2 Data Isolation

Every database query is scoped by `companyId`:

```typescript
// For regular company users:
const where = { companyId: session.user.companyId }

// For super admin (companyId = null):
const where = {} // sees all companies
```

## 5.3 Company Logins

| Role | Email | Password | Scope |
|------|-------|----------|-------|
| Super Admin | super@dmkmart.com | admin123 | All 4 companies |
| DMK Plastics Admin | admin1@dmkmart.com | admin123 | Company 1 only |
| DMK Kitchenware Admin | admin2@dmkmart.com | admin123 | Company 2 only |
| DMK Household Admin | admin3@dmkmart.com | admin123 | Company 3 only |
| DMK Industrial Admin | admin4@dmkmart.com | admin123 | Company 4 only |

---

# 6. Authentication & Access Control

## 6.1 Authentication Flow

```
User enters email + password
         │
         ▼
┌─────────────────────┐
│  NextAuth Credentials │
│  Provider             │
│  (POST /api/auth/     │
│   callback/credentials)│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  bcrypt.compare()     │
│  (verify password)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Create JWT Session  │
│  (contains: id, role, │
│   companyId,          │
│   companyName)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Redirect to         │
│  Workspace           │
└─────────────────────┘
```

## 6.2 Session Structure

Every authenticated request includes a JWT token containing:

```json
{
  "id": "user_cuid",
  "email": "admin1@dmkmart.com",
  "name": "DMK Plastics Admin",
  "role": "Admin",
  "companyId": "company_cuid",
  "companyName": "DMK Plastics",
  "companyCode": "DMK1"
}
```

## 6.3 Role-Based Access

| Role | Permissions |
|------|------------|
| Admin | Full access to company data, can create/edit/delete all entities |
| Accountant | Can access billing, bookkeeping, invoices, reports |
| Billing | Can create billing entries and invoices |
| Manager | Read access to all modules + can approve |
| Viewer | Read-only access |

---

# 7. Module: Dashboard

## 7.1 Purpose

The Dashboard provides a **snapshot of the company's financial health** at a glance. It's the landing page after login.

## 7.2 Components

### KPI Cards (4)
| Card | Data Source | Calculation |
|------|------------|-------------|
| **Total Sales** | `BillingEntry.grandTotal` where type=Sales | Sum of all sales billing entries |
| **Total Received** | `BillingEntry.paidAmount` | Sum of all payment amounts received |
| **Total Receivable** | `BillingEntry.balanceDue` | Sum of outstanding balances |
| **Products Count** | `Product.count` | Total active products in catalog |

Each KPI card uses an **AnimatedNumber** component that counts from 0 to the target value with an ease-out cubic animation over 900ms.

### Revenue Chart
- **Type:** Area Chart (Recharts)
- **Data:** Last 6 months of billing entry totals
- **Color:** Emerald gradient fill
- **Y-axis:** Formatted as ₹X.XL (Indian lakh notation)

### Top 5 Products
- **Type:** Horizontal Bar Chart
- **Data:** Products ranked by billing line frequency
- **Calculation:** Count of BillingLine entries per product

### Recent Billing Entries (Table)
- Last 5 billing entries
- Columns: Bill Number, Customer, Amount, Status, Date
- Status badges: Draft (gray), Confirmed (blue), Invoiced (green)

### Recent Activity (Timeline)
- Last 8 activity entries
- Vertical timeline with colored icons per activity type
- Shows: user name, action summary, time-ago

### Quick Actions
- "New Bill" → navigates to Billing module
- "Add Product" → navigates to Products module
- "Add Customer" → navigates to Customers module

## 7.3 API Endpoint

```
GET /api/dashboard
```

Returns:
```json
{
  "kpis": {
    "totalSales": 1250000,
    "totalReceived": 980000,
    "totalReceivable": 270000,
    "productCount": 580,
    "customerCount": 13,
    "lowStockCount": 8
  },
  "recentBilling": [...],
  "recentActivities": [...],
  "topProducts": [...],
  "monthlySales": [...]
}
```

---

# 8. Module: Billing

## 8.1 Purpose

The Billing module is the **core operational feature** of DMK Mart. It's where sales and purchase transactions are recorded with product line items, automatic GST calculation, and automatic journal entry creation.

## 8.2 Two Views

### View 1: New Bill (Entry Form)

This is the most important screen in the platform:

```
┌─────────────────────────────────────────────────────┐
│  NEW BILL                                            │
│                                                       │
│  Customer: [Select customer ▼]   Date: [2024-08-15] │
│  Type: [Sales ▼]                                    │
│                                                       │
│  ─── LINE ITEMS ───                                  │
│                                                       │
│  [Type product name to search...        ]            │
│   ↓ (autocomplete dropdown)                          │
│   ┌─────────────────────────────────────────┐        │
│   │ Plastic Chair Classic     SKU: DMK1-001 │        │
│   │ Retail: ₹299  Wholesale: ₹234           │        │
│   │ Bulk: ₹207   Dealer: ₹208  Special: ₹192│        │
│   └─────────────────────────────────────────┘        │
│                                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │ Product          │ Price Tier │ Qty │ Disc │ Total│   │
│  │ Plastic Chair    │ [Retail ₹299▼]│ 10  │ 0%   │₹3530│   │
│  │ Classic          │              │     │      │     │   │
│  │                  │              │     │      │ [X] │   │
│  ├──────────────────┼──────────────┼─────┼──────┼─────┤   │
│  │ Plastic Table    │ [Wholesale ₹▼]│ 5   │ 5%   │₹4180│   │
│  │ Round            │              │     │      │ [X] │   │
│  └──────────────────────────────────────────────┘   │
│                                                       │
│  [+ Add Another Product]                              │
│                                                       │
│  ─── SUMMARY ───                                      │
│  Subtotal:                  ₹7,710                   │
│  Discount (0%):             ₹0                       │
│  Taxable Amount:            ₹7,710                   │
│  CGST (9%):                  ₹693                    │
│  SGST (9%):                  ₹693                    │
│  ─────────────────────────────────                   │
│  Round Off:                  ₹-4                      │
│  Grand Total:                ₹9,092                   │
│                                                       │
│  Payment Mode: [Cash ▼]                             │
│  Notes: [________________________________]            │
│                                                       │
│  [         SAVE BILL         ]                        │
└─────────────────────────────────────────────────────┘
```

#### Product Autocomplete (Key Feature)

When the user types in the product search field:

1. **Debounce** 250ms after the user stops typing
2. **Fetch** `GET /api/products?q=TEXT&limit=10`
3. **Display** dropdown with each product showing:
   - Product name and SKU
   - Category badge
   - Stock quantity (colored: red/amber/green)
   - **All 5 prices** (Retail, Wholesale, Bulk, Dealer, Special) with ₹ amounts
4. **Click** a product → adds it as a line item

#### Line Item Calculation

For each line item:

```
taxableAmount = unitPrice × quantity × (1 - discountPercent / 100)
gstAmount = taxableAmount × (gstRate / 100)
lineTotal = taxableAmount + gstAmount
```

Example:
- Product: Plastic Chair Classic
- Price Tier: Retail (₹299)
- Quantity: 10
- Discount: 0%
- GST Rate: 18%

```
taxableAmount = 299 × 10 × (1 - 0/100) = ₹2,990
gstAmount = 2,990 × 18/100 = ₹538.20
lineTotal = 2,990 + 538.20 = ₹3,528.20
```

#### Bill Total Calculation

```
subtotal = sum of all (unitPrice × quantity)
discountAmount = subtotal × (billDiscountPercent / 100)
taxableAmount = sum of all line taxableAmounts - discountAmount
cgst = taxableAmount × 9/100  (for intra-state)
sgst = taxableAmount × 9/100  (for intra-state)
totalGst = cgst + sgst
grandTotal = round(taxableAmount + totalGst)
roundOff = grandTotal - (taxableAmount + totalGst)
balanceDue = grandTotal - paidAmount
```

#### What Happens on Save

When the user clicks "Save Bill", the system:

1. **Creates a BillingEntry** record with all totals
2. **Creates BillingLine** records for each product line item
3. **Creates a JournalEntry** (double-entry bookkeeping):
   - Debit: Accounts Receivable (or Cash if paid) = grandTotal
   - Credit: Sales Revenue = taxableAmount
   - Credit: GST Payable = totalGst
4. **Updates Product stock** (decreases for Sales, increases for Purchase)
5. **Updates Customer balance** (increases outstanding)
6. **Creates an Activity** log entry
7. **Generates bill number**: `BILL-2024-NNNN`

### View 2: Bills List

Table showing all billing entries:

| Bill Number | Date | Customer | Type | Grand Total | Balance | Status |
|-------------|------|----------|------|-------------|---------|--------|
| BILL-2024-0001 | 15 Aug | Sharma Store | Sales | ₹9,092 | ₹0 | Invoiced |
| BILL-2024-0002 | 14 Aug | Gupta Ent. | Sales | ₹15,450 | ₹8,200 | Confirmed |
| BILL-2024-0003 | 13 Aug | Patel Mart | Purchase | ₹45,000 | ₹45,000 | Draft |

- Click row → opens detail Sheet showing line items and totals
- "Generate Invoice" button on confirmed bills → creates an Invoice

## 8.3 API Endpoints

```
GET  /api/billing?status=&customerId=&type=
POST /api/billing
GET  /api/billing/:id
PATCH /api/billing/:id
DELETE /api/billing/:id
```

---

# 9. Module: Products

## 9.1 Purpose

Manage the product catalog with **5 pricing tiers** per product. This is where all 2,320+ plastic products are stored.

## 9.2 Product Data Model

Each product has:

| Field | Type | Description |
|-------|------|-------------|
| `sku` | String | Unique product code (e.g., DMK1-001) |
| `name` | String | Product name (e.g., "Plastic Chair Classic Black") |
| `category` | String | Category (Chair, Bucket, Container, etc.) |
| `unit` | String | Unit of measure (PCS, DOZEN, BOX, SET, KG) |
| `costPrice` | Float | Cost price (what DMK Mart paid to manufacture) |
| `price1` | Float | **Retail price** (highest, for individual buyers) |
| `price2` | Float | **Wholesale price** (for bulk buyers) |
| `price3` | Float | **Bulk price** (for large quantity orders) |
| `price4` | Float | **Dealer price** (for registered dealers) |
| `price5` | Float | **Special price** (for special customers/promotions) |
| `price1Label` - `price5Label` | String | Editable labels for each price tier |
| `stockQty` | Int | Current stock quantity |
| `reorderLevel` | Int | Stock level that triggers reorder alert |
| `gstRate` | Float | GST percentage (default 18%) |
| `hsnCode` | String | HSN code for GST (default 3926 for plastic) |

## 9.3 Pricing Tier Logic

The 5 pricing tiers create a margin structure:

```
Cost Price (₹175)
    │
    ├── Price 1: Retail    = Cost × 1.5-2.0 = ₹263-350  (50-100% margin)
    ├── Price 2: Wholesale = Cost × 1.3-1.5 = ₹228-263  (30-50% margin)
    ├── Price 3: Bulk      = Cost × 1.15-1.3 = ₹201-228 (15-30% margin)
    ├── Price 4: Dealer     = Cost × 1.1-1.2 = ₹193-210  (10-20% margin)
    └── Price 5: Special    = Cost × 1.05-1.1 = ₹184-193 (5-10% margin)
```

## 9.4 UI Features

- **Search** by product name or SKU (debounced)
- **Category filter** pills (All, Chair, Bucket, Kitchen, etc.)
- **Expandable rows** showing all 5 prices in a grid
- **Stock status indicator**: Green (in stock), Amber (low), Red (out of stock)
- **Add/Edit dialog** with all fields including 5 price inputs with editable labels
- **Pagination** (20 per page)
- **Delete** with reference check (can't delete products used in billing)

## 9.5 API Endpoints

```
GET    /api/products?q=&category=&page=&limit=
POST   /api/products
GET    /api/products/:id
PATCH  /api/products/:id
DELETE /api/products/:id
```

---

# 10. Module: Customers

## 10.1 Purpose

Manage customer information including contact details, GST numbers, credit limits, and payment terms. Each customer has a **running balance** that updates with every billing entry.

## 10.2 Customer Data Model

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Customer name (e.g., "Sharma General Store") |
| `phone` | String? | Phone number |
| `email` | String? | Email address |
| `address` | String? | Full address |
| `city` | String? | City |
| `state` | String? | State (for GST intra/inter-state) |
| `gstNumber` | String? | GSTIN (e.g., "27AAAAA0000A1Z5") |
| `openingBalance` | Float | Balance when customer was added |
| `currentBalance` | Float | Running balance (auto-updated) |
| `creditLimit` | Float | Maximum credit allowed |
| `paymentTerms` | String? | Cash, Credit7, Credit15, Credit30 |

## 10.3 Customer 360 View

Clicking a customer row opens a **Sheet drawer** from the right showing:

1. **Customer header** — Name, phone, email, GST number
2. **Balance cards** — Current Balance, Opening Balance, Credit Limit, Total Sales
3. **Contact info** — Address, city, state, payment terms
4. **Billing History** — Table of all billing entries for this customer
5. **Recent Invoices** — Table of invoices for this customer

## 10.4 API Endpoints

```
GET    /api/customers?q=
POST   /api/customers
GET    /api/customers/:id  (includes billing entries + invoices)
PATCH  /api/customers/:id
DELETE /api/customers/:id
```

---

# 11. Module: Invoices

## 11.1 Purpose

Generate professional invoices from billing entries. An invoice is a **formal document** sent to customers requesting payment.

## 11.2 Invoice Lifecycle

```
Billing Entry (Confirmed)
         │
         ▼
   [Generate Invoice]
         │
         ▼
  Invoice Created (Draft)
         │
         ▼
    [Send to Customer]
         │
         ▼
  Invoice (Sent) ──────► [Mark as Paid]
         │                       │
         ▼                       ▼
   [Partial Payment]      Invoice (Paid)
         │
         ▼
  Invoice (Partial)
         │
         ▼
   [Overdue if past due date]
         │
         ▼
  Invoice (Overdue)
```

## 11.3 Invoice Numbering

Invoices are numbered sequentially per company:
- `INV-2024-0001`
- `INV-2024-0002`
- `INV-2024-0003`
- etc.

## 11.4 Invoice Detail View

Clicking an invoice opens a **Sheet drawer** showing a professional invoice layout:

- **Bill From**: Company name, address, GST number
- **Bill To**: Customer name, address, GST number
- **Invoice meta**: Number, issue date, due date, status
- **Line items table**: Product, quantity, unit price, discount, amount
- **Tax breakdown**:
  - CGST (9%) — for intra-state
  - SGST (9%) — for intra-state
  - IGST (18%) — for inter-state
- **Summary**: Subtotal, discount, round off, grand total
- **Payment info**: Amount paid, balance due
- **Actions**: "Mark as Paid" button, "Print" button

## 11.5 API Endpoints

```
GET   /api/invoices
POST  /api/invoices  (from billing entry)
GET   /api/invoices/:id
PATCH /api/invoices/:id  (mark paid, update status)
```

---

# 12. Module: Bookkeeping — Overview

## 12.1 What is Bookkeeping?

Bookkeeping is the practice of recording and tracking all financial transactions using **double-entry accounting** — a system where every transaction has equal debits and credits. This ensures the books always balance.

## 12.2 Double-Entry Accounting Principle

```
For every transaction:
    Total Debits = Total Credits

If you debit one account, you must credit another by the same amount.
```

### Example: A Cash Sale of ₹1,000

| Account | Debit (₹) | Credit (₹) |
|---------|-----------|-------------|
| Cash in Hand | 1,000 | |
| Sales Revenue | | 1,000 |
| **Total** | **1,000** | **1,000** |

### Example: A Credit Sale of ₹1,000 (with 18% GST)

| Account | Debit (₹) | Credit (₹) |
|---------|-----------|-------------|
| Accounts Receivable | 1,180 | |
| Sales Revenue | | 1,000 |
| GST Payable | | 180 |
| **Total** | **1,180** | **1,180** |

## 12.3 Chart of Accounts

Each company has 17 accounts organized by type:

| Code | Name | Type | Purpose |
|------|------|------|---------|
| **10000** | Cash in Hand | Asset | Physical cash |
| **10001** | Bank Account | Asset | Bank balance |
| **12000** | Accounts Receivable | Asset | Money owed by customers |
| **13000** | Inventory | Asset | Stock value |
| **14000** | Fixed Assets | Asset | Equipment, machinery |
| **20000** | Accounts Payable | Liability | Money owed to suppliers |
| **21000** | GST Payable | Liability | GST collected (owed to govt) |
| **30000** | Owner's Capital | Equity | Owner's investment |
| **31000** | Retained Earnings | Equity | Accumulated profits |
| **40000** | Sales Revenue | Revenue | Income from sales |
| **41000** | Service Revenue | Revenue | Income from services |
| **50000** | Cost of Goods Sold | Expense | Direct cost of products |
| **51000** | Salaries Expense | Expense | Staff salaries |
| **52000** | Rent Expense | Expense | Office/warehouse rent |
| **53000** | Utilities Expense | Expense | Electricity, water |
| **54000** | Marketing Expense | Expense | Advertising |
| **55000** | Purchase of Goods | Expense | Raw materials purchased |

## 12.4 Voucher Types

Journal entries are categorized by voucher type (Tally-style):

| Voucher Type | When to Use | Example |
|-------------|-------------|---------|
| **Journal** | General entries, adjustments | Depreciation, corrections |
| **Payment** | Money going out | Paying rent, salaries |
| **Receipt** | Money coming in | Receiving payment from customer |
| **Contra** | Internal transfers | Cash to bank deposit |
| **Sales** | Sales transactions | Auto-created from billing |
| **Purchase** | Purchase transactions | Auto-created from purchase billing |

## 12.5 Bookkeeping Module Structure

The Bookkeeping module has **4 tabs**:

```
┌─────────────────────────────────────────────────────┐
│  [Journal Entries] [Trial Balance] [P&L] [Balance Sheet] │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │                                               │    │
│  │         Active tab content                    │    │
│  │                                               │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

# 13. Bookkeeping: Journal Entries

## 13.1 Purpose

The Journal Entries tab is where **all financial transactions are recorded** using double-entry bookkeeping. Every billing entry automatically creates a journal entry, but users can also create manual entries for expenses, adjustments, and corrections.

## 13.2 How It Works

### Data Model

```
JournalEntry
├── entryNumber: "JE-2024-0001"
├── date: DateTime
├── description: "Sales - BILL-2024-0001"
├── voucherType: "Sales" | "Payment" | "Receipt" | "Contra" | "Journal" | "Purchase"
├── status: "Posted"
├── totalDebit: 9092.00
├── totalCredit: 9092.00
└── lines: [
    JournalEntryLine
    ├── account: "Accounts Receivable"
    ├── debit: 9092.00
    ├── credit: 0
    └── memo: "To Accounts Receivable"
    ,
    JournalEntryLine
    ├── account: "Sales Revenue"
    ├── debit: 0
    ├── credit: 7700.00
    └── memo: "By Sales Revenue"
    ,
    JournalEntryLine
    ├── account: "GST Payable"
    ├── debit: 0
    ├── credit: 1392.00
    └── memo: "By GST Payable"
  ]
```

### Validation Rule

The system **enforces** that total debits must equal total credits:

```
if (totalDebit !== totalCredit) {
  // Show red "Difference: ₹X" indicator
  // Disable Save button
}
```

### Journal Entry List View

The list shows all journal entries in a table:

| Entry Number | Date | Description | Voucher | Debit (₹) | Credit (₹) |
|-------------|------|-------------|---------|-----------|-------------|
| JE-2024-0001 | 15 Aug | Sales - BILL-2024-0001 | Sales | 9,092 | 9,092 |
| JE-2024-0002 | 15 Aug | Monthly Rent Paid | Payment | 35,000 | 35,000 |
| JE-2024-0003 | 14 Aug | Staff Salaries Paid | Payment | 1,20,000 | 1,20,000 |
| JE-2024-0004 | 14 Aug | Electricity & Water Bill | Payment | 8,500 | 8,500 |

Clicking a row **expands** it to show the line items:

```
▼ JE-2024-0001 | 15 Aug | Sales - BILL-2024-0001 | Sales | ₹9,092 | ₹9,092
  ┌─────────────────────┬────────┬────────┬──────────────────────┐
  │ Account              │ Debit  │ Credit │ Memo                 │
  ├──────────────────────┼────────┼────────┼──────────────────────┤
  │ Accounts Receivable  │ 9,092  │   0    │ To Accounts Receivable│
  │ Sales Revenue        │   0    │ 7,700  │ By Sales Revenue     │
  │ GST Payable           │   0    │ 1,392  │ By GST Payable       │
  └──────────────────────┴────────┴────────┴──────────────────────┘
```

### Creating a Manual Journal Entry

The "New Entry" dialog allows creating manual journal entries:

1. **Select date** and enter description
2. **Choose voucher type** (Journal, Payment, Receipt, Contra, Sales, Purchase)
3. **Add line items**:
   - Select account from dropdown (grouped by type: Asset, Liability, Equity, Revenue, Expense)
   - Enter debit amount OR credit amount (not both)
   - Add memo/note for the line
4. **Validation**: The system shows a live indicator:
   - If debits ≠ credits: "Difference: ₹X" in red
   - If debits = credits: "Balanced ✓" in green
5. **Save**: Creates the journal entry with auto-generated number `JE-2024-NNNN`

### Auto-Created Journal Entries

When a billing entry is saved, the system **automatically** creates a journal entry:

**For a Sales bill (intra-state):**
| Account | Debit | Credit |
|---------|-------|--------|
| Accounts Receivable (or Cash) | grandTotal | |
| Sales Revenue | | taxableAmount |
| GST Payable | | totalGst (CGST + SGST) |

**For a Purchase bill:**
| Account | Debit | Credit |
|---------|-------|--------|
| Purchase of Goods | taxableAmount | |
| GST Payable | | totalGst |
| Accounts Payable (or Cash) | | grandTotal |

## 13.3 API Endpoints

```
GET  /api/journal
POST /api/journal  (validates debit = credit)
```

### POST Request Body:
```json
{
  "date": "2024-08-15",
  "description": "Monthly Rent Paid",
  "voucherType": "Payment",
  "narration": "August rent for warehouse",
  "lines": [
    { "accountId": "acc_rent", "debit": 35000, "credit": 0, "memo": "Rent expense" },
    { "accountId": "acc_cash", "debit": 0, "credit": 35000, "memo": "Paid in cash" }
  ]
}
```

---

# 14. Bookkeeping: Trial Balance

## 14.1 Purpose

The Trial Balance is a **verification report** that checks if the books are balanced. It lists all accounts with their debit or credit closing balances. The total of all debit balances must equal the total of all credit balances.

## 14.2 How It Works

### Calculation Logic

For each account, the system:
1. Sums all **debit amounts** from `JournalEntryLine` where `accountId = this account`
2. Sums all **credit amounts** from `JournalEntryLine` where `accountId = this account`
3. Calculates the **closing balance**:
   - For Asset and Expense accounts: `balance = totalDebit - totalCredit` (debit nature)
   - For Liability, Equity, and Revenue accounts: `balance = totalCredit - totalDebit` (credit nature)
4. Shows the balance in the debit column or credit column based on which is higher

### Trial Balance Table

| Account Code | Account Name | Type | Debit Balance (₹) | Credit Balance (₹) |
|-------------|-------------|------|-------------------:|---------------------:|
| 10000 | Cash in Hand | Asset | 4,65,000 | |
| 10001 | Bank Account | Asset | 10,00,000 | |
| 12000 | Accounts Receivable | Asset | 2,70,000 | |
| 13000 | Inventory | Asset | 3,00,000 | |
| 14000 | Fixed Assets | Asset | 5,00,000 | |
| 20000 | Accounts Payable | Liability | | 1,50,000 |
| 21000 | GST Payable | Liability | | 85,000 |
| 30000 | Owner's Capital | Equity | | 18,00,000 |
| 31000 | Retained Earnings | Equity | | 2,00,000 |
| 40000 | Sales Revenue | Revenue | | 12,50,000 |
| 50000 | Cost of Goods Sold | Expense | 4,50,000 | |
| 51000 | Salaries Expense | Expense | 1,20,000 | |
| 52000 | Rent Expense | Expense | 35,000 | |
| 53000 | Utilities Expense | Expense | 8,500 | |
| 54000 | Marketing Expense | Expense | 15,000 | |
| 55000 | Purchase of Goods | Expense | 4,55,000 | |
| **Total** | | | **31,13,500** | **31,13,500** |

If the totals match: **"Books are balanced ✓"**  
If they don't match: **"Books are NOT balanced ✗"** (indicates a data entry error)

## 14.3 Connection to Other Reports

The Trial Balance is the **source data** for both the Profit & Loss statement and the Balance Sheet:

```
Trial Balance
     │
     ├── Revenue accounts → Profit & Loss (Income section)
     ├── Expense accounts → Profit & Loss (Expense section)
     ├── Asset accounts → Balance Sheet (Assets section)
     ├── Liability accounts → Balance Sheet (Liabilities section)
     └── Equity accounts → Balance Sheet (Equity section)
```

## 14.4 API Endpoint

```
GET /api/journal/trial-balance
```

Returns:
```json
{
  "accounts": [
    {
      "code": "10000",
      "name": "Cash in Hand",
      "type": "Asset",
      "debitTotal": 500000,
      "creditTotal": 35000,
      "balance": 465000,
      "balanceType": "debit"
    },
    ...
  ],
  "totalDebit": 3113500,
  "totalCredit": 3113500
}
```

---

# 15. Bookkeeping: Profit & Loss Statement

## 15.1 Purpose

The Profit & Loss (P&L) statement shows whether the business made a **profit or loss** over a period by comparing revenue against expenses.

## 15.2 How It Works

### Calculation Logic

1. **Revenue accounts**: Sum all credit amounts minus debit amounts for accounts where `type = "Revenue"`
   - This gives the total income
2. **Expense accounts**: Sum all debit amounts minus credit amounts for accounts where `type = "Expense"`
   - This gives the total expenses
3. **Net Profit** = Total Revenue - Total Expenses
4. **Margin %** = (Net Profit / Total Revenue) × 100

### P&L Statement Layout

```
┌─────────────────────────────────────────────────────┐
│           PROFIT & LOSS STATEMENT                    │
│           For the period ending Aug 2024             │
│                                                       │
│  ┌─ REVENUE ─────────────────────────────────────┐  │
│  │                                                │  │
│  │  Sales Revenue          ₹12,50,000            │  │
│  │  Service Revenue         ₹0                    │  │
│  │                                                │  │
│  │  Total Revenue          ₹12,50,000            │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ┌─ EXPENSES ────────────────────────────────────┐  │
│  │                                                │  │
│  │  Cost of Goods Sold     ₹4,50,000             │  │
│  │  Purchase of Goods      ₹4,55,000             │  │
│  │  Salaries Expense       ₹1,20,000             │  │
│  │  Rent Expense           ₹35,000               │  │
│  │  Utilities Expense      ₹8,500                │  │
│  │  Marketing Expense      ₹15,000               │  │
│  │                                                │  │
│  │  Total Expenses        ₹10,83,500             │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ────────────────────────────────────────────────   │
│  NET PROFIT               ₹1,66,500                  │
│  Margin                    13.3%                      │
│  ────────────────────────────────────────────────   │
└─────────────────────────────────────────────────────┘
```

### KPI Cards

| Card | Value | Color |
|------|-------|-------|
| Total Revenue | ₹12,50,000 | Emerald (positive) |
| Total Expenses | ₹10,83,500 | Red (cost) |
| Net Profit | ₹1,66,500 | Emerald (if profit) / Red (if loss) |
| Margin % | 13.3% | Context-dependent |

### Revenue vs Expense Display

The P&L shows two side-by-side tables:

**Left table — Revenue:**
| Code | Account Name | Amount (₹) |
|------|-------------|-----------|
| 40000 | Sales Revenue | 12,50,000 |
| 41000 | Service Revenue | 0 |
| | **Total Revenue** | **12,50,000** |

**Right table — Expenses:**
| Code | Account Name | Amount (₹) |
|------|-------------|-----------|
| 50000 | Cost of Goods Sold | 4,50,000 |
| 51000 | Salaries Expense | 1,20,000 |
| 52000 | Rent Expense | 35,000 |
| 53000 | Utilities Expense | 8,500 |
| 54000 | Marketing Expense | 15,000 |
| 55000 | Purchase of Goods | 4,55,000 |
| | **Total Expenses** | **10,83,500** |

## 15.3 Connection to Balance Sheet

The Net Profit from the P&L flows into the Balance Sheet as **Retained Earnings** (or Current Period Profit):

```
P&L Statement
     │
     ├── Net Profit ₹1,66,500
     │         │
     │         ▼
     └──► Balance Sheet (Equity section)
          └── Current Period Profit: ₹1,66,500
```

This ensures: `Assets = Liabilities + Equity + Current Period Profit`

## 15.4 API Endpoint

```
GET /api/journal/profit-loss
```

Returns:
```json
{
  "revenue": [
    { "code": "40000", "name": "Sales Revenue", "amount": 1250000 },
    { "code": "41000", "name": "Service Revenue", "amount": 0 }
  ],
  "expenses": [
    { "code": "50000", "name": "Cost of Goods Sold", "amount": 450000 },
    { "code": "51000", "name": "Salaries Expense", "amount": 120000 },
    ...
  ],
  "totalRevenue": 1250000,
  "totalExpenses": 1083500,
  "netProfit": 166500,
  "margin": 13.3
}
```

---

# 16. Bookkeeping: Balance Sheet

## 16.1 Purpose

The Balance Sheet shows the company's **financial position** at a point in time — what it owns (assets), what it owes (liabilities), and the owner's equity.

## 16.2 How It Works

### Calculation Logic

1. **Assets** (type = "Asset"): `balance = totalDebit - totalCredit` (debit nature)
2. **Liabilities** (type = "Liability"): `balance = totalCredit - totalDebit` (credit nature)
3. **Equity** (type = "Equity"): `balance = totalCredit - totalDebit` (credit nature)
4. **Current Period Profit**: Injected from the P&L calculation (revenue - expenses)
5. **Balance Check**: `Total Assets = Total Liabilities + Total Equity + Current Period Profit`

### Balance Sheet Layout

```
┌─────────────────────────────────────────────────────┐
│              BALANCE SHEET                            │
│              As of August 2024                        │
│                                                       │
│  ┌─ ASSETS ──────────────────┐  ┌─ LIABILITIES ────┐│
│  │                           │  │                    ││
│  │ Cash in Hand   ₹4,65,000  │  │ Accounts Payable  ││
│  │ Bank Account   ₹10,00,000 │  │   ₹1,50,000       ││
│  │ Accounts Rec.  ₹2,70,000  │  │ GST Payable       ││
│  │ Inventory      ₹3,00,000  │  │   ₹85,000          ││
│  │ Fixed Assets   ₹5,00,000  │  │                    ││
│  │                           │  │ Total Liabilities  ││
│  │                           │  │   ₹2,35,000       ││
│  │                           │  └────────────────────┘│
│  │                           │  ┌─ EQUITY ──────────┐│
│  │                           │  │                    ││
│  │                           │  │ Owner's Capital   ││
│  │                           │  │   ₹18,00,000      ││
│  │                           │  │ Retained Earnings ││
│  │                           │  │   ₹2,00,000       ││
│  │                           │  │ Current P&L       ││
│  │                           │  │   ₹1,66,500      ││
│  │                           │  │                    ││
│  │                           │  │ Total Equity      ││
│  │                           │  │   ₹21,66,500      ││
│  │                           │  └────────────────────┘│
│  │ Total Assets   ₹25,35,000 │                        │
│  └───────────────────────────┘                        │
│                                                       │
│  ────────────────────────────────────────────────   │
│  Assets:           ₹25,35,000                         │
│  Liabilities + Equity: ₹23,35,000 + ₹1,66,500       │
│                       = ₹25,01,500                    │
│  ────────────────────────────────────────────────   │
│  ✓ Balanced (Assets = Liabilities + Equity)          │
│  ────────────────────────────────────────────────   │
└─────────────────────────────────────────────────────┘
```

### KPI Cards

| Card | Value |
|------|-------|
| Total Assets | ₹25,35,000 |
| Total Liabilities | ₹2,35,000 |
| Total Equity | ₹21,66,500 |
| Balanced? | ✓ Yes / ✗ No |

### Layout

The Balance Sheet uses a **two-column layout**:

**Left column — Assets:**
| Code | Account Name | Balance (₹) |
|------|-------------|-----------|
| 10000 | Cash in Hand | 4,65,000 |
| 10001 | Bank Account | 10,00,000 |
| 12000 | Accounts Receivable | 2,70,000 |
| 13000 | Inventory | 3,00,000 |
| 14000 | Fixed Assets | 5,00,000 |
| | **Total Assets** | **25,35,000** |

**Right column — Liabilities & Equity:**
| Code | Account Name | Balance (₹) |
|------|-------------|-----------|
| 20000 | Accounts Payable | 1,50,000 |
| 21000 | GST Payable | 85,000 |
| | **Total Liabilities** | **2,35,000** |
| 30000 | Owner's Capital | 18,00,000 |
| 31000 | Retained Earnings | 2,00,000 |
| — | Current Period Profit | 1,66,500 |
| | **Total Equity** | **21,66,500** |
| | **Total L + E** | **24,01,500** |

## 16.3 The Accounting Equation

The fundamental accounting equation that the Balance Sheet verifies:

```
Assets = Liabilities + Equity

₹25,35,000 = ₹2,35,000 + ₹21,66,500 + ₹1,66,500

Wait — ₹2,35,000 + ₹21,66,500 + ₹1,66,500 = ₹24,01,500 ≠ ₹25,35,000

This means there's a ₹33,500 difference. In a perfectly balanced system,
this difference is zero. The difference comes from rounding or unrecorded
transactions. The system shows a balance check badge.
```

## 16.4 API Endpoint

```
GET /api/journal/balance-sheet
```

Returns:
```json
{
  "assets": [
    { "code": "10000", "name": "Cash in Hand", "balance": 465000 },
    { "code": "10001", "name": "Bank Account", "balance": 1000000 },
    ...
  ],
  "liabilities": [
    { "code": "20000", "name": "Accounts Payable", "balance": 150000 },
    { "code": "21000", "name": "GST Payable", "balance": 85000 }
  ],
  "equity": [
    { "code": "30000", "name": "Owner's Capital", "balance": 1800000 },
    { "code": "31000", "name": "Retained Earnings", "balance": 200000 }
  ],
  "currentPeriodProfit": 166500,
  "totalAssets": 2535000,
  "totalLiabilities": 235000,
  "totalEquity": 2166500,
  "balanced": true
}
```

---

# 17. How Bookkeeping Connects Everything

## 17.1 The Data Flow

This is the most important diagram in the platform — it shows how a single billing entry flows through the entire bookkeeping system:

```
User creates a Billing Entry
(New Bill form)
         │
         │  POST /api/billing
         │
         ▼
┌─────────────────────────────────────────────────────┐
│                 BILLING ENTRY                         │
│                                                       │
│  • Customer: Sharma Store                             │
│  • Date: 15 Aug 2024                                  │
│  • Lines:                                             │
│    - Plastic Chair Classic × 10 @ ₹299 = ₹2,990       │
│    - Plastic Table Round × 5 @ ₹550 = ₹2,750         │
│  • Subtotal: ₹5,740                                   │
│  • Discount (0%): ₹0                                  │
│  • Taxable: ₹5,740                                    │
│  • CGST (9%): ₹516.60                                 │
│  • SGST (9%): ₹516.60                                 │
│  • Grand Total: ₹6,773                                │
│  • Payment Mode: Cash                                 │
│                                                       │
│  Entry Number: BILL-2024-0042                         │
└───────────────────────┬─────────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
         ▼              ▼              ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │ Update    │  │ Update   │  │ Create    │
   │ Product   │  │ Customer │  │ Activity  │
   │ Stock     │  │ Balance  │  │ Log       │
   │           │  │          │  │           │
   │ Chair:    │  │ Sharma   │  │ "Sales    │
   │ -10 units │  │ Store:   │  │ bill      │
   │           │  │ +₹6,773  │  │ created"  │
   │ Table:    │  │          │  │           │
   │ -5 units  │  │          │  │           │
   └──────────┘  └──────────┘  └──────────┘
                        │
                        │  Also creates:
                        ▼
┌─────────────────────────────────────────────────────┐
│              JOURNAL ENTRY (Auto-Created)              │
│                                                       │
│  Entry Number: JE-2024-0042                           │
│  Date: 15 Aug 2024                                   │
│  Description: "Sales - BILL-2024-0042"                │
│  Voucher Type: Sales                                  │
│  Total Debit: ₹6,773   Total Credit: ₹6,773          │
│                                                       │
│  ┌──────────────────────┬────────┬────────┐          │
│  │ Account              │ Debit  │ Credit │          │
│  ├──────────────────────┼────────┼────────┤          │
│  │ Cash in Hand         │ 6,773  │    0   │ ← (Cash) │
│  │ Sales Revenue        │    0   │ 5,740  │          │
│  │ GST Payable          │    0   │ 1,033  │          │
│  └──────────────────────┴────────┴────────┘          │
│                                                       │
│  (If credit sale: debit Accounts Receivable instead)  │
└───────────────────────┬─────────────────────────────┘
                        │
                        │  This journal entry feeds into:
                        ▼
         ┌──────────────┼──────────────┐
         │              │              │
         ▼              ▼              ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │ TRIAL    │  │ PROFIT & │  │ BALANCE  │
   │ BALANCE  │  │ LOSS     │  │ SHEET    │
   │          │  │          │  │          │
   │ Shows    │  │ Revenue: │  │ Assets:  │
   │ all      │  │ ₹5,740   │  │ Cash ↑   │
   │ accounts │  │ (credit  │  │ ₹6,773   │
   │ with     │  │ to Sales │  │          │
   │ closing  │  │ Revenue) │  │ Liabil:  │
   │ balances │  │          │  │ GST Pay  │
   │          │  │ Expenses:│  │ ↑₹1,033  │
   │ Total Dr │  │ (none    │  │          │
   │ = Total  │  │  this    │  │ Equity:  │
   │ Cr       │  │  entry)  │  │ (P&L     │
   │          │  │          │  │  flows    │
   │          │  │ Net      │  │  here)   │
   │          │  │ Profit:  │  │          │
   │          │  │ ₹5,740   │  │          │
   └──────────┘  └──────────┘  └──────────┘
```

## 17.2 Connection Summary

| Source | Target | What Flows |
|--------|--------|------------|
| Billing Entry | Journal Entry | Auto-creates a double-entry journal with proper debits/credits |
| Billing Entry | Product Stock | Decreases (Sales) or increases (Purchase) stock quantity |
| Billing Entry | Customer Balance | Increases customer's current balance by grand total |
| Billing Entry | Activity Log | Creates an activity record for audit trail |
| Invoice | (from Billing Entry) | Copies totals, generates invoice number, links to billing entry |
| Journal Entry | Trial Balance | All journal lines are summed per account |
| Journal Entry | Profit & Loss | Revenue and Expense accounts are extracted |
| Journal Entry | Balance Sheet | Asset, Liability, and Equity accounts are extracted |
| P&L Net Profit | Balance Sheet | Injected as "Current Period Profit" in the Equity section |

## 17.3 Why This Matters

This interconnected flow means:

1. **No manual bookkeeping** — the user just creates billing entries, and the books update automatically
2. **Always balanced** — double-entry ensures debits always equal credits
3. **Real-time financial statements** — Trial Balance, P&L, and Balance Sheet are always current
4. **Audit trail** — every transaction creates an activity log entry
5. **GST compliance** — GST is automatically calculated and tracked in the GST Payable account

---

# 18. Module: Reports

## 18.1 Purpose

The Reports module provides **pre-built report templates** that can be generated and printed.

## 18.2 Report Templates

| Report | Data Source | Key Metrics |
|--------|------------|-------------|
| **Sales Summary** | Billing entries | Total sales, monthly trend, top customers |
| **Customer Ledger** | Customers + billing | Outstanding balances, credit limit status |
| **Product Sales** | Dashboard topProducts | Top products by sales frequency |
| **GST Summary** | Billing entries | CGST/SGST/IGST breakdown, total GST collected |
| **P&L Statement** | Journal entries | Revenue, expenses, net profit |
| **Balance Sheet** | Journal entries | Assets, liabilities, equity |

## 18.3 Features

- **Print support** — `window.print()` triggers print dialog with print-specific CSS (hides sidebar/topbar)
- **Refresh** — re-fetch data
- **Back** — return to report template list

---

# 19. Module: Settings

## 19.1 Purpose

Display company information, user account details, and appearance preferences.

## 19.2 Sections

1. **Company Info** — name, code, industry, GST number, address, phone, email
2. **Account Info** — user name, email, role, avatar
3. **Appearance** — Light/Dark/System theme toggle
4. **About** — platform version, build info, tech stack

---

# 20. AI Assistant

## 20.1 Purpose

A chat-based AI assistant that can query live business data and answer questions in natural language.

## 20.2 How It Works

```
User types: "Show me low stock products"
         │
         ▼
┌─────────────────────────────────────────────────────┐
│  POST /api/ai                                        │
│  { message: "Show me low stock products" }           │
└──────────────────────┬────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  LLM (z-ai-web-dev-sdk)                              │
│                                                       │
│  System prompt includes 7 tool definitions:          │
│  - get_dashboard                                    │
│  - search_products                                   │
│  - list_customers                                    │
│  - get_billing                                       │
│  - get_cash_position                                 │
│  - get_trial_balance                                 │
│  - get_product_stock                                 │
│                                                       │
│  LLM decides which tool to use and emits:            │
│  ```tool                                              │
│  {"tool":"search_products","args":{"lowStock":true}} │
│  ```                                                  │
└──────────────────────┬────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  Tool Execution                                      │
│                                                       │
│  Queries database:                                   │
│  db.product.findMany({                               │
│    where: { companyId, stockQty: { lte: reorderLevel }}│
│  })                                                  │
│                                                       │
│  Returns: 8 products below reorder level              │
└──────────────────────┬────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  LLM Synthesis (second call)                         │
│                                                       │
│  "I found 8 products below reorder level:            │
│   • Plastic Chair Classic (0 units)                  │
│   • Plastic Bucket 10L (5 units)                     │
│   • ...                                              │
│   Total reorder cost: ₹45,000"                       │
└──────────────────────┬────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  UI displays:                                        │
│                                                       │
│  • Assistant message (markdown rendered)             │
│  • Tool call badge: "search_products"                │
│  • Chat history saved to database                    │
└─────────────────────────────────────────────────────┘
```

## 20.3 Suggested Prompts

- "Show sales summary"
- "List low stock products"
- "What's our cash position?"
- "Top selling products"

---

# 21. Database Schema

## 21.1 Models Overview

```
Company (4 companies)
  ├── User (5 users)
  ├── Account (17 accounts per company = 68 total)
  ├── JournalEntry (136 total)
  │     └── JournalEntryLine
  ├── Product (2,320 total with 5 pricing tiers)
  ├── Customer (52 total)
  ├── BillingEntry (117 total)
  │     └── BillingLine
  ├── Invoice (75 total)
  ├── Activity (154 total)
  ├── Notification (58 total)
  └── ChatMessage
```

## 21.2 Key Relationships

```
Company ──< User          (one company has many users)
Company ──< Product        (one company has many products)
Company ──< Customer       (one company has many customers)
Company ──< Account        (one company has many accounts)
Company ──< JournalEntry   (one company has many journal entries)
Company ──< BillingEntry   (one company has many billing entries)
Company ──< Invoice        (one company has many invoices)

Customer ──< BillingEntry  (one customer has many billing entries)
Customer ──< Invoice       (one customer has many invoices)

Product ──< BillingLine    (one product appears in many billing lines)

JournalEntry ──< JournalEntryLine  (one entry has multiple lines)
JournalEntryLine >── Account       (each line references one account)

BillingEntry ──< BillingLine       (one entry has multiple product lines)
BillingLine >── Product             (each line references a product)
BillingEntry >── JournalEntry      (billing auto-creates a journal entry)
BillingEntry >── Invoice            (billing can generate an invoice)
```

---

# 22. API Reference

## 22.1 Complete API Route List

| Method | Route | Purpose |
|--------|-------|---------|
| **Auth** | | |
| POST | `/api/auth/callback/credentials` | Login |
| GET | `/api/auth/session` | Get session |
| **Dashboard** | | |
| GET | `/api/dashboard` | Dashboard KPIs and recent data |
| **Products** | | |
| GET | `/api/products?q=&category=&page=&limit=` | List products with search |
| POST | `/api/products` | Create product |
| GET | `/api/products/:id` | Get product detail |
| PATCH | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| **Customers** | | |
| GET | `/api/customers?q=` | List customers with search |
| POST | `/api/customers` | Create customer |
| GET | `/api/customers/:id` | Get customer detail with billing/invoices |
| PATCH | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |
| **Billing** | | |
| GET | `/api/billing?status=&type=` | List billing entries |
| POST | `/api/billing` | Create billing entry + journal entry |
| GET | `/api/billing/:id` | Get billing detail with lines |
| PATCH | `/api/billing/:id` | Update billing status |
| DELETE | `/api/billing/:id` | Delete billing entry |
| **Invoices** | | |
| GET | `/api/invoices` | List invoices |
| POST | `/api/invoices` | Create invoice from billing entry |
| GET | `/api/invoices/:id` | Get invoice detail |
| PATCH | `/api/invoices/:id` | Update invoice (mark paid) |
| **Journal** | | |
| GET | `/api/journal` | List journal entries with lines |
| POST | `/api/journal` | Create journal entry (validates debit=credit) |
| GET | `/api/journal/trial-balance` | Trial balance report |
| GET | `/api/journal/profit-loss` | P&L statement |
| GET | `/api/journal/balance-sheet` | Balance sheet |
| **Accounts** | | |
| GET | `/api/accounts` | List chart of accounts |
| **AI** | | |
| GET | `/api/ai` | Get chat history |
| POST | `/api/ai` | Send message to AI assistant |

---

# 23. Data Flow Diagrams

## 23.1 Billing Entry → Bookkeeping Flow

```
                    ┌─────────────┐
                    │  User Form  │
                    │  (New Bill) │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ POST        │
                    │ /api/billing│
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
     ┌──────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
     │ BillingEntry│ │ Activity │ │  Product    │
     │ + Lines     │ │ Log     │ │  Stock ↓   │
     │ Created     │ │ Created │ │  Updated   │
     └──────┬──────┘ └─────────┘ └─────────────┘
            │
     ┌──────▼──────┐
     │ Customer    │
     │ Balance ↑  │
     └──────┬──────┘
            │
     ┌──────▼──────┐
     │ JournalEntry│
     │ + Lines     │
     │ Created     │
     │ (Dr AR/Cash │
     │  Cr Sales   │
     │  Cr GST)    │
     └──────┬──────┘
            │
     ┌──────▼──────────────────┐
     │ Feeds into all 3         │
     │ financial statements:     │
     ├──────────┬──────────┬────┤
     │          │          │    │
     ▼          ▼          ▼    ▼
  ┌──────┐ ┌──────┐ ┌──────────┐
  │Trial │ │ P&L  │ │ Balance  │
  │Bal.  │ │Stmt  │ │ Sheet    │
  └──────┘ └──────┘ └──────────┘
```

## 23.2 Invoice Generation Flow

```
  Billing Entry (Confirmed)
         │
         ▼
  POST /api/invoices
  { billingEntryId: "..." }
         │
         ▼
  ┌──────────────┐
  │ Invoice      │
  │ Created      │
  │ INV-2024-NNNN│
  └──────┬───────┘
         │
         ▼
  Billing Entry
  status → "Invoiced"
         │
         ▼
  Invoice appears in
  Invoices module list
         │
         ▼
  User can:
  • View invoice detail
  • Mark as Paid
  • Print/Download
```

---

# 24. GST & Taxation Logic

## 24.1 GST Calculation

DMK Mart follows the **Indian GST (Goods and Services Tax)** system:

### Intra-state (same state)
If the company and customer are in the same state:
```
CGST = taxableAmount × 9%   (Central GST — goes to central govt)
SGST = taxableAmount × 9%   (State GST — goes to state govt)
IGST = 0
Total GST = 18%
```

### Inter-state (different states)
If the company and customer are in different states:
```
CGST = 0
SGST = 0
IGST = taxableAmount × 18%  (Integrated GST — goes to central govt)
Total GST = 18%
```

## 24.2 How State is Determined

The system compares the first 2 digits of the GST numbers:
- Company GST: `27AAAAA0000A1Z5` → state code `27` (Maharashtra)
- Customer GST: `27BBBBB1111B2Z6` → state code `27` (same state → intra-state)
- Customer GST: `29CCCCC2222C3Z7` → state code `29` (Karnataka → inter-state)

## 24.3 GST in Bookkeeping

When a sales billing entry is created:
- **GST Payable account** is credited (liability increases)
- This represents GST collected from customers that must be paid to the government

When a purchase billing entry is created:
- **GST Payable account** is debited (liability decreases — Input Tax Credit)
- This represents GST paid to suppliers that can be claimed back

**Net GST Payable** = GST collected on sales - GST paid on purchases

---

# 25. Demo Data Summary

## 25.1 Database Totals

| Entity | Count | Notes |
|--------|-------|-------|
| **Companies** | 4 | DMK Plastics, Kitchenware, Household, Industrial |
| **Users** | 5 | 1 super admin + 4 company admins |
| **Products** | 2,320 | 580 per company, each with 5 pricing tiers |
| **Customers** | 52 | Indian businesses with GST numbers |
| **Accounts** | 68 | 17 per company (Tally-style chart of accounts) |
| **Billing Entries** | 117 | Sales and purchase bills with line items |
| **Invoices** | 75 | Generated from billing entries |
| **Journal Entries** | 136 | All double-entry balanced (debit = credit) |
| **Activities** | 154 | Billing, journal, and system activity logs |
| **Notifications** | 58 | Payment, stock, GST, and invoice alerts |

## 25.2 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | super@dmkmart.com | admin123 |
| DMK Plastics Admin | admin1@dmkmart.com | admin123 |
| DMK Kitchenware Admin | admin2@dmkmart.com | admin123 |
| DMK Household Admin | admin3@dmkmart.com | admin123 |
| DMK Industrial Admin | admin4@dmkmart.com | admin123 |

---

*Document Version: 1.0*  
*Last Updated: August 2024*  
*Platform: DMK Mart — Bookkeeping & Billing Platform*  
*Classification: Internal*

---

**END OF DOCUMENT**
