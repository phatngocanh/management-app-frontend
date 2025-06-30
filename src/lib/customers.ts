import { api } from "@/lib/axios";
import {
    ApiResponse,
    CreateCustomerRequest,
    CustomerResponse,
    GetAllCustomersResponse,
    GetOneCustomerResponse,
    UpdateCustomerRequest,
} from "@/types";

// Customer API functions
export const customerApi = {
    // Create a new customer
    create: async (data: CreateCustomerRequest): Promise<CustomerResponse> => {
        const response = await api.post<ApiResponse<CustomerResponse>>("/customers", data);
        return response.data.data;
    },

    // Update an existing customer
    update: async (id: number, data: UpdateCustomerRequest): Promise<CustomerResponse> => {
        const response = await api.put<ApiResponse<CustomerResponse>>(`/customers/${id}`, data);
        return response.data.data;
    },

    // Get all customers
    getAll: async (): Promise<CustomerResponse[]> => {
        const response = await api.get<ApiResponse<GetAllCustomersResponse>>("/customers");
        return response.data.data.customers;
    },

    // Get a single customer by ID
    getOne: async (id: number): Promise<CustomerResponse> => {
        const response = await api.get<ApiResponse<GetOneCustomerResponse>>(`/customers/${id}`);
        return response.data.data.customer;
    },
};

export default customerApi; 