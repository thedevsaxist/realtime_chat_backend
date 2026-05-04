# Realtime Chat Backend

Minimal realtime chat backend built with Node.js, Express, TypeScript, Prisma, SQLite, JWT auth, and raw WebSockets (`ws`).

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **WebSockets:** `ws` (raw WebSocket server)
- **ORM:** Prisma
- **Database:** SQLite
- **Authentication:** JWT
- **Validation:** Zod
- **Logger:** Winston

## Features

- **Auth module:** Register and login endpoints that issue JWT tokens.
- **Protected REST APIs:** Message endpoints are protected by auth middleware.
- **Chat module:** Send and retrieve messages with cursor-based pagination.
- **Realtime messaging:** Broadcast message events to room subscribers over raw WebSocket.
- **Persistence:** SQLite database through Prisma.
- **Code-level API docs:** Swagger/OpenAPI JSDoc annotations on route/controller files.

## Project Structure

```text
src/
├── app.ts                  # Express app, middleware, and route mounting
├── server.ts               # HTTP + raw WebSocket server bootstrap
├── config/                 # Runtime configuration
├── infrastructure/
│   └── database/           # Prisma client, schema, and seed scripts
├── modules/
│   ├── auth/               # Auth routes and controller
│   ├── chat/               # Chat routes/controller/service/repository/socket handlers
│   └── health/             # Health check route
└── shared/                 # Shared middleware, logger, models, utils
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository and move into the project directory.
1. Install dependencies:

```bash
npm install
```

1. Create a `.env` file in the project root:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-key"
```

## Database Setup

Create/update the SQLite schema and Prisma client:

```bash
npx prisma db push
npx prisma generate
```

Optional: seed the database with sample data.

```bash
npm run seed
```

## Running the Server

Development:

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

Default server URL: `http://localhost:3000`

## REST API

### Health

- `GET /health` - simple health check.

### Auth

- `POST /auth/register`
  - Body: `{ "email": "user@example.com", "password": "password123", "firstName": "John", "lastName": "Doe" }`
  - Returns: `{ token, user }`

- `POST /auth/login`
  - Body: `{ "email": "user@example.com", "password": "password123" }`
  - Returns: `{ user, token, conversations }`

### Messages (Protected)

All `/messages` routes require:

```http
Authorization: Bearer <jwt_token>
```

- `POST /messages`
  - Body: `{ "conversationId": "conv_id", "senderId": "user_id", "content": "Hello!" }`
  - Returns created message payload.

- `GET /messages?conversationId=<id>&limit=20&before=<messageId>`
  - `conversationId` is required.
  - `limit` is optional (defaults to 20).
  - `before` is an optional cursor (message id) for pagination.

## WebSocket API (Raw `ws`)

Connect to:

```text
ws://localhost:3000
```

Messages are JSON with this envelope:

```json
{ "event": "event_name", "data": {} }
```

Client -> Server events:

- `join_conversation` with `data` as `conversationId` string.
- `leave_conversation` with `data` as `conversationId` string.
- `send_message` with `data`:
  - `{ "conversationId": "conv_id", "senderId": "user_id", "content": "Hello!" }`

Server -> Client events:

- `message_created` with the persisted message object.
- `error` with `{ "message": "Failed to process message" }`.

## Swagger Notes

- Swagger/OpenAPI annotations are embedded as JSDoc in route/controller files (for example `auth` and `chat` routes).
- If you want interactive docs (Swagger UI), add `swagger-jsdoc` + `swagger-ui-express` and mount a docs route (e.g. `/docs`).

## Development Scripts

- `npm run dev` - run server in watch mode via `tsx`.
- `npm run build` - compile TypeScript to `dist/`.
- `npm start` - run compiled server from `dist/`.
- `npm run seed` - run Prisma seed script.
