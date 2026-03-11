# Realtime Chat Backend

A production-ready minimal realtime chat backend built with Node.js, Express, TypeScript, WebSockets (Socket.io), SQLite, and Prisma ORM.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **WebSockets:** Socket.io
- **ORM:** Prisma
- **Database:** SQLite
- **Logger:** Winston

## Features

- **RESTful API:** Endpoints for sending and paginating/retrieving messages.
- **Real-Time WebSockets:** Real-time message broadcasting to specific conversation rooms.
- **Data Persistence:** Prisma ORM connected to a SQLite database.
- **Modular Architecture:** Cleanly separated layers (Controller, Service, Repository, Socket).
- **Error Handling:** Centralized global error handler and structured logging.

## Project Structure

```
src/
├── app.ts                  # Express application setup and global middleware
├── server.ts               # HTTP server and Socket.io initialization
├── config/                 # Environment configuration variables
├── infrastructure/
│   └── database/           # Prisma schema and database seed scripts
├── modules/
│   ├── chat/               # Chat feature (routes, controller, service, repository, sockets)
│   └── health/             # API health check endpoints
└── shared/                 # Shared utilities (logger, error handler middleware)
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository** and navigate to the project directory.
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up Environment Variables:**
   A `.env` file should be located at the root of the project. If not, create one:
   ```env
   PORT=3000
   DATABASE_URL="file:./dev.db"
   NODE_ENV="development"
   ```

### Database Setup

Run Prisma migrations to create the SQLite database structure and generate the Prisma Client:

```bash
npx prisma db push
# or
npx prisma generate
```

You can also seed the database with initial data (e.g., test conversations/messages):

```bash
npm run seed
```

### Running the Server

- **Development Mode (with hot-reload):**
  ```bash
  npm run dev
  ```
- **Production Build & Run:**
  ```bash
  npm run build
  npm start
  ```

The server will start at `http://localhost:3000`.

## API Documentation

### REST Endpoints

#### Health Check
- `GET /health`
  - Checks if the API is running correctly.

#### Messages
- `POST /messages`
  - **Description:** Sends a new message to a conversation.
  - **Body Format:** `{ "conversationId": "uuid", "senderId": "uuid", "content": "Hello!" }`

- `GET /messages`
  - **Description:** Retrieves messages for a specific conversation.
  - **Query Params:** `conversationId` (required), along with pagination parameters.

### WebSocket Events

The Socket.io server is available at the root URL (e.g., `ws://localhost:3000`).

#### Client Emits (to Server)
- `join_conversation` (payload: `conversationId: string`): Subscribes the client to a specific conversation room.
- `leave_conversation` (payload: `conversationId: string`): Unsubscribes the client from a room.
- `send_message` (payload: `{ conversationId: string, senderId: string, content: string }`): Sends a message via WebSocket, which is saved to the DB and broadcasted to the room.

#### Server Emits (to Client)
- `message_created` (payload: `Message` object): Broadcasted to all clients in a conversation room when a new message is successfully created.
- `error` (payload: `{ message: string }`): Emitted if a socket operation fails.

## Development Scripts

- `npm run dev`: Start the server in development mode using `tsx watch`.
- `npm run build`: Compile TypeScript code into the `dist/` folder.
- `npm start`: Run the compiled JavaScript in production.
- `npm run seed`: Execute the Prisma database seeding script.
