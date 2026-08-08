"use client";

import { useQuery } from "@tanstack/react-query";

import { reportService, type ReportFilters } from "@/lib/api/services/report.service";
import { queryKeys } from "@/lib/query-keys";

export function useSalesReport(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: queryKeys.reports.sales(filters),
    queryFn: () => reportService.sales(filters),
  });
}

export function useOrderReport(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: queryKeys.reports.orders(filters),
    queryFn: () => reportService.orders(filters),
  });
}

export function useProductReport(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: queryKeys.reports.products(filters),
    queryFn: () => reportService.products(filters),
  });
}

export function useStockReport(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: queryKeys.reports.stock(filters),
    queryFn: () => reportService.stock(filters),
  });
}
