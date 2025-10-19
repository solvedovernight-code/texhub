import React, { useEffect } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { ChemicalItem, ITEM_TYPES, convertToSubUnits, calculateQtyFromDosing, calculateQtyFromShade } from '../types/chemical';
import { Button } from './ui/button';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import * as Select from '@radix-ui/react-select'; // Import Radix UI Select
import { TypedMemoryInput } from './TypedMemoryInput';

interface ChemicalItemsTableProps {
  items: ChemicalItem[];
  totalWater: number | null;
  fabricWeight: number | null;
  onItemsChange: (items: ChemicalItem[]) => void;
}

export const ChemicalItemsTable: React.FC<ChemicalItemsTableProps> = ({
  items,
  totalWater,
  fabricWeight,
  onItemsChange,
}) => {
  const addNewItem = () => {
    onItemsChange([
      ...items,
      {
        itemType: '',
        itemName: '',
        lotNo: '',
        dosing: null,
        shade: null,
        qty: { kg: null, gm: null, mg: null },
        unitPrice: null,
        costing: 0,
        remarks: '',
        highlight: false,
      },
    ]);
  };

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ChemicalItem, value: any) => {
    const newItems = [...items];
    const currentItem = { ...newItems[index] };

    // Handle Dyeing step special case
    if (field === 'itemType' && value === 'Dyeing step') {
      currentItem.itemType = value;
      currentItem.itemName = '';
      currentItem.lotNo = '';
      currentItem.dosing = null;
      currentItem.shade = null;
      currentItem.qty = { kg: null, gm: null, mg: null };
      currentItem.unitPrice = null;
      currentItem.costing = 0;
      currentItem.remarks = '';
    } else if (field === 'itemType' && currentItem.itemType === 'Dyeing step' && value !== 'Dyeing step') {
      // Reset values when changing from Dyeing step to another type
      currentItem.itemType = value;
      currentItem.itemName = '';
      currentItem.lotNo = '';
      currentItem.dosing = null;
      currentItem.shade = null;
      currentItem.qty = { kg: null, gm: null, mg: null };
      currentItem.unitPrice = null;
      currentItem.costing = 0;
      currentItem.remarks = '';
    } else if (field === 'highlight') {
      currentItem.highlight = value as boolean;
    } else if (field === 'dosing') {
      const dosing = value === '' ? null : !isNaN(Number(value)) ? Number(value) : currentItem.dosing;
      currentItem.dosing = dosing;
      currentItem.shade = null; // Clear shade if dosing is entered
      const calculatedQtyKg = calculateQtyFromDosing(dosing, totalWater);
      currentItem.qty = convertToSubUnits(calculatedQtyKg);
    } else if (field === 'shade') {
      const shade = value === '' ? null : !isNaN(Number(value)) ? Number(value) : currentItem.shade;
      currentItem.shade = shade;
      currentItem.dosing = null; // Clear dosing if shade is entered
      const calculatedQtyKg = calculateQtyFromShade(shade, fabricWeight);
      currentItem.qty = convertToSubUnits(calculatedQtyKg);
    } else if (field === 'unitPrice') {
      const unitPrice = value !== '' && !isNaN(Number(value)) ? Number(value) : null;
      currentItem.unitPrice = unitPrice;
    } else {
      // Ensure boolean values are handled correctly if other boolean fields exist
      if (typeof currentItem[field] === 'boolean' && field !== 'highlight') {
        currentItem[field] = Boolean(value);
      } else if (field !== 'highlight') {
        currentItem[field] = value;
      }
    }

    // Recalculate costing whenever relevant fields change
    const totalQtyKg = (currentItem.qty.kg || 0) + (currentItem.qty.gm || 0) / 1000 + (currentItem.qty.mg || 0) / 1000000;
    currentItem.costing = totalQtyKg * (currentItem.unitPrice || 0);


    newItems[index] = currentItem;
    onItemsChange(newItems);
  };


  useEffect(() => {
    let changed = false;
    const updatedItems = items.map(item => {
      let newItem = { ...item };
      let calculatedQtyKg: number | null = null;

      // Only recalculate if not a "Dyeing step"
      if (item.itemType !== 'Dyeing step') {
        if (item.dosing !== null && totalWater !== null) {
          calculatedQtyKg = calculateQtyFromDosing(item.dosing, totalWater);
        } else if (item.shade !== null && fabricWeight !== null) {
          calculatedQtyKg = calculateQtyFromShade(item.shade, fabricWeight);
        } else {
           calculatedQtyKg = null;
        }

        const newQty = convertToSubUnits(calculatedQtyKg);

        if (JSON.stringify(newItem.qty) !== JSON.stringify(newQty)) {
            newItem.qty = newQty;
            changed = true;
        }

        const totalQtyKgForCosting = (newItem.qty.kg || 0) + (newItem.qty.gm || 0) / 1000 + (newItem.qty.mg || 0) / 1000000;
        const newCosting = totalQtyKgForCosting * (newItem.unitPrice || 0);

        if (newItem.costing !== newCosting) {
            newItem.costing = newCosting;
            changed = true;
        }
      } else {
        // Ensure these are '-------' or 0 for Dyeing step, even on recalculation trigger
        // For Dyeing step, keep the itemName as user input, but reset other fields
        if (newItem.lotNo !== '') { newItem.lotNo = ''; changed = true; }
        if (newItem.dosing !== null) { newItem.dosing = null; changed = true; }
        if (newItem.shade !== null) { newItem.shade = null; changed = true; }
        if (newItem.qty.kg !== null || newItem.qty.gm !== null || newItem.qty.mg !== null) { newItem.qty = { kg: null, gm: null, mg: null }; changed = true; }
        if (newItem.unitPrice !== null) { newItem.unitPrice = null; changed = true; }
        if (newItem.costing !== 0) { newItem.costing = 0; changed = true; }
        if (newItem.remarks !== '') { newItem.remarks = ''; changed = true; }
      }

      return newItem;
    });

    if (changed) {
        if (JSON.stringify(items) !== JSON.stringify(updatedItems)) {
            onItemsChange(updatedItems);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalWater, fabricWeight, items]);

  // Common classes for Radix UI Select
  const selectTriggerClasses = "flex items-center justify-between w-full rounded-md border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-1 px-2 text-sm transition-all duration-200 hover:border-primary/50";
  const selectContentClasses = "overflow-hidden rounded-lg bg-surface border border-border shadow-lg z-50";
  const selectViewportClasses = "p-1";

  const SelectItemContent = ({ children, value }: { children: React.ReactNode; value: string }) => (
    <Select.Item
      value={value}
      className="relative flex items-center rounded-md py-1.5 pl-3 pr-9 text-text text-sm outline-none data-[highlighted]:bg-primary/20 data-[highlighted]:text-primary data-[highlighted]:outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors duration-200"
    >
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className="absolute right-3 inline-flex items-center justify-center text-primary">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </Select.ItemIndicator>
    </Select.Item>
  );

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-slate-900">Chemical Items</h3>
        <Button
          onClick={addNewItem}
          variant="secondary"
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-border table-fixed bg-background text-foreground">
          <colgroup>
            <col style={{ width: '11%' }} /> {/* Item Type - Adjusted */}
            <col style={{ width: '24%' }} /> {/* Item Name - Increased */}
            <col style={{ width: '9%' }} /> {/* Lot No - Adjusted */}
            <col style={{ width: '6%' }} />  {/* Dosing - Reduced */}
            <col style={{ width: '6%' }} />  {/* Shade - Reduced */}
            <col style={{ width: '5%' }} />  {/* Qty kg */}
            <col style={{ width: '5%' }} />  {/* Qty gm */}
            <col style={{ width: '5%' }} />  {/* Qty mg */}
            <col style={{ width: '6%' }} />  {/* Unit Price - Reduced */}
            <col style={{ width: '7%' }} />  {/* Costing - Adjusted */}
            <col style={{ width: '9%' }} />  {/* Remarks - Increased */}
            <col style={{ width: '7%' }} />  {/* Actions - Adjusted */}
          </colgroup>
          <thead className="bg-muted/50">
            <tr>
              <th className="border border-border px-2 py-2 text-center text-xs font-medium text-foreground uppercase tracking-wider">Item Type</th>
              {/* Increased width implicitly via colgroup */}
              <th className="border border-border px-2 py-2 text-center text-xs font-medium text-foreground uppercase tracking-wider">Item Name</th>
              <th className="border border-border px-2 py-2 text-center text-xs font-medium text-foreground uppercase tracking-wider">Lot No</th>
              {/* Reduced padding */}
              <th className="border border-border px-1 py-2 text-center text-xs font-medium text-foreground uppercase tracking-wider">Dosing (g/l)</th>
              {/* Reduced padding */}
              <th className="border border-border px-1 py-2 text-center text-xs font-medium text-foreground uppercase tracking-wider">Shade (%)</th>
              <th colSpan={3} className="border border-border px-1 py-2 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                Quantity
                <div className="grid grid-cols-3 gap-0 mt-0.5 text-[10px] text-foreground">
                  <div className="border border-border py-0.5 bg-muted/30">KG</div>
                  <div className="border border-border py-0.5 bg-muted/30">GM</div>
                  <div className="border border-border py-0.5 bg-muted/30">MG</div>
                </div>
              </th>
              {/* Reduced padding */}
              <th className="border border-border px-1 py-2 text-center text-xs font-medium text-foreground uppercase tracking-wider">Unit Price</th>
              {/* Reduced padding */}
              <th className="border border-border px-1 py-2 text-center text-xs font-medium text-foreground uppercase tracking-wider">Costing</th>
              <th className="border border-border px-2 py-2 text-center text-xs font-medium text-foreground uppercase tracking-wider">Remarks</th>
              <th className="border border-border px-2 py-2 text-center text-xs font-medium text-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <Droppable droppableId="chemicalItems">
            {(providedDroppable) => (
              <tbody
                className="bg-background"
                ref={providedDroppable.innerRef}
                {...providedDroppable.droppableProps}
              >
                {items.map((item, index) => (
                  <Draggable key={`item-${index}`} draggableId={`item-${index}`} index={index}>
                    {(providedDraggable, snapshot) => (
                      <tr
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        style={{
                          ...providedDraggable.draggableProps.style,
                          backgroundColor: snapshot.isDragging ? 'hsl(var(--muted))' : (item.highlight ? 'hsl(var(--accent))' : 'hsl(var(--background))'),
                          boxShadow: snapshot.isDragging ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
                        }}
                        className={`${item.highlight ? 'bg-accent' : 'bg-background'} ${snapshot.isDragging ? 'shadow-lg' : ''} hover:bg-muted/30 transition-colors`}
                      >
                        <td className="border border-border px-2 py-1.5 whitespace-nowrap text-center bg-background">
                          <Select.Root
                            value={item.itemType}
                            onValueChange={(value) => updateItem(index, 'itemType', value)}
                          >
                            <Select.Trigger className={selectTriggerClasses} aria-label="Item Type">
                              <Select.Value placeholder="Select Type" />
                              <Select.Icon className="text-textSecondary">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                              </Select.Icon>
                            </Select.Trigger>
                            <Select.Portal>
                              <Select.Content className={selectContentClasses}>
                                <Select.Viewport className={selectViewportClasses}>
                                  {ITEM_TYPES
                                    .filter(type => type !== '') // Ensure no empty strings are passed as values
                                    .map(type => (
                                    <SelectItemContent key={type} value={type}>{type}</SelectItemContent>
                                  ))}
                                </Select.Viewport>
                              </Select.Content>
                            </Select.Portal>
                          </Select.Root>
                        </td>
                        {item.itemType === 'Dyeing step' ? (
                          // Merged cell for Dyeing step
                          <td colSpan={10} className="border border-border px-2 py-1.5 text-center bg-gray-100">
                            <input
                              type="text"
                              value={item.itemName || ''}
                              onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                              className="w-full border border-border bg-background rounded-md px-2 py-1 text-sm text-center focus:ring-2 focus:ring-primary focus:border-primary text-foreground font-medium"
                              placeholder="Enter dyeing step description (e.g., 'Heat to 60°C', 'Add Salt', 'Cool Down')"
                            />
                          </td>
                        ) : (
                          <>
                            {/* Increased width implicitly via colgroup */}
                            <td className="border border-border px-2 py-1.5 whitespace-nowrap text-center bg-background">
                              <TypedMemoryInput
                                value={item.itemName}
                                onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                                className="w-full border border-border bg-background rounded-md px-2 py-0 text-sm focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                                storageKey="itemName"
                                placeholder="Name"
                              />
                            </td>
                            <td className="border border-border px-2 py-1.5 whitespace-nowrap text-center bg-background">
                              <TypedMemoryInput
                                value={item.lotNo}
                                onChange={(e) => updateItem(index, 'lotNo', e.target.value)}
                                className="w-full border border-border bg-background rounded-md px-2 py-0 text-sm focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                                storageKey="lotNo"
                                placeholder="Lot #"
                              />
                            </td>
                            {/* Reduced padding, added text-center */}
                            <td className="border border-border px-1 py-1.5 whitespace-nowrap text-center bg-background">
                              <input
                                type="number"
                                value={item.dosing ?? ''}
                                onChange={(e) => updateItem(index, 'dosing', e.target.value)}
                                className="w-full border border-border bg-background rounded-md px-1 py-0 text-sm text-center focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                                placeholder="g/l"
                                min="0"
                                step="any"
                                disabled={item.shade !== null && item.shade !== undefined && String(item.shade).trim() !== ''}
                              />
                            </td>
                            {/* Reduced padding, added text-center */}
                            <td className="border border-border px-1 py-1.5 whitespace-nowrap text-center bg-background">
                              <input
                                type="number"
                                value={item.shade ?? ''}
                                onChange={(e) => updateItem(index, 'shade', e.target.value)}
                                className="w-full border border-border bg-background rounded-md px-1 py-0 text-sm text-center focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                                placeholder="%"
                                min="0"
                                step="any"
                                disabled={item.dosing !== null && item.dosing !== undefined && String(item.dosing).trim() !== ''}
                              />
                            </td>
                            <td className="border border-border px-0.5 py-1.5 whitespace-nowrap text-center bg-background">
                              <input
                                type="text"
                                value={item.qty.kg !== null ? item.qty.kg.toFixed(0) : ''}
                                readOnly
                                className="w-full border-0 bg-muted/30 focus:ring-0 text-center p-1 text-sm rounded text-foreground"
                              />
                            </td>
                            <td className="border border-border px-0.5 py-1.5 whitespace-nowrap text-center bg-background">
                              <input
                                type="text"
                                value={item.qty.gm !== null ? item.qty.gm.toFixed(0) : ''}
                                readOnly
                                className="w-full border-0 bg-muted/30 focus:ring-0 text-center p-1 text-sm rounded text-foreground"
                              />
                            </td>
                            <td className="border border-border px-0.5 py-1.5 whitespace-nowrap text-center bg-background">
                              <input
                                type="text"
                                value={item.qty.mg !== null ? item.qty.mg.toFixed(0) : ''}
                                readOnly
                                className="w-full border-0 bg-muted/30 focus:ring-0 text-center p-1 text-sm rounded text-foreground"
                              />
                            </td>
                            {/* Reduced padding, added text-center */}
                            <td className="border border-border px-1 py-1.5 whitespace-nowrap text-center bg-background">
                              <input
                                type="number"
                                value={item.unitPrice ?? ''}
                                onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                                className="w-full border border-border bg-background rounded-md px-1 py-0 text-sm text-center focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                                placeholder="Price"
                                min="0"
                                step="any"
                              />
                            </td>
                            {/* Reduced padding */}
                            <td className="border border-border px-1 py-1.5 whitespace-nowrap text-center bg-background">
                              <input
                                type="text"
                                value={item.costing.toFixed(2)}
                                readOnly
                                className="w-full border-0 bg-muted/30 focus:ring-0 text-center p-1 text-sm rounded text-foreground"
                              />
                            </td>
                            <td className="border border-border px-2 py-1.5 whitespace-nowrap text-center bg-background">
                              <TypedMemoryInput
                                value={item.remarks}
                                onChange={(e) => updateItem(index, 'remarks', e.target.value)}
                                className="w-full border border-border bg-background rounded-md px-2 py-0 text-sm focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                                storageKey="remarks"
                                placeholder="Remarks"
                              />
                            </td>
                          </>
                        )}
                        <td className="border border-border px-2 py-1.5 whitespace-nowrap text-center align-middle bg-background">
                          <div className="flex items-center justify-center space-x-1"> {/* Reduced space */}
                            <div
                              {...providedDraggable.dragHandleProps}
                              className="cursor-grab text-muted-foreground hover:text-foreground p-0.5"
                              title="Drag to reorder"
                            >
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <input
                              type="checkbox"
                              checked={item.highlight}
                              onChange={(e) => updateItem(index, 'highlight', e.target.checked)}
                              className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                              title="Highlight row"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-700 p-0.5" /* Adjusted padding */
                              title="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Draggable>
                ))}
                {providedDroppable.placeholder}
              </tbody>
            )}
          </Droppable>
          {/* Updated Footer */}
          <tfoot className="bg-muted/50">
            <tr>
              {/* Span columns before Unit Price (Item Type, Item Name, Lot No, Dosing, Shade, Qty KG, Qty GM, Qty MG) = 8 columns */}
              <td colSpan={8} className="border border-border px-1 py-3 bg-muted/30"></td>
              {/* Label under Unit Price - Changed text-right to text-center */}
              <td className="border border-border px-1 py-3 text-center font-medium text-foreground bg-muted/30">
                Total:
              </td>
              {/* Sum under Costing */}
              <td className="border border-border px-1 py-3 font-medium text-center text-foreground bg-accent">
                {items.reduce((sum, item) => sum + item.costing, 0).toFixed(2)}
              </td>
              {/* Span remaining columns (Remarks, Actions) = 2 columns */}
              <td colSpan={2} className="border border-border bg-muted/30"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
