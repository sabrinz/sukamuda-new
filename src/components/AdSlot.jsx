import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import "./AdSlot.css";

const ADSENSE_MIN_WIDTH = 50;
const ADSENSE_ROOT_MARGIN = "300px 0px";
const ADSENSE_RETRY_INTERVAL = 500;
const ADSENSE_MAX_WAIT = 15000;
const CONSENT_KEY = "sukamuda_consent";
const CONSENT_EVENT = "sukamuda:consent";
const VALID_MODES = new Set(["placeholder", "image", "adsense"]);
const VALID_TYPES = new Set(["horizontal", "vertical"]);

const isLocalHost = () => {
  if (typeof window === "undefined") return false;
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
};

const getStoredConsent = () => {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
};

const getConsentFromEvent = (event) => {
  const granted = event?.detail?.granted;
  return typeof granted === "boolean" ? (granted ? "granted" : "denied") : null;
};

const getElementWidth = (element) => {
  if (typeof window === "undefined" || !element) return 0;

  try {
    const style = window.getComputedStyle(element);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.opacity === "0"
    ) {
      return 0;
    }

    const width = element.getBoundingClientRect().width;
    return Number.isFinite(width) ? Math.floor(width) : 0;
  } catch {
    return 0;
  }
};

const getSafeLink = (value) => {
  const raw = String(value || "").trim();
  if (!raw || raw === "#") return "#";

  try {
    const base =
      typeof window === "undefined"
        ? "https://sukamuda.co.id"
        : window.location.origin;
    const url = new URL(raw, base);

    if (url.protocol !== "http:" && url.protocol !== "https:") return "#";
    return raw;
  } catch {
    return "#";
  }
};

