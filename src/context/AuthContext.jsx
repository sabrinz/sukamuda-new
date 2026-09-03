import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "token";
const USER_KEY = "user";
const UNAUTHORIZED_EVENT = "auth:unauthorized";
const LOGOUT_EVENT = "auth:logout";

function getStoredItem(key) {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStoredItem(key, value) {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function removeStoredItem(key) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Penyimpanan browser dapat dinonaktifkan.
  }
}

function clearStoredSession() {
  removeStoredItem(TOKEN_KEY);
  removeStoredItem(USER_KEY);
}

function normalizeUser(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return { ...value };
}

function parseStoredUser(value) {
  if (!value || value === "null" || value === "undefined") {
    return null;
  }

  try {
    return normalizeUser(JSON.parse(value));
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  if (typeof token !== "string" || !token.trim()) {
    return true;
  }

  const parts = token.split(".");

  // Token Laravel Sanctum dapat berupa opaque token, bukan JWT.
  if (parts.length !== 3) {
    return false;
  }

  try {
    const normalizedPayload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");

    const payload = JSON.parse(window.atob(normalizedPayload));

    if (typeof payload.exp !== "number") {
      return false;
    }

    return payload.exp * 1000 <= Date.now();
  } catch {
    // JWT yang tidak dapat dibaca tidak otomatis dianggap kedaluwarsa.
    return false;
  }
}

function readStoredSession() {
  const token = getStoredItem(TOKEN_KEY);
  const user = parseStoredUser(getStoredItem(USER_KEY));

  if (!token || !user || isTokenExpired(token)) {
    clearStoredSession();
    return null;
  }

  return { token, user };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = Boolean(user);

  const clearSession = useCallback(() => {
    clearStoredSession();
    setUser(null);
  }, []);

  useEffect(() => {
    const session = readStoredSession();
    setUser(session?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleUnauthorized = () => clearSession();
    const handleLogout = () => clearSession();

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    window.addEventListener(LOGOUT_EVENT, handleLogout);

    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
      window.removeEventListener(LOGOUT_EVENT, handleLogout);
    };
  }, [clearSession]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleStorage = (event) => {
      if (event.key !== TOKEN_KEY && event.key !== USER_KEY) {
        return;
      }

      const session = readStoredSession();
      setUser(session?.user ?? null);
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const login = useCallback((userData, token) => {
    const normalizedUser = normalizeUser(userData);
    const normalizedToken = typeof token === "string" ? token.trim() : "";

    if (!normalizedUser || !normalizedToken) {
      return false;
    }

    let serializedUser;

    try {
      serializedUser = JSON.stringify(normalizedUser);
    } catch {
      return false;
    }

    // Simpan user dahulu dan token terakhir. Dengan begitu, tab lain tidak
    // membaca token baru sebelum data user selesai disimpan.
    if (!setStoredItem(USER_KEY, serializedUser)) {
      clearStoredSession();
      return false;
    }

    if (!setStoredItem(TOKEN_KEY, normalizedToken)) {
      clearStoredSession();
      setUser(null);
      return false;
    }

    setUser(normalizedUser);
    return true;
  }, []);

  const logout = useCallback(() => {
    clearSession();

    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(new CustomEvent(LOGOUT_EVENT));
      } catch {
        // State lokal sudah dibersihkan; event hanya sinkronisasi tambahan.
      }
    }
  }, [clearSession]);

  const updateUser = useCallback((newUserData) => {
    if (
      !newUserData ||
      typeof newUserData !== "object" ||
      Array.isArray(newUserData)
    ) {
      return false;
    }

    let updated = false;

    setUser((previousUser) => {
      if (!previousUser) {
        return previousUser;
      }

      const nextUser = {
        ...previousUser,
        ...newUserData,
      };

      try {
        const serializedUser = JSON.stringify(nextUser);

        if (!setStoredItem(USER_KEY, serializedUser)) {
          return previousUser;
        }
      } catch {
        return previousUser;
      }

      updated = true;
      return nextUser;
    });

    return updated;
  }, []);

  const getToken = useCallback(() => {
    const session = readStoredSession();

    if (!session) {
      setUser(null);
      return null;
    }

    return session.token;
  }, []);

  const hasValidStoredSession = useCallback(() => {
    return Boolean(readStoredSession());
  }, []);

  const refreshFromStorage = useCallback(() => {
    const session = readStoredSession();
    setUser(session?.user ?? null);
    return Boolean(session);
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      isLoggedIn,
      loading,
      login,
      logout,
      updateUser,
      getToken,
      refreshFromStorage,
      hasValidStoredSession,
    }),
    [
      user,
      isLoggedIn,
      loading,
      login,
      logout,
      updateUser,
      getToken,
      refreshFromStorage,
      hasValidStoredSession,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth() harus digunakan di dalam <AuthProvider>.");
  }

  return context;
}

export default AuthContext;
