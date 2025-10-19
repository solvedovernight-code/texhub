import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { OrderItem, FABRIC_TYPES, DYEING_METHODS, UNITS } from '../types/order';
import { Button } from './ui/button';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import * as Select from '@radix-ui/react-select';

interface OrderItemsTableProps {
  items: OrderItem[];
  onItemsChange: (items: OrderItem[]) => void;
}

export const OrderItemsTable: React.FC<OrderItemsTableProps> = ({
  items,
  onItemsChange,
}) => {
  const addNewItem = () => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      fabricType: '',
      color: '',
      quantity: 1,
      unit: 'kg',
      unitPrice: 0,
      totalPrice: 0,
      gsm: '',
      width: '',
      specifications: '',
      dyeingMethod: '',
      finishingRequirements: '',
    };
    onItemsChange([...items, newItem]);
  };

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    const currentItem = { ...newItems[index] };

    if (field === 'quantity' || field === 'unitPrice') {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      currentItem[field] = numValue;
      currentItem.totalPrice = currentItem.quantity * currentItem.unitPrice;
    } else {
      currentItem[field] = value as any;
    }

    newItems[index] = currentItem;
    onItemsChange(newItems);
  };

  const borderStyle = "border border-border";
  const headerCellStyle = `${borderStyle} px-3 py-2 text-center bg-muted/50 font-medium text-foreground`;
  const dataCellStyle = `${borderStyle} px-2 py-1.5 text-center bg-background`;

  const SelectItemContent = ({ children, value }: { children: React.ReactNode; value: string }) => (
    <Select.Item
      value={value}
      className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-text text-sm outline-none data-[highlighted]:bg-primary/20"
    >
      <Select.ItemText>{children}</Select.ItemText>
    </Select.Item>
  );

  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Order Items</h3>
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
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={headerCellStyle}>SL</th>
              <th className={headerCellStyle}>Fabric Type</th>
              <th className={headerCellStyle}>Color</th>
              <th className={headerCellStyle}>Quantity</th>
              <th className={headerCellStyle}>Unit</th>
              <th className={headerCellStyle}>Unit Price</th>
              <th className={headerCellStyle}>Total Price</th>
              <th className={headerCellStyle}>GSM</th>
              <th className={headerCellStyle}>Width</th>
              <th className={headerCellStyle}>Dyeing Method</th>
              <th className={headerCellStyle}>Actions</th>
            </tr>
          </thead>
          <Droppable droppableId="orderItems">
            {(providedDroppable) => (
              <tbody
                className="bg-background"
                ref={providedDroppable.innerRef}
                {...providedDroppable.droppableProps}
              >
                {items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(providedDraggable, snapshot) => (
                      <tr
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        style={{
                          ...providedDraggable.draggableProps.style,
                          backgroundColor: snapshot.isDragging ? 'hsl(var(--muted))' : 'hsl(var(--background))',
                          boxShadow: snapshot.isDragging ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
                        }}
                        className={`${snapshot.isDragging ? 'shadow-lg' : ''} hover:bg-muted/30 transition-colors`}
                      >
                        <td className={dataCellStyle}>
                          <span>{index + 1}</span>
                        </td>
                        <td className={`${borderStyle} px-2 py-1.5 bg-background`}>
                          <Select.Root value={item.fabricType} onValueChange={(value) => updateItem(index, 'fabricType', value)}>
                            <Select.Trigger className="flex items-center justify-between w-full rounded-md border border-border bg-background text-foreground py-1 px-2 text-sm">
                              <Select.Value placeholder="Select Fabric" />
                              <Select.Icon>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                              </Select.Icon>
                            </Select.Trigger>
                            <Select.Portal>
                              <Select.Content className="overflow-hidden rounded-lg bg-surface border border-border shadow-lg z-50">
                                <Select.Viewport className="p-1 max-h-48 overflow-y-auto">
                                  {FABRIC_TYPES.map(fabric => (
                                    <SelectItemContent key={fabric} value={fabric}>{fabric}</SelectItemContent>
                                  ))}
                                </Select.Viewport>
                              </Select.Content>
                            </Select.Portal>
                          </Select.Root>
                        </td>
                        <td className={`${borderStyle} px-2 py-1.5 bg-background`}>
                          <input
                            type="text"
                            value={item.color}
                            onChange={(e) => updateItem(index, 'color', e.target.value)}
                            className="w-full border border-border bg-background rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                            placeholder="Color"
                          />
                        </td>
                        <td className={dataCellStyle}>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            className="w-full border border-border bg-background rounded-md px-2 py-1 text-sm text-center focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                            min="0"
                            step="any"
                          />
                        </td>
                        <td className={`${borderStyle} px-2 py-1.5 bg-background`}>
                          <Select.Root value={item.unit} onValueChange={(value) => updateItem(index, 'unit', value)}>
                            <Select.Trigger className="flex items-center justify-between w-full rounded-md border border-border bg-background text-foreground py-1 px-2 text-sm">
                              <Select.Value />
                              <Select.Icon>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                              </Select.Icon>
                            </Select.Trigger>
                            <Select.Portal>
                              <Select.Content className="overflow-hidden rounded-lg bg-surface border border-border shadow-lg z-50">
                                <Select.Viewport className="p-1">
                                  {UNITS.map(unit => (
                                    <SelectItemContent key={unit} value={unit}>{unit}</SelectItemContent>
                                  ))}
                                </Select.Viewport>
                              </Select.Content>
                            </Select.Portal>
                          </Select.Root>
                        </td>
                        <td className={dataCellStyle}>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                            className="w-full border border-border bg-background rounded-md px-2 py-1 text-sm text-center focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                            min="0"
                            step="any"
                          />
                        </td>
                        <td className={dataCellStyle}>
                          <input
                            type="text"
                            value={`₹ ${item.totalPrice.toFixed(2)}`}
                            readOnly
                            className="w-full border-0 bg-muted/30 focus:ring-0 text-center p-1 text-sm rounded text-foreground font-medium"
                          />
                        </td>
                        <td className={`${borderStyle} px-2 py-1.5 bg-background`}>
                          <input
                            type="text"
                            value={item.gsm || ''}
                            onChange={(e) => updateItem(index, 'gsm', e.target.value)}
                            className="w-full border border-border bg-background rounded-md px-2 py-1 text-sm text-center focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                            placeholder="GSM"
                          />
                        </td>
                        <td className={`${borderStyle} px-2 py-1.5 bg-background`}>
                          <input
                            type="text"
                            value={item.width || ''}
                            onChange={(e) => updateItem(index, 'width', e.target.value)}
                            className="w-full border border-border bg-background rounded-md px-2 py-1 text-sm text-center focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                            placeholder="Width"
                          />
                        </td>
                        <td className={`${borderStyle} px-2 py-1.5 bg-background`}>
                          <Select.Root value={item.dyeingMethod || ''} onValueChange={(value) => updateItem(index, 'dyeingMethod', value)}>
                            <Select.Trigger className="flex items-center justify-between w-full rounded-md border border-border bg-background text-foreground py-1 px-2 text-sm">
                              <Select.Value placeholder="Method" />
                              <Select.Icon>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                              </Select.Icon>
                            </Select.Trigger>
                            <Select.Portal>
                              <Select.Content className="overflow-hidden rounded-lg bg-surface border border-border shadow-lg z-50">
                                <Select.Viewport className="p-1 max-h-48 overflow-y-auto">
                                  {DYEING_METHODS.map(method => (
                                    <SelectItemContent key={method} value={method}>{method}</SelectItemContent>
                                  ))}
                                </Select.Viewport>
                              </Select.Content>
                            </Select.Portal>
                          </Select.Root>
                        </td>
                        <td className={dataCellStyle}>
                          <div className="flex items-center justify-center space-x-1">
                            <div
                              {...providedDraggable.dragHandleProps}
                              className="cursor-grab text-muted-foreground hover:text-foreground p-0.5"
                              title="Drag to reorder"
                            >
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-700 p-0.5"
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
          <tfoot className="bg-muted/50">
            <tr>
              <td colSpan={6} className="border border-border px-3 py-3 text-right font-medium text-foreground bg-muted/30">
                Total:
              </td>
              <td className="border border-border px-3 py-3 font-medium text-center text-foreground bg-accent">
                ₹ {items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
              </td>
              <td colSpan={4} className="border border-border bg-muted/30"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};