# Security Spec

## 1. Data Invariants
- An SOS Alert (`/alerts/{alertId}`) must contain a valid `userId` (matching the creator).
- Type must be "Medical" or "Security".
- Status must be "Active" or "Resolved".
- Once "Resolved", the terminal state is locked to the attendee (only staff can perhaps update, but since we don't have a staff mechanism in the db yet, we'll allow attendees to create and cancel/resolve their own alerts).

## 2. The "Dirty Dozen" Payloads
1.  **Identity Spoofing**: `{"userId": "another-person"}` -> REJECTED
2.  **State Shortcutting**: `{"status": "Invalid"}` -> REJECTED
3.  **Type Poisoning**: `{"type": "Hacking"}` -> REJECTED
4.  **Resource Exhaustion**: `{"stand": "A".padEnd(5000, "A")}` -> REJECTED
5.  **Schema Violation (Missing required)**: `{"type": "Medical"}` -> REJECTED
6.  **Unverified Email**: User auth without `email_verified == true`. -> REJECTED
7.  **Terminal State Update**: `{"status": "Active"}` on an already `"Resolved"` document. -> REJECTED
8.  **Orphaned Alert**: Creating an alert without `createdAt`. -> REJECTED
9.  **Date Poisoning**: `{"createdAt": "yesterday"}` instead of `request.time`. -> REJECTED
10. **Ghost Field**: `{"isAdmin": true, "type": "Medical"}` -> REJECTED
11. **Non-Owner Access**: User `A` tries to read User `B`'s `/alerts/123`. -> REJECTED
12. **Blanket List Attack**: Client tries to `list` without `where("userId", "==", auth.uid)`. -> REJECTED

## 3. The Test Runner
Tests will be in `firestore.rules.test.ts`.
