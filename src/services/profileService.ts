// src/services/profileService.ts
// Data access layer for profile and portfolio operations.
// Pure async functions — throw on error.
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/services/firebase/client';
import type {
  Profile,
  Experience,
  Skill,
  Project,
  Certificate,
  PortfolioData,
} from '@/types/profile.types';
import { assertRequiredString, toServiceError } from '@/services/serviceError';

// ── Profile ───────────────────────────────────────────────────────────

export async function fetchProfileByUsername(username: string): Promise<Profile> {
  assertRequiredString(username, 'username');

  try {
    const q = query(
      collection(db, 'profiles'),
      where('username', '==', username),
      where('is_published', '==', true),
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('Profile not found.');
    }

    return { id: snapshot.docs[0]!.id, ...snapshot.docs[0]!.data() } as Profile;
  } catch (error) {
    throw toServiceError(error, 'Unable to load profile by username. Please try again.');
  }
}

export async function fetchProfileById(userId: string): Promise<Profile> {
  assertRequiredString(userId, 'userId');

  try {
    const snapshot = await getDoc(doc(db, 'profiles', userId));

    if (!snapshot.exists()) {
      throw new Error('Profile not found.');
    }

    return { id: snapshot.id, ...snapshot.data() } as Profile;
  } catch (error) {
    throw toServiceError(error, 'Unable to load profile. Please try again.');
  }
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  assertRequiredString(userId, 'userId');

  try {
    const ref = doc(db, 'profiles', userId);
    await updateDoc(ref, updates as Record<string, unknown>);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      throw new Error('Profile not found after update.');
    }

    return { id: snapshot.id, ...snapshot.data() } as Profile;
  } catch (error) {
    throw toServiceError(error, 'Unable to update profile. Please try again.');
  }
}

// ── Experience ────────────────────────────────────────────────────────

export async function fetchExperiences(ownerId: string): Promise<Experience[]> {
  assertRequiredString(ownerId, 'ownerId');

  try {
    const q = query(
      collection(db, 'experience'),
      where('owner_id', '==', ownerId),
      orderBy('sort_order', 'asc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Experience);
  } catch (error) {
    throw toServiceError(error, 'Unable to load experiences. Please try again.');
  }
}

// ── Skills ────────────────────────────────────────────────────────────

export async function fetchSkills(ownerId: string): Promise<Skill[]> {
  assertRequiredString(ownerId, 'ownerId');

  try {
    const q = query(
      collection(db, 'skills'),
      where('owner_id', '==', ownerId),
      orderBy('sort_order', 'asc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Skill);
  } catch (error) {
    throw toServiceError(error, 'Unable to load skills. Please try again.');
  }
}

// ── Projects ──────────────────────────────────────────────────────────

export async function fetchProjects(ownerId: string): Promise<Project[]> {
  assertRequiredString(ownerId, 'ownerId');

  try {
    const q = query(
      collection(db, 'projects'),
      where('owner_id', '==', ownerId),
      orderBy('sort_order', 'asc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Project);
  } catch (error) {
    throw toServiceError(error, 'Unable to load projects. Please try again.');
  }
}

export async function fetchPublishedProjects(ownerId: string): Promise<Project[]> {
  assertRequiredString(ownerId, 'ownerId');

  try {
    const q = query(
      collection(db, 'projects'),
      where('owner_id', '==', ownerId),
      where('status', '==', 'published'),
      orderBy('sort_order', 'asc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Project);
  } catch (error) {
    throw toServiceError(error, 'Unable to load published projects. Please try again.');
  }
}

// ── Certificates ──────────────────────────────────────────────────────

export async function fetchCertificates(ownerId: string): Promise<Certificate[]> {
  assertRequiredString(ownerId, 'ownerId');

  try {
    const q = query(
      collection(db, 'certificates'),
      where('owner_id', '==', ownerId),
      orderBy('sort_order', 'asc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Certificate);
  } catch (error) {
    throw toServiceError(error, 'Unable to load certificates. Please try again.');
  }
}

// ── Full Portfolio (composite fetch) ──────────────────────────────────

export async function fetchFullPortfolio(ownerId: string): Promise<PortfolioData> {
  assertRequiredString(ownerId, 'ownerId');

  const [profile, experiences, skills, projects, certificates] = await Promise.all([
    fetchProfileById(ownerId),
    fetchExperiences(ownerId),
    fetchSkills(ownerId),
    fetchProjects(ownerId),
    fetchCertificates(ownerId),
  ]);

  return { profile, experiences, skills, projects, certificates };
}
