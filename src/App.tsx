import React, { useState, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import HomePage from './pages/HomePage';
import AllProductsPage from './pages/AllProductsPage';
import FlashSalePage from './pages/FlashSalePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminPanel from './pages/AdminPanel';
import SustainabilityPage from './pages/SustainabilityPage'; // Import the new page
import Layout from './components/Layout';

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<AllProductsPage />} />
        <Route path="flash-sale" element={<FlashSalePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="sustainability" element={<SustainabilityPage />} /> {/* Add the new route */}
      </Route>
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <WishlistProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </WishlistProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
