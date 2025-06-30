import { api } from "@/lib/axios";
import {
    ApiResponse,
    CreateUnitOfMeasureRequest,
    GetAllUnitsOfMeasureResponse,
    GetOneUnitOfMeasureResponse,
    UnitOfMeasureResponse,
    UpdateUnitOfMeasureRequest,
} from "@/types";

// Unit API functions
export const unitApi = {
    // Create a new unit
    create: async (data: CreateUnitOfMeasureRequest): Promise<UnitOfMeasureResponse> => {
        const response = await api.post<ApiResponse<UnitOfMeasureResponse>>("/units", data);
        return response.data.data;
    },

    // Update an existing unit
    update: async (data: UpdateUnitOfMeasureRequest): Promise<UnitOfMeasureResponse> => {
        const response = await api.put<ApiResponse<UnitOfMeasureResponse>>("/units", data);
        return response.data.data;
    },

    // Get all units
    getAll: async (): Promise<UnitOfMeasureResponse[]> => {
        const response = await api.get<ApiResponse<GetAllUnitsOfMeasureResponse>>("/units");
        return response.data.data.units;
    },

    // Get a single unit by ID
    getOne: async (id: number): Promise<UnitOfMeasureResponse> => {
        const response = await api.get<ApiResponse<GetOneUnitOfMeasureResponse>>(`/units/${id}`);
        return response.data.data.unit;
    },

    // Get a single unit by code
    getByCode: async (code: string): Promise<UnitOfMeasureResponse> => {
        const response = await api.get<ApiResponse<GetOneUnitOfMeasureResponse>>(`/units/code/${code}`);
        return response.data.data.unit;
    },
};

export default unitApi; 