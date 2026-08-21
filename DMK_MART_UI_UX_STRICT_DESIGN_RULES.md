# DMK MART ERP — STRICT UI/UX & RESPONSIVENESS DESIGN SYSTEM SPECIFICATION

> [!IMPORTANT]
> **MANDATORY DESIGN GOVERNANCE RULE**: All frontend contributions, modifications, new components, and module edits in DMK Mart ERP MUST strictly comply with the layout, typography, color, spacing, table formatting, and multi-device responsiveness standards defined in this document. Any deviation that breaks alignments, squeezes table columns, allows uncontrolled text wrapping, or ignores mobile/tablet viewports is strictly prohibited.

---

## 1. Multi-Device Viewport Breakpoints & Responsiveness Matrix

DMK Mart ERP must render with pixel-perfect alignment across four distinct hardware form-factors:

| Form Factor | Breakpoint (px) | Layout Behavior | Navigation (Sidebar) | Table & Grid Handling |
| :--- | :--- | :--- | :--- | :--- |
| **Wide Desktop** | $\ge 1400\text{px}$ | 2-Column Canvas (`1fr 340px`), Full KPI Row | Full Width ($270\text{px}$), All Badges Visible | Full Data Grid with fixed headers |
| **Standard Laptop** | $1100\text{px} - 1399\text{px}$ | 2-Column Canvas (`1fr 320px`), Auto-wrapping Header | Full Width or Collapsed ($76\text{px}$) | Minimum table width $880\text{px}$ with smooth scroll |
| **Tablet / iPad** | $768\text{px} - 1099\text{px}$ | 1-Column Canvas (`1fr`), Summaries Stacked Below | Auto-collapsed ($76\text{px}$) or Drawer Overlay | Horizontal scroll wrapper with touch momentum |
| **Mobile Phone** | $< 768\text{px}$ | 1-Column Fluid Cards, Stacked Action Buttons | Off-Canvas Drawer (`transform: translateX(-100%)`) triggered via Hamburger Button | Minimum touch target size $44\text{px}$, responsive cards |

---

## 2. Left Panel (Sidebar) Hierarchy & Simple Naming Standards

The sidebar navigation is strictly partitioned into distinct functional areas with simple, human-friendly names:

1. **Dashboard**
   - 📊 `Overview Dashboard` (`dashboard`) — Live business performance, dual-stock valuation & low stock alerts.
2. **Sales**
   - 🧾 `Sales Billing` (`typeahead_billing`) — Fast B2B & Retail invoicing with live 5-tier pricing & bulk discounts.
   - 🛒 `POS Cash Counter` (`pos`) — Express walk-in counter retail checkout.
   - 👥 `Customers & Buyers` (`customers`) — B2B location-first accounts & B2C counter directory.
3. **Purchase**
   - 🚚 `Purchase & Sourcing` (`purchase_management`) — Manufacturer/Distributor orders, inward confirmation, debit notes & payables.
4. **Inventory**
   - 📦 `Stock & Low Stock` (`inventory_stock`) — Main sellable vs damaged broken stock matrix & threshold alerts.
5. **Financial & Accounting**
   - 📖 `Daybook & Accounts` (`bookkeeping`) — Tally-compatible Daybook, P&L, and Balance Sheet statements.
6. **Invoices & Reports**
   - 🖨️ `Tax Invoices & Prints` (`invoice_viewer`) — A4 official GST tax invoices with signed QR & bank details.
   - 📊 `Reports & Analysis` (`reports`) — GSTR-1, sales audits & SKU profitability analytics.
7. **System & AI**
   - 🤖 `AI Copilot Assistant` (`swarm_visualizer`) — Live ERP Copilot Swarm.
   - ⚙️ `Company Settings` (`settings`) — Multi-company profiles & banking details.

---

## 3. Cart & Table Row Alignment Rules (Zero Text-Wrapping Distortion)

### Line Clamping & Column Width Constraints
- **Product Name & SKU Column**:
  - Minimum width: `220px` - `260px` (or `28%` of table width).
  - Maximum lines: **2 lines max** via CSS line-clamp:
    ```css
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
    ```
  - Subtitle: SKU and HSN code in single horizontal flex row (`font-size: 11px`, `color: var(--text-tertiary)`).
  - Bulk discount badge: Pill container rendered cleanly below subtitle.
- **Price Tier Column**:
  - Width: `150px` - `165px`. Dropdown select with 11px semibold text.
- **Quantity Stepper Column**:
  - Width: `120px` - `130px`. Stepper box with $-$, input (`width: 46px`), $+$ buttons.
- **Rate, Taxable, GST & Total Columns**:
  - Numeric columns MUST be right-aligned (`text-align: right`).
  - Font: JetBrains Mono (`var(--font-mono)`), `font-variant-numeric: tabular-nums`.
- **Delete / Action Column**:
  - Width: `45px` - `50px`. Centered red danger button with hover state.

---

## 4. Typography Scale & Font Sizing Standards

| Element Type | Font Size | Weight | Line Height | Color Token |
| :--- | :--- | :--- | :--- | :--- |
| **Page Title (H1)** | `22px` | `800` (ExtraBold) | `1.25` | `var(--text-primary)` (`#FFFFFF`) |
| **Section Header (H2)** | `17px` - `18px` | `800` (ExtraBold) | `1.30` | `var(--text-primary)` (`#FFFFFF`) |
| **Card Header / Modal Title (H3)** | `14px` - `15px` | `700` (Bold) | `1.35` | `var(--text-primary)` (`#FFFFFF`) |
| **Primary Body Text** | `13px` | `500` (Medium) | `1.50` | `var(--text-secondary)` (`#CBD5E1`) |
| **Secondary Subtext / Captions** | `11px` - `11.5px` | `500` / `600` | `1.40` | `var(--text-tertiary)` (`#94A3B8`) |
| **Micro Badges / Status Pills** | `9.5px` - `10.5px` | `800` (Bold) | `1.00` | High-contrast pill colors |
| **Tabular Numbers & Currency** | `12px` - `24px` | `700` - `900` | `1.00` | `var(--font-mono)` |

---

## 5. Color System & High-Contrast Palette

- **Background Surfaces**:
  - Canvas Deep: `#090C11`
  - Card & Container Surface: `#111622`
  - Elevated Headers & Tables: `#171E2E`
- **Primary Brand Accent**:
  - DMK Warm Electric Orange: `#FF6B00` / `#FF851B`
- **Semantic Accents**:
  - Emerald Green (Stock OK, Confirm, Receivable Payments): `#10B981`
  - Sky Cyan (Manufacturer, B2B Wholesaler, Invoices): `#38BDF8` / `#0284C7`
  - Amber Gold (Pending POs, Low Stock Alert, Semi-Wholesale): `#F59E0B`
  - Crimson Red (Damaged Stock, Overdue, Cancelled POs): `#EF4444`

---

## 6. Verification Checklist Before Every Build

1. [x] **No Text Squishing**: No product name wraps across 3+ lines.
2. [x] **Horizontal Overflow Contained**: All data tables wrapped in `.cart-table-wrapper` or `.table-responsive-box`.
3. [x] **Mobile Navigation Drawer**: Sidebar hides cleanly behind hamburger toggle on screen widths $\le 900\text{px}$.
4. [x] **Multi-Device Grid Stack**: 2-column canvases switch to 1-column on tablet/mobile screens.
5. [x] **Production Build Cleanliness**: Zero TypeScript errors, zero CSS conflicts.
