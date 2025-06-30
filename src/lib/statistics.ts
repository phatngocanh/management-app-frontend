import { api } from './axios';

export interface DashboardStats {
  total_products: number;
  total_customers: number;
  total_inventory_items: number;
  low_stock_products: number;
  total_orders: number;
  pending_orders: number;
}

export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
  errors: any[] | null;
}

export const statisticsApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStatsResponse>('/statistics/dashboard');
    return response.data.data;
  },
}; 