import React, { memo, useEffect, useMemo, useState } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaLink,
  FaPlay,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";
import "./VideoReels.css";

const SITE_URL = "https://sukamuda.co.id";

const PLATFORM_CONFIG = Object.freeze({
  instagram: {
    label: "Instagram",
    color: "#e4405f",
    Icon: FaInstagram,
  },
  tiktok: {
    label: "TikTok",
    color: "#111111",
    Icon: FaTiktok,
  },
  facebook: {
    label: "Facebook",
    color: "#1877f2",
    Icon: FaFacebook,
  },
  youtube: {
    label: "YouTube",
    color: "#ff0000",
    Icon: FaYoutube,
  },
});

function getPlatformConfig(platform) {
  const key = String(platform || "")
    .trim()
    .toLowerCase();

  return (
    PLATFORM_CONFIG[key] || {
      label: key || "Platform",
      color: "#666666",
      Icon: FaLink,
    }
  );
}

function getInitial(name) {
  const value = String(name || "").trim();
  return value ? value.charAt(0).toUpperCase() : "?";
}

function getSafeUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  try {
    const base =
      typeof window !== "undefined" ? window.location.origin : SITE_URL;
    const url = new URL(raw, base);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "";
    }

    return url.href;
  } catch {
    return "";
  }
}

const PlatformIcon = memo(function PlatformIcon({ platform, size = 15 }) {
  const { Icon, color } = getPlatformConfig(platform);

  return (
    <Icon
      aria-hidden="true"
      focusable="false"
      style={{ fontSize: `${size}px`, color }}
    />
  );
});

const VideoReelCard = memo(function VideoReelCard({ reel, index = 0 }) {
  const platform = String(reel?.platform || "")
    .trim()
    .toLowerCase();
  const { label: platformLabel } = getPlatformConfig(platform);
  const title = String(reel?.title || "Video").trim() || "Video";
  const description = String(reel?.description || "").trim();
  const videoUrl = getSafeUrl(reel?.video_url);
  const thumbnailUrl = getSafeUrl(reel?.thumbnail_url);
  const userName = String(reel?.user?.name || "").trim();
  const profilePhotoUrl = getSafeUrl(
    reel?.user?.profile_photo_url ||
      reel?.user?.avatar ||
      reel?.user?.photo ||
      reel?.user?.image ||
      "",
  );

  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    setThumbnailFailed(false);
  }, [thumbnailUrl]);

  useEffect(() => {
    setAvatarFailed(false);
  }, [profilePhotoUrl]);

  const showThumbnail = Boolean(thumbnailUrl) && !thumbnailFailed;
  const showAvatar = Boolean(profilePhotoUrl) && !avatarFailed;
  const imageLoading = index === 0 ? "eager" : "lazy";
  const ariaLabel = videoUrl
    ? `Tonton di ${platformLabel}: ${title} (terbuka di tab baru)`
    : `${platformLabel}: ${title}`;

  const cardContent = (
    <>
      <div className="vr-thumb">
        {showThumbnail ? (
          <img
            src={thumbnailUrl}
            alt=""
            className="vr-thumb-img"
            loading={imageLoading}
            fetchPriority={index === 0 ? "high" : "auto"}
            decoding="async"
            width="172"
            height="305"
            referrerPolicy="strict-origin-when-cross-origin"
            onError={() => setThumbnailFailed(true)}
          />
        ) : null}

        <div
          className="vr-thumb-placeholder"
          aria-hidden="true"
          style={{ display: showThumbnail ? "none" : "flex" }}
        >
          <PlatformIcon platform={platform} size={28} />
        </div>

        <div className="vr-thumb-gradient" aria-hidden="true" />

        <div
          className="vr-platform-badge"
          title={platformLabel}
          aria-hidden="true"
        >
          <PlatformIcon platform={platform} size={12} />
        </div>

        <div
          className={`vr-play${videoUrl ? "" : " vr-play--static"}`}
          aria-hidden="true"
        >
          <FaPlay focusable="false" />
        </div>

        {videoUrl ? (
          <div className="vr-hover-overlay" aria-hidden="true">
            <span>Tonton di {platformLabel}</span>
            <FaPlay focusable="false" />
          </div>
        ) : null}
      </div>

      <div className="vr-info">
        <h3 className="vr-title" title={title}>
          {title}
        </h3>

        {description ? (
          <p className="vr-desc" title={description}>
            {description}
          </p>
        ) : null}

        <div className="vr-spacer" aria-hidden="true" />

        {userName ? (
          <div className="vr-author">
            <div className="vr-author-avatar-wrap" aria-hidden="true">
              {showAvatar ? (
                <img
                  src={profilePhotoUrl}
                  alt=""
                  className="vr-author-avatar"
                  loading="lazy"
                  decoding="async"
                  width="18"
                  height="18"
                  referrerPolicy="strict-origin-when-cross-origin"
                  onError={() => setAvatarFailed(true)}
                />
              ) : null}

              <div
                className="vr-author-fallback"
                style={{ display: showAvatar ? "none" : "flex" }}
              >
                {getInitial(userName)}
              </div>
            </div>

            <span className="vr-author-name" title={userName}>
              {userName}
            </span>
          </div>
        ) : null}
      </div>
    </>
  );

  if (!videoUrl) {
    return (
      <article className="vr-card vr-card--disabled" aria-label={ariaLabel}>
        {cardContent}
      </article>
    );
  }

  return (
    <a
      className="vr-card"
      href={videoUrl}
      target="_blank"
      rel="noopener noreferrer nofollow"
      referrerPolicy="strict-origin-when-cross-origin"
      aria-label={ariaLabel}
    >
      {cardContent}
    </a>
  );
});

function VideoReels({ reels = [] }) {
  const safeReels = useMemo(() => {
    if (!Array.isArray(reels)) return [];

    return reels.filter(
      (reel) => reel && typeof reel === "object" && !Array.isArray(reel),
    );
  }, [reels]);

  if (safeReels.length === 0) {
    return (
      <div className="vr-empty" role="status" aria-live="polite">
        <FaPlay
          aria-hidden="true"
          focusable="false"
          className="vr-empty-icon"
        />
        <p>Belum ada video reels yang tersedia.</p>
      </div>
    );
  }

  return (
    <section className="vr-container" aria-label="Video reels">
      <div
        className="vr-scroll"
        role="region"
        tabIndex={0}
        aria-label="Daftar video reels yang dapat digeser"
      >
        {safeReels.map((reel, index) => (
          <VideoReelCard
            key={String(reel?.id ?? reel?.video_url ?? `reel-${index}`)}
            reel={reel}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

export default memo(VideoReels);
