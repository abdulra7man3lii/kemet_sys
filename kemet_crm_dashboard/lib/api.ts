import { toast } from 'sonner';

const getApiUrl = () => {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;
};

const API_URL = getApiUrl();

const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const errorText = await res.text();
        let message = 'An unexpected error occurred';
        try {
            const errorJson = JSON.parse(errorText);
            message = errorJson.message || message;
        } catch {
            message = errorText || message;
        }

        toast.error(message);
        throw new Error(message);
    }
    return res.json();
}

export const api = {
    get: async <T>(endpoint: string): Promise<T> => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers: getHeaders(),
        });
        return handleResponse<T>(res);
    },

    post: async <T>(endpoint: string, body: any): Promise<T> => {
        const isFormData = body instanceof FormData;
        const headers = { ...getHeaders() };
        if (isFormData) {
            delete (headers as any)['Content-Type'];
        }

        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: headers,
            body: isFormData ? body : JSON.stringify(body),
        });
        return handleResponse<T>(res);
    },

    put: async <T>(endpoint: string, body: any): Promise<T> => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        return handleResponse<T>(res);
    },

    delete: async (endpoint: string): Promise<void> => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!res.ok) {
            const errorText = await res.text();
            toast.error(errorText || 'Failed to delete');
            throw new Error(errorText);
        }
    },
};
