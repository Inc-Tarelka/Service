import { beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks — must be hoisted before any import of the module under test
// ---------------------------------------------------------------------------

vi.mock('shared/api/base', () => ({
  loadAccessTokenOnce: vi.fn().mockResolvedValue(undefined),
  getAccessToken: vi.fn().mockReturnValue(null),
  getRefreshToken: vi.fn().mockReturnValue(null),
  setAccessToken: vi.fn(),
  setRefreshToken: vi.fn(),
  clearTokens: vi.fn(),
}));

vi.mock('shared/api/service/Auth/api', () => ({
  preRegisterRequest: vi.fn().mockRejectedValue(new Error('not mocked')),
  sendPhoneVerificationRequest: vi
    .fn()
    .mockRejectedValue(new Error('not mocked')),
  loginRequest: vi.fn().mockRejectedValue(new Error('not mocked')),
  telegramRegisterRequest: vi.fn().mockRejectedValue(new Error('not mocked')),
  registerRequest: vi.fn().mockRejectedValue(new Error('not mocked')),
  forgotPasswordRequest: vi.fn().mockRejectedValue(new Error('not mocked')),
  resetPasswordRequest: vi.fn().mockRejectedValue(new Error('not mocked')),
  logoutRequest: vi.fn().mockResolvedValue(undefined),
  verifyCodeRequest: vi.fn().mockRejectedValue(new Error('not mocked')),
  refreshRequest: vi.fn().mockRejectedValue(new Error('not mocked')),
}));

vi.mock('shared/lib/utils/telegram-startapp', () => ({
  getStoredReferralSenderId: vi.fn().mockReturnValue('testSender'),
  setStoredReferralSenderId: vi.fn(),
  persistReferralSenderIdFromStartParam: vi.fn().mockReturnValue(null),
}));

// routeConfig is imported indirectly via shared/api/base; mock the module
vi.mock('shared/config/routeConfig/routeConfig', () => ({
  RoutePath: { auth: '/auth' },
}));

// @twa-dev/sdk used in shared/api/base
vi.mock('@twa-dev/sdk', () => ({
  default: {
    version: '6.0',
    CloudStorage: null,
  },
}));

import axios from 'axios';
import { AuthStore, PRE_REGISTER_RESUME } from './auth-store';
import * as authApi from 'shared/api/service/Auth/api';
import * as base from 'shared/api/base';
import * as telegramStartapp from 'shared/lib/utils/telegram-startapp';

// Helper to make an axios 409 error
function make409Error() {
  const err = new axios.AxiosError('Conflict', '409');
  err.response = {
    status: 409,
    data: {},
    headers: {},
    config: {} as never,
    statusText: 'Conflict',
  };
  return err;
}

// Minimal TelegramRegisterRequest payload
const minimalTelegramPayload = {
  initData: 'tg-init',
  senderId: 'testSender',
  account: {
    type: 'PERSON' as never,
    username: 'user1',
    phone: '+79001234567',
    password: 'pass',
  },
  phoneVerification: {
    verificationCode: '1234',
    verificationRequestId: 'req1',
  },
  specializationIds: [],
  directionIds: [],
  cityIds: [],
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();

  // Default: getStoredReferralSenderId returns 'testSender' so senderId resolves
  vi.mocked(telegramStartapp.getStoredReferralSenderId).mockReturnValue(
    'testSender',
  );
  vi.mocked(
    telegramStartapp.persistReferralSenderIdFromStartParam,
  ).mockReturnValue(null);
  vi.mocked(base.getAccessToken).mockReturnValue(undefined);
  vi.mocked(base.loadAccessTokenOnce).mockResolvedValue(undefined);
});

