import React from 'react';
import { Order } from '../types/order';
import { TypedMemoryInput } from './TypedMemoryInput';
import * as Select from '@radix-ui/react-select';
import { PRIORITY_LEVELS } from '../types/order';

interface OrderFormProps {
  data: Order;
  onChange: (data: Order) => void;
}

export function OrderForm({ data, onChange }: OrderFormProps) {
  const handleChange = (field: keyof Order, value: string | number) => {
    const newData = {
      ...data,
      [field]: value,
    };

    // Calculate estimated completion date based on production stages
    if (field === 'orderDate') {
      const totalHours = data.productionStages.reduce((sum, stage) => sum + stage.estimatedDuration, 0);
      const estimatedDate = new Date(value as string);
      estimatedDate.setHours(estimatedDate.getHours() + totalHours);
      newData.estimatedCompletionDate = estimatedDate.toISOString().split('T')[0];
    }

    onChange(newData);
  };

  // Common input classes
  const inputClasses = "mt-1 block w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface text-text py-2 px-3 transition-all duration-200 hover:border-primary/50";
  const selectTriggerClasses = "flex items-center justify-between mt-1 w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface text-text py-2 px-3 transition-all duration-200 hover:border-primary/50";
  const labelClasses = "block text-sm font-semibold text-textSecondary mb-1";

  return (
    <div className="space-y-8">
      {/* Order Header */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Order Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={labelClasses}>Order Number</label>
            <input
              type="text"
              value={data.orderNumber}
              onChange={(e) => handleChange('orderNumber', e.target.value)}
              className={inputClasses}
              placeholder="ORD240001"
            />
          </div>
          <div>
            <label className={labelClasses}>Order Date</label>
            <input
              type="date"
              value={data.orderDate}
              onChange={(e) => handleChange('orderDate', e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses}>Delivery Date</label>
            <input
              type="date"
              value={data.deliveryDate}
              onChange={(e) => handleChange('deliveryDate', e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses}>Priority</label>
            <Select.Root value={data.priority} onValueChange={(value) => handleChange('priority', value)}>
              <Select.Trigger className={selectTriggerClasses}>
                <Select.Value placeholder="Select Priority" />
                <Select.Icon className="text-textSecondary">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="overflow-hidden rounded-lg bg-surface border border-border shadow-lg z-50">
                  <Select.Viewport className="p-1">
                    {PRIORITY_LEVELS.map(priority => (
                      <Select.Item
                        key={priority.value}
                        value={priority.value}
                        className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-text text-sm outline-none data-[highlighted]:bg-primary/20"
                      >
                        <Select.ItemText>{priority.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Customer Name</label>
            <TypedMemoryInput
              value={data.customerName}
              onChange={(e) => handleChange('customerName', e.target.value)}
              className={inputClasses}
              storageKey="orderCustomerName"
              placeholder="Customer Name"
            />
          </div>
          <div>
            <label className={labelClasses}>Company Name</label>
            <TypedMemoryInput
              value={data.customerCompany}
              onChange={(e) => handleChange('customerCompany', e.target.value)}
              className={inputClasses}
              storageKey="orderCustomerCompany"
              placeholder="Company Name"
            />
          </div>
          <div>
            <label className={labelClasses}>Email</label>
            <TypedMemoryInput
              type="email"
              value={data.customerEmail}
              onChange={(e) => handleChange('customerEmail', e.target.value)}
              className={inputClasses}
              storageKey="orderCustomerEmail"
              placeholder="customer@example.com"
            />
          </div>
          <div>
            <label className={labelClasses}>Phone</label>
            <TypedMemoryInput
              type="tel"
              value={data.customerPhone}
              onChange={(e) => handleChange('customerPhone', e.target.value)}
              className={inputClasses}
              storageKey="orderCustomerPhone"
              placeholder="Phone Number"
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClasses}>Address</label>
            <textarea
              value={data.customerAddress}
              onChange={(e) => handleChange('customerAddress', e.target.value)}
              className={`${inputClasses} min-h-[80px]`}
              rows={3}
              placeholder="Customer Address"
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Special Instructions</h3>
          <textarea
            value={data.specialInstructions || ''}
            onChange={(e) => handleChange('specialInstructions', e.target.value)}
            className={`${inputClasses} min-h-[100px]`}
            rows={4}
            placeholder="Any special requirements or instructions..."
          />
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Internal Notes</h3>
          <textarea
            value={data.internalNotes || ''}
            onChange={(e) => handleChange('internalNotes', e.target.value)}
            className={`${inputClasses} min-h-[100px]`}
            rows={4}
            placeholder="Internal notes for production team..."
          />
        </div>
      </div>
    </div>
  );
}