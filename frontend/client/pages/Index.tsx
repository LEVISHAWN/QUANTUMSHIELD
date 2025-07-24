import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Zap, Eye, RotateCcw, Activity, BarChart3, ArrowRight, CheckCircle, Menu, X, User, LogIn } from 'lucide-react';

const features = [
  {
    title: "Threat Prediction Engine",
    description: "Real-time quantum threat assessment with AI-powered predictions and threat modeling.",
    icon: <Zap className="w-8 h-8" />,
    color: "bg-orange-500",
    iconBg: "bg-orange-100"
  },
  {
    title: "Enterprise Security",
    description: "Bank-grade security with compliance reporting and threat for enterprise environments.",
    icon: <Shield className="w-8 h-8" />,
    color: "bg-blue-400",
    iconBg: "bg-blue-100"
  },
  {
    title: "Adaptive Key Rotation",
    description: "Automated key rotation that responds to quantum advances and algorithm activity.",
    icon: <RotateCcw className="w-8 h-8" />,
    color: "bg-teal-500",
    iconBg: "bg-teal-100"
  },
  {
    title: "Real-time Monitoring",
    description: "24/7 security event monitoring with security-based degradation and advanced hacking.",
    icon: <Activity className="w-8 h-8" />,
    color: "bg-cyan-400",
    iconBg: "bg-cyan-100"
  },
  {
    title: "AI-Driven Algorithm Selection",
    description: "Smart recommendations for post-quantum cryptographic algorithms for your data.",
    icon: <Eye className="w-8 h-8" />,
    color: "bg-teal-600",
    iconBg: "bg-teal-100"
  },
  {
    title: "Algorithm Comparison",
    description: "Comprehensive performance analysis and security comparisons for AI, NST-approved algorithms.",
    icon: <BarChart3 className="w-8 h-8" />,
    color: "bg-orange-600",
    iconBg: "bg-orange-100"
  }
];

const pricingTiers = [
  {
    name: "Starter",
    price: "500+",
    features: ["Basic quantum protection", "Essential monitoring", "Email support"],
    popular: false
  },
  {
    name: "Professional", 
    price: "1200+",
    features: ["Advanced threat detection", "Real-time monitoring", "Priority support", "Custom integrations"],
    popular: true
  },
  {
    name: "Enterprise",
    price: "5000+", 
    features: ["Full enterprise suite", "24/7 dedicated support", "Custom algorithms", "Compliance reporting"],
    popular: false
  }
];

const navigationItems = [
  { name: 'Home', id: 'home' },
  { name: 'Features', id: 'features' },
  { name: 'Security', id: 'security' },
  { name: 'Pricing', id: 'pricing' },
  { name: 'About', id: 'about' }
];

