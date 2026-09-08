# Together Flow Improvements — Design

## Goal

Make Together produce more relevant choices, work naturally when shared across languages, celebrate matches without ending discovery, explain the benefit of signing in, and safely support larger groups without advertising a room-size limit.

## Product Decisions

- The room host selects streaming providers before entering their name.
- The selected providers and region apply to every participant in the room.
- Provider selection is optional through an explicit “Any service” choice so provider API failure never blocks room creation.
- Signed-in hosts start with their saved region and providers; guests retain the existing `BR` region default.
- Shared links contain no locale. The existing proxy detects the recipient browser language and redirects into the localized route.
- A room has an invisible technical limit of 20 participants.
- Voting can begin with two participants; additional people can join until the technical limit is reached.
- A title becomes a match when at least two distinct participants choose `LIKE` or `MAYBE`.
- Match percentage continues to use the current participant count.
- Match celebration is non-blocking and offers “Continue discovering” and “View matches”.
- Guests see a non-blocking sign-in prompt explaining that saved preferences improve recommendations. They can continue without an account.

## Host Setup

The current create form becomes a two-step flow:

1. **Where do you watch?**
   - Region selector.
   - Movie watch-provider list with logos.
   - Multi-select providers or explicit “Any service”.
   - Saved user preferences prefill the step when available.
2. **Create your invite**
   - Existing display-name field.
   - Existing room creation action.

Room creation sends `watchProviderIds` and `watchRegion`, which the backend already stores. The vote deck reads these values from room state and adds `with_watch_providers` and `watch_region` to TMDB discovery. An empty provider list omits the provider filter.

## Language-Neutral Sharing

Invite links use:

```text
https://plotwist.app/together/{ROOM_CODE}
```

They do not include the host locale. On first request, the existing proxy selects a supported locale from `Accept-Language` and redirects to:

```text
/{detected-locale}/together/{ROOM_CODE}
```

The room code and participant token remain independent of locale, so changing locale does not create a new room or participant.

## Match Notification

The swipe endpoint already returns a match to the participant whose decision completes it. The vote screen also polls the authenticated room matches endpoint so other participants learn about matches created by someone else.

The client stores acknowledged match keys for the room in session storage. A match not yet acknowledged opens a celebration overlay containing:

- poster and title;
- number or percentage of interested participants;
- “Continue discovering”, which closes the overlay and keeps the current deck;
- “View matches”, which navigates to the matches screen.

Direct swipe results update the same match query/cache used by polling. This avoids two separate notification paths and duplicate celebrations. Previously acknowledged matches are not reopened during the browser session.

## Guest Sign-In Prompt

Guests see a compact prompt in the initial Together setup:

- message: signing in lets Plotwist use saved streaming services and preferences for better recommendations;
- primary action: sign in and return to Together;
- secondary action: continue as guest.

The prompt does not block provider selection, joining an invite, or voting. The sign-in URL carries a localized redirect back to `/{lang}/together`.

Authenticated users do not see the prompt. Their saved watch-provider IDs and region prefill host setup but remain editable for this room.

## Invisible Room Capacity

The backend defines one shared `MAX_TOGETHER_PARTICIPANTS = 20` constant. Joining is rejected once 20 distinct participants exist; rejoining with an existing valid participant token remains allowed even when full. The atomic room lock remains responsible for preventing concurrent joins from exceeding this limit.

The room response may retain `maxParticipants` as an internal signal so the client can detect a full room, but no UI copy or component output advertises that value. Invite, join, and waiting screens may show only the current participant count through localized, group-neutral copy.

The waiting room renders one card per current participant and at most one generic empty/waiting card while the room is not full. It never renders one placeholder per remaining technical slot.

The host can start voting once at least two people are present. The room remains joinable until capacity is reached.

## Error Handling

- Provider-list failure shows a retry action and allows “Any service”.
- Room creation retains the selected setup values after an API failure.
- A twenty-first new participant receives a localized “Room is full” state that does not name the limit; valid rejoin tokens continue to work.
- Invalid locale-less invite paths continue through existing not-found behavior after localization.
- Match polling failure is silent while direct voting continues; the existing matches screen remains available.
- Match overlay media uses the existing poster fallback.

## Accessibility

- Provider selection uses labelled controls, visible selected state, keyboard operation, and provider names in addition to logos.
- Step changes move focus to the new heading.
- Guest prompt actions are links/buttons with explicit text.
- Match celebration is a labelled dialog, traps focus, supports Escape, and restores focus when dismissed.
- Status is never conveyed by color alone.

## Testing

Backend coverage:

- host-selected providers and region persist;
- first 20 distinct participants, including the host, can join;
- participant 21 is rejected;
- valid token can rejoin a full room;
- two concurrent joins competing for the twentieth place produce one success and one full-room error;
- match threshold remains two interested participants in larger rooms;
- percentage uses the current group size.

Web coverage:

- host setup starts with providers and advances to name;
- authenticated preferences prefill but remain editable;
- guest prompt appears only when signed out;
- room creation sends provider IDs and region;
- deck applies room provider filters and omits them for “Any service”;
- invite URL has no locale;
- locale-less invite is redirected from browser language;
- direct and polled matches share one celebration path;
- continuing dismisses without navigating;
- acknowledged matches are not repeated;
- invite, join, and waiting screens show current-only participant copy in all seven locales;
- no Together UI renders “up to four”, `current / max`, or the technical limit;
- a non-full waiting room renders at most one waiting card, while a full room renders none;
- full-room state remains localized and does not name the technical limit.

All new user-facing copy is added to the seven supported web dictionaries.
