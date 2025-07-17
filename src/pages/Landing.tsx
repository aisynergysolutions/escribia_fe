import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Users, TrendingUp, Calendar, Target, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Landing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    loginEmail: '',
    loginPassword: ''
  });

  const navigate = useNavigate();
  const { login, signup, currentUser } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <LineChart className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Escribia</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost">Features</Button>
              <Button variant="ghost">Pricing</Button>
              <Button variant="ghost">About</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Hero content */}
            <div className="space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Streamline Your
                <span className="text-blue-600"> Content Creation</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Manage clients, create engaging content, and grow your social media presence with our powerful all-in-one platform designed for agencies and creators.
              </p>

              {/* Features grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                <div className="flex items-start space-x-3">
                  <Users className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Client Management</h3>
                    <p className="text-gray-600 text-sm">Organize and track all your clients in one place</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Content Scheduling</h3>
                    <p className="text-gray-600 text-sm">Plan and schedule posts across platforms</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Analytics & Insights</h3>
                    <p className="text-gray-600 text-sm">Track performance and optimize content</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Zap className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">AI-Powered</h3>
                    <p className="text-gray-600 text-sm">Generate content ideas with AI assistance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Auth form */}
            <div className="flex justify-center">
              <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Get Started Today</CardTitle>
                  <CardDescription>
                    Join thousands of creators and agencies already using Escribia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {successMessage && (
                    <Alert className="mb-4">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                  )}

                  <Tabs defaultValue="signup" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                      <TabsTrigger value="login">Login</TabsTrigger>
                    </TabsList>

                    <TabsContent value="signup" className="space-y-4">
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Create a password (min 6 characters)"
                            value={formData.password}
                            onChange={handleInputChange}
                            minLength={6}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="login" className="space-y-4">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="loginEmail">Email</Label>
                          <Input
                            id="loginEmail"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.loginEmail}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="loginPassword">Password</Label>
                          <Input
                            id="loginPassword"
                            type="password"
                            placeholder="Enter your password"
                            value={formData.loginPassword}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
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

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Trusted by Creator Mr. Worldwide</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">10,000+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">1M+</div>
              <div className="text-gray-600">Posts Created</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <LineChart className="h-6 w-6" />
              <span className="text-lg font-bold">Escribia</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 Escribia. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;