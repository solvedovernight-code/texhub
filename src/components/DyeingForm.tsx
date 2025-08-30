import React from 'react';
import * as Select from '@radix-ui/react-select'; // Import Radix UI Select
import { DyeingFormData, DYEING_TYPES, COLOR_GROUPS, calculateTotalWater } from '../types';
import { TypedMemoryInput } from './TypedMemoryInput';

interface DyeingFormProps {
  data: DyeingFormData;
  onChange: (data: DyeingFormData) => void;
}

export function DyeingForm({ data, onChange }: DyeingFormProps) {
  const handleChange = (field: keyof DyeingFormData, value: string | number | null) => {
    const newData = {
      ...data,
      [field]: value,
    };

    // Update total water when fabric weight or liquor ratio changes
    if (field === 'fabricWeight' || field === 'liquorRatio') {
      const fabricWeight = field === 'fabricWeight' ? (value as number) : data.fabricWeight;
      const liquorRatio = field === 'liquorRatio' ? (value as number) : data.liquorRatio;

      // Ensure non-negative values
      newData.fabricWeight = fabricWeight === null ? null : Math.max(0, fabricWeight);
      newData.liquorRatio = liquorRatio === null ? null : Math.max(0, liquorRatio);
      newData.totalWater = calculateTotalWater(newData.fabricWeight, newData.liquorRatio);
    }

    onChange(newData);
  };

  // Common input classes - Updated for dark theme and consistency
  const inputClasses = "mt-1 block w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface text-text py-2 px-3 transition-all duration-200 hover:border-primary/50";
  // Select trigger classes - Updated for dark theme and custom arrow
  const selectTriggerClasses = "flex items-center justify-between mt-1 w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface text-text py-2 px-3 transition-all duration-200 hover:border-primary/50";
  // Label classes - Updated for dark theme
  const labelClasses = "block text-sm font-semibold text-textSecondary mb-1";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Column 1 */}
      <div className="space-y-4">
        <div>
          <label className={labelClasses}>Project</label>
          <TypedMemoryInput
            value={data.project}
            onChange={(e) => handleChange('project', e.target.value)}
            className={inputClasses}
            storageKey="project"
            placeholder="Enter project name"
          />
        </div>
        <div>
          <label className={labelClasses}>Fabric Type</label>
          <TypedMemoryInput
            value={data.fabricType}
            onChange={(e) => handleChange('fabricType', e.target.value)}
            className={inputClasses}
            storageKey="fabricType"
            placeholder="Enter fabric type"
          />
        </div>
        <div>
          <label className={labelClasses}>Color</label>
          <TypedMemoryInput
            value={data.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className={inputClasses}
            storageKey="color"
            placeholder="Enter color"
          />
        </div>
        <div>
          <label className={labelClasses}>Lab Dip No.</label>
          <TypedMemoryInput
            value={data.labDipNo}
            onChange={(e) => handleChange('labDipNo', e.target.value)}
            className={inputClasses}
            storageKey="labDipNo"
            placeholder="Enter lab dip number"
          />
        </div>
      </div>

      {/* Column 2 */}
      <div className="space-y-4">
        <div>
          <label className={labelClasses}>Batch No.</label>
          <TypedMemoryInput
            value={data.batchNo}
            onChange={(e) => handleChange('batchNo', e.target.value)}
            className={inputClasses}
            storageKey="batchNo"
            placeholder="Enter batch number"
          />
        </div>
        <div>
          <label className={labelClasses}>Buyer</label>
          <TypedMemoryInput
            value={data.buyer}
            onChange={(e) => handleChange('buyer', e.target.value)}
            className={inputClasses}
            storageKey="buyer"
            placeholder="Enter buyer name"
          />
        </div>
        <div>
          <label className={labelClasses}>F/GSM</label>
          <TypedMemoryInput
            value={data.gsm}
            onChange={(e) => handleChange('gsm', e.target.value)}
            className={inputClasses}
            storageKey="gsm"
            placeholder="Enter GSM"
          />
        </div>
        <div>
          <label className={labelClasses}>Machine No.</label>
          <TypedMemoryInput
            value={data.machineNo}
            onChange={(e) => handleChange('machineNo', e.target.value)}
            className={inputClasses}
            storageKey="machineNo"
            placeholder="Enter machine number"
          />
        </div>
      </div>

      {/* Column 3 */}
      <div className="space-y-4">
        <div>
          <label className={labelClasses}>Date</label>
          <input
            type="date"
            value={data.reqDate}
            onChange={(e) => handleChange('reqDate', e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>Dying Type</label>
          <Select.Root value={data.dyingType || ''} onValueChange={(value) => handleChange('dyingType', value)}>
            <Select.Trigger className={selectTriggerClasses} aria-label="Dyeing Type">
              <Select.Value placeholder="Select Type" />
              <Select.Icon className="text-textSecondary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="overflow-hidden rounded-lg bg-surface border border-border shadow-lg z-50">
                <Select.Viewport className="p-1">
                  {DYEING_TYPES.map(type => (
                    <Select.Item
                      key={type}
                      value={type}
                      className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-text text-sm outline-none data-[highlighted]:bg-primary/20 data-[highlighted]:text-primary data-[highlighted]:outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors duration-200"
                    >
                      <Select.ItemText>{type}</Select.ItemText>
                      <Select.ItemIndicator className="absolute right-3 inline-flex items-center justify-center text-primary">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
        <div>
          <label className={labelClasses}>Color Group</label>
          <Select.Root value={data.colorGroup || ''} onValueChange={(value) => handleChange('colorGroup', value)}>
            <Select.Trigger className={selectTriggerClasses} aria-label="Color Group">
              <Select.Value placeholder="Select Group" />
              <Select.Icon className="text-textSecondary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="overflow-hidden rounded-lg bg-surface border border-border shadow-lg z-50">
                <Select.Viewport className="p-1">
                  {COLOR_GROUPS.map(group => (
                    <Select.Item
                      key={group}
                      value={group}
                      className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-text text-sm outline-none data-[highlighted]:bg-primary/20 data-[highlighted]:text-primary data-[highlighted]:outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors duration-200"
                    >
                      <Select.ItemText>{group}</Select.ItemText>
                      <Select.ItemIndicator className="absolute right-3 inline-flex items-center justify-center text-primary">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
        <div>
          <label className={labelClasses}>Composition</label>
          <TypedMemoryInput
            value={data.composition}
            onChange={(e) => handleChange('composition', e.target.value)}
            className={inputClasses}
            storageKey="composition"
            placeholder="e.g., 95% Cotton, 5% Elastane"
          />
        </div>
      </div>

      {/* Column 4 */}
      <div className="space-y-4">
        <div>
          <label className={labelClasses}>Fabric Weight (kg)</label>
          <input
            type="number"
            value={data.fabricWeight ?? ''}
            onChange={(e) => handleChange('fabricWeight', e.target.value ? Number(e.target.value) : null)}
            min="0"
            step="0.01"
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>Liquor Ratio</label>
          <input
            type="number"
            value={data.liquorRatio ?? ''}
            onChange={(e) => handleChange('liquorRatio', e.target.value ? Number(e.target.value) : null)}
            min="0"
            step="0.1"
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>Total Water</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="number"
              value={data.totalWater ?? ''}
              readOnly
              className="block w-full rounded-l-lg border border-border bg-surface/50 text-text/70 py-2 px-3"
            />
            <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-border bg-surface/50 text-textSecondary text-sm font-medium">
              L
            </span>
          </div>
        </div>
        <div>
          <label className={labelClasses}>Work Order</label>
          <TypedMemoryInput
            value={data.workOrder}
            onChange={(e) => handleChange('workOrder', e.target.value)}
            className={inputClasses}
            storageKey="workOrder"
            placeholder="Enter work order"
          />
        </div>
      </div>
    </div>
  );
}