export default function Index() {
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const homeRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const securityRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);

  const scrollToSection = (sectionId: string) => {
    let targetRef;
    switch (sectionId) {
      case 'home':
        targetRef = homeRef;
        break;
      case 'features':
        targetRef = featuresRef;
        break;
      case 'security':
        targetRef = securityRef;
        break;
      case 'pricing':
        targetRef = pricingRef;
        break;
      case 'about':
        targetRef = aboutRef;
        break;
      default:
        return;
    }

    if (targetRef.current) {
      targetRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
  };

  // Scroll event listener to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'home', ref: homeRef },
        { id: 'features', ref: featuresRef },
        { id: 'security', ref: securityRef },
        { id: 'pricing', ref: pricingRef },
        { id: 'about', ref: aboutRef }
      ];

      const scrollPosition = window.scrollY + 100; // Offset for better detection

      sections.forEach((section) => {
        if (section.ref.current) {
          const sectionTop = section.ref.current.offsetTop;
          const sectionHeight = section.ref.current.offsetHeight;

          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            setActiveSection(section.id);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login:', loginForm);
    setIsLoginOpen(false);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic here
    console.log('Signup:', signupForm);
    setIsSignupOpen(false);
  };

  return (
    <div className="min-h-screen bg-quantum-space">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-space-black/40 backdrop-blur-md border-b border-quantum-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-quantum-electric to-quantum-accent rounded-lg flex items-center justify-center animate-quantum-pulse">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-white font-bold text-xl">QuantumShield</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative px-4 py-2 text-white font-medium transition-all duration-300 hover:text-quantum-glow hover:drop-shadow-[0_0_10px_rgba(232,121,249,0.8)] group ${
                    activeSection === item.id ? 'text-quantum-glow drop-shadow-[0_0_15px_rgba(232,121,249,1)]' : ''
                  }`}
                >
                  {item.name}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-quantum-accent to-quantum-glow transform transition-transform duration-300 ${
                    activeSection === item.id ? 'scale-x-100 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]' : 'scale-x-0 group-hover:scale-x-100'
                  }`}></span>
                </button>
              ))}

              {/* Login/Signup Buttons */}
              <div className="flex items-center space-x-4 ml-8 border-l border-quantum-accent/30 pl-8">
                <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="text-white hover:text-quantum-glow hover:bg-quantum-accent/20 transition-all duration-300">
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </DialogTrigger>
                </Dialog>

                <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-quantum-primary to-quantum-accent hover:from-quantum-accent hover:to-quantum-glow text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]">
                      <User className="w-4 h-4 mr-2" />
                      Sign Up
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-quantum-glow hover:drop-shadow-[0_0_10px_rgba(232,121,249,0.8)] transition-all duration-200"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-space-black/60 backdrop-blur-md border-t border-quantum-accent/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`block w-full text-left px-3 py-2 rounded-md text-white font-medium transition-all duration-200 hover:bg-quantum-accent/20 hover:text-quantum-glow hover:drop-shadow-[0_0_8px_rgba(232,121,249,0.6)] ${
                    activeSection === item.id ? 'bg-quantum-primary/30 text-quantum-glow drop-shadow-[0_0_10px_rgba(232,121,249,0.8)]' : ''
                  }`}
                >
                  {item.name}
                </button>
              ))}

              {/* Mobile Login/Signup - Horizontal Layout */}
              <div className="border-t border-quantum-accent/20 pt-3 mt-3">
                <div className="flex space-x-2">
                  <button
                    onClick={() => {setIsMobileMenuOpen(false); setIsLoginOpen(true);}}
                    className="flex items-center justify-center flex-1 px-3 py-2 rounded-md text-white font-medium transition-all duration-200 hover:bg-quantum-accent/20 hover:text-quantum-glow border border-quantum-accent/30"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </button>
                  <button
                    onClick={() => {setIsMobileMenuOpen(false); setIsSignupOpen(true);}}
                    className="flex items-center justify-center flex-1 px-3 py-2 rounded-md text-white font-medium transition-all duration-200 bg-gradient-to-r from-quantum-primary to-quantum-accent hover:from-quantum-accent hover:to-quantum-glow hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Login Modal */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="bg-space-dark border border-quantum-accent/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-quantum-glow">Login to QuantumShield</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="login-email" className="text-white/80">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className="bg-space-black/50 border border-quantum-accent/30 text-white focus:border-quantum-glow focus:ring-quantum-glow/20"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <Label htmlFor="login-password" className="text-white/80">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="bg-space-black/50 border border-quantum-accent/30 text-white focus:border-quantum-glow focus:ring-quantum-glow/20"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            <div className="space-y-4">
              <Button type="submit" className="w-full bg-gradient-to-r from-quantum-primary to-quantum-accent hover:from-quantum-accent hover:to-quantum-glow text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]">
                Sign In
              </Button>
              <div className="text-center">
                <span className="text-white/60">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => {setIsLoginOpen(false); setIsSignupOpen(true);}}
                  className="text-quantum-accent hover:text-quantum-glow transition-colors duration-200"
                >
                  Sign up here
                </button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Signup Modal */}
      <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
        <DialogContent className="bg-space-dark border border-quantum-accent/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-quantum-glow">Join QuantumShield</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="signup-name" className="text-white/80">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                  className="bg-space-black/50 border border-quantum-accent/30 text-white focus:border-quantum-glow focus:ring-quantum-glow/20"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-email" className="text-white/80">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                  className="bg-space-black/50 border border-quantum-accent/30 text-white focus:border-quantum-glow focus:ring-quantum-glow/20"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-password" className="text-white/80">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                  className="bg-space-black/50 border border-quantum-accent/30 text-white focus:border-quantum-glow focus:ring-quantum-glow/20"
                  placeholder="Create a password"
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-confirm" className="text-white/80">Confirm Password</Label>
                <Input
                  id="signup-confirm"
                  type="password"
                  value={signupForm.confirmPassword}
                  onChange={(e) => setSignupForm({...signupForm, confirmPassword: e.target.value})}
                  className="bg-space-black/50 border border-quantum-accent/30 text-white focus:border-quantum-glow focus:ring-quantum-glow/20"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>
            <div className="space-y-4">
              <Button type="submit" className="w-full bg-gradient-to-r from-quantum-primary to-quantum-accent hover:from-quantum-accent hover:to-quantum-glow text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]">
                Create Account
              </Button>
              <div className="text-center">
                <span className="text-white/60">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => {setIsSignupOpen(false); setIsLoginOpen(true);}}
                  className="text-quantum-accent hover:text-quantum-glow transition-colors duration-200"
                >
                  Sign in here
                </button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section - Prepare for the Quantum Era */}
        <section ref={homeRef} id="home" className="min-h-screen flex items-center justify-center px-4 sm:px-8 py-16">
          <div className="max-w-6xl mx-auto text-center text-white">
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
                  <span className="block">Prepare for the</span>
                  <span className="block text-transparent bg-gradient-to-r from-quantum-electric via-quantum-accent to-quantum-glow bg-clip-text animate-holographic-shift bg-[length:200%_200%] drop-shadow-[0_0_30px_rgba(139,92,246,0.8)]">
                    Quantum Era
                  </span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-4xl mx-auto">
                  QuantumShield provides AI-driven post-quantum cryptography solutions to protect
                  your organization from the looming threat of quantum computing attacks. Secure
                  your future today.
                </p>
              </div>

              {/* Pricing Cards */}
              <div className="grid md:grid-cols-3 gap-6 mt-16">
                {pricingTiers.map((tier, index) => (
                  <Card key={index} className={`bg-space-dark/60 backdrop-blur-sm border border-quantum-accent/30 p-6 hover:border-quantum-glow/50 transition-all duration-300 ${tier.popular ? 'ring-2 ring-quantum-accent animate-quantum-pulse' : 'hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]'}`}>
                    <CardContent className="p-0">
                      {tier.popular && (
                        <Badge className="bg-gradient-to-r from-quantum-accent to-quantum-glow text-white mb-4 animate-holographic-shift bg-[length:200%_200%]">Most Popular</Badge>
                      )}
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-white mb-2">{tier.name}</h3>
                        <div className="text-3xl font-bold text-white mb-6">
                          ${tier.price}
                          <span className="text-sm text-white/60">/month</span>
                        </div>
                        <ul className="space-y-3 text-white/80 mb-6">
                          {tier.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-quantum-glow mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button className="w-full bg-gradient-to-r from-quantum-primary to-quantum-accent hover:from-quantum-accent hover:to-quantum-glow text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]">
                          Get Started
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Comprehensive Quantum Protection */}
        <section ref={featuresRef} id="features" className="min-h-screen flex items-center justify-center px-4 sm:px-8 py-16">
          <div className="max-w-7xl mx-auto text-center text-white">
            <div className="mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Comprehensive Quantum Protection
              </h2>
              <p className="text-lg sm:text-xl text-white/80 max-w-4xl mx-auto">
                Our platform combines cutting-edge AI with post-quantum cryptography to deliver
                unparalleled security for the quantum computing age.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-space-dark/40 backdrop-blur-sm border border-quantum-accent/30 p-8 hover:bg-space-dark/60 hover:border-quantum-glow/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className={`w-16 h-16 rounded-2xl ${feature.iconBg} flex items-center justify-center animate-quantum-pulse`}>
                        <div className={`${feature.color} rounded-xl p-2 text-white`}>
                          {feature.icon}
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                      <p className="text-white/70 leading-relaxed">{feature.description}</p>
                      <Button variant="ghost" className="text-quantum-accent hover:text-quantum-glow hover:drop-shadow-[0_0_10px_rgba(139,92,246,0.8)] p-0 transition-all duration-300">
                        Learn more <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section - Ready to Secure Your Future */}
        <section ref={securityRef} id="security" className="min-h-screen flex items-center justify-center px-4 sm:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="space-y-12">
              {/* Large Shield Icon */}
              <div className="flex justify-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-space-dark/60 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-quantum-accent/50 animate-quantum-pulse">
                  <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-quantum-glow drop-shadow-[0_0_20px_rgba(232,121,249,1)]" />
                </div>
              </div>

              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  Ready to Secure Your Future?
                </h2>
                <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto mb-12">
                  Join leading organizations in preparing for the quantum computing
                  revolution. Start your free trial today and experience the future of
                  cryptographic security.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-quantum-primary to-quantum-accent hover:from-quantum-accent hover:to-quantum-glow text-white px-8 py-4 text-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.8)] animate-quantum-pulse">
                  Start Your Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-quantum-accent/50 text-white hover:bg-quantum-accent/20 hover:border-quantum-glow hover:text-quantum-glow hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] px-8 py-4 text-lg transition-all duration-300">
                  View Documentation
                </Button>
              </div>

              <div className="flex items-center justify-center space-x-8 text-white/60">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-quantum-glow mr-2" />
                  Enterprise Ready
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-quantum-glow mr-2" />
                  Quick Setup
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-quantum-glow mr-2" />
                  NST Compliant
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section ref={pricingRef} id="pricing" className="min-h-screen flex items-center justify-center px-4 sm:px-8 py-16">
          <div className="max-w-6xl mx-auto text-center text-white">
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  Choose Your Protection Level
                </h2>
                <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto">
                  Select the quantum security plan that best fits your organization's needs.
                  All plans include our core post-quantum cryptography protection.
                </p>
              </div>

              {/* Enhanced Pricing Cards */}
              <div className="grid md:grid-cols-3 gap-8 mt-16">
                {pricingTiers.map((tier, index) => (
                  <Card key={index} className={`bg-space-dark/60 backdrop-blur-sm border border-quantum-accent/30 p-8 hover:bg-space-dark/80 hover:border-quantum-glow/50 transition-all duration-300 ${tier.popular ? 'ring-2 ring-quantum-accent scale-105 animate-quantum-pulse' : 'hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]'}`}>
                    <CardContent className="p-0">
                      {tier.popular && (
                        <Badge className="bg-gradient-to-r from-quantum-accent to-quantum-glow text-white mb-6 animate-holographic-shift bg-[length:200%_200%]">Most Popular</Badge>
                      )}
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">{tier.name}</h3>
                        <div className="text-4xl font-bold text-white mb-8">
                          ${tier.price}
                          <span className="text-lg text-white/60">/month</span>
                        </div>
                        <ul className="space-y-4 text-white/80 mb-8 text-left">
                          {tier.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start">
                              <CheckCircle className="w-5 h-5 text-quantum-glow mr-3 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button className={`w-full py-3 transition-all duration-300 ${tier.popular ? 'bg-gradient-to-r from-quantum-accent to-quantum-glow hover:from-quantum-glow hover:to-quantum-lighter hover:shadow-[0_0_25px_rgba(232,121,249,0.8)]' : 'bg-space-dark/60 border border-quantum-accent/50 hover:bg-quantum-accent/20 hover:border-quantum-glow hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]'} text-white`}>
                          {tier.popular ? 'Start Free Trial' : 'Get Started'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-12">
                <p className="text-white/60 mb-4">All plans include 30-day money-back guarantee</p>
                <Button variant="ghost" className="text-quantum-accent hover:text-quantum-glow hover:drop-shadow-[0_0_10px_rgba(139,92,246,0.8)] transition-all duration-300">
                  Compare all features <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section ref={aboutRef} id="about" className="min-h-screen flex items-center justify-center px-4 sm:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  About QuantumShield
                </h2>
                <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto mb-8">
                  We are pioneering the future of cybersecurity by developing cutting-edge post-quantum
                  cryptography solutions. Our mission is to protect organizations worldwide from the
                  emerging threats posed by quantum computing advances.
                </p>
                <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto">
                  Founded by leading cryptographers and security experts, QuantumShield combines
                  decades of experience with innovative AI-driven approaches to deliver enterprise-grade
                  quantum-resistant security solutions.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mt-16">
                <div className="text-center">
                  <div className="text-4xl font-bold text-quantum-glow mb-2 drop-shadow-[0_0_15px_rgba(232,121,249,0.8)]">50+</div>
                  <div className="text-white/80">Enterprise Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-quantum-glow mb-2 drop-shadow-[0_0_15px_rgba(232,121,249,0.8)]">99.9%</div>
                  <div className="text-white/80">Uptime Guarantee</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-quantum-glow mb-2 drop-shadow-[0_0_15px_rgba(232,121,249,0.8)]">24/7</div>
                  <div className="text-white/80">Security Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