// ---------------------------------------------------------------------------
// PRE_REGISTER_RESUME handling
// ---------------------------------------------------------------------------
describe('preRegisterAction', () => {
  it('returns PRE_REGISTER_RESUME when API returns 409', async () => {
    vi.mocked(authApi.preRegisterRequest).mockRejectedValue(make409Error());

    const store = new AuthStore();
    const result = await store.preRegisterAction({
      initData: 'tg-init',
      account: {
        type: 'PERSON' as never,
        username: 'user1',
        phone: '+79001234567',
      },
    });

    expect(result).toBe(PRE_REGISTER_RESUME);
  });

  it('returns null on non-409 error', async () => {
    vi.mocked(authApi.preRegisterRequest).mockRejectedValue(
      new Error('network error'),
    );

    const store = new AuthStore();
    const result = await store.preRegisterAction({
      initData: 'tg-init',
      account: {
        type: 'PERSON' as never,
        username: 'user1',
        phone: '+79001234567',
      },
    });

    expect(result).toBeNull();
  });

  it('returns null when senderId is unavailable (registrationBlocked)', async () => {
    vi.mocked(telegramStartapp.getStoredReferralSenderId).mockReturnValue(null);
    vi.mocked(
      telegramStartapp.persistReferralSenderIdFromStartParam,
    ).mockReturnValue(null);

    const store = new AuthStore();
    const result = await store.preRegisterAction({
      initData: 'tg-init',
      account: {
        type: 'PERSON' as never,
        username: 'user1',
        phone: '+79001234567',
      },
    });

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// preRegisterAndSendCodeAction
// ---------------------------------------------------------------------------
describe('preRegisterAndSendCodeAction', () => {
  it('returns true when preRegisterAction returns PRE_REGISTER_RESUME (symbol path — skips setTempData userId)', async () => {
    vi.mocked(authApi.preRegisterRequest).mockRejectedValue(make409Error());
    vi.mocked(authApi.sendPhoneVerificationRequest).mockResolvedValue({
      requestId: 'req-xyz',
    });

    const store = new AuthStore();
    const result = await store.preRegisterAndSendCodeAction({
      initData: 'tg-init',
      account: {
        type: 'PERSON' as never,
        username: 'user1',
        phone: '+79001234567',
      },
    });

    expect(result).toBe(true);
    // sendPhoneVerificationRequest must still have been called
    expect(authApi.sendPhoneVerificationRequest).toHaveBeenCalledWith({
      PhoneNumber: '+79001234567',
    });
  });

  it('returns true when preRegisterAction succeeds (normal path)', async () => {
    vi.mocked(authApi.preRegisterRequest).mockResolvedValue({ userId: 77 });
    vi.mocked(authApi.sendPhoneVerificationRequest).mockResolvedValue({
      requestId: 'req-abc',
    });

    const store = new AuthStore();
    const result = await store.preRegisterAndSendCodeAction({
      initData: 'tg-init',
      account: {
        type: 'PERSON' as never,
        username: 'user1',
        phone: '+79001234567',
      },
    });

    expect(result).toBe(true);
    expect(store.tempData.userId).toBe(77);
    expect(store.tempData.verificationRequestId).toBe('req-abc');
  });

  it('returns false when preRegisterAction returns null (no senderId)', async () => {
    vi.mocked(telegramStartapp.getStoredReferralSenderId).mockReturnValue(null);
    vi.mocked(
      telegramStartapp.persistReferralSenderIdFromStartParam,
    ).mockReturnValue(null);

    const store = new AuthStore();
    const result = await store.preRegisterAndSendCodeAction({
      initData: 'tg-init',
      account: {
        type: 'PERSON' as never,
        username: 'user1',
        phone: '+79001234567',
      },
    });

    expect(result).toBe(false);
  });

  it('returns false when sendPhoneVerificationRequest throws', async () => {
    vi.mocked(authApi.preRegisterRequest).mockResolvedValue({ userId: 10 });
    vi.mocked(authApi.sendPhoneVerificationRequest).mockRejectedValue(
      new Error('SMS error'),
    );

    const store = new AuthStore();
    const result = await store.preRegisterAndSendCodeAction({
      initData: 'tg-init',
      account: {
        type: 'PERSON' as never,
        username: 'user1',
        phone: '+79001234567',
      },
    });

    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// telegramRegistrationAction
// ---------------------------------------------------------------------------
describe('telegramRegistrationAction', () => {
  it('returns true and calls clearTempData on success', async () => {
    vi.mocked(authApi.telegramRegisterRequest).mockResolvedValue({
      accessToken: 'acc-token',
      refreshToken: 'ref-token',
      userId: 1,
    });

    const store = new AuthStore();
    store.setTempData({ login: 'user1', password: 'pass' }, { persist: false });

    const result = await store.telegramRegistrationAction(
      minimalTelegramPayload,
    );

    expect(result).toBe(true);
    // clearTempData resets currentStep and tempData
    expect(store.currentStep).toBeNull();
    expect(store.tempData.login).toBeUndefined();
    expect(base.setAccessToken).toHaveBeenCalledWith('acc-token');
    expect(base.setRefreshToken).toHaveBeenCalledWith('ref-token');
  });

  it('returns "conflict" on 409 when loginAction also fails', async () => {
    vi.mocked(authApi.telegramRegisterRequest).mockRejectedValue(
      make409Error(),
    );
    vi.mocked(authApi.loginRequest).mockRejectedValue(new Error('bad creds'));

    const store = new AuthStore();
    store.setTempData(
      { login: 'user1', password: 'wrongpass' },
      { persist: false },
    );

    const result = await store.telegramRegistrationAction(
      minimalTelegramPayload,
    );

    expect(result).toBe('conflict');
  });

  it('returns true on 409 when silent loginAction succeeds', async () => {
    vi.mocked(authApi.telegramRegisterRequest).mockRejectedValue(
      make409Error(),
    );
    vi.mocked(authApi.loginRequest).mockResolvedValue({
      accessToken: 'acc-token',
      refreshToken: 'ref-token',
      userId: 1,
    });

    const store = new AuthStore();
    store.setTempData(
      { login: 'user1', password: 'correctpass' },
      { persist: false },
    );

    const result = await store.telegramRegistrationAction(
      minimalTelegramPayload,
    );

    expect(result).toBe(true);
    expect(store.isAuth).toBe(true);
  });

  it('returns false when no senderId is available', async () => {
    vi.mocked(telegramStartapp.getStoredReferralSenderId).mockReturnValue(null);
    vi.mocked(
      telegramStartapp.persistReferralSenderIdFromStartParam,
    ).mockReturnValue(null);

    const store = new AuthStore();
    const result = await store.telegramRegistrationAction(
      minimalTelegramPayload,
    );

    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// clearTempData
// ---------------------------------------------------------------------------
describe('clearTempData', () => {
  it('resets tempData fields', () => {
    const store = new AuthStore();
    store.setTempData(
      { phone: '+79001234567', login: 'user1' },
      { persist: false },
    );

    store.clearTempData();

    expect(store.tempData.phone).toBeUndefined();
    expect(store.tempData.login).toBeUndefined();
  });

  it('sets currentStep to null', () => {
    const store = new AuthStore();
    store.setCurrentStep('register');

    store.clearTempData();

    expect(store.currentStep).toBeNull();
  });

  it('clears localStorage via clearStoredRegistrationState', () => {
    const store = new AuthStore();
    store.setCurrentStep('register');
    store.setTempData({ phone: '+79001234567' }, { persist: false });
    // Manually persist to confirm it was there
    localStorage.setItem(
      'tarelka_registration_state',
      JSON.stringify({
        step: 'register',
        tempData: {},
        savedAt: Date.now(),
      }),
    );

    store.clearTempData();

    expect(localStorage.getItem('tarelka_registration_state')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// hydrateRegistrationState
// ---------------------------------------------------------------------------
describe('hydrateRegistrationState', () => {
  it('returns null when storage is empty', () => {
    const store = new AuthStore();
    // constructor already called hydrateRegistrationState; call again with clean storage
    localStorage.clear();
    const result = store.hydrateRegistrationState();
    expect(result).toBeNull();
  });

  it('reads from localStorage and sets currentStep', () => {
    localStorage.setItem(
      'tarelka_registration_state',
      JSON.stringify({
        step: 'registerConfirm',
        tempData: { phone: '+79001234567', login: 'alice' },
        savedAt: Date.now(),
      }),
    );

    const store = new AuthStore();
    // hydration happens in constructor; currentStep should be set
    expect(store.currentStep).toBe('registerConfirm');
  });

  it('merges tempData from storage into store tempData', () => {
    localStorage.setItem(
      'tarelka_registration_state',
      JSON.stringify({
        step: 'registerProfile',
        tempData: { phone: '+79001234567', name: 'Alice', userId: 55 },
        savedAt: Date.now(),
      }),
    );

    const store = new AuthStore();
    expect(store.tempData.phone).toBe('+79001234567');
    expect(store.tempData.name).toBe('Alice');
    expect(store.tempData.userId).toBe(55);
  });

  it('returns null and leaves currentStep null when storage is empty at construction', () => {
    // localStorage.clear() called in beforeEach
    const store = new AuthStore();
    expect(store.currentStep).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// loginAction — clears tempData on success
// ---------------------------------------------------------------------------
describe('loginAction', () => {
  it('sets isAuth to true and clears tempData on success', async () => {
    vi.mocked(authApi.loginRequest).mockResolvedValue({
      accessToken: 'tok',
      refreshToken: 'ref',
      userId: 5,
    });

    const store = new AuthStore();
    store.setTempData({ phone: '+79001234567' }, { persist: false });

    const result = await store.loginAction({
      username: 'user1',
      password: 'pass',
    });

    expect(result).toBe(true);
    expect(store.isAuth).toBe(true);
    expect(store.tempData.phone).toBeUndefined();
  });

  it('returns false on login failure', async () => {
    vi.mocked(authApi.loginRequest).mockRejectedValue(new Error('bad creds'));

    const store = new AuthStore();
    const result = await store.loginAction({
      username: 'user1',
      password: 'wrong',
    });

    expect(result).toBe(false);
  });
});
