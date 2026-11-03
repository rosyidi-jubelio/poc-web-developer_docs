// How spec tags map to folders under docs/api/. A module without `flat` is split into
// sub-modules by `sub`, or by the first path segment when `sub` is not set
// (/transfer-orders/{id} goes to transfer-orders). Several tags can share one module.
// Set `publish: false` to keep a module out of the public reference.
export const MODULES = {
  Auth: { dir: 'auth', label: 'Authentication', position: 1, flat: true },
  'Merchant Info': { dir: 'merchant', label: 'Merchant', position: 2, flat: true },
  Products: { dir: 'catalogue', label: 'Catalogue', position: 3, sub: 'products' },
  Prices: { dir: 'catalogue', label: 'Catalogue', position: 3, sub: 'prices' },
  Categories: { dir: 'catalogue', label: 'Catalogue', position: 3, sub: 'categories' },
  'Category Mappings': { dir: 'catalogue', label: 'Catalogue', position: 3, sub: 'category-mappings' },
  'Channel Categories': { dir: 'catalogue', label: 'Catalogue', position: 3, sub: 'channel-categories' },
  WMS: { dir: 'wms', label: 'WMS', position: 4 },
  Finance: { dir: 'finance', label: 'Finance', position: 5 },
  Reference: { dir: 'reference', label: 'Reference', position: 6, flat: true },
  Orders: { dir: 'orders', label: 'Orders', position: 7, flat: true, publish: false },
};

// Optional sub-module labels and order. Unlisted segments get a label from their name.
export const SUBMODULES = {
  products: { label: 'Products', position: 1 },
  prices: { label: 'Prices', position: 2 },
  categories: { label: 'Categories', position: 3 },
  'category-mappings': { label: 'Category mappings', position: 4 },
  'channel-categories': { label: 'Channel categories', position: 5 },
  locations: { label: 'Locations', position: 1 },
  'transfer-orders': { label: 'Transfer orders', position: 2 },
  invoices: { label: 'Invoices', position: 1 },
  accounts: { label: 'Accounts', position: 2 },
};

export const subLabel = (seg) =>
  SUBMODULES[seg]?.label ?? seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
