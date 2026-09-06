# NexusAI

Retrieval-augmented research assistant. Express + MongoDB + Pinecone + Groq on the
backend, Next.js on the frontend.

## Running locally

You need Node.js 20+ and network access to the MongoDB Atlas cluster.

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Serves on `http://localhost:5001` (set by `PORT` in `backend/.env`).

> Port 5001 rather than 5000 because another local process was already bound to
> 5000. If 5000 is free on your machine, set `PORT=5000` in `backend/.env` and
> `NEXT_PUBLIC_API_URL=http://localhost:5000/api` in `frontend/.env.local` —
> both must change together.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Serves on `http://localhost:3000`.

### 3. Check it is up

```bash
curl http://localhost:5001/health
```

`database` must read `connected`. If it reads `disconnected`, see below.

## MongoDB Atlas access list

Atlas rejects connections from IPs that are not on the cluster's access list. It
does this by aborting the TLS handshake, which surfaces as
`SSL alert number 80` — misleading, since nothing is wrong with the certificate.

Fix: Atlas dashboard → **Network Access** → **Add IP Address** → add your current
public IP, or **Allow access from anywhere** (`0.0.0.0/0`) for development. Then
restart the backend.

The server now starts even when the database is unreachable, so the frontend
still loads; routes that need the database will return errors until it connects.

## Environment variables

`backend/.env`:

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend port |
| `MONGODB_URI` | Atlas connection string |
| `JWT_SECRET` | Signs auth tokens — use a long random value in production |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `GROQ_API_KEY` | LLM inference |
| `PINECONE_API_KEY` / `PINECONE_INDEX_NAME` | Vector store |
| `FRONTEND_URL` | Extra allowed CORS origin |

`frontend/.env.local`:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend API base, including the `/api` suffix |

## Deploying for free

Deploy the backend first, so you have its URL when configuring the frontend.

### 1. Backend — Render (free tier)

New Web Service → connect this repo, then:

| Setting | Value |
| --- | --- |
| Root directory | `backend` |
| Build command | `npm install && npm run build` |
| Start command | `npm start` |

Add every variable from the backend table above, plus:

- `NODE_ENV=production`
- `FRONTEND_URL` — the Vercel URL, added after step 2

Leave `PORT` unset; Render assigns it and the server already reads it.

### 2. Frontend — Vercel (free tier)

Import the repo, set **Root Directory** to `frontend`, and add:

- `NEXT_PUBLIC_API_URL=https://<your-render-service>.onrender.com/api`

Then go back to Render and set `FRONTEND_URL` to the Vercel URL.

### 3. Database

Keep the Atlas free tier. `0.0.0.0/0` must stay on the access list, because
neither free tier offers a static egress IP to whitelist instead.

### Why the two URLs must be exact

Auth is a cookie issued by the backend and sent from a different domain, so the
cookie is cross-site. In production the server issues it with `secure: true` and
`sameSite: "none"`, which browsers only accept over HTTPS — both platforms
provide that automatically. The request must also pass CORS with credentials,
and that check compares the browser's `Origin` against `FRONTEND_URL` exactly:
a trailing slash, `http` instead of `https`, or the `www.` prefix will fail.

The symptom of a mismatch is login appearing to succeed and every following
request returning 401, because the cookie was never stored.

> Free Render services sleep when idle, so the first request after a pause can
> take up to a minute.
