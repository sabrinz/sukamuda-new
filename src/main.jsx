import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";

import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

import "./index.css";
import "./utils/axiosConfig.js";

/* =========================================================
   CONSTANTS
   ========================================================= */

const CHUNK_RELOAD_KEY =
  "sukamuda:chunk-reload";

const CHUNK_RELOAD_WINDOW =
  60 * 1000;

const FALLBACK_CLEANUP_DELAY =
  1500;

/* =========================================================
   FALLBACK HEAD CLEANUP
   ========================================================= */

function removeFallbackHead() {
  if (
    typeof document === "undefined"
  ) {
    return;
  }

  try {
    const fallbackElements =
      document.querySelectorAll(
        'head [data-fallback="1"]'
      );

    fallbackElements.forEach(
      (element) => {
        element.remove();
      }
    );
  } catch {
    /* Tidak fatal */
  }
}

/* =========================================================
   CHUNK ERROR DETECTION
   ========================================================= */

function isChunkLoadError(reason) {
  const message = String(
    reason?.message ||
      reason ||
      ""
  ).toLowerCase();

  if (!message) {
    return false;
  }

  const patterns = [
    "failed to fetch dynamically imported module",
    "dynamically imported module",
    "importing a module script failed",
    "failed to load module script",
    "loading chunk",
    "chunkloaderror",
    "unable to preload",
    "preload error",
  ];

  return patterns.some(
    (pattern) =>
      message.includes(pattern)
  );
}

/* =========================================================
   CHUNK RECOVERY
   ========================================================= */

function reloadAfterChunkError() {
  if (
    typeof window === "undefined"
  ) {
    return false;
  }

  try {
    const now = Date.now();

    const previous =
      Number(
        sessionStorage.getItem(
          CHUNK_RELOAD_KEY
        ) || 0
      );

    /*
     * Jangan reload berkali-kali.
     */

    if (
      Number.isFinite(previous) &&
      previous > 0 &&
      now - previous <
        CHUNK_RELOAD_WINDOW
    ) {
      return false;
    }

    sessionStorage.setItem(
      CHUNK_RELOAD_KEY,
      String(now)
    );
  } catch {
    return false;
  }

  window.location.reload();

  return true;
}

/* =========================================================
   ERROR REPORTING
   ========================================================= */

const reportedErrors =
  new Map();

function reportClientError(
  source,
  error
) {
  const message = String(
    error?.message ||
      error ||
      ""
  ).trim();

  if (!message) {
    return;
  }

  const key =
    `${source}:${message}`;

  const now =
    Date.now();

  const previous =
    reportedErrors.get(key);

  /*
   * Hindari error spam.
   */

  if (
    previous &&
    now - previous <
      10_000
  ) {
    return;
  }

  reportedErrors.set(
    key,
    now
  );

  /*
   * Bersihkan cache error lama.
   */

  if (
    reportedErrors.size >
    100
  ) {
    for (
      const [
        errorKey,
        timestamp,
      ] of reportedErrors
    ) {
      if (
        now - timestamp >
        60_000
      ) {
        reportedErrors.delete(
          errorKey
        );
      }
    }
  }

  /*
   * Kirim ke GA4 jika tersedia.
   */

  if (
    typeof window !==
      "undefined" &&
    typeof window.gtag ===
      "function"
  ) {
    try {
      window.gtag(
        "event",
        "exception",
        {
          description:
            `${source}: ${message}`.slice(
              0,
              180
            ),

          fatal: false,
        }
      );
    } catch {
      /* Jangan ganggu aplikasi */
    }
  }

  /*
   * Console tetap dipertahankan
   * untuk debugging development.
   */

  if (
    import.meta.env.DEV
  ) {
    console.error(
      `[SukaMuda ${source}]`,
      error
    );
  }
}

/* =========================================================
   GLOBAL ERROR HANDLERS
   ========================================================= */

