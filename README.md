# Alumni Bridge Frontend

Production-oriented React + Vite frontend for Alumni Bridge, connecting students,
alumni, mentors, and colleges through mentorship, jobs, events, discussions,
chat, notifications, and career guidance.

## Stack

- React 19 and React Router
- Redux Toolkit
- Axios
- Socket.IO Client
- Tailwind CSS
- Framer Motion and Lucide React
- Vitest, Testing Library, and jsdom

## Architecture

```text
components/
  auth/            Split-screen authentication experience
  common/          Logo, notifications, headers, route status
  layout/          Responsive role-aware application shell
  providers/       Single authenticated Socket.IO connection
  ui/              Reusable controls, cards, dialogs and states
config/             Validated runtime environment
docs/               Audited backend contract map
hooks/              Data loading, debounce and socket access
pages/              Lazy-loaded product routes
services/           Axios, session, payload and error normalization
store/              Normalized auth, notifications and toasts
test/               Vitest and Testing Library coverage
utils/              Shared routing utilities
```

See [docs/backend-contract-map.md](docs/backend-contract-map.md) for the audited
request, response, permission, entity, and Socket.IO contracts.

## Local setup

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

Create `.env` from `.env.example`:

```env
VITE_API_URL=https://alumni-bridge-backend.onrender.com/api
VITE_SOCKET_URL=https://alumni-bridge-backend.onrender.com
```

These are public service URLs, not secrets. `VITE_API_URL` must contain exactly
one `/api` suffix and `VITE_SOCKET_URL` must not include `/api`.
`config/env.js` validates both values. Production builds never silently fall
back to localhost.

## Quality checks

```bash
npm run lint
npm test
npm run build
```

The test suite covers authentication normalization and expiry, User/College
registration payloads, role-aware routing, role selection, responsive
navigation, loading/error states, notifications, and Socket.IO cleanup.

## Routes

Authentication:

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

Student:

- `/dashboard`
- `/mentors`
- `/mentors/:id`
- `/mentorship`

Alumni:

- `/alumni/dashboard`
- `/alumni/mentor`
- `/alumni/requests`

College:

- `/college/dashboard`
- `/college/approvals`

Shared according to backend permissions:

- `/chat`
- `/discussions`
- `/discussions/:id`
- `/jobs`
- `/events`
- `/ai-assistant`
- `/profile`

## Authentication and realtime state

The auth slice stores separate User and College entities, restores a token with
`GET /auth/me` at startup, redirects unauthorized roles to their own dashboard,
and clears protected state on logout or session expiry.

`components/providers/SocketProvider.jsx` owns the only global Socket.IO
connection. Chat joins and leaves conversation rooms with listener cleanup.
Message sends use the authorized REST endpoint as the reliable path while the
socket delivers live messages, typing state, and notifications.

## Vercel deployment

Use:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |

Add both environment variables in **Vercel → Project Settings → Environment
Variables** for Production and Preview, then redeploy. The included
`vercel.json` rewrites every application path to `index.html`, so direct route
refreshes work:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## License

See [LICENSE](LICENSE).
