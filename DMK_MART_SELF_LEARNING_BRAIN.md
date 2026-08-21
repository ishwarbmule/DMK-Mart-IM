# DMK Mart — Self-Learning Autonomous Brain & Platform Specification
## Trading & Distribution ERP for Plastic Goods (B2B & B2C)

---

# 1. Platform Philosophy & Business Model

**DMK Mart** operates as a **Plastic Goods Trading and Distribution Enterprise**. Rather than only pure in-house manufacturing, DMK Mart acts as a centralized wholesale and retail distribution powerhouse:
1. **Procurement**: Purchases raw and finished plastic goods in bulk from **Manufacturers** (brand-exclusive products) and **Distributors** (multi-brand aggregators).
2. **Sales & Distribution**: Sells to **B2B Buyers** (Wholesalers, Sub-dealers, Retailers, Commercial Clients) and **B2C Counter Buyers** (Walk-in retail consumers).
3. **Packaging Formats**: Products move in single units, packets (e.g. 5 pcs), sets (e.g. 10 pcs), boxes (12 pcs), crates (24 pcs), or master bulk lots.
4. **Dual Stock Segregation**: Strict separation between **Main Sellable Stock** and **Damaged / Broken / Defective Stock**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 DMK MART COMMERCE LIFECYCLE                            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   [ SUPPLIERS ] ──(Purchase Order: Pending)──► [ WAREHOUSE INWARD RECEIPT ]            │
│   • Manufacturers (Brand-bound SKUs)                      │                            │
│   • Distributors (Multi-brand Catalog)                    ▼                            │
│                                            [ MAIN SELLABLE STOCK ] (Stock Increases)   │
│                                                           │                            │
│                                                           ├──► (Sales Order Placed)    │
│                                                           │    • B2B (Location First)  │
│                                                           │    • B2C (Counter Lookup)  │
│                                                           │    • Dynamic Bulk Tiers    │
│                                                           │            │               │
│                                                           │            ▼               │
│                                                           │    [ CUSTOMER DELIVERED ]  │
│                                                           │            │               │
│                                                           │    (Sales Return: Broken)  │
│                                                           │            ▼               │
│   [ SUPPLIER PURCHASE RETURN ] ◄──────────────────────────┴─── [ DAMAGED/BROKEN STOCK]│
│   • Returns defective goods back to Vendor                     (Segregated from Main)  │
│   • Generates Debit Note in Accounting                                                │
│   • Decreases Damaged Stock & Vendor Closing Balance                                   │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# 2. Purchase Workflow & Dedicated Subsections

The Purchase department is architected into **4 specialized sub-modules**:

```
PURCHASE NAVIGATION:
├── 🚚 Purchase Orders (purchase_orders)      --> Fast Procurement Terminal & PO Register
├── 🔄 Purchased Returns (purchase_returns)  --> Damaged Goods Returns & Debit Notes
├── 💳 Vendor Payments (vendor_payments)    --> Payment Disbursements & Supplier Ledgers
└── 🏢 Supplier Accounts (vendors_directory)  --> Active & Archived Supplier Master
```

### 2.1 Fast Procurement Terminal
- **Sales-Billing Style Interface**: Left side includes Supplier Selector, Typeahead Product Search with category filters, and an Interactive Procurement Cart with quantity steppers and base cost editing. Right side includes Real-time Tax Summary (Subtotal, CGST/SGST or IGST, Total) and Dual Order Issuance (`+ Issue PO (Pending Inward)` vs `⚡ Express Inward & Confirm Stock`).
- **Brand-Bound Catalog Scoping**:
  - If a **Manufacturer** is selected (e.g. *Nilkamal Plastics*, *Supreme Industries*), product search auto-scopes exclusively to that manufacturer's brand portfolio.
  - If a **Distributor** is selected (e.g. *National Polymer Distributors*), full unrestricted catalog search is available across all plastic categories.

