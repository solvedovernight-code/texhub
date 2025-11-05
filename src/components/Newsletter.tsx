import React, { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { addNotification } = useNotification();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Simulate subscription
    setTimeout(() => {
      setIsSubscribed(true);
      addNotification({
        type: 'success',
        title: 'Successfully Subscribed!',
        message: 'Welcome to LUXE! You\'ll receive our latest updates and exclusive offers.'
      });
      setEmail('');
    }, 500);
  };

  return (
    <section className="py-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <Mail className="h-12 w-12 text-white mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stay in <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 font-bold">Style</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about new arrivals, exclusive offers, and style tips
          </p>
        </div>

        {!isSubscribed ? (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-6 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
                required
              />
              <button
                type="submit"
                className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 whitespace-nowrap"
              >
                Subscribe
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </form>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center text-green-400 mb-4">
              <CheckCircle className="h-8 w-8 mr-2" />
              <span className="text-xl font-semibold">Thank you for subscribing!</span>
            </div>
            <p className="text-gray-300">
              Check your inbox for a welcome message and exclusive ARVANA offers.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
