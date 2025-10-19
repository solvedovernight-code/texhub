import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Printer, 
  Clock, 
  Package, 
  Truck,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  Loader2,
  FolderOpen,
  Download,
  Upload,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Building,
  FileText,
  BarChart3,
  Settings,
  Star,
  Target,
  Activity,
  Zap
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { OrderForm } from '../components/OrderForm';
import { OrderItemsTable } from '../components/OrderItemsTable';
import { ProductionTracker } from '../components/ProductionTracker';
import { ShipmentTracker } from '../components/ShipmentTracker';
import { OrderStatusTimeline } from '../components/OrderStatusTimeline';
import { PrintableOrder } from '../components/PrintableOrder';
import { SaveRecipeDialog } from '../components/SaveRecipeDialog';
import { ViewRecipesDialog } from '../components/ViewRecipesDialog';
import { AlertDialog } from '../components/AlertDialog';
import { SaveOptionsDialog } from '../components/SaveOptionsDialog';
import { PasswordInputDialog } from '../components/PasswordInputDialog';
import { useToast } from '../components/ui/ToastProvider';
import { useReactToPrint } from 'react-to-print';
import { Order, OrderItem, initialOrderData, generateOrderNumber, ORDER_STATUSES, PRIORITY_LEVELS } from '../types/order';
import type { Recipe } from '../types';
import { db } from '../lib/firebaseConfig';
import { collection, addDoc, updateDoc, doc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import * as Select from '@radix-ui/react-select';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderManagementProps {
  user: any;
}

export function OrderManagement({ user }: OrderManagementProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'form' | 'history'>('dashboard');
  const [activeFormTab, setActiveFormTab] = useState<'details' | 'items' | 'production' | 'shipment'>('details');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  
  // Form state
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isSaveOptionsOpen, setIsSaveOptionsOpen] = useState(false);
  const [isViewOrdersOpen, setIsViewOrdersOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadedOrderId, setLoadedOrderId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Delete confirmation
  const [isPasswordInputOpen, setIsPasswordInputOpen] = useState(false);
  const [isAuthenticatingPassword, setIsAuthenticatingPassword] = useState(false);
  const [passwordAuthError, setPasswordAuthError] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
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

  const { showToast } = useToast();

  const [orderData, setOrderData] = useState<Order>({
    ...initialOrderData,
    id: '',
    orderNumber: generateOrderNumber(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: user?.uid || '',
  });

  // Fetch user-specific orders from Firebase
  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ordersCollectionRef = collection(db, "users", user.uid, "orders");
    const q = query(ordersCollectionRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders: Order[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      showToast({
        message: "Error fetching orders from cloud. Please try again.",
        type: 'error',
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, showToast]);

  // Calculate totals when items change
  useEffect(() => {
    const subtotal = orderData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalAmount = subtotal - orderData.discount + orderData.tax + orderData.shippingCost;
    
    setOrderData(prev => ({
      ...prev,
      subtotal,
      totalAmount,
    }));
  }, [orderData.items, orderData.discount, orderData.tax, orderData.shippingCost]);

  // Track form changes
  useEffect(() => {
    if (loadedOrderId) {
      setHasUnsavedChanges(true);
    }
  }, [orderData, loadedOrderId]);

  const handleSaveOrder = async (orderName: string) => {
    if (!user) {
      setAlertDialog({
        isOpen: true,
        title: "Authentication Required",
        message: "Please ensure you are authenticated to save orders.",
        type: 'warning',
      });
      return;
    }

    setIsSaving(true);

    const orderDataToSave = {
      ...orderData,
      customerName: orderName,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (loadedOrderId) {
        await updateDoc(doc(db, "users", user.uid, "orders", loadedOrderId), orderDataToSave);
        showToast({
          message: `Order "${orderName}" updated successfully!`,
          type: 'success',
        });
      } else {
        const docRef = await addDoc(collection(db, "users", user.uid, "orders"), {
          ...orderDataToSave,
          createdAt: new Date().toISOString(),
        });
        setLoadedOrderId(docRef.id);
        showToast({
          message: `Order "${orderName}" saved successfully!`,
          type: 'success',
        });
      }
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to save order:", error);
      showToast({
        message: "Error saving order. Check console for details.",
        type: 'error',
      });
    } finally {
      setIsSaving(false);
      setIsSaveDialogOpen(false);
    }
  };

  const handleLoadOrder = (recipe: Recipe) => {
    const order = recipe.formData as Order;
    setOrderData({
      ...order,
      orderNumber: generateOrderNumber(),
      orderDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    });
    setLoadedOrderId(recipe.id);
    setHasUnsavedChanges(false);
    showToast({
      message: `Order "${recipe.name}" loaded successfully!`,
      type: 'success',
    });
  };

  const handleDeleteOrder = async (orderId: string, orderName: string) => {
    if (!user) {
      showToast({
        message: "Please log in to delete orders.",
        type: 'error',
      });
      return;
    }

    try {
      await deleteDoc(doc(db, "users", user.uid, "orders", orderId));
      showToast({
        message: `Order "${orderName}" deleted successfully!`,
        type: 'success',
      });
    } catch (error) {
      console.error("Failed to delete order:", error);
      showToast({
        message: "Error deleting order. Please try again.",
        type: 'error',
      });
      throw error;
    }
  };

  const handlePasswordAuthorization = async (password: string) => {
    if (!user || !user.email || !orderToDelete) {
      return;
    }

    setIsAuthenticatingPassword(true);
    setPasswordAuthError(null);

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      setIsPasswordInputOpen(false);
      setAlertDialog({
        isOpen: true,
        title: "Confirm Deletion",
        message: `Password authorized. Are you sure you want to delete the order "${orderToDelete.name}"? This action cannot be undone.`,
        type: 'confirm',
        onConfirm: async () => {
          setIsConfirmingDelete(true);
          try {
            await handleDeleteOrder(orderToDelete.id, orderToDelete.name);
            setOrderToDelete(null);
            setAlertDialog(null);
          } catch (error) {
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
      let errorMessage = "Password authorization failed. Please try again.";
      if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
      }
      setPasswordAuthError(errorMessage);
    } finally {
      setIsAuthenticatingPassword(false);
    }
  };

  const handleClear = () => {
    setOrderData({
      ...initialOrderData,
      id: '',
      orderNumber: generateOrderNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user?.uid || '',
    });
    setLoadedOrderId(null);
    setHasUnsavedChanges(false);
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Order_${orderData.orderNumber}`,
  });

  const handleItemsChange = useCallback((newItems: OrderItem[]) => {
    setOrderData(prev => ({ ...prev, items: newItems }));
  }, []);

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    
    const newItems = Array.from(orderData.items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);
    
    setOrderData(prev => ({ ...prev, items: newItems }));
  };

  // Filter orders with enhanced filtering
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.orderDate);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'today':
          matchesDate = daysDiff === 0;
          break;
        case 'week':
          matchesDate = daysDiff <= 7;
          break;
        case 'month':
          matchesDate = daysDiff <= 30;
          break;
        case 'quarter':
          matchesDate = daysDiff <= 90;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesDate;
  });

  // Calculate enhanced dashboard stats
  const stats = {
    totalOrders: orders.length,
    activeOrders: orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length,
    completedOrders: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0),
    pendingOrders: orders.filter(o => o.status === 'received').length,
    inProduction: orders.filter(o => o.status === 'in-production').length,
    avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length : 0,
    urgentOrders: orders.filter(o => o.priority === 'urgent' && !['delivered', 'cancelled'].includes(o.status)).length,
    overdueOrders: orders.filter(o => {
      const deliveryDate = new Date(o.deliveryDate);
      const today = new Date();
      return deliveryDate < today && !['delivered', 'cancelled'].includes(o.status);
    }).length,
    monthlyGrowth: 12.5, // This would be calculated from historical data
  };

  const StatCard = ({ icon: Icon, label, value, color, trend, trendValue }: { 
    icon: React.ElementType, 
    label: string, 
    value: string | number, 
    color: string,
    trend?: 'up' | 'down' | 'neutral',
    trendValue?: string
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
      className="bg-card p-6 rounded-xl border border-border shadow-sm relative overflow-hidden group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          {trend && trendValue && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              <TrendingUp className={`h-4 w-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-xl ${color} transition-transform group-hover:scale-110`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );

  const QuickActionCard = ({ icon: Icon, title, description, onClick, color }: {
    icon: React.ElementType,
    title: string,
    description: string,
    onClick: () => void,
    color: string
  }) => (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-card p-6 rounded-xl border border-border shadow-sm cursor-pointer group relative overflow-hidden"
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-xl ${color} transition-transform group-hover:scale-110`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );

  const OrderCard = ({ order }: { order: Order }) => {
    const statusInfo = ORDER_STATUSES.find(s => s.value === order.status);
    const priorityInfo = PRIORITY_LEVELS.find(p => p.value === order.priority);
    const isOverdue = new Date(order.deliveryDate) < new Date() && !['delivered', 'cancelled'].includes(order.status);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
        className={`bg-card rounded-xl border shadow-sm p-6 relative overflow-hidden group ${
          isOverdue ? 'border-red-300 bg-red-50/50' : 'border-border'
        }`}
      >
        {/* Priority Badge */}
        <div className="absolute top-4 right-4">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityInfo?.color}`}>
            {priorityInfo?.label}
          </span>
        </div>

        {/* Order Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-foreground">{order.orderNumber}</h3>
            {isOverdue && (
              <div className="flex items-center text-red-600 text-sm">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Overdue
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-1" />
              {order.customerCompany || order.customerName}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(order.orderDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Status and Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo?.color}`}>
              {statusInfo?.label}
            </span>
            <span className="text-lg font-bold text-foreground">₹{order.totalAmount.toFixed(2)}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ 
                width: `${(ORDER_STATUSES.findIndex(s => s.value === order.status) + 1) / ORDER_STATUSES.length * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-muted-foreground">Items:</span>
            <span className="ml-2 font-medium text-foreground">{order.items.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Delivery:</span>
            <span className="ml-2 font-medium text-foreground">
              {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'TBD'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setOrderData(order);
                setLoadedOrderId(order.id);
                setHasUnsavedChanges(false);
                setActiveTab('form');
              }}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const currentData = orderData;
                setOrderData(order);
                setTimeout(() => {
                  handlePrint();
                  setOrderData(currentData);
                }, 100);
              }}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setOrderToDelete({ id: order.id, name: order.orderNumber });
              setIsPasswordInputOpen(true);
              setPasswordAuthError(null);
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Enhanced Header */}
      <div className="bg-card/80 backdrop-blur-sm text-card-foreground border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Order Management
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Complete order lifecycle management from receipt to delivery
              </p>
            </div>
            {activeTab === 'form' && (
              <div className="flex items-center space-x-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl shadow-lg">
                  <span className="text-sm font-medium">Order No:</span>
                  <span className="ml-2 text-lg font-mono font-bold">
                    {orderData.orderNumber}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Main Tabs */}
          <div className="flex space-x-2 bg-muted/50 p-2 rounded-xl w-fit mt-6 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-3 ${
                activeTab === 'dashboard'
                  ? 'bg-card shadow-lg text-foreground border border-border/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('form')}
              className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-3 ${
                activeTab === 'form'
                  ? 'bg-card shadow-lg text-foreground border border-border/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              New Order
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-3 ${
                activeTab === 'history'
                  ? 'bg-card shadow-lg text-foreground border border-border/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              <Clock className="h-5 w-5" />
              Orders
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold">
                {orders.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Enhanced Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={ShoppingCart}
                  label="Total Orders"
                  value={stats.totalOrders}
                  color="bg-gradient-to-br from-blue-500 to-blue-600"
                  trend="up"
                  trendValue="+12.5%"
                />
                <StatCard
                  icon={Activity}
                  label="Active Orders"
                  value={stats.activeOrders}
                  color="bg-gradient-to-br from-orange-500 to-orange-600"
                  trend="up"
                  trendValue="+8.2%"
                />
                <StatCard
                  icon={CheckCircle}
                  label="Completed"
                  value={stats.completedOrders}
                  color="bg-gradient-to-br from-green-500 to-green-600"
                  trend="up"
                  trendValue="+15.3%"
                />
                <StatCard
                  icon={DollarSign}
                  label="Total Revenue"
                  value={`₹${(stats.totalRevenue / 1000).toFixed(1)}K`}
                  color="bg-gradient-to-br from-purple-500 to-purple-600"
                  trend="up"
                  trendValue="+22.1%"
                />
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={Clock}
                  label="Pending Orders"
                  value={stats.pendingOrders}
                  color="bg-gradient-to-br from-yellow-500 to-yellow-600"
                />
                <StatCard
                  icon={Package}
                  label="In Production"
                  value={stats.inProduction}
                  color="bg-gradient-to-br from-indigo-500 to-indigo-600"
                />
                <StatCard
                  icon={Target}
                  label="Avg Order Value"
                  value={`₹${stats.avgOrderValue.toFixed(0)}`}
                  color="bg-gradient-to-br from-teal-500 to-teal-600"
                />
                <StatCard
                  icon={Zap}
                  label="Urgent Orders"
                  value={stats.urgentOrders}
                  color="bg-gradient-to-br from-red-500 to-red-600"
                />
              </div>

              {/* Quick Actions */}
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                  <Zap className="h-6 w-6 mr-3 text-primary" />
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <QuickActionCard
                    icon={Plus}
                    title="Create New Order"
                    description="Start a new order with customer details and items"
                    onClick={() => {
                      handleClear();
                      setActiveTab('form');
                    }}
                    color="bg-gradient-to-br from-green-500 to-green-600"
                  />
                  <QuickActionCard
                    icon={Search}
                    title="Find Orders"
                    description="Search and filter through existing orders"
                    onClick={() => setActiveTab('history')}
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                  />
                  <QuickActionCard
                    icon={AlertTriangle}
                    title="Urgent Orders"
                    description={`${stats.urgentOrders} orders need immediate attention`}
                    onClick={() => {
                      setActiveTab('history');
                      setPriorityFilter('urgent');
                    }}
                    color="bg-gradient-to-br from-red-500 to-red-600"
                  />
                  <QuickActionCard
                    icon={Clock}
                    title="Overdue Orders"
                    description={`${stats.overdueOrders} orders are past delivery date`}
                    onClick={() => {
                      setActiveTab('history');
                      setStatusFilter('in-production');
                    }}
                    color="bg-gradient-to-br from-orange-500 to-orange-600"
                  />
                  <QuickActionCard
                    icon={Package}
                    title="Production Status"
                    description="Monitor orders currently in production"
                    onClick={() => {
                      setActiveTab('history');
                      setStatusFilter('in-production');
                    }}
                    color="bg-gradient-to-br from-purple-500 to-purple-600"
                  />
                  <QuickActionCard
                    icon={Truck}
                    title="Shipment Tracking"
                    description="Track orders ready for shipment"
                    onClick={() => {
                      setActiveTab('history');
                      setStatusFilter('shipped');
                    }}
                    color="bg-gradient-to-br from-indigo-500 to-indigo-600"
                  />
                </div>
              </div>

              {/* Recent Orders Preview */}
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground flex items-center">
                    <Activity className="h-6 w-6 mr-3 text-primary" />
                    Recent Orders
                  </h2>
                  <Button
                    onClick={() => setActiveTab('history')}
                    variant="outline"
                    className="hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    View All Orders
                  </Button>
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-foreground">No orders yet</p>
                    <p className="text-muted-foreground">Create your first order to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.slice(0, 6).map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-card/50 backdrop-blur-sm text-card-foreground rounded-2xl shadow-xl border border-border/50 overflow-hidden"
            >
              {/* Form Header */}
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 border-b border-border/50">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">Order Processing</h2>
                    <p className="text-muted-foreground text-lg mt-1">Create and manage comprehensive textile orders</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-lg ${
                      ORDER_STATUSES.find(s => s.value === orderData.status)?.color || 'bg-gray-100 text-gray-800'
                    }`}>
                      {ORDER_STATUSES.find(s => s.value === orderData.status)?.label}
                    </span>
                  </div>
                </div>

                {/* Enhanced Form Tabs */}
                <div className="flex space-x-2 bg-background/50 p-2 rounded-xl w-fit mt-6 backdrop-blur-sm">
                  <button
                    onClick={() => setActiveFormTab('details')}
                    className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-3 ${
                      activeFormTab === 'details'
                        ? 'bg-card shadow-lg text-foreground border border-border/50'
                        : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                    }`}
                  >
                    <Users className="h-5 w-5" />
                    Order Details
                  </button>
                  <button
                    onClick={() => setActiveFormTab('items')}
                    className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-3 ${
                      activeFormTab === 'items'
                        ? 'bg-card shadow-lg text-foreground border border-border/50'
                        : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                    }`}
                  >
                    <Package className="h-5 w-5" />
                    Items
                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold">
                      {orderData.items.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveFormTab('production')}
                    className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-3 ${
                      activeFormTab === 'production'
                        ? 'bg-card shadow-lg text-foreground border border-border/50'
                        : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                    }`}
                  >
                    <CheckCircle className="h-5 w-5" />
                    Production
                  </button>
                  <button
                    onClick={() => setActiveFormTab('shipment')}
                    className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-3 ${
                      activeFormTab === 'shipment'
                        ? 'bg-card shadow-lg text-foreground border border-border/50'
                        : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                    }`}
                  >
                    <Truck className="h-5 w-5" />
                    Shipment & Tracking
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {activeFormTab === 'details' && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <OrderForm data={orderData} onChange={setOrderData} />
                    </motion.div>
                  )}

                  {activeFormTab === 'items' && (
                    <motion.div
                      key="items"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <DragDropContext onDragEnd={handleOnDragEnd}>
                        <OrderItemsTable
                          items={orderData.items}
                          onItemsChange={handleItemsChange}
                        />
                      </DragDropContext>
                    </motion.div>
                  )}

                  {activeFormTab === 'production' && (
                    <motion.div
                      key="production"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <OrderStatusTimeline order={orderData} />
                      <ProductionTracker
                        stages={orderData.productionStages}
                        qualityChecks={orderData.qualityChecks}
                        onStagesChange={(stages) => setOrderData(prev => ({ ...prev, productionStages: stages }))}
                        onQualityChecksChange={(checks) => setOrderData(prev => ({ ...prev, qualityChecks: checks }))}
                      />
                    </motion.div>
                  )}

                  {activeFormTab === 'shipment' && (
                    <motion.div
                      key="shipment"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <ShipmentTracker
                        shipmentDetails={orderData.shipmentDetails}
                        onShipmentChange={(details) => setOrderData(prev => ({ ...prev, shipmentDetails: details }))}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Enhanced Action Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12 flex flex-wrap justify-end gap-4 pt-8 border-t border-border/50"
                >
                  <Button 
                    variant="outline" 
                    onClick={handleClear}
                    className="hover:bg-muted transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Form
                  </Button>
                  <Button 
                    onClick={() => setIsSaveDialogOpen(true)} 
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {loadedOrderId && hasUnsavedChanges ? 'Save Changes' : 'Save Order'}
                  </Button>
                  <Button 
                    onClick={() => setIsViewOrdersOpen(true)} 
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    View Orders
                  </Button>
                  <Button 
                    onClick={handlePrint} 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Order
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-card/50 backdrop-blur-sm text-card-foreground rounded-2xl shadow-xl border border-border/50 overflow-hidden"
            >
              {/* Enhanced Filters */}
              <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-8 border-b border-border/50">
                <h2 className="text-3xl font-bold text-foreground mb-6">Order History & Management</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="relative lg:col-span-2">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Search orders, customers, companies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 bg-background/80 backdrop-blur-sm border-border/50 focus:border-primary/50 rounded-xl"
                    />
                  </div>
                  
                  <Select.Root value={statusFilter} onValueChange={setStatusFilter}>
                    <Select.Trigger className="flex items-center justify-between h-12 rounded-xl border border-border/50 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/80 backdrop-blur-sm text-foreground px-4">
                      <Select.Value placeholder="All Statuses" />
                      <Select.Icon>
                        <Filter className="h-4 w-4" />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="overflow-hidden rounded-xl bg-card border border-border shadow-2xl z-50 backdrop-blur-sm">
                        <Select.Viewport className="p-2">
                          <Select.Item value="all" className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20 transition-colors">
                            <Select.ItemText>All Statuses</Select.ItemText>
                          </Select.Item>
                          {ORDER_STATUSES.map(status => (
                            <Select.Item key={status.value} value={status.value} className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20 transition-colors">
                              <Select.ItemText>{status.label}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>

                  <Select.Root value={priorityFilter} onValueChange={setPriorityFilter}>
                    <Select.Trigger className="flex items-center justify-between h-12 rounded-xl border border-border/50 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/80 backdrop-blur-sm text-foreground px-4">
                      <Select.Value placeholder="All Priorities" />
                      <Select.Icon>
                        <Star className="h-4 w-4" />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="overflow-hidden rounded-xl bg-card border border-border shadow-2xl z-50 backdrop-blur-sm">
                        <Select.Viewport className="p-2">
                          <Select.Item value="all" className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20 transition-colors">
                            <Select.ItemText>All Priorities</Select.ItemText>
                          </Select.Item>
                          {PRIORITY_LEVELS.map(priority => (
                            <Select.Item key={priority.value} value={priority.value} className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20 transition-colors">
                              <Select.ItemText>{priority.label}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>

                  <Select.Root value={dateFilter} onValueChange={setDateFilter}>
                    <Select.Trigger className="flex items-center justify-between h-12 rounded-xl border border-border/50 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background/80 backdrop-blur-sm text-foreground px-4">
                      <Select.Value placeholder="All Dates" />
                      <Select.Icon>
                        <Calendar className="h-4 w-4" />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="overflow-hidden rounded-xl bg-card border border-border shadow-2xl z-50 backdrop-blur-sm">
                        <Select.Viewport className="p-2">
                          <Select.Item value="all" className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20 transition-colors">
                            <Select.ItemText>All Dates</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="today" className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20 transition-colors">
                            <Select.ItemText>Today</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="week" className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20 transition-colors">
                            <Select.ItemText>This Week</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="month" className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20 transition-colors">
                            <Select.ItemText>This Month</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="quarter" className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20 transition-colors">
                            <Select.ItemText>This Quarter</Select.ItemText>
                          </Select.Item>
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
              </div>

              {/* Orders Grid/Table */}
              <div className="p-8">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
                    <p className="text-xl font-semibold text-foreground">Loading orders...</p>
                    <p className="text-muted-foreground">Please wait while we fetch your data</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-20">
                    <ShoppingCart className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
                    <p className="text-2xl font-bold text-foreground mb-2">
                      {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || dateFilter !== 'all'
                        ? 'No orders found matching your filters' 
                        : 'No orders yet'
                      }
                    </p>
                    <p className="text-muted-foreground text-lg mb-6">
                      {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || dateFilter !== 'all'
                        ? 'Try adjusting your search criteria or filters'
                        : 'Create your first order to get started with order management'
                      }
                    </p>
                    {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && dateFilter === 'all' && (
                      <Button
                        onClick={() => {
                          handleClear();
                          setActiveTab('form');
                        }}
                        className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg"
                        size="lg"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Create First Order
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredOrders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <OrderCard order={order} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden Print Component */}
      <div style={{ display: 'none' }}>
        <PrintableOrder ref={printRef} data={orderData} />
      </div>

      {/* Dialogs */}
      <SaveRecipeDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={handleSaveOrder}
        isSaving={isSaving}
      />

      <ViewRecipesDialog
        isOpen={isViewOrdersOpen}
        onClose={() => setIsViewOrdersOpen(false)}
        onRetrieve={handleLoadOrder}
        onDelete={(id, name) => {
          setOrderToDelete({ id, name });
          setIsPasswordInputOpen(true);
          setPasswordAuthError(null);
        }}
        user={user}
        collectionPath="orders"
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