import { describe, expect, it, vi } from 'vitest';
import type { User } from 'firebase/auth';
import { ensureOwnerSession } from '@/features/auth/services/authService';

function createMockUser(
  overrides: {
    uid?: string;
    email?: string | null;
    displayName?: string | null;
  } = {},
): User {
  const uid = overrides.uid ?? 'user-1';

  return {
    uid,
    email: overrides.email ?? 'someone@example.com',
    displayName: overrides.displayName ?? null,
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    providerData: [],
    metadata: {},
    tenantId: null,
    phoneNumber: null,
    providerId: 'firebase',
    refreshToken: '',
    delete: vi.fn(),
    getIdToken: vi.fn(),
    getIdTokenResult: vi.fn().mockResolvedValue({ claims: {} }),
    reload: vi.fn(),
    toJSON: vi.fn(),
  } as unknown as User;
}

describe('ensureOwnerSession', () => {
  it('returns false when user is null', async () => {
    const result = await ensureOwnerSession(null);
    expect(result).toBe(false);
  });

  it('returns true when custom claims contain owner role', async () => {
    const fetchProfileRole = vi.fn(async () => 'user');
    const signOut = vi.fn(async () => undefined);

    const user = createMockUser();
    // Override getIdTokenResult to return owner claim
    user.getIdTokenResult = vi.fn().mockResolvedValue({ claims: { owner: true } });

    const result = await ensureOwnerSession(user, {
      fetchProfileRole,
      signOut,
    });

    expect(result).toBe(true);
    expect(fetchProfileRole).not.toHaveBeenCalled();
    expect(signOut).not.toHaveBeenCalled();
  });

  it('returns true when profile role resolves to owner', async () => {
    const fetchProfileRole = vi.fn(async () => 'admin');
    const signOut = vi.fn(async () => undefined);

    const result = await ensureOwnerSession(createMockUser(), {
      fetchProfileRole,
      signOut,
    });

    expect(result).toBe(true);
    expect(fetchProfileRole).toHaveBeenCalledWith('user-1');
    expect(signOut).not.toHaveBeenCalled();
  });

  it('returns false and signs out when user is not owner', async () => {
    const fetchProfileRole = vi.fn(async () => 'user');
    const signOut = vi.fn(async () => undefined);

    const result = await ensureOwnerSession(createMockUser(), {
      fetchProfileRole,
      signOut,
    });

    expect(result).toBe(false);
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('returns false and signs out when role lookup fails', async () => {
    const fetchProfileRole = vi.fn(async () => {
      throw new Error('lookup failed');
    });
    const signOut = vi.fn(async () => undefined);

    const result = await ensureOwnerSession(createMockUser(), {
      fetchProfileRole,
      signOut,
    });

    expect(result).toBe(false);
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
