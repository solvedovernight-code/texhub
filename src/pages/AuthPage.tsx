import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { auth } from '../lib/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { Eye, EyeOff, LifeBuoy, Chrome, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const images = [
    'https://images.unsplash.com/photo-1718049942873-58bd663206dc?q=80&w=1167&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1974&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524292332709-b33366a7f165?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1655122878062-a9e885391a1b?q=80&w=1776&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=1974&auto=format&fit=crop',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotification('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('User logged in successfully!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log('User signed up successfully!');
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address to reset your password.');
      return;
    }
    setError('');
    setNotification('');
    try {
      await sendPasswordResetEmail(auth, email);
      setNotification('Password reset email sent. Please check your inbox.');
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel (Form) */}
      <div className="w-full lg:w-[480px] bg-white p-6 lg:p-10 flex flex-col justify-center items-center relative min-h-screen lg:min-h-auto">
        <div className="absolute top-4 left-4 lg:top-10 lg:left-10">
          <span className="text-3xl font-bold text-gray-900">
            Textile
            <span className="bg-[#FF9900] text-white px-2 py-1 rounded-md ml-1">Hub</span>
          </span>
        </div>

        <div className="w-full max-w-sm mx-auto mt-16 lg:mt-0">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Sign in' : 'Sign up'}
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <Button variant="link" onClick={() => setIsLogin(false)} className="p-0 h-auto text-green-600 hover:text-green-800 font-semibold">
                  Create now
                </Button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Button variant="link" onClick={() => setIsLogin(true)} className="p-0 h-auto text-green-600 hover:text-green-800 font-semibold">
                  Login
                </Button>
              </>
            )}
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {notification && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{notification}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                  <label htmlFor="remember-me" className="ml-2 block text-gray-900">
                    Remember me
                  </label>
                </div>
                <Button variant="link" type="button" onClick={handlePasswordReset} className="text-green-600 hover:text-green-800 p-0 h-auto">
                  Forgot Password?
                </Button>
              </div>
            )}

            <motion.button
              type="submit"
              className="w-full bg-[#1A3636] hover:bg-green-900 text-white py-2.5 rounded-md text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLogin ? 'Sign in' : 'Sign up'}
            </motion.button>
          </form>

          <div className="relative flex justify-center text-xs uppercase my-6">
            <span className="bg-white px-2 text-gray-500 z-10">Or</span>
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gray-200" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              className="w-full flex items-center justify-center gap-2 bg-[#FFA500] hover:bg-orange-600 text-white py-2.5 rounded-md font-semibold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Chrome size={20} className="text-white" />
              Google
            </motion.button>
            <motion.button
              className="w-full flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white py-2.5 rounded-md font-semibold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Facebook size={20} />
              Facebook
            </motion.button>
          </div>
        </div>
      </div>

      {/* Right Panel (Promotional) */}
      <div className="flex-1 bg-[#1A3636] text-white p-10 flex flex-col justify-center items-center relative overflow-hidden lg:min-h-screen">
        <div className="absolute top-10 right-10 text-gray-300">
          <span className="flex items-center gap-1">
            <LifeBuoy size={18} />
            Support
          </span>
        </div>

        <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
          <div className="w-full aspect-video bg-black/20 rounded-lg overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlide}
                src={images[currentSlide]}
                initial={{ opacity: 0, scale: 0.9, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -50 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="w-full h-full object-cover"
                alt="Promotional Card"
                onError={(e) => console.error("Image failed to load:", e.currentTarget.src)}
              />
            </AnimatePresence>
          </div>

          <div className="flex justify-center space-x-3 mt-4">
            {images.map((_, index) => (
              <motion.button
                key={index}
                className={`block w-2.5 h-2.5 rounded-full ${
                  currentSlide === index ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => handleDotClick(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 w-full max-w-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 text-center"
          >
            <h3 className="text-3xl font-bold mb-4 text-white">Introducing new features</h3>
            <p className="text-gray-200">
              Analyzing previous trends ensures that businesses always make the right decision. And as the industry evolves, our new features help you stay ahead of the competition.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
