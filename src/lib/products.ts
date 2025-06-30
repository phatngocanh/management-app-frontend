import { api } from "@/lib/axios";
import {
    ApiResponse,
    CreateProductBomRequest,
    CreateProductRequest,
    GetAllInventoryHistoriesResponse,
    GetAllProductBomsResponse,
    GetAllProductsResponse,
    GetOneProductBomResponse,
    GetOneProductResponse,
    InventoryHistoryResponse,
    InventoryResponse,
    ProductBomResponse,
    ProductResponse,
    UpdateInventoryQuantityRequest,
    UpdateProductBomRequest,
    UpdateProductRequest,
} from "@/types";

// Product API functions
export const productApi = {
    // Create a new product
    create: async (data: CreateProductRequest): Promise<ProductResponse> => {
        const response = await api.post<ApiResponse<ProductResponse>>("/products", data);
        return response.data.data;
    },

    // Update an existing product
    update: async (data: UpdateProductRequest): Promise<ProductResponse> => {
        const response = await api.put<ApiResponse<ProductResponse>>("/products", data);
        return response.data.data;
    },

    // Get all products
    getAll: async (categoryIds?: number[]): Promise<ProductResponse[]> => {
        let url = "/products";
        if (categoryIds && categoryIds.length > 0) {
            const categoryParam = categoryIds.join(",");
            url += `?category=${categoryParam}`;
        }
        const response = await api.get<ApiResponse<GetAllProductsResponse>>(url);
        return response.data.data.products;
    },

    // Get a single product by ID
    getOne: async (id: number): Promise<ProductResponse> => {
        const response = await api.get<ApiResponse<GetOneProductResponse>>(`/products/${id}`);
        return response.data.data.product;
    },

    // Get inventory by product ID
    getInventory: async (productId: number): Promise<InventoryResponse> => {
        const response = await api.get<ApiResponse<InventoryResponse>>(`/products/${productId}/inventories`);
        return response.data.data;
    },

    // Update inventory quantity
    updateInventoryQuantity: async (productId: number, data: UpdateInventoryQuantityRequest): Promise<InventoryResponse> => {
        const response = await api.put<ApiResponse<InventoryResponse>>(`/products/${productId}/inventories/quantity`, data);
        return response.data.data;
    },

    // Get inventory history for a product
    getInventoryHistory: async (productId: number): Promise<InventoryHistoryResponse[]> => {
        const response = await api.get<ApiResponse<GetAllInventoryHistoriesResponse>>(`/products/${productId}/inventories/histories`);
        return response.data.data.inventory_histories;
    },
};

// BOM API functions
export const bomApi = {
    // Create a new BOM
    create: async (data: CreateProductBomRequest): Promise<ProductBomResponse> => {
        const response = await api.post<ApiResponse<ProductBomResponse>>("/boms", data);
        return response.data.data;
    },

    // Update an existing BOM
    update: async (data: UpdateProductBomRequest): Promise<ProductBomResponse> => {
        const response = await api.put<ApiResponse<ProductBomResponse>>("/boms", data);
        return response.data.data;
    },

    // Get all BOMs
    getAll: async (): Promise<ProductBomResponse[]> => {
        const response = await api.get<ApiResponse<GetAllProductBomsResponse>>("/boms");
        return response.data.data.boms;
    },

    // Get BOM by parent product ID
    getByParentProductId: async (parentProductId: number): Promise<ProductBomResponse> => {
        const response = await api.get<ApiResponse<GetOneProductBomResponse>>(`/boms/parent/${parentProductId}`);
        return response.data.data.bom;
    },

    // Get BOMs by component product ID
    getByComponentProductId: async (componentProductId: number): Promise<ProductBomResponse[]> => {
        const response = await api.get<ApiResponse<GetAllProductBomsResponse>>(`/boms/component/${componentProductId}`);
        return response.data.data.boms;
    },

    // Delete BOM by parent product ID
    deleteByParentProductId: async (parentProductId: number): Promise<void> => {
        await api.delete(`/boms/parent/${parentProductId}`);
    },
};

export default productApi; 