### 2.2 Purchase Order State Machine & Lifecycle Actions
```
[ DRAFT / PENDING ] ──┬──► [ RE-EDIT ORDER ] (Add/Remove items, change quantities, costs)
                      ├──► [ CANCEL ORDER ]  (Audit trail preserved in register)
                      └──► [ CONFIRM INWARD RECEIPT ]
                                   │
                                   ├──► Main Sellable Stock (+)
                                   ├──► Vendor Payable (+)
                                   └──► Double-Entry Purchase Journal Entry Posted
```
1. **Pending PO Register**:
   - Lists all orders awaiting shipment delivery.
   - **Re-edit Action**: Opens a responsive line-item editor allowing adding new products, adjusting quantities, modifying unit base costs, or removing line items.
   - **Cancel Action**: Prompts for cancellation reason and marks the PO as `CANCELLED` without deleting the historical audit record.
   - **Inward Receipt Confirmation**: Triggered when goods physically arrive at warehouse bay. Updates inventory, posts accounting journal, and increases vendor payable balance.

### 2.3 Purchased Returns (Damaged Goods Return to Vendor)
- Quarantined damaged items are returned to the sourcing supplier.
- Directly decrements **Damaged Stock** (keeping sellable stock untouched).
- Generates a **Debit Note** in accounting and decrements the Vendor's Closing Balance.

### 2.4 Vendor Payments & Double-Entry Ledger
- Disburses payments via Bank NEFT/RTGS, UPI, or Cheque.
- Live running ledger showing all `PURCHASE` vouchers (Credit/Payable), `DEBIT_NOTE` vouchers (Debit/Deductions), and `PAYMENT` vouchers (Debit/Settlements).

---

# 3. Sales Workflow & B2C Counter Hub

The Sales department is architected into specialized sub-modules:

```
SALES NAVIGATION:
├── ⚡ POS Terminal (pos_terminal)             --> Quick Counter Touchscreen Terminal
├── 📑 Sales Orders & Billing (billing)        --> Multi-Company 5-Tier Invoice Terminal
├── 📦 Dispatch & Invoices (invoices)          --> Downloadable/Printable Tax Invoices & Reports
├── 🔄 Sales Returns (sales_returns)           --> Customer Broken Goods & Credit Notes
└── 👥 Customer Accounts (customer_accounts)   --> Active B2B, B2C Walk-ins & Archived Accounts
```

### 3.1 3-Tier Product Cell Rule for Billing Carts
In the sales and purchase billing carts, product information adheres strictly to the **3-Tier Vertical Rule**:
- **Tier 1 (Top)**: Product Name clamped to max 2 lines with bold typography.
- **Tier 2 (Middle)**: `SKU | HSN: [code]` displayed on **ONE single line** separated by `|`.
- **Tier 3 (Bottom)**: Volume Bulk Savings tag displayed on **ONE single line** with no-wrap styling (`whiteSpace: 'nowrap'`).

### 3.2 B2B Customer Naming Convention (Location-First)
- Format: `[City / Location] [Firm / Client Name]`
- Examples: `Latur Ishwar Mule`, `Pune Sri Venkateswara Plastic Agencies`, `Solapur Ganesh Traders`.
- Displays live closing balance (`Dr` receivable) and lifetime purchase metrics.

### 3.3 B2C Walk-In Counter Sales Hub & Spot Settlements
- **Closing Balance vs Lifetime Spend**:
  - Because retail walk-in buyers pay on the spot via Cash or UPI, their **Debt Closing Balance is ₹0.00 (Cleared/Settled)**.
  - The ERP displays **BOTH**:
    1. **Lifetime Purchased Value** (e.g. `Bought: ₹66,950`).
    2. **Invoices Count** (e.g. `4 Bills`).
    3. **Closing Balance Status** (`₹0.00 Settled` for B2C, or `₹... Dr` for B2B credit).
