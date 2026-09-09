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

## Deploying

Render for the backend, Vercel for the frontend, both on free tiers. The full
walkthrough — settings, environment variables, verification order and what the
free tiers actually feel like — is in **[DEPLOYMENT.md](DEPLOYMENT.md)**.
