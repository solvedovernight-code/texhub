import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { Save, User, Building, Palette, Globe, Bell, Shield, Database, Printer } from 'lucide-react';
import { auth } from '../lib/firebaseConfig';
import { updateProfile } from 'firebase/auth';
import { EXPERTISE_AREAS } from '../types/social';
import * as Select from '@radix-ui/react-select'; // Import Radix UI Select
import { UserSettings, defaultSettings } from '../types/settings'; // Import from types/settings

interface SettingsProps {
  onSettingsUpdate: (settings: UserSettings) => void;
}

export function Settings({ onSettingsUpdate }: SettingsProps) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState('company');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // Apply theme change immediately
      const currentTheme = settings.theme;
      document.body.className = `theme-${currentTheme}`;
      
      // Notify parent (App.tsx) about the updated settings
      onSettingsUpdate(settings);
      
      setNotification({ type: 'success', message: 'Settings saved successfully!' });
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setNotification({ type: 'error', message: 'Failed to save settings. Please try again.' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { id: 'company', label: 'Company', icon: Building },
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'preferences', label: 'Preferences', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'printing', label: 'Printing', icon: Printer },
    { id: 'system', label: 'System', icon: Database },
    { id: 'navigation', label: 'Navigation', icon: Globe },
  ];

  const handleExpertiseChange = (expertise: string, checked: boolean) => {
    if (checked) {
      setSettings(prev => ({
        ...prev,
        personalExpertise: [...prev.personalExpertise, expertise]
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        personalExpertise: prev.personalExpertise.filter(e => e !== expertise)
      }));
    }
  };

  const handleMenuItemToggle = (itemId: string, enabled: boolean) => {
    if (enabled) {
      setSettings(prev => ({
        ...prev,
        enabledMenuItems: [...prev.enabledMenuItems, itemId]
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        enabledMenuItems: prev.enabledMenuItems.filter(id => id !== itemId)
      }));
    }
  };
  // Common input classes - Updated for dark theme and consistency
  const inputClasses = "w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface text-text py-2 px-3 transition-all duration-200 hover:border-primary/50";
  // Select trigger classes - Updated for dark theme and custom arrow
  const selectTriggerClasses = "flex items-center justify-between w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-surface text-text py-2 px-3 transition-all duration-200 hover:border-primary/50";
  // Label classes - Updated for dark theme
  const labelClasses = "block text-sm font-medium text-textSecondary mb-2";


  const renderTabContent = () => {
    const SelectItemContent = ({ children, value }: { children: React.ReactNode; value: string }) => (
      <Select.Item
        value={value}
        className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-text text-sm outline-none data-[highlighted]:bg-primary/20 data-[highlighted]:text-primary data-[highlighted]:outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors duration-200"
      >
        <Select.ItemText>{children}</Select.ItemText>
        <Select.ItemIndicator className="absolute right-3 inline-flex items-center justify-center text-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </Select.ItemIndicator>
      </Select.Item>
    );

    return (
      <>
        {activeTab === 'company' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Company Name</label>
                <Input
                  value={settings.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter company name"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Company Email</label>
                <Input
                  type="email"
                  value={settings.companyEmail}
                  onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                  placeholder="Enter company email"
                  className={inputClasses}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClasses}>Company Address</label>
                <textarea
                  className={`${inputClasses} min-h-[80px]`}
                  rows={3}
                  value={settings.companyAddress}
                  onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                  placeholder="Enter company address"
                />
              </div>
              <div>
                <label className={labelClasses}>Phone Number</label>
                <Input
                  value={settings.companyPhone}
                  onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                  placeholder="Enter phone number"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'personal' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Full Name</label>
                <Input
                  value={settings.personalName}
                  onChange={(e) => handleInputChange('personalName', e.target.value)}
                  placeholder="Enter your full name"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Email Address</label>
                <Input
                  type="email"
                  value={settings.personalEmail}
                  onChange={(e) => handleInputChange('personalEmail', e.target.value)}
                  placeholder="Enter your email"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Professional Title</label>
                <Input
                  value={settings.personalTitle}
                  onChange={(e) => handleInputChange('personalTitle', e.target.value)}
                  placeholder="e.g., Senior Textile Engineer"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Location</label>
                <Input
                  value={settings.personalLocation}
                  onChange={(e) => handleInputChange('personalLocation', e.target.value)}
                  placeholder="e.g., New York, USA"
                  className={inputClasses}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClasses}>Bio</label>
                <textarea
                  className={`${inputClasses} min-h-[80px]`}
                  rows={3}
                  value={settings.personalBio}
                  onChange={(e) => handleInputChange('personalBio', e.target.value)}
                  placeholder="Tell us about yourself and your expertise"
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClasses}>Profile Avatar URL</label>
                <Input
                  value={settings.personalAvatar}
                  onChange={(e) => handleInputChange('personalAvatar', e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className={inputClasses}
                />
              </div>
            </div>
            
            <div>
              <label className={labelClasses}>Areas of Expertise</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {EXPERTISE_AREAS.map((expertise) => (
                  <div key={expertise} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={expertise}
                      checked={settings.personalExpertise.includes(expertise)}
                      onChange={(e) => handleExpertiseChange(expertise, e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor={expertise} className="text-sm text-foreground">
                      {expertise}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">User Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Default Currency</label>
                <Select.Root value={settings.defaultCurrency} onValueChange={(value) => handleInputChange('defaultCurrency', value)}>
                  <Select.Trigger className={selectTriggerClasses} aria-label="Default Currency">
                    <Select.Value placeholder="Select Currency" />
                    <Select.Icon className="text-textSecondary">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg bg-surface border border-border shadow-lg z-50">
                      <Select.Viewport className="p-1">
                        <SelectItemContent value="BDT">BDT (Bangladeshi Taka)</SelectItemContent>
                        <SelectItemContent value="USD">USD (US Dollar)</SelectItemContent>
                        <SelectItemContent value="EUR">EUR (Euro)</SelectItemContent>
                        <SelectItemContent value="GBP">GBP (British Pound)</SelectItemContent>
                        <SelectItemContent value="INR">INR (Indian Rupee)</SelectItemContent>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
              <div>
                <label className={labelClasses}>Date Format</label>
                <Select.Root value={settings.dateFormat} onValueChange={(value) => handleInputChange('dateFormat', value)}>
                  <Select.Trigger className={selectTriggerClasses} aria-label="Date Format">
                    <Select.Value placeholder="Select Format" />
                    <Select.Icon className="text-textSecondary">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg bg-surface border border-border shadow-lg z-50">
                      <Select.Viewport className="p-1">
                        <SelectItemContent value="DD/MM/YYYY">DD/MM/YYYY</SelectItemContent>
                        <SelectItemContent value="MM/DD/YYYY">MM/DD/YYYY</SelectItemContent>
                        <SelectItemContent value="YYYY-MM-DD">YYYY-MM-DD</SelectItemContent>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
              <div>
                <label className={labelClasses}>Time Format</label>
                <Select.Root value={settings.timeFormat} onValueChange={(value) => handleInputChange('timeFormat', value)}>
                  <Select.Trigger className={selectTriggerClasses} aria-label="Time Format">
                    <Select.Value placeholder="Select Format" />
                    <Select.Icon className="text-textSecondary">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg bg-surface border border-border shadow-lg z-50">
                      <Select.Viewport className="p-1">
                        <SelectItemContent value="12h">12 Hour</SelectItemContent>
                        <SelectItemContent value="24h">24 Hour</SelectItemContent>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
              <div>
                <label className={labelClasses}>Language</label>
                <Select.Root value={settings.language} onValueChange={(value) => handleInputChange('language', value)}>
                  <Select.Trigger className={selectTriggerClasses} aria-label="Language">
                    <Select.Value placeholder="Select Language" />
                    <Select.Icon className="text-textSecondary">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg bg-surface border border-border shadow-lg z-50">
                      <Select.Viewport className="p-1">
                        <SelectItemContent value="English">English</SelectItemContent>
                        <SelectItemContent value="Bengali">Bengali</SelectItemContent>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Auto Save</label>
                  <p className="text-xs text-muted-foreground">Automatically save your work</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => handleInputChange('autoSave', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Notifications</label>
                  <p className="text-xs text-muted-foreground">Receive system notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleInputChange('notifications', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Appearance Settings</h3>
            <div>
              <label className={labelClasses}>Theme</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['light', 'dark', 'dracula', 'github', 'monokai'].map((theme) => (
                  <div
                    key={theme}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      settings.theme === theme
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleInputChange('theme', theme)}
                  >
                    <div className="text-center">
                      <div className={`w-full h-8 rounded mb-2 ${
                        theme === 'light' ? 'bg-white border border-gray-300' :
                        theme === 'dark' ? 'bg-gray-800' :
                        theme === 'dracula' ? 'bg-purple-900' :
                        theme === 'github' ? 'bg-gray-100 border border-gray-300' :
                        'bg-gray-900'
                      }`}></div>
                      <span className="text-sm font-medium capitalize text-text">{theme}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'printing' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Printing Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Default Paper Size</label>
                <Select.Root value={settings.defaultPaperSize} onValueChange={(value) => handleInputChange('defaultPaperSize', value)}>
                  <Select.Trigger className={selectTriggerClasses} aria-label="Default Paper Size">
                    <Select.Value placeholder="Select Size" />
                    <Select.Icon className="text-textSecondary">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg bg-surface border border-border shadow-lg z-50">
                      <Select.Viewport className="p-1">
                        <SelectItemContent value="A4">A4</SelectItemContent>
                        <SelectItemContent value="A3">A3</SelectItemContent>
                        <SelectItemContent value="Letter">Letter</SelectItemContent>
                        <SelectItemContent value="Legal">Legal</SelectItemContent>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Print Header Logo</label>
                  <p className="text-xs text-muted-foreground">Include company logo in printed reports</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.printHeaderLogo}
                  onChange={(e) => handleInputChange('printHeaderLogo', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Print Company Details</label>
                  <p className="text-xs text-muted-foreground">Include company information in reports</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.printCompanyDetails}
                  onChange={(e) => handleInputChange('printCompanyDetails', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">System Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Backup Frequency</label>
                <Select.Root value={settings.backupFrequency} onValueChange={(value) => handleInputChange('backupFrequency', value)}>
                  <Select.Trigger className={selectTriggerClasses} aria-label="Backup Frequency">
                    <Select.Value placeholder="Select Frequency" />
                    <Select.Icon className="text-textSecondary">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg bg-surface border border-border shadow-lg z-50">
                      <Select.Viewport className="p-1">
                        <SelectItemContent value="daily">Daily</SelectItemContent>
                        <SelectItemContent value="weekly">Weekly</SelectItemContent>
                        <SelectItemContent value="monthly">Monthly</SelectItemContent>
                        <SelectItemContent value="manual">Manual Only</SelectItemContent>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
              <div>
                <label className={labelClasses}>Data Retention</label>
                <Select.Root value={settings.dataRetention} onValueChange={(value) => handleInputChange('dataRetention', value)}>
                  <Select.Trigger className={selectTriggerClasses} aria-label="Data Retention">
                    <Select.Value placeholder="Select Retention" />
                    <Select.Icon className="text-textSecondary">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg bg-surface border border-border shadow-lg z-50">
                      <Select.Viewport className="p-1">
                        <SelectItemContent value="6months">6 Months</SelectItemContent>
                        <SelectItemContent value="1year">1 Year</SelectItemContent>
                        <SelectItemContent value="2years">2 Years</SelectItemContent>
                        <SelectItemContent value="5years">5 Years</SelectItemContent>
                        <SelectItemContent value="forever">Forever</SelectItemContent>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'navigation' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Navigation Menu Customization</h3>
            <p className="text-sm text-muted-foreground">
              Customize which menu items appear in your sidebar navigation.
            </p>
            
            <div className="space-y-4">
              <h4 className="text-md font-medium text-foreground">Available Menu Items</h4>
              <div className="space-y-3">
                {AVAILABLE_MENU_ITEMS.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">{item.icon.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">/{item.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.enabledMenuItems.includes(item.id)}
                        onChange={(e) => handleMenuItemToggle(item.id, e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        disabled={item.id === 'home' || item.id === 'settings'} // Always keep home and settings
                      />
                      <span className="text-sm text-muted-foreground">
                        {settings.enabledMenuItems.includes(item.id) ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Home and Settings cannot be disabled as they are essential for navigation and configuration.
                </p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card text-card-foreground rounded-lg shadow-sm border border-border"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-border">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your application preferences and configuration</p>
              </div>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#1A3636] hover:bg-green-900 text-white flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>

          {/* Notification */}
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mx-6 mt-4 p-4 rounded-md ${
                notification.type === 'success'
                  ? 'bg-green-100 border border-green-400 text-green-700'
                  : 'bg-red-100 border border-red-400 text-red-700'
              }`}
            >
              {notification.message}
            </motion.div>
          )}

          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 border-r border-border p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#1A3636] text-white'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <tab.icon className="h-5 w-5 mr-3" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {renderTabContent()}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const AVAILABLE_MENU_ITEMS = [
  { id: 'home', label: 'Home', icon: 'Home' },
  { id: 'dyeing-calculator', label: 'Dyeing Calculator', icon: 'Beaker' },
  { id: 'proforma-invoice', label: 'Proforma Invoice', icon: 'FileText' },
  { id: 'inventory', label: 'Inventory Management', icon: 'Package' },
  { id: 'order-management', label: 'Order Management', icon: 'ShoppingCart' },
  { id: 'social-portal', label: 'Social Portal', icon: 'Users' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
];
