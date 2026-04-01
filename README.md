# Kochanet AI Chat Backend

A collaborative real-time chat backend with an on-demand AI assistant built with NestJS and TypeScript. Team members can communicate in real-time and summon **Echo AI** (powered by OpenAI GPT-4o-mini) at any point in a conversation using an `@ai` mention.

---

## Links

| Resource | URL |
|---|---|
| Live API | https://kochanet-ai-chat-backend.onrender.com |
| API Documentation | https://documenter.getpostman.com/view/21876245/2sBXiokUtg |
| GitHub Repository | https://github.com/EddieBenn/Kochanet-AI-Chat-Backend |

---

## Test Credentials

Two pre-seeded accounts are available for testing multi-user features:

| Account | Email | Password |
|---|---|---|
| User 1 | edidiongndaobong5@gmail.com | Password@123 |
| User 2 | eddiebenjamin247@gmail.com | Password@123 |

> Note: Both accounts are email-verified and ready to use. No OTP step is required.

---

## Architecture Overview

The application follows a modular NestJS architecture with a clear separation of concerns across five domain modules:

```
AppModule
├── UsersModule      — Registration, login, OTP verification, profile management
├── AuthModule       — JWT token generation (injected into UsersModule)
├── ChatModule       — Chat rooms, messages, WebSocket gateway, AI service
├── EmailModule      — Transactional email delivery via Nodemailer
└── CommonModule     — Shared utilities and event emitter service
```

**Request flow (HTTP):**
```
Client → Global Rate Limiter → Global Auth Guard → Controller → Service → TypeORM → PostgreSQL
```

**Real-time flow (WebSocket):**
```
Client → Socket.io Handshake (JWT in cookie) → ChatGateway → ChatService / AiService → Broadcast to room
```

---

## Technology Choices & Justification

| Technology | Role | Reason |
|---|---|---|
| **NestJS 11** | Application framework | Modular architecture, dependency injection, built-in WebSocket support, guards and pipes for clean validation |
| **TypeScript** | Language | Type safety across the entire codebase |
| **PostgreSQL (NeonDB)** | Primary database | Relational model fits the messages → rooms → members hierarchy well; NeonDB provides serverless Postgres with connection pooling |
| **TypeORM** | ORM | First-class NestJS integration, decorator-based entities, query builder for complex joins |
| **Socket.io** | Real-time transport | Reliable bi-directional communication with built-in room support, automatic reconnection, and broad client ecosystem |
| **OpenAI GPT-4o-mini** | AI responses | Cost-effective, fast, capable model well suited for concise team-chat answers |
| **JWT (HttpOnly cookie)** | Authentication | Cookies prevent token theft via XSS; short-lived tokens (1 h) limit exposure |
| **Nodemailer + Gmail** | Email delivery | Simple setup for transactional email (OTP verification, welcome emails) |
| **express-rate-limit** | Rate limiting | Protects endpoints from abuse; 100 requests per 15-minute window per IP |
| **typeorm-transactional** | DB transactions | Declarative `@Transactional()` decorator keeps multi-step database operations atomic |
| **bcryptjs** | Password hashing | Industry-standard cost-factor hashing for passwords and OTPs |

---

## How Real-Time Communication Works

Socket.io is used via the NestJS `@WebSocketGateway` decorator. Authentication happens at the connection handshake level — the gateway reads the JWT from the HTTP cookie, verifies it, and rejects unauthorised connections before any event can be processed.

**Presence management** is tracked in a server-side `Map<userId, Set<socketId>>`. This correctly handles the case where the same user has multiple open tabs or devices — a user is only marked offline when their last socket disconnects.

**Room membership** is enforced at two levels:
1. On connection, the server automatically calls `socket.join()` for every room the authenticated user already belongs to.
2. Before broadcasting a message, the gateway confirms the sender is a member of the target room.

**WebSocket events emitted by the server:**

