import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Users,
  TrendingUp,
  Calendar,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  Linkedin,
  BarChart,
  Clock,
  FileText,
  Sparkles,
  Shield,
  Globe,
  Play,
  Star,
  ArrowRight,
  CheckIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import '../styles/landing-animations.css';

const Landing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    loginEmail: '',
    loginPassword: ''
  });

  const navigate = useNavigate();
  const { login, signup, currentUser } = useAuth();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Note: Navigation is handled by the ProtectedRoute component

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
    setError(''); // Clear error when user types
    setSuccessMessage(''); // Clear success message when user types
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData.loginEmail, formData.loginPassword);
      // Navigation will be handled by the auth state change and ProtectedRoute
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (error.code === 'auth/user-disabled') {
        setError('This account has been disabled.');
      } else {
        setError(error.message || 'Failed to log in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await signup(formData.email, formData.password, formData.name);
      setSuccessMessage('Account created! Please check your email to verify your account before signing in.');
      // Clear the form
      setFormData(prev => ({
        ...prev,
        name: '',
        email: '',
        password: ''
      }));
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-slow animation-delay-4000"></div>
        <div className="absolute top-20 left-20 w-2 h-2 bg-white rounded-full animate-float animation-delay-1000"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-300 rounded-full animate-float animation-delay-2000"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-purple-300 rounded-full animate-float animation-delay-600"></div>
      </div>

      {/* Floating Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-lg'
        : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-blue-400 to-purple-600 p-2 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl escribia-brand">escribia.io</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
              {/* <a href="#pricing" className="text-white/80 hover:text-white transition-colors">Pricing</a> */}
              {/* <a href="#about" className="text-white/80 hover:text-white transition-colors">About</a> */}
              {/* <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Play className="h-4 w-4 mr-2" />
                Watch Demo
              </Button> */}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Hero content */}
            <div className="space-y-8 relative z-10">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm animate-fade-in-up">
                  <Star className="h-4 w-4 mr-2 text-yellow-400" />
                  Trusted by 10,000+ Marketing Agencies
                </div>
                <h1 className="text-5xl md:text-7xl font-display text-white leading-tight animate-fade-in-up animation-delay-200">
                  AI-Powered
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                    LinkedIn Marketing
                  </span>
                  <br />
                  Made Simple
                </h1>
                <p className="text-xl text-white/80 leading-relaxed max-w-2xl animate-fade-in-up animation-delay-400">
                  Streamline your LinkedIn content creation, automate posting, and grow your clients' presence with our comprehensive AI-powered platform designed for marketing agencies.
                </p>
              </div>

              {/* <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-600">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 hover-glow">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-3">
                  <Play className="h-5 w-5 mr-2" />
                  Watch Demo
                </Button>
              </div> */}

              {/* Trust indicators */}
              {/* <div className="flex items-center gap-8 animate-fade-in-up animation-delay-800">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white gradient-text-blue">1M+</div>
                  <div className="text-white/60 text-sm">Posts Created</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white gradient-text-purple">10K+</div>
                  <div className="text-white/60 text-sm">Active Agencies</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white gradient-text-blue">99.9%</div>
                  <div className="text-white/60 text-sm">Uptime</div>
                </div>
              </div> */}
            </div>

            {/* Right side - Auth form */}
            <div className="flex justify-center lg:justify-end relative z-10">
              <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl animate-fade-in-right animation-delay-400 hover-scale">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-white font-display">Get Started Today</CardTitle>
                  <CardDescription className="text-white/70">
                    Join thousands of agencies already using <span className="font-escribia-light">escribia.io</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-4 bg-red-500/10 border-red-500/20">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-200">{error}</AlertDescription>
                    </Alert>
                  )}

                  {successMessage && (
                    <Alert className="mb-4 bg-green-500/10 border-green-500/20">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription className="text-green-200">{successMessage}</AlertDescription>
                    </Alert>
                  )}

                  <Tabs defaultValue="signup" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-white/10 border border-white/20">
                      <TabsTrigger value="signup" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white border-0">Sign Up</TabsTrigger>
                      <TabsTrigger value="login" className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white border-0">Login</TabsTrigger>
                    </TabsList>

                    <TabsContent value="signup" className="space-y-4">
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-white">Full Name</Label>
                          <Input
                            id="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-white">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-white">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Create a password (min 6 characters)"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
                            minLength={6}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0" disabled={isLoading}>
                          {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="login" className="space-y-4">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="loginEmail" className="text-white">Email</Label>
                          <Input
                            id="loginEmail"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.loginEmail}
                            onChange={handleInputChange}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="loginPassword" className="text-white">Password</Label>
                          <Input
                            id="loginPassword"
                            type="password"
                            placeholder="Enter your password"
                            value={formData.loginPassword}
                            onChange={handleInputChange}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0" disabled={isLoading}>
                          {isLoading ? "Signing In..." : "Sign In"}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display text-white mb-4">
              Everything You Need to
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> Scale LinkedIn Marketing</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              From content creation to analytics, <span className="font-escribia-light">escribia.io</span> provides a complete suite of tools to manage and grow your clients' LinkedIn presence.
            </p>
          </div>          {/* Core Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <FeatureCard
              icon={<Linkedin className="h-8 w-8 text-blue-400" />}
              title="LinkedIn Integration"
              description="Seamless OAuth connection for both personal and company profiles with automated posting capabilities."
            />
            <FeatureCard
              icon={<Sparkles className="h-8 w-8 text-purple-400" />}
              title="AI Content Generation"
              description="Generate engaging LinkedIn posts with AI assistance, customized for each client's brand voice and strategy."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-green-400" />}
              title="Multi-Client Management"
              description="Organize and manage multiple clients from a unified dashboard with individual branding and strategies."
            />
            <FeatureCard
              icon={<Calendar className="h-8 w-8 text-orange-400" />}
              title="Content Scheduling"
              description="Plan and schedule posts across multiple profiles with our intuitive visual calendar interface."
            />
            <FeatureCard
              icon={<BarChart className="h-8 w-8 text-cyan-400" />}
              title="Advanced Analytics"
              description="Track performance metrics including likes, comments, shares, and views with detailed insights."
            />
            <FeatureCard
              icon={<FileText className="h-8 w-8 text-pink-400" />}
              title="Template System"
              description="Create and reuse content templates to maintain consistency and accelerate content creation."
            />
          </div>

          {/* Additional Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h3 className="text-3xl font-display text-white">Advanced Platform Features</h3>
              <div className="space-y-6">
                <AdvancedFeature
                  icon={<Clock className="h-6 w-6 text-blue-400" />}
                  title="Post Queue Management"
                  description="Intelligently queue and manage content with automated optimal posting times."
                />
                <AdvancedFeature
                  icon={<Target className="h-6 w-6 text-purple-400" />}
                  title="Brand Strategy Planning"
                  description="Define and maintain consistent brand voice with custom instructions for each client."
                />
                <AdvancedFeature
                  icon={<Shield className="h-6 w-6 text-green-400" />}
                  title="Secure & Reliable"
                  description="Enterprise-grade security with 99.9% uptime and OAuth-based authentication."
                />
                <AdvancedFeature
                  icon={<Globe className="h-6 w-6 text-orange-400" />}
                  title="Multi-Profile Support"
                  description="Manage both personal and company LinkedIn profiles with specialized tools for each."
                />
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="space-y-6">
                <h4 className="text-2xl font-display text-white">Why Marketing Agencies Choose <span className="escribia-brand text-2xl">escribia.io</span></h4>
                <div className="space-y-4">
                  <CheckFeature text="Save 10+ hours per week on content creation" />
                  <CheckFeature text="Increase client engagement by 3x on average" />
                  <CheckFeature text="Manage unlimited clients and profiles" />
                  <CheckFeature text="White-label solutions available" />
                  <CheckFeature text="24/7 customer support and onboarding" />
                  <CheckFeature text="99.9% uptime with enterprise reliability" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display text-white">Trusted by Agencies Worldwide</h2>
              <p className="text-white/70 mt-4">Join the growing community of successful marketing agencies</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">1M+</div>
                <div className="text-white/60 mt-2">Posts Created</div>
              </div>
              {/* <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">10K+</div>
                <div className="text-white/60 mt-2">Active Agencies</div>
              </div> */}
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">50K+</div>
                <div className="text-white/60 mt-2">Managed Profiles</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">99.9%</div>
                <div className="text-white/60 mt-2">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="bg-gradient-to-br from-blue-400 to-purple-600 p-2 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl escribia-brand">escribia.io</span>
            </div>
            <div className="text-white/60 text-sm">
              © 2025 escribia.io All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="glass-effect rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover-glow hover-scale group">
    <div className="mb-4 group-hover:animate-float">{icon}</div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-white/70">{description}</p>
  </div>
);

// Advanced Feature Component
const AdvancedFeature = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="flex items-start space-x-4 group">
    <div className="flex-shrink-0 bg-white/10 rounded-lg p-2 group-hover:bg-white/20 transition-colors">
      {icon}
    </div>
    <div>
      <h4 className="font-semibold text-white mb-1">{title}</h4>
      <p className="text-white/70 text-sm">{description}</p>
    </div>
  </div>
);

// Check Feature Component
const CheckFeature = ({ text }: { text: string }) => (
  <div className="flex items-center space-x-3">
    <div className="flex-shrink-0 bg-green-500/20 rounded-full p-1">
      <CheckIcon className="h-4 w-4 text-green-400" />
    </div>
    <span className="text-white/80">{text}</span>
  </div>
);

export default Landing;