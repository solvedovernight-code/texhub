import React from 'react';
import { Award, Users, Globe, Heart, Star, TrendingUp } from 'lucide-react';

const StoryImageSlider = () => {
  const [currentImage, setCurrentImage] = React.useState(0);
  
  const images = [
    {
      src: 'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/img6.jpg',
      alt: ''
    },
    {
      src: 'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/img9.jpeg',
      alt: ''
    },
    {
      src: 'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/img7.jpg',
      alt: ''
    },
    {
      src: 'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/img4.jpg',
      alt: ''
    }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative mt-8 lg:mt-0">
      {/* Main Image Container */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl aspect-[4/3]">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentImage 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        ))}
        
        {/* Image Navigation Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImage
                  ? 'bg-white scale-125 shadow-lg'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
        
        {/* Image Counter */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
          {currentImage + 1} / {images.length}
        </div>
      </div>
      
      {/* Floating Rating Card */}
      <div className="absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-8 bg-white p-4 sm:p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
        <div className="flex items-center gap-1 sm:gap-2 text-yellow-500 mb-1 sm:mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
          ))}
        </div>
        <p className="text-gray-900 font-semibold text-sm sm:text-base">4.9/5 Customer Rating</p>
        <p className="text-gray-600 text-xs sm:text-sm">Based on 10,000+ reviews</p>
      </div>
      
      {/* Thumbnail Preview */}
      <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 hidden sm:flex">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
              index === currentImage
                ? 'border-blue-500 scale-110 shadow-lg'
                : 'border-white/50 hover:border-white hover:scale-105'
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

const stats = [
  { label: 'Happy Customers', value: '50K+', icon: Users },
  { label: 'Products Sold', value: '200K+', icon: TrendingUp },
  { label: 'Countries Served', value: '25+', icon: Globe },
  { label: 'Years of Excellence', value: '8+', icon: Award }
];

const values = [
  {
    icon: Heart,
    title: 'Passion for Fashion',
    description: 'We believe fashion is a form of self-expression that should be accessible to everyone.'
  },
  {
    icon: Award,
    title: 'Quality First',
    description: 'Every piece is carefully crafted with premium materials and attention to detail.'
  },
  {
    icon: Users,
    title: 'Customer Focused',
    description: 'Our customers are at the heart of everything we do, driving our innovation and service.'
  },
  {
    icon: Globe,
    title: 'Global Impact',
    description: 'We\'re committed to sustainable practices and positive impact on communities worldwide.'
  }
];

const team = [
  {
    name: 'Sarah Johnson',
    role: 'Founder & CEO',
    image: 'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/profile/profile4.png',
    description: 'Visionary leader with 15+ years in fashion industry'
  },
  {
    name: 'Michael Chen',
    role: 'Creative Director',
    image: 'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/profile/profile1.jpg',
    description: 'Award-winning designer passionate about sustainable fashion'
  },
  {
    name: 'Emma Rodriguez',
    role: 'Head of Operations',
    image: 'https://raw.githubusercontent.com/Solved-Overnight/arvana-clothing/refs/heads/main/img/profile/profile2.png',
    description: 'Operations expert ensuring quality and customer satisfaction'
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 md:py-24">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            About{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              ARVANA
            </span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Redefining modern fashion with premium quality, sustainable practices, 
            and timeless designs that empower your personal style.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-r from-pink-400 to-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">Our Impact in Numbers</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              These numbers represent our commitment to excellence and the trust our customers place in us.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center group relative">
                  {/* Card Container */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/50 relative overflow-hidden">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Icon Container */}
                    <div className="relative z-10 mb-4 sm:mb-6">
                      <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                        <IconComponent className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                      </div>
                    </div>
                    
                    {/* Stats Number */}
                    <div className="relative z-10 mb-3 sm:mb-4">
                      <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300">
                        {stat.value}
                      </div>
                      <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    
                    {/* Label */}
                    <div className="relative z-10 text-gray-700 font-semibold text-base sm:text-lg group-hover:text-gray-900 transition-colors duration-300">
                      {stat.label}
                    </div>
                    
                    {/* Floating Elements */}
                    <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-500"></div>
                    <div className="absolute bottom-4 left-4 w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-700"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

     {/* Story Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">Our Story</h2>
              <div className="text-gray-700 space-y-4 md:space-y-6 leading-relaxed text-justify text-sm sm:text-base">
            <p>
              At ARVANA, we envisioned a transformative approach to the textile industry—one that values every individual in the production chain. Our journey began as workers, striving to make a difference in an industry where labor is often undervalued.
            </p>
            <p>
              Driven by the belief that <em className="font-semibold text-indigo-700">everyone deserves a share of the success they create</em>, we established MIB Tex as a company built on fairness, opportunity, and shared prosperity.
            </p>
            <p className="text-base sm:text-lg font-medium text-gray-800">
              Today, ARVANA stands as a testament to the power of collaboration and ethical practices, offering retailers a chance to partner with a manufacturer that prioritizes quality, integrity, and mutual growth.
            </p>
            <p>
              Join us in redefining the textile industry. Partnering with ARVANA means more than sourcing garments—it’s about supporting a vision of ethical production and sustainable success.
            </p>
          </div>
            </div>
            <StoryImageSlider />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">Our Values</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do and shape our commitment to excellence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6">
              Meet Our{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                Dream Team
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              The passionate individuals behind ARVANA's success and innovation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 relative">
            {team.map((member, index) => (
              <div key={index} className="text-center group relative">
                {/* Card Container */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 hover:border-white/40 transition-all duration-500 transform hover:-translate-y-4 hover:scale-105 relative overflow-hidden">
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Profile Image Container */}
                  <div className="relative mb-6 sm:mb-8 z-10">
                    <div className="relative mx-auto w-28 h-28 sm:w-32 sm:h-32">
                      {/* Rotating Border */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-spin group-hover:animate-pulse"></div>
                      <div className="absolute inset-1 rounded-full bg-gray-900"></div>
                      
                      {/* Profile Image */}
                      <img
                        src={member.image}
                        alt={member.name}
                        className="absolute inset-2 w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover group-hover:scale-110 transition-transform duration-500 shadow-2xl"
                      />
                      
                      {/* Floating Elements */}
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-500"></div>
                      <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-700"></div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-500 transition-all duration-300">
                      {member.name}
                    </h3>
                    
                    <div className="mb-3 sm:mb-4">
                      <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                        {member.role}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 leading-relaxed text-sm sm:text-base group-hover:text-white transition-colors duration-300">
                      {member.description}
                    </p>
                    
                    {/* Decorative Line */}
                    <div className="w-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mx-auto mt-4 sm:mt-6 group-hover:w-20 transition-all duration-500"></div>
                  </div>
                  
                  {/* Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                </div>
                
                {/* External Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-10 scale-110"></div>
              </div>
            ))}
          </div>
          
          {/* Team Stats */}
          <div className="mt-12 md:mt-20 text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">15+</div>
                  <div className="text-gray-300 text-sm sm:text-base">Years Combined Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">50+</div>
                  <div className="text-gray-300 text-sm sm:text-base">Awards & Recognition</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">100%</div>
                  <div className="text-gray-300 text-sm sm:text-base">Passion for Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legacy Team Section - Remove this entire block */}
      <section className="py-20 bg-gray-50" style={{ display: 'none' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate individuals behind ARVANA's success and innovation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-48 h-48 rounded-2xl object-cover mx-auto shadow-lg group-hover:shadow-2xl transition-shadow duration-300"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-semibold mb-4">{member.role}</p>
                <p className="text-gray-600 leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">Join the ARVANA Community</h2>
          <p className="text-lg md:text-xl mb-6 md:mb-8 opacity-90">
            Be part of a movement that values quality, sustainability, and authentic style.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-white text-blue-600 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-300 text-base sm:text-lg"
            >
              Shop Collection
            </button>
            <button 
              onClick={() => window.location.href = '/contact'}
              className="border-2 border-white text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300 text-base sm:text-lg"
            >
              Get in Touch
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
