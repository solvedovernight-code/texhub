import React from 'react';
import { ProformaInvoiceData } from '../types/invoice';

interface PrintableInvoiceProps {
  data: ProformaInvoiceData;
}

export const PrintableInvoice = React.forwardRef<HTMLDivElement, PrintableInvoiceProps>(
  ({ data }, ref) => {
    // Get settings from localStorage for dynamic company info
    const savedSettings = localStorage.getItem('userSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : null;
    
    const companyName = settings?.companyName || 'Lantabur Apparels Ltd.';
    const companyAddress = settings?.companyAddress || 'Kewa, Boherar chala, Gila Beraeed, Sreepur, Gazipur';
    const companyPhone = settings?.companyPhone || '+880-XXX-XXXXXXX';
    const companyEmail = settings?.companyEmail || 'info@lantabur.com';

    const borderStyle = "border border-gray-400";
    const headerCellStyle = `${borderStyle} px-2 py-1 text-center bg-gray-100 font-medium text-xs`;
    const dataCellStyle = `${borderStyle} px-2 py-1 text-xs`;

    return (
      <div ref={ref} className="p-8 bg-white text-black text-xs flex flex-col min-h-[1050px] relative">
        {/* Draft Banner */}
        {data.status === 'draft' && (
          <div className="absolute top-0 -left-8 w-36 h-36 overflow-hidden z-10">
            <div className="absolute top-7 -left-7 w-48 h-8 bg-orange-500 text-white text-center font-bold text-sm leading-8 transform -rotate-45 shadow-lg">
              DRAFT
            </div>
          </div>
        )}

        <div className="flex-grow">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-lg font-bold">{companyName}</h1>
              <p className="text-[10px] text-gray-600 max-w-xs">{companyAddress}</p>
              <p className="text-[10px] text-gray-600">Phone: {companyPhone}</p>
              <p className="text-[10px] text-gray-600">Email: {companyEmail}</p>
              <p className="text-[10px] text-gray-600">GSTIN NO:</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-500 mb-2">PROFORMA INVOICE</h2>
              <div className="text-xs space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="font-medium">Date:</span>
                  <span>{new Date(data.invoiceDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="font-medium">Due Date:</span>
                  <span>{data.dueDate ? new Date(data.dueDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="font-medium">Invoice #:</span>
                  <span>{data.invoiceNumber}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="font-medium">Customer ID:</span>
                  <span>{data.customerId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer, Ship To, and Shipping Details */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Customer */}
            <div>
              <div className={`${headerCellStyle} text-left`}>CUSTOMER</div>
              <div className={`${borderStyle} p-2 min-h-[120px] text-xs`}>
                <div className="space-y-1">
                  <div><strong>Name:</strong></div>
                  <div>{data.customerName || '[Name]'}</div>
                  <div><strong>Company Name:</strong></div>
                  <div>{data.customerCompany || '[Company Name]'}</div>
                  <div><strong>Address:</strong></div>
                  <div>{data.customerAddress || '[Street Address]'}</div>
                  <div>{data.customerCity || '[City, ST, Zip code]'}</div>
                  <div><strong>Phone:</strong></div>
                  <div>{data.customerPhone || '[Phone]'}</div>
                </div>
              </div>
            </div>

            {/* Ship To */}
            <div>
              <div className={`${headerCellStyle} text-left`}>SHIP TO</div>
              <div className={`${borderStyle} p-2 min-h-[120px] text-xs`}>
                <div className="space-y-1">
                  <div><strong>Name:</strong></div>
                  <div>{data.shipToName || '[Name]'}</div>
                  <div><strong>Company Name:</strong></div>
                  <div>{data.shipToCompany || '[Company Name]'}</div>
                  <div><strong>Address:</strong></div>
                  <div>{data.shipToAddress || '[Street Address]'}</div>
                  <div>{data.shipToCity || '[City, ST, Zip code]'}</div>
                  <div><strong>Phone:</strong></div>
                  <div>{data.shipToPhone || '[Phone]'}</div>
                </div>
              </div>
            </div>

            {/* Shipping Details */}
            <div>
              <div className={`${headerCellStyle} text-left`}>SHIPPING DETAILS</div>
              <div className={`${borderStyle} p-2 min-h-[120px] text-xs`}>
                <div className="space-y-1">
                  <div><strong>Transportation name:</strong></div>
                  <div>{data.transportationName || 'N/A'}</div>
                  <div><strong>Shipping Date:</strong></div>
                  <div>{data.shippingDate ? new Date(data.shippingDate).toLocaleDateString() : 'N/A'}</div>
                  <div><strong>Way Bill:</strong></div>
                  <div>{data.wayBill || 'N/A'}</div>
                  <div><strong>Vehicle No:</strong></div>
                  <div>{data.vehicleNo || 'N/A'}</div>
                  <div><strong>Driver Phone no:</strong></div>
                  <div>{data.driverPhone || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className={`w-full border-collapse ${borderStyle} mb-4`}>
            <colgroup>
              <col style={{ width: '8%' }} />
              <col style={{ width: '50%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
            </colgroup>
            <thead>
              <tr>
                <th className={headerCellStyle}>SL NO</th>
                <th className={headerCellStyle}>DESCRIPTION</th>
                <th className={headerCellStyle}>QTY</th>
                <th className={headerCellStyle}>UNIT PRICE</th>
                <th className={headerCellStyle}>TOTAL AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={item.id}>
                  <td className={`${dataCellStyle} text-center`}>{index + 1}</td>
                  <td className={`${dataCellStyle} text-left`}>{item.description || 'N/A'}</td>
                  <td className={`${dataCellStyle} text-center`}>{item.quantity}</td>
                  <td className={`${dataCellStyle} text-right`}>₹ {item.unitPrice.toFixed(2)}</td>
                  <td className={`${dataCellStyle} text-right`}>₹ {item.amount.toFixed(2)}</td>
                </tr>
              ))}
              
              {/* Empty rows */}
              {Array.from({ length: Math.max(0, 12 - data.items.length) }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td className={`${dataCellStyle} h-6`}></td>
                  <td className={dataCellStyle}></td>
                  <td className={dataCellStyle}></td>
                  <td className={dataCellStyle}></td>
                  <td className={dataCellStyle}></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bottom Section */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left Side - Amount in Words and Terms */}
            <div className="space-y-4">
              <div>
                <div className={`${headerCellStyle} text-left`}>Amount in Words:</div>
                <div className={`${borderStyle} p-2 min-h-[60px] text-xs`}>
                  {data.amountInWords || 'Amount in words will appear here'}
                </div>
              </div>
              <div>
                <div className={`${headerCellStyle} text-left`}>Terms and conditions:</div>
                <div className={`${borderStyle} p-2 min-h-[80px] text-xs`}>
                  {data.termsAndConditions || 'Terms and conditions will appear here'}
                </div>
              </div>
            </div>

            {/* Right Side - Totals */}
            <div>
              <table className={`w-full border-collapse ${borderStyle}`}>
                <tbody>
                  <tr>
                    <td className={`${dataCellStyle} text-right font-medium`}>Subtotal</td>
                    <td className={`${dataCellStyle} text-right`}>₹ {data.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className={`${dataCellStyle} text-right font-medium`}>Discount</td>
                    <td className={`${dataCellStyle} text-right`}>₹ {data.discount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className={`${dataCellStyle} text-right font-medium`}>Delivery charges</td>
                    <td className={`${dataCellStyle} text-right`}>₹ {data.deliveryCharges.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td className={`${dataCellStyle} text-right font-bold`}>Total amount</td>
                    <td className={`${dataCellStyle} text-right font-bold`}>₹ {data.totalAmount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              
              {/* Seal and Signature */}
              <div className={`${borderStyle} mt-4 p-4 min-h-[80px] text-right`}>
                <div className="text-xs text-gray-500 mt-12">Seal and signature</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-4 border-t border-gray-400">
          <p className="text-xs font-medium">Thanks for doing business with us. Please visit us again !!!</p>
        </div>
      </div>
    );
  }
);

PrintableInvoice.displayName = 'PrintableInvoice';
