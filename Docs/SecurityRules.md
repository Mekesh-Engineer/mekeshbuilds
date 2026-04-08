# Firestore Security Rules

## Overview

MekeshBuilds enforces all data authorization at the **Firestore Security Rules layer** — eliminating the need for a separate backend security server. Rules operate on the principle of **least privilege**: everything is denied by default, and access is explicitly granted per collection.

The rules are deployed to Firebase via:

```bash
npm run deploy:rules
# which runs: firebase deploy --only firestore:rules,database:rules
```

---

## Rule Principles

| Principle | Description |
|-----------|-------------|
| **Public Read, Owner Write** | Public portfolio collections allow anyone to read published content, but only the authenticated owner can write. |
| **Admin-Only Collections** | Analytics, error logs, and AI preferences are locked behind ownership or custom claims. |
| **Schema Validation** | Critical fields are type-checked at the rule level to prevent malformed data being written. |
| **Zero Trust Default** | All access is denied unless an explicit `allow` statement grants it. |

---

## Owner Identity Check

The owner is validated via a layered hierarchy. In security rules, the simplest approach is comparing the authenticated UID against the document's `ownerId` field:

```
function isOwner(resource) {
  return request.auth != null
    && request.auth.uid == resource.data.ownerId;
}

function isAuthenticated() {
  return request.auth != null;
}

function hasAdminClaim() {
  return request.auth != null
    && (request.auth.token.admin == true || request.auth.token.owner == true);
}
```

---

## Collection-Level Rules

### `profiles` — Public Read, Owner Write

```
match /profiles/{userId} {
  // Anyone can read published profiles (for public /:username route)
  allow read: if resource.data.isPublished == true;

  // Owner can read their own unpublished profile
  allow read: if isAuthenticated() && request.auth.uid == userId;

  // Only owner can create/update their own profile
  allow create, update: if isAuthenticated()
    && request.auth.uid == userId
    && request.resource.data.ownerId == userId;

  // Owner can delete their profile
  allow delete: if isAuthenticated() && request.auth.uid == userId;
}
```

---

### `experience`, `skills`, `projects`, `certificates` — Public Read, Owner Write

These portfolio asset collections share the same pattern:

```
match /skills/{skillId} {
  // Public read for published entries
  allow read: if resource.data.isPublished == true;

  // Owner can read all their entries (including unpublished)
  allow read: if isAuthenticated()
    && request.auth.uid == resource.data.ownerId;

  // Owner-only writes, with ownerId validation
  allow create: if isAuthenticated()
    && request.resource.data.ownerId == request.auth.uid;

  allow update, delete: if isOwner(resource);
}
```

Apply the same structure to `experience`, `projects`, and `certificates`.

---

### `blog_posts`, `gallery_items`, `testimonials` — Public Read, Owner Write

```
match /blog_posts/{postId} {
  allow read: if resource.data.isPublished == true;
  allow read: if isAuthenticated() && resource.data.ownerId == request.auth.uid;
  allow write: if isOwner(resource);
}
```

---

### `analytics_events` — Owner Write, Owner/Admin Read

```
match /analytics_events/{eventId} {
  // Only the owner or admin can read analytics
  allow read: if isAuthenticated()
    && (request.auth.uid == resource.data.ownerId || hasAdminClaim());

  // Anyone can write an analytics event (page views, clicks)
  // but the ownerId must be pre-set to the site owner's UID to prevent spoofing
  allow create: if request.resource.data.ownerId is string
    && request.resource.data.timestamp is timestamp;

  // No updates or deletes from the client
  allow update, delete: if false;
}
```

---

### `ai_preferences` — Owner Only

```
match /ai_preferences/{prefId} {
  allow read, write: if isAuthenticated()
    && request.auth.uid == resource.data.ownerId;
}
```

---

### `error_logs` — Write-only from Client, Admin Read

```
match /error_logs/{logId} {
  // Client can write error logs (for PWA resilience reporting)
  allow create: if request.resource.data.timestamp is timestamp;

  // Only admin/owner can read logs
  allow read: if hasAdminClaim();

  // No client-side updates or deletes
  allow update, delete: if false;
}
```

---

## Schema Validation Examples

Validate critical field types directly in rules to prevent invalid data:

```
// Example: Validating a skill document on create
allow create: if isAuthenticated()
  && request.resource.data.ownerId == request.auth.uid
  && request.resource.data.name is string
  && request.resource.data.sortOrder is int
  && request.resource.data.isPublished is bool;
```

---

## Deployment Checklist

- [ ] Rules are deployed before any data is written to production Firestore.
- [ ] Tested with the **Firebase Emulator Suite** for each collection pattern.
- [ ] Unauthorized write attempts to sensitive collections return `permission-denied`.
- [ ] Public reads on published documents succeed without authentication.
- [ ] Owner reads on unpublished documents succeed with correct UID.
- [ ] Non-owner authenticated users cannot write to any collection.

---

## Security Operational Notes

1. **Enable App Check** after initial QA to prevent API abuse. Start in monitoring mode first.
2. **Authorized Domains**: Keep the Firebase Console authorized domain list strictly limited to production and staging URLs.
3. **Rotate Secrets**: If `VITE_FIREBASE_*` env variables are accidentally exposed, immediately rotate the API key in the Firebase Console and update all hosting environments.
