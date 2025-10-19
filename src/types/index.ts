import { ChemicalItem } from './chemical';

export interface DyeingFormData {
  reqId: string;
  reqDate: string;
  project: string;
  fabricType: string;
  color: string;
  colorMore: string;
  labDipNo: string;
  machineDesc: string;
  machineNo: string;
  remarks: string;
  reelSpeed: string;
  pumpSpeed: string;
  cycleTime: string;
  dyingType: string;
  colorGroup: string;
  lotNo: string;
  gsm: string;
  productMode: 'inhouse' | 'subcontract';
  workOrder: string;
  fabricQty: string;
  buyer: string;
  batchNo: string;
  batchQty: string;
  orderNo: string;
  fabricWeight: number | null;
  liquorRatio: number | null;
  totalWater: number | null;
  composition: string;
  documentMode: 'draft' | 'final';
}

export interface OldDyeingFormData {
  project: string;
  fabricType: string;
  color: string;
  labDipNo: string;
  batchNo: string;
  buyer: string;
  gsm: string;
  machineNo: string;
  reqDate: string;
  dyingType: string;
  colorGroup: string;
  composition: string;
  fabricWeight: number | null;
  liquorRatio: number | null;
  totalWater: number | null;
  workOrder: string;
  chemicalItems: ChemicalItem[];
}

export const DYEING_TYPES = [
  'Fresh Dyeing',
  'Reprocess/Rewash',
  'Enzyme Wash',
  'Normal Wash',
  'Bulk',
  'Sample',
];

export const COLOR_GROUPS = [
  'Reactive',
  'Direct',
  'Disperse',
  'Acid',
  'Pigment',
  'Vat',
  'Sulphur',
  'Basic',
];

export const calculateTotalWater = (fabricWeight: number | null, liquorRatio: number | null): number | null => {
  if (fabricWeight === null || liquorRatio === null) {
    return null;
  }
  return fabricWeight * liquorRatio;
};

export const initialDyeingFormData: DyeingFormData = {
  reqId: '',
  reqDate: new Date().toISOString().split('T')[0],
  project: '',
  fabricType: '',
  color: '',
  colorMore: '',
  labDipNo: '',
  machineDesc: '',
  machineNo: '',
  remarks: '',
  reelSpeed: '',
  pumpSpeed: '',
  cycleTime: '',
  dyingType: '',
  colorGroup: '',
  lotNo: '',
  gsm: '',
  productMode: 'inhouse',
  workOrder: '',
  fabricQty: '',
  buyer: '',
  batchNo: '',
  batchQty: '',
  orderNo: '',
  fabricWeight: null,
  liquorRatio: null,
  totalWater: null,
  composition: '',
  documentMode: 'draft'
};

export const initialOldDyeingFormData: OldDyeingFormData = {
  project: '',
  fabricType: '',
  color: '',
  labDipNo: '',
  batchNo: '',
  buyer: '',
  gsm: '',
  machineNo: '',
  reqDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
  dyingType: '',
  colorGroup: '',
  composition: '',
  fabricWeight: null,
  liquorRatio: null,
  totalWater: null,
  workOrder: '',
  chemicalItems: [],
};

export interface Recipe {
  id: string;
  name: string;
  timestamp: string;
  formData: DyeingFormData;
  chemicalItems: ChemicalItem[];
}

export interface Settings {
  industryName: string;
  theme: string;
  currency: string;
  dateFormat: string;
}
