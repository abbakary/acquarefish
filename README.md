# FishTrade ERP (mobile-first React)
Fish procurement, inventory, quality, payments, sales, transport & expenses.
    npm install
    npm run dev      # open on phone via the Network URL
    npm run build
Data is stored in the browser (localStorage) so it works offline. Replace `src/store.jsx` actions with API calls (FastAPI/MySQL) when the backend is ready.
Modules live in `src/modules/` (Home, Buy, Stock, Sales, Suppliers, Quality, Payments, Transport, Expenses).
