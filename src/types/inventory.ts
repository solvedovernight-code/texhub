export interface InventoryItem {
  id: string;
  name: string;
  category: 'dye' | 'chemical' | 'auxiliary' | 'fabric' | 'equipment';
  sku: string;
  description: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitPrice: number;
  supplier: string;
  location: string;
  lastUpdated: string;
  expiryDate?: string;
  batchNumber?: string;
  notes?: string;
}

export interface StockTransaction {
  id: string;
  itemId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference?: string;
  timestamp: string;
  userId: string;
  notes?: string;
}

export interface LowStockAlert {
  id: string;
  itemId: string;
  itemName: string;
  currentStock: number;
  minStock: number;
  severity: 'low' | 'critical';
  timestamp: string;
}

export const INVENTORY_CATEGORIES = [
  { value: 'dye', label: 'Dyes' },
  { value: 'chemical', label: 'Chemicals' },
  { value: 'auxiliary', label: 'Auxiliaries' },
  { value: 'fabric', label: 'Fabrics' },
  { value: 'equipment', label: 'Equipment' },
] as const;

export const STOCK_UNITS = [
  'kg', 'g', 'mg', 'L', 'mL', 'pcs', 'm', 'cm', 'rolls', 'bags', 'bottles'
] as const;

export const initialInventoryItem: InventoryItem = {
  id: '',
  name: '',
  category: 'chemical',
  sku: '',
  description: '',
  currentStock: 0,
  minStock: 0,
  maxStock: 0,
  unit: 'kg',
  unitPrice: 0,
  supplier: '',
  location: '',
  lastUpdated: new Date().toISOString(),
  expiryDate: '',
  batchNumber: '',
  notes: '',
};

export const generateSKU = (category: string, name: string): string => {
  const categoryCode = category.substring(0, 3).toUpperCase();
  const nameCode = name.replace(/\s+/g, '').substring(0, 4).toUpperCase();
  const randomId = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${categoryCode}-${nameCode}-${randomId}`;
};
