import { CART_TOKEN_STORAGE_KEY } from "@/lib/constants/api";

const isBrowser = typeof window !== "undefined";

function generateToken(): string {
  if (isBrowser && "randomUUID" in window.crypto) {
    return window.crypto.randomUUID();
  }
  return `cart-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getCartToken(): string | null {
  if (!isBrowser) return null;

  let token = window.localStorage.getItem(CART_TOKEN_STORAGE_KEY);

  if (!token) {
    token = generateToken();
    window.localStorage.setItem(CART_TOKEN_STORAGE_KEY, token);
  }

  return token;
}
