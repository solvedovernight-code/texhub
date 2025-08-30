export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface ProformaInvoiceData {
  // Invoice Header
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerId: string;
  documentMode: 'draft' | 'final';

  // Customer Information
  customerName: string;
  customerCompany: string;
  customerAddress: string;
  customerCity: string;
  customerPhone: string;

  // Ship To Information
  shipToName: string;
  shipToCompany: string;
  shipToAddress: string;
  shipToCity: string;
  shipToPhone: string;

  // Shipping Details
  transportationName: string;
  shippingDate: string;
  wayBill: string;
  vehicleNo: string;
  driverPhone: string;

  // Invoice Items
  items: InvoiceItem[];

  // Financial Details
  subtotal: number;
  discount: number;
  deliveryCharges: number;
  totalAmount: number;

  // Additional Information
  amountInWords: string;
  termsAndConditions: string;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
}

export const initialInvoiceData: ProformaInvoiceData = {
  invoiceNumber: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  customerId: '',
  documentMode: 'draft',
  customerName: '',
  customerCompany: '',
  customerAddress: '',
  customerCity: '',
  customerPhone: '',
  shipToName: '',
  shipToCompany: '',
  shipToAddress: '',
  shipToCity: '',
  shipToPhone: '',
  transportationName: '',
  shippingDate: '',
  wayBill: '',
  vehicleNo: '',
  driverPhone: '',
  items: [],
  subtotal: 0,
  discount: 0,
  deliveryCharges: 0,
  totalAmount: 0,
  amountInWords: '',
  termsAndConditions: '',
  status: 'draft'
};

export const generateInvoiceNumber = () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const randomId = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PI${year}${month}${randomId}`;
};

export const numberToWords = (num: number): string => {
  if (num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const thousands = ['', 'Thousand', 'Million', 'Billion'];

  const convertHundreds = (n: number): string => {
    let result = '';
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + ' ';
      return result;
    }
    if (n > 0) {
      result += ones[n] + ' ';
    }
    return result;
  };

  let result = '';
  let thousandCounter = 0;
  
  while (num > 0) {
    if (num % 1000 !== 0) {
      result = convertHundreds(num % 1000) + thousands[thousandCounter] + ' ' + result;
    }
    num = Math.floor(num / 1000);
    thousandCounter++;
  }
  
  return result.trim();
};
