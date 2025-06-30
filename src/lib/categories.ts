import { api } from "@/lib/axios";
import {
    ApiResponse,
    CreateProductCategoryRequest,
    UpdateProductCategoryRequest,
    GetAllProductCategoriesResponse,
    GetOneProductCategoryResponse,
    ProductCategoryResponse,
} from "@/types";

// Category API functions
export const categoryApi = {
    // Create a new category
    create: async (data: CreateProductCategoryRequest): Promise<ProductCategoryResponse> => {
        const response = await api.post<ApiResponse<ProductCategoryResponse>>("/categories", data);
        return response.data.data;
    },

    // Update an existing category
    update: async (data: UpdateProductCategoryRequest): Promise<ProductCategoryResponse> => {
        const response = await api.put<ApiResponse<ProductCategoryResponse>>("/categories", data);
        return response.data.data;
    },

    // Get all categories
    getAll: async (): Promise<ProductCategoryResponse[]> => {
        const response = await api.get<ApiResponse<GetAllProductCategoriesResponse>>("/categories");
        return response.data.data.categories;
    },

    // Get a single category by ID
    getOne: async (id: number): Promise<ProductCategoryResponse> => {
        const response = await api.get<ApiResponse<GetOneProductCategoryResponse>>(`/categories/${id}`);
        return response.data.data.category;
    },

    // Get a single category by code
    getByCode: async (code: string): Promise<ProductCategoryResponse> => {
        const response = await api.get<ApiResponse<GetOneProductCategoryResponse>>(`/categories/code/${code}`);
        return response.data.data.category;
    },
};

export default categoryApi; 