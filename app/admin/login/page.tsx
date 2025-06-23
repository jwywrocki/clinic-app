'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LoginForm {
    username: string;
    password: string;
}

export default function LoginPage() {
    const [loginForm, setLoginForm] = useState<LoginForm>({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: loginForm.username,
                    password: loginForm.password,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Zalogowano pomyślnie!',
                    description: `Witaj ${loginForm.username}`,
                });
                router.replace('/admin');
            } else {
                setLoginError(data.error || 'Nieprawidłowe dane logowania');
            }
        } catch (error) {
            setLoginError('Wystąpił błąd podczas logowania. Spróbuj ponownie.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
            <AnimatedSection animation="scaleIn">
                <Card className="w-full max-w-md shadow-2xl border-0">
                    <CardHeader className="text-center pb-8 bg-blue-600 text-white rounded-t-lg">
                        <CardTitle className="text-3xl font-bold">Panel Administracyjny</CardTitle>
                        <CardDescription className="text-blue-100 text-lg font-medium">SPZOZ GOZ Łopuszno</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <Label htmlFor="username" className="text-gray-700 font-semibold">
                                    Nazwa użytkownika
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    value={loginForm.username}
                                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                                    required
                                    className="mt-2 h-12 border-2 border-gray-200 focus:border-blue-600 focus:ring-blue-600"
                                />
                                <p className="text-sm text-gray-500 mt-1">Demo: admin lub editor</p>
                            </div>
                            <div>
                                <Label htmlFor="password" className="text-gray-700 font-semibold">
                                    Hasło
                                </Label>
                                <div className="relative mt-2">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={loginForm.password}
                                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                        required
                                        className="h-12 pr-12 border-2 border-gray-200 focus:border-blue-600 focus:ring-blue-600"
                                    />
                                    <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Demo: admin123 lub editor123</p>
                            </div>
                            {loginError && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>{loginError}</AlertDescription>
                                </Alert>
                            )}
                            <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-semibold transition-all duration-300" disabled={loading}>
                                {loading ? 'Logowanie...' : 'Zaloguj się'}
                            </Button>
                        </form>
                        <div className="mt-8 text-center">
                            <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                                ← Powrót do strony głównej
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </AnimatedSection>
            <Toaster />
        </div>
    );
}
