import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

import { auth } from "@/lib/auth";

// Create axios instance with default config
// Set NEXT_PUBLIC_API_URL in .env.local file (e.g., http://localhost:8080/api/v1)
const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = auth.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        // Handle 401 errors by redirecting to login
        if (error.response?.status === 401) {
            auth.logout();
        }
        return Promise.reject(error);
    },
);

// API methods
export const api = {
    // POST request for login
    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiClient.post<T>(url, data, config),
    
    // PUT request
    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
        apiClient.put<T>(url, data, config),
    
    // GET request
    get: <T = any>(url: string, config?: AxiosRequestConfig) =>
        apiClient.get<T>(url, config),
    
    // DELETE request
    delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
        apiClient.delete<T>(url, config),
};

export default apiClient;
