type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiRequestOptions {
    method?: RequestMethod;
    body?: any;
    headers?: Record<string, string>;
}

async function fetchApi<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const config: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`/api${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }

    return data;
}

export const api = {
    properties: {
        list: (params?: any) => {
            const searchParams = new URLSearchParams(params).toString();
            return fetchApi<{ properties: any[] }>(`/properties?${searchParams}`);
        },
        get: (id: string) => fetchApi<{ property: any }>(`/properties/${id}`),
        create: (data: any) => fetchApi<{ property: any }>('/properties', { method: 'POST', body: data }),
        update: (id: string, data: any) => fetchApi<{ property: any }>(`/properties/${id}`, { method: 'PUT', body: data }),
        delete: (id: string) => fetchApi<{ success: boolean }>(`/properties/${id}`, { method: 'DELETE' }),
    },
    leads: {
        list: (status?: string) => {
            const searchParams = status ? `?status=${status}` : '';
            return fetchApi<{ leads: any[] }>(`/leads${searchParams}`);
        },
        create: (data: any) => fetchApi<{ lead: any }>('/leads', { method: 'POST', body: data }),
        update: (id: string, data: any) => fetchApi<{ lead: any }>(`/leads/${id}`, { method: 'PATCH', body: data }),
        delete: (id: string) => fetchApi<{ success: boolean }>(`/leads/${id}`, { method: 'DELETE' }),
    },
    blog: {
        list: (params?: any) => {
            const searchParams = new URLSearchParams(params).toString();
            return fetchApi<{ posts: any[] }>(`/blog?${searchParams}`);
        },
        get: (id: string) => fetchApi<{ post: any }>(`/blog/${id}`),
        create: (data: any) => fetchApi<{ post: any }>('/blog', { method: 'POST', body: data }),
        update: (id: string, data: any) => fetchApi<{ post: any }>(`/blog/${id}`, { method: 'PUT', body: data }),
        delete: (id: string) => fetchApi<{ success: boolean }>(`/blog/${id}`, { method: 'DELETE' }),
    },
    contact: {
        submit: (data: any) => fetchApi<{ success: boolean; message: string }>('/contact', { method: 'POST', body: data }),
    },
};