if (
  typeof window !== "undefined"
) {
  /*
   * Vite preload error
   */

  window.addEventListener(
    "vite:preloadError",
    (event) => {
      event.preventDefault();

      const recovered =
        reloadAfterChunkError();

      if (
        !recovered &&
        import.meta.env.DEV
      ) {
        console.error(
          "Vite preload error:",
          event
        );
      }
    }
  );

  /*
   * Promise rejection
   */

  window.addEventListener(
    "unhandledrejection",
    (event) => {
      const reason =
        event?.reason;

      if (
        isChunkLoadError(
          reason
        )
      ) {
        reloadAfterChunkError();
        return;
      }

      reportClientError(
        "unhandledrejection",
        reason
      );
    }
  );

  /*
   * JavaScript error
   */

  window.addEventListener(
    "error",
    (event) => {
      /*
       * Abaikan resource error:
       * image/font/css/dll.
       */

      if (!event?.error) {
        return;
      }

      if (
        isChunkLoadError(
          event.error
        )
      ) {
        reloadAfterChunkError();
        return;
      }

      reportClientError(
        "window_error",
        event.error
      );
    }
  );
}

/* =========================================================
   REACT QUERY
   ========================================================= */

const queryClient =
  new QueryClient({
    defaultOptions: {
      queries: {
        /*
         * Data fresh selama 5 menit.
         */

        staleTime:
          1000 *
          60 *
          5,

        /*
         * Cache inactive 30 menit.
         */

        gcTime:
          1000 *
          60 *
          30,

        /*
         * Jangan refetch hanya karena
         * browser kembali focus.
         */

        refetchOnWindowFocus:
          false,

        /*
         * Refetch ketika internet kembali.
         */

        refetchOnReconnect:
          true,

        /*
         * Satu kali retry.
         */

        retry: 1,

        /*
         * Backoff ringan.
         */

        retryDelay:
          (attemptIndex) =>
            Math.min(
              1000 *
                2 **
                  attemptIndex,
              8000
            ),
      },

      mutations: {
        /*
         * Mutation tidak otomatis retry.
         */

        retry: 0,
      },
    },
  });

/* =========================================================
   ROOT ELEMENT
   ========================================================= */

const rootElement =
  document.getElementById(
    "root"
  );

if (!rootElement) {
  throw new Error(
    'Elemen root "#root" tidak ditemukan.'
  );
}

/* =========================================================
   APPLICATION
   ========================================================= */

const application = (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider
        client={queryClient}
      >
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

/* =========================================================
   RENDER
   ========================================================= */

let root;

try {
  root =
    ReactDOM.createRoot(
      rootElement
    );

  if (
    import.meta.env.DEV
  ) {
    root.render(
      <React.StrictMode>
        {application}
      </React.StrictMode>
    );
  } else {
    root.render(
      application
    );
  }
} catch (error) {
  /*
   * Jangan biarkan halaman putih
   * jika React gagal melakukan boot.
   */

  console.error(
    "SukaMuda React boot error:",
    error
  );

  rootElement.innerHTML = `
    <main
      style="
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:24px;
        font-family:Arial,sans-serif;
        background:#fff;
        color:#111;
        text-align:center;
      "
    >
      <section
        style="
          max-width:560px;
        "
      >
        <h1>
          SukaMuda
        </h1>

        <h2>
          Aplikasi gagal dimuat
        </h2>

        <p>
          Terjadi kesalahan saat memuat aplikasi.
          Silakan refresh halaman.
        </p>

        <button
          type="button"
          onclick="window.location.reload()"
          style="
            border:0;
            border-radius:8px;
            padding:12px 20px;
            cursor:pointer;
            font-weight:600;
          "
        >
          Muat Ulang
        </button>
      </section>
    </main>
  `;

  reportClientError(
    "react_boot",
    error
  );
}

/* =========================================================
   REMOVE FALLBACK SEO
   ========================================================= */

if (
  typeof window !== "undefined"
) {
  window.setTimeout(
    () => {
      removeFallbackHead();
    },
    FALLBACK_CLEANUP_DELAY
  );
}

/* =========================================================
   CHUNK FLAG CLEANUP
   ========================================================= */

if (
  typeof window !== "undefined"
) {
  window.setTimeout(
    () => {
      try {
        sessionStorage.removeItem(
          CHUNK_RELOAD_KEY
        );
      } catch {
        /* no-op */
      }
    },
    CHUNK_RELOAD_WINDOW
  );
}