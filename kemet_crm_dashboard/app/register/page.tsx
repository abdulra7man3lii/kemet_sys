'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('http://localhost:4000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, companyName }),
            });

            const data = await res.json();

            if (res.ok) {
                login(data.token, data);
                toast.success('Account created successfully!');
                router.push('/dashboard');
            } else {
                toast.error(data.message || 'Registration failed');
            }
        } catch (err) {
            toast.error('Something went wrong. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white relative overflow-hidden px-4">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 -left-20 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-yellow-600/5 rounded-full blur-[100px] pointer-events-none" />

            <Card className="w-full max-w-md shadow-2xl border-yellow-600/20 bg-white/80 backdrop-blur-md relative z-10 transition-all hover:shadow-yellow-600/5">
                <CardHeader className="space-y-4 text-center pb-8">
                    <div className="flex justify-center mb-2">
                        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-3 rounded-2xl shadow-lg shadow-yellow-600/20 group-hover:scale-110 transition-transform">
                            <UserPlus className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent tracking-tighter uppercase italic">Create Account</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Join KEMET SYSTEM to start managing your business</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                required
                                className="border-slate-200 focus:border-yellow-600 focus:ring-yellow-600/20 h-11"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                required
                                className="border-slate-200 focus:border-yellow-600 focus:ring-yellow-600/20 h-11"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-slate-400">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                className="border-slate-200 focus:border-yellow-600 focus:ring-yellow-600/20 h-11"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="companyName" className="text-xs font-black uppercase tracking-widest text-slate-400">Company Name</Label>
                            <Input
                                id="companyName"
                                placeholder="My Business Ltd."
                                required
                                className="border-slate-200 focus:border-yellow-600 focus:ring-yellow-600/20 h-11"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-xl shadow-yellow-600/20 border-none h-12 font-black uppercase tracking-wider"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Create Account'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 text-center border-t border-slate-100 mt-4 pt-6">
                    <p className="text-sm text-slate-500 font-medium">
                        Already have an account?{' '}
                        <Button variant="link" asChild className="p-0 text-yellow-600 hover:text-yellow-700 font-black h-auto">
                            <a href="/login">SIGN IN</a>
                        </Button>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
