'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building2, Shield, Bell, Palette, Key, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RoleManager } from '@/components/RoleManager';

export default function SettingsPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6 border border-yellow-600/20 shadow-xl shadow-yellow-600/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-yellow-600/10 to-transparent blur-3xl" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 bg-clip-text text-transparent">Settings</h1>
                    <p className="text-slate-400 mt-1">Manage your account and preferences</p>
                </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-10">
                <div className="sticky top-[64px] z-20 py-4 bg-white/80 backdrop-blur-md border-b border-yellow-600/10 -mx-6 px-6 shadow-sm">
                    <TabsList className="bg-slate-950 p-1 border-2 border-yellow-600/50 rounded-2xl shadow-xl h-14 w-full md:w-max flex overflow-x-auto overflow-y-hidden custom-scrollbar justify-start mx-auto">
                        <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-700 data-[state=active]:text-black data-[state=active]:shadow-lg text-slate-400 font-black px-8 py-3 rounded-xl transition-all hover:text-yellow-500 text-base">
                            <User className="h-5 w-5 mr-3" /> Profile
                        </TabsTrigger>
                        {user?.role !== 'EMPLOYEE' && (
                            <TabsTrigger value="organization" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-700 data-[state=active]:text-black data-[state=active]:shadow-lg text-slate-400 font-black px-8 py-3 rounded-xl transition-all hover:text-yellow-500 text-base">
                                <Building2 className="h-5 w-5 mr-3" /> Organization
                            </TabsTrigger>
                        )}
                        {user?.role === 'SUPER_ADMIN' && (
                            <TabsTrigger value="platform" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-700 data-[state=active]:text-black data-[state=active]:shadow-lg text-slate-400 font-black px-8 py-3 rounded-xl transition-all hover:text-yellow-500 text-base">
                                <Shield className="h-5 w-5 mr-3" /> Platform
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="notifications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-700 data-[state=active]:text-black data-[state=active]:shadow-lg text-slate-400 font-black px-8 py-3 rounded-xl transition-all hover:text-yellow-500 text-base">
                            <Bell className="h-5 w-5 mr-3" /> Notifications
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* PROFILE TAB - All Users */}
                <TabsContent value="profile" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your personal details and contact information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" defaultValue={user?.name || ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" defaultValue={user?.email || ''} disabled className="bg-slate-50 border-slate-200" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="role" defaultValue={user?.role || ''} disabled className="bg-slate-50 border-slate-200" />
                                    <Badge variant="outline" className="whitespace-nowrap">
                                        {user?.role === 'SUPER_ADMIN' && 'Platform Admin'}
                                        {user?.role === 'ORG_ADMIN' && 'Organization Admin'}
                                        {user?.role === 'EMPLOYEE' && 'Agent'}
                                    </Badge>
                                </div>
                            </div>
                            <Button className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-lg shadow-yellow-600/20 border-none px-8 font-bold">Save Changes</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Security</CardTitle>
                            <CardDescription>Manage your password and security settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input id="current-password" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input id="new-password" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <Input id="confirm-password" type="password" />
                            </div>
                            <Button variant="outline" className="border-yellow-600/20 text-yellow-700 hover:bg-yellow-50 font-bold">
                                <Key className="h-4 w-4 mr-2" /> Update Password
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ORGANIZATION TAB - Admins Only */}
                {user?.role !== 'EMPLOYEE' && (
                    <TabsContent value="organization" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Organization Details</CardTitle>
                                <CardDescription>Manage your organization settings and branding</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="org-name">Organization Name</Label>
                                    <Input id="org-name" defaultValue={user?.organizationName || ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="org-id">Organization ID</Label>
                                    <Input id="org-id" defaultValue={user?.organizationId?.toString() || ''} disabled className="bg-slate-50 border-slate-200 font-mono text-xs" />
                                </div>
                                <Button className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-lg shadow-yellow-600/20 border-none px-8 font-bold">Update Organization</Button>
                            </CardContent>
                        </Card>

                        {user?.role === 'ORG_ADMIN' && <RoleManager />}
                    </TabsContent>
                )}

                {/* PLATFORM TAB - Super Admin Only */}
                {user?.role === 'SUPER_ADMIN' && (
                    <TabsContent value="platform" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Platform Administration</CardTitle>
                                <CardDescription>Manage platform-wide settings and configurations</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-yellow-50/50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-900 font-bold uppercase tracking-tighter italic">
                                        🚀 Platform features coming soon: Subscription Manager, Role Manager, System Health Dashboard
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Card className="border-yellow-200 bg-yellow-50/5">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Organizations</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-3xl font-black text-yellow-700">2</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-yellow-200 bg-yellow-50/5">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Users</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-3xl font-black text-yellow-700">3</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {/* NOTIFICATIONS TAB - All Users */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>Choose how you want to be notified</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Email Notifications</p>
                                    <p className="text-sm text-slate-500">Receive updates via email</p>
                                </div>
                                <Button variant="outline" size="sm">Enable</Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Lead Assignments</p>
                                    <p className="text-sm text-slate-500">Get notified when leads are assigned to you</p>
                                </div>
                                <Button variant="outline" size="sm">Enable</Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">System Updates</p>
                                    <p className="text-sm text-slate-500">Important platform announcements</p>
                                </div>
                                <Button variant="outline" size="sm">Enable</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
