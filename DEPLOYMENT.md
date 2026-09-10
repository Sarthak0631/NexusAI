# Deploying NexusAI for free — beginner guide

This guide assumes you have **never deployed anything before**. Follow it top to
bottom, one step at a time. Total time: about 45–60 minutes. Cost: ₹0.

Website menus change from time to time. If a button is named slightly
differently from what is written here, look for the closest match. The idea of
each step stays the same.

---

## What you are building

NexusAI has two parts. Each goes to a different free website:

| Part | Folder in the repo | Where it goes | What it does |
| --- | --- | --- | --- |
| Backend | `backend/` | **Render** | The server: login, uploads, AI answers |
| Frontend | `frontend/` | **Vercel** | The website people open in the browser |

The backend also needs three online services to store data and run the AI:

| Service | What it stores / does |
| --- | --- |
| **MongoDB Atlas** | Users, conversations, document info |
| **Pinecone** | Document text converted to numbers so it can be searched |
| **Groq** | The AI model that writes the answers |

**Order matters.** You will set up the three services first, then the backend,
then the frontend, then connect the two together.

---

## Before you start

### A notepad for your values

Open Notepad (or any text file). As you go, you will copy values like passwords
and keys into it. At the end it should look like this:

```
MONGODB_URI=
PINECONE_API_KEY=
PINECONE_INDEX_NAME=
GROQ_API_KEY=
JWT_SECRET=
RENDER_URL=
VERCEL_URL=
```

> **Keep this file private.** Never commit it to GitHub, never paste it in
> chat. Anyone with these values can use your accounts. Delete the file when
> you are done.

### GitHub access

Render and Vercel read the code directly from GitHub. The repo is
`https://github.com/Sarthak0631/NexusAI`.

Sign up to Render and Vercel **with the GitHub account that owns the repo**
(`Sarthak0631`). If you use a different account, that account must be added as
a collaborator on the repo first, or Render and Vercel will not be able to see
it.

---

## Step 1 — MongoDB Atlas (the database)

1. Go to <https://www.mongodb.com/cloud/atlas/register> and sign up (signing in
   with Google is fine).
2. If it asks you questions about your goals or experience, pick anything — it
   does not affect the setup.
3. Create a cluster:
   - Choose the **M0 / Free** option. Make sure it says **Free**.
   - Provider: **AWS**. Region: pick one near you (for India, **Mumbai**).
   - Click **Create Deployment** / **Create**.
4. It now asks you to create a **database user**:
   - Username: e.g. `nexusai`
   - Password: click **Autogenerate Secure Password**, then **copy it into your
     notepad**.
   - Click **Create Database User**.

   > If you type your own password, avoid the characters `@ : / ? # %`. They
   > break the connection string. Letters and numbers only is safest.

5. Allow connections from anywhere:
   - In the left menu open **Network Access** (under *Security*).
   - Click **Add IP Address** → **Allow Access from Anywhere**. The box fills
     with `0.0.0.0/0`.
   - Click **Confirm**. Wait until the status turns **Active** (about a minute).

   *Why:* Render's free plan does not have a fixed IP address, so you cannot
   whitelist just one. Without this step the backend cannot reach the database.

6. Get the connection string:
   - Left menu → **Database** / **Clusters** → click **Connect** on your cluster.
   - Choose **Drivers**.
   - Copy the string. It looks like:

     ```
     mongodb+srv://nexusai:<db_password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```

7. Edit that string in your notepad:
   - Replace `<db_password>` with your real password (remove the `< >` too).
   - Add `nexusai` right after `.mongodb.net/` so the data goes into a database
     with a clear name:

     ```
     mongodb+srv://nexusai:YourPassword123@cluster0.abcde.mongodb.net/nexusai?retryWrites=true&w=majority&appName=Cluster0
     ```

   Save this as `MONGODB_URI` in your notepad.

✅ **Done when:** you have a `MONGODB_URI` with your real password in it.

---

## Step 2 — Pinecone (document search)

1. Go to <https://app.pinecone.io> and sign up.
2. Get your API key:
   - Left menu → **API Keys**.
   - A default key usually already exists. Copy it (or click **Create API
     key**, give it any name, and copy it).
   - Save it as `PINECONE_API_KEY` in your notepad.
3. Create an index:
   - Left menu → **Indexes** / **Database** → **Create index**.
   - **Name:** `nexusai` — save it as `PINECONE_INDEX_NAME`.
   - If it offers ready-made model presets, **skip them** and choose to set the
     configuration yourself (manual / custom).
   - **Dimension:** `384`
   - **Metric:** `cosine`
   - **Type:** Serverless. Cloud **AWS**, region **us-east-1** (the free
     region).
   - Click **Create index**.

> **The dimension must be exactly 384.** NexusAI turns every piece of text into
> a list of 384 numbers. If the index expects a different size, every upload
> fails. This cannot be changed later — you would have to delete and recreate
> the index.

