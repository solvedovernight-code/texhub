import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { ShoppingCart, Printer, FolderOpen, Clock, Search, Trash2, Loader2, Edit } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { OrderForm } from '../components/OrderForm';
import { OrderItemsTable } from '../components/OrderItemsTable';
import { OrderStatusTimeline } from '../components/OrderStatusTimeline';
import { ProductionTracker } from '../components/ProductionTracker';
import { ShipmentTracker } from '../components/ShipmentTracker';
import { PrintableOrder } from '../components/PrintableOrder';
import { SaveRecipeDialog } from '../components/SaveRecipeDialog';
import { ViewRecipesDialog } from '../components/ViewRecipesDialog';
import { AlertDialog } from '../components/AlertDialog';
import { SaveOptionsDialog } from '../components/SaveOptionsDialog';
import { PasswordInputDialog } from '../components/PasswordInputDialog';
import { useToast } from '../components/ui/ToastProvider';
import { useReactToPrint } from 'react-to-print';
import { Order, OrderItem, initialOrderData, generateOrderNumber } from '../types/order';
import type { Recipe } from '../types';
import { db } from '../lib/firebaseConfig';
import { collection, addDoc, updateDoc, doc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();
};

interface OrderManagementProps {
  user: any; // Firebase User object
}

export function OrderManagement({ user }: OrderManagementProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [isSaveRecipeOpen, setIsSaveRecipeOpen] = useState(false);
  const [isSaveOptionsOpen, setIsSaveOptionsOpen] = useState(false);
  const [isViewRecipesOpen, setIsViewRecipesOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error' | 'confirm';
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    isAuthenticating?: boolean;
  } | null>(null);
  const [loadedOrderId, setLoadedOrderId] = useState<string | null>(null);
  const [loadedOrderSource, setLoadedOrderSource] = useState<'orderHistory' | 'orderSaved' | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // State for password authorization
  const [isPasswordInputOpen, setIsPasswordInputOpen] = useState(false);
  const [isAuthenticatingPassword, setIsAuthenticatingPassword] = useState(false);
  const [passwordAuthError, setPasswordAuthError] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<{ id: string; name: string; collectionType: 'history' | 'saved_orders' } | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const { showToast } = useToast();

  const [history, setHistory] = useState<Recipe[]>([]);
  const [savedOrders, setSavedOrders] = useState<Recipe[]>([]);

  const [orderData, setOrderData] = useState<Order>({
    ...initialOrderData,
    id: '',
    orderNumber: generateOrderNumber(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: user?.uid || ''
  });

  // Fetch user-specific order history from Firebase
  useEffect(() => {
    if (!user) {
      console.log("No user found, clearing order history");
      setHistory([]);
      return;
    }

    console.log("Setting up order history listener for user:", user.uid);
    const historyCollectionRef = collection(db, "users", user.uid, "orderHistory");
    const q = query(historyCollectionRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedHistory: Recipe[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Recipe[];
      console.log("Fetched order history:", fetchedHistory.length);
      setHistory(fetchedHistory);
    }, (error) => {
      console.error("Error fetching order history for user", user.uid, ":", error);
      showToast({
        message: "Error fetching order history from cloud. Please try again.",
        type: 'error',
      });
    });

    return () => unsubscribe();
  }, [user, showToast]);

  // Fetch user-specific saved orders from Firebase
  useEffect(() => {
    if (!user) {
      console.log("No user found, clearing saved orders");
      setSavedOrders([]);
      return;
    }

    console.log("Setting up saved orders listener for user:", user.uid);
    const savedOrdersCollectionRef = collection(db, "users", user.uid, "orderSaved");
    const q = query(savedOrdersCollectionRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedSavedOrders: Recipe[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Recipe[];
      console.log("Fetched saved orders:", fetchedSavedOrders.length);
      setSavedOrders(fetchedSavedOrders);
    }, (error) => {
      console.error("Error fetching saved orders for user", user.uid, ":", error);
      showToast({
        message: "Error fetching saved orders from cloud. Please try again.",
        type: 'error',
      });
    });

    return () => unsubscribe();
  }, [user, showToast]);

  // Calculate totals when items change
  useEffect(() => {
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const totalAmount = subtotal - (orderData.discount || 0) + (orderData.tax || 0) + (orderData.shippingCost || 0);
    
    setOrderData(prev => ({
      ...prev,
      subtotal,
      totalAmount,
    }));
  }, [orderData.items, orderData.discount, orderData.tax, orderData.shippingCost]);

  // Function to auto-save on print (to history)
  const handleAutoSaveOnPrint = async () => {
    if (!user) {
      showToast({
        message: "Please log in to save orders.",
        type: 'error',
      });
      return false;
    }

    const shouldUpdateExistingHistory = loadedOrderId && loadedOrderSource === 'orderHistory' && hasUnsavedChanges;

    if (hasUnsavedChanges || !loadedOrderId) {
      setIsSaving(true);

      const autoSaveName = `Printed Draft - ${orderData.orderNumber} (${formatDate(orderData.orderDate)})`;
      const orderDataForSave = { ...orderData, customerName: autoSaveName };

      const orderDataToSave = {
        name: autoSaveName,
        timestamp: new Date().toISOString(),
        formData: orderDataForSave,
        chemicalItems: orderData.items
      };

      try {
        let currentDocId = loadedOrderId;
        if (shouldUpdateExistingHistory) {
          await updateDoc(doc(db, "users", user.uid, "orderHistory", loadedOrderId), orderDataToSave);
          showToast({
            message: `Printed draft updated to history!`,
            type: 'info',
          });
        } else {
          const docRef = await addDoc(collection(db, "users", user.uid, "orderHistory"), orderDataToSave);
          currentDocId = docRef.id;
          showToast({
            message: `Printed draft saved to history!`,
            type: 'info',
          });
        }
        
        setLoadedOrderId(currentDocId!);
        setLoadedOrderSource('orderHistory');
        setHasUnsavedChanges(false);
        setOrderData(orderDataForSave);
        return true;
      } catch (error) {
        console.error("Failed to auto-save order on print:", error);
        showToast({
          message: `Error auto-saving printed draft: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'error',
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    }
    return true;
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Order_${orderData.orderNumber}`,
    onAfterPrint: () => {
      console.log('Print completed.');
    },
  });

  const handlePrintButtonClick = async () => {
    const savedSuccessfully = await handleAutoSaveOnPrint();
    if (savedSuccessfully) {
      handlePrint();
    }
  };

  const handleEditFromHistory = (recipe: Recipe) => {
    setOrderData(recipe.formData as Order);
    setLoadedOrderId(recipe.id);
    setLoadedOrderSource('orderHistory');
    setHasUnsavedChanges(false);
    setActiveTab('form');
    showToast({
      message: `Order "${recipe.name}" loaded for editing!`,
      type: 'info',
    });
  };

  const handlePrintFromHistory = (recipe: Recipe) => {
    const currentOrderData = orderData;
    
    setOrderData(recipe.formData as Order);
    
    setTimeout(() => {
      handlePrint();
      setOrderData(currentOrderData);
    }, 100);
  };

  const handleDeleteFromHistory = (recipeId: string, recipeName: string, collectionPath: string) => {
    if (!user || !user.email) {
      setAlertDialog({
        isOpen: true,
        title: "Authentication Required",
        message: "Please log in with an email and password to delete orders.",
        type: 'warning',
      });
      return;
    }
    const collectionType = collectionPath as 'history' | 'saved_orders';
    setOrderToDelete({ id: recipeId, name: recipeName, collectionType: collectionType });
    setIsPasswordInputOpen(true);
    setPasswordAuthError(null);
  };

  const handleDeleteOrder = async (orderId: string, orderName: string, collectionType: 'history' | 'saved_orders') => {
    if (!user) {
      showToast({
        message: "Please log in to delete orders.",
        type: 'error',
      });
      return;
    }

    try {
      console.log("Starting deletion process for order:", orderId);
      const actualCollectionName = collectionType === 'history' ? 'orderHistory' : 'orderSaved';
      await deleteDoc(doc(db, "users", user.uid, actualCollectionName, orderId));
      console.log("Delete operation completed successfully");
      showToast({
        message: `Order "${orderName}" deleted successfully!`,
        type: 'success',
      });
    } catch (error) {
      console.error("Failed to delete order:", error);
      if (error instanceof Error && error.message.includes('network')) {
        showToast({
          message: `Network error occurred, but order may have been deleted. Please refresh to verify.`,
          type: 'warning',
        });
      } else {
        showToast({
          message: "Error deleting order. Please try again.",
          type: 'error',
        });
      }
      throw error;
    }
  };

  const handleDeleteOrderWithRetry = async (orderId: string, orderName: string, collectionType: 'history' | 'saved_orders', retryCount = 0) => {
    const maxRetries = 2;
    
    try {
      await handleDeleteOrder(orderId, orderName, collectionType);
    } catch (error) {
      if (retryCount < maxRetries && error instanceof Error && 
          (error.message.includes('network') || error.message.includes('QUIC'))) {
        console.log(`Retrying deletion (attempt ${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          handleDeleteOrderWithRetry(orderId, orderName, collectionType, retryCount + 1);
        }, 1000 * (retryCount + 1));
      } else {
        throw error;
      }
    }
  };

  const handlePasswordAuthorizationWithRetry = async (password: string) => {
    if (!user || !user.email || !orderToDelete) {
      console.error("Missing user, email, or order to delete:", { user: !!user, email: user?.email, orderToDelete });
      return;
    }

    setIsAuthenticatingPassword(true);
    setPasswordAuthError(null);

    try {
      console.log("Attempting to reauthenticate user:", user.uid);
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      console.log("Reauthentication successful");
      
      setIsPasswordInputOpen(false);
      setAlertDialog({
        isOpen: true,
        title: "Confirm Deletion",
        message: `Password authorized. Are you sure you want to delete the order "${orderToDelete.name}"? This action cannot be undone.`,
        type: 'confirm',
        onConfirm: async () => {
          setIsConfirmingDelete(true);
          try {
            console.log("Attempting to delete order:", orderToDelete.id, "from collection:", orderToDelete.collectionType, "for user:", user.uid);
            
            await handleDeleteOrderWithRetry(orderToDelete.id, orderToDelete.name, orderToDelete.collectionType);
            
            setOrderToDelete(null);
            setAlertDialog(null);
          } catch (error) {
            console.error("Failed to delete order from Firestore after reauth:", error);
            showToast({
              message: `Error deleting order: ${error instanceof Error ? error.message : 'Unknown error'}`,
              type: 'error',
            });
          } finally {
            setIsConfirmingDelete(false);
          }
        },
        onCancel: () => {
          setAlertDialog(null);
          setOrderToDelete(null);
        },
        confirmText: "Delete",
        cancelText: "Cancel",
        isAuthenticating: isConfirmingDelete,
      });

    } catch (error: any) {
      console.error("Password reauthentication failed:", error);
      let errorMessage = "Password authorization failed. Please try again.";
      if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/user-mismatch') {
        errorMessage = "User mismatch. Please log in again.";
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid credentials. Please check your email and password.";
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = "This action requires a recent login. Please log in again.";
      }
      setPasswordAuthError(errorMessage);
    } finally {
      setIsAuthenticatingPassword(false);
    }
  };

  const handlePasswordAuthorization = handlePasswordAuthorizationWithRetry;

  const handleSaveRecipe = async (recipeName: string) => {
    if (!user) {
      setAlertDialog({
        isOpen: true,
        title: "Authentication Required",
        message: "Please ensure you are authenticated to save orders. Try refreshing the page.",
        type: 'warning',
      });
      return;
    }

    setIsSaving(true);

    const recipeDataToSave = {
      name: recipeName,
      timestamp: new Date().toISOString(),
      formData: { ...orderData, customerName: recipeName },
      chemicalItems: orderData.items
    };

    try {
      const docRef = await addDoc(collection(db, "users", user.uid, "orderSaved"), recipeDataToSave);
      setLoadedOrderId(docRef.id);
      setLoadedOrderSource('orderSaved');
      setHasUnsavedChanges(false);
      showToast({
        message: `Order "${recipeName}" saved successfully to cloud!`,
        type: 'success',
      });
    } catch (error) {
      console.error("Failed to save order to Firebase:", error);
      showToast({
        message: "Error saving order to cloud. Check console for details.",
        type: 'error',
      });
    } finally {
      setIsSaving(false);
      setIsSaveRecipeOpen(false);
    }
  };

  const handleLoadRecipe = (recipe: Recipe) => {
    setOrderData({
      ...(recipe.formData as Order),
      orderNumber: generateOrderNumber(),
      orderDate: new Date().toISOString().split('T')[0],
    });
    setLoadedOrderId(recipe.id);
    setLoadedOrderSource('orderSaved');
    setHasUnsavedChanges(false);
    showToast({
      message: `Order "${recipe.name}" loaded successfully!`,
      type: 'success',
    });
  };

  const handleSaveClick = () => {
    if (!user) {
      setAlertDialog({
        isOpen: true,
        title: "Authentication Required",
        message: "Please log in to save orders.",
        type: 'warning',
      });
      return;
    }
    if (loadedOrderId && hasUnsavedChanges) {
      setIsSaveOptionsOpen(true);
    } else {
      setIsSaveRecipeOpen(true);
    }
  };

  const handleSaveAsNew = () => {
    setLoadedOrderId(null);
    setLoadedOrderSource(null);
    setIsSaveOptionsOpen(false);
    setIsSaveRecipeOpen(true);
  };

  const handleUpdateExisting = async () => {
    if (!loadedOrderId || !user) return;
    
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid, "orderSaved", loadedOrderId), {
        name: orderData.customerName,
        timestamp: new Date().toISOString(),
        formData: orderData,
        chemicalItems: orderData.items
      });
      
      setHasUnsavedChanges(false);
      showToast({
        message: "Order updated successfully!",
        type: 'success',
      });
    } catch (error) {
      console.error("Failed to update order:", error);
      showToast({
        message: "Error updating order. Check console for details.",
        type: 'error',
      });
    } finally {
      setIsSaving(false);
      setIsSaveOptionsOpen(false);
    }
  };

  const handleClear = () => {
    setOrderData({
      ...initialOrderData,
      id: '',
      orderNumber: generateOrderNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user?.uid || ''
    });
    setLoadedOrderId(null);
    setLoadedOrderSource(null);
    setHasUnsavedChanges(false);
  };

  const handleItemsChange = useCallback((newItems: OrderItem[]) => {
    setOrderData(prev => ({ ...prev, items: newItems }));
    if (loadedOrderId) {
      setHasUnsavedChanges(true);
    }
  }, [loadedOrderId]);

  const handleOrderDataChange = useCallback((newData: Order) => {
    setOrderData(newData);
    if (loadedOrderId) {
      setHasUnsavedChanges(true);
    }
  }, [loadedOrderId]);

  // Track form changes
  useEffect(() => {
    if (loadedOrderId) {
      setHasUnsavedChanges(true);
    }
  }, [orderData, loadedOrderId]);

  const handleReorderItems = useCallback((startIndex: number, endIndex: number) => {
    setOrderData(prev => {
      const result = Array.from(prev.items);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { ...prev, items: result };
    });
  }, []);

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    handleReorderItems(result.source.index, result.destination.index);
  };

  const filteredHistory = history.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const orderDataItem = item.formData as Order;
    return (
      orderDataItem.orderNumber.toLowerCase().includes(searchLower) ||
      orderDataItem.customerName.toLowerCase().includes(searchLower) ||
      orderDataItem.customerCompany?.toLowerCase().includes(searchLower) ||
      formatDate(orderDataItem.orderDate).toLowerCase().includes(searchLower) ||
      orderDataItem.totalAmount.toFixed(2).includes(searchLower) ||
      orderDataItem.status.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section - Outside Container */}
      <div className="bg-card text-card-foreground border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Order Management</h2>
              <p className="text-muted-foreground mt-1">Manage orders from receipt to delivery with full production tracking.</p>
            </div>
            {activeTab === 'form' && (
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-muted-foreground">Order No:</span>
                  <span className="ml-2 text-lg font-mono font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {orderData.orderNumber}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit mt-4">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                activeTab === 'form'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              Order Management
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock className="h-4 w-4" />
              History ({history.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6 border border-border">
          {activeTab === 'form' ? (
            <div className="space-y-8">
              <OrderForm data={orderData} onChange={handleOrderDataChange} />

              <DragDropContext onDragEnd={handleOnDragEnd}>
                <OrderItemsTable
                  items={orderData.items}
                  onItemsChange={handleItemsChange}
                />
              </DragDropContext>

              <OrderStatusTimeline order={orderData} />

              <ProductionTracker
                stages={orderData.productionStages}
                qualityChecks={orderData.qualityChecks}
                onStagesChange={(stages) => setOrderData(prev => ({ ...prev, productionStages: stages }))}
                onQualityChecksChange={(checks) => setOrderData(prev => ({ ...prev, qualityChecks: checks }))}
              />

              <ShipmentTracker
                shipmentDetails={orderData.shipmentDetails}
                onShipmentChange={(details) => setOrderData(prev => ({ ...prev, shipmentDetails: details }))}
              />

              <div className="mt-8 flex flex-wrap justify-end gap-3">
                <Button variant="outline" onClick={handleClear}>Clear Form</Button>
                <Button onClick={handleSaveClick} className="bg-[#1A3636] hover:bg-green-900 text-white">
                  {loadedOrderId && hasUnsavedChanges ? 'Save Changes' : 'Save Order'}
                </Button>
                <Button onClick={() => setIsViewRecipesOpen(true)} className="bg-[#1A3636] hover:bg-green-900 text-white flex items-center">
                  <FolderOpen className="h-5 w-5 mr-2" />
                  View Orders
                </Button>
                <Button onClick={handlePrintButtonClick} className="bg-[#FF9900] hover:bg-orange-500 text-white flex items-center">
                  <Printer className="h-5 w-5 mr-2" />
                  View/Print
                </Button>
              </div>
            </div>
          ) : (
            /* History Tab */
            <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Order History</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search by Order No, Customer, Date, Amount, Status..."
                  className="pl-10 pr-4 py-2 border border-input rounded-lg w-80 bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary focus:ring-offset-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              {history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-lg">
                  <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium">
                    {searchTerm ? 'No orders found matching your search criteria.' : 'No history yet'}
                  </p>
                  <p className="text-sm mt-1">
                    Create and print orders to see them here.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {/* Table Header */}
                  <div className="grid grid-cols-7 border border-border rounded-lg overflow-hidden bg-muted/50 shadow-sm">
                    <div className="p-3 text-center text-sm font-medium text-foreground uppercase border-r border-border">Order No</div>
                    <div className="p-3 text-center text-sm font-medium text-foreground uppercase border-r border-border">Date</div>
                    <div className="p-3 text-center text-sm font-medium text-foreground uppercase border-r border-border">Customer</div>
                    <div className="p-3 text-center text-sm font-medium text-foreground uppercase border-r border-border">Company</div>
                    <div className="p-3 text-center text-sm font-medium text-foreground uppercase border-r border-border">Status</div>
                    <div className="p-3 text-center text-sm font-medium text-foreground uppercase border-r border-border">Total Amount</div>
                    <div className="p-3 text-center text-sm font-medium text-foreground uppercase">Actions</div>
                  </div>

                  {/* Table Rows */}
                  {filteredHistory.map((item) => {
                    const orderDataItem = item.formData as Order;
                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-7 border border-border rounded-lg overflow-hidden bg-card shadow-sm hover:shadow-md hover:bg-muted/30 transition-all duration-200 ease-in-out"
                      >
                        <div className="p-3 text-center text-sm font-mono border-r border-border text-card-foreground">{orderDataItem.orderNumber}</div>
                        <div className="p-3 text-center text-sm border-r border-border text-card-foreground">{formatDate(orderDataItem.orderDate)}</div>
                        <div className="p-3 text-center text-sm border-r border-border text-card-foreground">{orderDataItem.customerName || 'N/A'}</div>
                        <div className="p-3 text-center text-sm border-r border-border text-card-foreground">{orderDataItem.customerCompany || 'N/A'}</div>
                        <div className="p-3 text-center text-sm border-r border-border text-card-foreground">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            orderDataItem.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            orderDataItem.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            orderDataItem.status === 'in-production' ? 'bg-yellow-100 text-yellow-800' :
                            orderDataItem.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {orderDataItem.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="p-3 text-center text-sm border-r border-border text-card-foreground font-medium">₹{orderDataItem.totalAmount.toFixed(2)}</div>
                        <div className="p-3 flex items-center justify-around gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditFromHistory(item)}
                            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                            title="Edit Order"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePrintFromHistory(item)}
                            className="text-green-600 hover:bg-green-50 hover:text-green-700"
                            title="Print Order"
                          >
                            <Printer className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteFromHistory(item.id, item.name || orderDataItem.customerName, 'history')}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            title="Delete Order"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'none' }}>
        <PrintableOrder ref={printRef} data={orderData} />
      </div>

      <SaveRecipeDialog
        isOpen={isSaveRecipeOpen}
        onClose={() => setIsSaveRecipeOpen(false)}
        onSave={handleSaveRecipe}
        isSaving={isSaving}
      />

      <SaveOptionsDialog
        isOpen={isSaveOptionsOpen}
        onClose={() => setIsSaveOptionsOpen(false)}
        onSaveAsNew={handleSaveAsNew}
        onUpdateExisting={handleUpdateExisting}
        isSaving={isSaving}
        recipeName={orderData.customerName}
      />

      <ViewRecipesDialog
        isOpen={isViewRecipesOpen}
        onClose={() => setIsViewRecipesOpen(false)}
        onRetrieve={handleLoadRecipe}
        onDelete={handleDeleteFromHistory}
        user={user}
        collectionPath="orderSaved"
        itemType="recipe"
      />

      {alertDialog && (
        <AlertDialog
          isOpen={alertDialog.isOpen}
          onClose={() => setAlertDialog(null)}
          title={alertDialog.title}
          message={alertDialog.message}
          type={alertDialog.type}
          onConfirm={alertDialog.onConfirm}
          onCancel={alertDialog.onCancel}
          confirmText={alertDialog.confirmText}
          cancelText={alertDialog.cancelText}
          isAuthenticating={alertDialog.isAuthenticating}
        />
      )}

      {isPasswordInputOpen && (
        <PasswordInputDialog
          isOpen={isPasswordInputOpen}
          onClose={() => {
            setIsPasswordInputOpen(false);
            setOrderToDelete(null);
            setPasswordAuthError(null);
          }}
          onConfirm={handlePasswordAuthorization}
          title="Authorize Deletion"
          message="Please enter your password to authorize the deletion of this order."
          isAuthenticating={isAuthenticatingPassword}
          error={passwordAuthError}
        />
      )}
    </div>
  );
}