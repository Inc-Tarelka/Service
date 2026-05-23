import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearStoredRegistrationState,
  getStoredRegistrationState,
  isResumableRegistrationStep,
  saveRegistrationState,
} from './registration-state';

const STORAGE_KEY = 'tarelka_registration_state';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// isResumableRegistrationStep
// ---------------------------------------------------------------------------
describe('isResumableRegistrationStep', () => {
  it('returns true for "register"', () => {
    expect(isResumableRegistrationStep('register')).toBe(true);
  });

  it('returns true for "registerConfirm"', () => {
    expect(isResumableRegistrationStep('registerConfirm')).toBe(true);
  });

  it('returns true for "registerProfile"', () => {
    expect(isResumableRegistrationStep('registerProfile')).toBe(true);
  });

  it('returns false for "login"', () => {
    expect(isResumableRegistrationStep('login')).toBe(false);
  });

  it('returns false for "confirmLogin"', () => {
    expect(isResumableRegistrationStep('confirmLogin')).toBe(false);
  });

  it('returns false for "reset"', () => {
    expect(isResumableRegistrationStep('reset')).toBe(false);
  });

  it('returns false for "confirmReset"', () => {
    expect(isResumableRegistrationStep('confirmReset')).toBe(false);
  });

  it('returns false for "newPassword"', () => {
    expect(isResumableRegistrationStep('newPassword')).toBe(false);
  });

  it('returns false for an arbitrary string', () => {
    expect(isResumableRegistrationStep('someRandomStep')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isResumableRegistrationStep('')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// saveRegistrationState + getStoredRegistrationState — round trip
// ---------------------------------------------------------------------------
describe('saveRegistrationState + getStoredRegistrationState', () => {
  it('round-trip: save then get returns the same step', () => {
    saveRegistrationState({
      step: 'register',
      tempData: { phone: '+79001234567', login: 'user1' },
    });

    const result = getStoredRegistrationState();
    expect(result).not.toBeNull();
    expect(result!.step).toBe('register');
  });

  it('round-trip: returns valid tempData fields', () => {
    saveRegistrationState({
      step: 'registerConfirm',
      tempData: {
        phone: '+79001234567',
        login: 'user1',
        password: 'secret',
        verificationCode: '1234',
        verificationRequestId: 'req-abc',
        userId: 42,
        name: 'Alice',
        lastName: 'Smith',
      },
    });

    const result = getStoredRegistrationState();
    expect(result).not.toBeNull();
    expect(result!.tempData.phone).toBe('+79001234567');
    expect(result!.tempData.login).toBe('user1');
    expect(result!.tempData.password).toBe('secret');
    expect(result!.tempData.verificationCode).toBe('1234');
    expect(result!.tempData.verificationRequestId).toBe('req-abc');
    expect(result!.tempData.userId).toBe(42);
    expect(result!.tempData.name).toBe('Alice');
    expect(result!.tempData.lastName).toBe('Smith');
  });

  it('verificationToken is NOT persisted (not in SERIALIZABLE_KEYS)', () => {
    saveRegistrationState({
      step: 'register',
      tempData: { phone: '+79001234567' },
    });

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.tempData.verificationToken).toBeUndefined();
  });

  it('includes verificationCode in persisted data', () => {
    saveRegistrationState({
      step: 'registerConfirm',
      tempData: { verificationCode: '9999' },
    });

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.tempData.verificationCode).toBe('9999');
  });

  it('does not save when step is non-resumable', () => {
    saveRegistrationState({
      step: 'login' as never,
      tempData: { phone: '+79001234567' },
    });

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('get returns null when step is non-resumable (nothing saved)', () => {
    saveRegistrationState({
      step: 'login' as never,
      tempData: {},
    });

    const result = getStoredRegistrationState();
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getStoredRegistrationState — expired TTL
// ---------------------------------------------------------------------------
describe('getStoredRegistrationState - expired TTL', () => {
  it('returns null when savedAt is older than 24 hours', () => {
    const expiredSavedAt = Date.now() - 25 * 60 * 60 * 1000;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        step: 'register',
        tempData: {},
        savedAt: expiredSavedAt,
      }),
    );

    const result = getStoredRegistrationState();
    expect(result).toBeNull();
  });

  it('clears localStorage when expired', () => {
    const expiredSavedAt = Date.now() - 25 * 60 * 60 * 1000;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        step: 'register',
        tempData: {},
        savedAt: expiredSavedAt,
      }),
    );

    getStoredRegistrationState();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('returns the state when savedAt is within 24 hours', () => {
    const recentSavedAt = Date.now() - 60 * 60 * 1000; // 1 hour ago
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        step: 'registerProfile',
        tempData: { name: 'Bob' },
        savedAt: recentSavedAt,
      }),
    );

    const result = getStoredRegistrationState();
    expect(result).not.toBeNull();
    expect(result!.step).toBe('registerProfile');
  });
});

// ---------------------------------------------------------------------------
// getStoredRegistrationState — corrupted storage
// ---------------------------------------------------------------------------
describe('getStoredRegistrationState - corrupted storage', () => {
  it('returns null on invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json{{{');
    const result = getStoredRegistrationState();
    expect(result).toBeNull();
  });

  it('clears localStorage on invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json{{{');
    getStoredRegistrationState();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('returns null when step field is missing', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ tempData: {}, savedAt: Date.now() }),
    );
    const result = getStoredRegistrationState();
    expect(result).toBeNull();
  });

  it('returns null when step is non-resumable (e.g. "login")', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ step: 'login', tempData: {}, savedAt: Date.now() }),
    );
    const result = getStoredRegistrationState();
    expect(result).toBeNull();
  });

  it('returns null when item does not exist in localStorage', () => {
    const result = getStoredRegistrationState();
    expect(result).toBeNull();
  });

  it('clears localStorage when step is non-resumable', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ step: 'login', tempData: {}, savedAt: Date.now() }),
    );
    getStoredRegistrationState();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// clearStoredRegistrationState
