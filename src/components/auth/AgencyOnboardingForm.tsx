import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, AlertCircle, Loader2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AgencyOnboardingForm: React.FC = () => {
    const { currentUser } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        agencyName: '',
        agencyWebsite: '',
        mainAdminName: currentUser?.displayName || '',
        primaryContactEmail: currentUser?.email || '',
        phoneNumber: '',
        agencySize: '',
        industry: '',
        description: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        defaultLanguage: 'en'
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        setIsSubmitting(true);
        setError('');

        try {
            // Create agency document using the user's UID as the document ID
            const agencyDocRef = doc(db, 'agencies', currentUser.uid);

            const agencyData = {
                agencyName: formData.agencyName,
                agencyWebsite: formData.agencyWebsite,
                mainAdminName: formData.mainAdminName,
                primaryContactEmail: formData.primaryContactEmail,
                phoneNumber: formData.phoneNumber,
                agencySize: formData.agencySize,
                industry: formData.industry,
                description: formData.description,
                photoUrl: '', // Will be set later when they upload a photo
                settings: {
                    timezone: formData.timezone,
                    defaultLanguage: formData.defaultLanguage
                },
                subscription: {
                    planId: 'free', // Default to free plan
                    paymentHistory: []
                },
                onboardingCompleted: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: currentUser.uid
            };

            await setDoc(agencyDocRef, agencyData);

            // Refresh the page to trigger the app to load normally
            window.location.reload();

        } catch (err: any) {
            console.error('Error creating agency profile:', err);
            setError(err.message || 'Failed to create agency profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl">Welcome to Escribia!</CardTitle>
                    <CardDescription>
                        Let's set up your agency profile to get started
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Agency Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Agency Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="agencyName">Agency Name *</Label>
                                    <Input
                                        id="agencyName"
                                        value={formData.agencyName}
                                        onChange={(e) => handleInputChange('agencyName', e.target.value)}
                                        placeholder="Enter your agency name"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="agencyWebsite">Website</Label>
                                    <Input
                                        id="agencyWebsite"
                                        type="url"
                                        value={formData.agencyWebsite}
                                        onChange={(e) => handleInputChange('agencyWebsite', e.target.value)}
                                        placeholder="https://your-agency.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="agencySize">Agency Size *</Label>
                                    <Select value={formData.agencySize} onValueChange={(value) => handleInputChange('agencySize', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select agency size" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1-5">1-5 employees</SelectItem>
                                            <SelectItem value="6-20">6-20 employees</SelectItem>
                                            <SelectItem value="21-50">21-50 employees</SelectItem>
                                            <SelectItem value="51-200">51-200 employees</SelectItem>
                                            <SelectItem value="200+">200+ employees</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="industry">Industry</Label>
                                    <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your industry" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="marketing">Marketing & Advertising</SelectItem>
                                            <SelectItem value="consulting">Consulting</SelectItem>
                                            <SelectItem value="ecommerce">E-commerce</SelectItem>
                                            <SelectItem value="saas">SaaS</SelectItem>
                                            <SelectItem value="healthcare">Healthcare</SelectItem>
                                            <SelectItem value="finance">Finance</SelectItem>
                                            <SelectItem value="education">Education</SelectItem>
                                            <SelectItem value="retail">Retail</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Agency Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Tell us about your agency and what services you provide..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="mainAdminName">Main Admin Name *</Label>
                                    <Input
                                        id="mainAdminName"
                                        value={formData.mainAdminName}
                                        onChange={(e) => handleInputChange('mainAdminName', e.target.value)}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Phone Number</Label>
                                    <Input
                                        id="phoneNumber"
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="primaryContactEmail">Primary Contact Email *</Label>
                                <Input
                                    id="primaryContactEmail"
                                    type="email"
                                    value={formData.primaryContactEmail}
                                    onChange={(e) => handleInputChange('primaryContactEmail', e.target.value)}
                                    placeholder="contact@your-agency.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select timezone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                                            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                                            <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                                            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                                            <SelectItem value="Europe/London">GMT</SelectItem>
                                            <SelectItem value="Europe/Berlin">CET</SelectItem>
                                            <SelectItem value="Asia/Tokyo">JST</SelectItem>
                                            <SelectItem value="Australia/Sydney">AEST</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="defaultLanguage">Default Language</Label>
                                    <Select value={formData.defaultLanguage} onValueChange={(value) => handleInputChange('defaultLanguage', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="es">Spanish</SelectItem>
                                            <SelectItem value="fr">French</SelectItem>
                                            <SelectItem value="de">German</SelectItem>
                                            <SelectItem value="it">Italian</SelectItem>
                                            <SelectItem value="pt">Portuguese</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting || !formData.agencyName || !formData.agencySize || !formData.mainAdminName || !formData.primaryContactEmail}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Agency Profile...
                                    </>
                                ) : (
                                    'Complete Setup'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AgencyOnboardingForm;
