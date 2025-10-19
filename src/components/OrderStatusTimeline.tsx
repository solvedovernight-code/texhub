import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Package, 
  Truck, 
  MapPin,
  Calendar,
  User,
  Settings,
  Beaker,
  Droplets,
  Sparkles,
  Eye,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { Order, ORDER_STATUSES } from '../types/order';

interface OrderStatusTimelineProps {
  order: Order;
}

const statusIcons = {
  received: Clock,
  confirmed: CheckCircle,
  'in-production': Settings,
  'quality-check': Eye,
  'ready-to-ship': Package,
  shipped: Truck,
  delivered: MapPin,
  cancelled: AlertTriangle,
};

const statusColors = {
  received: 'from-blue-400 to-blue-600',
  confirmed: 'from-green-400 to-green-600',
  'in-production': 'from-yellow-400 to-yellow-600',
  'quality-check': 'from-purple-400 to-purple-600',
  'ready-to-ship': 'from-indigo-400 to-indigo-600',
  shipped: 'from-orange-400 to-orange-600',
  delivered: 'from-emerald-400 to-emerald-600',
  cancelled: 'from-red-400 to-red-600',
};

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ order }) => {
  const getStatusIndex = (status: string) => {
    return ORDER_STATUSES.findIndex(s => s.value === status);
  };

  const currentStatusIndex = getStatusIndex(order.status);

  return (
    <div className="bg-card p-8 rounded-2xl border border-border shadow-lg">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
          <Calendar className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Order Status Timeline</h3>
          <p className="text-muted-foreground">Track your order progress from start to finish</p>
        </div>
      </div>
      
      <div className="relative">
        {/* Enhanced Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-muted via-border to-muted rounded-full"></div>
        
        <div className="space-y-8">
          {ORDER_STATUSES.filter(s => s.value !== 'cancelled').map((status, index) => {
            const Icon = statusIcons[status.value];
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const isPending = index > currentStatusIndex;
            const gradientColor = statusColors[status.value] || 'from-gray-400 to-gray-600';
            
            return (
              <motion.div
                key={status.value}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative flex items-center"
              >
                {/* Enhanced Timeline Dot */}
                <motion.div 
                  className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-2xl border-4 shadow-lg ${
                    isCompleted ? `bg-gradient-to-br ${gradientColor} border-white` :
                    isCurrent ? `bg-gradient-to-br ${gradientColor} border-white animate-pulse` :
                    'bg-muted border-border'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className={`h-7 w-7 ${
                    isCompleted || isCurrent ? 'text-white' : 'text-muted-foreground'
                  }`} />
                  
                  {/* Status Indicator */}
                  {isCurrent && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                
                {/* Enhanced Status Content */}
                <div className="ml-8 flex-1">
                  <div className="bg-card/80 backdrop-blur-sm p-6 rounded-xl border border-border/50 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className={`text-lg font-bold ${
                          isCompleted ? 'text-green-600' :
                          isCurrent ? 'text-primary' :
                          'text-muted-foreground'
                        }`}>
                          {status.label}
                        </h4>
                        <p className={`text-sm font-medium ${
                          isCompleted ? 'text-green-500' :
                          isCurrent ? 'text-primary/80' :
                          'text-muted-foreground'
                        }`}>
                          {isCompleted ? 'Completed' :
                           isCurrent ? 'In Progress' :
                           'Pending'}
                        </p>
                      </div>
                      
                      {/* Status Badge */}
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isCompleted ? 'bg-green-100 text-green-800' :
                        isCurrent ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {isCompleted ? 'DONE' : isCurrent ? 'ACTIVE' : 'WAITING'}
                      </div>
                    </div>
                    
                    {/* Estimated/Actual Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {index === 0 && (
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Started: {new Date(order.orderDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {status.value === 'delivered' && order.deliveryDate && (
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Target: {new Date(order.deliveryDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {isCurrent && (
                        <div className="flex items-center text-primary">
                          <User className="h-4 w-4 mr-2" />
                          <span>Assigned to production team</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Current Status Details */}
                  {isCurrent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/20 rounded-lg">
                          <PlayCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-foreground mb-2">Current Activity</h5>
                          <p className="text-sm text-muted-foreground">
                            {status.value === 'received' && 'Order has been received and is being reviewed by our team.'}
                            {status.value === 'confirmed' && 'Order confirmed and production planning is underway.'}
                            {status.value === 'in-production' && 'Order is currently being processed in our production facility.'}
                            {status.value === 'quality-check' && 'Order is undergoing comprehensive quality inspection.'}
                            {status.value === 'ready-to-ship' && 'Order has passed quality checks and is ready for shipment.'}
                            {status.value === 'shipped' && 'Order has been dispatched and is on its way to you.'}
                            {status.value === 'delivered' && 'Order has been successfully delivered to the specified address.'}
                          </p>
                          
                          {/* Progress Indicators */}
                          <div className="mt-4 flex items-center gap-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span>Live Updates</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>Est. completion in 2-4 hours</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Cancelled Status (if applicable) */}
        {order.status === 'cancelled' && (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative flex items-center mt-8"
          >
            <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-2xl border-4 bg-gradient-to-br from-red-400 to-red-600 border-white shadow-lg">
              <AlertTriangle className="h-7 w-7 text-white" />
            </div>
            <div className="ml-8 flex-1">
              <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800">
                <h4 className="text-lg font-bold text-red-600">Order Cancelled</h4>
                <p className="text-sm text-red-500 mt-1">This order has been cancelled and will not be processed</p>
                <div className="mt-3 text-xs text-red-400">
                  Cancellation reason: Customer request / Payment issues / Stock unavailable
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};