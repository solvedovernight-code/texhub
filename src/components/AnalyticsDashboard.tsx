import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import { ProductionEntry } from '../types/production';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface AnalyticsDashboardProps {
  entries: ProductionEntry[];
  productionType: 'knitting' | 'dyeing' | 'garments';
}

export function AnalyticsDashboard({ entries, productionType }: AnalyticsDashboardProps) {
  // Process entries for monthly chart
  const monthlyData = useMemo(() => {
    if (!entries || entries.length === 0) return [];

    const monthlyStats = entries.reduce((acc, entry) => {
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      if (!acc[monthKey]) {
        acc[monthKey] = {
          name: monthName,
          entries: 0,
          production: 0,
          sortKey: monthKey
        };
      }

      acc[monthKey].entries += 1;

      if (productionType === 'knitting') {
        acc[monthKey].production += (entry as any).actualProduction || 0;
      } else if (productionType === 'dyeing') {
        acc[monthKey].production += (entry as any).actualProduction || 0;
      } else if (productionType === 'garments') {
        acc[monthKey].production += (entry as any).completedQuantity || 0;
      }

      return acc;
    }, {} as Record<string, any>);

    return Object.values(monthlyStats)
      .sort((a: any, b: any) => a.sortKey.localeCompare(b.sortKey))
      .slice(-6);
  }, [entries, productionType]);

  // Process entries for fabric/style distribution
  const distributionData = useMemo(() => {
    if (!entries || entries.length === 0) return [];

    const distribution: Record<string, number> = {};

    entries.forEach(entry => {
      let key = 'Unknown';

      if (productionType === 'knitting') {
        key = (entry as any).fabricType || 'Unknown';
      } else if (productionType === 'dyeing') {
        key = (entry as any).color || 'Unknown';
      } else if (productionType === 'garments') {
        key = (entry as any).style || 'Unknown';
      }

      distribution[key] = (distribution[key] || 0) + 1;
    });

    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [entries, productionType]);

  const getDistributionLabel = () => {
    switch (productionType) {
      case 'knitting': return 'Fabric Type Distribution';
      case 'dyeing': return 'Color Distribution';
      case 'garments': return 'Style Distribution';
    }
  };

  const getProductionLabel = () => {
    switch (productionType) {
      case 'knitting': return 'Production (kg)';
      case 'dyeing': return 'Production (kg)';
      case 'garments': return 'Production (pcs)';
    }
  };
  if (!entries || entries.length === 0) {
    return (
      <motion.div
        className="bg-card text-card-foreground p-8 rounded-xl border border-border shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="text-center py-12">
          <BarChart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">No data available</p>
          <p className="text-sm text-muted-foreground">Import or add production entries to see analytics</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-lg grid grid-cols-1 lg:grid-cols-2 gap-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Production Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  padding: '10px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
              />
              <Legend />
              <Bar dataKey="entries" fill="hsl(var(--primary))" name="Total Entries" radius={[4, 4, 0, 0]} />
              <Bar dataKey="production" fill="#82ca9d" name={getProductionLabel()} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">{getDistributionLabel()}</h3>
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                animationBegin={800}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  padding: '10px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
