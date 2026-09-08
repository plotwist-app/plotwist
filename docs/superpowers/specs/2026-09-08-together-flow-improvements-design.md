# Together Flow Improvements — Design

## Goal

Make Together produce more relevant choices, work naturally when shared across languages, celebrate matches without ending discovery, explain the benefit of signing in, and support groups of up to four people.

## Product Decisions

- The room host selects streaming providers before entering their name.
- The selected providers and region apply to every participant in the room.
- Provider selection is optional through an explicit “Any service” choice so provider API failure never blocks room creation.
- Signed-in hosts start with their saved region and providers; guests retain the existing `BR` region default.
- Shared links contain no locale. The existing proxy detects the recipient browser language and redirects into the localized route.
- A room supports at most four participants.
- Voting can begin with two participants; additional people can join until the room reaches four.
- A title becomes a match when at least two distinct participants choose `LIKE` or `MAYBE`.
- Match percentage continues to use the total participant count, e.g. two interested people in a four-person room is 50%.
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

## Four-Person Rooms

The backend defines one shared `MAX_TOGETHER_PARTICIPANTS = 4` constant. Joining is rejected once four distinct participants exist; rejoining with an existing valid participant token remains allowed even when full.

The room response exposes capacity information so the join screen and waiting room can show `current / 4`. The invitation ticket and copy no longer promise admission for exactly two.

The host can start voting once at least two people are present. The room remains joinable until capacity is reached.

## Error Handling

- Provider-list failure shows a retry action and allows “Any service”.
- Room creation retains the selected setup values after an API failure.
- A fifth new participant receives a localized “Room is full” state; valid rejoin tokens continue to work.
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
- first four distinct participants can join;
- fifth distinct participant is rejected;
- valid token can rejoin a full room;
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
- four-person waiting/capacity copy and full-room state are localized.

All new user-facing copy is added to the seven supported web dictionaries.
