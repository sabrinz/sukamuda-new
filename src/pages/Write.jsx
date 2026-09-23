import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { Helmet } from "react-helmet-async";

import Quill from "quill";
import "quill/dist/quill.snow.css";

import DOMPurify from "dompurify";

import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "../context/AuthContext";

import axios, { ensureCsrfToken } from "../utils/axiosConfig";

import "./Write.css";

/* =========================================================
   SITE
   ========================================================= */

const SITE_URL = "https://sukamuda.co.id";
const SITE_NAME = "SukaMuda";

/* =========================================================
   LIMITS
   ========================================================= */

const MAX_THUMBNAIL_SIZE = 1 * 1024 * 1024;
const MAX_EDITOR_IMAGE_SIZE = 1 * 1024 * 1024;

const MAX_TITLE_LENGTH = 180;
const MAX_DESCRIPTION_LENGTH = 300;
const MAX_CAPTION_LENGTH = 200;
const MAX_TAG_LENGTH = 50;

const MIN_TAGS = 2;
const MAX_TAGS = 10;

/* =========================================================
   AUTOSAVE
   ========================================================= */

const AUTOSAVE_DELAY = 500;
const AUTOSAVE_STORAGE_PREFIX = "sukamuda_write_autosave";

/* =========================================================
   ALLOWED IMAGE TYPES
   ========================================================= */

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/* =========================================================
   CATEGORIES
   ========================================================= */

const categories = [
  {
    slug: "school",
    label: "School",
  },
  {
    slug: "college",
    label: "College",
  },
  {
    slug: "general",
    label: "General",
  },
  {
    slug: "style",
    label: "Style",
  },
  {
    slug: "culinary",
    label: "Culinary",
  },
  {
    slug: "traveling",
    label: "Traveling",
  },
  {
    slug: "sport",
    label: "Sport & E-Sport",
  },
  {
    slug: "music",
    label: "Music & Film",
  },
  {
    slug: "otomotif",
    label: "Otomotif",
  },
  {
    slug: "science",
    label: "Science",
  },
  {
    slug: "health",
    label: "Health",
  },
  {
    slug: "tech",
    label: "Tech",
  },
  {
    slug: "podcast",
    label: "Podcast",
  },
];

/* =========================================================
   FORM STATE
   ========================================================= */

const initialState = {
  title: "",
  category: "",
  teaser: "",
  tags: "",
  thumbnailCaption: "",
  audioLink: "",
  videoLink: "",
};

function formReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };

    case "SET_FORM":
      return {
        ...state,
        ...action.value,
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

/* =========================================================
   TEXT HELPERS
   ========================================================= */

const normalizeText = (value) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

/* =========================================================
   HTML HELPERS
   ========================================================= */

const getPlainTextFromHtml = (html) => {
  const clean = DOMPurify.sanitize(String(html ?? ""), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });

  return clean.replace(/\s+/g, " ").trim();
};

/* =========================================================
   CONTINUOUS ORDERED LIST NUMBERING
   ========================================================= */

const syncOrderedListNumbers = (root) => {
  if (!root) return;

  let nextNumber = 1;

  Array.from(root.children).forEach((block) => {
    if (block.tagName !== "OL") return;

    const orderedItems = Array.from(block.children).filter((item) => {
      if (item.tagName !== "LI") return false;

      const listType = item.getAttribute("data-list");
      const isIndented = Array.from(item.classList).some((className) =>
        /^ql-indent-\d+$/.test(className),
      );

      return !isIndented && (!listType || listType === "ordered");
    });

    if (orderedItems.length === 0) return;

    const start = nextNumber;

    if (block.getAttribute("start") !== String(start)) {
      block.setAttribute("start", String(start));
    }

    const counterReset = `list-0 ${Math.max(0, start - 1)}`;

    if (block.style.counterReset !== counterReset) {
      block.style.counterReset = counterReset;
    }

    orderedItems.forEach((item) => {
      const number = String(nextNumber);

      if (item.getAttribute("data-continuous-number") !== number) {
        item.setAttribute("data-continuous-number", number);
      }

      const listUi = item.querySelector(":scope > .ql-ui");

      if (
        listUi &&
        listUi.getAttribute("data-continuous-number") !== number
      ) {
        listUi.setAttribute("data-continuous-number", number);
      }

      nextNumber += 1;
    });
  });
};

const sanitizeArticleHtml = (html) =>
  DOMPurify.sanitize(String(html ?? ""), {
    ADD_ATTR: ["style", "target", "rel", "loading", "decoding"],

    FORBID_TAGS: [
      "script",
      "iframe",
      "object",
      "embed",
      "style",
      "form",
      "input",
      "textarea",
      "button",
      "select",
      "option",
      "meta",
      "link",
      "base",
    ],

    FORBID_ATTR: [
      "onerror",
      "onclick",
      "onload",
      "onmouseover",
      "onmouseenter",
      "onmouseleave",
      "onfocus",
      "onblur",
      "onkeydown",
      "onkeyup",
      "onkeypress",
      "oninput",
      "onsubmit",
      "ondrop",
      "ondragover",
    ],
  });

/* =========================================================
   TAG HELPERS
   ========================================================= */

const normalizeTags = (value) => {
  const source = Array.isArray(value) ? value : String(value ?? "").split(",");

  const normalized = source
    .map((tag) =>
      normalizeText(tag).replace(/^#+/, "").slice(0, MAX_TAG_LENGTH),
    )
    .filter(Boolean);

  return [...new Set(normalized)];
};

/* =========================================================
   IMAGE FILE VALIDATION
   ========================================================= */

const validateImageFile = (file, maxSize) => {
  if (!file) {
    return {
      valid: false,
      message: "Tidak ada file.",
    };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      message: "Format gambar tidak didukung. Gunakan JPG, PNG, atau WEBP.",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      message: `Ukuran gambar maksimal ${Math.round(
        maxSize / 1024 / 1024,
      )} MB.`,
    };
  }

  return {
    valid: true,
    message: "",
  };
};

/* =========================================================
   SPOTIFY
   ========================================================= */

const getSpotifyEmbedUrl = (url) => {
  if (!url || typeof url !== "string") {
    return "";
  }

  try {
    const normalized = url.trim();

    if (!normalized) {
      return "";
    }

    const allowedTypes = [
      "track",
      "episode",
      "album",
      "playlist",
      "show",
      "artist",
    ];

    if (normalized.startsWith("spotify:")) {
      const parts = normalized.split(":").filter(Boolean);

      if (parts.length >= 3 && allowedTypes.includes(parts[1]) && parts[2]) {
        return (
          "https://open.spotify.com/embed/" +
          encodeURIComponent(parts[1]) +
          "/" +
          encodeURIComponent(parts[2])
        );
      }

      return "";
    }

    const parsed = new URL(normalized);

    const host = parsed.hostname.toLowerCase();

    if (host !== "open.spotify.com" && !host.endsWith(".spotify.com")) {
      return "";
    }

    const parts = parsed.pathname.split("/").filter(Boolean);

    if (parts[0] === "embed") {
      parts.shift();
    }

    if (parts.length < 2 || !allowedTypes.includes(parts[0])) {
      return "";
    }

    return (
      "https://open.spotify.com/embed/" +
      encodeURIComponent(parts[0]) +
      "/" +
      encodeURIComponent(parts[1])
    );
  } catch {
    return "";
  }
};

/* =========================================================
   YOUTUBE ID
   ========================================================= */