// ---------------------------------------------------------------------------
describe('clearStoredRegistrationState', () => {
  it('removes the item from localStorage', () => {
    saveRegistrationState({ step: 'register', tempData: {} });
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

    clearStoredRegistrationState();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('is idempotent — calling twice does not throw', () => {
    clearStoredRegistrationState();
    expect(() => clearStoredRegistrationState()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// sanitization
// ---------------------------------------------------------------------------
describe('sanitization', () => {
  it('strips unknown keys from tempData on read', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        step: 'register',
        tempData: {
          phone: '+79001234567',
          unknownField: 'should-be-removed',
          anotherExtra: 123,
        },
        savedAt: Date.now(),
      }),
    );

    const result = getStoredRegistrationState();
    expect(result).not.toBeNull();
    expect(
      (result!.tempData as Record<string, unknown>).unknownField,
    ).toBeUndefined();
    expect(
      (result!.tempData as Record<string, unknown>).anotherExtra,
    ).toBeUndefined();
    expect(result!.tempData.phone).toBe('+79001234567');
  });

  it('preserves numeric userId', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        step: 'registerConfirm',
        tempData: { userId: 999 },
        savedAt: Date.now(),
      }),
    );

    const result = getStoredRegistrationState();
    expect(result).not.toBeNull();
    expect(result!.tempData.userId).toBe(999);
  });

  it('strips non-string values for string keys', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        step: 'register',
        tempData: {
          phone: 12345, // should be stripped — not a string
          login: 'validUser',
        },
        savedAt: Date.now(),
      }),
    );

    const result = getStoredRegistrationState();
    expect(result).not.toBeNull();
    expect(result!.tempData.phone).toBeUndefined();
    expect(result!.tempData.login).toBe('validUser');
  });

  it('strips non-finite numeric userId', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        step: 'register',
        tempData: { userId: 'not-a-number' },
        savedAt: Date.now(),
      }),
    );

    const result = getStoredRegistrationState();
    expect(result).not.toBeNull();
    expect(result!.tempData.userId).toBeUndefined();
  });
});