✅ **Done when:** you have `PINECONE_API_KEY` and `PINECONE_INDEX_NAME`, and the
index shows dimension **384**.

---

## Step 3 — Groq (the AI model)

1. Go to <https://console.groq.com> and sign up.
2. Left menu → **API Keys** → **Create API Key**. Give it any name.
3. **Copy the key immediately** — Groq shows it only once. Save it as
   `GROQ_API_KEY`.

✅ **Done when:** you have a `GROQ_API_KEY` starting with `gsk_`.

---

## Step 4 — Make a JWT secret

This is a long random password the backend uses to sign login sessions. You
make it yourself.

If you have Node.js installed, run this in a terminal:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the output and save it as `JWT_SECRET`.

No Node.js? Use any password generator and make a random string of **at least
64 letters and numbers**.

> Use a new value here. Do not reuse the one from your local `backend/.env`.

✅ **Done when:** you have a long random `JWT_SECRET`.

---

## Step 5 — Deploy the backend on Render

1. Go to <https://render.com> → **Get Started** → sign up **with GitHub**.
2. Allow Render to access your GitHub. If it asks *which repositories*, choose
   **All repositories** or select `NexusAI`.
3. On the dashboard click **+ New** → **Web Service**.
4. Find `NexusAI` in the list and click **Connect**.

   *Not in the list?* Click **Configure account** / **GitHub permissions** and
   give Render access to the repo. See *GitHub access* at the top of this guide.

5. Fill in the form **exactly** like this:

   | Field | What to enter |
   | --- | --- |
   | Name | `nexusai-backend` (this becomes part of your URL) |
   | Region | Singapore (closest to India) — or nearest to you |
   | Branch | `main` |
   | Root Directory | `backend` |
   | Runtime / Language | `Node` |
   | Build Command | `npm ci --include=dev && npm run build` |
   | Start Command | `npm start` |
   | Instance Type | **Free** |

   > **Copy the Build Command exactly.** The plain `npm install` that Render
   > suggests will fail with `tsc: not found`. The reason: you are about to set
   > `NODE_ENV=production`, and in that mode npm skips the tools needed to
   > build the code. `--include=dev` tells it to install them anyway.

6. Scroll to **Environment Variables**. Click **Add Environment Variable** once
   for each row, pasting from your notepad:

   | Key | Value |
   | --- | --- |
   | `MONGODB_URI` | from Step 1 |
   | `PINECONE_API_KEY` | from Step 2 |
   | `PINECONE_INDEX_NAME` | from Step 2 (e.g. `nexusai`) |
   | `GROQ_API_KEY` | from Step 3 |
   | `JWT_SECRET` | from Step 4 |
   | `NODE_ENV` | `production` |

   - Type the key names **exactly** — capital letters, underscores, no spaces.
   - Do **not** add `PORT`. Render sets it automatically.
   - Do **not** add `FRONTEND_URL` yet. You add it in Step 7.

7. If there is an **Advanced** section with **Health Check Path**, enter
   `/health`.
8. Click **Create Web Service** / **Deploy Web Service**.

Render now shows a log screen. The first build takes **5–10 minutes**. Wait
until you see **Live** / **Your service is live**.

9. At the top of the page there is a URL like
   `https://nexusai-backend-xxxx.onrender.com`. Copy it and save it as
   `RENDER_URL` — **without** a slash at the end.

10. **Test it.** Open this in your browser (put your own URL):

    ```
    https://nexusai-backend-xxxx.onrender.com/health
    ```

    You should see something like:

    ```json
    { "success": true, "database": "connected", "environment": "production" }
    ```

    - `"database": "disconnected"` → go back to Step 1, points 5 and 7.
    - `"environment": "development"` → `NODE_ENV` is missing or misspelled.

✅ **Done when:** `/health` shows `connected` and `production`.

---

## Step 6 — Deploy the frontend on Vercel

1. Go to <https://vercel.com/signup> → sign up **with GitHub**.
2. On the dashboard click **Add New…** → **Project**.
3. Find `NexusAI` and click **Import**.

   *Not in the list?* Click **Adjust GitHub App Permissions** and give Vercel
   access to the repo.

4. On the configure screen:
   - **Framework Preset:** should say **Next.js** automatically.
   - **Root Directory:** click **Edit** → choose **`frontend`** → **Continue**.
     *This is the most commonly missed step.* Without it the build fails,
     because the website code lives inside `frontend/`, not at the top of the
     repo.
   - Leave Build and Output settings as they are.

5. Open **Environment Variables** and add one:

   | Key | Value |
   | --- | --- |
   | `NEXT_PUBLIC_API_URL` | your `RENDER_URL` + `/api` |

   Example: `https://nexusai-backend-xxxx.onrender.com/api`

   > Must end in **`/api`** and must start with **`https://`**.

