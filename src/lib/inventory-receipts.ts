import { api } from "@/lib/axios";
import {
    ApiResponse,
    CreateInventoryReceiptRequest,
    GetAllInventoryReceiptsResponse,
    GetOneInventoryReceiptResponse,
    InventoryReceiptResponse,
} from "@/types";

export const inventoryReceiptApi = {
    // Create a new inventory receipt
    create: async (data: CreateInventoryReceiptRequest): Promise<InventoryReceiptResponse> => {
        const response = await api.post<ApiResponse<InventoryReceiptResponse>>("/inventory-receipts", data);
        return response.data.data;
    },

    // Get all inventory receipts
    getAll: async (): Promise<InventoryReceiptResponse[]> => {
        const response = await api.get<ApiResponse<GetAllInventoryReceiptsResponse>>("/inventory-receipts");
        return response.data.data.inventory_receipts;
    },

    // Get a single inventory receipt by code
    getOne: async (code: string): Promise<InventoryReceiptResponse> => {
        const response = await api.get<ApiResponse<GetOneInventoryReceiptResponse>>(`/inventory-receipts/${code}`);
        return response.data.data.inventory_receipt;
    },
};

export default inventoryReceiptApi; 