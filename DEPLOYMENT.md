# Deploying NexusAI for free

Backend on Render, frontend on Vercel, data in MongoDB Atlas and Pinecone. Every
service below has a free tier that is enough to run this project.

Deploy the backend first — the frontend needs its URL, and the backend needs the
frontend's URL afterwards.

## 0. Accounts you need

MongoDB Atlas, Pinecone, Groq, Render, Vercel.

## 1. Pinecone index

Create a serverless index:

| Setting | Value |
| --- | --- |
| Dimension | `384` |
| Metric | `cosine` |

384 is not arbitrary. Embeddings come from `Xenova/all-MiniLM-L6-v2`, which
produces 384 numbers per chunk. Any other dimension and the first upload fails
when it tries to write vectors.

Keep the index name — it becomes `PINECONE_INDEX_NAME`.

## 2. MongoDB Atlas

Create a free M0 cluster and a database user, then open **Network Access** and
add `0.0.0.0/0`.

Allowing every IP is not laziness here: no free host gives you a fixed outbound
IP to whitelist instead. Atlas refuses unlisted IPs by aborting the TLS
handshake, which surfaces as `SSL alert number 80` — misleading, because nothing
is wrong with the certificate.

Copy the connection string — it becomes `MONGODB_URI`.

## 3. Backend on Render

New **Web Service** → connect the repo:

| Setting | Value |
| --- | --- |
| Root directory | `backend` |
| Build command | `npm ci --include=dev && npm run build` |
| Start command | `npm start` |
| Health check path | `/health` |

`--include=dev` matters. Render applies environment variables during the build
too, and npm skips devDependencies whenever `NODE_ENV=production` is set. The
build runs `tsc`, and TypeScript is a devDependency, so a plain `npm install`
here fails with `tsc: not found`.

Environment variables:

| Variable | Value |
| --- | --- |
| `MONGODB_URI` | From step 2 |
| `JWT_SECRET` | A fresh long random string — do not reuse the local one |
| `JWT_EXPIRES_IN` | `7d` |
| `GROQ_API_KEY` | From Groq |
| `PINECONE_API_KEY` | From Pinecone |
| `PINECONE_INDEX_NAME` | From step 1 |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Leave empty for now — filled in step 5 |

Do **not** set `PORT`. Render assigns one and the server already reads
`process.env.PORT`.

`NODE_ENV=production` is what makes the auth cookie use `secure: true` and
`sameSite: "none"`, which a cross-domain login needs. Without it, login silently
fails in the browser.

## 4. Frontend on Vercel

Import the repo, set **Root Directory** to `frontend`, and add:

```
NEXT_PUBLIC_API_URL = https://<your-render-service>.onrender.com/api
```

The `/api` suffix is required — the client appends paths like `/auth/login` to it.

`NEXT_PUBLIC_*` variables are baked into the bundle at build time. Changing this
value later does nothing until you **redeploy**.

## 5. Point the backend back at the frontend

In Render, set `FRONTEND_URL` to the Vercel URL and let the service restart.

Write it exactly: `https`, no trailing slash, no `www.` unless that is really
the host. CORS compares the browser's `Origin` header against this string
character for character.

A mismatch looks like this: login appears to succeed, then every request after
it returns 401. The cookie was rejected because the response failed the
credentialed CORS check, so it was never stored.

## 6. Verify, in this order

1. `curl https://<your-render-service>.onrender.com/health` — `database` must
   read `connected` and `environment` must read `production`.
2. Register, log in, then refresh the page. Still logged in means the cookie
   works.
3. Upload a small **`.txt`** file, not a PDF. This is the request that loads the
   embedding model, so it is the slowest one you will see.
4. Select that document in chat and ask something about it. The answer should
   stream and show sources.
5. Log out. `/api/auth/me` should return 401.

Test in this order because each step depends on the one above it. A chat failure
usually means the upload never indexed, and an upload failure usually means the
database or Pinecone is misconfigured.

## What the free tiers actually feel like

**The first request after idle is slow.** Render's free instance sleeps after
15 minutes and its disk is wiped, so waking up means starting the service *and*
re-downloading `Xenova/all-MiniLM-L6-v2`, which runs in-process. Budget 1.5–2
minutes for the first upload or question. Send a throwaway request to warm it up
before showing the app to anyone.

**Memory is tight.** The free instance has 512 MB, shared by Node, Mongoose,
LangChain, onnxruntime and the model. It fits, but not with much room. If you
see the service restarting under load, the realistic fixes are a paid instance,
or moving embeddings to a hosted API — and that second option means re-indexing
every document, because a different model means a different vector dimension.

**Other ceilings.** Groq's free tier is rate limited; Atlas M0 gives 512 MB of
storage; Pinecone's starter plan allows one index.
