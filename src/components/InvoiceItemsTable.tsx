import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { InvoiceItem } from '../types/invoice';
import { Button } from './ui/button';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  onItemsChange: (items: InvoiceItem[]) => void;
}

export const InvoiceItemsTable: React.FC<InvoiceItemsTableProps> = ({
  items,
  onItemsChange,
}) => {
  // Initialize with one empty item if no items exist
  React.useEffect(() => {
    if (items.length === 0) {
      addNewItem();
    }
  }, []);

  const addNewItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    };
    onItemsChange([...items, newItem]);
  };

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    const currentItem = { ...newItems[index] };

    if (field === 'quantity' || field === 'unitPrice') {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      currentItem[field] = numValue;
      
      // Recalculate amount
      currentItem.amount = currentItem.quantity * currentItem.unitPrice;
    } else {
      currentItem[field] = value as any;
    }

    newItems[index] = currentItem;
    onItemsChange(newItems);
  };

  const borderStyle = "border border-border";
  const headerCellStyle = `${borderStyle} px-3 py-2 text-center bg-muted/50 font-medium text-foreground`;
  const dataCellStyle = `${borderStyle} px-2 py-1.5 text-center bg-background`;

  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Invoice Items</h3>
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
          <colgroup>
            <col style={{ width: '8%' }} />   {/* SL NO */}
            <col style={{ width: '50%' }} />  {/* DESCRIPTION */}
            <col style={{ width: '12%' }} />  {/* QTY */}
            <col style={{ width: '15%' }} />  {/* UNIT PRICE */}
            <col style={{ width: '15%' }} />  {/* TOTAL AMOUNT */}
            <col style={{ width: '10%' }} />  {/* ACTIONS */}
          </colgroup>
          <thead>
            <tr>
              <th className={headerCellStyle}>SL NO</th>
              <th className={headerCellStyle}>DESCRIPTION</th>
              <th className={headerCellStyle}>QTY</th>
              <th className={headerCellStyle}>UNIT PRICE</th>
              <th className={headerCellStyle}>TOTAL AMOUNT</th>
              <th className={headerCellStyle}>ACTIONS</th>
            </tr>
          </thead>
          <Droppable droppableId="invoiceItems">
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
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="w-full border border-border bg-background rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                            placeholder="Item description"
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
                            value={`₹ ${item.amount.toFixed(2)}`}
                            readOnly
                            className="w-full border-0 bg-muted/30 focus:ring-0 text-center p-1 text-sm rounded text-foreground font-medium"
                          />
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
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                              title="Highlight row"
                            />
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
                
                {/* Add empty rows only for printing - these will be hidden in the UI */}
                {items.length < 12 && (
                  <>
                    {Array.from({ length: Math.max(0, 12 - items.length) }).map((_, i) => (
                      <tr key={`empty-${i}`} className="print-only hidden">
                        <td className={`${dataCellStyle} h-12`}></td>
                        <td className={dataCellStyle}></td>
                        <td className={dataCellStyle}></td>
                        <td className={dataCellStyle}></td>
                        <td className={dataCellStyle}></td>
                        <td className={dataCellStyle}></td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            )}
          </Droppable>
        </table>
      </div>
    </div>
  );
};
