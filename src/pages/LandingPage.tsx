import React from 'react';
import { Link } from 'react-router-dom';
import { Beaker, FileText, History, Book, Settings, Lightbulb, Printer, TrendingUp, HelpCircle, Heart, MessageCircle, Package, ShoppingCart, BarChart3, Users, ArrowRight, Sparkles, Zap, Shield, CheckCircle2, ChevronLeft, ChevronRight, Activity, Clock, Award, Target, Search, X, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComprehensiveDashboard } from '../components/ComprehensiveDashboard';
import { auth } from '../lib/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getActivityHistory, getTimeAgo, ActivityItem } from '../utils/activityTracker';

const ActionCard = ({ icon: Icon, title, description, path, color, gradient }: { icon: React.ElementType, title: string, description: string, path: string, color: string, gradient: string }) => {
  const getTextColorClass = (gradient: string) => {
    if (gradient.includes('blue')) return 'text-blue-600';
    if (gradient.includes('orange')) return 'text-orange-600';
    if (gradient.includes('green')) return 'text-green-600';
    if (gradient.includes('teal')) return 'text-teal-600';
    if (gradient.includes('cyan')) return 'text-cyan-600';
    if (gradient.includes('purple')) return 'text-purple-600';
    if (gradient.includes('red')) return 'text-red-600';
    if (gradient.includes('pink')) return 'text-pink-600';
    if (gradient.includes('emerald')) return 'text-emerald-600';
    return 'text-blue-600';
  };

  return (
    <Link to={path}>
      <motion.div
        className="relative bg-card text-card-foreground p-6 rounded-2xl border border-border h-full flex flex-col group overflow-hidden"
        whileHover={{ y: -8 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${gradient}`}></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <motion.div
              className={`p-3.5 rounded-xl ${gradient} shadow-lg`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <Icon className="h-6 w-6 text-white" />
            </motion.div>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              className="p-2 rounded-full bg-foreground/5"
            >
              <ArrowRight className="h-4 w-4 text-foreground" />
            </motion.div>
          </div>

          <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-foreground/90 transition-colors">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>

          <div className={`mt-4 flex items-center text-sm font-semibold ${getTextColorClass(gradient)}`}>
            <span className="group-hover:translate-x-1 transition-transform duration-300">Explore</span>
            <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const iconMap: Record<string, React.ElementType> = {
  Home,
  Beaker,
  FileText,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Users,
  History,
  Book
};

const RecentActivityItem = ({ icon: iconName, title, description, time, gradient }: { icon: string, title: string, description: string, time: string, gradient: string }) => {
  const Icon = iconMap[iconName] || Activity;

  return (
    <motion.div
      className="relative flex items-start space-x-4 p-4 bg-card text-card-foreground rounded-xl border border-border group hover:border-border/60 transition-all duration-300 overflow-hidden"
      whileHover={{ x: 4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${gradient}`}></div>
      <div className={`relative z-10 p-3 rounded-xl ${gradient} shadow-sm`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="relative z-10 flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{title}</p>
        <p className="text-sm text-muted-foreground mt-0.5 truncate">{description}</p>
      </div>
      <span className="relative z-10 text-xs text-muted-foreground whitespace-nowrap">{time}</span>
    </motion.div>
  );
};

const StatCard = ({ icon: Icon, label, value, trend, gradient }: { icon: React.ElementType, label: string, value: string, trend: string, gradient: string }) => (
  <motion.div
    className="relative overflow-hidden bg-card p-6 rounded-2xl border border-border group"
    whileHover={{ y: -6, scale: 1.02 }}
    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
  >
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${gradient}`}></div>
    <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-full group-hover:scale-150 transition-transform duration-700"></div>

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
        <motion.div
          className={`p-2.5 rounded-xl ${gradient} shadow-md`}
          whileHover={{ rotate: 12, scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          <Icon className="h-5 w-5 text-white" />
        </motion.div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-black text-foreground">{value}</p>
        <div className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-full">
          <TrendingUp className="h-3 w-3" />
          {trend}
        </div>
      </div>
    </div>
  </motion.div>
);

const FeatureBadge = ({ icon: Icon, text }: { icon: React.ElementType, text: string }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    whileHover={{ scale: 1.05, y: -2 }}
    className="flex items-center gap-2 bg-white/15 backdrop-blur-xl px-4 py-2.5 rounded-full border border-white/20 shadow-2xl"
  >
    <Icon className="h-4 w-4 text-white" />
    <span className="text-white text-sm font-semibold">{text}</span>
  </motion.div>
);

export function LandingPage() {
  const [user, setUser] = React.useState<User | null>(null);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [recentActivities, setRecentActivities] = React.useState<ActivityItem[]>([]);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const updateActivities = () => {
      const activities = getActivityHistory();
      setRecentActivities(activities.slice(0, 4));
    };

    updateActivities();

    window.addEventListener('activityUpdate', updateActivities);
    return () => window.removeEventListener('activityUpdate', updateActivities);
  }, []);

  const heroSlides = [
    {
      title: "Transform Your Textile Operations",
      subtitle: "Advanced dyeing calculations, inventory tracking, and production management in one powerful platform",
      image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=1600&q=90"
    },
    {
      title: "Precision Chemical Management",
      subtitle: "Calculate exact quantities, reduce waste by up to 40%, and optimize your processes with AI-powered insights",
      image: "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=1600&q=90"
    },
    {
      title: "Complete Production Visibility",
      subtitle: "Real-time tracking, smart analytics, and comprehensive reporting to drive operational excellence",
      image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1600&q=90"
    }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
    }
  };

  const features = [
    { icon: Sparkles, text: "AI-Powered Calculations" },
    { icon: Shield, text: "Enterprise Security" },
    { icon: Zap, text: "Lightning Fast Performance" },
    { icon: CheckCircle2, text: "99.9% Uptime Guaranteed" }
  ];


  const quickActions = [
    { icon: Beaker, title: "Dyeing Calculator", description: "Calculate precise chemical quantities with AI-powered recommendations for optimal results.", path: "/dyeing-calculator", color: "primary", gradient: "bg-gradient-to-br from-blue-500 to-blue-600" },
    { icon: FileText, title: "Proforma Invoice", description: "Generate professional invoices with automated calculations and customizable templates.", path: "/proforma-invoice", color: "secondary", gradient: "bg-gradient-to-br from-orange-500 to-orange-600" },
    { icon: Book, title: "Recipe Library", description: "Access your complete dyeing recipe database with advanced search and filtering.", path: "/manage-recipes", color: "accent", gradient: "bg-gradient-to-br from-green-500 to-green-600" },
    { icon: Package, title: "Smart Inventory", description: "Real-time inventory tracking with automatic reorder alerts and waste analysis.", path: "/inventory", color: "primary", gradient: "bg-gradient-to-br from-teal-500 to-teal-600" },
    { icon: ShoppingCart, title: "Order Pipeline", description: "Manage orders from receipt to delivery with integrated production workflows.", path: "/order-management", color: "secondary", gradient: "bg-gradient-to-br from-blue-500 to-cyan-600" },
    { icon: BarChart3, title: "Production Hub", description: "Record and analyze production data across all departments with detailed insights.", path: "/production-data", color: "accent", gradient: "bg-gradient-to-br from-purple-500 to-purple-600" },
    { icon: Printer, title: "Report Generator", description: "Create comprehensive reports on production, costs, and chemical usage instantly.", path: "/generate-reports", color: "primary", gradient: "bg-gradient-to-br from-red-500 to-red-600" },
    { icon: History, title: "Process History", description: "Analyze historical data to optimize processes and improve quality standards.", path: "/history", color: "secondary", gradient: "bg-gradient-to-br from-purple-500 to-pink-600" },
    { icon: Settings, title: "System Settings", description: "Configure application preferences, units, and customize your workspace.", path: "/settings", color: "accent", gradient: "bg-gradient-to-br from-green-500 to-emerald-600" },
    { icon: Users, title: "Community Hub", description: "Connect with textile professionals and share industry knowledge worldwide.", path: "/social-portal", color: "primary", gradient: "bg-gradient-to-br from-teal-500 to-cyan-600" }
  ];

  const filteredActions = quickActions.filter(action =>
    action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    action.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-background min-h-screen">
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>

        {/* Hero Section with Premium Gradient and Animations */}
        <motion.div variants={itemVariants} className="relative rounded-3xl overflow-hidden mb-8 border border-border shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="relative h-[500px]"
            >
              <div className="absolute inset-0">
                <img
                  src={heroSlides[currentSlide].image}
                  alt="Textile Manufacturing"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/95 via-blue-600/90 to-teal-600/95"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-cyan-400/20"></div>
              </div>

              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-8">
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  className="max-w-5xl mx-auto"
                >
                  <motion.div
                    className="inline-block mb-6"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                      <Award className="h-4 w-4 text-yellow-300" />
                      <span className="text-white text-sm font-semibold">Industry Leading Platform</span>
                    </div>
                  </motion.div>

                  <h1 className="text-4xl md:text-7xl font-black text-white mb-6 leading-[1.1] drop-shadow-2xl">
                    {heroSlides[currentSlide].title}
                  </h1>

                  <p className="text-lg md:text-xl text-white/95 mb-8 max-w-3xl mx-auto font-medium drop-shadow-lg leading-relaxed">
                    {heroSlides[currentSlide].subtitle}
                  </p>

                  <motion.div
                    className="flex flex-wrap gap-4 justify-center"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1, delayChildren: 0.6 }
                      }
                    }}
                  >
                    {features.map((feature, index) => (
                      <FeatureBadge key={index} icon={feature.icon} text={feature.text} />
                    ))}
                  </motion.div>
                </motion.div>
              </div>

              {/* Floating animated shapes */}
              <motion.div
                className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
                animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute bottom-20 right-10 w-32 h-32 bg-cyan-300/10 rounded-full blur-xl"
                animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Premium Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white p-4 rounded-2xl transition-all duration-300 border border-white/20 shadow-2xl hover:scale-110"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white p-4 rounded-2xl transition-all duration-300 border border-white/20 shadow-2xl hover:scale-110"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Premium Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`rounded-full transition-all duration-500 shadow-lg ${
                  index === currentSlide
                    ? 'bg-white w-12 h-3'
                    : 'bg-white/40 w-3 h-3 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Premium Stats Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard icon={Beaker} label="Active Recipes" value="156" trend="+12%" gradient="bg-gradient-to-br from-blue-500 to-blue-600" />
          <StatCard icon={Package} label="Inventory Items" value="342" trend="+8%" gradient="bg-gradient-to-br from-green-500 to-green-600" />
          <StatCard icon={ShoppingCart} label="Orders This Month" value="89" trend="+23%" gradient="bg-gradient-to-br from-orange-500 to-orange-600" />
          <StatCard icon={Activity} label="Production Rate" value="94%" trend="+5%" gradient="bg-gradient-to-br from-purple-500 to-purple-600" />
        </motion.div>

        {/* Dashboard Overview with Premium Styling */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black text-foreground">Business Overview</h2>
              <p className="text-muted-foreground mt-1">Real-time insights into your operations</p>
            </div>
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-xl border border-border">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Live Data</span>
            </div>
          </div>
          <ComprehensiveDashboard user={user} />
        </motion.div>

        {/* Performance Metrics Graphs */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black text-foreground">Performance Metrics</h2>
              <p className="text-muted-foreground mt-1">Visual analytics across key indicators</p>
            </div>
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-xl border border-border">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Analytics</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Production Efficiency */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-card p-6 rounded-2xl border border-border hover:border-blue-500/30 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-muted-foreground">Production Efficiency</h3>
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="h-32 flex items-end justify-around gap-2 mb-3">
                  {[75, 82, 68, 91, 85, 78, 94].map((value, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${value}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md min-w-[6px] hover:from-blue-600 hover:to-blue-500 transition-colors cursor-pointer"
                      title={`${value}%`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Last 7 days</span>
                  <span className="font-bold text-green-600">+8%</span>
                </div>
              </div>
            </motion.div>

            {/* Order Completion Rate */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-card p-6 rounded-2xl border border-border hover:border-green-500/30 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-muted-foreground">Order Completion</h3>
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="relative h-32 flex items-center justify-center">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted/20" />
                    <motion.circle
                      cx="56" cy="56" r="48"
                      stroke="url(#greenGradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 301.6" }}
                      animate={{ strokeDasharray: "271.4 301.6" }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black text-foreground">90%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                  <span>This month</span>
                  <span className="font-bold text-green-600">+5%</span>
                </div>
              </div>
            </motion.div>

            {/* Chemical Usage */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-card p-6 rounded-2xl border border-border hover:border-purple-500/30 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-muted-foreground">Chemical Usage</h3>
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                    <Beaker className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="h-32 flex flex-col gap-2 justify-center">
                  {[
                    { name: 'Reactive', value: 85, color: 'from-purple-500 to-purple-600' },
                    { name: 'Disperse', value: 65, color: 'from-blue-500 to-blue-600' },
                    { name: 'Acid', value: 45, color: 'from-pink-500 to-pink-600' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-16 truncate">{item.name}</span>
                      <div className="flex-1 h-4 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value}%` }}
                          transition={{ delay: i * 0.15, duration: 0.6 }}
                          className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                        />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground w-8 text-right">{item.value}%</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                  <span>Weekly avg</span>
                  <span className="font-bold text-purple-600">Optimal</span>
                </div>
              </div>
            </motion.div>

            {/* Inventory Levels */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-card p-6 rounded-2xl border border-border hover:border-orange-500/30 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-muted-foreground">Inventory Levels</h3>
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="h-32 flex items-end justify-center gap-1">
                  {[
                    { value: 45, label: 'Low', color: 'from-red-500 to-red-600' },
                    { value: 72, label: 'Med', color: 'from-yellow-500 to-yellow-600' },
                    { value: 88, label: 'High', color: 'from-green-500 to-green-600' },
                  ].map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${item.value}%` }}
                        transition={{ delay: i * 0.15, duration: 0.5 }}
                        className={`w-full bg-gradient-to-t ${item.color} rounded-t-lg hover:shadow-lg transition-shadow cursor-pointer`}
                        title={`${item.value}%`}
                      />
                      <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                  <span>Stock status</span>
                  <span className="font-bold text-green-600">Healthy</span>
                </div>
              </div>
            </motion.div>

            {/* Quality Score */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-card p-6 rounded-2xl border border-border hover:border-cyan-500/30 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-muted-foreground">Quality Score</h3>
                  <div className="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="h-32 flex items-center justify-center">
                  <div className="relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-xl"
                    >
                      <span className="text-3xl font-black text-white">A+</span>
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Sparkles className="h-4 w-4 text-yellow-900" />
                    </motion.div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                  <span>Overall rating</span>
                  <span className="font-bold text-cyan-600">Excellent</span>
                </div>
              </div>
            </motion.div>

            {/* Revenue Trend */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-card p-6 rounded-2xl border border-border hover:border-teal-500/30 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-muted-foreground">Revenue Trend</h3>
                  <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="h-32 relative">
                  <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="tealGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    <motion.path
                      d="M0,70 L28,65 L57,55 L85,60 L114,45 L142,40 L171,30 L200,25 L200,100 L0,100 Z"
                      fill="url(#tealGradient)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8 }}
                    />
                    <motion.path
                      d="M0,70 L28,65 L57,55 L85,60 L114,45 L142,40 L171,30 L200,25"
                      stroke="#14b8a6"
                      strokeWidth="2"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </svg>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                  <span>Last quarter</span>
                  <span className="font-bold text-green-600">+23%</span>
                </div>
              </div>
            </motion.div>

            {/* Time to Market - Hidden on small screens */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="hidden lg:block bg-card p-6 rounded-2xl border border-border hover:border-indigo-500/30 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-muted-foreground">Time to Market</h3>
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="h-32 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-indigo-600"
                    >
                      4.2
                    </motion.div>
                    <p className="text-xs text-muted-foreground mt-1">Days avg</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                  <span>Delivery time</span>
                  <span className="font-bold text-green-600">-15%</span>
                </div>
              </div>
            </motion.div>

            {/* Customer Satisfaction - Hidden on small screens */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="hidden lg:block bg-card p-6 rounded-2xl border border-border hover:border-pink-500/30 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-muted-foreground">Customer Satisfaction</h3>
                  <div className="p-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="h-32 flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.div
                      key={star}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: star * 0.1, duration: 0.4 }}
                    >
                      <Heart className={`h-8 w-8 ${star <= 4 ? 'fill-pink-500 text-pink-500' : 'fill-pink-300 text-pink-300'}`} />
                    </motion.div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                  <span>Avg rating</span>
                  <span className="font-bold text-pink-600">4.8/5</span>
                </div>
              </div>
            </motion.div>

            {/* Team Productivity - Hidden on small screens */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="hidden lg:block bg-card p-6 rounded-2xl border border-border hover:border-emerald-500/30 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-muted-foreground">Team Productivity</h3>
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="h-32 flex items-center justify-around">
                  {[
                    { value: 85, label: 'Mon' },
                    { value: 90, label: 'Tue' },
                    { value: 75, label: 'Wed' },
                    { value: 95, label: 'Thu' },
                    { value: 88, label: 'Fri' },
                  ].map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${day.value * 0.7}px` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="w-6 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-md hover:from-emerald-600 hover:to-emerald-500 transition-colors cursor-pointer"
                        title={`${day.value}%`}
                      />
                      <span className="text-xs font-medium text-muted-foreground">{day.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                  <span>This week</span>
                  <span className="font-bold text-green-600">+12%</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content Grid with Enhanced Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Quick Actions - Premium Grid */}
          <div className="xl:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-3xl font-black text-foreground">Quick Actions</h2>
                <p className="text-muted-foreground mt-1">Access your most used features</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:flex-none sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search actions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Target className="h-8 w-8 text-muted-foreground/40 hidden sm:block" />
              </div>
            </div>

            {filteredActions.length > 0 ? (
              <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-5" variants={containerVariants}>
                {filteredActions.map((action, index) => (
                  <motion.div key={action.path} variants={itemVariants}>
                    <ActionCard {...action} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 px-4"
              >
                <div className="p-4 bg-muted/50 rounded-full mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">No actions found</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  No actions match your search. Try a different keyword.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Clear Search
                </button>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Enhanced with Premium Cards */}
          <div className="xl:col-span-1 space-y-8">

            {/* Trending Community Posts */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="h-6 w-6 text-orange-500" />
                <h2 className="text-2xl font-black text-foreground">Trending</h2>
              </div>
              <motion.div className="space-y-4" variants={containerVariants}>
                <motion.div variants={itemVariants}>
                  <motion.div
                    className="relative bg-card p-5 rounded-2xl border border-border hover:border-orange-500/30 transition-all duration-300 cursor-pointer overflow-hidden group"
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-start gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-foreground mb-1">New Dyeing Method for Cotton</h4>
                        <p className="text-sm text-muted-foreground mb-3">Sarah Chen shared a breakthrough technique...</p>
                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                          <span className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                            <Heart className="h-4 w-4" />
                            24
                          </span>
                          <span className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            8
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <motion.div
                    className="relative bg-card p-5 rounded-2xl border border-border hover:border-purple-500/30 transition-all duration-300 cursor-pointer overflow-hidden group"
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-start gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                        <HelpCircle className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-foreground mb-1">Polyester Bleeding Issues?</h4>
                        <p className="text-sm text-muted-foreground mb-3">Ahmed Rahman needs help with color bleeding...</p>
                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                          <span className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                            <Heart className="h-4 w-4" />
                            12
                          </span>
                          <span className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            15
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Activity className="h-6 w-6 text-blue-500" />
                <h2 className="text-2xl font-black text-foreground">Recent Activity</h2>
              </div>
              <motion.div className="space-y-3" variants={containerVariants}>
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <motion.div key={activity.id} variants={itemVariants}>
                      <RecentActivityItem
                        icon={activity.icon}
                        title={activity.title}
                        description={activity.description}
                        time={getTimeAgo(activity.timestamp)}
                        gradient={activity.gradient}
                      />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 px-4 bg-card rounded-xl border border-border"
                  >
                    <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No recent activity yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Start using features to see your history</p>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Quick Tips - Premium Cards */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Lightbulb className="h-6 w-6 text-yellow-500" />
                <h2 className="text-2xl font-black text-foreground">Pro Tips</h2>
              </div>
              <motion.div className="space-y-4" variants={containerVariants}>
                <motion.div variants={itemVariants}>
                  <motion.div
                    className="relative bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-900/30 overflow-hidden group"
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200/20 dark:bg-yellow-800/20 rounded-full -mr-12 -mt-12"></div>
                    <div className="relative z-10 flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl shadow-lg">
                        <Lightbulb className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-foreground mb-2">Optimize Dyeing Efficiency</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">Use the calculator to fine-tune chemical ratios for better color consistency and reduced waste.</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <motion.div
                    className="relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-900/30 overflow-hidden group"
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/20 dark:bg-blue-800/20 rounded-full -mr-12 -mt-12"></div>
                    <div className="relative z-10 flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl shadow-lg">
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-foreground mb-2">Track Your Progress</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">Regularly review production history to identify trends and discover optimization opportunities.</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
