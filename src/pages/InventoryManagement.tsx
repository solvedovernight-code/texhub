import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Clock,
  Loader2 // Added Loader2 import
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { InventoryItem, StockTransaction, LowStockAlert, INVENTORY_CATEGORIES, STOCK_UNITS, initialInventoryItem, generateSKU } from '../types/inventory';
import { AddInventoryDialog } from '../components/AddInventoryDialog';
import { StockTransactionDialog } from '../components/StockTransactionDialog';
import { AlertDialog } from '../components/AlertDialog';
import * as Select from '@radix-ui/react-select';
import { db } from '../lib/firebaseConfig';
import { collection, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { useToast } from '../components/ui/ToastProvider';

interface InventoryManagementProps {
  user: any; // Firebase User object
}

export function InventoryManagement({ user }: InventoryManagementProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'transactions' | 'alerts'>('inventory');
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  const { showToast } = useToast();

  // Fetch user-specific inventory items from Firebase
  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoadingItems(false);
      return;
    }

    setLoadingItems(true);
    const itemsCollectionRef = collection(db, "users", user.uid, "inventory");
    const q = query(itemsCollectionRef, orderBy("name", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedItems: InventoryItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryItem[];
      setItems(fetchedItems);
      setLoadingItems(false);
    }, (error) => {
      console.error("Error fetching inventory items:", error);
      showToast({
        message: "Error fetching inventory items from cloud. Please try again.",
        type: 'error',
      });
      setLoadingItems(false);
    });

    return () => unsubscribe();
  }, [user, showToast]);

  // Fetch user-specific stock transactions from Firebase
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoadingTransactions(false);
      return;
    }

    setLoadingTransactions(true);
    const transactionsCollectionRef = collection(db, "users", user.uid, "transactions");
    const q = query(transactionsCollectionRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTransactions: StockTransaction[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StockTransaction[];
      setTransactions(fetchedTransactions);
      setLoadingTransactions(false);
    }, (error) => {
      console.error("Error fetching stock transactions:", error);
      showToast({
        message: "Error fetching stock transactions from cloud. Please try again.",
        type: 'error',
      });
      setLoadingTransactions(false);
    });

    return () => unsubscribe();
  }, [user, showToast]);

  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesLowStock = !lowStockFilter || item.currentStock <= item.minStock;
    
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // Get low stock alerts
  const lowStockAlerts: LowStockAlert[] = items
    .filter(item => item.currentStock <= item.minStock)
    .map(item => ({
      id: item.id,
      itemId: item.id,
      itemName: item.name,
      currentStock: item.currentStock,
      minStock: item.minStock,
      severity: item.currentStock === 0 ? 'critical' : 'low',
      timestamp: new Date().toISOString(),
    }));

  // Calculate inventory statistics
  const stats = {
    totalItems: items.length,
    totalValue: items.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0),
    lowStockItems: lowStockAlerts.length,
    outOfStockItems: items.filter(item => item.currentStock === 0).length,
  };

  const handleAddItem = async (itemData: Partial<InventoryItem>) => {
    if (!user) {
      showToast({ message: "Please log in to add inventory items.", type: 'warning' });
      return;
    }
    const newItem: Omit<InventoryItem, 'id'> = {
      ...initialInventoryItem,
      ...itemData,
      sku: itemData.sku || generateSKU(itemData.category || 'chemical', itemData.name || ''),
      lastUpdated: new Date().toISOString(),
    };
    try {
      await addDoc(collection(db, "users", user.uid, "inventory"), newItem);
      showToast({ message: `Item "${newItem.name}" added successfully!`, type: 'success' });
    } catch (error) {
      console.error("Error adding item:", error);
      showToast({ message: "Error adding item. Check console for details.", type: 'error' });
    }
  };

  const handleEditItem = async (itemData: Partial<InventoryItem>) => {
    if (!editingItem || !user) return;
    
    const updatedItem: Omit<InventoryItem, 'id'> = {
      ...editingItem,
      ...itemData,
      lastUpdated: new Date().toISOString(),
    };
    
    try {
      await updateDoc(doc(db, "users", user.uid, "inventory", editingItem.id), updatedItem);
      showToast({ message: `Item "${updatedItem.name}" updated successfully!`, type: 'success' });
    } catch (error) {
      console.error("Error updating item:", error);
      showToast({ message: "Error updating item. Check console for details.", type: 'error' });
    } finally {
      setEditingItem(null);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!user) {
      showToast({ message: "Please log in to delete inventory items.", type: 'warning' });
      return;
    }
    try {
      await deleteDoc(doc(db, "users", user.uid, "inventory", itemId));
      showToast({ message: "Item deleted successfully!", type: 'success' });
    } catch (error) {
      console.error("Error deleting item:", error);
      showToast({ message: "Error deleting item. Check console for details.", type: 'error' });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleStockTransaction = async (transaction: Omit<StockTransaction, 'id' | 'timestamp' | 'userId'>) => {
    if (!user) {
      showToast({ message: "Please log in to record stock transactions.", type: 'warning' });
      return;
    }

    const itemToUpdate = items.find(item => item.id === transaction.itemId);
    if (!itemToUpdate) {
      showToast({ message: "Item not found for transaction.", type: 'error' });
      return;
    }

    let newStock = itemToUpdate.currentStock;
    if (transaction.type === 'in') {
      newStock += transaction.quantity;
    } else if (transaction.type === 'out') {
      newStock -= transaction.quantity;
    } else if (transaction.type === 'adjustment') {
      newStock = transaction.quantity;
    }
    newStock = Math.max(0, newStock); // Ensure stock doesn't go below zero

    try {
      // Update item stock in Firestore
      await updateDoc(doc(db, "users", user.uid, "inventory", itemToUpdate.id), {
        currentStock: newStock,
        lastUpdated: new Date().toISOString(),
      });

      // Add transaction record to Firestore
      const newTransaction: Omit<StockTransaction, 'id'> = {
        ...transaction,
        timestamp: new Date().toISOString(),
        userId: user.uid,
      };
      await addDoc(collection(db, "users", user.uid, "transactions"), newTransaction);

      showToast({ message: "Stock transaction recorded successfully!", type: 'success' });
    } catch (error) {
      console.error("Error recording stock transaction:", error);
      showToast({ message: "Error recording stock transaction. Check console for details.", type: 'error' });
    } finally {
      setIsTransactionDialogOpen(false);
      setSelectedItem(null);
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) return { status: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    if (item.currentStock <= item.minStock) return { status: 'Low Stock', color: 'text-orange-600 bg-orange-100' };
    if (item.currentStock >= item.maxStock) return { status: 'Overstock', color: 'text-blue-600 bg-blue-100' };
    return { status: 'In Stock', color: 'text-green-600 bg-green-100' };
  };

  const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType, label: string, value: string | number, color: string }) => (
    <motion.div
      className="bg-card p-6 rounded-lg border border-border shadow-sm"
      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card text-card-foreground border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
              <p className="text-muted-foreground mt-1">Manage your textile inventory, track stock levels, and monitor transactions</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit mt-4">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                activeTab === 'inventory'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Package className="h-4 w-4" />
              Inventory ({items.length})
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                activeTab === 'transactions'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Transactions ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                activeTab === 'alerts'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              Alerts ({lowStockAlerts.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Package}
            label="Total Items"
            value={stats.totalItems}
            color="bg-blue-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Value"
            value={`₹${stats.totalValue.toFixed(2)}`}
            color="bg-green-500"
          />
          <StatCard
            icon={AlertTriangle}
            label="Low Stock Items"
            value={stats.lowStockItems}
            color="bg-orange-500"
          />
          <StatCard
            icon={TrendingDown}
            label="Out of Stock"
            value={stats.outOfStockItems}
            color="bg-red-500"
          />
        </div>

        {/* Tab Content */}
        <div className="bg-card rounded-lg shadow-sm border border-border">
          {activeTab === 'inventory' && (
            <div className="p-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search by name, SKU, or supplier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select.Root value={categoryFilter} onValueChange={setCategoryFilter}>
                  <Select.Trigger className="flex items-center justify-between w-48 rounded-md border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3">
                    <Select.Value placeholder="All Categories" />
                    <Select.Icon>
                      <Filter className="h-4 w-4" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg bg-card border border-border shadow-lg z-50">
                      <Select.Viewport className="p-1">
                        <Select.Item value="all" className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                          <Select.ItemText>All Categories</Select.ItemText>
                        </Select.Item>
                        {INVENTORY_CATEGORIES.map(category => (
                          <Select.Item key={category.value} value={category.value} className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                            <Select.ItemText>{category.label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
                <Button
                  variant={lowStockFilter ? "default" : "outline"}
                  onClick={() => setLowStockFilter(!lowStockFilter)}
                  className="flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Low Stock Only
                </Button>
              </div>

              {/* Inventory Table */}
              <div className="overflow-x-auto">
                {loadingItems ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-lg font-medium">Loading inventory items...</p>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-lg font-medium">No items found</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      {searchTerm || categoryFilter !== 'all' || lowStockFilter
                        ? 'Try adjusting your filters'
                        : 'Add your first inventory item to get started'
                      }
                    </p>
                  </div>
                ) : (
                  <table className="min-w-full border-collapse border border-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="border border-border px-4 py-3 text-left text-sm font-medium text-foreground">SKU</th>
                        <th className="border border-border px-4 py-3 text-left text-sm font-medium text-foreground">Name</th>
                        <th className="border border-border px-4 py-3 text-left text-sm font-medium text-foreground">Category</th>
                        <th className="border border-border px-4 py-3 text-right text-sm font-medium text-foreground">Current Stock</th>
                        <th className="border border-border px-4 py-3 text-right text-sm font-medium text-foreground">Min Stock</th>
                        <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Status</th>
                        <th className="border border-border px-4 py-3 text-right text-sm font-medium text-foreground">Unit Price</th>
                        <th className="border border-border px-4 py-3 text-left text-sm font-medium text-foreground">Supplier</th>
                        <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => {
                        const stockStatus = getStockStatus(item);
                        return (
                          <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                            <td className="border border-border px-4 py-3 text-sm font-mono text-foreground">
                              {item.sku}
                            </td>
                            <td className="border border-border px-4 py-3 text-sm text-foreground font-medium">
                              {item.name}
                            </td>
                            <td className="border border-border px-4 py-3 text-sm text-foreground">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {INVENTORY_CATEGORIES.find(cat => cat.value === item.category)?.label}
                              </span>
                            </td>
                            <td className="border border-border px-4 py-3 text-sm text-foreground text-right">
                              {item.currentStock} {item.unit}
                            </td>
                            <td className="border border-border px-4 py-3 text-sm text-foreground text-right">
                              {item.minStock} {item.unit}
                            </td>
                            <td className="border border-border px-4 py-3 text-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                {stockStatus.status}
                              </span>
                            </td>
                            <td className="border border-border px-4 py-3 text-sm text-foreground text-right">
                              ₹{item.unitPrice.toFixed(2)}
                            </td>
                            <td className="border border-border px-4 py-3 text-sm text-foreground">
                              {item.supplier}
                            </td>
                            <td className="border border-border px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setIsTransactionDialogOpen(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-700"
                                  title="Stock Transaction"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingItem(item);
                                    setIsAddDialogOpen(true);
                                  }}
                                  className="text-green-600 hover:text-green-700"
                                  title="Edit Item"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteConfirm(item.id)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Delete Item"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="p-6">
              <div className="overflow-x-auto">
                {loadingTransactions ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-lg font-medium">Loading transactions...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-lg font-medium">No transactions yet</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Stock transactions will appear here as you manage inventory
                    </p>
                  </div>
                ) : (
                  <table className="min-w-full border-collapse border border-border">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="border border-border px-4 py-3 text-left text-sm font-medium text-foreground">Date</th>
                        <th className="border border-border px-4 py-3 text-left text-sm font-medium text-foreground">Item</th>
                        <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Type</th>
                        <th className="border border-border px-4 py-3 text-right text-sm font-medium text-foreground">Quantity</th>
                        <th className="border border-border px-4 py-3 text-left text-sm font-medium text-foreground">Reason</th>
                        <th className="border border-border px-4 py-3 text-left text-sm font-medium text-foreground">Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => {
                        const item = items.find(i => i.id === transaction.itemId);
                        return (
                          <tr key={transaction.id} className="hover:bg-muted/30 transition-colors">
                            <td className="border border-border px-4 py-3 text-sm text-foreground">
                              {new Date(transaction.timestamp).toLocaleDateString()}
                            </td>
                            <td className="border border-border px-4 py-3 text-sm text-foreground font-medium">
                              {item?.name || 'Unknown Item'}
                            </td>
                            <td className="border border-border px-4 py-3 text-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                transaction.type === 'in' ? 'bg-green-100 text-green-800' :
                                transaction.type === 'out' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {transaction.type === 'in' ? 'Stock In' : 
                                 transaction.type === 'out' ? 'Stock Out' : 'Adjustment'}
                              </span>
                            </td>
                            <td className="border border-border px-4 py-3 text-sm text-foreground text-right">
                              {transaction.type === 'out' ? '-' : '+'}{transaction.quantity} {item?.unit}
                            </td>
                            <td className="border border-border px-4 py-3 text-sm text-foreground">
                              {transaction.reason}
                            </td>
                            <td className="border border-border px-4 py-3 text-sm text-foreground">
                              {transaction.reference || 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="p-6">
              <div className="space-y-4">
                {loadingItems ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-lg font-medium">Checking for alerts...</p>
                  </div>
                ) : lowStockAlerts.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                    <p className="text-foreground text-lg font-medium">All items are well stocked!</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      No low stock alerts at this time
                    </p>
                  </div>
                ) : (
                  lowStockAlerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-lg border-l-4 ${
                        alert.severity === 'critical' 
                          ? 'bg-red-50 border-red-500' 
                          : 'bg-orange-50 border-orange-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={`h-5 w-5 ${
                            alert.severity === 'critical' ? 'text-red-600' : 'text-orange-600'
                          }`} />
                          <div>
                            <h3 className="font-medium text-foreground">{alert.itemName}</h3>
                            <p className="text-sm text-muted-foreground">
                              Current stock: {alert.currentStock} | Minimum required: {alert.minStock}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            const item = items.find(i => i.id === alert.itemId);
                            if (item) {
                              setSelectedItem(item);
                              setIsTransactionDialogOpen(true);
                            }
                          }}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          Restock
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AddInventoryDialog
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setEditingItem(null);
        }}
        onSave={editingItem ? handleEditItem : handleAddItem}
        editingItem={editingItem}
      />

      <StockTransactionDialog
        isOpen={isTransactionDialogOpen}
        onClose={() => {
          setIsTransactionDialogOpen(false);
          setSelectedItem(null);
        }}
        onSave={handleStockTransaction}
        item={selectedItem}
      />

      {deleteConfirm && (
        <AlertDialog
          isOpen={true}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Inventory Item"
          message="Are you sure you want to delete this item? This action cannot be undone."
          onConfirm={() => handleDeleteItem(deleteConfirm)}
          confirmText="Delete"
          variant="destructive"
        />
      )}
    </div>
  );
}
