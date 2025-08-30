import React from 'react';
import { ProformaInvoiceData } from '../types/invoice';
import { TypedMemoryInput } from './TypedMemoryInput';

interface ProformaInvoiceFormProps {
  data: ProformaInvoiceData;
  onChange: (data: ProformaInvoiceData) => void;
}

export function ProformaInvoiceForm({ data, onChange }: ProformaInvoiceFormProps) {
  const handleChange = (field: keyof ProformaInvoiceData, value: string | number) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  // Common input classes
  const inputClasses = "mt-1 block w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface text-text py-2 px-3 transition-all duration-200 hover:border-primary/50";
  const labelClasses = "block text-sm font-semibold text-textSecondary mb-1";

  return (
    <div className="space-y-8">
      {/* Invoice Header */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Invoice Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={labelClasses}>Invoice Number</label>
            <input
              type="text"
              value={data.invoiceNumber}
              onChange={(e) => handleChange('invoiceNumber', e.target.value)}
              className={inputClasses}
              placeholder="PI240001"
            />
          </div>
          <div>
            <label className={labelClasses}>Invoice Date</label>
            <input
              type="date"
              value={data.invoiceDate}
              onChange={(e) => handleChange('invoiceDate', e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses}>Due Date</label>
            <input
              type="date"
              value={data.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses}>Customer ID</label>
            <input
              type="text"
              value={data.customerId}
              onChange={(e) => handleChange('customerId', e.target.value)}
              className={inputClasses}
              placeholder="C001"
            />
          </div>
        </div>
      </div>

      {/* Customer and Shipping Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4 bg-muted/50 px-3 py-2 rounded">Customer</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClasses}>Name</label>
              <TypedMemoryInput
                value={data.customerName}
                onChange={(e) => handleChange('customerName', e.target.value)}
                className={inputClasses}
                storageKey="customerName"
                placeholder="Customer Name"
              />
            </div>
            <div>
              <label className={labelClasses}>Company Name</label>
              <TypedMemoryInput
                value={data.customerCompany}
                onChange={(e) => handleChange('customerCompany', e.target.value)}
                className={inputClasses}
                storageKey="customerCompany"
                placeholder="Company Name"
              />
            </div>
            <div>
              <label className={labelClasses}>Address</label>
              <textarea
                value={data.customerAddress}
                onChange={(e) => handleChange('customerAddress', e.target.value)}
                className={`${inputClasses} min-h-[80px]`}
                rows={3}
                placeholder="Street Address"
              />
            </div>
            <div>
              <label className={labelClasses}>City, ST, Zip Code</label>
              <TypedMemoryInput
                value={data.customerCity}
                onChange={(e) => handleChange('customerCity', e.target.value)}
                className={inputClasses}
                storageKey="customerCity"
                placeholder="City, State, Zip"
              />
            </div>
            <div>
              <label className={labelClasses}>Phone</label>
              <TypedMemoryInput
                type="tel"
                value={data.customerPhone}
                onChange={(e) => handleChange('customerPhone', e.target.value)}
                className={inputClasses}
                storageKey="customerPhone"
                placeholder="Phone Number"
              />
            </div>
          </div>
        </div>

        {/* Ship To Information */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4 bg-muted/50 px-3 py-2 rounded">Ship To</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClasses}>Name</label>
              <TypedMemoryInput
                value={data.shipToName}
                onChange={(e) => handleChange('shipToName', e.target.value)}
                className={inputClasses}
                storageKey="shipToName"
                placeholder="Recipient Name"
              />
            </div>
            <div>
              <label className={labelClasses}>Company Name</label>
              <TypedMemoryInput
                value={data.shipToCompany}
                onChange={(e) => handleChange('shipToCompany', e.target.value)}
                className={inputClasses}
                storageKey="shipToCompany"
                placeholder="Company Name"
              />
            </div>
            <div>
              <label className={labelClasses}>Address</label>
              <textarea
                value={data.shipToAddress}
                onChange={(e) => handleChange('shipToAddress', e.target.value)}
                className={`${inputClasses} min-h-[80px]`}
                rows={3}
                placeholder="Shipping Address"
              />
            </div>
            <div>
              <label className={labelClasses}>City, ST, Zip Code</label>
              <TypedMemoryInput
                value={data.shipToCity}
                onChange={(e) => handleChange('shipToCity', e.target.value)}
                className={inputClasses}
                storageKey="shipToCity"
                placeholder="City, State, Zip"
              />
            </div>
            <div>
              <label className={labelClasses}>Phone</label>
              <TypedMemoryInput
                type="tel"
                value={data.shipToPhone}
                onChange={(e) => handleChange('shipToPhone', e.target.value)}
                className={inputClasses}
                storageKey="shipToPhone"
                placeholder="Phone Number"
              />
            </div>
          </div>
        </div>

        {/* Shipping Details */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4 bg-muted/50 px-3 py-2 rounded">Shipping Details</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClasses}>Transportation Name</label>
              <TypedMemoryInput
                value={data.transportationName}
                onChange={(e) => handleChange('transportationName', e.target.value)}
                className={inputClasses}
                storageKey="transportationName"
                placeholder="Transport Company"
              />
            </div>
            <div>
              <label className={labelClasses}>Shipping Date</label>
              <input
                type="date"
                value={data.shippingDate}
                onChange={(e) => handleChange('shippingDate', e.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>Way Bill</label>
              <TypedMemoryInput
                value={data.wayBill}
                onChange={(e) => handleChange('wayBill', e.target.value)}
                className={inputClasses}
                storageKey="wayBill"
                placeholder="Way Bill Number"
              />
            </div>
            <div>
              <label className={labelClasses}>Vehicle No</label>
              <TypedMemoryInput
                value={data.vehicleNo}
                onChange={(e) => handleChange('vehicleNo', e.target.value)}
                className={inputClasses}
                storageKey="vehicleNo"
                placeholder="Vehicle Number"
              />
            </div>
            <div>
              <label className={labelClasses}>Driver Phone No</label>
              <TypedMemoryInput
                type="tel"
                value={data.driverPhone}
                onChange={(e) => handleChange('driverPhone', e.target.value)}
                className={inputClasses}
                storageKey="driverPhone"
                placeholder="Driver Phone"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Amount in Words</h3>
          <textarea
            value={data.amountInWords}
            onChange={(e) => handleChange('amountInWords', e.target.value)}
            className={`${inputClasses} min-h-[100px]`}
            rows={4}
            placeholder="Amount in words will be auto-generated"
          />
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Terms and Conditions</h3>
          <textarea
            value={data.termsAndConditions}
            onChange={(e) => handleChange('termsAndConditions', e.target.value)}
            className={`${inputClasses} min-h-[100px]`}
            rows={4}
            placeholder="Enter terms and conditions"
          />
        </div>
      </div>
    </div>
  );
}
