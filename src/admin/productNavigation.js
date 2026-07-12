export const NEW_PRODUCT_ROUTE = '/admin/products';
export function navigateToNewProduct(navigate) {
  if (typeof navigate !== 'function') return;
  navigate(NEW_PRODUCT_ROUTE);
}
