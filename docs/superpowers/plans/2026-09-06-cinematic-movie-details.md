# Cinematic Movie Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public, cookie-persisted experimental UI switch and use it to select a Together-inspired cinematic renderer for movie detail pages.

**Architecture:** Keep the existing movie fetch and structured data in one server component, then select a classic or cinematic presentation from a validated cookie. Pass the server-read preference into the existing header configuration tree so the client control hydrates with the correct state, writes the non-sensitive cookie, and refreshes the route.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Radix Switch, Vitest, Testing Library, Biome.

## Global Constraints

- The UI preference is exactly `classic | cinematic`.
- Classic remains the default for missing or invalid values.
- The UI preference remains independent from `light | dark | system`.
- The control is available to guests and authenticated users.
- The first and only migrated product surface in this plan is movie details.
- Movie data, metadata, structured data, actions, collection, and tabs are not duplicated.
- All seven supported web languages receive localized control copy.
- No new dependency is added.

---

### Task 1: UI-version preference model

**Files:**
- Create: `apps/web/src/lib/ui-version.ts`
- Create: `apps/web/src/lib/ui-version.test.ts`
- Create: `apps/web/test/setup.ts`
- Modify: `apps/web/vitest.preview.config.ts`

**Interfaces:**
- Produces: `type UiVersion = 'classic' | 'cinematic'`
- Produces: `UI_VERSION_COOKIE_NAME`
- Produces: `parseUiVersion(value: string | null | undefined): UiVersion`
- Produces: `readUiVersionCookie(cookieHeader: string): UiVersion`
- Produces: `serializeUiVersionCookie(value: UiVersion): string`

- [ ] **Step 1: Restore the referenced Vitest setup and expand the focused config**

Create the setup module already referenced by the main Vitest configuration:

```ts
export {}
```

Add the app alias so preference and component tests resolve production imports:

```ts
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom' },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/': resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 2: Write failing preference tests**

```ts
import { describe, expect, it } from 'vitest'
import {
  parseUiVersion,
  readUiVersionCookie,
  serializeUiVersionCookie,
} from './ui-version'

describe('ui version preference', () => {
  it.each([
    [undefined, 'classic'],
    [null, 'classic'],
    ['', 'classic'],
    ['unexpected', 'classic'],
    ['classic', 'classic'],
    ['cinematic', 'cinematic'],
  ] as const)('parses %s as %s', (value, expected) => {
    expect(parseUiVersion(value)).toBe(expected)
  })

  it('reads the preference from a cookie header', () => {
    expect(readUiVersionCookie('theme=dark; plotwist-ui=cinematic')).toBe(
      'cinematic'
    )
  })

  it('serializes a persistent first-party cookie', () => {
    expect(serializeUiVersionCookie('cinematic')).toBe(
      'plotwist-ui=cinematic; Path=/; Max-Age=31536000; SameSite=Lax'
    )
  })
})
```

- [ ] **Step 3: Run the test and verify RED**

Run:

```bash
pnpm --filter web exec vitest run src/lib/ui-version.test.ts --config vitest.preview.config.ts
```

Expected: FAIL because `ui-version.ts` does not exist.

- [ ] **Step 4: Implement the preference model**

```ts
export const UI_VERSION_COOKIE_NAME = 'plotwist-ui'
export type UiVersion = 'classic' | 'cinematic'

export function parseUiVersion(value: string | null | undefined): UiVersion {
  return value === 'cinematic' ? 'cinematic' : 'classic'
}

