export interface Customer {
    id: number;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    status: 'LEAD' | 'PROSPECT' | 'CUSTOMER' | 'CHURNED';
    createdAt: string;
    updatedAt: string;
    createdById: number;
    createdBy?: { name?: string; email: string };
    handlers?: User[];
    internalNotes?: InternalNote[];
}

export interface Interaction {
    id: number;
    type: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE';
    notes?: string;
    date: string;
    customerId: number;
    userId: number;
    user?: { name?: string; email: string };
}

export interface InternalNote {
    id: number;
    content: string;
    createdAt: string;
    customerId: number;
    userId: number;
    user?: { name?: string; email: string };
}

export interface User {
    id: number;
    email: string;
    name?: string;
    token?: string;
    role?: string; // Changed to string to support custom roles
    roleId?: number;
    organizationId?: number;
    organizationName?: string;
}

export interface Permission {
    id: number;
    action: string;
    subject: string;
    description?: string;
}

export interface Role {
    id: number;
    name: string;
    description?: string;
    isGlobal: boolean;
    organizationId?: number;
    permissions: Permission[];
    _count?: {
        users: number;
    };
}

export interface Organization {
    id: number;
    name: string;
    createdAt: string;
}