| Event | Payload | Description |
|---|---|---|
| `messages:new` | `{ id, content, message_type, sender_id, sender_name, room_id, created_at }` | New message (user or AI) in a room |
| `typing:update` | `{ userId, userName, room_id, isTyping }` | Typing indicator start/stop |
| `presence:update` | `{ userId, status }` | User went online or offline |
| `rooms:user_joined` | `{ roomId, userId, userName }` | A user joined a room |
| `rooms:user_left` | `{ roomId, userId, userName }` | A user left a room |
| `error` | `{ message }` | An error occurred |

**WebSocket events the client sends:**

| Event | Payload | Description |
|---|---|---|
| `rooms:join` | `{ room_id }` | Join a public room |
| `rooms:leave` | `{ room_id }` | Leave a room |
| `messages:send` | `{ room_id, content }` | Send a message (triggers AI if `@ai` is detected) |
| `typing:start` | `{ room_id }` | Signal that the user started typing |
| `typing:stop` | `{ room_id }` | Signal that the user stopped typing |
| `presence:get_online` | _(none)_ | Request the list of currently online user IDs |

---

## How the AI Invocation & Context Management Works

**Invocation mechanism:** A message is scanned for the pattern `@ai <query>` (case-insensitive) after it is persisted and broadcast to the room. When the pattern is found, the AI pipeline is triggered asynchronously — the original message is already delivered to all participants with no added latency.

**Context retrieval:** Before calling OpenAI, the service fetches the 10 most recent user messages from the same room, ordered by `created_at DESC`. Each message is mapped to an OpenAI `ChatContext` object with the sender's name attached, so the model can distinguish between different participants in the conversation.

**AI response delivery:** Echo AI's reply is persisted as a `Message` entity with `message_type = 'ai'` and `sender_id = null`. It is then broadcast to the room via `messages:new` with `sender_name: 'Echo AI'`, making it appear inline in the conversation just like any other message.

**System persona:** Echo AI is instructed via a system prompt to act as a helpful assistant in a professional team workspace, keep responses concise, and stay relevant to the conversation context.

**Example flow:**
```
Alice: "The deployment failed again"
Bob: "Same Docker networking issue?"
Alice: "@ai what causes Docker containers to lose network connectivity after restart?"
→ Echo AI reads the last 10 messages as context
→ Echo AI: "Common causes include: 1) Custom bridge networks not persisting..."
```

---

## Data Model

```
users
  id (uuid PK)
  first_name, last_name, email, phone, city, gender
  password (bcrypt), otp (bcrypt), otp_expiry
  role (user | admin), is_verified
  created_at, updated_at, deleted_at

chat_rooms
  id (uuid PK)
  name, type (public | private)
  created_by (uuid FK → users)
  created_at, updated_at, deleted_at

room_members (join table)
  room_id (FK → chat_rooms)
  user_id (FK → users)

messages
  id (uuid PK)
  content (text)
  message_type (user | ai)
  sender_id (uuid FK → users, nullable — null for AI messages)
  room_id (uuid FK → chat_rooms)
  created_at, updated_at, deleted_at
```

---

## API Endpoints

