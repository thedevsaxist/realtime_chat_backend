# API Response Schema Reference

All `DateTime` fields are ISO 8601 strings (e.g. `"2024-01-01T00:00:00.000Z"`).

---

## User

Returned by: `POST /auth/register`, `POST /auth/login`, `GET /search-users`

```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "createdAt": "DateTime"
}
```

---

## Message

Returned by: `POST /messages`, `GET /messages`, WebSocket `message` event

```json
{
  "id": "string",
  "content": "string",
  "senderId": "string",
  "conversationId": "string",
  "createdAt": "DateTime"
}
```

---

## ConversationParticipant

Nested inside `Conversation`.

```json
{
  "id": "string",
  "userId": "string",
  "conversationId": "string",
  "firstName": "string",
  "lastName": "string"
}
```

---

## Conversation

Returned by: `POST /conversations`, `GET /conversations`, `POST /auth/login` (inside `conversations[]`), WebSocket `new_conversation` event

```json
{
  "id": "string",
  "createdAt": "DateTime",
  "messages": [Message],
  "participants": [ConversationParticipant]
}
```

> `messages` is only populated when coming from `GET /conversations` and `POST /auth/login`. It is an empty array or absent from `POST /conversations`.

---

## Auth Responses

### `POST /auth/register`

```json
{
  "token": "string",
  "refreshToken": "string",
  "user": User
}
```

### `POST /auth/login`

```json
{
  "user": User,
  "token": "string",
  "refreshToken": "string",
  "conversations": [Conversation]
}
```

### `POST /auth/refresh`

```json
{
  "token": "string",
  "refreshToken": "string"
}
```

---

## WebSocket Events

All messages use the envelope:

```json
{ "event": "string", "data": {} }
```

### Client → Server

| Event                | `data` shape                                                              |
|----------------------|---------------------------------------------------------------------------|
| `join_conversation`  | `"conversationId"` (string)                                               |
| `leave_conversation` | `"conversationId"` (string)                                               |
| `send_message`       | `{ "conversationId": "string", "senderId": "string", "content": "string" }` |

### Server → Client

| Event              | `data` shape                        |
|--------------------|-------------------------------------|
| `message`          | `Message`                           |
| `new_conversation` | `Conversation` (without `messages`) |
| `error`            | `{ "message": "string" }`           |

---

## Request Bodies

### `POST /auth/register`

```json
{
  "email": "string",
  "password": "string (min 8 chars)",
  "firstName": "string",
  "lastName": "string"
}
```

### `POST /auth/login`

```json
{
  "email": "string",
  "password": "string (min 8 chars)"
}
```

### `POST /messages`

```json
{
  "conversationId": "string",
  "senderId": "string",
  "content": "string"
}
```

### `POST /conversations`

```json
{
  "participantIds": ["string", "string"]
}
```

### `GET /messages` query params

| Param            | Required | Description                        |
|------------------|----------|------------------------------------|
| `conversationId` | yes      | ID of the conversation             |
| `limit`          | no       | Number of messages (default: 20)   |
| `before`         | no       | Message ID cursor for pagination   |