const AdSlot = ({
  type = "horizontal",
  mode = "placeholder",
  label = "Iklan",
  imageUrl = "",
  linkUrl = "#",
  adClient = "",
  adSlot = "",
}) => {
  const boxRef = useRef(null);
  const insRef = useRef(null);
  const pushedKeyRef = useRef("");
  const [imageState, setImageState] = useState({
    src: "",
    status: "idle",
  });

  const safeType = VALID_TYPES.has(type) ? type : "horizontal";
  const requestedMode = VALID_MODES.has(mode) ? mode : "placeholder";
  const activeMode = isLocalHost() ? "placeholder" : requestedMode;
  const safeLink = useMemo(() => getSafeLink(linkUrl), [linkUrl]);
  const adKey = `${adClient}:${adSlot}:${safeType}`;
  const imageLoaded =
    imageState.src === imageUrl && imageState.status === "loaded";
  const imageFailed =
    imageState.src === imageUrl && imageState.status === "failed";

  useEffect(() => {
    if (
      activeMode !== "adsense" ||
      typeof window === "undefined" ||
      !adClient ||
      !adSlot ||
      pushedKeyRef.current === adKey
    ) {
      return undefined;
    }

    let cancelled = false;
    let consent = getStoredConsent();
    let nearViewport = typeof window.IntersectionObserver === "undefined";
    let resizeObserver = null;
    let intersectionObserver = null;
    let retryTimer = null;
    let timeoutTimer = null;
    let frameOne = null;
    let frameTwo = null;

    const stopRetryWindow = () => {
      if (retryTimer !== null) {
        window.clearInterval(retryTimer);
        retryTimer = null;
      }
      if (timeoutTimer !== null) {
        window.clearTimeout(timeoutTimer);
        timeoutTimer = null;
      }
    };

    const cleanup = () => {
      stopRetryWindow();
      if (frameOne !== null) window.cancelAnimationFrame(frameOne);
      if (frameTwo !== null) window.cancelAnimationFrame(frameTwo);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener(CONSENT_EVENT, handleConsent);
    };

    const canPush = () =>
      !cancelled &&
      pushedKeyRef.current !== adKey &&
      consent === "granted" &&
      nearViewport;

    const beginRetryWindow = () => {
      if (!canPush() || retryTimer !== null) return;

      retryTimer = window.setInterval(tryPush, ADSENSE_RETRY_INTERVAL);
      timeoutTimer = window.setTimeout(stopRetryWindow, ADSENSE_MAX_WAIT);
    };

    const tryPush = () => {
      if (!canPush()) return;

      const box = boxRef.current;
      const ins = insRef.current;
      if (!box || !ins || getElementWidth(box) < ADSENSE_MIN_WIDTH) {
        beginRetryWindow();
        return;
      }

      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        pushedKeyRef.current = adKey;
        cleanup();
      } catch (error) {
        beginRetryWindow();
        if (import.meta.env.DEV) {
          console.warn("[AdSlot] AdSense belum siap; mencoba kembali.", error);
        }
      }
    };

    function handleConsent(event) {
      if (cancelled) return;
      const nextConsent = getConsentFromEvent(event);
      if (!nextConsent) return;

      consent = nextConsent;
      if (consent === "granted") {
        tryPush();
        beginRetryWindow();
      } else {
        stopRetryWindow();
      }
    }

    const startObservers = () => {
      if (cancelled || pushedKeyRef.current === adKey) return;
      const target = boxRef.current || insRef.current;
      if (!target) return;

      if (typeof window.ResizeObserver !== "undefined") {
        resizeObserver = new window.ResizeObserver(tryPush);
        resizeObserver.observe(target);
      }

      if (typeof window.IntersectionObserver !== "undefined") {
        intersectionObserver = new window.IntersectionObserver(
          (entries) => {
            nearViewport = entries.some((entry) => entry.isIntersecting);
            if (nearViewport) {
              tryPush();
              beginRetryWindow();
            } else {
              stopRetryWindow();
            }
          },
          {
            root: null,
            rootMargin: ADSENSE_ROOT_MARGIN,
            threshold: 0,
          },
        );
        intersectionObserver.observe(target);
      }

      tryPush();
      beginRetryWindow();
    };

    window.addEventListener(CONSENT_EVENT, handleConsent);
    frameOne = window.requestAnimationFrame(() => {
      frameTwo = window.requestAnimationFrame(startObservers);
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [activeMode, adClient, adKey, adSlot]);

  const sizeLabel = safeType === "horizontal" ? "728 × 90" : "160 × 250";
  const className = `ad-slot-box ${safeType}`;

  if (activeMode === "placeholder") {
    return (
      <div className={`${className} ad-placeholder`} aria-label={label}>
        <span className="ad-placeholder-icon" aria-hidden="true">
          ◻
        </span>
        <span className="ad-placeholder-label">{label}</span>
        <span className="ad-placeholder-size">{sizeLabel}</span>
      </div>
    );
  }

  if (activeMode === "image") {
    if (!imageUrl || imageFailed) return null;

    return (
      <div className={`${className} ad-image`}>
        <a
          className={imageLoaded ? "imgLoaded" : undefined}
          href={safeLink}
          target="_blank"
          rel="noopener noreferrer sponsored"
          aria-label={label}
        >
          <img
            src={imageUrl}
            alt={label}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageState({ src: imageUrl, status: "loaded" })}
            onError={() => setImageState({ src: imageUrl, status: "failed" })}
          />
        </a>
      </div>
    );
  }

  if (activeMode === "adsense") {
    if (!adClient || !adSlot) {
      if (import.meta.env.DEV) {
        console.warn("[AdSlot] adClient dan adSlot wajib diisi.");
      }
      return null;
    }

    return (
      <aside
        ref={boxRef}
        className={`${className} ad-adsense`}
        aria-label={label}
      >
        <ins
          key={adKey}
          ref={insRef}
          className="adsbygoogle"
          style={{ display: "block", width: "100%" }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </aside>
    );
  }

  return null;
};

export default memo(AdSlot);
