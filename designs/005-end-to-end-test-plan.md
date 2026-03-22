---
description: "End-to-end test plan for Amiglot UI."
whenToUse: "Read when running or updating UI E2E scenarios."
---

# Amiglot UI — End-to-End Test Plan

## 1. Scope
End-to-end coverage for the current UI feature set: authentication, session handling, and profile setup (profile details, languages, availability).

**Priority focus:** Run the user-path tests (happy path + validation/user error) with all services up. Scenarios that require stopping the API are **optional** for now.

## 2. Test Environment
- UI: Next.js dev server (`npm run dev -- --hostname 127.0.0.1 --port 3000`).
- API: local dev container on port 6176.
- DB: local Postgres (dev).
- Base URL: read from `NEXT_PUBLIC_APP_URL` (example: `https://test.gnailuy.com`).
- Localization: UI sets `Accept-Language` for API requests.

## 3. Test Data & Accounts
- Each test case uses a **fresh account** (new email + handle).
- Email format: `test+<timestamp>@gnailuy.com`.
- Handle format: `tester<timestamp>`.
- Primary languages for the plan: **Chinese** (native) + **Portuguese** (target).
- Default timezone for checks: `America/Vancouver` unless specified.

## 4. Authentication & Session Test Cases

### A1. Sign in (fresh account)
**Setup:** New email + handle.
**Steps:**
1. Open Home on `NEXT_PUBLIC_APP_URL`.
2. Click Login and submit the fresh email.
3. Confirm success banner appears.
4. In dev mode, open the `dev_login_url` shown on the page.
5. Verify success message on the Verify page.
6. Return to Home.
**Expected:** User is signed in and Home shows the authenticated state.

### A2. Session persistence
**Setup:** Use a fresh account and complete A1.
**Steps:**
1. Refresh the browser.
2. Navigate away and return to Home.
**Expected:** Session remains signed in; no re-login required.

### A3. Sign out
**Setup:** Use a fresh account and complete A1.
**Steps:**
1. Click Sign out on Home.
2. Return to Home.
**Expected:** Session cleared; Home shows signed-out state.

### A4. Invalid/expired magic link
**Setup:** Use a fresh account.
**Steps:**
1. Open Verify with an invalid token (e.g., modify the token query param).
**Expected:** Error state shown with localized message; no session stored.

## 5. Profile Load & Save Test Cases

### P1. Initial profile load
**Setup:** Fresh account; complete A1.
**Steps:**
1. Open Profile page.
2. Wait for initial load.
**Expected:** Loading state resolves; email + handle fields populated (handle may be empty), timezone shown, discoverable toggle visible.

### P2. Handle availability
**Setup:** Fresh account; complete A1.
**Steps:**
1. Enter a new handle `tester<timestamp>`.
2. Pause until availability check completes.
**Expected:** Availability indicator shows available.

### P2b. Dropdown focus on open
**Setup:** Fresh account; complete A1.
**Steps:**
1. Set a country, language, birth month/year, and timezone.
2. Re-open each dropdown.
**Expected:** The currently selected option is focused and scrolled near the middle of the list.

### P3. Validation on save
**Setup:** Fresh account; complete A1.
**Steps:**
1. Clear timezone and attempt Save.
2. Remove all languages and attempt Save.
**Expected:** Save disabled or validation errors displayed; no API save.

### P4. Successful save (details + languages + availability)
**Setup:** Fresh account; complete A1.
**Steps:**
1. Fill profile details and set timezone.
2. Add Chinese (native) + Portuguese (target) languages.
3. Add availability slot (weekday + time range).
4. Click Save.
**Expected:** Success banner; profile, languages, and availability saved.

### P5. Save error handling
**Setup:** Fresh account; complete A1.
**Steps:**
1. Simulate API failure during save (e.g., stop API or mock 500).
2. Attempt Save.
**Expected:** Error banner shown; inputs preserved.

## 6. Languages Tab Test Cases

### L1. Add/update languages
**Setup:** Fresh account; complete A1.
**Steps:**
1. Add Chinese (native) + Portuguese (target).
2. Update Portuguese to a different proficiency.
**Expected:** Languages list updates and remains valid.

### L2. Remove language edge cases
**Setup:** Fresh account; complete A1.
**Steps:**
1. Remove Portuguese.
2. Attempt to remove the last remaining native language.
**Expected:** Validation prevents zero languages and requires at least one native language.

### L3. Language validation errors
**Setup:** Fresh account; complete A1.
**Steps:**
1. Add duplicate language codes.
2. Leave language code empty.
**Expected:** Errors shown for duplicates and missing code.

### L4. Language ordering persistence
**Setup:** Fresh account; complete A1.
**Steps:**
1. Add three languages.
2. Drag to reorder (move the last to the top).
3. Save profile and refresh the page.
**Expected:** Language order matches the dragged order after reload.

## 7. Availability Tab Test Cases

### V1. Add/edit slot
**Setup:** Fresh account; complete A1.
**Steps:**
1. Add slot with multiple weekdays.
2. Toggle one weekday off again to ensure it can be deselected.
3. Update time range to valid start < end.
**Expected:** Weekday toggles update reliably; slot saved locally and remains valid.

### V2. Grouped weekdays display
**Setup:** Fresh account; complete A1.
**Steps:**
1. Create a slot that includes multiple weekdays (e.g., Mon/Wed/Fri with the same time range).
2. Save and revisit the Availability tab.
**Expected:** The weekdays that share the same time range are displayed together in a single block (not split into multiple blocks).

