import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom'; // Alias Link to avoid conflict with motion.Link
import { Beaker, FileText, Home, LogOut, ChevronLeft, ChevronRight, Settings, Book, Printer, Users, Facebook, Twitter, Instagram, Linkedin, Package, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../lib/firebaseConfig';
import { signOut } from 'firebase/auth';

interface SidebarProps {
  isCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  enabledMenuItems: string[]; // Now directly using this prop
  menuOrder: string[]; // Now directly using this prop
}

// Create motion-enabled versions of Link and Button
const MotionLink = motion(RouterLink);
const MotionButton = motion(Button);

export function Sidebar({ isCollapsed, onCollapse, enabledMenuItems, menuOrder }: SidebarProps) {
  const location = useLocation();
  // Removed local state for enabledMenuItems and the useEffect that loaded it from localStorage.
  // The component will now directly use the `enabledMenuItems` prop.

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out successfully!');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const allNavItems = [
    { name: 'Home', icon: Home, path: '/', id: 'home' }, // Added id for consistency
    { name: 'Dyeing Calculator', icon: Beaker, path: '/dyeing-calculator', id: 'dyeing-calculator' },
    { name: 'Proforma Invoice', icon: FileText, path: '/proforma-invoice', id: 'proforma-invoice' },
    { name: 'Inventory Management', icon: Package, path: '/inventory', id: 'inventory' },
    { name: 'Order Management', icon: ShoppingCart, path: '/order-management', id: 'order-management' },
    { name: 'Social Portal', icon: Users, path: '/social-portal', id: 'social-portal' },
    { name: 'Settings', icon: Settings, path: '/settings', id: 'settings' },
  ];

  // Filter nav items based on enabled menu items passed as prop
  const navItems = allNavItems.filter(item => enabledMenuItems.includes(item.id));
  
  // Optionally, sort navItems based on menuOrder if needed
  // const sortedNavItems = menuOrder
  //   .map(id => navItems.find(item => item.id === id))
  //   .filter(Boolean); // Filter out undefined if an ID in menuOrder doesn't exist in navItems

  // Variants for navigation item text
  const navTextVariants = {
    collapsed: { opacity: 0, x: -20, transition: { duration: 0.1, ease: "easeOut" } }, // Faster exit
    expanded: { opacity: 1, x: 0, transition: { duration: 0.25, delay: 0.05, ease: "easeOut" } },
  };

  // Variants for social media icons
  const socialIconVariants = {
    collapsed: { opacity: 0, scale: 0.8, transition: { duration: 0.1, ease: "easeOut" } }, // Faster exit
    expanded: { opacity: 1, scale: 1, transition: { duration: 0.25, delay: 0.05, ease: "easeOut" } },
  };

  // Variants for the logout button text
  const logoutTextVariants = {
    collapsed: { opacity: 0, x: -20, transition: { duration: 0.1, ease: "easeOut" } }, // Faster exit
    expanded: { opacity: 1, x: 0, transition: { duration: 0.25, delay: 0.05, ease: "easeOut" } },
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-[#1A3636] text-white flex flex-col transition-all duration-300 z-50
        ${isCollapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Top Section - Logo/Title */}
      <div className="flex items-center justify-center h-20 border-b border-white/10 overflow-hidden">
        <AnimatePresence mode="wait">
          {isCollapsed ? (
            <motion.span
              key="collapsed-logo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="text-2xl font-bold text-white"
            >
              T<span className="text-[#FF9900]">H</span>
            </motion.span>
          ) : (
            <motion.span
              key="expanded-logo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="text-2xl font-bold text-white"
            >
              Textile<span className="bg-[#FF9900] text-white px-2 py-1 rounded-md ml-1">Hub</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Items - now flex-1 and scrollable */}
      <nav className="flex-1 px-2 py-4 space-y-2"> {/* Removed overflow-y-auto */}
        {navItems.map((item) => (
          <MotionLink // Use MotionLink here
            key={item.name}
            to={item.path}
            className={`flex items-center rounded-md p-2 text-sm font-medium transition-colors
              ${location.pathname === item.path ? 'bg-[#FF9900] text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
            layout // Add layout prop
          >
            <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  key={item.name + "-text"}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  variants={navTextVariants}
                >
                  {item.name}
                </motion.span>
              )}
            </AnimatePresence>
          </MotionLink>
        ))}
      </nav>

      {/* Bottom Section - Social Media, Logout (moved outside the flex-1 nav) */}
      <div className="px-2 py-4">
        {/* Horizontal line above social media icons */}
        <div className="border-t border-white/10 my-4"></div>

        {/* Social Media Icons */}
        <div className={`flex ${isCollapsed ? 'flex-col space-y-4' : 'flex-row justify-around'} items-center mb-4`}>
          <motion.a
            href="https://facebook.com/textilehub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-[#FF9900] transition-colors"
            initial="collapsed"
            animate="expanded"
            variants={socialIconVariants}
            layout // Add layout prop
          >
            <Facebook size={20} />
          </motion.a>
          <motion.a
            href="https://twitter.com/textilehub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-[#FF9900] transition-colors"
            initial="collapsed"
            animate="expanded"
            variants={socialIconVariants}
            layout // Add layout prop
          >
            <Twitter size={20} />
          </motion.a>
          <motion.a
            href="https://instagram.com/textilehub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-[#FF9900] transition-colors"
            initial="collapsed"
            animate="expanded"
            variants={socialIconVariants}
            layout // Add layout prop
          >
            <Instagram size={20} />
          </motion.a>
          <motion.a
            href="https://linkedin.com/company/textilehub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-[#FF9900] transition-colors"
            initial="collapsed"
            animate="expanded"
            variants={socialIconVariants}
            layout // Add layout prop
          >
            <Linkedin size={20} />
          </motion.a>
        </div>

        {/* Horizontal line above logout button */}
        <div className="border-t border-white/10 my-[8px]"></div>

        <MotionButton // Use MotionButton here
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:bg-white/10 hover:text-white mb-0"
          onClick={handleLogout}
          layout // Add layout prop
        >
          <LogOut className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                key="logout-text"
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                variants={logoutTextVariants}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </MotionButton>
      </div>

      {/* Collapse trigger */}
      <div className="absolute -right-[13.8px] top-1/2 transform -translate-y-1/2">
        <motion.button
          onClick={() => onCollapse(!isCollapsed)}
          className="z-50 p-1.5 rounded-full bg-gray-700 text-white hover:bg-[#FF9900] focus:outline-none transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </motion.button>
      </div>
    </div>
  );
}
