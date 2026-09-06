# Cinematic Movie Details — Design

## Objective

Introduce the Together-inspired cinematic design system gradually without replacing the existing Plotwist web interface all at once. The first migrated surface is the movie detail page.

Every visitor can opt into the experimental interface from **Settings → Appearance → New interface**. The classic interface remains the default and can be restored at any time.

## Scope

This first release includes:

- a global `classic | cinematic` UI preference;
- a public experimental toggle in the existing desktop account menu and mobile navigation drawer;
- cookie-based persistence for authenticated and guest visitors;
- an alternative cinematic renderer for movie details;
- the existing movie data, actions, SEO output, and subordinate content;
- localized labels for every supported language;
- a temporary design-preview route while the experiment is under review.

It does not migrate home, TV details, profiles, lists, catalog pages, onboarding, or iOS. It does not change the existing light/dark/system theme preference.

## Architecture

UI version and color theme are independent preferences:

```text
theme: light | dark | system
uiVersion: classic | cinematic
```

The non-sensitive `uiVersion` preference is persisted in a first-party cookie with `Path=/`, `SameSite=Lax`, and a one-year lifetime. Its accepted values are validated centrally; missing or invalid values resolve to `classic`.

The movie route loads data once. After data loading, a server-side boundary reads the cookie and selects one of two presentational renderers:

```text
Movie page
  ├── load movie data once
  ├── emit shared structured data once
  ├── read validated uiVersion cookie
  ├── classic   → existing MovieDetails presentation
  └── cinematic → CinematicMovieDetails presentation
```

The renderers receive the same movie object and language. They do not fetch duplicate movie data or own SEO metadata. Existing interactive actions remain shared components wherever their current styling can be safely adapted.

## Preference Control

The existing `HeaderNavigationDrawerConfigs` component is shared by the desktop account dropdown and mobile drawer. It gains an Appearance row containing:

- a localized “New interface” label;
- a localized “Experimental” badge;
- an accessible switch;
- classic as the initial default.

Changing the switch updates the cookie and refreshes the current route so server components render the selected version immediately. The control is available to guests and authenticated users. No account database field is introduced in this phase.

An optional `?ui=classic|cinematic` override may be retained for shared QA links, but users never need to edit the URL. When present and valid, it updates the cookie and redirects to the clean URL.

## Cinematic Movie Detail UI

The cinematic renderer uses Together's visual DNA without copying its narrow voting layout:

- Instrument Sans typography;
- near-black immersive surfaces;
- warm off-white foregrounds;
- coral as the primary accent;
- rounded, tactile controls;
- restrained gradients and motion;
- clear typography with compact metadata.

### Desktop

1. A full-width backdrop hero uses a dark readability gradient.
2. The poster overlaps the lower hero boundary.
3. Title, release date, genres, TMDB rating, and overview form one clear information block.
4. Add to list, review, status, and share remain grouped as the primary action cluster.
5. Collection and tabs continue below in a constrained reading container.

### Mobile

1. The backdrop remains compact enough to keep the title visible near the fold.
2. The poster partially overlaps the backdrop.
3. Title and metadata wrap without horizontal scrolling.
4. All actions are touch targets and require no hover interaction.
5. Overview, genres, rating, collection, and tabs retain their existing order and functionality.

The classic renderer must remain visually and behaviorally unchanged.

## Components and Boundaries

- `ui-version`: validates and exposes the cookie value on the server.
- `UiVersionControl`: owns the client-side switch interaction and refresh.
- `MovieDetails`: remains the data-owning server component.
- `ClassicMovieDetails`: contains the current presentation.
- `CinematicMovieDetails`: contains the new presentation.
- Existing movie actions, structured data, collection, and tabs remain shared.

The new renderer may add cinematic-specific presentation components, but must not fork data fetching or business behavior.

## Data and Interaction Flow

```text
Visitor toggles New interface
  → browser persists uiVersion cookie
  → router refreshes
  → server validates cookie
  → movie data is loaded through the existing TMDB service
  → selected renderer receives the same data
```

Switching back follows the same flow and does not affect account data, lists, reviews, ratings, or the color-theme preference.

## Error Handling

- Invalid cookie values fall back to `classic`.
- Cookie write failure leaves the current interface active and announces a localized error.
- Movie-fetch and not-found behavior continues through the existing route handling.
- Missing backdrop or poster images use the existing fallback behavior.
- A renderer must not swallow errors from shared interactive actions.

## Accessibility

- The preference uses a labelled switch with its state announced to assistive technology.
- Coral foreground/background pairs must meet WCAG AA contrast.
- Focus indicators remain visible against cinematic surfaces.
- Action meaning cannot depend only on color or icons.
- Motion respects `prefers-reduced-motion`.
- Heading order and structured data stay equivalent between renderers.

## Testing

Automated coverage includes:

- UI-version validation for valid, missing, and invalid cookie values;
- preference control state, cookie update, and route refresh;
- classic renderer selection by default;
- cinematic renderer selection from the cookie;
- movie data fetched only once;
- cinematic renderer's title, overview, rating, genres, and actions;
- missing-image fallbacks;
- localized toggle labels;
- focused accessibility assertions where supported.

Verification includes web unit tests, TypeScript type checking, Biome checks, and a production build. The preview is manually checked at mobile and desktop widths in both UI versions.

## Rollout

1. Ship the public experimental preference with classic as default.
2. Enable cinematic movie details behind the preference.
3. Collect qualitative feedback and compare behavior without removing classic.
4. Fix issues in the shared cinematic foundations.
5. Migrate later surfaces through separate designs and implementation plans.

Removing the classic renderer or making cinematic the default requires a separate decision after validation.