- **Master-Detail Walk-in Buyers Directory (`B2C Counter Buyers`)**:
  - **Left Column**: Searchable list of registered walk-in buyers with Name, City, Phone, Visits, and Total Spend.
  - **Right Column**: Detailed buyer profile showing all past invoices, item breakdown, quantities, unit prices, and **View Invoice** action button.

---

# 4. Account Lifecycle, Archival & Data Preservation

To maintain complete financial auditability and compliance, removing an account adheres to the **Soft Delete / Archival Standard**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA PRESERVATION GUARANTEE                     │
├────────────────────────────────────────────────────────────────────────┤
│ When a customer or supplier account is removed:                        │
│  ✔ Past Tax Invoices & POs remain UNTOUCHED in accounting & reports.  │
│  ✔ Double-entry ledger entries remain fully intact.                   │
│  ✔ Account is moved to the Archived subsection for audit compliance.   │
│  ✔ Accounts can be restored to Active status at any time with 1 click. │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Sales Customer Accounts Lifecycle
1. **Active B2B Accounts**: Full client list with live receivable balances and running ledgers.
2. **B2C Counter Buyers**: Directory of individual walk-in buyers with visit counts and spending history.
3. **Archived Customer Accounts**: Dedicated subsection listing all deactivated accounts, archival timestamps, deactivation reasons, lifetime revenue generated, and a **1-Click Reactivate Account** button (`RotateCcw`).

### 4.2 Purchase Supplier Accounts Lifecycle
1. **Active Suppliers**: Directory of Manufacturers and Distributors with live payable balances.
2. **Archived Suppliers**: Dedicated subsection listing all deactivated suppliers, archival timestamps, deactivation reasons, historical POs count, lifetime spend, and a **1-Click Reactivate Supplier** button (`RotateCcw`).

---

# 5. Dual Stock Management & Low Stock Alert System

### 5.1 Stock Pools Per SKU
Every product in the catalog maintains two independent inventory counters:
1. **`stockQuantity` (Main Sellable Stock)**: Available for customer sales and counter billing.
2. **`damagedStock` (Damaged / Broken / Defective Stock)**: Unsellable items quarantined for return to vendor or salvage.

### 5.2 Stock Transition Truth Table
| Event | Main Stock | Damaged Stock | Accounting Voucher |
|---|---|---|---|
| **Purchase Order Confirmed** | $\uparrow +Q$ | No Change | Purchase Voucher (Cr Vendor) |
| **Sales Order Billed** | $\downarrow -Q$ | No Change | Sales Voucher (Dr Customer) |
| **Sales Return (Defective Item)** | No Change | $\uparrow +Q$ | Credit Note (Cr Customer) |
| **Purchase Return to Vendor** | No Change | $\downarrow -Q$ | Debit Note (Dr Vendor) |
| **Internal Damage Write-off** | $\downarrow -Q$ | $\uparrow +Q$ | Internal Transfer Voucher |

### 5.3 Low Stock Alert System
- Configurable **`lowStockThreshold`** per SKU.
- Persistent indicators and 1-Click "Draft Purchase Order" generation from the dashboard.

---

# 6. Monetary Engine & Volume/Bulk Pricing

### 6.1 Multi-Tier Pricing Architecture
1. `tier1_distributor`: Master distributor base rate.
2. `tier2_wholesale`: Wholesaler bulk rate.
3. `tier3_semi_wholesale`: Sub-dealer rate.
4. `tier4_retailer`: Retail shop rate.
5. `tier5_mrp`: Maximum Retail Price for direct consumers.

