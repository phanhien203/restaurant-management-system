# QR Table Ordering – Functional Requirements

| Item | Value |
|---|---|
| Document | Functional Requirements – Module M2 (Ordering) |
| Version | 1.0 – Draft |
| Date | 2026-10-27 |
| Parent document | [Restaurant Management System – Business Requirements](restaurant-management-system-requirements.md) |

## 0. Overview

Guests seated at a table scan the table's QR code with their own phone, browse the menu, and place orders. No app installation is needed (mobile web). A waiter confirms each QR order before it is sent to the kitchen.

**MVP scope:** table service, **multiple ordering rounds** per table session, **payment at the end** of the meal. Café, pay-first, and takeaway flows are out of scope.

## 1. Goals

- Guests wait less to order, and staff spend less time taking orders.
- Higher average bill value through photos, suggestions, and easy re-ordering.
- Fewer order mistakes: orders reach the kitchen quickly and exactly as entered.
- Faster table turnover and real-time visibility of every table.

## 2. User Roles

| Role | Responsibilities in this module |
|---|---|
| Guest | Scans the QR code, orders, tracks dishes, calls a waiter, requests the bill |
| Waiter | Opens and closes table sessions, confirms or rejects QR orders, enters orders, serves |
| Kitchen / Bar staff | Prepare items and update their status |
| Cashier | Prepares the bill, applies discounts, takes payment, records invoice details |
| Manager / Tenant Admin | Manages the menu, tables, QR codes, staff accounts, and settings |

## 3. Guest Flow

`Scan QR → menu opens (table detected) → add items → review cart → submit → waiter confirms → kitchen prepares → served → order another round (repeat) → request bill → pay → session closed`

## 4. Core Features (MVP)

### 4.1 QR Code & Table Session
- Each table has its own fixed QR code; scanning it identifies the branch and table.
- **Table session:** opened by a waiter when seating guests, or automatically at the first scan. It closes once the bill is fully paid. All orders in the session go on the same bill.
- Several guests at the same table can scan the code and order into the same session.
- Protection against prank or remote orders: each session has its own token, which stops working when the session closes, and every QR order needs waiter confirmation.

### 4.2 Digital Menu
- Categories, item photos, descriptions, prices, and tags (best seller, spicy, vegetarian, new).
- **Modifiers:** portion size, doneness, spice level, side dishes, exclusions (e.g. "no onion"), set menus.
- Real-time availability: sold-out items are shown greyed out and cannot be ordered.
- Menus by time of day (e.g. lunch, dinner, happy hour).
- Search and filters; allergen information.
- Vietnamese and English at minimum.

### 4.3 Cart & Ordering
- Add, edit, or remove items; add a note to each item.
- Before submitting, guests see the cart total, including service charge and VAT.
- Order in rounds (e.g. drinks first, mains later); **re-order** items from earlier rounds in one tap.
- After submitting, guests see a confirmation with the round number.

### 4.4 Order Tracking & Guest Requests
- Item status: Waiting for confirmation → Confirmed → Preparing → Ready → Served (or Rejected, with a reason).
- **Call waiter** button, with an optional reason (water, cutlery, other help).
- **Request bill** button.
- View the running bill for the whole table.

### 4.5 Waiter App (phone or tablet)
- Live floor plan with table status: Empty, Occupied, Waiting for food, Bill requested, Cleaning.
- Real-time alerts for new QR orders, waiter calls, and bill requests.
- **Confirm or reject QR orders** (edit them with the guest if needed) before they go to the kitchen.
- Enter orders for guests who do not use QR; these go straight to the kitchen.
- Move, merge, or split tables; transfer items between tables.
- Mark items as served.

### 4.6 Kitchen Display System (KDS)
- Items routed to the right station (e.g. kitchen, bar, dessert); tickets can also be printed.
- Each ticket shows the table, round number, modifiers, and notes clearly.
- Ticket timer, colour-coded by waiting time; rush flag.
- Mark items as Preparing or Ready; mark an item as **sold out**, which updates the QR menu immediately.

