# item-api

A minimal TypeScript REST API providing CRUD operations over an `items` table in MySQL,
plus a small static HTML form for exercising it in the browser.

This is an MVP: no auth, no ORM, no test suite — just Express, raw `mysql2` queries, and
a consistent JSON response shape.

## Stack

| Piece | Choice |
| --- | --- |
| Language | TypeScript (strict mode) |
| Runtime | Node.js |
| Framework | Express 5 |
| Database | MySQL 8, via Docker Compose |
| DB access | `mysql2` connection pool, parameterized queries only |
| Package manager | npm |

## Prerequisites

- Node.js (with npm)
- Docker and Docker Compose

## Setup

### 1. Start the database

```bash
docker compose up -d
```

This brings up three containers:

| Service | URL / Port | Notes |
| --- | --- | --- |
| MySQL | `localhost:3307` | Host port is remapped — 3306 is used by another container |
| Adminer | http://localhost:8082 | Browse the DB |
| phpMyAdmin | http://localhost:8083 | Browse the DB |

Credentials come from `docker-compose.yml`: database `ItemApi`, user `itemapi`,
password `change-me`. Data persists in the `mysql-data` volume.

### 2. Create the `items` table

The compose file does **not** run an init script, so create the table once by hand —
via Adminer, phpMyAdmin, or the MySQL CLI:

```sql
CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

```bash
docker compose exec mysql mysql -uitemapi -pchange-me ItemApi
```

### 3. Configure `.env`

`.env` is gitignored. Create it in the project root with values matching `docker-compose.yml`:

```
DB_HOST=localhost
DB_PORT=3307
DB_USER=itemapi
DB_PASSWORD=change-me
DB_NAME=ItemApi
PORT=3000
```

`PORT` is optional and defaults to `3000`. The rest are required — the server pings the
database on startup and exits with a clear error if it cannot connect.

### 4. Install and run

```bash
npm install
npm run dev      # tsx watch, reloads on change
```

Then open http://localhost:3000 for the static CRUD form.

| Script | Does |
| --- | --- |
| `npm run dev` | Run from source with `tsx watch` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled build from `dist/` |

## API

Base URL: `http://localhost:3000`

| Method | Path | Success | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | 200 | Liveness check; also pings the database |
| `POST` | `/items` | 201 | Add a new item |
| `GET` | `/items` | 200 | List all items, newest first (`ORDER BY id DESC`) |
| `GET` | `/items/:id` | 200 | Get a single item |
| `PUT` | `/items/:id` | 200 | Replace an item's `name` and `description` |
| `DELETE` | `/items/:id` | 200 | Delete an item |

Any other path returns a JSON 404 — the API never falls back to Express' HTML error page.

### Response shape

Every response, success or failure, uses one envelope:

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "error": "message" }
```

Validation failures add a `details` array with one entry per offending field, so a client
can put each message beside the right input:

```json
{
  "success": false,
  "error": "validation failed",
  "details": [{ "field": "name", "message": "name is required" }]
}
```

### Example requests

Create:

```bash
curl -X POST http://localhost:3000/items \
  -H 'Content-Type: application/json' \
  -d '{"name":"Widget","description":"A useful widget"}'
```

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Widget",
    "description": "A useful widget",
    "created_at": "2026-08-31T10:04:11.000Z",
    "updated_at": "2026-08-31T10:04:11.000Z"
  }
}
```

List, read, update, delete:

```bash
curl http://localhost:3000/items
curl http://localhost:3000/items/1

curl -X PUT http://localhost:3000/items/1 \
  -H 'Content-Type: application/json' \
  -d '{"name":"Widget v2","description":null}'

curl -X DELETE http://localhost:3000/items/1
# => { "success": true, "data": { "id": 1 } }
```

A validation failure:

```bash
curl -X POST http://localhost:3000/items \
  -H 'Content-Type: application/json' \
  -d '{"description":"no name given"}'
# => 400 { "success": false, "error": "name is required",
#          "details": [{ "field": "name", "message": "name is required" }] }
```

### Validation rules

| Field | Rule |
| --- | --- |
| `name` | Required, string, trimmed, 1–255 characters |
| `description` | Optional, string or `null`, trimmed, max 5000 characters; blank becomes `null` |
| `:id` | Unsigned decimal digits only, 1–2147483647 |

`:id` is deliberately strict: `abc`, `1e3`, `0x1f`, and `" 4 "` are rejected rather than
silently coerced by `Number()`. `POST` and `PUT` collect every problem in one pass, so a
payload with two bad fields returns two `details` entries.

`PUT` is a full replacement, not a patch — omitting `description` sets it to `null`.

### Error responses

| Status | When |
| --- | --- |
| 400 | Validation failed, or the body is not valid JSON / not a JSON object |
| 404 | Item does not exist, or the route is unknown |
| 413 | Request body exceeds the 128 kb limit |
| 500 | Unexpected server error |
| 503 | Database unreachable (connection refused, timed out, lost, etc.) |

## Project structure

```
src/
  index.ts         # App entry, middleware, error handler, graceful shutdown
  db.ts            # mysql2 connection pool (reads .env)
  routes.ts        # Route definitions + async error forwarding
  controller.ts    # Request handlers and SQL
  validation.ts    # Input validation and normalization
  errors.ts        # HttpError class and helpers
  types.ts         # Shared types (Item, ItemInput, ApiResponse)
public/
  index.html       # Static CRUD form, served at /
docker-compose.yml # MySQL + Adminer + phpMyAdmin
```

## Conventions

- TypeScript strict mode is on.
- Route handlers stay thin; logic lives in controller functions.
- All SQL uses parameterized queries — never string concatenation.
- Handlers throw `HttpError`; the single error middleware in `src/index.ts` turns it
  (plus malformed JSON, oversized bodies, and MySQL connection failures) into the
  JSON envelope above.
- `POST` and `PUT` run inside a transaction so the insert/update and the follow-up
  read of the affected row cannot interleave with another writer.
- The client-side form in `public/index.html` mirrors the validation limits — if a
  response shape or rule changes, update both together.
