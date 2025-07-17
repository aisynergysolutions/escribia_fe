import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmailVerification: React.FC = () => {
    const { currentUser, sendVerificationEmail, checkEmailVerification, logout } = useAuth();
    const [isResending, setIsResending] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Auto-check verification status every 3 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            if (currentUser && !currentUser.emailVerified) {
                await checkEmailVerification();
                if (currentUser.emailVerified) {
                    location.reload(); // Reload to update the UI
                }
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [currentUser, checkEmailVerification, navigate]);

    const handleResendEmail = async () => {
        setIsResending(true);
        setError('');
        setMessage('');

        try {
            await sendVerificationEmail();
            setMessage('Verification email sent! Please check your inbox.');
        } catch (error: any) {
            console.error('Error sending verification email:', error);
            setError(error.message || 'Failed to send verification email');
        } finally {
            setIsResending(false);
        }
    };

    const handleCheckVerification = async () => {
        setIsChecking(true);
        setError('');

        try {
            await checkEmailVerification();
            if (currentUser?.emailVerified) {
                navigate('/');
            } else {
                setMessage('Email not verified yet. Please check your inbox and click the verification link.');
            }
        } catch (error: any) {
            console.error('Error checking verification:', error);
            setError(error.message || 'Failed to check verification status');
        } finally {
            setIsChecking(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            // No need to navigate - the auth state change will handle showing landing page
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mail className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl">Verify Your Email</CardTitle>
                    <CardDescription>
                        We've sent a verification email to{' '}
                        <span className="font-semibold">{currentUser?.email}</span>
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {message && (
                        <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-4">
                        <div className="text-sm text-gray-600 space-y-2">
                            <p>Please check your email and click the verification link to continue.</p>
                            <p>If you don't see the email, check your spam folder.</p>
                        </div>

                        <div className="space-y-3">
                            <Button
                                onClick={handleCheckVerification}
                                className="w-full"
                                disabled={isChecking}
                            >
                                {isChecking ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    'I have Verified My Email'
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={handleResendEmail}
                                className="w-full"
                                disabled={isResending}
                            >
                                {isResending ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Resend Verification Email'
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={handleLogout}
                                className="w-full text-gray-600"
                            >
                                Use Different Email
                            </Button>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 text-center mt-6">
                        <p>The verification link will expire in 24 hours.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default EmailVerification;
