const normalizeProductReference = (product) => {
  if (!product || typeof product !== 'object') return '';

  if (product._id) return String(product._id);
  if (product.id) return String(product.id);
  if (product.slug) return String(product.slug);
  return '';
};

module.exports = {
  normalizeProductReference,
};
