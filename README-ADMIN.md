# Jeff Bistro POS

A standalone React/Vite cashier and menu-management page for **Jeff Bistro — Fast Food & Bakery**. Firebase Authentication, Firestore, and Firebase Storage back this POS directly; the page does not send its data to a separate app or REST API.

## Included

- Responsive manager dashboard
- Cashier POS with cart, Walk-in/Dine-in, table number, Cash/M-Pesa payment flow and change calculation
- Products manager
- Categories manager with edit/delete
- Cake flavors, shapes and sizes/prices manager
- Pizza toppings manager
- Gallery manager
- Hot deals/promotions manager
- Orders queue with status updates for sales recorded in this POS
- Store settings and daily sales snapshot
- Firebase Authentication for admin sign-in
- Firestore for POS records and settings
- Firebase Storage for uploaded product and gallery images

## Run

### POS

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server defaults to `http://localhost:5173`. Configure Firebase Authentication, Firestore, Storage, and security rules using [FIREBASE_SETUP.md](./frontend/FIREBASE_SETUP.md) before signing in.

Firebase web-app configuration is public client configuration, not a server credential. Firestore access is restricted to accounts explicitly granted the admin role by the checked-in rules.

## Simplified Admin/POS update

The admin portal now uses a simple cashier workflow:
- POS payment methods are **Cash** and **M-Pesa** only.
- Cash calculates change automatically.
- M-Pesa is manual: the cashier enters the transaction code after confirming payment. There is **no STK Push integration**.
- Added an **Expenses** module for recording business expenses such as stock, transport, utilities, rent, wages and marketing.
- Dashboard shows expenses today and net sales (sales less expenses).
- Added Firebase Authentication with Firestore admin-role checks.

### Admin login
Create the admin email/password account in Firebase Authentication and grant it admin access as described in [FIREBASE_SETUP.md](./frontend/FIREBASE_SETUP.md). The backend's `ADMIN_EMAIL` and `ADMIN_PASSWORD` do not authenticate this POS.

This POS is standalone: its products, sales, expenses, settings, and uploaded images live in Firebase. It does not synchronize with a customer app or separate backend. Existing MongoDB records, if any, are not imported.

## Simple POS / Business Math

- POS payment methods are **Cash** and **M-Pesa** only.
- M-Pesa is recorded manually as a completed sale. There is **no STK Push and no M-Pesa transaction-code field**.
- Cash sales require the amount received and calculate change automatically.
- There is **no receipt printing**.
- Expenses are recorded with only: expense name, amount, and optional note. There are no expense categories.
- POS sales and operational records are stored directly in Firestore.
- Dashboard figures are: gross sales, cash sales, M-Pesa sales, order count, expenses, and **sales after recorded expenses**. This last figure is not labelled as net profit because true profit also requires cost-of-goods and other accounting adjustments.
