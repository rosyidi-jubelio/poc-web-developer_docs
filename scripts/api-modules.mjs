// How spec tags map to folders under docs/api/. A module without `flat` is split into
// sub-modules by `sub`, or by the first path segment when `sub` is not set
// (/transfer-orders/{id} goes to transfer-orders). With `prefix`, the segment after the prefix
// is used (/finance/bills/{id} goes to bills). Several tags can share one module.
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
  Finance: { dir: 'finance', label: 'Finance', position: 5, prefix: '/finance' },
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
  'sales-returns': { label: 'Sales returns', position: 2 },
  bills: { label: 'Bills', position: 3 },
  'purchase-returns': { label: 'Purchase returns', position: 4 },
  'customer-payments': { label: 'Customer payments', position: 5 },
  'supplier-payments': { label: 'Supplier payments', position: 6 },
  'cash-bank-transactions': { label: 'Cash and bank transactions', position: 7 },
  'customer-contacts': { label: 'Customer contacts', position: 8 },
  'supplier-contacts': { label: 'Supplier contacts', position: 9 },
  'sales-orders': { label: 'Sales orders', position: 10 },
  'purchase-orders': { label: 'Purchase orders', position: 11 },
  assets: { label: 'Assets', position: 12 },
  accounts: { label: 'Accounts', position: 13 },
  taxes: { label: 'Taxes', position: 14 },
  journals: { label: 'Journals', position: 15 },
};

export const subLabel = (seg) =>
  SUBMODULES[seg]?.label ?? seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