### V3. Invalid time ranges
**Setup:** Fresh account; complete A1.
**Steps:**
1. Set start time after end time.
**Expected:** Validation error shown; save blocked.

### V4. Remove slot edge case
**Setup:** Fresh account; complete A1.
**Steps:**
1. Remove the only slot.
**Expected:** Validation prevents empty availability.

### V5. Availability ordering persistence (grouped slots)
**Setup:** Fresh account; complete A1.
**Steps:**
1. Create two grouped slots (each with multiple weekdays).
2. Drag to reorder the grouped slots.
3. Save profile and refresh the page.
**Expected:** Grouped slots appear in the dragged order; weekdays sharing the same time range remain grouped together.

## 8. Internationalization (i18n) Test Cases

### I1. Chinese locale
**Setup:** Fresh account; complete A1.
**Steps:**
1. Switch locale to Chinese (e.g., `zh` or `zh-Hans`).
2. Navigate to Login + Profile.
**Expected:** Labels and messages are localized.

### I2. Portuguese locale
**Setup:** Fresh account; complete A1.
**Steps:**
1. Switch locale to Portuguese (e.g., `pt` or `pt-BR`).
2. Trigger a validation error on Profile.
**Expected:** Error message is localized in Portuguese.

## 9. Error & Edge States

### E1. Profile load failure
**Setup:** Fresh account; complete A1.
**Steps:**
1. Simulate API error (500) on profile load.
**Expected:** Error banner shown; user stays on Profile.

### E2. API offline (optional)
**Setup:** Fresh account; complete A1.
**Steps:**
1. Stop the API server.
2. Attempt to Save.
3. Restart the API server after the test.
**Expected:** Error banner shown; inputs preserved.

## 10. Discovery & Matching (Dashboard) Test Cases

### D1. Dashboard loads with matches
**Setup:** Two accounts — User A (teaches English native, targets Chinese, has availability) and User B (teaches Chinese native, targets English, overlapping availability). Both profiles complete and discoverable.
**Steps:**
1. Sign in as User A.
2. Navigate to Dashboard (`/dashboard`).
3. Wait for loading skeletons to resolve.
**Expected:** At least one match card appears showing User B's handle, country, mutual languages (they teach you / you teach them), bridge language, and availability overlap converted to User A's local timezone.

### D2. Dashboard empty state
**Setup:** User A with a target language that no other user teaches.
**Steps:**
1. Sign in as User A.
2. Navigate to Dashboard.
**Expected:** Empty state is displayed with localized "No matches found yet" message and an "Edit Profile" link.

### D3. Dashboard — profile incomplete redirect
**Setup:** Fresh account with no profile saved.
**Steps:**
1. Sign in and navigate to Dashboard.
**Expected:** Redirected to Profile page (or login) with a toast/message: "Complete your profile to discover partners."

### D4. Dashboard — no target languages
**Setup:** User with profile saved but only native languages (no targets).
**Steps:**
1. Sign in and navigate to Dashboard.
**Expected:** Inline message: "Add languages you want to learn to find matches" with a link to Profile.

### D5. Match card displays all mutual languages
**Setup:** User A targets `zh` and `pt`; User B speaks `zh-Hans` (native) and `pt-BR` (level 5), targets English. Both have bridge + overlap.
**Steps:**
1. Sign in as User A and navigate to Dashboard.
**Expected:** User B's card shows both `zh-Hans` and `pt-BR` under "They teach you" section.

### D6. Base-language matching in UI
**Setup:** User A targets `zh`; User B speaks `zh-Hans` (native). Both have bridge + overlap.
**Steps:**
1. Sign in as User A and navigate to Dashboard.
**Expected:** User B appears as a match; no MISSING_MESSAGE errors in console.

### D7. Availability overlap displayed in local time
**Setup:** User A (timezone `America/Vancouver`) and User B overlap on Mon 18:00–20:00 UTC.
**Steps:**
1. Sign in as User A and navigate to Dashboard.
**Expected:** Overlap displayed as "Mon 10:00–12:00" (or equivalent PST/PDT conversion) with "(your time)" label.

### D8. Load More pagination
**Setup:** Enough matching users for User A to span multiple pages (or use a small page size).
**Steps:**
1. Sign in as User A and navigate to Dashboard.
2. Scroll to bottom and click "Load More".
**Expected:** Additional match cards appended; no duplicates. "Load More" hidden when no more results.

### D9. Dashboard i18n — Portuguese locale
**Steps:**
1. Switch locale to `pt-BR`.
2. Navigate to Dashboard.
**Expected:** All labels ("Discover Partners", "They teach you", "your time", etc.) are in Portuguese. No MISSING_MESSAGE errors.

### D10. Dashboard i18n — Chinese locale
**Steps:**
1. Switch locale to `zh` or `zh-Hans`.
2. Navigate to Dashboard.
**Expected:** All labels are in Chinese. No MISSING_MESSAGE errors.

### D11. Dashboard network error
**Setup:** Simulate API failure (e.g., stop API or mock 500).
**Steps:**
1. Navigate to Dashboard.
**Expected:** Error message with retry button; localized error text.

## 11. Regression Checklist
- No console errors on Home, Login, Verify, Profile.
- Forms remain responsive during normal use.
- Navigation between tabs does not reset inputs unexpectedly.
