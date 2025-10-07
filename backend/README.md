Stripe webhook setup

This backend supports creating Stripe Checkout sessions and a webhook endpoint to create orders server-side when payments succeed.

Environment variables (add to .env):

- STRIPE_SECRET_KEY=sk_test_...
- STRIPE_WEBHOOK_SECRET=whsec_...   # secret provided by Stripe when you create a webhook endpoint
- CLIENT_URL=http://localhost:3000
- MONGO_URI=your_mongo_connection_string

Notes:
- The webhook route is mounted at POST /webhook and expects the raw request body for signature verification. When using Stripe CLI for local testing, run:

  stripe listen --forward-to localhost:5000/webhook

- The checkout session will include a metadata field `items` with product ids and quantities so the webhook can create an Order.
