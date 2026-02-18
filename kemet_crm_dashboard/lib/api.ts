import { toast } from 'sonner';

const API_URL = 'http://localhost:4000/api';

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
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body),
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
