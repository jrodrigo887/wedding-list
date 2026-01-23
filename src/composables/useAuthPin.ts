import { ref } from 'vue';

const COOKIE_NAME = 'auth_pin';
const COOKIE_EXPIRY_DAYS = 2;

const authenticated = ref(false);
const pin = ref('');
const authError = ref('');

const setCookie = (name: string, value: string, days: number): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const c = cookie.trim();
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length));
    }
  }
  return null;
};

const deleteCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

const restoreSession = (): void => {
  const savedPin = getCookie(COOKIE_NAME);
  const correctPin = import.meta.env.VITE_CHECKIN_PIN;

  if (savedPin && savedPin === correctPin) {
    authenticated.value = true;
    pin.value = savedPin;
  }
};

const validatePin = async (): Promise<void> => {
  const correctPin = import.meta.env.VITE_CHECKIN_PIN;

  if (pin.value === correctPin) {
    authenticated.value = true;
    authError.value = '';
    setCookie(COOKIE_NAME, pin.value, COOKIE_EXPIRY_DAYS);
  } else {
    authError.value = 'PIN incorreto. Tente novamente.';
  }
};

const logout = (): void => {
  authenticated.value = false;
  pin.value = '';
  authError.value = '';
  deleteCookie(COOKIE_NAME);
};

// Restaura a sessão ao carregar
restoreSession();

export const useAuthPin = () => {
  return {
    validatePin,
    authError,
    authenticated,
    pin,
    logout,
    restoreSession,
  };
};
