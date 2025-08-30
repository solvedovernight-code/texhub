import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  Package, 
  MapPin, 
  Phone, 
  Calendar, 
  DollarSign, 
  Weight, 
  Ruler,
  Clock,
  CheckCircle,
  AlertTriangle,
  Navigation,
  User,
  Building,
  Mail,
  Copy,
  ExternalLink,
  Plane,
  Ship,
  Car
} from 'lucide-react';
import { ShipmentDetails } from '../types/order';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { TypedMemoryInput } from './TypedMemoryInput';
import * as Select from '@radix-ui/react-select';

interface ShipmentTrackerProps {
  shipmentDetails: ShipmentDetails | undefined;
  onShipmentChange: (details: ShipmentDetails) => void;
}

const SHIPPING_METHODS = [
  { value: 'express', label: 'Express Delivery', icon: Plane, color: 'text-red-500' },
  { value: 'standard', label: 'Standard Shipping', icon: Truck, color: 'text-blue-500' },
  { value: 'economy', label: 'Economy Shipping', icon: Car, color: 'text-green-500' },
  { value: 'freight', label: 'Freight Shipping', icon: Ship, color: 'text-purple-500' },
];

const CARRIERS = [
  'DHL Express',
  'FedEx',
  'UPS',
  'USPS',
  'Local Courier',
  'Blue Dart',
  'DTDC',
  'Professional Couriers',
  'Aramex',
  'TNT Express'
];

