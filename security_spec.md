# Kréyòl Matinik — Firestore Security Specification (Phase 0)

## 1. Data Invariants
1. A `users/{userId}` document can only be read (`get`/`list`) or written by `request.auth.uid == userId` or a verified admin (`isAdmin()`).
2. No non-admin user can self-assign `role: "admin"` during creation or elevate their `role` on update.
3. Timestamps (`createdAt`, `updatedAt`) MUST equal `request.time` on creation, `createdAt` is immutable on update, and `updatedAt` MUST equal `request.time` on update.
4. `lessons/{lessonId}` and `dictionary/{entryId}` are publicly readable for education, and writable ONLY by verified admins (`isAdmin()`).
5. `koudmen/{postId}` creation requires `isVerifiedUser()` and `incoming().authorId == request.auth.uid`. Updates are segmented into actions (`upvote` vs `authorEdit` vs `admin`).
6. All document IDs (`userId`, `lessonId`, `entryId`, `postId`) must match `^[a-zA-Z0-9_-]+$` and `size() <= 128`. Every string field enforces strict `.size()` bounds.

## 2. The "Dirty Dozen" Adversarial Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated User Write**: Unauthenticated write to `/users/uid123`.
2. **Role Self-Escalation on Create**: Authenticated user creates `/users/uid123` with `{ role: "admin" }`.
3. **Role Self-Escalation on Update**: Authenticated owner updates `/users/uid123` to `{ role: "admin" }`.
4. **Shadow Ghost Field**: Owner sends `/users/uid123` with extra unknown field `{ isVerifiedVip: true }`.
5. **Cross-User PII Read**: Non-admin user attempts `get` or `list` on `/users/otherUid`.
6. **Spoofed Admin Email (Unverified)**: User with `email: "banheruka@gmail.com"` and `email_verified: false` tries to write `/lessons/l1`.
7. **Non-Admin Lesson Creation**: Standard learner attempts to create `/lessons/l1`.
8. **Non-Admin Dictionary Mutation**: Standard learner attempts to update `/dictionary/d1`.
9. **Spoofed Author on Koudmen Post**: User A creates `/koudmen/p1` with `authorId: "userB"`.
10. **Client-Forged Timestamp**: Create payload passes `createdAt` in the past instead of `request.time`.
11. **Oversized String Poisoning (DoW)**: Payload injects a >2KB title or >128 char document ID.
12. **Unbounded Array Injection**: `/users/uid123` update attempts `reviewedCards` list with >200 elements or non-string first element.
