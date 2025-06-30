import { api } from "@/lib/axios";
import {
    ApiResponse,
    CreateOrderRequest,
    GetAllOrdersResponse,
    GetOneOrderResponse,
    UpdateOrderRequest,
} from "@/types";

export interface OrderFilters {
    customer_id?: number;
    delivery_statuses?: string; // comma-separated statuses like "PENDING,DELIVERED"
    sort_by?: string; // order_date_asc, order_date_desc
}

export const ordersApi = {
    // Create a new order
    create: async (data: CreateOrderRequest) => {
        const response = await api.post("/orders", data);
        return response.data;
    },

    // Update an existing order
    update: async (orderId: number, data: UpdateOrderRequest) => {
        const response = await api.put(`/orders/${orderId}`, data);
        return response.data;
    },

    // Get all orders with optional filters
    getAll: async (filters?: OrderFilters) => {
        const params = new URLSearchParams();
        if (filters?.customer_id) {
            params.append('customer_id', filters.customer_id.toString());
        }
        if (filters?.delivery_statuses) {
            params.append('delivery_statuses', filters.delivery_statuses);
        }
        if (filters?.sort_by) {
            params.append('sort_by', filters.sort_by);
        }
        
        const queryString = params.toString();
        const url = queryString ? `/orders?${queryString}` : '/orders';
        const response = await api.get<ApiResponse<GetAllOrdersResponse>>(url);
        return response.data.data;
    },

    // Get order by ID
    getOne: async (orderId: number) => {
        const response = await api.get<ApiResponse<GetOneOrderResponse>>(`/orders/${orderId}`);
        return response.data.data;
    },

    // Delete order by ID
    delete: async (orderId: number) => {
        const response = await api.delete(`/orders/${orderId}`);
        return response.data;
    },
}; 