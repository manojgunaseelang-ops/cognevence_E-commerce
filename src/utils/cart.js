export const CART_KEY = 'wellStoreCart';
export function getCart() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}
export function saveCart(cart) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    // ignore storage errors
  }
}
export function addCartItem(product) {
  const cart = getCart();
  const qtyToAdd = Number(product.quantity) > 0 ? Number(product.quantity) : 1;
  const existingIndex = cart.findIndex(
    (item) =>
      item._id === product._id &&
      (item.selectedSize || '') === (product.selectedSize || '')
  );

  if (existingIndex !== -1) {
    cart[existingIndex].quantity = (cart[existingIndex].quantity || 0) + qtyToAdd;
  } else {
    cart.push({ ...product, quantity: qtyToAdd });
  }
  saveCart(cart);
  try {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
    }
  } catch (e) {
    // ignore
  }
  return cart;
}
export function removeCartItem(productId) {
  const cart = getCart().filter((item) => item._id !== productId);
  saveCart(cart);
  return cart;
}

export function updateCartQuantity(productId, quantity) {
  const cart = getCart().map((item) =>
    item._id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
  );
  saveCart(cart);
  return cart;
}