### 4.7 Bill & Payment
- **MVP payment methods:** cash or card at the counter (card on the restaurant's existing terminal), or bank transfer via **VietQR**, shown on the pre-bill or on the guest's phone. The cashier confirms every payment.
- Split the bill (equally, by item, or by person).
- Discounts, vouchers, service charge, VAT, and tips.
- Guests can request an e-invoice by entering company name, tax code, and address.
- Once the bill is fully paid, the session closes and the table status changes to Cleaning.
- **Later phases:** automatic confirmation of bank transfers, e-wallets (MoMo, VNPay, ZaloPay).

### 4.8 Back Office
- **Menu management:** items, categories, prices, modifiers, photos, availability, time-of-day schedules.
- **Table and QR management:** create zones and tables; generate, print, and replace QR codes.
- Staff accounts and role-based permissions.
- Settings: service charge, tax, operating hours, branding (logo, colours) of the QR page.

### 4.9 Reports
- Revenue by day, shift, table, item, and category.
- Best- and worst-selling items; average bill value.
- Confirmation time, kitchen preparation time, and order-to-serve time.
- Table turnover; share of orders placed via QR vs. by waiters.

## 5. Future Enhancements (Phase 2+)

- **Upsell and cross-sell suggestions** (e.g. "Add a drink?", recommended pairings, set menus).
- **Loyalty:** guests sign in with phone number or Zalo to earn points and redeem vouchers.
- Feedback and ratings after the meal.
- Automatic stock deduction and low-stock alerts (with the Inventory module).
- Integration with e-invoice providers.
- Shared menu across branches, with branch-specific prices and availability.
- AI menu recommendations based on order history, time of day, and weather.
- Table reservations with pre-orders (with the Reservations module).

## 6. Business Rules

1. A QR order can only be placed in an open table session. Once the bill is paid, the session token expires and the old link no longer accepts orders.
2. **Every QR order must be confirmed by a waiter** before it is sent to the kitchen. Guests see "Waiting for confirmation"; staff receive an alert if an order is not confirmed within X minutes (configurable).
3. Guests cannot change or cancel an item once it is confirmed; after that, only staff can cancel it, with a reason. Items already being prepared require manager approval to cancel.
4. Sold-out items cannot be ordered; availability updates in real time.
5. All orders in a session go on one bill unless staff split it.
6. Price changes apply only to new orders; items already ordered keep their original price.
7. Every rejection, cancellation, discount, and void is logged with the staff member, time, and reason.

## 7. Non-functional Requirements

| Category | Requirement |
|---|---|
| No installation | Mobile web (PWA); the menu loads within 3 seconds on a 4G connection |
| Mobile-first UX | Few taps to order, large photos, readable in dim restaurant lighting |
| Real-time sync | Guest page, Waiter App, KDS, and POS update within 2 seconds |
| Reliability | High availability during service hours; failed submissions are retried automatically |
| Security | Signed, unguessable session tokens; rate limiting; role-based access |
| Localization | Vietnamese and English, VND, local time zone |
| Scalability | Handles peak hours across many tables, branches, and tenants |

## 8. Success Metrics (KPIs)

- Share of orders placed via QR.
- Average bill value (before vs. after rollout).
- Average time from seating to first order, from submission to confirmation, and from order to serving.
- Table turnover rate.
- Order error and remake rate.
- Guest satisfaction score.

## 9. MVP Priority (MoSCoW)

| Priority | Features |
|---|---|
| Must | QR code and table session, digital menu with modifiers, cart and ordering in rounds, waiter confirmation, Waiter App, KDS, call waiter / request bill, payment at the counter (cash, card, VietQR), menu and table management |
| Should | VietQR payment from the guest's phone, bill splitting, order tracking for guests, basic reports, English menu |
| Could | Upsell suggestions, feedback after the meal |
| Won't (in MVP) | Loyalty, e-invoice integration, AI recommendations, shared menu across branches |
