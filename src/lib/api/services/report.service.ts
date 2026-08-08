import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import type {
  OrderReport,
  ProductReport,
  SalesReport,
  StockReport,
} from "@/types/report";

export interface ReportFilters {
  from?: string;
  to?: string;
  source?: string;
  warehouse_id?: number;
  limit?: number;
}

export const reportService = {
  async sales(filters: ReportFilters = {}): Promise<SalesReport> {
    const { data } = await apiClient.get<{ data: SalesReport }>(
      API_ENDPOINTS.reports.sales,
      { params: filters }
    );
    return data.data;
  },

  async orders(filters: ReportFilters = {}): Promise<OrderReport> {
    const { data } = await apiClient.get<{ data: OrderReport }>(
      API_ENDPOINTS.reports.orders,
      { params: filters }
    );
    return data.data;
  },

  async products(filters: ReportFilters = {}): Promise<ProductReport> {
    const { data } = await apiClient.get<{ data: ProductReport }>(
      API_ENDPOINTS.reports.products,
      { params: filters }
    );
    return data.data;
  },

  async stock(filters: ReportFilters = {}): Promise<StockReport> {
    const { data } = await apiClient.get<{ data: StockReport }>(
      API_ENDPOINTS.reports.stock,
      { params: filters }
    );
    return data.data;
  },
};
