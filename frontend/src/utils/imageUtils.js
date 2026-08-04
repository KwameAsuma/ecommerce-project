/**
 * resolveImageUrl — Global Image URL Resolver
 *
 * Ensures product images render correctly regardless of whether the app is
 * accessed via localhost, a Docker internal network, or an external Ngrok tunnel.
 *
 * Logic:
 *  - null / empty   → returns the default placeholder image
 *  - starts with http/https/blob → returned as-is (external URLs, Unsplash, blob previews)
 *  - starts with /uploads/  → prepends window.location.origin so Nginx proxies it to backend
 *  - anything else  → returned as-is
 */

const DEFAULT_PLACEHOLDER =
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80";

export const resolveImageUrl = (url, fallback = null) => {
  if (!url) return fallback || DEFAULT_PLACEHOLDER;

  // If the url is a comma-separated list (multi-image fields), take the first one
  const cleanUrl = typeof url === "string" ? url.split(",")[0].trim() : url;
  if (!cleanUrl) return fallback || DEFAULT_PLACEHOLDER;

  // Regardless of whether an upload was saved with hardcoded localhost, 127.0.0.1, or a relative path,
  // normalize any /uploads/ path to the current window origin so Nginx routes it cleanly
  const uploadIdx = cleanUrl.indexOf("/uploads/");
  if (uploadIdx !== -1) {
    const pathAfter = cleanUrl.substring(uploadIdx);
    return `${window.location.origin}${pathAfter}`;
  }

  const noSlashIdx = cleanUrl.indexOf("uploads/");
  if (noSlashIdx === 0 || (noSlashIdx !== -1 && (cleanUrl.includes("localhost") || cleanUrl.includes("127.0.0.1")))) {
    const pathAfter = cleanUrl.substring(noSlashIdx);
    return `${window.location.origin}/${pathAfter}`;
  }

  // External URLs (Unsplash, Cloudinary, etc.) and live blob previews — pass through untouched
  if (
    cleanUrl.startsWith("http://") ||
    cleanUrl.startsWith("https://") ||
    cleanUrl.startsWith("blob:")
  ) {
    return cleanUrl;
  }

  return cleanUrl;
};

export default resolveImageUrl;
