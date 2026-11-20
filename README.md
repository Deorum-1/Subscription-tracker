# Subscription Tracker API

A Node.js and Express API for user accounts and subscription tracking. It stores data in MongoDB, protects authenticated routes with JWTs, and schedules renewal reminders through Upstash Workflow.

## Requirements

- Node.js
- A MongoDB deployment that supports transactions (such as MongoDB Atlas or a replica set)
- Arcjet API key
- Upstash Workflow credentials to schedule reminders
- Gmail app password to deliver reminder emails

## Getting started

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create `.env.development.local` in the project root:

   ```dotenv
   PORT=5500
   NODE_ENV=development
   SERVER_URL=http://localhost:5500

   DB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>

   JWT_SECRET=<a-long-random-secret>
   JWT_EXPIRES_IN=1d

   ARCJET_KEY=<your-arcjet-key>

   QSTASH_URL=<your-qstash-url>
   QSTASH_TOKEN=<your-qstash-token>

   Email_password=<your-gmail-app-password>
   ```

   Keep this file private and out of version control. The app loads `.env.<NODE_ENV>.local` (or `.env.development.local` when `NODE_ENV` is not set before startup). `SERVER_URL` should be an absolute URL without a trailing slash. For production, provide production values through the hosting environment and use `.env.production.local` only when appropriate.

3. Start the API:

   ```sh
   npm run dev
   ```

   Use `npm start` for a non-watch run. The server listens on the configured `PORT`.

## API

The base URL for local development is `http://localhost:5500`. Requests with JSON bodies should include `Content-Type: application/json`.

### Authentication

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/v1/auth/sign-up` | Create an account and receive a JWT |
| `POST` | `/api/v1/auth/sign-in` | Sign in and receive a JWT |

Example signup body:

```json
{
  "name": "Example User",
  "email": "user@example.com",
  "password": "replace-with-a-password"
}
```

Send the returned token to protected endpoints using:

```http
Authorization: Bearer <token>
```

### Users

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/v1/user` | List users (requires a JWT) |
| `GET` | `/api/v1/user/:id` | Get a user by ID (requires a JWT) |

### Subscriptions

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/v1/subscriptions` | Create a subscription (requires a JWT) |
| `GET` | `/api/v1/subscriptions` | List the authenticated user's subscriptions |
| `GET` | `/api/v1/subscriptions/user/:id` | List subscriptions for the matching authenticated user |
| `GET` | `/api/v1/subscriptions/upcoming-renewals?days=30` | List active renewals in the next 30 days |
| `GET` | `/api/v1/subscriptions/:id` | Get one of the authenticated user's subscriptions |
| `PUT` | `/api/v1/subscriptions/:id` | Update one of the authenticated user's subscriptions |
| `PATCH` | `/api/v1/subscriptions/:id/cancel` | Cancel one of the authenticated user's subscriptions |
| `DELETE` | `/api/v1/subscriptions/:id` | Delete one of the authenticated user's subscriptions |

Example subscription body:

```json
{
  "name": "Example Streaming",
  "price": 12.99,
  "currency": "USD",
  "frequency": "monthly",
  "category": "entertainment",
  "paymentMethod": "Credit card",
  "startDate": "2026-01-01",
  "renewalDate": "2027-02-01"
}
```

The API assigns the subscription to the authenticated user. `currency` can be `USD`, `EUR`, or `GBP`; `frequency` can be `daily`, `weekly`, `monthly`, or `yearly`. If `renewalDate` is omitted, the API derives it from `startDate` and `frequency`.

There is currently no collection handler for `GET /api/v1/subscriptions/`; use the user-specific route to retrieve subscriptions.

## Renewal reminders

When a subscription is created, the API schedules a workflow callback at `SERVER_URL/api/v1/workflow/subscription/reminder`. The workflow sends email reminders 7, 5, 2, and 1 day before renewal when those dates are still in the future. Configure a reachable `SERVER_URL`, Upstash credentials, and a Gmail app password for this flow.

## Development notes

- Authentication tokens use `JWT_SECRET` and expire according to `JWT_EXPIRES_IN`.
- User passwords are hashed before storage and are not included in JSON responses.
- Arcjet protection is enabled for incoming API requests.
