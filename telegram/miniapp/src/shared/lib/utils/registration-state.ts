export type ResumableRegistrationStep =
  | 'register'
  | 'registerConfirm'
  | 'registerProfile';

export interface PersistedRegistrationTempData {
  phone?: string;
  login?: string;
  password?: string;
  accountType?: string;
  userId?: number;
  verificationRequestId?: string;
  verificationCode?: string;
  senderId?: string;
  name?: string;
  lastName?: string;
  specialization?: string;
  city?: string;
}

export interface PersistedRegistrationState {
  step: ResumableRegistrationStep;
  tempData: PersistedRegistrationTempData;
  savedAt: number;
}

const REGISTRATION_STATE_KEY = 'tarelka_registration_state';
const REGISTRATION_STATE_TTL_MS = 24 * 60 * 60 * 1000;

const RESUMABLE_STEPS: readonly ResumableRegistrationStep[] = [
  'register',
  'registerConfirm',
  'registerProfile',
] as const;

const SERIALIZABLE_KEYS: readonly (keyof PersistedRegistrationTempData)[] = [
  'phone',
  'login',
  'password',
  'accountType',
  'userId',
  'verificationRequestId',
  'verificationCode',
  'senderId',
  'name',
  'lastName',
  'specialization',
  'city',
] as const;

const getStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch (error) {
    console.error(
      'Unable to access localStorage for registration state',
      error,
    );
    return null;
  }
};

export const isResumableRegistrationStep = (
  step: string,
): step is ResumableRegistrationStep =>
  RESUMABLE_STEPS.includes(step as ResumableRegistrationStep);

const sanitizeTempData = (
  raw: unknown,
): PersistedRegistrationTempData | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const source = raw as Record<string, unknown>;
  const result: PersistedRegistrationTempData = {};

  for (const key of SERIALIZABLE_KEYS) {
    const value = source[key];
    if (value === undefined || value === null) continue;

    if (key === 'userId') {
      if (typeof value === 'number' && Number.isFinite(value)) {
        result.userId = value;
      }
      continue;
    }

    if (typeof value === 'string') {
      result[key] = value as never;
    }
  }

  return result;
};

export const saveRegistrationState = (
  state: Omit<PersistedRegistrationState, 'savedAt'>,
): void => {
  const storage = getStorage();
  if (!storage) return;

  if (!isResumableRegistrationStep(state.step)) {
    return;
  }

  const sanitized = sanitizeTempData(state.tempData) ?? {};
  const payload: PersistedRegistrationState = {
    step: state.step,
    tempData: sanitized,
    savedAt: Date.now(),
  };

  try {
    storage.setItem(REGISTRATION_STATE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error('Failed to persist registration state', error);
  }
};

export const clearStoredRegistrationState = (): void => {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.removeItem(REGISTRATION_STATE_KEY);
  } catch (error) {
    console.error('Failed to clear registration state', error);
  }
};

export const getStoredRegistrationState =
  (): PersistedRegistrationState | null => {
    const storage = getStorage();
    if (!storage) return null;

    let raw: string | null = null;
    try {
      raw = storage.getItem(REGISTRATION_STATE_KEY);
    } catch (error) {
      console.error('Failed to read registration state', error);
      return null;
    }

    if (!raw) return null;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      clearStoredRegistrationState();
      return null;
    }

    if (!parsed || typeof parsed !== 'object') {
      clearStoredRegistrationState();
      return null;
    }

    const candidate = parsed as Partial<PersistedRegistrationState>;

    if (
      typeof candidate.step !== 'string' ||
      !isResumableRegistrationStep(candidate.step) ||
      typeof candidate.savedAt !== 'number'
    ) {
      clearStoredRegistrationState();
      return null;
    }

    if (Date.now() - candidate.savedAt > REGISTRATION_STATE_TTL_MS) {
      clearStoredRegistrationState();
      return null;
    }

    return {
      step: candidate.step,
      tempData: sanitizeTempData(candidate.tempData) ?? {},
      savedAt: candidate.savedAt,
    };
  };
