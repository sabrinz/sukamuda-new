import axios from "axios";

const DEFAULT_API_URL = "https://sukamuda.co.id";
const TOKEN_KEY = "token";
const USER_KEY = "user";
const UNAUTHORIZED_EVENT = "auth:unauthorized";

function normalizeBaseUrl(value) {
  const candidate = String(value || DEFAULT_API_URL).trim();
  const withProtocol = /^https?:\/\//i.test(candidate)
    ? candidate
    : "https://" + candidate;

  try {
    const parsed = new URL(withProtocol);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return DEFAULT_API_URL;
    }

    parsed.search = "";
    parsed.hash = "";

    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return DEFAULT_API_URL;
  }
}

const baseURL = normalizeBaseUrl(import.meta.env.VITE_API_URL);
const apiOrigin = new URL(baseURL).origin;

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  timeout: 30_000,
});

function getToken() {
  if (typeof window === "undefined") return null;

  try {
    const token = window.localStorage.getItem(TOKEN_KEY)?.trim();
    return token || null;
  } catch {
    return null;
  }
}

function clearStoredSession() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  } catch {
    // Penyimpanan browser dapat dinonaktifkan.
  }
}

export function getCookie(name) {
  if (typeof document === "undefined" || !name) return null;

  try {
    const encodedName = `${encodeURIComponent(name)}=`;
    const matched = document.cookie
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(encodedName));

    if (!matched) return null;

    const rawValue = matched.slice(encodedName.length);
    if (!rawValue) return null;

    try {
      return decodeURIComponent(rawValue);
    } catch {
      return rawValue;
    }
  } catch {
    return null;
  }
}

export function isOwnApiRequest(config = {}) {
  const requestUrl = String(config.url || "").trim();
  const requestBaseUrl = normalizeBaseUrl(config.baseURL || baseURL);

  try {
    const resolved = new URL(requestUrl || requestBaseUrl, requestBaseUrl);

    return (
      (resolved.protocol === "http:" || resolved.protocol === "https:") &&
      resolved.origin === apiOrigin
    );
  } catch {
    return false;
  }
}

function removeAuthorizationHeader(headers) {
  if (!headers) return;

  try {
    if (typeof headers.delete === "function") {
      headers.delete("Authorization");
      headers.delete("authorization");
      return;
    }

    delete headers.Authorization;
    delete headers.authorization;
  } catch {
    // Header yang tidak dapat diubah tidak boleh merusak aplikasi.
  }
}

let csrfPromise = null;

export async function ensureCsrfToken() {
  if (typeof window === "undefined") return false;
  if (getCookie("XSRF-TOKEN")) return true;
  if (csrfPromise) return csrfPromise;

  csrfPromise = api
    .get("/sanctum/csrf-cookie", {
      skipAuth: true,
      skipUnauthorizedHandler: true,
    })
    .then(() => Boolean(getCookie("XSRF-TOKEN")))
    .catch((error) => {
      if (import.meta.env.DEV) {
        console.warn("Gagal mengambil CSRF token:", error?.message || error);
      }

      return false;
    })
    .finally(() => {
      csrfPromise = null;
    });

  return csrfPromise;
}

let unauthorizedEventSent = false;

api.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};

    const ownRequest = isOwnApiRequest(config);

    if (!ownRequest) {
      // Jangan pernah mengirim kredensial atau token SukaMuda ke origin lain.
      config.withCredentials = false;
      removeAuthorizationHeader(config.headers);
      return config;
    }

    config.withCredentials = true;

    if (config.skipAuth === true) {
      removeAuthorizationHeader(config.headers);
    } else {
      const token = getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        removeAuthorizationHeader(config.headers);
      }
    }

    if (config.url === "/sanctum/csrf-cookie") {
      config.skipUnauthorizedHandler = true;
      removeAuthorizationHeader(config.headers);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    const config = response?.config;

    if (isOwnApiRequest(config) && config?.url !== "/sanctum/csrf-cookie") {
      unauthorizedEventSent = false;
    }

    return response;
  },
  (error) => {
    const config = error?.config;
    const shouldHandleUnauthorized =
      error?.response?.status === 401 &&
      isOwnApiRequest(config) &&
      config?.skipUnauthorizedHandler !== true;

    if (shouldHandleUnauthorized) {
      clearStoredSession();

      if (!unauthorizedEventSent && typeof window !== "undefined") {
        unauthorizedEventSent = true;

        try {
          window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
        } catch {
          // AuthContext akan memeriksa ulang sesi pada interaksi berikutnya.
        }
      }
    }

    return Promise.reject(error);
  },
);

export { baseURL };
export default api;
