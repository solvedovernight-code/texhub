import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  Calendar, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  Award, 
  Clock,
  Filter,
  Download,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { Button } from './ui/button';
import { ProductionEntry, QUALITY_GRADES } from '../types/production';
import * as Select from '@radix-ui/react-select';
import * as XLSX from 'xlsx';
import { useToast } from './ui/ToastProvider';

interface ProductionReportsProps {
  entries: ProductionEntry[];
  productionType: 'knitting' | 'dyeing' | 'garments';
}

export const ProductionReports: React.FC<ProductionReportsProps> = ({
  entries,
  productionType
}) => {
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  const [chartType, setChartType] = useState<'daily' | 'efficiency' | 'quality' | 'defects'>('daily');
  const { showToast } = useToast();

  // Filter entries based on date range
  const filteredEntries = useMemo(() => {
    if (dateRange === 'all') return entries;
    
    const now = new Date();
    const daysBack = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    
    return entries.filter(entry => new Date(entry.date) >= cutoffDate);
  }, [entries, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredEntries.length === 0) {
      return {
        totalEntries: 0,
        avgEfficiency: 0,
        totalProduction: 0,
        qualityGradeA: 0,
        totalDefects: 0,
        avgHours: 0
      };
    }

    const totalEntries = filteredEntries.length;
    const avgEfficiency = filteredEntries.reduce((sum, entry) => sum + (entry.efficiency || 0), 0) / totalEntries;
    
    let totalProduction = 0;
    let totalDefects = 0;
    
    if (productionType === 'knitting') {
      totalProduction = filteredEntries.reduce((sum, entry) => sum + ((entry as any).actualProduction || 0), 0);
      totalDefects = filteredEntries.reduce((sum, entry) => {
        const defects = (entry as any).defects || {};
        return sum + (defects.holes || 0) + (defects.dropStitches || 0) + (defects.yarnBreaks || 0) + (defects.other || 0);
      }, 0);
    } else if (productionType === 'dyeing') {
      totalProduction = filteredEntries.reduce((sum, entry) => sum + ((entry as any).batchWeight || 0), 0);
    } else if (productionType === 'garments') {
      totalProduction = filteredEntries.reduce((sum, entry) => sum + ((entry as any).completedQuantity || 0), 0);
      totalDefects = filteredEntries.reduce((sum, entry) => {
        const defects = (entry as any).defects || {};
        return sum + (defects.stitchingDefects || 0) + (defects.measurementDefects || 0) + (defects.fabricDefects || 0) + (defects.other || 0);
      }, 0);
    }
    
    const qualityGradeA = filteredEntries.filter(entry => entry.qualityGrade === 'A').length;
    const avgHours = filteredEntries.reduce((sum, entry) => sum + entry.totalHours, 0) / totalEntries;

    return {
      totalEntries,
      avgEfficiency: Math.round(avgEfficiency),
      totalProduction: Math.round(totalProduction),
      qualityGradeA: Math.round((qualityGradeA / totalEntries) * 100),
      totalDefects,
      avgHours: Math.round(avgHours * 10) / 10
    };
  }, [filteredEntries, productionType]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const dailyData = filteredEntries.reduce((acc, entry) => {
      const date = entry.date;
      if (!acc[date]) {
        acc[date] = {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          production: 0,
          efficiency: 0,
          hours: 0,
          count: 0,
          defects: 0,
          gradeA: 0
        };
      }
      
      if (productionType === 'knitting') {
        acc[date].production += (entry as any).actualProduction || 0;
      } else if (productionType === 'dyeing') {
        acc[date].production += (entry as any).batchWeight || 0;
      } else if (productionType === 'garments') {
        acc[date].production += (entry as any).completedQuantity || 0;
      }
      
      acc[date].efficiency += entry.efficiency || 0;
      acc[date].hours += entry.totalHours;
      acc[date].count += 1;
      
      if (entry.qualityGrade === 'A') {
        acc[date].gradeA += 1;
      }
      
      // Calculate defects
      if (productionType === 'knitting') {
        const defects = (entry as any).defects || {};
        acc[date].defects += (defects.holes || 0) + (defects.dropStitches || 0) + (defects.yarnBreaks || 0) + (defects.other || 0);
      } else if (productionType === 'garments') {
        const defects = (entry as any).defects || {};
        acc[date].defects += (defects.stitchingDefects || 0) + (defects.measurementDefects || 0) + (defects.fabricDefects || 0) + (defects.other || 0);
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(dailyData).map((day: any) => ({
      ...day,
      efficiency: Math.round(day.efficiency / day.count),
      gradeAPercent: Math.round((day.gradeA / day.count) * 100)
    }));
  }, [filteredEntries, productionType]);

  // Quality distribution data
  const qualityData = useMemo(() => {
    const distribution = filteredEntries.reduce((acc, entry) => {
      acc[entry.qualityGrade] = (acc[entry.qualityGrade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return QUALITY_GRADES.map(grade => ({
      name: grade.label,
      value: distribution[grade.value] || 0,
      color: grade.value === 'A' ? '#10B981' : 
             grade.value === 'B' ? '#3B82F6' : 
             grade.value === 'C' ? '#F59E0B' : '#EF4444'
    }));
  }, [filteredEntries]);

  const handleExportData = () => {
    if (filteredEntries.length === 0) {
      showToast({ message: 'No data to export', type: 'warning' });
      return;
    }

    const exportData = filteredEntries.map(entry => {
      const baseData = {
        Date: new Date(entry.date).toLocaleDateString(),
        Shift: entry.shift,
        Machine: entry.machineNo,
        Operator: entry.operator,
        Supervisor: entry.supervisor,
        'Start Time': entry.startTime,
        'End Time': entry.endTime,
        'Total Hours': entry.totalHours,
      };

      if (productionType === 'knitting') {
        const knittingEntry = entry as any;
        return {
          ...baseData,
          'Fabric Type': knittingEntry.fabricType,
          'Actual Production (kg)': knittingEntry.actualProduction,
          'Efficiency (%)': knittingEntry.efficiency,
          'Quality Grade': entry.qualityGrade,
          Notes: entry.notes || '',
        };
      } else if (productionType === 'dyeing') {
        const dyeingEntry = entry as any;
        return {
          ...baseData,
          'Fabric Type': dyeingEntry.fabricType,
          Color: dyeingEntry.color,
          'Batch Weight (kg)': dyeingEntry.batchWeight,
          'Actual Production (kg)': dyeingEntry.actualProduction,
          'Efficiency (%)': dyeingEntry.efficiency,
          'Quality Grade': entry.qualityGrade,
          Notes: entry.notes || '',
        };
      } else {
        const garmentsEntry = entry as any;
        return {
          ...baseData,
          Style: garmentsEntry.style,
          Size: garmentsEntry.size,
          Color: garmentsEntry.color,
          'Completed Quantity (pcs)': garmentsEntry.completedQuantity,
          'Efficiency (%)': garmentsEntry.efficiency,
          'Quality Grade': entry.qualityGrade,
          Notes: entry.notes || '',
        };
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${productionType} Reports`);

    const fileName = `${productionType}_production_reports_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    showToast({ message: `Reports exported to ${fileName}`, type: 'success' });
  };

  const StatCard = ({ icon: Icon, label, value, unit, color }: { 
    icon: React.ElementType, 
    label: string, 
    value: string | number, 
    unit?: string,
    color: string 
  }) => (
    <motion.div
      className="bg-card p-6 rounded-xl border border-border shadow-sm"
      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">
            {value}{unit && <span className="text-lg text-muted-foreground ml-1">{unit}</span>}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const renderChart = () => {
    switch (chartType) {
      case 'daily':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Legend />
              <Bar 
                dataKey="production" 
                fill="hsl(var(--primary))" 
                name={productionType === 'dyeing' ? 'Batch Weight (kg)' : productionType === 'knitting' ? 'Production (kg)' : 'Completed Qty'}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'efficiency':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="efficiency" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
                name="Efficiency (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'quality':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={qualityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {qualityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'defects':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="defects" 
                stackId="1"
                stroke="#EF4444" 
                fill="#EF4444"
                fillOpacity={0.6}
                name="Total Defects"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  const getProductionUnit = () => {
    switch (productionType) {
      case 'knitting': return 'kg';
      case 'dyeing': return 'kg';
      case 'garments': return 'pcs';
    }
  };

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <StatCard
          icon={Calendar}
          label="Total Entries"
          value={stats.totalEntries}
          color="bg-blue-500"
        />
        <StatCard
          icon={Target}
          label="Avg Efficiency"
          value={stats.avgEfficiency}
          unit="%"
          color="bg-green-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Production"
          value={stats.totalProduction}
          unit={getProductionUnit()}
          color="bg-purple-500"
        />
        <StatCard
          icon={Award}
          label="Grade A Quality"
          value={stats.qualityGradeA}
          unit="%"
          color="bg-yellow-500"
        />
        <StatCard
          icon={AlertTriangle}
          label="Total Defects"
          value={stats.totalDefects}
          color="bg-red-500"
        />
        <StatCard
          icon={Clock}
          label="Avg Hours"
          value={stats.avgHours}
          unit="hrs"
          color="bg-indigo-500"
        />
      </div>

      {/* Charts Section */}
      <div className="bg-card p-8 rounded-2xl border border-border shadow-lg">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-foreground">Production Analytics</h3>
            <p className="text-muted-foreground">Visualize your production performance and trends</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select.Root value={dateRange} onValueChange={(value) => setDateRange(value as any)}>
              <Select.Trigger className="flex items-center justify-between w-32 rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3">
                <Select.Value />
                <Select.Icon>
                  <Filter className="h-4 w-4" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="overflow-hidden rounded-lg bg-card border border-border shadow-lg z-50">
                  <Select.Viewport className="p-1">
                    <Select.Item value="7days" className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                      <Select.ItemText>7 Days</Select.ItemText>
                    </Select.Item>
                    <Select.Item value="30days" className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                      <Select.ItemText>30 Days</Select.ItemText>
                    </Select.Item>
                    <Select.Item value="90days" className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                      <Select.ItemText>90 Days</Select.ItemText>
                    </Select.Item>
                    <Select.Item value="all" className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                      <Select.ItemText>All Time</Select.ItemText>
                    </Select.Item>
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>

            <Select.Root value={chartType} onValueChange={(value) => setChartType(value as any)}>
              <Select.Trigger className="flex items-center justify-between w-40 rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3">
                <Select.Value />
                <Select.Icon>
                  <BarChart3 className="h-4 w-4" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="overflow-hidden rounded-lg bg-card border border-border shadow-lg z-50">
                  <Select.Viewport className="p-1">
                    <Select.Item value="daily" className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      <Select.ItemText>Daily Production</Select.ItemText>
                    </Select.Item>
                    <Select.Item value="efficiency" className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                      <Activity className="h-4 w-4 mr-2" />
                      <Select.ItemText>Efficiency Trend</Select.ItemText>
                    </Select.Item>
                    <Select.Item value="quality" className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                      <PieChartIcon className="h-4 w-4 mr-2" />
                      <Select.ItemText>Quality Distribution</Select.ItemText>
                    </Select.Item>
                    <Select.Item value="defects" className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <Select.ItemText>Defects Trend</Select.ItemText>
                    </Select.Item>
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>
        </div>

        <div className="h-96">
          {filteredEntries.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground">No data available</p>
                <p className="text-sm text-muted-foreground">Add production entries to see analytics</p>
              </div>
            </div>
          ) : (
            renderChart()
          )}
        </div>
      </div>

      {/* Recent Entries Table */}
      <div className="bg-card p-8 rounded-2xl border border-border shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-foreground">Recent Production Entries</h3>
            <p className="text-muted-foreground">Latest production data entries</p>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleExportData}
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>

        <div className="overflow-x-auto">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">No entries found</p>
              <p className="text-sm text-muted-foreground">Start recording production data to see entries here</p>
            </div>
          ) : (
            <table className="min-w-full border-collapse border border-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Date</th>
                  <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Shift</th>
                  <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Machine</th>
                  <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Operator</th>
                  <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Production</th>
                  <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Efficiency</th>
                  <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Quality</th>
                  <th className="border border-border px-4 py-3 text-center text-sm font-medium text-foreground">Hours</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.slice(0, 10).map((entry) => {
                  const qualityGrade = QUALITY_GRADES.find(g => g.value === entry.qualityGrade);
                  return (
                    <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                      <td className="border border-border px-4 py-3 text-sm text-foreground text-center">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="border border-border px-4 py-3 text-sm text-foreground capitalize text-center">
                        {entry.shift}
                      </td>
                      <td className="border border-border px-4 py-3 text-sm text-foreground font-mono text-center">
                        {entry.machineNo}
                      </td>
                      <td className="border border-border px-4 py-3 text-sm text-foreground text-center">
                        {entry.operator}
                      </td>
                      <td className="border border-border px-4 py-3 text-sm text-foreground text-center">
                        {productionType === 'knitting' && `${(entry as any).actualProduction || 0} kg`}
                        {productionType === 'dyeing' && `${(entry as any).batchWeight || 0} kg`}
                        {productionType === 'garments' && `${(entry as any).completedQuantity || 0} pcs`}
                      </td>
                      <td className="border border-border px-4 py-3 text-sm text-foreground text-center">
                        {entry.efficiency || 0}%
                      </td>
                      <td className="border border-border px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${qualityGrade?.color || 'bg-gray-100 text-gray-800'}`}>
                          {entry.qualityGrade}
                        </span>
                      </td>
                      <td className="border border-border px-4 py-3 text-sm text-foreground text-center">
                        {entry.totalHours}h
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};