const getYoutubeVideoId = (url) => {
  if (!url || typeof url !== "string") {
    return "";
  }

  try {
    const parsed = new URL(url.trim());

    const host = parsed.hostname.toLowerCase();

    if (host === "youtu.be" || host.endsWith(".youtu.be")) {
      return parsed.pathname
        .replace(/^\/+/, "")
        .split("/")[0]
        .split("?")[0]
        .split("#")[0]
        .trim();
    }

    const allowedHosts = [
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "youtube-nocookie.com",
      "www.youtube-nocookie.com",
    ];

    if (!allowedHosts.includes(host)) {
      return "";
    }

    if (parsed.pathname === "/watch") {
      return (
        parsed.searchParams.get("v")?.split("&")[0].split("#")[0].trim() || ""
      );
    }

    const parts = parsed.pathname.split("/").filter(Boolean);

    if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") {
      return parts[1]?.split("?")[0].split("#")[0].trim() || "";
    }

    return "";
  } catch {
    return "";
  }
};

/* =========================================================
   YOUTUBE EMBED
   ========================================================= */

const getYoutubeEmbedUrl = (url) => {
  const videoId = getYoutubeVideoId(url);

  if (!videoId) {
    return "";
  }

  return (
    "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(videoId)
  );
};

/* =========================================================
   YOUTUBE THUMBNAIL
   ========================================================= */

const getYoutubeThumbnailUrl = (url) => {
  const videoId = getYoutubeVideoId(url);

  if (!videoId) {
    return "";
  }

  return (
    "https://img.youtube.com/vi/" +
    encodeURIComponent(videoId) +
    "/hqdefault.jpg"
  );
};

/* =========================================================
   PODCAST CONTENT
   ========================================================= */

const buildPodcastContentHtml = (form) => {
  const description = normalizeText(form.teaser);

  const spotifyUrl = normalizeText(form.audioLink);

  const youtubeUrl = normalizeText(form.videoLink);

  const pieces = [];

  if (description) {
    pieces.push(`<p>${escapeHtml(description)}</p>`);
  }

  if (spotifyUrl) {
    pieces.push(
      `<p><strong>Spotify:</strong> <a href="${escapeHtml(
        spotifyUrl,
      )}" target="_blank" rel="noopener noreferrer">Dengarkan podcast</a></p>`,
    );
  }

  if (youtubeUrl) {
    pieces.push(
      `<p><strong>YouTube:</strong> <a href="${escapeHtml(
        youtubeUrl,
      )}" target="_blank" rel="noopener noreferrer">Tonton podcast</a></p>`,
    );
  }

  if (pieces.length === 0) {
    return "<p>Podcast SukaMuda.</p>";
  }

  return sanitizeArticleHtml(pieces.join(""));
};

/* =========================================================
   CUSTOM QUILL IMAGE BLOT
   ========================================================= */

const BlockEmbed = Quill.import("blots/block/embed");

class ImageCaptionBlot extends BlockEmbed {
  static create(value = {}) {
    const node = super.create();

    const data = value && typeof value === "object" ? value : {};

    const align =
      data.align === "left" || data.align === "right" ? data.align : "center";

    let textAlign = "center";
    let margin = "0 auto";

    if (align === "left") {
      textAlign = "left";
      margin = "0 auto 0 0";
    }

    if (align === "right") {
      textAlign = "right";
      margin = "0 0 0 auto";
    }

    node.style.margin = "12px 0";

    node.style.textAlign = textAlign;

    const image = document.createElement("img");

    image.src = String(data.url || "");

    image.alt = normalizeText(data.caption) || "Gambar artikel";

    const rawWidth = data.width || "100%";

    const width =
      typeof rawWidth === "number" ? `${rawWidth}px` : String(rawWidth);

    image.style.width = width;

    image.style.height = "auto";

    image.style.display = "block";

    image.style.margin = margin;

    image.style.maxWidth = "100%";

    image.style.borderRadius = "8px";

    image.setAttribute("loading", "lazy");

    image.setAttribute("decoding", "async");

    node.appendChild(image);

    const captionText = normalizeText(data.caption);

    if (captionText) {
      const caption = document.createElement("figcaption");

      caption.innerText = captionText;

      caption.style.marginTop = "8px";

      caption.style.color = "#6b7280";

      caption.style.fontSize = "13px";

      caption.style.fontStyle = "italic";

      caption.style.width = width;

      caption.style.maxWidth = "100%";

      caption.style.boxSizing = "border-box";

      caption.style.display = "block";

      caption.style.margin = margin;

      caption.style.textAlign = textAlign;

      node.appendChild(caption);
    }

    return node;
  }

  static value(node) {
    const image = node.querySelector("img");

    const caption = node.querySelector("figcaption");

    let align = "center";

    if (node.style.textAlign === "left") {
      align = "left";
    }

    if (node.style.textAlign === "right") {
      align = "right";
    }

    return {
      url: image?.getAttribute("src") || "",

      caption: caption?.innerText || "",

      width: image?.style.width || "100%",

      align,
    };
  }
}

ImageCaptionBlot.blotName = "imageCaption";

ImageCaptionBlot.tagName = "figure";

ImageCaptionBlot.className = "ql-image-caption";

Quill.register(ImageCaptionBlot);

/* =========================================================
   WRITE
   ========================================================= */

