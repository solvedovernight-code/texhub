import React from 'react';
import { Leaf, Recycle, Factory, Handshake, Globe, Lightbulb, Package, Users, ArrowRight, Zap, Cloud, Droplet, Shield, Sprout, Megaphone } from 'lucide-react';
import NumberAnimation from '../components/NumberAnimation';

export default function SustainabilityPage() {
  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 min-h-screen font-sans overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[700px] sm:h-[800px] lg:h-[900px] overflow-hidden flex items-center justify-center text-white hero-clip-path-v2">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center animate-zoom-in"
          style={{ backgroundImage: "url('https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/sustainability/Sustainable.jpg')" }}
        ></div>
        {/* Overlay with gradient and subtle pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 via-green-900/50 to-transparent backdrop-blur-sm opacity-90"></div>
        <div className="absolute inset-0 bg-pattern-green opacity-10"></div> {/* Subtle pattern */}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col justify-center h-full">
          <div className="text-left max-w-2xl animate-fade-in-left-stagger">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg animate-text-reveal-stagger">
              Our Commitment <br /> to a Greener Future
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 max-w-xl mb-10 drop-shadow-md animate-text-reveal-stagger-2">
              Driving sustainable change through innovation and responsible practices.
            </p>
            <a
              href="#our-initiatives"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg text-green-900 bg-green-200 hover:bg-green-300 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 animate-pulse-button animate-fade-in-left-stagger-3"
            >
              Explore Our Initiatives
              <ArrowRight className="ml-3 h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Number Animation Section */}
        <section className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 mb-24 border border-green-100 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-green-800 mb-12">
            Our Impact in Numbers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center p-4 bg-green-50 rounded-xl shadow-md impact-card-hover-effect">
              <Zap className="w-12 h-12 text-green-600 mb-4" />
              <p className="text-4xl font-extrabold text-green-800 mb-2">
                <NumberAnimation target={75} suffix="%" />
              </p>
              <p className="text-lg text-gray-700">Renewable Energy Use</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-blue-50 rounded-xl shadow-md impact-card-hover-effect">
              <Cloud className="w-12 h-12 text-blue-600 mb-4" />
              <p className="text-4xl font-extrabold text-blue-800 mb-2">
                <NumberAnimation target={30} suffix="%" />
              </p>
              <p className="text-lg text-gray-700">Carbon Footprint Reduction</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-teal-50 rounded-xl shadow-md impact-card-hover-effect">
              <Droplet className="w-12 h-12 text-teal-600 mb-4" />
              <p className="text-4xl font-extrabold text-teal-800 mb-2">
                <NumberAnimation target={50} suffix="%" />
              </p>
              <p className="text-lg text-gray-700">Water Recycled</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-purple-50 rounded-xl shadow-md impact-card-hover-effect">
              <Sprout className="w-12 h-12 text-purple-600 mb-4" />
              <p className="text-4xl font-extrabold text-purple-800 mb-2">
                <NumberAnimation target={60} suffix="%" />
              </p>
              <p className="text-lg text-gray-700">Sustainable Materials</p>
            </div>
          </div>
        </section>

        {/* Introduction to Initiatives */}
        <section id="our-initiatives" className="mb-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-green-700 mb-6 animate-fade-in-up">Our Core Sustainability Initiatives</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-16 animate-fade-in-up animate-fade-in-delay">
            We are dedicated to integrating sustainable practices across our entire value chain, focusing on key areas to minimize our environmental footprint and maximize social impact.
          </p>
        </section>

        {/* Renewable Energy */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="animate-fade-in-left">
            <img
              src="https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/sustainability/WareHouse.jpg"
              alt="Renewable Energy"
              className="rounded-3xl shadow-xl border border-green-200 transform hover:scale-[1.02] transition-transform duration-500 image-hover-effect max-h-[300px] w-full object-cover"
            />
          </div>
          <div className="text-gray-700 animate-fade-in-right">
            <div className="flex items-center mb-4">
              <Zap className="w-10 h-10 text-green-600 mr-4" />
              <h3 className="text-3xl font-bold text-green-800">Renewable Energy</h3>
            </div>
            <p className="text-lg leading-relaxed mb-4">
              Powering our operations with clean, renewable sources like solar and wind energy to reduce reliance on fossil fuels and lower carbon emissions.
            </p>
            <ul className="list-disc list-inside space-y-2 text-lg text-gray-600">
              <li>Investing in on-site solar panels.</li>
              <li>Purchasing certified green energy.</li>
              <li>Optimizing energy efficiency in facilities.</li>
            </ul>
          </div>
        </section>

        {/* Carbon Footprint Reduction */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="text-gray-700 order-2 lg:order-1 animate-fade-in-left">
            <div className="flex items-center mb-4">
              <Cloud className="w-10 h-10 text-blue-600 mr-4" />
              <h3 className="text-3xl font-bold text-blue-800">Carbon Footprint Reduction</h3>
            </div>
            <p className="text-lg leading-relaxed mb-4">
              Implementing strategies to significantly decrease greenhouse gas emissions across our supply chain, from production to logistics.
            </p>
            <ul className="list-disc list-inside space-y-2 text-lg text-gray-600">
              <li>Optimizing transportation routes.</li>
              <li>Adopting low-carbon manufacturing processes.</li>
              <li>Promoting remote work and digital solutions.</li>
            </ul>
          </div>
          <div className="order-1 lg:order-2 animate-fade-in-right">
            <img
              src="https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/sustainability/CarbonFootPrint.jpg"
              alt="Carbon Footprint Reduction"
              className="rounded-3xl shadow-xl border border-green-200 transform hover:scale-[1.02] transition-transform duration-500 image-hover-effect max-h-[300px] w-full object-cover"
            />
          </div>
        </section>

        {/* Effluent & Water Treatment */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="animate-fade-in-left">
            <img
              src="https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/sustainability/ETP.png"
              alt="Effluent & Water Treatment"
              className="rounded-3xl shadow-xl border border-green-200 transform hover:scale-[1.02] transition-transform duration-500 image-hover-effect max-h-[300px] w-full object-cover"
            />
          </div>
          <div className="text-gray-700 animate-fade-in-right">
            <div className="flex items-center mb-4">
              <Droplet className="w-10 h-10 text-teal-600 mr-4" />
              <h3 className="text-3xl font-bold text-teal-800">Effluent & Water Treatment</h3>
            </div>
            <p className="text-lg leading-relaxed mb-4">
              Implementing advanced water treatment systems to purify wastewater and minimize water consumption in our manufacturing processes.
            </p>
            <ul className="list-disc list-inside space-y-2 text-lg text-gray-600">
              <li>Closed-loop water recycling systems.</li>
              <li>Strict adherence to discharge standards.</li>
              <li>Reducing fresh water intake.</li>
            </ul>
          </div>
        </section>

        {/* Safe & Green Working Environment */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="text-gray-700 order-2 lg:order-1 animate-fade-in-left">
            <div className="flex items-center mb-4">
              <Shield className="w-10 h-10 text-purple-600 mr-4" />
              <h3 className="text-3xl font-bold text-purple-800">Safe & Green Working Environment</h3>
            </div>
            <p className="text-lg leading-relaxed mb-4">
              Ensuring a healthy, safe, and environmentally conscious workplace for all employees, promoting well-being and sustainable practices.
            </p>
            <ul className="list-disc list-inside space-y-2 text-lg text-gray-600">
              <li>Ergonomic workstations and safety training.</li>
              <li>Green building certifications.</li>
              <li>Waste segregation and recycling programs.</li>
            </ul>
          </div>
          <div className="order-1 lg:order-2 animate-fade-in-right">
            <img
              src="https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/sustainability/SafeWorkSpace.png"
              alt="Safe & Green Working Environment"
              className="rounded-3xl shadow-xl border border-green-200 transform hover:scale-[1.02] transition-transform duration-500 image-hover-effect max-h-[300px] w-full object-cover"
            />
          </div>
        </section>

        {/* Sustainable Fibers (Manmade & Blended) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="animate-fade-in-left">
            <img
              src="https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/sustainability/SustainableProduct.jpg"
              alt="Sustainable Fibers"
              className="rounded-3xl shadow-xl border border-green-200 transform hover:scale-[1.02] transition-transform duration-500 image-hover-effect max-h-[300px] w-full object-cover"
            />
          </div>
          <div className="text-gray-700 animate-fade-in-right">
            <div className="flex items-center mb-4">
              <Sprout className="w-10 h-10 text-yellow-600 mr-4" />
              <h3 className="text-3xl font-bold text-yellow-800">Sustainable Fibers</h3>
            </div>
            <p className="text-lg leading-relaxed mb-4">
              Increasing the use of recycled, manmade, and blended fibers to reduce water consumption and environmental impact compared to traditional materials.
            </p>
            <ul className="list-disc list-inside space-y-2 text-lg text-gray-600">
              <li>Utilizing recycled polyester and nylon.</li>
              <li>Innovating with bio-based and blended materials.</li>
              <li>Reducing reliance on water-intensive crops.</li>
            </ul>
          </div>
        </section>

        {/* B2B Partnership Call to Action */}
        <section className="text-center bg-white py-16 px-8 rounded-3xl shadow-2xl border border-green-100 animate-fade-in-up mb-12 cta-section-effect">
          <h2 className="text-3xl sm:text-4xl font-bold text-green-800 mb-6">Partner with ARVANA for a Greener Business</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
            Are you a business looking to integrate sustainable practices into your supply chain? ARVANA offers eco-conscious products and ethical partnerships that align with your values. Let's build a sustainable future together.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-green-600 hover:bg-green-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 animate-pulse-button"
          >
            Contact Our B2B Team
            <Leaf className="ml-3 h-5 w-5" />
          </a>
        </section>
      </div>
    </div>
  );
}