export function readUiVersionCookie(cookieHeader: string): UiVersion {
  const value = cookieHeader
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${UI_VERSION_COOKIE_NAME}=`))
    ?.split('=')[1]

  return parseUiVersion(value)
}

export function serializeUiVersionCookie(value: UiVersion): string {
  return `${UI_VERSION_COOKIE_NAME}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`
}
```

- [ ] **Step 5: Run the test and verify GREEN**

Run the command from Step 3. Expected: all preference tests pass.

- [ ] **Step 6: Commit**

```bash
git add apps/web/vitest.preview.config.ts apps/web/src/lib/ui-version.ts apps/web/src/lib/ui-version.test.ts
git commit -m "feat(web): add UI version preference model"
```

### Task 2: Public experimental appearance control

**Files:**
- Create: `apps/web/src/components/header/ui-version-control.tsx`
- Create: `apps/web/src/components/header/ui-version-control.test.tsx`
- Modify: `apps/web/src/components/header/header-navigation-drawer-configs.tsx`
- Modify: `apps/web/src/components/header/header.tsx`
- Modify: `apps/web/src/components/header/header-account.tsx`
- Modify: `apps/web/src/components/header/header-navigation-drawer.tsx`
- Modify: `apps/web/src/app/[lang]/layout.tsx`
- Modify: `apps/web/public/dictionaries/en-US.json`
- Modify: `apps/web/public/dictionaries/pt-BR.json`
- Modify: `apps/web/public/dictionaries/es-ES.json`
- Modify: `apps/web/public/dictionaries/fr-FR.json`
- Modify: `apps/web/public/dictionaries/de-DE.json`
- Modify: `apps/web/public/dictionaries/it-IT.json`
- Modify: `apps/web/public/dictionaries/ja-JP.json`

**Interfaces:**
- Consumes: `UiVersion`, `parseUiVersion`, and `serializeUiVersionCookie`
- Produces: `UiVersionControl({ initialVersion, label, experimentalLabel, errorLabel })`
- Changes: `Header`, `HeaderAccount`, `HeaderNavigationDrawer`, and `HeaderNavigationDrawerConfigs` receive `uiVersion: UiVersion`

- [ ] **Step 1: Add dictionary keys in every locale**

Add adjacent top-level keys with natural translations:

```json
"appearance": "Appearance",
"new_interface": "New interface",
"experimental": "Experimental",
"ui_preference_error": "Could not update the interface preference."
```

Use `Aparência`, `Nova interface`, `Experimental`, and `Não foi possível atualizar a preferência da interface.` for `pt-BR`; equivalent native translations are required for the other five locales.

- [ ] **Step 2: Write the failing control test**

Mock `next/navigation` with a `refresh` spy, render the control as classic, click the switch, and assert:

```ts
expect(document.cookie).toContain('plotwist-ui=cinematic')
expect(refresh).toHaveBeenCalledOnce()
```

Also rerender with `initialVersion="cinematic"` and assert the switch has `data-state="checked"`.

- [ ] **Step 3: Run the test and verify RED**

Run:

```bash
pnpm --filter web exec vitest run src/components/header/ui-version-control.test.tsx --config vitest.preview.config.ts
```

Expected: FAIL because `UiVersionControl` does not exist.

- [ ] **Step 4: Implement the control**

Implement a labelled row using `@plotwist/ui/components/ui/switch` and `Badge`. On change:

```ts
const nextVersion = checked ? 'cinematic' : 'classic'
document.cookie = serializeUiVersionCookie(nextVersion)
setVersion(nextVersion)
router.refresh()
```

Wrap the cookie assignment in `try/catch`; restore the previous state and show `errorLabel` with `role="alert"` on failure. The switch receives an explicit accessible label.

- [ ] **Step 5: Pass the server preference into both menus**

In `apps/web/src/app/[lang]/layout.tsx`, read:

```ts
const cookieStore = await cookies()
const uiVersion = parseUiVersion(cookieStore.get(UI_VERSION_COOKIE_NAME)?.value)
```

Pass `uiVersion` through:

```text
RootLayout
  → Header
    → HeaderAccount → HeaderNavigationDrawerConfigs
    → HeaderNavigationDrawer → HeaderNavigationDrawerConfigs
```

Render `UiVersionControl` below the current theme row under an Appearance label. Because the same configs component is used in desktop and mobile, one integration covers both surfaces.

- [ ] **Step 6: Run tests and typecheck**

Run:

```bash
pnpm --filter web exec vitest run src/lib/ui-version.test.ts src/components/header/ui-version-control.test.tsx --config vitest.preview.config.ts
pnpm --filter web run typecheck
```

Expected: all focused tests pass and TypeScript exits 0.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/header apps/web/src/app/[lang]/layout.tsx apps/web/public/dictionaries
git commit -m "feat(web): add experimental UI appearance control"
```

### Task 3: Shared movie presentation primitives

**Files:**
- Create: `apps/web/src/app/[lang]/movies/[id]/_components/movie-actions.tsx`
- Create: `apps/web/src/app/[lang]/movies/[id]/_components/movie-rating.tsx`
- Modify: `apps/web/src/app/[lang]/movies/[id]/_components/movie-infos.tsx`

**Interfaces:**
- Produces: `MovieActions({ movie, language, className? })`
- Produces: `MovieRating({ movie, className? })`
- Consumed later by: `CinematicMovieDetails`

- [ ] **Step 1: Write a focused rendering test**

Create `movie-actions.test.tsx` with lightweight mocks for the four existing interactive children. Assert that `MovieActions` passes movie ID `MOVIE` and the localized share path, and that `MovieRating` renders the formatted score.

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm --filter web exec vitest run 'src/app/[lang]/movies/[id]/_components/movie-actions.test.tsx' --config vitest.preview.config.ts
```

Expected: FAIL because the shared action and rating components do not exist.

- [ ] **Step 3: Extract existing behavior without changing the classic UI**

Move the current action cluster from `MovieInfos` into `MovieActions`:

```tsx
<ListsDropdown item={movie} />
<ItemReview />
<ItemStatus mediaType="MOVIE" tmdbId={movie.id} />
<SharePageButton language={language} path={`movies/${movie.id}`} />
```

Move the existing TMDB badge and tooltip into `MovieRating`. Keep the same variants, labels, values, and ordering. Replace the old inline blocks in `MovieInfos` with these components.

- [ ] **Step 4: Verify classic behavior**

Run the focused test, existing web tests, and typecheck. Expected: all pass; the classic markup retains the same controls and score.

- [ ] **Step 5: Commit**

```bash
git add 'apps/web/src/app/[lang]/movies/[id]/_components'
git commit -m "refactor(web): share movie detail actions"
```

### Task 4: Dual movie-detail renderers

**Files:**
- Create: `apps/web/src/app/[lang]/movies/[id]/_components/classic-movie-details.tsx`
- Create: `apps/web/src/app/[lang]/movies/[id]/_components/cinematic-movie-details.tsx`
- Create: `apps/web/src/app/[lang]/movies/[id]/_components/movie-details.test.tsx`
- Modify: `apps/web/src/app/[lang]/movies/[id]/_components/movie-details.tsx`

**Interfaces:**
- Consumes: `UiVersion`, `MovieActions`, and `MovieRating`
- Produces: `ClassicMovieDetails({ movie, language, backdropUrl, posterUrl })`
- Produces: `CinematicMovieDetails({ movie, language, backdropUrl, posterUrl })`
- Keeps: `MovieDetails({ id, language })` as the single data-owning server component

- [ ] **Step 1: Write failing renderer-selection tests**

Mock the TMDB details call, Next cookies, structured-data children, collection, and tabs. Assert:

```ts
expect(tmdb.movies.details).toHaveBeenCalledTimes(1)
expect(screen.getByTestId('classic-movie-details')).toBeTruthy()
```

for no cookie, and:

```ts
expect(screen.getByTestId('cinematic-movie-details')).toBeTruthy()
expect(tmdb.movies.details).toHaveBeenCalledTimes(1)
```

for `plotwist-ui=cinematic`.

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm --filter web exec vitest run 'src/app/[lang]/movies/[id]/_components/movie-details.test.tsx' --config vitest.preview.config.ts
```

Expected: FAIL because renderer selection and both renderer components do not exist.

- [ ] **Step 3: Extract the classic renderer**

Move the existing `Banner`, constrained section, `MovieInfos`, optional `MovieCollection`, and `MovieTabs` markup into `ClassicMovieDetails`. Add only `data-testid="classic-movie-details"`; do not change its classes or ordering.

- [ ] **Step 4: Keep data and SEO at the boundary**

In `MovieDetails`, keep exactly one `tmdb.movies.details(id, language)` call and one set of `BreadcrumbJsonLd`/`MovieJsonLd` nodes. Read the cookie with Next `cookies()`, validate it with `parseUiVersion`, and render the selected presentational component below the structured data.

- [ ] **Step 5: Build the cinematic renderer**

Use `Instrument_Sans` locally through `next/font/google`. Render:

- a full-bleed backdrop with dark gradient and existing poster fallback;
- overlapping poster using the existing `Poster`;
- release date, title, `MovieGenres`, `MovieRating`, and overview;
- `MovieActions` with wrapped touch-friendly spacing;
- the existing optional `MovieCollection`;
- the existing `MovieTabs`;
- `data-testid="cinematic-movie-details"`.

Scope Together-inspired colors to the cinematic root with CSS custom properties or Tailwind arbitrary colors. Do not change global theme tokens or the classic renderer.

- [ ] **Step 6: Verify both renderers**

Run:

```bash
pnpm --filter web exec vitest run 'src/app/[lang]/movies/[id]/_components/movie-details.test.tsx' --config vitest.preview.config.ts
pnpm --filter web run typecheck
pnpm exec biome check 'apps/web/src/app/[lang]/movies/[id]/_components'
```

Expected: renderer tests pass, one fetch per render, typecheck exits 0, and Biome reports no errors.

- [ ] **Step 7: Commit**

```bash
git add 'apps/web/src/app/[lang]/movies/[id]/_components'
git commit -m "feat(web): add cinematic movie detail renderer"
```

### Task 5: Final verification and PR handoff

**Files:**
- Modify only files required by failures found in this task.

**Interfaces:**
- Consumes all deliverables from Tasks 1–4.
- Produces a deployable preview with classic default and opt-in cinematic movie details.

- [ ] **Step 1: Run focused tests**

```bash
pnpm --filter web exec vitest run \
  src/lib/ui-version.test.ts \
  src/components/header/ui-version-control.test.tsx \
  'src/app/[lang]/movies/[id]/_components/movie-actions.test.tsx' \
  'src/app/[lang]/movies/[id]/_components/movie-details.test.tsx' \
  'src/app/[lang]/together/design-preview/page.test.tsx' \
  --config vitest.preview.config.ts
```

Expected: all files and tests pass.

- [ ] **Step 2: Run static verification**

```bash
pnpm --filter web run typecheck
pnpm exec biome check apps/web/src apps/web/public/dictionaries
pnpm --filter web run build
```

Expected: each command exits 0. Restore the tracked `apps/web/tsconfig.tsbuildinfo` if typecheck changes only generated metadata.

- [ ] **Step 3: Manually verify the preview**

At desktop and mobile widths:

1. Open a movie detail with classic as default.
2. Open the account/mobile menu and enable **New interface**.
3. Confirm the same route refreshes into the cinematic renderer.
4. Confirm list, review, status, share, collection, and all tabs remain usable.
5. Reload and confirm the preference persists.
6. Disable the preference and confirm the classic renderer returns.
7. Switch light/dark/system and confirm it does not change `uiVersion`.

- [ ] **Step 4: Commit any verification fixes**

If verification required code changes, stage only those files and create a descriptive commit. Do not amend earlier commits.

- [ ] **Step 5: Push and update the existing PR**

```bash
git push -u origin cursor/together-ui-preview-08b6
```

Update PR #517 to describe the implemented preference control, dual renderer, tests, and preview instructions.
