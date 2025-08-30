export interface UserSettings {
  // Company Information
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  
  // Personal Information
  personalName: string;
  personalEmail: string;
  personalTitle: string;
  personalLocation: string;
  personalBio: string;
  personalAvatar: string;
  personalExpertise: string[];
  
  // User Preferences
  defaultCurrency: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
  
  // Application Settings
  theme: string;
  autoSave: boolean;
  notifications: boolean;
  
  // Printing Settings
  printHeaderLogo: boolean;
  printCompanyDetails: boolean;
  defaultPaperSize: string;
  
  // System Settings
  backupFrequency: string;
  dataRetention: string;
  
  // Navigation Settings
  enabledMenuItems: string[];
  menuOrder: string[];
}

export const defaultSettings: UserSettings = {
  companyName: 'Lantabur Apparels Ltd.',
  companyAddress: 'Kewa, Boherar chala, Gila Beraeed, Sreepur, Gazipur',
  companyPhone: '+880-XXX-XXXXXXX',
  companyEmail: 'info@lantabur.com',
  personalName: '',
  personalEmail: '',
  personalTitle: '',
  personalLocation: '',
  personalBio: '',
  personalAvatar: '',
  personalExpertise: [],
  defaultCurrency: 'BDT',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  language: 'English',
  theme: 'dark', // Default to dark theme for consistency
  autoSave: true,
  notifications: true,
  printHeaderLogo: true,
  printCompanyDetails: true,
  defaultPaperSize: 'A4',
  backupFrequency: 'daily',
  dataRetention: '1year',
  enabledMenuItems: [
    'home',
    'dyeing-calculator',
    'proforma-invoice',
    'inventory',
    'order-management',
    'social-portal',
    'settings'
  ],
  menuOrder: [
    'home',
    'dyeing-calculator',
    'proforma-invoice',
    'inventory',
    'order-management',
    'social-portal',
    'settings'
  ],
};
