// How spec tags map to folders under docs/api/. A module without `flat` is split into
// sub-modules by the first path segment (/products/archive goes to products).
// Set `publish: false` to keep a module out of the public reference.
export const MODULES = {
  Auth: { dir: 'auth', label: 'Authentication', position: 1, flat: true },
  'Merchant Info': { dir: 'merchant', label: 'Merchant', position: 2, flat: true },
  Catalogue: { dir: 'catalogue', label: 'Catalogue', position: 3 },
  WMS: { dir: 'wms', label: 'WMS', position: 4 },
  Finance: { dir: 'finance', label: 'Finance', position: 5 },
  Reference: { dir: 'reference', label: 'Reference', position: 6, flat: true },
  Orders: { dir: 'orders', label: 'Orders', position: 7, flat: true, publish: false },
};

// Optional sub-module labels and order. Unlisted segments get a label from their name.
export const SUBMODULES = {
  products: { label: 'Products', position: 1 },
  categories: { label: 'Categories', position: 2 },
  locations: { label: 'Locations', position: 1 },
  'transfer-orders': { label: 'Transfer orders', position: 2 },
  invoices: { label: 'Invoices', position: 1 },
  accounts: { label: 'Accounts', position: 2 },
};

export const subLabel = (seg) =>
  SUBMODULES[seg]?.label ?? seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
