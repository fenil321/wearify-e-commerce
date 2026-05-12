# Wearify

> Full-stack E-commerce Clothing Store (React + Vite frontend, Node/Express + MongoDB backend)

Short, well-structured repo for a clothing e-commerce project including admin features, carts, orders, coupons, reviews, and file uploads.

## Features

- User authentication (register, login, password reset)
- Product listing, filters, pagination
- Cart and wishlist management
- Checkout + order creation
- Admin dashboard: product, order, user and coupon management
- Product reviews and ratings
- File uploads (Cloudinary)
- Email notifications for orders/refunds

## Tech Stack

- Frontend: React (Vite)
- Backend: Node.js, Express
- Database: MongoDB (Mongoose)
- File storage: Cloudinary
- Email: SMTP (Nodemailer or similar)

## Repo Structure

- `backend/` — Node/Express API, models, routes, middleware
- `frontend/` — React app (Vite), components, pages, contexts

## Prerequisites

- Node.js (>= 16)
- npm or yarn
- MongoDB instance (Atlas or local)
- Cloudinary account (for image uploads)

## Environment variables

Create `.env` files in `backend/` and (optionally) in `frontend/` where required.

Example `frontend/.env` variables (Vite expects `VITE_` prefix):

- `VITE_API_BASE_URL` — e.g., `http://localhost:5000/api` (adjust to your API path)

## Installation

1. Backend

```bash
cd backend
npm install
# create a .env file (see above)
# start server (if using nodemon in dev)
npm run dev
```

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the frontend URL shown by Vite (usually `http://localhost:5173`) and ensure the backend is running.

## Common Scripts

- Backend: `npm run dev` (development), `npm start` (production)
- Frontend: `npm run dev`, `npm run build`, `npm run preview`

## Database Migrations / Seed (if available)

If you have seed scripts, run them from the `backend` folder. (No specific seed provided here.)

## API Endpoints

The API routes are in `backend/routes/`. Key routes include:

- `authRoutes.js` — authentication
- `product.routes.js` — product CRUD and listing
- `cart.routes.js` — cart operations
- `order.routes.js` — checkout and orders
- `user.routes.js` — user profile
- `coupon.routes.js`, `review.routes.js`, etc.

Inspect `backend/routes/` for the full list and request payloads.

## Deployment Notes

- Configure environment variables on your host (e.g., Heroku, Render, Vercel for frontend)
- Build frontend with `npm run build` and serve static assets or deploy to Vercel/Netlify
- Use a process manager (PM2) or containerization for production backend

## Contributing

Contributions are welcome. Typical workflow:

1. Fork the repository
2. Create a feature branch
3. Open a pull request with a clear description

## Troubleshooting

- If images fail to upload, verify Cloudinary credentials.
- If emails are not sent, verify SMTP credentials and allow less-secure access where necessary.
- Check console/log output for useful error messages.

## Contact

If you need help, open an issue or contact the project owner.

## License

This project is provided as-is. Add a license file if you wish to apply one.
