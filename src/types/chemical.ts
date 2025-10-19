export interface ChemicalItem {
  itemType: string;
  itemName: string;
  lotNo: string;
  dosing: number | null;
  shade: number | null;
  qty: { kg: number | null; gm: number | null; mg: number | null };
  unitPrice: number | null;
  costing: number;
  remarks: string;
  highlight: boolean;
}

export const ITEM_TYPES = [
  'Dye',
  'Chemical',
  'Auxiliary',
  'Salt',
  'Soda',
  'Acid',
  'Enzyme',
  'Softener',
  'Dyeing step',
];

export const convertToSubUnits = (totalKg: number | null): { kg: number | null; gm: number | null; mg: number | null } => {
  if (totalKg === null) {
    return { kg: null, gm: null, mg: null };
  }
  const kg = Math.floor(totalKg);
  const remainingGm = (totalKg - kg) * 1000;
  const gm = Math.floor(remainingGm);
  const mg = Math.round((remainingGm - gm) * 1000);

  return { kg, gm, mg };
};

export const calculateQtyFromDosing = (dosing: number | null, totalWater: number | null): number | null => {
  if (dosing === null || totalWater === null) {
    return null;
  }
  return (dosing * totalWater) / 1000; // Convert grams to kg
};

export const calculateQtyFromShade = (shade: number | null, fabricWeight: number | null): number | null => {
  if (shade === null || fabricWeight === null) {
    return null;
  }
  return (shade / 100) * fabricWeight;
};
