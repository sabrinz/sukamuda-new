import React from "react";

const CHUNK_RELOAD_KEY = "sukamuda:chunk-reload";
const CHUNK_RELOAD_WINDOW = 60 * 1000;

const CHUNK_ERROR_PATTERN =
  /ChunkLoadError|Loading chunk|Loading CSS chunk|dynamically imported module|Failed to fetch dynamically|Importing a module script failed|Failed to fetch/i;

function isChunkError(error) {
  const message = String(error?.message || error || "");

  return error?.name === "ChunkLoadError" || CHUNK_ERROR_PATTERN.test(message);
}

function reloadOnceForChunkError() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const now = Date.now();
    const previousAttempt = Number(
      window.sessionStorage.getItem(CHUNK_RELOAD_KEY) || 0,
    );

    if (
      Number.isFinite(previousAttempt) &&
      previousAttempt > 0 &&
      now - previousAttempt < CHUNK_RELOAD_WINDOW
    ) {
      return false;
    }

    window.sessionStorage.setItem(CHUNK_RELOAD_KEY, String(now));
    window.location.reload();
    return true;
  } catch {
    return false;
  }
}

function clearChunkReloadFlag() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  } catch {
    // Penyimpanan browser dapat dinonaktifkan. Ini bukan error fatal.
  }
}

function removeErrorHead() {
  if (typeof document === "undefined") {
    return;
  }

  try {
    document
      .querySelectorAll('head [data-error-boundary="1"]')
      .forEach((element) => element.remove());
  } catch {
    // Jangan memunculkan error baru saat memulihkan halaman.
  }
}

function applyErrorHead() {
  if (typeof document === "undefined") {
    return;
  }

  try {
    removeErrorHead();

    for (const name of ["robots", "googlebot"]) {
      document
        .querySelectorAll(`head meta[name="${name}"]`)
        .forEach((element) => element.remove());

      const meta = document.createElement("meta");
      meta.setAttribute("name", name);
      meta.setAttribute("content", "noindex,nofollow");
      meta.setAttribute("data-error-boundary", "1");
      document.head.appendChild(meta);
    }

    document.title = "Terjadi kesalahan | SukaMuda";
  } catch {
    // Error handler tidak boleh menghasilkan error kedua.
  }
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };

    this.handlePopState = this.handlePopState.bind(this);
    this.handleReload = this.handleReload.bind(this);
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidMount() {
    // Jangan hapus CHUNK_RELOAD_KEY di sini. main.jsx akan menghapusnya
    // setelah jendela pengaman 60 detik agar tidak terjadi reload loop.
    if (typeof window !== "undefined") {
      window.addEventListener("popstate", this.handlePopState);
    }
  }

  componentDidCatch(error, errorInfo) {
    if (isChunkError(error) && reloadOnceForChunkError()) {
      return;
    }

    applyErrorHead();

    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      try {
        window.gtag("event", "exception", {
          description: String(
            error?.message || error || "Unknown React error",
          ).slice(0, 180),
          fatal: true,
          error_boundary: true,
          error_name: error?.name || "Error",
        });
      } catch {
        // Analytics tidak boleh mengganggu pemulihan aplikasi.
      }
    }

    if (import.meta.env.DEV) {
      console.error("ErrorBoundary menangkap error:", error, errorInfo);
    }
  }

  componentWillUnmount() {
    if (typeof window !== "undefined") {
      window.removeEventListener("popstate", this.handlePopState);
    }

    removeErrorHead();
  }

  handlePopState() {
    if (!this.state.hasError) {
      return;
    }

    removeErrorHead();

    this.setState({
      hasError: false,
      error: null,
    });
  }

  handleReload() {
    clearChunkReloadFlag();

    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main
        id="main-content"
        className="error-screen"
        role="alert"
        aria-live="assertive"
        aria-labelledby="error-title"
      >
        <h1 id="error-title">Terjadi kesalahan</h1>

        <p>
          Halaman gagal dimuat. Muat ulang halaman atau gunakan navigasi di
          bawah untuk melanjutkan.
        </p>

        <button
          type="button"
          className="error-screen__btn"
          onClick={this.handleReload}
        >
          Muat ulang halaman
        </button>

        <nav className="error-screen__nav" aria-label="Navigasi darurat">
          <a href="/">Beranda</a>
          <a href="/category/news">Berita</a>
          <a href="/category/school">Edukasi</a>
          <a href="/category/tech">Teknologi</a>
          <a href="/about">Tentang Kami</a>
          <a href="/help">Bantuan</a>
        </nav>

        {import.meta.env.DEV && this.state.error ? (
          <pre className="error-screen__debug">
            {String(this.state.error?.stack || this.state.error)}
          </pre>
        ) : null}
      </main>
    );
  }
}

export default ErrorBoundary;
