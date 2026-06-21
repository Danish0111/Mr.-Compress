/**
 * compressImage.js
 * Pure browser-side image compression using Canvas API.
 * Supports JPG, PNG, WebP output formats.
 */

/**
 * Compress by quality (0-1).
 * @param {File} file - Source image file
 * @param {number} quality - 0.0 to 1.0
 * @param {string} outputFormat - 'image/jpeg' | 'image/png' | 'image/webp'
 * @returns {Promise<{blob: Blob, dataUrl: string, size: number}>}
 */
export async function compressByQuality(file, quality, outputFormat) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Compression failed')); return; }
          const reader = new FileReader();
          reader.onload = (e) => resolve({ blob, dataUrl: e.target.result, size: blob.size });
          reader.readAsDataURL(blob);
        },
        outputFormat,
        quality
      );
    };

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

/**
 * Compress to a target file size (in bytes) using binary search on quality.
 * @param {File} file - Source image file
 * @param {number} targetBytes - Desired file size in bytes
 * @param {string} outputFormat - 'image/jpeg' | 'image/png' | 'image/webp'
 * @returns {Promise<{blob: Blob, dataUrl: string, size: number, quality: number}>}
 */
export async function compressByTargetSize(file, targetBytes, outputFormat) {
  // PNG doesn't support lossy quality in browser, fall back to quality mode
  if (outputFormat === 'image/png') {
    const result = await compressByQuality(file, 0.9, outputFormat);
    return { ...result, quality: 90 };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      let lo = 0.0, hi = 1.0, bestBlob = null, bestQuality = 0.8;
      const MAX_ITERS = 16;

      for (let i = 0; i < MAX_ITERS; i++) {
        const mid = (lo + hi) / 2;
        const blob = await new Promise((res) =>
          canvas.toBlob((b) => res(b), outputFormat, mid)
        );
        if (!blob) break;

        if (blob.size <= targetBytes) {
          lo = mid;
          bestBlob = blob;
          bestQuality = mid;
        } else {
          hi = mid;
        }

        if (hi - lo < 0.01) break;
      }

      // If nothing fits, use lowest quality
      if (!bestBlob) {
        bestBlob = await new Promise((res) => canvas.toBlob((b) => res(b), outputFormat, 0.05));
      }

      const reader = new FileReader();
      reader.onload = (e) =>
        resolve({ blob: bestBlob, dataUrl: e.target.result, size: bestBlob.size, quality: Math.round(bestQuality * 100) });
      reader.readAsDataURL(bestBlob);
    };

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

/**
 * Detect best output format from file type.
 */
export function getMimeType(file) {
  if (file.type === 'image/png') return 'image/png';
  if (file.type === 'image/webp') return 'image/webp';
  return 'image/jpeg';
}

/**
 * Extension for a given MIME type.
 */
export function getExtension(mime) {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}
