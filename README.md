# 🏆 Task Champion

A gamified task tracker — turn your to-do list into a shared scoreboard. Add players, create tasks, claim points on completion, and watch the leaderboard, levels, and badges update **for everyone you share the link with**. Built with **React + Vite** on the frontend and a **Vercel serverless function + MongoDB Atlas** backend, so the board is shared in real time (polling every 5s) instead of living only in one browser.

## How it works

- The frontend never talks to MongoDB directly — it calls one API route, `/api/state`.
- `GET /api/state` returns the current shared board (`players`, `tasks`, `history`).
- `POST /api/state` takes `{ action, payload }` (e.g. `addPlayer`, `completeTask`) and returns the updated board.
- Everyone who opens the deployed link reads and writes the **same** document in MongoDB, so points, tasks, and history are shared across devices and people.

## Project structure

```
task-champion/
├── api/
│   └── state.js         # Serverless function — the entire backend API
├── lib/
│   └── mongodb.js        # Cached MongoDB connection helper
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── store.jsx         # Talks to /api/state, polls for updates, derives leaderboard/levels/badges
│   ├── index.css
│   └── components/
│       ├── Header.jsx
│       ├── StatusBanner.jsx   # Loading / error messages (e.g. missing DB connection)
│       ├── NavTabs.jsx
│       ├── Dashboard.jsx
│       ├── Podium.jsx
│       ├── Leaderboard.jsx
│       ├── Tasks.jsx
│       ├── TaskForm.jsx
│       ├── TaskItem.jsx
│       ├── Players.jsx
│       ├── History.jsx
│       └── ConfirmModal.jsx
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── .env.example
```

## 1. Set up a free MongoDB database

1. Go to [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Create a free **M0 cluster** (any provider/region is fine).
3. Under **Database Access**, add a database user with a username + password (save these).
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) — simplest option for a small shared app like this.
5. Click **Connect → Drivers**, copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with the ones you created.

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and paste in your real connection string:

```bash
cp .env.example .env.local
```

```
MONGODB_URI=mongodb+srv://yourUser:yourPassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=task_champion
```

`.env.local` is git-ignored, so your credentials won't be committed.

## 3. Run it locally

Because the backend is a serverless function, plain `npm run dev` (Vite only) won't serve `/api/state`. Use the Vercel CLI's local dev server instead — it runs the frontend **and** the API function together:

```bash
npm install
npm install -g vercel   # if you don't have it yet
vercel dev
```

Open the printed local URL. The first request will create the shared board document automatically.

(You can still use `npm run dev` for quick UI-only tweaks, but the app will show a "Loading the shared board…" banner forever since there's no API to answer it.)

## 4. Deploy to Vercel

**Option A — Vercel CLI**

```bash
vercel
```

The first time, it'll ask to link/create a project. After that, add your environment variable so the **deployed** app can reach MongoDB too:

```bash
vercel env add MONGODB_URI
vercel env add MONGODB_DB
```

(Paste the same values from `.env.local` when prompted, and choose Production + Preview + Development.)

Then deploy for real:

```bash
vercel --prod
```

**Option B — GitHub + Vercel dashboard**

1. Push this folder to a GitHub repo.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Before the first deploy (or in **Project Settings → Environment Variables** after), add `MONGODB_URI` and `MONGODB_DB`.
4. Deploy. Share the resulting `*.vercel.app` link — everyone who opens it sees and edits the same board.

## Customizing

- **Levels & badge thresholds:** edit `LEVELS` / `BADGES` in `src/store.jsx`
- **Colors/fonts:** edit the CSS variables at the top of `src/index.css`
- **Starting empty vs. seeded:** the board starts empty automatically the first time `/api/state` is called — no seed data to edit anymore
- **Poll frequency:** change `POLL_INTERVAL_MS` in `src/store.jsx` (default 5000ms)

## Notes & limits

- This uses simple polling, not websockets — updates from other people appear within ~5 seconds, not instantly.
- There's no login system — anyone with the link can add/edit/delete anything on the board. Fine for a friend group, family, or small team; not meant for public/untrusted sharing.
- All players share **one** board (one MongoDB document). If you want multiple independent boards later, that mainly means keying documents by a board ID (e.g. from the URL) instead of the fixed `"default-board"` id in `api/state.js`.
