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
    getAll: async (categoryIds?: number[], operationType?: string, noBom?: boolean): Promise<ProductResponse[]> => {
        const params = new URLSearchParams();
        
        if (categoryIds && categoryIds.length > 0) {
            params.append("category", categoryIds.join(","));
        }
        if (operationType) {
            params.append("operationType", operationType);
        }
        if (noBom) {
            params.append("noBom", "true");
        }
        
        const url = `/products${params.toString() ? `?${params.toString()}` : ""}`;
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

// Product Images API functions
export const productImagesApi = {
    // Generate signed upload URL
    generateSignedUploadURL: async (productId: number, fileName: string, contentType: string) => {
        const response = await api.post<ApiResponse<any>>(
            `/products/${productId}/images/upload-url?fileName=${encodeURIComponent(fileName)}&contentType=${encodeURIComponent(contentType)}`
        );
        return response.data.data;
    },

    // Upload an image for a product using signed URL
    uploadImage: async (productId: number, file: File) => {
        // Step 1: Generate signed upload URL
        const signedUrlResponse = await productImagesApi.generateSignedUploadURL(
            productId,
            file.name,
            file.type
        );

        // Step 2: Upload file directly to S3 using the signed URL
        const uploadResponse = await fetch(signedUrlResponse.signed_url, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
            },
        });

        if (!uploadResponse.ok) {
            throw new Error(`Failed to upload file to S3: ${uploadResponse.statusText}`);
        }

        // Step 3: Return the response with the uploaded image info
        return {
            productImage: {
                id: signedUrlResponse.image_id,
                product_id: productId,
                image_url: signedUrlResponse.signed_url,
                image_key: signedUrlResponse.image_key,
            },
        };
    },

    // Delete an image
    deleteImage: async (productId: number, imageId: number) => {
        const response = await api.delete(`/products/${productId}/images/${imageId}`);
        return response.data;
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