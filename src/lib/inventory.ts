import { GetAllInventoryResponse, InventoryResponse, UpdateInventoryQuantityRequest } from '@/types';

import { api } from './axios';

export const inventoryApi = {
  getAll: async (): Promise<GetAllInventoryResponse> => {
    const response = await api.get<{ success: boolean; data: GetAllInventoryResponse }>('/inventory');
    return response.data.data;
  },

  getByProductId: async (productId: number): Promise<InventoryResponse> => {
    const response = await api.get<{ success: boolean; data: InventoryResponse }>(`/products/${productId}/inventories`);
    return response.data.data;
  },

  updateQuantity: async (productId: number, request: UpdateInventoryQuantityRequest): Promise<InventoryResponse> => {
    const response = await api.put<{ success: boolean; data: InventoryResponse }>(`/products/${productId}/inventories/quantity`, request);
    return response.data.data;
  },
}; 