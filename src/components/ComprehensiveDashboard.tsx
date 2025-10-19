import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart } from 'recharts';
import { Package, ShoppingCart, FileText, TrendingUp, AlertTriangle, Clock, DollarSign, Layers, Activity, Beaker } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import { InventoryItem } from '../types/inventory';
import { Order } from '../types/order';
import { Recipe } from '../types';
import { User } from 'firebase/auth';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface DashboardStats {
  totalInventoryValue: number;
  lowStockItems: number;
  activeOrders: number;
  completedOrders: number;
  totalRevenue: number;
  pendingRevenue: number;
  totalProduction: number;
  totalRecipes: number;
  inventoryItems: number;
}

interface ChartData {
  name: string;
  value?: number;
  batches?: number;
  recipes?: number;
}

interface ComprehensiveDashboardProps {
  user: User | null;
}

export function ComprehensiveDashboard({ user }: ComprehensiveDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalInventoryValue: 0,
    lowStockItems: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    totalProduction: 0,
    totalRecipes: 0,
    inventoryItems: 0,
  });
  const [orderStatusData, setOrderStatusData] = useState<ChartData[]>([]);
  const [inventoryCategoryData, setInventoryCategoryData] = useState<ChartData[]>([]);
  const [productionTrendData, setProductionTrendData] = useState<ChartData[]>([]);
  const [recipeTrendData, setRecipeTrendData] = useState<ChartData[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch Inventory Data
      const inventorySnapshot = await getDocs(
        collection(db, `users/${user.uid}/inventory`)
      );
      const inventoryItems: InventoryItem[] = [];
      inventorySnapshot.forEach((doc) => {
        inventoryItems.push({ id: doc.id, ...doc.data() } as InventoryItem);
      });

      // Fetch Orders Data
      const ordersSnapshot = await getDocs(
        collection(db, `users/${user.uid}/orders`)
      );
      const orders: Order[] = [];
      ordersSnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });

      // Fetch Recipes Data
      const recipesSnapshot = await getDocs(
        collection(db, `users/${user.uid}/saved_recipes`)
      );
      const recipes: Recipe[] = [];
      recipesSnapshot.forEach((doc) => {
        recipes.push({ id: doc.id, ...doc.data() } as Recipe);
      });

      // Fetch Production Data from all departments
      const productionCollections = ['knitting_entries', 'dyeing_entries', 'garments_entries'];
      let totalProductionEntries = 0;
      const allProductionEntries: any[] = [];

      for (const collectionName of productionCollections) {
        const snapshot = await getDocs(
          collection(db, `users/${user.uid}/${collectionName}`)
        );
        totalProductionEntries += snapshot.size;
        snapshot.forEach((doc) => {
          allProductionEntries.push({
            id: doc.id,
            ...doc.data(),
            collection: collectionName
          });
        });
      }

      // Calculate inventory stats
      const totalInventoryValue = inventoryItems.reduce(
        (sum, item) => sum + (item.currentStock * item.unitPrice),
        0
      );
      const lowStockItems = inventoryItems.filter(
        (item) => item.currentStock <= item.minStock
      ).length;

      // Calculate inventory by category
      const categoryMap: Record<string, number> = {};
      inventoryItems.forEach((item) => {
        const categoryName = item.category.charAt(0).toUpperCase() + item.category.slice(1);
        categoryMap[categoryName] = (categoryMap[categoryName] || 0) + 1;
      });
      const categoryData = Object.entries(categoryMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // Calculate order stats
      const activeOrders = orders.filter(
        (order) => !['delivered', 'cancelled'].includes(order.status)
      ).length;
      const completedOrders = orders.filter(
        (order) => order.status === 'delivered'
      ).length;

      // Calculate order status distribution
      const statusMap: Record<string, number> = {};
      orders.forEach((order) => {
        const statusLabel = order.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        statusMap[statusLabel] = (statusMap[statusLabel] || 0) + 1;
      });
      const statusData = Object.entries(statusMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // Calculate revenue stats
      const totalRevenue = orders
        .filter((order) => order.status === 'delivered')
        .reduce((sum, order) => sum + order.totalAmount, 0);
      const pendingRevenue = orders
        .filter((order) => !['delivered', 'cancelled'].includes(order.status))
        .reduce((sum, order) => sum + order.totalAmount, 0);

      // Calculate monthly production trend (last 7 months)
      const monthlyProduction: Record<string, { batches: number; recipes: number }> = {};

      // Process production entries
      allProductionEntries.forEach((entry) => {
        if (entry.date) {
          const date = new Date(entry.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyProduction[monthKey]) {
            monthlyProduction[monthKey] = { batches: 0, recipes: 0 };
          }
          monthlyProduction[monthKey].batches += 1;
        }
      });

      // Process recipes
      recipes.forEach((recipe) => {
        if (recipe.timestamp) {
          const date = new Date(recipe.timestamp);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyProduction[monthKey]) {
            monthlyProduction[monthKey] = { batches: 0, recipes: 0 };
          }
          monthlyProduction[monthKey].recipes += 1;
        }
      });

      const productionChartData = Object.entries(monthlyProduction)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-7)
        .map(([monthKey, data]) => {
          const [year, month] = monthKey.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1);
          const monthName = date.toLocaleDateString('en-US', { month: 'short' });
          return {
            name: monthName,
            batches: data.batches,
            recipes: data.recipes
          };
        });

      // Update state
      setStats({
        totalInventoryValue,
        lowStockItems,
        activeOrders,
        completedOrders,
        totalRevenue,
        pendingRevenue,
        totalProduction: totalProductionEntries,
        totalRecipes: recipes.length,
        inventoryItems: inventoryItems.length,
      });
      setOrderStatusData(statusData);
      setInventoryCategoryData(categoryData);
      setProductionTrendData(productionChartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
    prefix = '',
    suffix = ''
  }: {
    icon: React.ElementType;
    label: string;
    value: number | string;
    color: string;
    prefix?: string;
    suffix?: string;
  }) => (
    <motion.div
      className="bg-card text-card-foreground p-5 rounded-lg border border-border shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
          <p className="text-2xl font-bold text-foreground">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="bg-card text-card-foreground p-8 rounded-xl border border-border shadow-sm">
        <div className="text-center py-12">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium text-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const hasData = stats.inventoryItems > 0 || stats.activeOrders > 0 || stats.totalProduction > 0;

  if (!hasData) {
    return (
      <motion.div
        className="bg-card text-card-foreground p-8 rounded-xl border border-border shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center py-12">
          <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">No data available yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Start by adding inventory, creating orders, or recording production data
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics - Organized Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={Layers}
          label="Production"
          value={stats.totalProduction}
          color="bg-blue-500"
        />
        <StatCard
          icon={Beaker}
          label="Recipes"
          value={stats.totalRecipes}
          color="bg-emerald-500"
        />
        <StatCard
          icon={Package}
          label="Inventory"
          value={stats.inventoryItems}
          color="bg-violet-500"
        />
        <StatCard
          icon={ShoppingCart}
          label="Active Orders"
          value={stats.activeOrders}
          color="bg-amber-500"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock"
          value={stats.lowStockItems}
          color="bg-red-500"
        />
        <StatCard
          icon={DollarSign}
          label="Revenue"
          value={`$${Math.round(stats.totalRevenue / 1000)}k`}
          color="bg-green-500"
        />
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -3, boxShadow: "0 8px 16px rgba(16, 185, 129, 0.3)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs font-medium uppercase tracking-wide mb-1">Total Revenue</p>
              <p className="text-3xl font-bold">${Math.round(stats.totalRevenue).toLocaleString()}</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-200 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-lg shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -3, boxShadow: "0 8px 16px rgba(245, 158, 11, 0.3)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-xs font-medium uppercase tracking-wide mb-1">Pending Revenue</p>
              <p className="text-3xl font-bold">${Math.round(stats.pendingRevenue).toLocaleString()}</p>
            </div>
            <Clock className="h-10 w-10 text-amber-200 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-violet-500 to-violet-600 text-white p-6 rounded-lg shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -3, boxShadow: "0 8px 16px rgba(139, 92, 246, 0.3)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-100 text-xs font-medium uppercase tracking-wide mb-1">Inventory Value</p>
              <p className="text-3xl font-bold">${Math.round(stats.totalInventoryValue).toLocaleString()}</p>
            </div>
            <Package className="h-10 w-10 text-violet-200 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white p-6 rounded-lg shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -3, boxShadow: "0 8px 16px rgba(6, 182, 212, 0.3)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-xs font-medium uppercase tracking-wide mb-1">Completed Orders</p>
              <p className="text-3xl font-bold">{stats.completedOrders.toLocaleString()}</p>
            </div>
            <FileText className="h-10 w-10 text-cyan-200 opacity-80" />
          </div>
        </motion.div>
      </div>

      {/* Charts Grid - 2x2 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Production Trend */}
        {productionTrendData.length > 0 && (
          <motion.div
            className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Production Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '11px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      padding: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px' }}
                    iconType="circle"
                  />
                  <Line
                    type="monotone"
                    dataKey="batches"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Batches"
                  />
                  <Line
                    type="monotone"
                    dataKey="recipes"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Recipes"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Order Status Distribution */}
        {orderStatusData.length > 0 && (
          <motion.div
            className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Order Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Inventory by Category */}
        {inventoryCategoryData.length > 0 && (
          <motion.div
            className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Inventory by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '11px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Revenue Overview - Area Chart */}
        <motion.div
          className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: 'Total', value: stats.totalRevenue, label: 'Delivered' },
                { name: 'Pending', value: stats.pendingRevenue, label: 'In Progress' },
                { name: 'Inventory', value: stats.totalInventoryValue, label: 'Stock Value' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '11px' }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '11px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `$${Math.round(value).toLocaleString()}`}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