### 6.2 Dynamic Quantity-Based Bulk Tier Discount
| Packaging Format | Quantity Range | Bulk Discount Percentage | Visual Badge Displayed |
|---|---|---|---|
| **Single Pieces** | $1 - 4 \text{ units}$ | $0\%$ | Standard Piece Rate |
| **Packet Rate** | $5 - 9 \text{ units}$ | $-3\%$ to $-5\%$ | `📦 Packet Rate Applied (-5%)` |
| **Set Rate** | $10 - 23 \text{ units}$ | $-6\%$ to $-10\%$ | `✨ Set of 10 Rate Applied (-8%)` |
| **Box / Crate Rate** | $24 - 49 \text{ units}$ | $-12\%$ to $-15\%$ | `🚀 Crate of 24 Bulk Rate (-15%)` |
| **Master Lot** | $50+ \text{ units}$ | $-18\%$ to $-22\%$ | `🔥 Master Wholesale Lot (-20%)` |

---

# 7. Strict UI/UX Governance & Responsive Design Standards

- **Cross-Device Compatibility**: Laptop (1366px–1920px), Desktop (4K/Ultrawide), Tablet (768px–1024px), Mobile (360px–480px).
- **Responsive Layout Rules**:
  - Left navigation sidebar collapses to mobile drawer with hamburger toggle.
  - Multi-column forms and split billing terminals collapse gracefully to single-column vertical stacks on mobile and tablet (`.responsive-billing-grid`).
  - Table containers enforce `overflowX: 'auto'` with explicit column widths to prevent page blowout.
- **Design Tokens**:
  - Dark Theme background: `--bg-primary` (`#0B0F17`), `--bg-secondary` (`#111827`), `--bg-tertiary` (`#1F2937`).
  - Accents: Orange (`#FF6B00`), Emerald (`#10B981`), Sky Blue (`#38BDF8`), Crimson (`#EF4444`).
  - Typography: Clean sans-serif with JetBrains Mono for monetary and voucher figures.

---

# 8. Double-Entry Accounting & Financial Statements

### 8.1 Chart of Accounts (Tally-Inspired 17 Accounts)
- **Assets (10000–19999)**: Cash in Hand (`10000`), HDFC Operating Bank (`10001`), Accounts Receivable (`12000`), Sellable Inventory (`13000`), Damaged Stock Asset (`13500`), Fixed Assets (`14000`).
- **Liabilities (20000–29999)**: Accounts Payable (`20000`), GST Duties & Taxes (`21000`).
- **Equity (30000–39999)**: Owner's Capital (`30000`), Retained Earnings (`31000`).
- **Revenue (40000–49999)**: Domestic Plastic Sales Revenue (`40000`), Counter Retail Sales Revenue (`40500`), Job Work Revenue (`41000`), Sales Returns (`42000` - Contra Revenue).
- **Expenses (50000–59999)**: COGS / Purchases (`50000`), Purchase Returns (`50500` - Contra Expense), Salaries (`51000`), Rent (`52000`), Electricity (`53000`), Freight (`54000`), Ancillary (`55000`).

### 8.2 Real-Time Financial Reports
1. **Daily Daybook**: Chronological ledger of all vouchers.
2. **Trial Balance**: Validates strict double-entry equality ($\sum \text{Debits} = \sum \text{Credits}$).
3. **Profit & Loss Statement**: Gross and Net profit incorporating returns.
4. **Balance Sheet**: Assets vs Liabilities + Equity.
5. **Party Ledgers**: Running statements for B2B, B2C, and Suppliers.

---

# 9. AI Copilot Integration & Autonomous Intelligence

The AI Copilot has full read and reasoning authority over all platform sub-systems:
- **Inventory & Stock Intelligence**: Analyzes stock levels, low-stock items, safety lead times, and recommends exact reorder quantities and suppliers.
- **Damaged Stock Analysis**: Evaluates total broken stock valuation and drafts Purchase Return batches mapped to the original vendor.
- **Financial & Balance Lookups**: Responds instantly with opening/closing balances for any customer or vendor.
- **Sales Analytics**: Contrasts B2B wholesale revenue vs B2C counter sales and predicts high-demand seasonal plastic items.
