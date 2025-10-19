export interface BaseProductionEntry {
  id: string;
  date: string;
  shift: 'morning' | 'afternoon' | 'night';
  operator: string;
  supervisor: string;
  machineNo: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  notes?: string;
  userId: string;
  timestamp: string;
}

export interface KnittingProductionEntry extends BaseProductionEntry {
  type: 'knitting';
  fabricType: string;
  yarnType: string;
  yarnLot: string;
  gauge: string;
  gsm: number;
  width: number;
  targetProduction: number;
  actualProduction: number;
  efficiency: number;
  defects: {
    holes: number;
    dropStitches: number;
    yarnBreaks: number;
    other: number;
  };
  qualityGrade: 'A' | 'B' | 'C' | 'Reject';
  rpm: number;
  needleBreaks: number;
}

export interface DyeingProductionEntry extends BaseProductionEntry {
  type: 'dyeing';
  fabricType: string;
  color: string;
  dyeType: string;
  batchWeight: number;
  liquorRatio: number;
  temperature: number;
  pH: number;
  processTime: number;
  targetProduction: number;
  actualProduction: number;
  efficiency: number;
  qualityGrade: 'A' | 'B' | 'C' | 'Reject';
  chemicalConsumption: {
    dyes: number;
    salt: number;
    soda: number;
    auxiliaries: number;
  };
  qualityResults: {
    colorMatch: 'excellent' | 'good' | 'acceptable' | 'poor';
    fastness: 'excellent' | 'good' | 'acceptable' | 'poor';
    uniformity: 'excellent' | 'good' | 'acceptable' | 'poor';
  };
  waterConsumption: number;
  energyConsumption: number;
  wasteGenerated: number;
}

export interface GarmentsProductionEntry extends BaseProductionEntry {
  type: 'garments';
  style: string;
  size: string;
  color: string;
  targetQuantity: number;
  completedQuantity: number;
  efficiency: number;
  defects: {
    stitchingDefects: number;
    measurementDefects: number;
    fabricDefects: number;
    other: number;
  };
  operations: {
    cutting: number;
    sewing: number;
    finishing: number;
    packing: number;
  };
  qualityGrade: 'A' | 'B' | 'C' | 'Reject';
  rework: number;
}

export type ProductionEntry = KnittingProductionEntry | DyeingProductionEntry | GarmentsProductionEntry;

export const PRODUCTION_TYPES = [
  { value: 'knitting', label: 'Knitting Production', icon: 'Layers' },
  { value: 'dyeing', label: 'Dyeing Production', icon: 'Droplets' },
  { value: 'garments', label: 'Garments Production', icon: 'Shirt' },
] as const;

export const SHIFTS = [
  { value: 'morning', label: 'Morning (6 AM - 2 PM)' },
  { value: 'afternoon', label: 'Afternoon (2 PM - 10 PM)' },
  { value: 'night', label: 'Night (10 PM - 6 AM)' },
] as const;

export const QUALITY_GRADES = [
  { value: 'A', label: 'Grade A (Premium)', color: 'bg-green-100 text-green-800' },
  { value: 'B', label: 'Grade B (Standard)', color: 'bg-blue-100 text-blue-800' },
  { value: 'C', label: 'Grade C (Below Standard)', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Reject', label: 'Reject', color: 'bg-red-100 text-red-800' },
] as const;

export const FABRIC_TYPES = [
  'Cotton',
  'Polyester',
  'Cotton-Polyester Blend',
  'Viscose',
  'Modal',
  'Bamboo',
  'Linen',
  'Silk',
  'Wool',
  'Spandex',
  'Nylon',
  'Acrylic',
] as const;

export const DYE_TYPES = [
  'Reactive',
  'Direct',
  'Disperse',
  'Acid',
  'Pigment',
  'Vat',
  'Sulphur',
  'Basic',
] as const;

export const YARN_TYPES = [
  'Cotton Combed',
  'Cotton Carded',
  'Polyester',
  'Viscose',
  'Modal',
  'Bamboo',
  'Blended',
  'Melange',
] as const;

export const GARMENT_STYLES = [
  'T-Shirt',
  'Polo Shirt',
  'Tank Top',
  'Hoodie',
  'Sweatshirt',
  'Dress',
  'Pants',
  'Shorts',
  'Jacket',
  'Shirt',
  'Blouse',
  'Skirt',
] as const;

export const GARMENT_SIZES = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'
] as const;

export const initialKnittingEntry: Omit<KnittingProductionEntry, 'id' | 'userId' | 'timestamp'> = {
  type: 'knitting',
  date: new Date().toISOString().split('T')[0],
  shift: 'morning',
  operator: '',
  supervisor: '',
  machineNo: '',
  startTime: '',
  endTime: '',
  totalHours: 0,
  fabricType: '',
  yarnType: '',
  yarnLot: '',
  gauge: '',
  gsm: 0,
  width: 0,
  targetProduction: 0,
  actualProduction: 0,
  efficiency: 0,
  defects: {
    holes: 0,
    dropStitches: 0,
    yarnBreaks: 0,
    other: 0,
  },
  qualityGrade: 'A',
  rpm: 0,
  needleBreaks: 0,
  notes: '',
};

export const initialDyeingEntry: Omit<DyeingProductionEntry, 'id' | 'userId' | 'timestamp'> = {
  type: 'dyeing',
  date: new Date().toISOString().split('T')[0],
  shift: 'morning',
  operator: '',
  supervisor: '',
  machineNo: '',
  startTime: '',
  endTime: '',
  totalHours: 0,
  fabricType: '',
  color: '',
  dyeType: '',
  batchWeight: 0,
  liquorRatio: 0,
  temperature: 0,
  pH: 0,
  processTime: 0,
  targetProduction: 0,
  actualProduction: 0,
  efficiency: 0,
  qualityGrade: 'A',
  chemicalConsumption: {
    dyes: 0,
    salt: 0,
    soda: 0,
    auxiliaries: 0,
  },
  qualityResults: {
    colorMatch: 'excellent',
    fastness: 'excellent',
    uniformity: 'excellent',
  },
  waterConsumption: 0,
  energyConsumption: 0,
  wasteGenerated: 0,
  notes: '',
};

export const initialGarmentsEntry: Omit<GarmentsProductionEntry, 'id' | 'userId' | 'timestamp'> = {
  type: 'garments',
  date: new Date().toISOString().split('T')[0],
  shift: 'morning',
  operator: '',
  supervisor: '',
  machineNo: '',
  startTime: '',
  endTime: '',
  totalHours: 0,
  style: '',
  size: '',
  color: '',
  targetQuantity: 0,
  completedQuantity: 0,
  efficiency: 0,
  defects: {
    stitchingDefects: 0,
    measurementDefects: 0,
    fabricDefects: 0,
    other: 0,
  },
  operations: {
    cutting: 0,
    sewing: 0,
    finishing: 0,
    packing: 0,
  },
  qualityGrade: 'A',
  rework: 0,
  notes: '',
};