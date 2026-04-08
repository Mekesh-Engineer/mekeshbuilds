// src/services/adminService.ts
// Data access layer for admin/analytics operations.
// Pure async functions — throw on error.
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import type { Database } from '@/types/database.types';
import { assertRequiredString, toServiceError } from '@/services/serviceError';

type ContactSubmission = Database['public']['Tables']['contact_submissions']['Row'];
type PageView = Database['public']['Tables']['page_views']['Row'];
type ProjectClick = Database['public']['Tables']['project_clicks']['Row'];

// ── Contact Submissions ───────────────────────────────────────────────

export async function fetchContactSubmissions(ownerUserId: string): Promise<ContactSubmission[]> {
  assertRequiredString(ownerUserId, 'ownerUserId');

  try {
    const q = query(
      collection(db, 'contact_submissions'),
      where('owner_user_id', '==', ownerUserId),
      orderBy('created_at', 'desc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as ContactSubmission);
  } catch (error) {
    throw toServiceError(error, 'Unable to load contact submissions. Please try again.');
  }
}

export async function deleteContactSubmission(id: string): Promise<void> {
  assertRequiredString(id, 'id');

  try {
    await deleteDoc(doc(db, 'contact_submissions', id));
  } catch (error) {
    throw toServiceError(error, 'Unable to delete contact submission. Please try again.');
  }
}

// ── Analytics ─────────────────────────────────────────────────────────

export async function fetchPageViews(
  ownerUserId: string,
  startDate: string,
  endDate: string,
): Promise<PageView[]> {
  assertRequiredString(ownerUserId, 'ownerUserId');
  assertRequiredString(startDate, 'startDate');
  assertRequiredString(endDate, 'endDate');

  try {
    const q = query(
      collection(db, 'page_views'),
      where('owner_user_id', '==', ownerUserId),
      where('created_at', '>=', startDate),
      where('created_at', '<=', endDate),
      orderBy('created_at', 'asc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as PageView);
  } catch (error) {
    throw toServiceError(error, 'Unable to load page views. Please try again.');
  }
}

export async function fetchProjectClicks(ownerId: string): Promise<ProjectClick[]> {
  assertRequiredString(ownerId, 'ownerId');

  try {
    const q = query(
      collection(db, 'project_clicks'),
      where('owner_id', '==', ownerId),
      orderBy('created_at', 'desc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as ProjectClick);
  } catch (error) {
    throw toServiceError(error, 'Unable to load project clicks. Please try again.');
  }
}

// ── Error Logging ─────────────────────────────────────────────────────

export async function logError(
  path: string,
  referrer: string | null,
  errorType: string,
): Promise<void> {
  try {
    assertRequiredString(path, 'path');
    assertRequiredString(errorType, 'errorType');

    await addDoc(collection(db, 'error_logs'), {
      path,
      referrer,
      error_type: errorType,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Fire-and-forget logging failures should never break UX.
  }
}
