import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Beaker, FileText, Home, LogOut, ChevronLeft, ChevronRight, Settings, Book, BookOpen, Printer, Users, Facebook, Twitter, Instagram, Linkedin, Package, ShoppingCart, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../lib/firebaseConfig';
import { signOut } from 'firebase/auth';

interface SidebarProps {
  isCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  enabledMenuItems: string[];
  menuOrder: string[];
}

export function Sidebar({ isCollapsed, onCollapse, enabledMenuItems, menuOrder }: SidebarProps) {
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out successfully!');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const allNavItems = [
    { name: 'Home', icon: Home, path: '/', id: 'home' },
    { name: 'Dyeing Calculator', icon: Beaker, path: '/dyeing-calculator', id: 'dyeing-calculator' },
    { name: 'Proforma Invoice', icon: FileText, path: '/proforma-invoice', id: 'proforma-invoice' },
    { name: 'Inventory Management', icon: Package, path: '/inventory', id: 'inventory' },
    { name: 'Order Management', icon: ShoppingCart, path: '/order-management', id: 'order-management' },
    { name: 'Production Data', icon: BarChart3, path: '/production-data', id: 'production-data' },
    { name: 'Book Library', icon: BookOpen, path: '/book-library', id: 'book-library' },
    { name: 'Social Portal', icon: Users, path: '/social-portal', id: 'social-portal' },
    { name: 'Settings', icon: Settings, path: '/settings', id: 'settings' },
  ];

  const navItems = allNavItems.filter(item => enabledMenuItems.includes(item.id));

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-[#1A3636] text-white flex flex-col transition-all duration-300 z-50
        ${isCollapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Top Section - Logo/Title */}
      <div className="flex items-center justify-center h-20 border-b border-white/10 overflow-hidden flex-shrink-0">
        <AnimatePresence mode="wait">
          {isCollapsed ? (
            <motion.span
              key="collapsed-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="text-2xl font-bold text-white"
            >
              T<span className="text-[#FF9900]">H</span>
            </motion.span>
          ) : (
            <motion.span
              key="expanded-logo"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="text-2xl font-bold text-white whitespace-nowrap"
            >
              Textile<span className="bg-[#FF9900] text-white px-2 py-1 rounded-md ml-1">Hub</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Items - Scrollable Area */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 space-y-2 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <RouterLink
              key={item.name}
              to={item.path}
              className={`flex items-center rounded-md p-2 text-sm font-medium transition-all duration-200
                ${isActive ? 'bg-[#FF9900] text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}
                ${isCollapsed ? 'justify-center' : ''}`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" style={{ minWidth: '20px', minHeight: '20px' }} />
              {!isCollapsed && (
                <span
                  className="ml-3 whitespace-nowrap overflow-hidden"
                  style={{
                    opacity: isCollapsed ? 0 : 1,
                    width: isCollapsed ? 0 : 'auto',
                    transition: 'opacity 0.2s ease-in-out, width 0.3s ease-in-out'
                  }}
                >
                  {item.name}
                </span>
              )}
            </RouterLink>
          );
        })}
      </nav>

      {/* Bottom Section - Fixed at bottom */}
      <div className="px-2 py-4 flex-shrink-0 border-t border-white/10">
        {/* Social Media Icons */}
        <div className={`flex ${isCollapsed ? 'flex-col space-y-3 items-center' : 'flex-row justify-around items-center'} mb-4 transition-all duration-300`}>
          <a
            href="https://facebook.com/textilehub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-[#FF9900] transition-colors flex-shrink-0"
            style={{ minWidth: '20px', minHeight: '20px' }}
          >
            <Facebook size={20} className="flex-shrink-0" />
          </a>
          <a
            href="https://twitter.com/textilehub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-[#FF9900] transition-colors flex-shrink-0"
            style={{ minWidth: '20px', minHeight: '20px' }}
          >
            <Twitter size={20} className="flex-shrink-0" />
          </a>
          <a
            href="https://instagram.com/textilehub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-[#FF9900] transition-colors flex-shrink-0"
            style={{ minWidth: '20px', minHeight: '20px' }}
          >
            <Instagram size={20} className="flex-shrink-0" />
          </a>
          <a
            href="https://linkedin.com/company/textilehub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-[#FF9900] transition-colors flex-shrink-0"
            style={{ minWidth: '20px', minHeight: '20px' }}
          >
            <Linkedin size={20} className="flex-shrink-0" />
          </a>
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          className={`w-full text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 ${isCollapsed ? 'justify-center px-2' : 'justify-start'}`}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" style={{ minWidth: '20px', minHeight: '20px' }} />
          {!isCollapsed && (
            <span
              className="ml-3 whitespace-nowrap overflow-hidden"
              style={{
                opacity: isCollapsed ? 0 : 1,
                width: isCollapsed ? 0 : 'auto',
                transition: 'opacity 0.2s ease-in-out, width 0.3s ease-in-out'
              }}
            >
              Logout
            </span>
          )}
        </Button>
      </div>

      {/* Collapse Toggle Button */}
      <div className="absolute -right-[13.8px] top-1/2 transform -translate-y-1/2">
        <motion.button
          onClick={() => onCollapse(!isCollapsed)}
          className="z-50 p-1.5 rounded-full bg-gray-700 text-white hover:bg-[#FF9900] focus:outline-none transition-colors shadow-lg"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </motion.button>
      </div>
    </div>
  );
}
