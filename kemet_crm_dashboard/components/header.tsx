'use client';

import { useAuth } from '@/context/AuthContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bell, Search, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from '@/components/sidebar';

export function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="sticky top-0 z-40 flex items-center h-16 px-8 bg-[#0E1624]/80 backdrop-blur-xl border-b border-[#1B2A40] sm:px-10">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="mr-2 lg:hidden text-[#8A93A5] hover:text-[#E6EAF0]">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 border-r border-[#1B2A40] bg-[#070B14]">
                    <Sidebar />
                </SheetContent>
            </Sheet>

            <div className="flex items-center flex-1">
                <div className="relative w-full max-w-sm hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A93A5]" />
                    <input
                        type="search"
                        placeholder="Search engine..."
                        className="w-full pl-10 pr-4 py-2 text-sm bg-[#111C2E] border border-[#1B2A40] rounded-lg text-[#E6EAF0] placeholder:text-[#8A93A5] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-6">
                <Button variant="ghost" size="icon" className="text-[#8A93A5] hover:text-[#D4AF37] hover:bg-[#111C2E] relative transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#D4AF37] rounded-full ring-2 ring-[#0E1624]" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-[#1B2A40] hover:border-[#D4AF37] p-0 overflow-hidden transition-all">
                            <Avatar className="h-full w-full">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-[#111C2E] text-[#D4AF37] font-black italic">
                                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 bg-[#111C2E] border-[#1B2A40] text-[#E6EAF0] shadow-2xl">
                        <DropdownMenuLabel className="p-4">
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold tracking-tight">{user?.name || 'User'}</p>
                                    <span className="text-[10px] font-black bg-[#D4AF37] text-[#070B14] px-2 py-0.5 rounded italic">
                                        {user?.role?.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-xs text-[#8A93A5] font-medium">{user?.email}</p>
                                {user?.organizationName && (
                                    <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest pt-2 border-t border-[#1B2A40] mt-1">
                                        {user.organizationName}
                                    </p>
                                )}
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-[#1B2A40]" />
                        <DropdownMenuItem className="hover:bg-[#1B2A40] focus:bg-[#1B2A40] cursor-pointer text-sm font-medium py-2.5">Profile Settings</DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-[#1B2A40] focus:bg-[#1B2A40] cursor-pointer text-sm font-medium py-2.5">Security</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[#1B2A40]" />
                        <DropdownMenuItem className="text-[#E5484D] focus:text-[#E5484D] hover:bg-red-950/20 focus:bg-red-950/20 cursor-pointer text-sm font-bold py-2.5" onClick={() => logout()}>
                            Logout Engine
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
