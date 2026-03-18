# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Plotwist is a media management app (movies, series, anime) with three main apps in a pnpm/Turbo monorepo:
- `apps/web` — Next.js 16 web app
- `apps/backend` — Fastify 5 REST API
- `apps/ios` — Native SwiftUI iOS app

## Commands

### Root (all apps via Turbo)
```bash
pnpm run dev          # Start all dev servers
pnpm run build        # Build all apps
pnpm run test         # Run all tests
pnpm run biome:check  # Lint + format check
pnpm run biome:format # Format code
```

### Web (`apps/web`)
```bash
pnpm run dev          # Next.js dev server
pnpm run build        # Production build
pnpm run test         # Vitest unit tests
pnpm run typecheck    # TypeScript type check
pnpm run generate:api # Regenerate API types from backend OpenAPI spec (Orval)
```

### Backend (`apps/backend`)
```bash
make run              # Start dev server (tsx watch)
make test             # Run Vitest tests
make lint             # Biome lint
make build            # Production build (tsup)
make compose-up       # Start Docker (Postgres, Redis, LocalStack S3)
make compose-down     # Stop Docker

pnpm run db:migrate   # Run Drizzle migrations
pnpm run db:studio    # Open Drizzle Studio
pnpm run db:seed      # Seed database
```

## Architecture

### Backend — Clean Architecture / DDD

```
src/domain/           # Business logic (no framework deps)
  services/           # Use cases (one file per operation)
  entities/           # Data models
  errors/             # Domain errors
  dispatchers/        # Event dispatching
src/infra/
  http/               # Fastify server, routes, middleware (JWT)
  db/                 # Drizzle ORM schema, migrations, queries
  factories/          # Dependency injection
  consumers/          # SQS message queue handlers
  telemetry/          # OpenTelemetry
src/workers/          # Background jobs (node-cron)
```

Services are instantiated via factories and injected into Fastify routes. Each domain service receives its dependencies explicitly. The backend exposes an OpenAPI spec consumed by the web app via Orval to generate typed API clients.

### Web — Next.js App Router + React Query

- All routes live under `src/app/[lang]/` for i18n (7 languages)
- API calls use generated types from `pnpm run generate:api` (Orval → TanStack Query hooks)
- `packages/ui` is a shared shadcn/ui component library consumed by the web app
- Forms use React Hook Form + Zod validation

### iOS — Service-Oriented (no MVVM)

**No ViewModels.** State lives directly in Views with `@State`.

```
Views/                # SwiftUI screens by feature (Auth, Home, Details, Profile, Onboarding)
Components/           # Reusable UI components (11 files)
Services/             # Singletons: AuthService.shared, TMDBService.shared, ReviewService.shared, etc.
Theme/                # ThemeManager.swift, Colors.swift
Localization/         # Strings.swift (L10n.current)
```

Data flow: `View (@State) → Service.shared → API (async/await) → Response → View`

Cache pattern: restore from cache in `.onAppear`, load fresh data in `.task { }`.

Cross-tab navigation uses `NotificationCenter.default.post(name: .navigateToSearch, object: nil)`.

## iOS Development Rules

### Do not:
- Create separate ViewModels — use `@State` in the View
- Use `NavigationView` — always use `NavigationStack`
- Use `AsyncImage` — always use `CachedAsyncImage`
- Use hardcoded colors — always use `Theme/Colors.swift` tokens
- Use loose corner radius values — always use `DesignTokens.CornerRadius.*`
- Ignore guest mode (`AuthService.shared.isAuthenticated`) in auth-required features
- Forget `.onReceive(NotificationCenter.default.publisher(for: .languageChanged))` when displaying strings

### Design tokens:
```swift
Color.appBackgroundAdaptive       // Main screen background
Color.appSheetBackgroundAdaptive  // Sheet background
Color.appForegroundAdaptive       // Primary text
Color.appMutedForegroundAdaptive  // Secondary text/inactive icons
Color.appBorderAdaptive           // Borders, dividers
Color.appInputFilled              // Input/badge backgrounds
Color.appDestructive              // Errors
Color.appStarYellow               // Star ratings

DesignTokens.CornerRadius.poster    // 16 — poster cards
DesignTokens.CornerRadius.thumbnail // 8  — thumbnails
DesignTokens.CornerRadius.input     // 12 — inputs, buttons
DesignTokens.CornerRadius.badge     // 6  — badges
```

### Standard spacing:
- Horizontal padding: 24
- Between sections: 24–32
- Within sections: 12
- Form fields: 16
- Button height: 48 (`PrimaryButton`), 52 (CTA in `LoginView`)
- Poster card: 120×180

### View template:
```swift
struct NomeDaTelaView: View {
    @State private var isLoading = false
    @State private var strings = L10n.current

    var body: some View {
        ZStack {
            Color.appBackgroundAdaptive.ignoresSafeArea()
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 24) { }
                    .padding(.horizontal, 24)
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
            strings = L10n.current
        }
    }
}
```

## Code Style

- **Formatter/Linter:** Biome (not ESLint/Prettier) for all TS/JS/JSX — run `pnpm run biome:check`
- **iOS:** SwiftLint
- **TypeScript:** Strict mode; Zod for runtime validation at system boundaries
- **File naming iOS:** `*View.swift`, `*Service.swift`, `*Card.swift`, `*Skeleton.swift`, extensions as `View+Sheet.swift`

## Key Integrations

| Service | Purpose |
|---------|---------|
| TMDB API | Media data (movies, series, anime) |
| Stripe | Premium subscriptions |
| Resend + React Email | Transactional email |
| PostHog | Analytics (`AnalyticsService.shared.track(...)`) |
| AWS SQS/S3 | Message queue + file storage (LocalStack in dev) |
| Redis | Caching layer |
| OpenTelemetry | Distributed tracing |

## Localization

iOS supports 7 languages: `en-US`, `pt-BR`, `es-ES`, `fr-FR`, `de-DE`, `it-IT`, `ja-JP`. All strings come from `L10n.current` in `Localization/Strings.swift`.
