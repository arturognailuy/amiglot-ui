---
description: "Design document for the Discovery & Matching UI vertical slice (Dashboard, Match Cards, empty state, i18n)."
whenToUse: "Read when implementing the discovery dashboard, match card components, or related i18n strings."
---

# Discovery & Matching — Frontend Design

> Parent docs: `000-architecture-guidelines.md` (coding standards), `003-technical-specification.md` (API contract).
> Backend design: `amiglot-api/designs/004-discovery-matching-design.md`.

## 1. Overview

This document designs the **Discovery Dashboard** — the main entry point where authenticated users browse potential language exchange partners. It fetches paginated results from `GET /api/v1/matches/discover` and displays them as Match Cards.

## 2. Route & Page Structure

### 2.1 Route

```
/[locale]/dashboard
```

This is a protected route (requires authentication). Unauthenticated users are redirected to `/[locale]/login`.

### 2.2 Component Hierarchy

Following `000-architecture-guidelines.md` §3 (Component Structure):

```
src/app/[locale]/dashboard/
├── page.tsx                    # Server Component: auth check, initial data fetch
├── dashboard-content.tsx       # Client Component: interactive container
├── components/
│   ├── match-card.tsx          # Individual match card display
│   ├── match-card-skeleton.tsx # Loading skeleton for cards
│   └── empty-state.tsx         # Empty state when no matches found
```

### 2.3 page.tsx (Server Component)

```typescript
// Role: Auth boundary + initial data fetch
// - Verify auth session; redirect to login if missing
// - Check if user profile is complete (has target languages)
// - Fetch first page from GET /api/v1/matches/discover
// - Pass initialData to DashboardContent
```

### 2.4 dashboard-content.tsx (Client Component)

```typescript
"use client"
// Role: Interactive container
// - Receives initialData (first page of matches)
// - Manages pagination state (cursor, loading more)
// - Implements infinite scroll or "Load More" button
// - Handles error states (profile incomplete, no targets)
// - Renders MatchCard list or EmptyState
```

## 3. Match Card Design

### 3.1 Information Displayed

Each Match Card shows:

| Field | Source | Display |
|-------|--------|---------|
| Handle | `handle` | `@maria` (with `@` prefix) |
| Country | `country_code` | Flag emoji + country name (via `Intl.DisplayNames`) |
| Age | `birth_year`/`birth_month` | Derived, e.g., "24" |
| Mutual languages (they teach you) | `mutual_teach[]` | Language name + level badge |
| Mutual languages (you teach them) | `mutual_learn[]` | Language name + level badge |
| Bridge languages | `bridge_languages[]` | Language name + level indicator |
| Availability overlap | `availability_overlap[]` | Weekday + time range (converted to user's local TZ) |
| Total overlap | `total_overlap_minutes` | e.g., "2h overlap" |

### 3.2 Card Layout

```
┌──────────────────────────────────────┐
│  🇲🇽  @maria  · 24 · Mexico          │
│                                      │
│  🎓 They teach you:                  │
│     Spanish (Native)                 │
│                                      │
│  📚 You teach them:                  │
│     English (Advanced)               │
│                                      │
│  🌉 Bridge: English                  │
│                                      │
│  🕐 2h overlap                       │
│     Mon 18:00–20:00 (your time)      │
│                                      │
│  [ View Profile ]  [ Send Request ]  │
└──────────────────────────────────────┘
```

### 3.3 Interactions

- **View Profile** → navigates to `/[locale]/profile/[handle]` (public profile view, future scope — for now can be a modal or expandable card).
- **Send Request** → triggers `POST /match-requests` flow (future implementation in the Match Request slice).

For this slice, both buttons should be rendered but the **Send Request** button can be a placeholder (disabled or navigates to match request flow when implemented).

## 4. Empty State

When `items` is empty, display a localized empty state:

```
┌──────────────────────────────────────┐
│                                      │
│         🔍                           │
│                                      │
│   No matches found yet              │
│                                      │
│   Try updating your profile with     │
│   more languages or adjusting your   │
│   availability to find partners.     │
│                                      │
│   [ Edit Profile ]                   │
│                                      │
└──────────────────────────────────────┘
```

## 5. Error States

| Condition | UI Behavior |
|-----------|-------------|
| Profile incomplete (403 `ERR_PROFILE_INCOMPLETE`) | Redirect to profile page with a toast: "Complete your profile to discover partners" |
| No target languages (422 `ERR_NO_TARGET_LANGUAGES`) | Show inline message: "Add languages you want to learn to find matches" with link to profile |
| Network error | Show retry button with localized error message |
| Loading | Show skeleton cards (3–4 placeholder cards) |

## 6. Pagination

- **Strategy**: "Load More" button at the bottom (simpler than infinite scroll for V1).
- Pass `next_cursor` from the previous response to fetch the next page.
- Append new results to the existing list.
- Hide the "Load More" button when `next_cursor` is `null`.

## 7. Availability Time Display

The API returns overlap times in UTC. The UI must convert these to the **user's local timezone** (from their profile) for display:

```typescript
// Convert UTC time string to user's local time
function formatOverlapTime(utcTime: string, weekday: number, userTimezone: string): string {
  // Use Intl.DateTimeFormat with timeZone option
  // Display as "Mon 18:00–20:00"
}
```

## 8. i18n Strings

All new strings must be added to locale files. Required keys:

```json
{
  "dashboard": {
    "title": "Discover Partners",
    "loading": "Finding matches...",
    "loadMore": "Load more",
    "noMoreResults": "No more results",
    "empty": {
      "title": "No matches found yet",
      "description": "Try updating your profile with more languages or adjusting your availability to find partners.",
      "editProfile": "Edit Profile"
    },
    "errors": {
      "profileIncomplete": "Complete your profile to discover partners.",
      "noTargetLanguages": "Add languages you want to learn to find matches.",
      "networkError": "Something went wrong. Please try again."
    },
    "card": {
      "theyTeachYou": "They teach you",
      "youTeachThem": "You teach them",
      "bridgeLanguage": "Bridge",
      "overlapTime": "{minutes}min overlap",
      "overlapHours": "{hours}h overlap",
      "viewProfile": "View Profile",
      "sendRequest": "Send Request",
      "yourTime": "your time"
    }
  }
}
```

These keys must be present in **all supported locale files** (en, and any others currently supported).

## 9. API Error i18n (Backend)

The following error codes need localized messages in the API locale files:

| Code | English Message |
|------|----------------|
| `ERR_PROFILE_INCOMPLETE` | "Please complete your profile before searching for partners." |
| `ERR_NO_TARGET_LANGUAGES` | "Please add at least one language you want to learn." |

## 10. Implementation Checklist

- [ ] Route: `src/app/[locale]/dashboard/page.tsx`
- [ ] Client component: `src/app/[locale]/dashboard/dashboard-content.tsx`
- [ ] Match card: `src/app/[locale]/dashboard/components/match-card.tsx`
- [ ] Skeleton: `src/app/[locale]/dashboard/components/match-card-skeleton.tsx`
- [ ] Empty state: `src/app/[locale]/dashboard/components/empty-state.tsx`
- [ ] i18n: Add `dashboard.*` keys to all locale files
- [ ] Navigation: Add "Discover" link to main navigation/sidebar
- [ ] Tests: Unit tests for match card rendering, empty state, error states
