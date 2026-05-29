# Alta Security Dashboard

Et React-baseret statistik-dashboard til Avigilon Alta Video API.

## Kør lokalt

```bash
npm install
npm run dev
```

Åbn http://localhost:5173

## Deploy til Vercel (gratis)

1. Opret konto på [vercel.com](https://vercel.com)
2. Push koden til GitHub
3. Klik "Import Project" i Vercel → vælg dit repo
4. Build command: `npm run build`
5. Output dir: `dist`
6. Klik Deploy → dit dashboard er online på `https://dit-projekt.vercel.app`

## Tilslut til rigtig Alta API

Rediger `src/api/mockData.js` og erstat mock-funktionerne med rigtige API-kald:

```js
// Eksempel: Hent kameraer fra Alta API
export async function getCameras(serverUrl, sessionCookie) {
  const res = await fetch(`${serverUrl}/api/v1/devices`, {
    headers: { Cookie: sessionCookie }
  })
  return res.json()
}

// Login
export async function login(serverUrl, username, password) {
  const res = await fetch(`${serverUrl}/api/v1/dologin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  return res // Cookie sættes automatisk
}
```

## Miljøvariabler

Opret `.env` fil:

```
VITE_API_BASE=https://din-alta-server.eu1.aware.avasecurity.com
```

## Sider i dashboardet

| Side | Data fra Alta API |
|------|-------------------|
| Overblik | `/api/v1/devices`, `/api/v1/alarms` |
| Kameraer | `/api/v1/devices` |
| Alarmer | `/api/v1/alarms`, `/api/v1/events` |
| Analytics | counting, LPR, anomalies endpoints |
| Live Feed | Webhooks (push fra Alta) |

## Teknisk stack

- **Frontend**: React 18 + Vite
- **Charts**: Recharts
- **Hosting**: Vercel (gratis)
- **API**: Avigilon Alta Video REST API

## Backend proxy (valgfrit)

Hvis Alta-serveren ikke tillader CORS fra browseren, skal der en proxy til.
Se `/backend/` mappen for en simpel Node.js Express-proxy.