6. Click **Deploy**. It takes 2–4 minutes. When you see the congratulations
   screen, click **Continue to Dashboard**.

7. Find your **permanent** website address:
   - On the project page, look at **Domains**. It looks like
     `https://nexus-ai-xxxx.vercel.app`.
   - Save it as `VERCEL_URL` — **without** a slash at the end.

   > Use the address under **Domains**, not the long one with random letters
   > from a single deployment. Those long addresses change on every deploy; the
   > domain stays the same.

✅ **Done when:** the Vercel address opens the NexusAI landing page.

**Do not try to log in yet** — it will not work until Step 7.

---

## Step 7 — Connect backend and frontend

The backend refuses requests from websites it does not know. Now you tell it
your Vercel address.

1. Go back to **Render** → your `nexusai-backend` service → **Environment**.
2. **Add Environment Variable**:

   | Key | Value |
   | --- | --- |
   | `FRONTEND_URL` | your `VERCEL_URL` |

   Example: `https://nexus-ai-xxxx.vercel.app`

   Check it character by character:
   - starts with `https://`
   - **no** `/` at the end
   - no extra spaces

3. Click **Save Changes** (choose **Save and deploy** if asked). Wait for the
   service to go **Live** again (1–3 minutes).

✅ **Done when:** Render shows **Live** after the redeploy.

---

## Step 8 — Test everything, in this order

Do these in order. Each one depends on the one before it.

| # | What to do | What should happen |
| --- | --- | --- |
| 1 | Open `RENDER_URL/health` | `database: connected` |
| 2 | Open your Vercel site → **Register** | Account created |
| 3 | **Log in** | You land on the dashboard |
| 4 | **Refresh the page** | You are still logged in |
| 5 | **Documents** → upload a small **`.txt`** file | Status becomes `ready` |
| 6 | **Chat** → pick that document → ask about it | Answer appears word by word, with sources |
| 7 | **Log out** | You are logged out |

> **Step 5 is slow the first time** — up to 2 minutes. The server downloads the
> AI model used to read documents. Wait; do not click upload again. Later
> uploads are much faster.

If all seven pass — **your app is live.** 🎉 Share your Vercel address.

---

## If something goes wrong

| What you see | Most likely cause | Fix |
| --- | --- | --- |
| Render build fails: `tsc: not found` | Wrong build command | Step 5.5 — use `npm ci --include=dev && npm run build` |
| Render log: `GROQ_API_KEY is missing` (or `PINECONE_...`) | Env variable missing or misspelled | Step 5.6 — check the spelling of the key name |
| `/health` → `database: disconnected` | Atlas blocking Render, or wrong password | Step 1.5 (`0.0.0.0/0`) and Step 1.7 (password in the string) |
| Render log: `SSL alert number 80` | Atlas access list | Step 1.5 |
| Vercel build fails immediately | Root Directory not set | Vercel → Settings → General → Root Directory → `frontend` → redeploy |
| Login seems to work, then kicks you out or shows errors | `FRONTEND_URL` does not exactly match | Step 7 — no trailing `/`, must be `https://` |
| Browser console shows a **CORS** error | Same as above | Step 7 |
| Site calls `localhost` / nothing loads | `NEXT_PUBLIC_API_URL` missing | Step 6.5, then **redeploy** (below) |
| Upload fails every time | Pinecone index dimension is not 384 | Step 2 — delete and recreate the index with 384 |
| First request takes about a minute | Free Render server was asleep | Normal — see below |

### Changed a Vercel variable? Redeploy.

Vercel builds `NEXT_PUBLIC_API_URL` into the website when it builds. Changing
the value does nothing until you rebuild: **Deployments** → **⋯** on the latest
one → **Redeploy**.

Render redeploys by itself when you save environment variables.

### Where to look for errors

- **Render:** your service → **Logs**. Red lines usually name the problem.
- **Vercel:** your project → **Deployments** → click the failed one → **Build
  Logs**.
- **Browser:** press **F12** → **Console** tab.

---

## Things to know about the free plans

- **The server sleeps.** After 15 minutes with no visitors, Render's free server
  shuts down. The next visitor waits **1–2 minutes** while it wakes and reloads
  the AI model. Before a demo, open `RENDER_URL/health` a couple of minutes
  early to wake it up.
- **Limited memory (512 MB).** Fine for normal use. If Render logs show the
  service restarting under heavy use, that is the limit being hit.
- **Groq** has a free usage limit. Very heavy use may briefly return errors.
- **MongoDB Atlas** free: 512 MB of storage — plenty for this project.
- **Pinecone** free: one index — the one you made in Step 2.

---

## Updating the live app later

Whenever new code is pushed to the `main` branch on GitHub, **both Render and
Vercel redeploy automatically**. You do not need to repeat this guide — just
push and wait a few minutes.
