import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LandingPage } from './pages/LandingPage';
import { DyeingCalculator } from './pages/DyeingCalculator';
import { ProformaInvoice } from './pages/ProformaInvoice';
import { Settings } from './pages/Settings';
import { SocialPortal } from './pages/SocialPortal'; // Changed to named import
import { AuthPage } from './pages/AuthPage';
import { InventoryManagement } from './pages/InventoryManagement';
import { OrderManagement } from './pages/OrderManagement';
import { Sidebar } from './components/Sidebar';
import { auth } from './lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ToastProvider } from './components/ui/ToastProvider';
import { UserSettings, defaultSettings } from './types/settings'; // Import UserSettings and defaultSettings

function App() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [appSettings, setAppSettings] = useState<UserSettings>(defaultSettings); // State for global settings
  const location = useLocation();

  useEffect(() => {
    // Load settings from localStorage on initial mount
    const savedSettings = localStorage.getItem('userSettings');
    const initialSettings = savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
    setAppSettings(initialSettings);
    document.body.className = `theme-${initialSettings.theme}`;
    
    // This listener is for changes from *other* tabs/windows, not within the same app instance.
    // For changes within the same app instance, we'll use state lifting.
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'userSettings' && event.newValue) {
        const updatedSettings = JSON.parse(event.newValue);
        setAppSettings(prev => ({ ...prev, ...updatedSettings }));
        document.body.className = `theme-${updatedSettings.theme}`;
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  // Callback to update appSettings when settings are saved in the Settings page
  const handleSettingsUpdate = (newSettings: UserSettings) => {
    setAppSettings(newSettings);
    document.body.className = `theme-${newSettings.theme}`; // Apply theme immediately
  };

  // Render Sidebar only if appSettings is loaded
  const renderSidebar = user && appSettings ? (
    <Sidebar
      isCollapsed={isCollapsed}
      onCollapse={handleSidebarCollapse}
      enabledMenuItems={appSettings.enabledMenuItems}
      menuOrder={appSettings.menuOrder}
    />
  ) : null;

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <AnimatePresence mode="wait">
          {loading && (
            <LoadingSpinner key="loading-spinner" />
          )}
          {!loading && (
            <>
              {renderSidebar} {/* Render sidebar conditionally */}
              <div className={`flex-1 transition-all duration-300 ${user ? (isCollapsed ? 'ml-16' : 'ml-64') : 'ml-0'}`}>
                <Routes location={location} key={location.pathname}>
                  {user ? (
                    <>
                      <Route path="/" element={<motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      ><LandingPage /></motion.div>} />
                      <Route path="/dyeing-calculator" element={<motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      ><DyeingCalculator user={user} /></motion.div>} />
                      <Route path="/proforma-invoice" element={<motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      ><ProformaInvoice user={user} /></motion.div>} />
                      <Route path="/inventory" element={<motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      ><InventoryManagement user={user} /></motion.div>} />
                      <Route path="/order-management" element={<motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      ><OrderManagement user={user} /></motion.div>} />
                      <Route path="/settings" element={<motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      ><Settings onSettingsUpdate={handleSettingsUpdate} /></motion.div>} /> {/* Pass callback */}
                      <Route path="/social-portal" element={<motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      ><SocialPortal user={user} /></motion.div>} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </>
                  ) : (
                    <>
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="*" element={<Navigate to="/auth" replace />} />
                    </>
                  )}
                </Routes>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </ToastProvider>
  );
}

export default App;
