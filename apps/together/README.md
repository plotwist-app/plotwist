# Together

Together is an MVP sandbox for picking tonight's movie as a group: one person
creates a room, shares a locale-neutral invite link, everyone votes and matches
show up. It runs as its own Next.js app so it can be tested on its own
(conversion, retention) before being integrated into Plotwist.

It has no Plotwist session. Rooms, participants and swipes go through the
existing Plotwist backend (`/together/*` endpoints and the `/tmdb` proxy).

## Running locally

```bash
cp apps/together/.env.example apps/together/.env.local
pnpm --filter together dev   # http://localhost:3001
```

Other scripts: `pnpm --filter together test`, `typecheck`, `build`.

The backend must be running (`apps/backend`, `make run`) for rooms to work.

## Routes

| Path                     | Screen                                    |
| ------------------------ | ----------------------------------------- |
| `/[lang]`                | Welcome (create or join a room)           |
| `/[lang]/[code]`         | Room (invite, join, waiting room)         |
| `/[lang]/[code]/vote`    | Voting deck                               |
| `/[lang]/[code]/matches` | Matches                                   |
| `/[lang]/[code]/swipe`   | Legacy redirect to `vote`                 |

Paths without a locale (for example invite links like `/ABC123`) are redirected
by `src/proxy.ts` to the locale detected from `Accept-Language`.

## Environment variables

| Variable                     | Purpose                                                          |
| ---------------------------- | ---------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`        | Plotwist backend URL (required)                                  |
| `NEXT_PUBLIC_APP_URL`        | Public URL of this app, used for invite links and metadata       |
| `NEXT_PUBLIC_PLOTWIST_URL`   | Plotwist web URL for the sign-up CTA (default `https://plotwist.app`) |
| `NEXT_PUBLIC_MEASUREMENT_ID` | Google Analytics ID; analytics are disabled when unset           |

## Deploying

Deploy as its own Vercel project with the root directory set to
`apps/together`. The backend must allow this origin: set `TOGETHER_CLIENT_URL`
on the backend to the app's public URL (for example
`https://together.plotwist.app`), otherwise production CORS and the client
guard reject its requests. Plotwist web redirects old `/together` URLs to
`NEXT_PUBLIC_TOGETHER_URL` (default `https://together.plotwist.app`).