function Write() {
  const navigate = useNavigate();

  const location = useLocation();

  const queryClient = useQueryClient();

  const { user } = useAuth();

  const editorRef = useRef(null);

  const quillRef = useRef(null);

  const fileInputRef = useRef(null);

  const currentSelectionRef = useRef(null);

  const mountedRef = useRef(true);

  const submittingRef = useRef(false);

  const editData = location.state?.draft || null;

  const returnPath = location.state?.returnPath || "/profile";

  const isAdmin = user?.role === "admin";

  const isPodcast = formCategoryFromState(location.state?.draft) === "podcast";

  const [form, dispatch] = useReducer(formReducer, initialState);

  const autosaveTimerRef = useRef(null);
  const restoringAutosaveRef = useRef(false);
  const autosaveRestoredRef = useRef(false);
  const autosaveStorageKey = `${AUTOSAVE_STORAGE_PREFIX}_${user?.id || user?.email || "guest"}`;

  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [thumbnailFile, setThumbnailFile] = useState(null);

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const [showModal, setShowModal] = useState(false);

  const [modalType, setModalType] = useState("publish");
  
  const [relatedModalOpen, setRelatedModalOpen] = useState(false);

  const [relatedArticles, setRelatedArticles] = useState([]);

  const [relatedLoading, setRelatedLoading] = useState(false);

  const [relatedError, setRelatedError] = useState(null);

  const [insertImageModalOpen, setInsertImageModalOpen] = useState(false);

  const [insertImageBase64, setInsertImageBase64] = useState(null);

  const [insertImageCaption, setInsertImageCaption] = useState("");

  const [insertImageAlign, setInsertImageAlign] = useState("center");

  const [insertImageWidth, setInsertImageWidth] = useState("100%");

  /* =======================================================
     ACTUAL PODCAST STATE
     ======================================================= */

  const actualIsPodcast = form.category === "podcast";

  /* =======================================================
     AVAILABLE CATEGORY
     ======================================================= */

  const availableCategories = categories.filter(
    (item) => item.slug !== "podcast" || isAdmin || form.category === "podcast",
  );

  /* =======================================================
     MOUNT STATE
     ======================================================= */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* =======================================================
     RESTORE AUTOSAVE
     ======================================================= */

  useEffect(() => {
    if (editData?.id || autosaveRestoredRef.current) {
      return undefined;
    }

    autosaveRestoredRef.current = true;
    restoringAutosaveRef.current = true;

    try {
      const raw = window.localStorage.getItem(autosaveStorageKey);

      if (!raw) {
        restoringAutosaveRef.current = false;
        return undefined;
      }

      const saved = JSON.parse(raw);

      if (saved?.form && typeof saved.form === "object") {
        dispatch({
          type: "SET_FORM",
          value: {
            title: String(saved.form.title ?? ""),
            category: String(saved.form.category ?? ""),
            teaser: String(saved.form.teaser ?? ""),
            tags: String(saved.form.tags ?? ""),
            thumbnailCaption: String(saved.form.thumbnailCaption ?? ""),
            audioLink: String(saved.form.audioLink ?? ""),
            videoLink: String(saved.form.videoLink ?? ""),
          },
        });
      }

      if (saved?.thumbnailPreview) {
        setThumbnailPreview(saved.thumbnailPreview);
      }

      if (saved?.content && typeof saved.content === "string") {
        const restoreContent = () => {
          if (!quillRef.current) return false;
          const cleanContent = sanitizeArticleHtml(saved.content);
          if (cleanContent) {
            quillRef.current.clipboard.dangerouslyPasteHTML(cleanContent, "silent");
            quillRef.current.setSelection(
              Math.max(0, quillRef.current.getLength() - 1),
              0,
              "silent",
            );
          }
          return true;
        };

        if (!restoreContent()) {
          requestAnimationFrame(restoreContent);
        }
      }
    } catch (error) {
      console.warn("Gagal memulihkan autosave artikel:", error);
    } finally {
      restoringAutosaveRef.current = false;
    }

    return undefined;
  }, [autosaveStorageKey, editData?.id]);

  /* =======================================================
     AUTOSAVE FORM + QUILL
     ======================================================= */

  const saveAutosave = useCallback(() => {
    if (editData?.id || restoringAutosaveRef.current) return;

    try {
      const content = sanitizeArticleHtml(
        quillRef.current?.root?.innerHTML || "",
      );

      window.localStorage.setItem(
        autosaveStorageKey,
        JSON.stringify({
          version: 1,
          savedAt: new Date().toISOString(),
          form: { ...form },
          content,
          thumbnailPreview: thumbnailPreview || null,
        }),
      );
    } catch (error) {
      console.warn("Autosave artikel tidak dapat disimpan:", error);
    }
  }, [autosaveStorageKey, editData?.id, form, thumbnailPreview]);

  useEffect(() => {
    if (editData?.id || restoringAutosaveRef.current) return undefined;

    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = window.setTimeout(saveAutosave, AUTOSAVE_DELAY);

    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [form, thumbnailPreview, saveAutosave, editData?.id]);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill || editData?.id) return undefined;

    const handleQuillChange = () => {
      if (restoringAutosaveRef.current) return;

      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
      }

      autosaveTimerRef.current = window.setTimeout(saveAutosave, AUTOSAVE_DELAY);
    };

    quill.on("text-change", handleQuillChange);
    return () => quill.off("text-change", handleQuillChange);
  }, [saveAutosave, editData?.id]);

  const clearAutosave = useCallback(() => {
    try {
      window.localStorage.removeItem(autosaveStorageKey);
    } catch (error) {
      console.warn("Gagal menghapus autosave artikel:", error);
    }
  }, [autosaveStorageKey]);

  /* =======================================================
     RESET IMAGE MODAL
     ======================================================= */

  const resetImageModal = useCallback(() => {
    setInsertImageModalOpen(false);

    setInsertImageBase64(null);

    setInsertImageCaption("");

    setInsertImageAlign("center");

    setInsertImageWidth("100%");

    currentSelectionRef.current = null;

    const input = document.getElementById("insert-image-file");

    if (input) {
      input.value = "";
    }
  }, []);

  /* =======================================================
     IMAGE VALIDATION
     ======================================================= */

  const validateSelectedImage = useCallback(
    (file, maxSize) => validateImageFile(file, maxSize),
    [],
  );

  /* =======================================================
     THUMBNAIL PROCESS
     ======================================================= */

  const processThumbnailFile = useCallback(
    (file) => {
      const validation = validateSelectedImage(file, MAX_THUMBNAIL_SIZE);

      if (!validation.valid) {
        setErrors((previous) => ({
          ...previous,
          image: validation.message,
        }));

        return false;
      }

      setThumbnailFile(file);

      setErrors((previous) => ({
        ...previous,
        image: null,
      }));

      const reader = new FileReader();

      reader.onload = (event) => {
        if (!mountedRef.current) {
          return;
        }

        setThumbnailPreview(event.target?.result || null);
      };

      reader.onerror = () => {
        if (!mountedRef.current) {
          return;
        }

        setErrors((previous) => ({
          ...previous,
          image: "Gagal membaca file thumbnail.",
        }));
      };

      reader.readAsDataURL(file);

      return true;
    },
    [validateSelectedImage],
  );

  /* =======================================================
     THUMBNAIL INPUT
     ======================================================= */

  const handleThumbnailChange = useCallback(
    (event) => {
      const file = event.target?.files?.[0];

      if (!file) {
        return;
      }

      processThumbnailFile(file);
    },
    [processThumbnailFile],
  );

  /* =======================================================
     THUMBNAIL DROP
     ======================================================= */

  const handleThumbnailDrop = useCallback(
    (event) => {
      event.preventDefault();

      const file = event.dataTransfer?.files?.[0];

      if (file) {
        processThumbnailFile(file);
      }
    },
    [processThumbnailFile],
  );

  /* =======================================================
     INPUT CHANGE
     ======================================================= */

  const handleInputChange = useCallback(
    (field, value) => {
      let nextValue = value;

      if (field === "title") {
        nextValue = String(value ?? "").slice(0, MAX_TITLE_LENGTH);
      }

      if (field === "teaser") {
        nextValue = String(value ?? "").slice(0, MAX_DESCRIPTION_LENGTH);
      }

      if (field === "thumbnailCaption") {
        nextValue = String(value ?? "").slice(0, MAX_CAPTION_LENGTH);
      }

      dispatch({
        type: "SET_FIELD",
        field,
        value: nextValue,
      });

      setErrors((previous) => {
        if (!previous[field]) {
          return previous;
        }

        return {
          ...previous,
          [field]: null,
        };
      });

      if (field === "videoLink" && isAdmin && !thumbnailFile) {
        const thumbnail = getYoutubeThumbnailUrl(nextValue);

        if (thumbnail) {
          setThumbnailPreview(thumbnail);
        }
      }
    },
    [isAdmin, thumbnailFile],
  );

  /* =======================================================
     CATEGORY CHANGE
     ======================================================= */

  const handleCategoryChange = useCallback(
    (event) => {
      const currentScrollY = window.scrollY;

      const nextCategory = event.target.value;

      handleInputChange("category", nextCategory);

      if (nextCategory !== "podcast") {
        if (form.audioLink) {
          handleInputChange("audioLink", "");
        }

        if (form.videoLink) {
          handleInputChange("videoLink", "");
        }

        setErrors((previous) => ({
          ...previous,
          audioLink: null,
          videoLink: null,
        }));
      }

      requestAnimationFrame(() => {
        window.scrollTo(0, currentScrollY);
      });
    },
    [form.audioLink, form.videoLink, handleInputChange],
  );

  /* =======================================================
     IMAGE MODAL FILE
     ======================================================= */

  const handleModalFileChange = useCallback(
    (event) => {
      const file = event.target?.files?.[0];

      if (!file) {
        setInsertImageBase64(null);

        return;
      }

      const validation = validateSelectedImage(file, MAX_EDITOR_IMAGE_SIZE);

      if (!validation.valid) {
        window.alert(validation.message);

        event.target.value = "";

        setInsertImageBase64(null);

        return;
      }

      const reader = new FileReader();

      reader.onload = (loadEvent) => {
        if (mountedRef.current) {
          setInsertImageBase64(loadEvent.target?.result || null);
        }
      };

      reader.onerror = () => {
        window.alert("Gagal membaca gambar.");
      };

      reader.readAsDataURL(file);
    },
    [validateSelectedImage],
  );

  /* =======================================================
     RESIZE IMAGE
     ======================================================= */

  const resizeSelectedImage = useCallback((deltaPx) => {
    const quill = quillRef.current;

    if (!quill) {
      return;
    }

    const range = quill.getSelection(true);

    if (!range) {
      return;
    }

    const [leaf] = quill.getLeaf(range.index);

    const domNode = leaf?.domNode;

    const figure =
      domNode?.closest?.("figure.ql-image-caption") ||
      domNode?.parentElement?.closest?.("figure.ql-image-caption");

    const image =
      domNode?.querySelector?.("img") || figure?.querySelector?.("img");

    if (!image) {
      return;
    }

    const currentWidth = Number.parseInt(
      image.style.width || String(image.getBoundingClientRect().width),
      10,
    );

    const safeCurrentWidth = Number.isFinite(currentWidth) ? currentWidth : 600;

    const nextWidth = Math.min(1200, Math.max(80, safeCurrentWidth + deltaPx));

    image.style.width = `${nextWidth}px`;

    image.style.height = "auto";

    const caption = figure?.querySelector("figcaption");

    if (caption) {
      caption.style.width = `${nextWidth}px`;
    }

    quill.update("user");
  }, []);

  /* =======================================================
     INSERT CUSTOM IMAGE
     ======================================================= */

  const handleInsertCustomImage = useCallback(() => {
    if (!insertImageBase64) {
      window.alert("Silakan pilih gambar terlebih dahulu.");

      return;
    }

    const quill = quillRef.current;

    if (!quill) {
      return;
    }

    const range = currentSelectionRef.current ||
      quill.getSelection(true) || {
        index: Math.max(0, quill.getLength() - 1),
        length: 0,
      };

    const caption = normalizeText(insertImageCaption).slice(
      0,
      MAX_CAPTION_LENGTH,
    );

    quill.insertEmbed(
      range.index,
      "imageCaption",
      {
        url: insertImageBase64,
        caption,
        width: insertImageWidth,
        align: insertImageAlign,
      },
      "user",
    );

    quill.insertText(range.index + 1, "\n", "user");

    quill.setSelection(range.index + 2, 0, "silent");

    resetImageModal();
  }, [
    insertImageBase64,
    insertImageCaption,
    insertImageWidth,
    insertImageAlign,
    resetImageModal,
  ]);
  
  /* =======================================================
     RELATED MODAL
     ======================================================= */

  const openRelatedModal = useCallback(async () => {
    if (!form.category) {
      setErrors((previous) => ({
        ...previous,
        category: "Pilih kategori terlebih dahulu.",
      }));

      return;
    }

    setRelatedError(null);

    setRelatedLoading(true);

    setRelatedModalOpen(true);

    try {
      const response = await axios.get(
        `/api/articles/list/${encodeURIComponent(form.category)}`,
      );

      const source = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

      const filtered = source.filter(
        (item) => String(item?.id) !== String(editData?.id),
      );

      if (mountedRef.current) {
        setRelatedArticles(filtered);
      }
    } catch (error) {
      console.error("Gagal memuat artikel terkait:", error);

      if (mountedRef.current) {
        setRelatedError("Tidak dapat memuat daftar artikel. Coba lagi.");

        setRelatedArticles([]);
      }
    } finally {
      if (mountedRef.current) {
        setRelatedLoading(false);
      }
    }
  }, [editData?.id, form.category]);

  /* =======================================================
     INSERT RELATED SHORTCODE
     ======================================================= */

  const insertRelatedShortcode = useCallback(
    (articleId, articleTitle, articleSlug) => {
      const quill = quillRef.current;

      if (!quill || !articleId) {
        return;
      }

      const range = quill.getSelection(true) || {
        index: Math.max(0, quill.getLength() - 1),
        length: 0,
      };

      const safeTitle = normalizeText(articleTitle);

      const safeSlug = normalizeText(articleSlug);

      if (!safeTitle) {
        return;
      }

      const href = safeSlug ? `/article/${encodeURIComponent(safeSlug)}` : "#";

      const visibleText = `Baca Juga: ${safeTitle}`;

      // DI SINI LETAK PERBAIKANNYA
      // Hanya memasukkan link saja, menghapus teks "[related:xxx]" sepenuhnya
      const html = `<p><strong><a href="${escapeHtml(
        href,
      )}" rel="noopener noreferrer">${escapeHtml(
        visibleText,
      )}</a></strong></p>`;

      quill.clipboard.dangerouslyPasteHTML(range.index, html, "user");

      quill.setSelection(
        Math.min(range.index + visibleText.length + 1, quill.getLength()),
        0,
        "silent",
      );

      setRelatedModalOpen(false);
    },
    [],
  );

  /* =======================================================
     QUILL INIT
     ======================================================= */

  useEffect(() => {
    if (!editorRef.current) {
      return undefined;
    }

    if (quillRef.current) {
      return undefined;
    }

    const quill = new Quill(editorRef.current, {
      theme: "snow",

      placeholder: "Tulis isi berita di sini...",

      modules: {
        toolbar: {
          container: "#quill-toolbar",

          handlers: {
            undo() {
              this.quill.history.undo();
            },

            redo() {
              this.quill.history.redo();
            },

            image() {
              currentSelectionRef.current = this.quill.getSelection(true);

              setInsertImageModalOpen(true);
            },

            imageSmaller() {
              resizeSelectedImage(-50);
            },

            imageLarger() {
              resizeSelectedImage(50);
            },
            
            bold() {
              const range = this.quill.getSelection(true);
              const format = this.quill.getFormat(range);
              this.quill.format("bold", !format.bold, "user");
            },
            
            italic() {
              const range = this.quill.getSelection(true);
              const format = this.quill.getFormat(range);
              this.quill.format("italic", !format.italic, "user");
            },
            
            strike() {
              const range = this.quill.getSelection(true);
              const format = this.quill.getFormat(range);
              this.quill.format("strike", !format.strike, "user");
            },
            
            underline() {
              const range = this.quill.getSelection(true);
              const format = this.quill.getFormat(range);
              this.quill.format("underline", !format.underline, "user");
            },
            
            blockquote() {
              const range = this.quill.getSelection(true);
              const format = this.quill.getFormat(range);
              this.quill.format("blockquote", !format.blockquote, "user");
            },
          },
        },

        history: {
          delay: 1000,
          maxStack: 100,
          userOnly: true,
        },
      },
    });

    quillRef.current = quill;

    let orderedListFrame = null;

    const scheduleOrderedListSync = () => {
      if (orderedListFrame !== null) {
        window.cancelAnimationFrame(orderedListFrame);
      }

      orderedListFrame = window.requestAnimationFrame(() => {
        orderedListFrame = null;
        syncOrderedListNumbers(quill.root);
      });
    };

    quill.on("text-change", scheduleOrderedListSync);

    if (!editData?.id) {
      try {
        const raw = window.localStorage.getItem(autosaveStorageKey);
        const saved = raw ? JSON.parse(raw) : null;
        const cleanAutosaveContent = sanitizeArticleHtml(saved?.content || "");

        if (cleanAutosaveContent) {
          restoringAutosaveRef.current = true;
          quill.clipboard.dangerouslyPasteHTML(cleanAutosaveContent, "silent");
          quill.setSelection(
            Math.max(0, quill.getLength() - 1),
            0,
            "silent",
          );
          restoringAutosaveRef.current = false;
        }
      } catch (error) {
        restoringAutosaveRef.current = false;
        console.warn("Gagal memulihkan isi editor autosave:", error);
      }
    }

    quill.setSelection(0, 0, "silent");

    quill.formatLine(0, 1, "align", false, "silent");

    scheduleOrderedListSync();

    return () => {
      quill.off("text-change", scheduleOrderedListSync);

      if (orderedListFrame !== null) {
        window.cancelAnimationFrame(orderedListFrame);
      }
    };
  }, [resizeSelectedImage, editData?.id, autosaveStorageKey]);

  /* =======================================================
     LOAD EDIT DATA
     ======================================================= */

  useEffect(() => {
    const articleId = editData?.id;

    if (!articleId) {
      return undefined;
    }

    let active = true;
    const controller = new AbortController();

    /*
     * FIX:
     * Selalu gunakan /api/articles/{id}
     * karena route backend kamu memang:
     *
     * GET /api/articles/{slug}
     *
     * dan ID numerik juga ditangani
     * sebagai fallback oleh showBySlug().
     */
    const fetchUrl = `/api/articles/${encodeURIComponent(articleId)}`;

    axios
      .get(fetchUrl, { signal: controller.signal })
      .then((response) => {
        if (!active) {
          return;
        }

        const item = response?.data?.data || response?.data || {};

        dispatch({
          type: "SET_FORM",
          value: {
            title: item.title || "",

            category: item.category || "",

            teaser: item.summary || "",

            tags: Array.isArray(item.tags)
              ? item.tags.join(", ")
              : item.tags || "",

            thumbnailCaption: item.image_caption || item.thumbnailCaption || "",

            audioLink: item.audio_link || "",

            videoLink: item.video_link || "",
          },
        });

        if (item.image) {
          setThumbnailPreview(item.image);
        }

        const cleanContent = sanitizeArticleHtml(item.content || "");

        if (quillRef.current && cleanContent) {
          quillRef.current.clipboard.dangerouslyPasteHTML(
            cleanContent,
            "silent",
          );

          quillRef.current.setSelection(
            Math.max(0, quillRef.current.getLength() - 1),
            0,
            "silent",
          );
        }
      })
      .catch((error) => {
        if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") {
          return;
        }

        if (!active) {
          return;
        }

        console.error("Gagal memuat artikel:", error);

        setErrors((previous) => ({
          ...previous,
          load:
            error?.response?.data?.message ||
            "Gagal memuat artikel untuk diedit.",
        }));
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [editData]);

  /* =======================================================
     VALIDATE FORM
     ======================================================= */

  const validateForm = useCallback(() => {
    const newErrors = {};

    const title = normalizeText(form.title);

    const description = normalizeText(form.teaser);

    const tags = normalizeTags(form.tags);

    if (!form.category) {
      newErrors.category = "Kategori wajib dipilih.";
    }

    if (!title) {
      newErrors.title = "Judul tidak boleh kosong.";
    } else if (title.length < 5) {
      newErrors.title = "Judul minimal 5 karakter.";
    }

    if (title.length > MAX_TITLE_LENGTH) {
      newErrors.title = `Judul maksimal ${MAX_TITLE_LENGTH} karakter.`;
    }

    if (tags.length < MIN_TAGS || tags.length > MAX_TAGS) {
      newErrors.tags = `Tag harus berisi ${MIN_TAGS}-${MAX_TAGS} tag.`;
    }

    if (!actualIsPodcast && !thumbnailFile && !thumbnailPreview) {
      newErrors.image = "Thumbnail wajib diunggah.";
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      newErrors.teaser = `Description maksimal ${MAX_DESCRIPTION_LENGTH} karakter.`;
    }

    if (actualIsPodcast) {
      const spotify = normalizeText(form.audioLink);

      const youtube = normalizeText(form.videoLink);

      if (modalType === "publish" && !spotify && !youtube) {
        newErrors.audioLink = "Masukkan link Spotify atau YouTube.";

        newErrors.videoLink = "Masukkan link Spotify atau YouTube.";
      }

      if (spotify && !getSpotifyEmbedUrl(spotify)) {
        newErrors.audioLink = "Link Spotify tidak valid.";
      }

      if (youtube && !getYoutubeVideoId(youtube)) {
        newErrors.videoLink = "Link YouTube tidak valid.";
      }
    } else if (modalType === "publish") {
      const editorHtml = quillRef.current?.root?.innerHTML || "";

      const cleanHtml = sanitizeArticleHtml(editorHtml);

      const plainText = getPlainTextFromHtml(cleanHtml);

      if (!plainText) {
        newErrors.content = "Isi berita tidak boleh kosong.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }, [actualIsPodcast, form, thumbnailFile, thumbnailPreview, modalType]);

  /* =======================================================
     YOUTUBE THUMBNAIL DOWNLOAD
     ======================================================= */

  const downloadThumbnailAsFile = useCallback(async (videoLink) => {
    const thumbnailUrl = getYoutubeThumbnailUrl(videoLink);

    if (!thumbnailUrl) {
      return null;
    }

    try {
      const response = await fetch(thumbnailUrl);

      if (!response.ok) {
        return null;
      }

      const blob = await response.blob();

      if (!ALLOWED_IMAGE_TYPES.includes(blob.type)) {
        return null;
      }

      if (blob.size > MAX_THUMBNAIL_SIZE) {
        return null;
      }

      return new File([blob], `thumbnail-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
    } catch (error) {
      console.error("Gagal mengambil thumbnail YouTube:", error);

      return null;
    }
  }, []);

  /* =======================================================
     FINAL SUBMIT
     ======================================================= */

  const handleFinalSubmit = useCallback(async () => {
    if (submittingRef.current) {
      return;
    }
    if (!validateForm()) {
      setShowModal(false);

      return;
    }

    submittingRef.current = true;
    setLoading(true);

    setErrors((previous) => ({
      ...previous,
      submit: null,
    }));

    try {
      await ensureCsrfToken();

      const safeTitle = normalizeText(form.title);

      const safeSummary = normalizeText(form.teaser).slice(
        0,
        MAX_DESCRIPTION_LENGTH,
      );

      const safeTags = normalizeTags(form.tags);

      let contentHtml = "";

      if (actualIsPodcast) {
        contentHtml = buildPodcastContentHtml(form);
      } else {
        contentHtml = sanitizeArticleHtml(
          quillRef.current?.root?.innerHTML || "",
        );
      }

      const formData = new FormData();

      formData.append("title", safeTitle);

      formData.append("category", form.category);

      formData.append("content", contentHtml);

      formData.append("summary", safeSummary);

      formData.append("tags", safeTags.join(", "));

      formData.append(
        "image_caption",
        normalizeText(form.thumbnailCaption).slice(0, MAX_CAPTION_LENGTH),
      );

      if (actualIsPodcast) {
        formData.append("audio_link", normalizeText(form.audioLink));

        formData.append("video_link", normalizeText(form.videoLink));
      } else {
        formData.append("audio_link", "");

        formData.append("video_link", "");
      }

      /*
       * STATUS FINAL
       *
       * Draft:
       * draft
       *
       * Admin publish:
       * approved
       *
       * User publish:
       * pending
       */
      const finalStatus =
        modalType === "draft" ? "draft" : isAdmin ? "approved" : "pending";

      formData.append("status", finalStatus);

      let finalThumbnailFile = thumbnailFile;

      if (
        !finalThumbnailFile &&
        actualIsPodcast &&
        normalizeText(form.videoLink)
      ) {
        finalThumbnailFile = await downloadThumbnailAsFile(form.videoLink);
      }

      if (finalThumbnailFile) {
        formData.append("image", finalThumbnailFile);
      }

      /*
       * EDIT
       */
      if (editData?.id) {
        formData.append("id", String(editData.id));

        formData.append("_method", "PUT");
      }

      /*
       * CREATE:
       * POST /api/articles
       *
       * EDIT:
       * POST /api/articles/{id}
       * dengan _method=PUT
       */
      const endpoint = editData?.id
        ? `/api/articles/${encodeURIComponent(editData.id)}`
        : "/api/articles";

      const response = await axios.post(endpoint, formData);

      if (response?.status !== 200 && response?.status !== 201) {
        throw new Error("Gagal menyimpan artikel.");
      }

      clearAutosave();

      /*
       * REFRESH CACHE
       */
      queryClient.invalidateQueries({
        queryKey: ["publicArticles"],
      });

      queryClient.invalidateQueries({
        queryKey: ["userArticles"],
      });

      queryClient.invalidateQueries({
        queryKey: ["article"],
      });

      queryClient.invalidateQueries({
        queryKey: ["authorProfile"],
      });

      /*
       * NAVIGASI
       */
      if (editData?.id) {
        navigate(returnPath);
      } else if (modalType === "draft") {
        navigate("/profile");
      } else {
        navigate("/write-success");
      }
    } catch (error) {
      console.error("Gagal menyimpan artikel:", error?.response?.data || error);

      const apiErrors = error?.response?.data?.errors;

      if (apiErrors && typeof apiErrors === "object") {
        const formattedErrors = {};

        Object.entries(apiErrors).forEach(([key, value]) => {
          formattedErrors[key] = Array.isArray(value)
            ? value[0]
            : String(value);
        });

        setErrors(formattedErrors);
      } else {
        const message =
          error?.response?.data?.message ||
          "Gagal menyimpan artikel. Coba lagi.";

        setErrors((previous) => ({
          ...previous,
          submit: message,
        }));

        window.alert(message);
      }
    } finally {
      submittingRef.current = false;

      if (mountedRef.current) {
        setLoading(false);

        setShowModal(false);
      }
    }
  }, [
    validateForm,
    actualIsPodcast,
    form,
    modalType,
    isAdmin,
    thumbnailFile,
    editData?.id,
    returnPath,
    navigate,
    queryClient,
    downloadThumbnailAsFile,
    clearAutosave,
  ]);

  /* =======================================================
     SUBMIT MODAL
     ======================================================= */

  const openModal = useCallback((type) => {
    setErrors((previous) => ({
      ...previous,
      submit: null,
    }));

    setModalType(type);

    setShowModal(true);
  }, []);

  /* =======================================================
     FILE KEYBOARD
     ======================================================= */

  const dropZoneKeyDown = useCallback((event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      fileInputRef.current?.click();
    }
  }, []);

  /* =======================================================
     REMOVE THUMBNAIL
     ======================================================= */

  const removeThumbnail = useCallback(() => {
    setThumbnailPreview(null);

    setThumbnailFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setErrors((previous) => ({
      ...previous,
      image: null,
    }));
  }, []);

  /* =======================================================
     ESCAPE
     ======================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      if (loading) {
        return;
      }

      if (insertImageModalOpen) {
        resetImageModal();

        return;
      }
      
      if (relatedModalOpen) {
        setRelatedModalOpen(false);

        return;
      }

      if (showModal) {
        setShowModal(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    loading,
    insertImageModalOpen,
    relatedModalOpen,
    showModal,
    resetImageModal,
  ]);

  /* =======================================================
     BODY SCROLL LOCK
     ======================================================= */

  useEffect(() => {
    const modalOpen = showModal || insertImageModalOpen || relatedModalOpen;

    if (!modalOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showModal, insertImageModalOpen, relatedModalOpen]);

  /* =======================================================
     CLEANUP
     ======================================================= */

  useEffect(() => {
    return () => {
      mountedRef.current = false;

      quillRef.current = null;

      currentSelectionRef.current = null;
    };
  }, []);

  /* =======================================================
     PREVIEW
     ======================================================= */

  const previewSource = thumbnailPreview || "";

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="page menulis-form-page">
      <Helmet>
        <html lang="id-ID" />

        <title>Tulis Artikel - {SITE_NAME}</title>

        <meta
          name="description"
          content="Halaman penulisan dan pengiriman artikel SukaMuda."
        />

        <meta name="robots" content="noindex,follow" />

        <meta name="googlebot" content="noindex,follow" />
      </Helmet>

      <main className="content">
        <section className="write-form" aria-labelledby="write-page-title">
          {/* =================================================
              HEADER
              ================================================= */}

          <div className="write-header">
            <button
              className="back-link-btn"
              type="button"
              onClick={() => navigate(returnPath)}
              aria-label="Kembali"
              disabled={loading}
            >
              <span className="back-icon" aria-hidden="true">
                ←
              </span>
            </button>

            <h1 className="write-heading" id="write-page-title">
              WRITE
            </h1>

            <div />
          </div>

          {/* =================================================
              ERROR
              ================================================= */}

          {errors.load && (
            <div
              role="alert"
              style={{
                color: "#b42318",
                marginBottom: 16,
              }}
            >
              {errors.load}
            </div>
          )}

          {errors.submit && (
            <div
              role="alert"
              style={{
                color: "#b42318",
                marginBottom: 16,
              }}
            >
              {errors.submit}
            </div>
          )}

          {/* =================================================
              CATEGORY
              ================================================= */}

          <div className="form-row">
            <label className="form-label" htmlFor="write-category">
              Category
            </label>

            <select
              id="write-category"
              className="form-select"
              value={form.category}
              onChange={handleCategoryChange}
              disabled={loading}
            >
              <option value="" disabled>
                Pilih Kategori
              </option>

              {availableCategories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.label}
                </option>
              ))}
            </select>

            {errors.category && (
              <small
                role="alert"
                style={{
                  color: "red",
                  marginTop: 4,
                  display: "block",
                }}
              >
                {errors.category}
              </small>
            )}
          </div>

          {/* =================================================
              TITLE
              ================================================= */}

          <div className="form-row">
            <label className="form-label" htmlFor="write-title">
              Title
            </label>

            <input
              id="write-title"
              className="form-input"
              placeholder="Write Here"
              value={form.title}
              onChange={(event) =>
                handleInputChange("title", event.target.value)
              }
              maxLength={MAX_TITLE_LENGTH}
              disabled={loading}
              autoComplete="off"
            />

            {errors.title && (
              <small
                role="alert"
                style={{
                  color: "red",
                  marginTop: 4,
                  display: "block",
                }}
              >
                {errors.title}
              </small>
            )}
          </div>

          {/* =================================================
              PODCAST
              ================================================= */}

          {actualIsPodcast ? (
            <>
              <div className="form-row">
                <label className="form-label" htmlFor="write-spotify">
                  Link Spotify
                </label>

                <input
                  id="write-spotify"
                  className="form-input"
                  type="url"
                  inputMode="url"
                  placeholder="Masukkan link Spotify episode"
                  value={form.audioLink}
                  onChange={(event) =>
                    handleInputChange("audioLink", event.target.value)
                  }
                  disabled={loading}
                  autoComplete="off"
                />

                {errors.audioLink && (
                  <small
                    role="alert"
                    style={{
                      color: "red",
                      marginTop: 4,
                      display: "block",
                    }}
                  >
                    {errors.audioLink}
                  </small>
                )}
              </div>

              <div className="form-row">
                <label className="form-label" htmlFor="write-youtube">
                  Link YouTube
                </label>

                <input
                  id="write-youtube"
                  className="form-input"
                  type="url"
                  inputMode="url"
                  placeholder="Masukkan link YouTube video"
                  value={form.videoLink}
                  onChange={(event) =>
                    handleInputChange("videoLink", event.target.value)
                  }
                  disabled={loading}
                  autoComplete="off"
                />

                {errors.videoLink && (
                  <small
                    role="alert"
                    style={{
                      color: "red",
                      marginTop: 4,
                      display: "block",
                    }}
                  >
                    {errors.videoLink}
                  </small>
                )}
              </div>

              {/* PODCAST THUMBNAIL */}

              <div className="form-row">
                <label className="form-label">Thumbnail (opsional)</label>

                <div className="thumbnail-upload-row">
                  <div
                    className="thumbnail-drop-mini"
                    role="button"
                    tabIndex={loading ? -1 : 0}
                    aria-label="Pilih file thumbnail"
                    aria-disabled={loading}
                    onKeyDown={dropZoneKeyDown}
                    onDragOver={(event) => !loading && event.preventDefault()}
                    onDrop={loading ? undefined : handleThumbnailDrop}
                    onClick={() => !loading && fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      className="hidden-file-input"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={handleThumbnailChange}
                      aria-hidden="true"
                      tabIndex={-1}
                      disabled={loading}
                    />

                    <span>Choose File</span>
                  </div>

                  {previewSource && (
                    <div className="thumbnail-preview-box">
                      <img
                        className="thumbnail-preview-mini"
                        src={previewSource}
                        alt="Preview thumbnail"
                        width="240"
                        height="135"
                        loading="lazy"
                        decoding="async"
                      />

                      <button
                        type="button"
                        className="remove-thumbnail-btn"
                        aria-label="Hapus thumbnail"
                        onClick={removeThumbnail}
                        disabled={loading}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {errors.image && (
                  <small
                    role="alert"
                    style={{
                      color: "red",
                      marginTop: 4,
                      display: "block",
                    }}
                  >
                    {errors.image}
                  </small>
                )}
              </div>

              <div className="form-row">
                <label className="form-label" htmlFor="write-thumb-caption">
                  Caption Thumbnail (opsional)
                </label>

                <input
                  id="write-thumb-caption"
                  className="form-input"
                  placeholder="Tulis caption thumbnail jika ingin"
                  value={form.thumbnailCaption}
                  onChange={(event) =>
                    handleInputChange("thumbnailCaption", event.target.value)
                  }
                  maxLength={MAX_CAPTION_LENGTH}
                  disabled={loading}
                />
              </div>

              <div className="form-row">
                <label className="form-label" htmlFor="write-desc">
                  Description
                </label>

                <input
                  id="write-desc"
                  className="form-input"
                  placeholder="Deskripsi singkat podcast"
                  value={form.teaser}
                  onChange={(event) =>
                    handleInputChange("teaser", event.target.value)
                  }
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  disabled={loading}
                />

                {errors.teaser && (
                  <small
                    role="alert"
                    style={{
                      color: "red",
                      marginTop: 4,
                      display: "block",
                    }}
                  >
                    {errors.teaser}
                  </small>
                )}
              </div>
            </>
          ) : (
            <>
              {/* =================================================
                  THUMBNAIL
                  ================================================= */}

              <div className="form-row">
                <label className="form-label">Thumbnail</label>

                <div className="thumbnail-upload-row">
                  <div
                    className="thumbnail-drop-mini"
                    role="button"
                    tabIndex={loading ? -1 : 0}
                    aria-label="Pilih file thumbnail"
                    aria-disabled={loading}
                    onKeyDown={dropZoneKeyDown}
                    onDragOver={(event) => !loading && event.preventDefault()}
                    onDrop={loading ? undefined : handleThumbnailDrop}
                    onClick={() => !loading && fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      className="hidden-file-input"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={handleThumbnailChange}
                      aria-hidden="true"
                      tabIndex={-1}
                      disabled={loading}
                    />

                    <span>Choose File</span>
                  </div>

                  {previewSource && (
                    <div className="thumbnail-preview-box">
                      <img
                        className="thumbnail-preview-mini"
                        src={previewSource}
                        alt="Preview thumbnail"
                        width="240"
                        height="135"
                        loading="lazy"
                        decoding="async"
                      />

                      <button
                        type="button"
                        className="remove-thumbnail-btn"
                        aria-label="Hapus thumbnail"
                        onClick={removeThumbnail}
                        disabled={loading}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {errors.image && (
                  <small
                    role="alert"
                    style={{
                      color: "red",
                      marginTop: 4,
                      display: "block",
                    }}
                  >
                    {errors.image}
                  </small>
                )}
              </div>

              {/* CAPTION */}

              <div className="form-row">
                <label className="form-label" htmlFor="write-thumb-caption">
                  Caption Thumbnail
                </label>

                <div>
                  <input
                    id="write-thumb-caption"
                    className="form-input"
                    placeholder="Tulis caption gambar thumbnail"
                    value={form.thumbnailCaption}
                    onChange={(event) =>
                      handleInputChange("thumbnailCaption", event.target.value)
                    }
                    maxLength={MAX_CAPTION_LENGTH}
                    disabled={loading}
                  />

                  <p className="thumbnail-caption-hint">
                    Caption ini akan tampil di bawah gambar utama artikel.
                  </p>
                </div>
              </div>

              {/* =================================================
                  EDITOR
                  ================================================= */}

              <div className="editor-wrapper">
                <div id="quill-toolbar" className="editor-toolbar">
                  <button
                    className="ql-undo"
                    type="button"
                    aria-label="Urungkan"
                  >
                    <svg viewBox="0 0 18 18">
                      <polygon
                        className="ql-fill ql-stroke"
                        points="6 10 4 12 2 10 6 10"
                      />

                      <path className="ql-stroke" d="M6,10a4,4,0,1,1,1.5,3.1" />
                    </svg>
                  </button>

                  <button className="ql-redo" type="button" aria-label="Ulangi">
                    <svg viewBox="0 0 18 18">
                      <polygon
                        className="ql-fill ql-stroke"
                        points="12 10 14 12 16 10 12 10"
                      />

                      <path
                        className="ql-stroke"
                        d="M12,10a4,4,0,1,0-1.5,3.1"
                      />
                    </svg>
                  </button>

                  <button
                    className="ql-bold"
                    type="button"
                    aria-label="Tebal"
                  />

                  <button
                    className="ql-italic"
                    type="button"
                    aria-label="Miring"
                  />

                  <button
                    className="ql-strike"
                    type="button"
                    aria-label="Coret"
                  />

                  <button
                    className="ql-underline"
                    type="button"
                    aria-label="Garis bawah"
                  />

                  <button
                    className="ql-blockquote"
                    type="button"
                    aria-label="Kutipan"
                  />

                  <button
                    className="ql-list"
                    value="ordered"
                    type="button"
                    aria-label="Daftar bernomor"
                  />

                  <button
                    className="ql-list"
                    value="bullet"
                    type="button"
                    aria-label="Daftar poin"
                  />

                  <button
                    className="ql-align"
                    value=""
                    type="button"
                    aria-label="Rata kiri"
                  />

                  <button
                    className="ql-align"
                    value="center"
                    type="button"
                    aria-label="Rata tengah"
                  />

                  <button
                    className="ql-align"
                    value="right"
                    type="button"
                    aria-label="Rata kanan"
                  />

                  <button
                    className="ql-align"
                    value="justify"
                    type="button"
                    aria-label="Rata kiri-kanan"
                  />

                  <button
                    className="ql-link"
                    type="button"
                    aria-label="Sisipkan tautan"
                  />

                  <button
                    className="ql-image"
                    type="button"
                    aria-label="Sisipkan gambar"
                  />

                  <button
                    className="ql-imageSmaller"
                    type="button"
                    aria-label="Kecilkan gambar"
                  >
                    - Img
                  </button>

                  <button
                    className="ql-imageLarger"
                    type="button"
                    aria-label="Besarkan gambar"
                  >
                    + Img
                  </button>
                  
                  <button
                    className="related-button"
                    type="button"
                    onClick={openRelatedModal}
                    disabled={loading}
                  >
                    + Baca Juga
                  </button>
                </div>

                <div ref={editorRef} className="editor-body" />

                {errors.content && (
                  <small
                    role="alert"
                    style={{
                      color: "red",
                      marginTop: 4,
                      display: "block",
                    }}
                  >
                    {errors.content}
                  </small>
                )}
              </div>

              {/* =================================================
                  DESCRIPTION
                  ================================================= */}

              <div className="form-row">
                <label className="form-label" htmlFor="write-desc">
                  Description
                </label>

                <input
                  id="write-desc"
                  className="form-input"
                  placeholder="Write Here"
                  value={form.teaser}
                  onChange={(event) =>
                    handleInputChange("teaser", event.target.value)
                  }
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  disabled={loading}
                />

                {errors.teaser && (
                  <small
                    role="alert"
                    style={{
                      color: "red",
                      marginTop: 4,
                      display: "block",
                    }}
                  >
                    {errors.teaser}
                  </small>
                )}
              </div>
            </>
          )}

          {/* =================================================
              TAGS
              ================================================= */}

          <div className="form-row">
            <label className="form-label" htmlFor="write-tags">
              Tag
            </label>

            <input
              id="write-tags"
              className="form-input"
              placeholder="Pisahkan dengan koma"
              value={form.tags}
              onChange={(event) =>
                handleInputChange("tags", event.target.value)
              }
              disabled={loading}
            />

            {errors.tags && (
              <small
                role="alert"
                style={{
                  color: "red",
                  marginTop: 4,
                  display: "block",
                }}
              >
                {errors.tags}
              </small>
            )}
          </div>

          {/* =================================================
              ACTION
              ================================================= */}

          <div className="form-actions">
            <button
              className="btn-draft"
              type="button"
              onClick={() => openModal("draft")}
              disabled={loading}
            >
              Draft
            </button>

            <button
              className="btn-submit-write"
              type="button"
              onClick={() => openModal("publish")}
              disabled={loading}
            >
              {loading
                ? "Mengirim..."
                : editData?.id
                  ? "Simpan Perubahan"
                  : "Kirim"}
            </button>
          </div>
        </section>
      </main>

      {/* =====================================================
          SUBMIT MODAL
          ===================================================== */}

      {showModal && (
        <div
          className="modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !loading) {
              setShowModal(false);
            }
          }}
        >
          <div
            className="modal-container"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="submit-modal-title"
          >
            <h2 className="modal-title" id="submit-modal-title">
              {modalType === "draft"
                ? "Simpan sebagai Draft?"
                : "Kirim artikel?"}
            </h2>

            <p className="modal-subtitle">
              {modalType === "draft"
                ? "Artikel akan disimpan sebagai draft dan dapat dilanjutkan nanti."
                : isAdmin
                  ? "Artikel akan langsung dipublikasikan karena kamu adalah admin."
                  : "Artikel akan masuk ke antrian review sebelum dipublikasikan."}
            </p>

            <div className="modal-buttons">
              <button
                className="btn-batal"
                type="button"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Batal
              </button>

              <button
                className="btn-konfirmasi-hapus"
                type="button"
                style={{
                  backgroundColor: modalType === "draft" ? "#555" : "#007bff",
                }}
                onClick={handleFinalSubmit}
                disabled={loading}
              >
                {loading
                  ? "Menyimpan..."
                  : modalType === "draft"
                    ? "Simpan Draft"
                    : editData?.id
                      ? "Simpan Perubahan"
                      : isAdmin
                        ? "Publikasikan"
                        : "Kirim ke Admin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          IMAGE MODAL
          ===================================================== */}

      {insertImageModalOpen && (
        <div
          className="modal-overlay image-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              resetImageModal();
            }
          }}
        >
          <div
            className="modal-container image-modal-container"
            role="dialog"
            aria-modal="true"
            aria-labelledby="insert-image-title"
          >
            <h2 className="modal-title" id="insert-image-title">
              Sisipkan Gambar
            </h2>

            <div
              className="form-row"
              style={{
                gridTemplateColumns: "1fr",
                textAlign: "left",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <label className="form-label" htmlFor="insert-image-file">
                Pilih Gambar
              </label>

              <input
                id="insert-image-file"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                className="form-input"
                onChange={handleModalFileChange}
                disabled={loading}
              />

              {insertImageBase64 && (
                <p
                  role="status"
                  style={{
                    fontSize: 12,
                    color: "green",
                    margin: 0,
                  }}
                >
                  Gambar berhasil dipilih.
                </p>
              )}
            </div>

            <div
              className="form-row"
              style={{
                gridTemplateColumns: "1fr",
                textAlign: "left",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <label className="form-label" htmlFor="insert-image-caption">
                Keterangan Gambar (Opsional)
              </label>

              <input
                id="insert-image-caption"
                type="text"
                className="form-input"
                placeholder="Ilustrasi - Keterangan gambar..."
                value={insertImageCaption}
                onChange={(event) => setInsertImageCaption(event.target.value)}
                maxLength={MAX_CAPTION_LENGTH}
                disabled={loading}
              />
            </div>

            <div
              className="form-row"
              style={{
                gridTemplateColumns: "1fr",
                textAlign: "left",
                gap: 8,
                marginBottom: 24,
              }}
            >
              <label className="form-label">Posisi Gambar</label>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                }}
              >
                {["left", "center", "right"].map((position) => (
                  <button
                    key={position}
                    type="button"
                    className="btn-batal"
                    style={{
                      backgroundColor:
                        insertImageAlign === position
                          ? "#e0e0e0"
                          : "transparent",

                      textTransform: "capitalize",

                      fontWeight:
                        insertImageAlign === position ? "bold" : "normal",

                      color: insertImageAlign === position ? "#000" : "#555",

                      border:
                        insertImageAlign === position
                          ? "1px solid #999"
                          : "1px solid #ccc",

                      flex: 1,
                    }}
                    onClick={() => {
                      setInsertImageAlign(position);

                      if (
                        position !== "center" &&
                        insertImageWidth === "100%"
                      ) {
                        setInsertImageWidth("50%");
                      }

                      if (position === "center" && insertImageWidth === "50%") {
                        setInsertImageWidth("100%");
                      }
                    }}
                    disabled={loading}
                  >
                    {position === "left"
                      ? "Kiri"
                      : position === "center"
                        ? "Tengah"
                        : "Kanan"}
                  </button>
                ))}
              </div>

              <small
                style={{
                  fontSize: 12,
                  color: "#666",
                  display: "block",
                  marginTop: 8,
                }}
              >
                Gunakan tombol <b>- Img</b> atau <b>+ Img</b> setelah gambar
                disisipkan untuk mengubah ukuran.
              </small>
            </div>

            {insertImageBase64 && (
              <div
                style={{
                  marginBottom: 20,
                  textAlign: "center",
                }}
              >
                <img
                  src={insertImageBase64}
                  alt="Preview gambar yang akan disisipkan"
                  width="600"
                  height="400"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: 8,
                  }}
                />
              </div>
            )}

            <div className="modal-buttons">
              <button
                className="btn-batal"
                type="button"
                onClick={resetImageModal}
                disabled={loading}
              >
                Batal
              </button>

              <button
                className="btn-konfirmasi-hapus"
                type="button"
                style={{
                  backgroundColor: "#1e76d0",
                }}
                onClick={handleInsertCustomImage}
                disabled={loading || !insertImageBase64}
              >
                Sisipkan
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* =====================================================
          RELATED MODAL
          ===================================================== */}

      {relatedModalOpen && (
        <div
          className="modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setRelatedModalOpen(false);
            }
          }}
        >
          <div
            className="related-modal-container"
            role="dialog"
            aria-modal="true"
            aria-labelledby="related-modal-title"
          >
            <div className="modal-header-row">
              <div>
                <h2 className="modal-title" id="related-modal-title">
                  Pilih Artikel Baca Juga
                </h2>

                <p className="modal-subtitle">
                  Menampilkan artikel kategori:{" "}
                  {form.category || "Belum dipilih"}
                </p>
              </div>

              <button
                className="btn-batal"
                type="button"
                onClick={() => setRelatedModalOpen(false)}
              >
                Tutup
              </button>
            </div>

            {relatedLoading ? (
              <p
                role="status"
                style={{
                  textAlign: "center",
                  marginTop: 18,
                }}
              >
                Memuat artikel...
              </p>
            ) : relatedError ? (
              <p
                role="alert"
                style={{
                  color: "#d83a34",
                  textAlign: "center",
                  marginTop: 18,
                }}
              >
                {relatedError}
              </p>
            ) : relatedArticles.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  marginTop: 18,
                }}
              >
                Tidak ada artikel dalam kategori ini.
              </p>
            ) : (
              <div className="related-article-list">
                {relatedArticles.map((item) => (
                  <button
                    key={item.id}
                    className="related-article-item"
                    type="button"
                    onClick={() =>
                      insertRelatedShortcode(item.id, item.title, item.slug)
                    }
                  >
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SAFE CATEGORY HELPER
   ========================================================= */

function formCategoryFromState(draft) {
  return draft?.category || "";
}

export default Write;