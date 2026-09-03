import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { FaLink } from "react-icons/fa";
import api, { ensureCsrfToken } from "../utils/axiosConfig";
import "./VideoReelForm.css";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PLATFORM_LABELS = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  youtube: "YouTube",
  unknown: "Platform tidak dikenal",
};

function initialForm(data) {
  return {
    title: String(data?.title || ""),
    description: String(data?.description || ""),
    video_url: String(data?.video_url || ""),
    platform: String(data?.platform || "auto"),
  };
}

function parseHttpUrl(value) {
  try {
    const url = new URL(String(value || "").trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function safeImageUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("blob:")) return raw;

  try {
    const base =
      typeof window === "undefined"
        ? "https://sukamuda.co.id"
        : window.location.origin;
    const url = new URL(raw, base);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : "";
  } catch {
    return "";
  }
}

function detectPlatform(value) {
  const url = parseHttpUrl(value);
  if (!url) return "unknown";

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (
    host === "instagram.com" ||
    host.endsWith(".instagram.com") ||
    host === "ig.me"
  )
    return "instagram";
  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "tiktok";
  if (
    host === "facebook.com" ||
    host.endsWith(".facebook.com") ||
    host === "fb.watch"
  )
    return "facebook";
  if (
    host === "youtube.com" ||
    host.endsWith(".youtube.com") ||
    host === "youtu.be"
  )
    return "youtube";
  return "unknown";
}

function apiErrorMessage(error) {
  const data = error?.response?.data;
  if (typeof data?.message === "string" && data.message.trim())
    return data.message.trim();

  if (data?.errors && typeof data.errors === "object") {
    const message = Object.values(data.errors)
      .flat()
      .find((item) => typeof item === "string" && item.trim());
    if (message) return message.trim();
  }

  if (error?.code === "ECONNABORTED") {
    return "Permintaan terlalu lama. Periksa koneksi lalu coba lagi.";
  }

  return "Terjadi kesalahan saat menyimpan video reel.";
}

function VideoReelForm({ onSuccess, initialData = null, isLoading = false }) {
  const uid = useId().replace(/:/g, "");
  const ids = {
    title: `reel-title-${uid}`,
    description: `reel-description-${uid}`,
    url: `reel-url-${uid}`,
    platform: `reel-platform-${uid}`,
    thumbnail: `reel-thumbnail-${uid}`,
    error: `reel-error-${uid}`,
  };

  const [formData, setFormData] = useState(() => initialForm(initialData));
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(() =>
    safeImageUrl(initialData?.thumbnail_url),
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const blobRef = useRef(null);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const mountedRef = useRef(true);

  const isEditing = Boolean(initialData?.id);
  const disabled = submitting || isLoading;
  const detectedPlatform = useMemo(
    () => detectPlatform(formData.video_url),
    [formData.video_url],
  );

  function revokeBlob() {
    if (!blobRef.current) return;
    URL.revokeObjectURL(blobRef.current);
    blobRef.current = null;
  }

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      revokeBlob();
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    revokeBlob();
    setFormData(initialForm(initialData));
    setThumbnailFile(null);
    setPreviewUrl(safeImageUrl(initialData?.thumbnail_url));
    setError("");
    setSuccess("");
    if (inputRef.current) inputRef.current.value = "";
  }, [initialData]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSuccess("");
  }

  function resetFileInput(input, keepExistingPreview = true) {
    revokeBlob();
    setThumbnailFile(null);
    setPreviewUrl(
      keepExistingPreview ? safeImageUrl(initialData?.thumbnail_url) : "",
    );
    if (input) input.value = "";
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    setError("");
    setSuccess("");

    if (!file) {
      resetFileInput(event.target);
      return;
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      resetFileInput(event.target);
      setError("Format tidak didukung. Gunakan JPG, PNG, atau WEBP.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      resetFileInput(event.target);
      setError("Ukuran gambar terlalu besar. Maksimal 2 MB.");
      return;
    }

    revokeBlob();
    const objectUrl = URL.createObjectURL(file);
    blobRef.current = objectUrl;
    setThumbnailFile(file);
    setPreviewUrl(objectUrl);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (disabled) return;

    setError("");
    setSuccess("");

    const title = formData.title.trim();
    const description = formData.description.trim();
    const videoUrl = parseHttpUrl(formData.video_url);

    if (!title) {
      setError("Judul tidak boleh kosong.");
      return;
    }

    if (!videoUrl) {
      setError("Masukkan URL video HTTP atau HTTPS yang valid.");
      return;
    }

    setSubmitting(true);

    try {
      await ensureCsrfToken();

      const payload = new FormData();
      payload.append("title", title);
      payload.append("description", description);
      payload.append("video_url", videoUrl.href);
      payload.append("platform", formData.platform || "auto");
      if (thumbnailFile)
        payload.append("thumbnail", thumbnailFile, thumbnailFile.name);

      const endpoint = isEditing
        ? `/api/video-reels/${encodeURIComponent(String(initialData.id))}`
        : "/api/video-reels";
      if (isEditing) payload.append("_method", "PUT");

      // Content-Type dan Authorization ditangani browser serta interceptor Axios.
      const response = await api.post(endpoint, payload);
      if (!mountedRef.current) return;

      setSuccess(
        isEditing
          ? "Video reel berhasil diperbarui."
          : "Video reel berhasil ditambahkan.",
      );

      if (!isEditing) {
        setFormData(initialForm(null));
        resetFileInput(inputRef.current, false);
      }

      timerRef.current = window.setTimeout(() => {
        if (mountedRef.current && typeof onSuccess === "function")
          onSuccess(response.data);
      }, 700);
    } catch (requestError) {
      if (mountedRef.current) setError(apiErrorMessage(requestError));
      if (import.meta.env.DEV)
        console.error("Gagal menyimpan video reel:", requestError);
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  }

  return (
    <div className="video-reel-form-container">
      <form
        className="video-reel-form"
        onSubmit={handleSubmit}
        noValidate
        aria-busy={disabled}
        aria-describedby={error ? ids.error : undefined}
      >
        <h3>{isEditing ? "Edit Video Reel" : "Tambah Video Reel Baru"}</h3>

        {error ? (
          <div id={ids.error} className="form-error" role="alert">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="form-success" role="status" aria-live="polite">
            {success}
          </div>
        ) : null}

        <div className="form-group">
          <label htmlFor={ids.title}>
            Judul <span aria-hidden="true">*</span>
          </label>
          <input
            id={ids.title}
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="Contoh: Tutorial React Hooks"
            maxLength={255}
            autoComplete="off"
            disabled={disabled}
            required
          />
          <span className="char-count">{formData.title.length}/255</span>
        </div>

        <div className="form-group">
          <label htmlFor={ids.description}>Deskripsi</label>
          <textarea
            id={ids.description}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Jelaskan video ini (opsional)"
            rows={3}
            maxLength={500}
            disabled={disabled}
          />
          <span className="char-count">{formData.description.length}/500</span>
        </div>

        <div className="form-group">
          <label htmlFor={ids.url}>
            URL Video <span aria-hidden="true">*</span>
          </label>
          <div className="url-input-wrapper">
            <FaLink className="icon" aria-hidden="true" focusable="false" />
            <input
              id={ids.url}
              name="video_url"
              type="url"
              inputMode="url"
              value={formData.video_url}
              onChange={handleChange}
              placeholder="https://instagram.com/..."
              maxLength={2048}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              disabled={disabled}
              required
            />
          </div>

          {formData.video_url ? (
            <div className="platform-preview" aria-live="polite">
              <span className="label">Platform terdeteksi:</span>
              <span className={`badge badge-${detectedPlatform}`}>
                {PLATFORM_LABELS[detectedPlatform]}
              </span>
            </div>
          ) : null}
        </div>

        <div className="form-row-reel">
          <div className="form-group">
            <label htmlFor={ids.platform}>Platform</label>
            <select
              id={ids.platform}
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              disabled={disabled}
            >
              <option value="auto">Deteksi otomatis</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="facebook">Facebook</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor={ids.thumbnail}>Thumbnail (opsional)</label>
            <input
              ref={inputRef}
              id={ids.thumbnail}
              name="thumbnail"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={disabled}
            />
            <small>JPG, PNG, atau WEBP. Maksimal 2 MB.</small>

            {previewUrl ? (
              <div className="image-preview">
                <img
                  src={previewUrl}
                  alt="Pratinjau thumbnail video"
                  width="200"
                  height="356"
                  decoding="async"
                  onError={() => setPreviewUrl("")}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={disabled}>
            {submitting ? "Menyimpan..." : isEditing ? "Perbarui" : "Tambahkan"}
          </button>
        </div>

        <div className="form-info">
          <p>
            <strong>Tips:</strong> Gunakan tautan langsung dari Instagram,
            TikTok, Facebook, atau YouTube.
          </p>
        </div>
      </form>
    </div>
  );
}

export default VideoReelForm;
