export interface OrderItem {
  id: string;
  fabricType: string;
  color: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  gsm?: string;
  width?: string;
  specifications?: string;
  dyeingMethod?: string;
  finishingRequirements?: string;
}

export interface QualityCheck {
  id: string;
  checkType: 'incoming' | 'in-process' | 'final';
  inspector: string;
  checkDate: string;
  status: 'passed' | 'failed' | 'conditional';
  notes: string;
  defects?: string[];
  measurements?: Record<string, number>;
}

export interface ProductionStage {
  id: string;
  stage: 'preparation' | 'dyeing' | 'washing' | 'finishing' | 'quality-check' | 'packaging';
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  assignedTo: string;
  startDate?: string;
  endDate?: string;
  estimatedDuration: number; // in hours
  actualDuration?: number;
  notes?: string;
  machineNo?: string;
  batchNo?: string;
}

export interface ShipmentDetails {
  trackingNumber?: string;
  carrier?: string;
  shippingMethod?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  shippingCost?: number;
  packageWeight?: number;
  packageDimensions?: string;
  deliveryAddress: string;
  contactPerson: string;
  contactPhone: string;
  trackingStatus?: 'pending' | 'picked-up' | 'in-transit' | 'out-for-delivery' | 'delivered' | 'exception';
  trackingHistory?: TrackingEvent[];
  deliveryInstructions?: string;
  signatureRequired?: boolean;
  insuranceValue?: number;
}

export interface TrackingEvent {
  id: string;
  timestamp: string;
  location: string;
  status: string;
  description: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  
  // Order Details
  orderDate: string;
  deliveryDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'received' | 'confirmed' | 'in-production' | 'quality-check' | 'ready-to-ship' | 'shipped' | 'delivered' | 'cancelled';
  
  // Items and Pricing
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
  
  // Production Details
  productionStages: ProductionStage[];
  qualityChecks: QualityCheck[];
  estimatedCompletionDate: string;
  actualCompletionDate?: string;
  
  // Shipment
  shipmentDetails?: ShipmentDetails;
  
  // Additional Information
  specialInstructions?: string;
  internalNotes?: string;
  attachments?: string[];
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export const ORDER_STATUSES = [
  { value: 'received', label: 'Order Received', color: 'bg-blue-100 text-blue-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800' },
  { value: 'in-production', label: 'In Production', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'quality-check', label: 'Quality Check', color: 'bg-purple-100 text-purple-800' },
  { value: 'ready-to-ship', label: 'Ready to Ship', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-orange-100 text-orange-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
] as const;

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
] as const;

export const PRODUCTION_STAGES = [
  { value: 'preparation', label: 'Preparation', icon: 'Settings' },
  { value: 'dyeing', label: 'Dyeing', icon: 'Beaker' },
  { value: 'washing', label: 'Washing', icon: 'Droplets' },
  { value: 'finishing', label: 'Finishing', icon: 'Sparkles' },
  { value: 'quality-check', label: 'Quality Check', icon: 'CheckCircle' },
  { value: 'packaging', label: 'Packaging', icon: 'Package' },
] as const;

export const FABRIC_TYPES = [
  'Cotton',
  'Polyester',
  'Cotton-Polyester Blend',
  'Silk',
  'Wool',
  'Linen',
  'Rayon',
  'Nylon',
  'Spandex',
  'Denim',
  'Canvas',
  'Twill',
  'Jersey',
  'Chiffon',
  'Satin',
] as const;

export const DYEING_METHODS = [
  'Reactive Dyeing',
  'Disperse Dyeing',
  'Acid Dyeing',
  'Direct Dyeing',
  'Vat Dyeing',
  'Pigment Dyeing',
  'Tie-Dye',
  'Batik',
  'Digital Printing',
  'Screen Printing',
] as const;

export const UNITS = ['kg', 'meters', 'yards', 'pieces'] as const;

export const generateOrderNumber = (): string => {
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD${year}${month}${randomId}`;
};

export const initialOrderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'userId'> = {
  orderNumber: '',
  customerName: '',
  customerCompany: '',
  customerEmail: '',
  customerPhone: '',
  customerAddress: '',
  orderDate: new Date().toISOString().split('T')[0],
  deliveryDate: '',
  priority: 'medium',
  status: 'received',
  items: [],
  subtotal: 0,
  discount: 0,
  tax: 0,
  shippingCost: 0,
  totalAmount: 0,
  productionStages: [
    {
      id: '1',
      stage: 'preparation',
      status: 'pending',
      assignedTo: '',
      estimatedDuration: 8,
    },
    {
      id: '2',
      stage: 'dyeing',
      status: 'pending',
      assignedTo: '',
      estimatedDuration: 24,
    },
    {
      id: '3',
      stage: 'washing',
      status: 'pending',
      assignedTo: '',
      estimatedDuration: 4,
    },
    {
      id: '4',
      stage: 'finishing',
      status: 'pending',
      assignedTo: '',
      estimatedDuration: 6,
    },
    {
      id: '5',
      stage: 'quality-check',
      status: 'pending',
      assignedTo: '',
      estimatedDuration: 2,
    },
    {
      id: '6',
      stage: 'packaging',
      status: 'pending',
      assignedTo: '',
      estimatedDuration: 4,
    },
  ],
  qualityChecks: [],
  estimatedCompletionDate: '',
  specialInstructions: '',
  internalNotes: '',
};