export const ShipmentTracker: React.FC<ShipmentTrackerProps> = ({
  shipmentDetails,
  onShipmentChange,
}) => {
  const [trackingStatus, setTrackingStatus] = useState<'pending' | 'in-transit' | 'delivered' | 'exception'>('pending');

  const handleChange = (field: keyof ShipmentDetails, value: string | number) => {
    const updatedDetails = {
      ...shipmentDetails,
      [field]: value,
    } as ShipmentDetails;
    onShipmentChange(updatedDetails);
  };

  const copyTrackingNumber = () => {
    if (shipmentDetails?.trackingNumber) {
      navigator.clipboard.writeText(shipmentDetails.trackingNumber);
    }
  };

  const openCarrierTracking = () => {
    if (shipmentDetails?.trackingNumber && shipmentDetails?.carrier) {
      // This would open the carrier's tracking page
      window.open(`https://www.google.com/search?q=${shipmentDetails.carrier}+tracking+${shipmentDetails.trackingNumber}`, '_blank');
    }
  };

  const inputClasses = "mt-1 block w-full rounded-xl border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-3 px-4 transition-all duration-200 hover:border-primary/50";
  const labelClasses = "block text-sm font-semibold text-foreground mb-2";

  const getShippingMethodIcon = (method: string) => {
    const methodInfo = SHIPPING_METHODS.find(m => m.value === method);
    return methodInfo ? methodInfo.icon : Truck;
  };

  const getShippingMethodColor = (method: string) => {
    const methodInfo = SHIPPING_METHODS.find(m => m.value === method);
    return methodInfo ? methodInfo.color : 'text-blue-500';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-2xl border border-border/50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Truck className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Shipment Management & Tracking</h2>
              <p className="text-muted-foreground text-lg">Comprehensive shipping and delivery management</p>
            </div>
          </div>
          
          {shipmentDetails?.trackingNumber && (
            <div className="flex items-center gap-3">
              <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="text-sm text-muted-foreground">Tracking Number</div>
                <div className="font-mono font-bold text-lg text-foreground">{shipmentDetails.trackingNumber}</div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={copyTrackingNumber}
                  variant="outline"
                  size="sm"
                  className="hover:bg-primary hover:text-primary-foreground"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  onClick={openCarrierTracking}
                  variant="outline"
                  size="sm"
                  className="hover:bg-primary hover:text-primary-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card p-8 rounded-2xl border border-border shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <Package className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Shipping Information</h3>
          </div>

          <div className="space-y-6">
            {/* Tracking and Carrier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>
                  <Navigation className="inline h-4 w-4 mr-2" />
                  Tracking Number
                </label>
                <Input
                  value={shipmentDetails?.trackingNumber || ''}
                  onChange={(e) => handleChange('trackingNumber', e.target.value)}
                  className={inputClasses}
                  placeholder="TRK123456789"
                />
              </div>
              <div>
                <label className={labelClasses}>
                  <Truck className="inline h-4 w-4 mr-2" />
                  Carrier
                </label>
                <Select.Root 
                  value={shipmentDetails?.carrier || ''} 
                  onValueChange={(value) => handleChange('carrier', value)}
                >
                  <Select.Trigger className={inputClasses}>
                    <Select.Value placeholder="Select Carrier" />
                    <Select.Icon>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-xl bg-card border border-border shadow-2xl z-50">
                      <Select.Viewport className="p-2">
                        {CARRIERS.map(carrier => (
                          <Select.Item key={carrier} value={carrier} className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20 transition-colors">
                            <Select.ItemText>{carrier}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
            </div>

            {/* Shipping Method */}
            <div>
              <label className={labelClasses}>
                <Settings className="inline h-4 w-4 mr-2" />
                Shipping Method
              </label>
              <Select.Root 
                value={shipmentDetails?.shippingMethod || ''} 
                onValueChange={(value) => handleChange('shippingMethod', value)}
              >
                <Select.Trigger className={inputClasses}>
                  <Select.Value placeholder="Select Shipping Method" />
                  <Select.Icon>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="overflow-hidden rounded-xl bg-card border border-border shadow-2xl z-50">
                    <Select.Viewport className="p-2">
                      {SHIPPING_METHODS.map(method => {
                        const Icon = method.icon;
                        return (
                          <Select.Item key={method.value} value={method.value} className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20 transition-colors">
                            <Icon className={`h-4 w-4 mr-3 ${method.color}`} />
                            <Select.ItemText>{method.label}</Select.ItemText>
                          </Select.Item>
                        );
                      })}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            {/* Delivery Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>
                  <Calendar className="inline h-4 w-4 mr-2" />
                  Estimated Delivery
                </label>
                <input
                  type="date"
                  value={shipmentDetails?.estimatedDelivery || ''}
                  onChange={(e) => handleChange('estimatedDelivery', e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>
                  <CheckCircle className="inline h-4 w-4 mr-2" />
                  Actual Delivery
                </label>
                <input
                  type="date"
                  value={shipmentDetails?.actualDelivery || ''}
                  onChange={(e) => handleChange('actualDelivery', e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Package Details */}
            <div className="bg-muted/30 p-6 rounded-xl border border-border/50">
              <h4 className="font-semibold text-foreground mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Package Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClasses}>
                    <DollarSign className="inline h-4 w-4 mr-2" />
                    Shipping Cost
                  </label>
                  <input
                    type="number"
                    value={shipmentDetails?.shippingCost || ''}
                    onChange={(e) => handleChange('shippingCost', parseFloat(e.target.value) || 0)}
                    className={inputClasses}
                    placeholder="0.00"
                    min="0"
                    step="any"
                  />
                </div>
                <div>
                  <label className={labelClasses}>
                    <Weight className="inline h-4 w-4 mr-2" />
                    Package Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={shipmentDetails?.packageWeight || ''}
                    onChange={(e) => handleChange('packageWeight', parseFloat(e.target.value) || 0)}
                    className={inputClasses}
                    placeholder="0.00"
                    min="0"
                    step="any"
                  />
                </div>
                <div>
                  <label className={labelClasses}>
                    <Ruler className="inline h-4 w-4 mr-2" />
                    Dimensions
                  </label>
                  <Input
                    value={shipmentDetails?.packageDimensions || ''}
                    onChange={(e) => handleChange('packageDimensions', e.target.value)}
                    className={inputClasses}
                    placeholder="L x W x H (cm)"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Delivery Information */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card p-8 rounded-2xl border border-border shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Delivery Information</h3>
          </div>

          <div className="space-y-6">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>
                  <User className="inline h-4 w-4 mr-2" />
                  Contact Person
                </label>
                <TypedMemoryInput
                  value={shipmentDetails?.contactPerson || ''}
                  onChange={(e) => handleChange('contactPerson', e.target.value)}
                  className={inputClasses}
                  storageKey="shipmentContactPerson"
                  placeholder="Contact Person Name"
                />
              </div>
              <div>
                <label className={labelClasses}>
                  <Phone className="inline h-4 w-4 mr-2" />
                  Contact Phone
                </label>
                <TypedMemoryInput
                  type="tel"
                  value={shipmentDetails?.contactPhone || ''}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                  className={inputClasses}
                  storageKey="shipmentContactPhone"
                  placeholder="Contact Phone Number"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <label className={labelClasses}>
                <Building className="inline h-4 w-4 mr-2" />
                Delivery Address
              </label>
              <textarea
                value={shipmentDetails?.deliveryAddress || ''}
                onChange={(e) => handleChange('deliveryAddress', e.target.value)}
                className={`${inputClasses} min-h-[120px] resize-none`}
                rows={4}
                placeholder="Complete delivery address with postal code"
              />
            </div>

            {/* Tracking Status Simulator */}
            <div className="bg-muted/30 p-6 rounded-xl border border-border/50">
              <h4 className="font-semibold text-foreground mb-4 flex items-center">
                <Navigation className="h-5 w-5 mr-2" />
                Tracking Status
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Current Status:</span>
                  <Select.Root value={trackingStatus} onValueChange={(value) => setTrackingStatus(value as any)}>
                    <Select.Trigger className="flex items-center justify-between w-48 rounded-lg border border-border bg-background text-foreground py-2 px-3">
                      <Select.Value />
                      <Select.Icon>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="overflow-hidden rounded-xl bg-card border border-border shadow-2xl z-50">
                        <Select.Viewport className="p-2">
                          <Select.Item value="pending" className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                            <Clock className="h-4 w-4 mr-3 text-yellow-500" />
                            <Select.ItemText>Pending Pickup</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="in-transit" className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                            <Truck className="h-4 w-4 mr-3 text-blue-500" />
                            <Select.ItemText>In Transit</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="delivered" className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                            <CheckCircle className="h-4 w-4 mr-3 text-green-500" />
                            <Select.ItemText>Delivered</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="exception" className="relative flex items-center rounded-lg py-3 pl-4 pr-12 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                            <AlertTriangle className="h-4 w-4 mr-3 text-red-500" />
                            <Select.ItemText>Exception</Select.ItemText>
                          </Select.Item>
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>

                {/* Status Timeline */}
                <div className="space-y-3">
                  {[
                    { status: 'pending', label: 'Order Processed', time: '2 hours ago', active: true },
                    { status: 'in-transit', label: 'Package Picked Up', time: '1 hour ago', active: trackingStatus !== 'pending' },
                    { status: 'in-transit', label: 'In Transit', time: 'Estimated in 30 mins', active: trackingStatus === 'in-transit' || trackingStatus === 'delivered' },
                    { status: 'delivered', label: 'Out for Delivery', time: 'Pending', active: trackingStatus === 'delivered' },
                    { status: 'delivered', label: 'Delivered', time: 'Pending', active: false },
                  ].map((step, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        step.active ? 'bg-green-500' : 'bg-muted'
                      }`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className={`text-sm font-medium ${
                            step.active ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {step.label}
                          </span>
                          <span className="text-xs text-muted-foreground">{step.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Delivery Tracking Map Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card p-8 rounded-2xl border border-border shadow-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Live Tracking</h3>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 border border-border/50">
          <div className="text-center">
            <MapPin className="h-16 w-16 mx-auto text-primary mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-2">Real-time Tracking</h4>
            <p className="text-muted-foreground mb-6">
              Interactive map showing package location and delivery route would appear here
            </p>
            
            {shipmentDetails?.trackingNumber ? (
              <div className="space-y-4">
                <div className="bg-card p-4 rounded-lg border border-border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current Location:</span>
                      <p className="font-medium text-foreground">Distribution Center</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Next Stop:</span>
                      <p className="font-medium text-foreground">Local Facility</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ETA:</span>
                      <p className="font-medium text-foreground">2-3 hours</p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={openCarrierTracking}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Track on Carrier Website
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">Enter tracking number to enable live tracking</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};