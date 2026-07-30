# Roxaval Travels — Backend API

Production-ready REST API for **Roxaval Travels**, a premium Sri Lanka travel management platform. Built with Node.js, Express, and MongoDB (Mongoose), following a clean, layered architecture.

## Tech Stack

- **Runtime:** Node.js 18+, Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (access + refresh tokens), bcrypt password hashing, role-based authorization (`customer`, `admin`, `superadmin`)
- **Validation:** Zod
- **File uploads:** Multer (images, payment receipts)
- **PDF generation:** PDFKit (itineraries, hotel vouchers, booking confirmations, invoices, receipts, quotations)
- **Email:** Nodemailer
- **Logging:** Winston (daily rotating file logs) + Morgan (HTTP request logs)
- **Security:** Helmet, CORS, express-rate-limit, express-mongo-sanitize, xss-clean, hpp

## Folder Structure

```
roxaval-backend/
├── src/
│   ├── config/           # env, db connection, logger
│   ├── models/            # Mongoose schemas (one file per resource)
│   ├── controllers/       # Request handlers (thin — delegate to services)
│   ├── services/          # Business logic (booking, payment, custom-tour workflow, documents, reports)
│   ├── routes/             # Express routers, one per resource + master index
│   ├── middleware/        # auth, validation, error handling, uploads, logging
│   ├── validators/        # Zod schemas per resource
│   ├── utils/              # ApiError, ApiResponse, ApiFeatures, token/pdf/email/whatsapp helpers, seed script
│   ├── docs/templates/    # Place your company logo here as logo.png (used in generated PDFs)
│   ├── app.js               # Express app (middleware stack + route mounting)
│   └── server.js           # Entry point (DB connect + HTTP server + graceful shutdown)
├── uploads/               # Uploaded images, payment receipts, generated PDF documents
├── logs/                    # Rotating application logs
├── .env.example
└── package.json
```

## Getting Started

```bash
cp .env.example .env      # fill in your MongoDB URI, JWT secrets, SMTP, company info, etc.
npm install
npm run seed               # creates a superadmin account + seeds destinations/activities/packages
npm run dev                # starts with nodemon on http://localhost:5000
```

Default seeded superadmin: `admin@roxavaltravels.com` / `ChangeMe123!` — **change this password immediately** via `PATCH /api/v1/auth/update-password`.

## API Overview

All routes are mounted under `API_PREFIX` (default `/api/v1`).

| Resource | Base Path | Notes |
|---|---|---|
| Auth | `/auth` | register, login, refresh, logout, forgot/reset password |
| Destinations | `/destinations` | + nested `/attractions` sub-resource |
| Activities | `/activities` | linked to destinations |
| Hotels | `/hotels` | room types, pricing |
| Tour Packages | `/packages` | publish/archive workflow, `/slug/:slug` for public detail pages |
| Blogs | `/blogs` | categories, tags, SEO, publish workflow |
| Reviews | `/reviews` | moderation workflow, only `approved` shown publicly |
| Custom Tour Requests | `/custom-tours` | multi-step inquiry → admin itinerary → accept/request-changes loop |
| Bookings | `/bookings` | from package or from approved itinerary; full status lifecycle |
| Payments | `/payments` | card (future-ready), bank transfer (+ receipt upload), WhatsApp (pre-filled link) |
| Documents | `/documents` | generates itinerary/voucher/confirmation/invoice/receipt/quotation PDFs |
| Notifications | `/notifications` | in-app, per-user |
| Reports | `/reports` | live dashboard stats + revenue/booking reports + saved report snapshots |
| Settings | `/settings` | company info, bank details, socials (singleton) |
| Customers | `/customers` | self-service profile + admin management |
| Admins | `/admins` | superadmin-managed staff accounts |
| Uploads | `/uploads` | generic image upload for admin content forms |

Every list endpoint supports: `?q=` (search), field filters (`?status=published`), `?sort=-createdAt`, `?fields=name,price`, `?page=&limit=`.

## Custom Tour Workflow (the core business flow)

1. **Customer** submits a multi-step inquiry (`POST /custom-tours`) → status `Pending`, visible instantly to admins.
2. **Admin** reviews and builds a personalized itinerary (`POST /custom-tours/:id/itinerary`) → status `Itinerary Sent`, customer notified.
3. **Customer** either:
   - Accepts (`PATCH /custom-tours/:id/accept`) → status `Approved`, can now book, or
   - Requests changes (`PATCH /custom-tours/:id/request-changes`) → status `Changes Requested`, loops back to step 2.
4. Once approved, customer books (`POST /bookings/from-itinerary`), pays, and the admin verifies payment to confirm.

## Notes

- Add your company logo at `src/docs/templates/logo.png` for it to appear on generated PDFs.
- Card payment gateway integration is stubbed (`Payment.gatewayProvider/gatewayRef/gatewayResponse`) so a provider like Stripe/PayHere can be added without a schema change.
- The seed script mirrors the destinations/activities/packages already present in the existing frontend so the rebuilt site has real data on day one.