Full request/response documentation with examples is available in the [Postman collection](https://documenter.getpostman.com/view/21876245/2sBXiokUtg).

### Users

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/users` | Public | Register a new user |
| POST | `/users/verify-otp` | Public | Verify email with OTP |
| POST | `/users/resend-otp` | Public | Resend verification OTP |
| POST | `/users/login` | Public | Login (sets JWT cookie) |
| POST | `/users/logout` | Public | Logout (clears cookie) |
| POST | `/users/reset-password` | Public | Forgot password / reset |
| GET | `/users` | Admin only | List all users (with filters) |
| GET | `/users/:id` | Authenticated | Get user by ID |
| PUT | `/users/:id` | Authenticated | Update user profile |
| DELETE | `/users/:id` | Admin only | Delete user |

### Chat

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/chat/rooms` | Authenticated | Create a chat room |
| GET | `/chat/rooms` | Authenticated | Get rooms you belong to |
| GET | `/chat/rooms/public` | Authenticated | List all public rooms |
| GET | `/chat/rooms/:id` | Authenticated | Get room with members |
| POST | `/chat/rooms/:id/invite` | Authenticated | Invite a user to a room |
| GET | `/chat/rooms/:id/messages` | Authenticated | Get room message history (paginated) |

---

## How to Test Real-Time Features

1. **Authenticate** — Log in as both test users in separate browser tabs or tools. The JWT is stored as a cookie automatically.

2. **Connect via WebSocket** — Use a WebSocket client that sends cookies (e.g., a browser-based Socket.io client, or Postman's WebSocket tab with cookie support). Connect to:
   ```
   wss://kochanet-ai-chat-backend.onrender.com
   ```

3. **Create or join a room** — Call `POST /chat/rooms` to create a public room, then emit `rooms:join` with the returned `room_id` from the second user's socket.

4. **Send messages** — Emit `messages:send` from User 1 and watch `messages:new` arrive on User 2's socket in real time.

5. **Test typing indicators** — Emit `typing:start` from one client and watch `typing:update` with `isTyping: true` arrive on the other.

6. **Invoke the AI** — Send a message containing `@ai` followed by a question:
   ```json
   { "room_id": "<uuid>", "content": "@ai how do I debug a Node.js memory leak?" }
   ```
   Within a few seconds, a `messages:new` event will arrive with `sender_name: "Echo AI"`.

7. **Presence** — Disconnect one socket and watch `presence:update` broadcast `{ status: "offline" }` to all connected clients.

---

## Local Setup

### Prerequisites

- Node.js 20+
- npm
- A PostgreSQL database (local or cloud, e.g. NeonDB)
- An OpenAI API key
- A Gmail account with an app password enabled

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/EddieBenn/Kochanet-AI-Chat-Backend.git
cd Kochanet-AI-Chat-Backend

# 2. Install dependencies
npm install

# 3. Create a .env file in the project root
cp .env.example .env   # then fill in your values (see below)

# 4. Start the development server
npm run start:dev
```

### Environment Variables

```env
PORT=3001
APP_URL=http://localhost:
NODE_ENV=development

DB_PORT=5432
DB_HOST=<your-postgres-host>
DB_DATABASE=<your-db-name>
DB_USERNAME=<your-db-user>
DB_PASSWORD=<your-db-password>

JWT_SECRET=<a-long-random-secret>
JWT_EXPIRY=1h

GMAIL_USER=<your-gmail-address>
GMAIL_PASSWORD=<your-gmail-app-password>

OPENAI_API_KEY=<your-openai-api-key>
```

### Available Scripts

```bash
npm run start:dev    # development with hot reload
npm run start:prod   # production (requires build first)
npm run build        # compile TypeScript
npm run test         # unit tests
npm run test:e2e     # end-to-end tests
npm run lint         # lint and auto-fix
```

---

## Assumptions Made

- **Email as identity**: Email is the primary unique identifier. Phone is also required but not used for authentication.
- **Cookie-based WebSocket auth**: The Socket.io client must send the `access_token` cookie on the WebSocket handshake. This works naturally in browsers. Postman or custom clients need to handle cookies explicitly.
- **Public rooms are discoverable**: Any authenticated user can list and join public rooms. Private rooms require an explicit invite.
- **AI context is room-scoped**: The AI's context window is the last 10 messages in the same room, regardless of which user triggered the mention.
- **AI only reads user messages for context**: AI-generated messages are excluded from the context passed back to OpenAI to avoid echo loops.
- **Single deployment instance**: The presence system uses an in-memory `Map`, which works correctly on a single server instance.

---

## Known Limitations & Trade-offs

### In-memory presence state
The `onlineUsers` map lives in the `ChatGateway` instance. If the app runs on multiple servers behind a load balancer, presence state will be inconsistent across nodes. A production system would need Redis (via Socket.io Redis adapter) to share this state.

### No social authentication
The task required at least one social provider (e.g. Google OAuth). This was not implemented. Users must register with email/password and verify via OTP.

### No voice features
Speech-to-text and text-to-speech (via OpenAI Whisper / TTS) were not implemented. Voice messages are not supported in this version.

### No streaming AI responses
The AI response is a single blocking call to OpenAI. The full response arrives as one `messages:new` event rather than streaming tokens as they are generated. This increases perceived latency for longer AI answers.

### Fixed context window
The AI always receives the last 10 messages. There is no smart summarisation of older messages when conversations grow long. This means the AI can lose track of context in extended discussions.

### No read receipts or delivery confirmations
Messages are broadcast to the Socket.io room but there is no mechanism to confirm that a specific user received or read a message.

### No message editing or deletion
Once sent, messages cannot be edited or deleted by users.

### Rate limiting is IP-based only
The global rate limit (100 requests per 15 minutes) applies per IP address. There is no per-user quota or AI-specific rate limiting.

---

## What I Would Do Differently With More Time

1. **Redis adapter for Socket.io** — Replace the in-memory presence map with a Redis-backed solution to support horizontal scaling and accurate presence across multiple instances.

2. **Social authentication** — Add Google OAuth (and optionally GitHub) using Passport.js strategies to meet the social auth requirement.

3. **Streaming AI responses** — Use the OpenAI streaming API (`stream: true`) to emit incremental `messages:chunk` events so users see the AI response appear word by word, significantly improving perceived responsiveness.

4. **Smart context summarisation** — When the message history exceeds the token budget, summarise the older portion of the conversation into a single context message rather than silently truncating it. This keeps the AI grounded in earlier discussion.

5. **Voice features** — Integrate OpenAI Whisper for speech-to-text (clients upload an audio blob) and OpenAI TTS for returning audio responses, with the audio URL included in the `messages:new` payload.

6. **Read receipts** — Track per-user, per-message read status in a `message_reads` join table and broadcast `messages:read` events via WebSocket.

7. **Message search** — Add a full-text search endpoint using PostgreSQL's `tsvector` / `tsquery` or a dedicated search index.

8. **Comprehensive test coverage** — Write unit tests for all services (especially `ChatService` and `AiService`) and integration tests for the WebSocket gateway using NestJS testing utilities and `socket.io-client`.

9. **Refresh token rotation** — Replace the single-expiry JWT cookie with a short-lived access token + long-lived refresh token pattern to improve session security without forcing frequent logins.

10. **Video walkthrough** — A 10-minute demo showing registration, real-time messaging across two browser tabs, typing indicators, presence updates, and AI invocation. Unfortunately this was not completed in time — apologies for the omission.

---

## Project Structure

```
src/
├── auth/           JWT token generation, auth guard, role guard, decorators
├── chat/
│   ├── ai/         AiService — OpenAI client, context building, response generation
│   ├── dto/        Request validation DTOs (CreateRoom, SendMessage, Typing)
│   ├── entities/   ChatRoom and Message TypeORM entities
│   ├── chat.controller.ts   REST endpoints for room and message management
│   ├── chat.gateway.ts      Socket.io WebSocket gateway (real-time events)
│   └── chat.service.ts      Business logic for rooms, messages, context
├── common/
│   ├── events/     EventEmitter2-based email event service
│   └── utils/      UtilService — OTP generation, password hashing, pagination
├── config/         Centralised environment variable access
├── email/          Nodemailer service, templates, controller
├── filters/        Global HTTP exception filter, TypeORM query filter builder
├── users/          User entity, service (registration, auth, OTP), controller
├── base.entity.ts  Shared base entity (id, timestamps, soft-delete)
└── main.ts         Bootstrap — rate limiting, cookie parser, validation pipe
```
