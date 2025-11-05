import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Headphones, CheckCircle, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    details: 'arvana.info@gmail.com',
    description: 'Send us an email anytime'
  },
  {
    icon: Phone,
    title: 'Call Us',
    details: '+880 1710237055',
    description: 'Mon-Fri from 9am to 6pm'
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    details: 'Dhaka, Bangladesh',
    description: 'Come visit our flagship store'
  },
  {
    icon: Clock,
    title: 'Business Hours',
    details: 'Mon-Fri: 9am-6pm',
    description: 'Weekend: 10am-4pm'
  }
];

const faqs = [
  {
    question: 'What is your return policy?',
    answer: 'We offer a 30-day return policy for all unworn items with original tags. Returns are free and easy through our online portal.'
  },
  {
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 3-5 business days. Express shipping (1-2 days) and overnight options are also available.'
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Yes! We ship to over 25 countries worldwide. International shipping typically takes 7-14 business days.'
  },
  {
    question: 'How do I track my order?',
    answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track orders in your account dashboard.'
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const { addNotification } = useNotification();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Netlify form submission
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          'form-name': 'contact',
          ...formData
        }).toString()
      });

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Message Sent Successfully!',
          message: 'Thank you for contacting us. We\'ll get back to you within 24 hours.'
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Message Failed to Send',
        message: 'Please try again or contact us directly at hello@arvana.com'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hidden Netlify form for form detection */}
      <form name="contact" netlify="true" hidden>
        <input type="text" name="name" />
        <input type="email" name="email" />
        <input type="text" name="subject" />
        <textarea name="message"></textarea>
      </form>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 md:py-24">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            Get in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              Touch
            </span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 md:mb-4">Get in Touch</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're here to help and answer any questions you might have
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <div 
                  key={index} 
                  className="text-center group cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative bg-white rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-blue-200 overflow-hidden h-60 sm:h-64 flex flex-col justify-between">
                    {/* Animated Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Icon Container */}
                    <div className="relative z-10">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-xl">
                        <IconComponent className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="relative z-10 flex-1 flex flex-col justify-center">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors duration-300">{info.title}</h3>
                      <p className="text-base sm:text-lg font-semibold text-blue-600 mb-1 group-hover:text-blue-700 transition-colors duration-300">{info.details}</p>
                      <p className="text-gray-600 text-sm sm:text-base group-hover:text-gray-700 transition-colors duration-300">{info.description}</p>
                    </div>
                    
                    {/* Hover Effect Elements */}
                    <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-500"></div>
                    <div className="absolute bottom-4 left-4 w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-700"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
            {/* Contact Form */}
            <div className="relative">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
              
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500">
                <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Send us a Message</h2>
                    <p className="text-gray-600 text-sm sm:text-base">We'll get back to you within 24 hours</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} name="contact" method="POST" data-netlify="true" className="space-y-4 sm:space-y-6">
                  <input type="hidden" name="form-name" value="contact" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <div className="relative group">
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField(null)}
                          required
                          className="w-full px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-0 transition-all duration-300 bg-white peer text-sm sm:text-base"
                          placeholder=" "
                          id="name"
                        />
                        <label
                          htmlFor="name"
                          className={`absolute left-4 transition-all duration-200 pointer-events-none peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:font-medium bg-white px-2`}
                        >
                          Full Name *
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <div className="relative group">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          required
                          className="w-full px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-0 transition-all duration-300 bg-white peer text-sm sm:text-base"
                          placeholder=" "
                          id="email"
                        />
                        <label
                          htmlFor="email"
                          className={`absolute left-4 transition-all duration-200 pointer-events-none peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:font-medium bg-white px-2`}
                        >
                          Email Address *
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="relative group">
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('subject')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className={`w-full px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-200 bg-white appearance-none text-sm sm:text-base ${formData.subject ? 'text-gray-900' : 'text-transparent'}`}
                        id="subject"
                      >
                        <option value="" disabled className="text-gray-500">Select a subject</option>
                        <option value="General Inquiry" className="text-gray-900">General Inquiry</option>
                        <option value="Order Support" className="text-gray-900">Order Support</option>
                        <option value="Product Question" className="text-gray-900">Product Question</option>
                        <option value="Returns & Exchanges" className="text-gray-900">Returns & Exchanges</option>
                        <option value="Partnership" className="text-gray-900">Partnership Opportunity</option>
                        <option value="Press & Media" className="text-gray-900">Press & Media</option>
                      </select>
                      <label 
                        htmlFor="subject"
                        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                          focusedField === 'subject' || formData.subject
                            ? '-top-2 text-xs text-blue-600 font-medium bg-white px-2'
                            : 'top-3.5 text-base text-gray-500'
                        }`}
                      >
                        Subject *
                      </label>
                      <div className="absolute right-4 top-3.5 sm:top-4 pointer-events-none">
                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="relative group">
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('message')}
                        onBlur={() => setFocusedField(null)}
                        required
                        rows={6}
                        className="w-full px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-200 resize-none bg-white placeholder-transparent text-sm sm:text-base"
                        placeholder=" "
                        id="message"
                      />
                      <label 
                        htmlFor="message"
                        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                          focusedField === 'message' || formData.message
                            ? '-top-2 text-xs text-blue-600 font-medium bg-white px-2'
                            : 'top-3.5 text-base text-gray-500'
                        }`}
                      >
                        Message *
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden text-base sm:text-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-center gap-2 sm:gap-3">
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                          Send Message
                          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </div>
                  </button>
                </form>
              </div>
            </div>

            {/* FAQ Section */}
            <div>
              <div className="relative">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-teal-500/10 to-blue-500/10 rounded-3xl blur-xl"></div>
                
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/50">
                  <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                    <div className="bg-gradient-to-r from-green-500 to-teal-600 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                      <Headphones className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
                      <p className="text-gray-600 text-sm sm:text-base">Quick answers to common questions</p>
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {faqs.map((faq, index) => (
                      <div
                        key={index} 
                        className="group bg-white/60 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all duration-500 border border-white/50 hover:border-green-200 overflow-hidden"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                          className="w-full p-4 sm:p-6 text-left hover:bg-white/20 transition-colors duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="bg-gradient-to-r from-green-500 to-teal-600 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                              </div>
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-300">{faq.question}</h3>
                            </div>
                            <div className="flex-shrink-0 ml-4">
                              {expandedFaq === index ? (
                                <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-green-600 transition-all duration-300" />
                              ) : (
                                <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-green-600 transition-all duration-300" />
                              )}
                            </div>
                          </div>
                        </button>
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                          expandedFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                          <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-3 sm:p-4 border-l-4 border-green-500">
                              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{faq.answer}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 sm:mt-8 relative overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-blue-100 hover:shadow-lg transition-all duration-300 group">
                    {/* Animated Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">Still have questions?</h3>
                      <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                        Can't find what you're looking for? Our customer support team is here to help.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <a
                          href="mailto:hello@arvana.com"
                          className="group/btn bg-blue-600 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 text-center transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                          <Mail className="h-4 w-4 group-hover/btn:rotate-12 transition-transform duration-300" />
                          Email Support
                        </a>
                        <a
                          href="tel:+15551234567"
                          className="group/btn border border-blue-600 text-blue-600 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-all duration-300 text-center transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                          <Phone className="h-4 w-4 group-hover/btn:rotate-12 transition-transform duration-300" />
                          Call Us
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
