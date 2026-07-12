export const DEFAULT_IMAGE_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial, Helvetica, sans-serif" font-size="28"%3ENo Image%3C/text%3E%3C/svg%3E';
export function getProductImage(product) {
  if (!product) return DEFAULT_IMAGE_PLACEHOLDER;
  // Prefer common shapes: product.images[0].image or .url
  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images[0];
    if (!first) return DEFAULT_IMAGE_PLACEHOLDER;
    return first.image || first.url || DEFAULT_IMAGE_PLACEHOLDER;
  }
  // Some products may provide `images` as object or direct `image` field
  if (product.image) return product.image;
  if (product.images && typeof product.images === 'string') return product.images;

  // Fallback placeholder
  return DEFAULT_IMAGE_PLACEHOLDER;
}
export function handleImageError(e) {
  try {
    if (e && e.target) {
      e.target.onerror = null;
      e.target.src = DEFAULT_IMAGE_PLACEHOLDER;
    }
  } catch (err) {
    // ignore
  }
}
