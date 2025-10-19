import React from 'react';
import { Order, ORDER_STATUSES, PRIORITY_LEVELS } from '../types/order';

interface PrintableOrderProps {
  data: Order;
}

export const PrintableOrder = React.forwardRef<HTMLDivElement, PrintableOrderProps>(
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

    const getStatusLabel = (status: string) => {
      return ORDER_STATUSES.find(s => s.value === status)?.label || status;
    };

    const getPriorityLabel = (priority: string) => {
      return PRIORITY_LEVELS.find(p => p.value === priority)?.label || priority;
    };

    return (
      <div ref={ref} className="p-8 bg-white text-black text-xs flex flex-col min-h-[1050px] relative">
        <div className="flex-grow">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-lg font-bold">{companyName}</h1>
              <p className="text-[10px] text-gray-600 max-w-xs">{companyAddress}</p>
              <p className="text-[10px] text-gray-600">Phone: {companyPhone}</p>
              <p className="text-[10px] text-gray-600">Email: {companyEmail}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-500 mb-2">WORK ORDER</h2>
              <div className="text-xs space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="font-medium">Order #:</span>
                  <span>{data.orderNumber}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="font-medium">Order Date:</span>
                  <span>{new Date(data.orderDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="font-medium">Delivery Date:</span>
                  <span>{data.deliveryDate ? new Date(data.deliveryDate).toLocaleDateString() : 'TBD'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="font-medium">Status:</span>
                  <span>{getStatusLabel(data.status)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="font-medium">Priority:</span>
                  <span>{getPriorityLabel(data.priority)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-6">
            <div className={`${headerCellStyle} text-left`}>CUSTOMER INFORMATION</div>
            <div className={`${borderStyle} p-2 min-h-[80px] text-xs`}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div><strong>Name:</strong> {data.customerName || '[Name]'}</div>
                  <div><strong>Company:</strong> {data.customerCompany || '[Company]'}</div>
                  <div><strong>Email:</strong> {data.customerEmail || '[Email]'}</div>
                </div>
                <div className="space-y-1">
                  <div><strong>Phone:</strong> {data.customerPhone || '[Phone]'}</div>
                  <div><strong>Address:</strong> {data.customerAddress || '[Address]'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <table className={`w-full border-collapse ${borderStyle} mb-4`}>
            <thead>
              <tr className="bg-gray-100">
                <th className={headerCellStyle}>SL</th>
                <th className={headerCellStyle}>FABRIC TYPE</th>
                <th className={headerCellStyle}>COLOR</th>
                <th className={headerCellStyle}>QUANTITY</th>
                <th className={headerCellStyle}>UNIT</th>
                <th className={headerCellStyle}>UNIT PRICE</th>
                <th className={headerCellStyle}>TOTAL PRICE</th>
                <th className={headerCellStyle}>GSM</th>
                <th className={headerCellStyle}>WIDTH</th>
                <th className={headerCellStyle}>DYEING METHOD</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={item.id}>
                  <td className={`${dataCellStyle} text-center`}>{index + 1}</td>
                  <td className={`${dataCellStyle} text-left`}>{item.fabricType || 'N/A'}</td>
                  <td className={`${dataCellStyle} text-left`}>{item.color || 'N/A'}</td>
                  <td className={`${dataCellStyle} text-center`}>{item.quantity}</td>
                  <td className={`${dataCellStyle} text-center`}>{item.unit}</td>
                  <td className={`${dataCellStyle} text-right`}>₹ {item.unitPrice.toFixed(2)}</td>
                  <td className={`${dataCellStyle} text-right`}>₹ {item.totalPrice.toFixed(2)}</td>
                  <td className={`${dataCellStyle} text-center`}>{item.gsm || 'N/A'}</td>
                  <td className={`${dataCellStyle} text-center`}>{item.width || 'N/A'}</td>
                  <td className={`${dataCellStyle} text-left`}>{item.dyeingMethod || 'N/A'}</td>
                </tr>
              ))}
              
              {/* Empty rows for consistent formatting */}
              {Array.from({ length: Math.max(0, 8 - data.items.length) }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td className={`${dataCellStyle} h-6`}></td>
                  <td className={dataCellStyle}></td>
                  <td className={dataCellStyle}></td>
                  <td className={dataCellStyle}></td>
                  <td className={dataCellStyle}></td>
                  <td className={dataCellStyle}></td>
                  <td className={dataCellStyle}></td>
                  <td className={dataCellStyle}></td>
                  <td className={dataCellStyle}></td>
                  <td className={dataCellStyle}></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Production Stages */}
          <div className="mb-6">
            <div className={`${headerCellStyle} text-left`}>PRODUCTION STAGES</div>
            <div className={`${borderStyle} p-2`}>
              <div className="grid grid-cols-3 gap-4 text-xs">
                {data.productionStages.map((stage, index) => (
                  <div key={stage.id} className="space-y-1">
                    <div><strong>{stage.stage.replace('-', ' ').toUpperCase()}:</strong></div>
                    <div>Status: {stage.status.replace('-', ' ')}</div>
                    <div>Assigned: {stage.assignedTo || 'TBD'}</div>
                    <div>Est. Duration: {stage.estimatedDuration}h</div>
                    {stage.actualDuration && <div>Actual: {stage.actualDuration}h</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className={`${headerCellStyle} text-left`}>SPECIAL INSTRUCTIONS</div>
              <div className={`${borderStyle} p-2 min-h-[60px] text-xs`}>
                {data.specialInstructions || 'No special instructions'}
              </div>
            </div>
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
                    <td className={`${dataCellStyle} text-right font-medium`}>Tax</td>
                    <td className={`${dataCellStyle} text-right`}>₹ {data.tax.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className={`${dataCellStyle} text-right font-medium`}>Shipping</td>
                    <td className={`${dataCellStyle} text-right`}>₹ {data.shippingCost.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td className={`${dataCellStyle} text-right font-bold`}>Total Amount</td>
                    <td className={`${dataCellStyle} text-right font-bold`}>₹ {data.totalAmount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Shipment Details */}
          {data.shipmentDetails && (
            <div className="mb-6">
              <div className={`${headerCellStyle} text-left`}>SHIPMENT DETAILS</div>
              <div className={`${borderStyle} p-2 text-xs`}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div><strong>Tracking:</strong> {data.shipmentDetails.trackingNumber || 'TBD'}</div>
                    <div><strong>Carrier:</strong> {data.shipmentDetails.carrier || 'TBD'}</div>
                    <div><strong>Method:</strong> {data.shipmentDetails.shippingMethod || 'TBD'}</div>
                  </div>
                  <div className="space-y-1">
                    <div><strong>Est. Delivery:</strong> {data.shipmentDetails.estimatedDelivery ? new Date(data.shipmentDetails.estimatedDelivery).toLocaleDateString() : 'TBD'}</div>
                    <div><strong>Contact:</strong> {data.shipmentDetails.contactPerson || 'TBD'}</div>
                    <div><strong>Phone:</strong> {data.shipmentDetails.contactPhone || 'TBD'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-4">
          <div className="text-center">
            <div className="border-t border-gray-400 pt-1 mx-4">
              <p className="font-semibold">Order Received By</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-1 mx-4">
              <p className="font-semibold">Production Manager</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-1 mx-4">
              <p className="font-semibold">Quality Approved By</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-4 border-t border-gray-400">
          <p className="text-xs font-medium">Thank you for your business. We are committed to delivering quality textile products.</p>
        </div>
      </div>
    );
  }
);

PrintableOrder.displayName = 'PrintableOrder';