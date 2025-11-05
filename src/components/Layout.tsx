import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Cart from './Cart';
import WishlistModal from './WishlistModal';
import LoginModal from './LoginModal';
import ProfileModal from './ProfileModal';
import NotificationToast from './NotificationToast';
import BackToTopButton from './BackToTopButton'; // Import the new component
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { state: authState } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (authState.isAuthenticated) {
      setIsProfileModalOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleHeaderSearch = (query: string) => {
    navigate(`/all-products?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        onCartClick={() => setIsCartOpen(true)}
        onWishlistClick={() => setIsWishlistOpen(true)}
        onProfileClick={handleProfileClick}
        onSearchSubmit={handleHeaderSearch} // Pass the search handler
      />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WishlistModal isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <NotificationToast />
      <BackToTopButton /> {/* Add the BackToTopButton here */}
    </div>
  );
}
