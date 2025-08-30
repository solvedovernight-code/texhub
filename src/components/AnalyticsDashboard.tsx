import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'framer-motion';

const lineChartData = [
  { name: 'Jan', 'Batches Processed': 4000, 'Recipes Created': 2400 },
  { name: 'Feb', 'Batches Processed': 3000, 'Recipes Created': 1398 },
  { name: 'Mar', 'Batches Processed': 2000, 'Recipes Created': 9800 },
  { name: 'Apr', 'Batches Processed': 2780, 'Recipes Created': 3908 },
  { name: 'May', 'Batches Processed': 1890, 'Recipes Created': 4800 },
  { name: 'Jun', 'Batches Processed': 2390, 'Recipes Created': 3800 },
  { name: 'Jul', 'Batches Processed': 3490, 'Recipes Created': 4300 },
];

const pieChartData = [
  { name: 'Cotton', value: 400 },
  { name: 'Polyester', value: 300 },
  { name: 'Silk', value: 300 },
  { name: 'Wool', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function AnalyticsDashboard() {
  return (
    <motion.div
      className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-lg grid grid-cols-1 lg:grid-cols-2 gap-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Batches Processed & Recipes Created</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={lineChartData}
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
              <Line type="monotone" dataKey="Batches Processed" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} strokeWidth={2} />
              <Line type="monotone" dataKey="Recipes Created" stroke="#82ca9d" activeDot={{ r: 8 }} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Fabric Type Distribution</h3>
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                animationBegin={800}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {pieChartData.map((entry, index) => (
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
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
