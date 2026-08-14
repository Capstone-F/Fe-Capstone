import { useMutation } from "@tanstack/react-query";
import { adminDemoApi } from "../api/admin-demo.api";
import type { SeedDemoCustomerPayload } from "../types/demo-customer.types";

export function useSeedDemoCustomer() {
  return useMutation({
    mutationFn: async (payload: SeedDemoCustomerPayload) =>
      (await adminDemoApi.seedCustomer(payload)).data,
  });
}
