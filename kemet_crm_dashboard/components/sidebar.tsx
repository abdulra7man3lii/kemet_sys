'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    CheckSquare,
    MessageSquare,
    Palette,
    Eraser,
    Shield,
    Mail,
    Globe,
    Calendar as CalendarIcon,
    HardDrive,
    List,
    DollarSign,
    ChevronDown,
    ChevronRight,
    PieChart
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
    name: string;
    href: string;
    icon: any;
    roles?: string[];
}

interface NavGroup {
    group: string;
    items: NavItem[];
    roles?: string[];
}

const navigationGroups: NavGroup[] = [
    {
        group: 'Main',
        items: [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        ]
    },
    {
        group: 'Platform Admin',
        items: [
            { name: 'Organization Manager', href: '/admin', icon: Globe },
        ],
        roles: ['SUPER_ADMIN']
    },
    {
        group: 'Marketing Engine',
        items: [
            { name: 'WhatsApp', href: '/dashboard/marketing/whatsapp', icon: MessageSquare },
            { name: 'Social Media', href: '/dashboard/marketing/social', icon: Globe },
            { name: 'Email Campaigns', href: '/dashboard/marketing/email', icon: Mail },
        ],
        roles: ['ORG_ADMIN', 'SUPER_ADMIN']
    },
    {
        group: 'CRM Operations',
        items: [
            { name: 'Leads', href: '/dashboard/customers', icon: Users },
            { name: 'Tasks', href: '/dashboard/crm/tasks', icon: CheckSquare },
            { name: 'Calendar', href: '/dashboard/crm/calendar', icon: CalendarIcon },
            { name: 'Drive', href: '/dashboard/crm/drive', icon: HardDrive },
        ]
    },
    {
        group: 'Data Laundry',
        items: [
            { name: 'Database Lists', href: '/dashboard/laundry/contacts', icon: List },
        ],
        roles: ['ORG_ADMIN', 'SUPER_ADMIN', 'EMPLOYEE']
    },
    {
        group: 'Business Hub',
        items: [
            { name: 'Finance', href: '/dashboard/finance', icon: DollarSign },
            { name: 'Team Hub', href: '/dashboard/team', icon: Shield },
        ],
        roles: ['ORG_ADMIN', 'SUPER_ADMIN']
    }
];

const secondaryNavigation = [
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    // Filter groups and items based on role
    const filteredGroups = navigationGroups.map(group => {
        const userRole = user?.role || 'EMPLOYEE';

        // If group has restricted roles, check if user has access
        const hasGroupAccess = !group.roles || group.roles.includes(userRole);

        if (!hasGroupAccess) return { ...group, items: [] };

        return {
            ...group,
            items: group.items.filter(item => {
                // If item has restricted roles, check if user has access
                if (item.roles && !item.roles.includes(userRole)) return false;

                // Flexible rule: Org Admins and Super Admins see everything.
                // All other roles (custom or standard) see the restricted agent view.
                if (userRole !== 'SUPER_ADMIN' && userRole !== 'ORG_ADMIN') {
                    return ['Dashboard', 'Leads', 'Database Lists', 'Tasks'].includes(item.name);
                }
                return true;
            })
        };
    }).filter(group => group.items.length > 0);

    return (
        <div className={cn("flex flex-col h-full bg-[#070B14] border-r border-[#1B2A40] w-64 shadow-2xl relative z-50", className)}>
            <div className="flex items-center h-20 px-8 border-b border-[#1B2A40]">
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-[#D4AF37] tracking-tighter uppercase font-serif italic">KEMET</span>
                    {user?.organizationName && (
                        <span className="text-[10px] font-bold text-[#8A93A5] uppercase tracking-widest truncate max-w-[180px] mt-0.5">
                            {user.organizationName}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-8 px-4 space-y-10 custom-scrollbar">
                {filteredGroups.map((group) => (
                    <div key={group.group} className="space-y-4">
                        {group.group !== 'Main' && (
                            <h3 className="px-5 text-[10px] font-bold text-[#8A93A5] uppercase tracking-[0.2em] opacity-80">
                                {group.group}
                            </h3>
                        )}
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group relative",
                                            isActive
                                                ? "bg-[#111C2E] text-[#D4AF37]"
                                                : "text-[#8A93A5] hover:bg-white/5 hover:text-[#E6EAF0]"
                                        )}
                                    >
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 bg-[#D4AF37] rounded-r-full" />
                                        )}
                                        <item.icon className={cn(
                                            "mr-4 h-5 w-5 transition-transform duration-200 group-hover:scale-105",
                                            isActive ? "text-[#D4AF37]" : "text-[#8A93A5] group-hover:text-[#E6EAF0]"
                                        )} />
                                        <span className="tracking-tight">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-yellow-900/20 p-4 space-y-2">
                {secondaryNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
                                isActive
                                    ? "bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 text-yellow-500 border border-yellow-600/30"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-yellow-600/10"
                            )}
                        >
                            <item.icon className="h-4 w-4 mr-3" />
                            {item.name}
                        </Link>
                    );
                })}
                <button
                    onClick={logout}
                    className="flex items-center px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 w-full text-slate-400 hover:bg-red-950/20 hover:text-red-400 border border-transparent hover:border-red-600/20"
                >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                </button>
            </div>
        </div>
    );
}
