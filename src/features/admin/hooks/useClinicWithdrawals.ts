import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  adminClinicWithdrawalsApi,
  ListAdminWithdrawalsQuery,
  MarkPaidDto,
  RejectWithdrawalDto,
} from "../api/admin-clinic-withdrawals.api";
import { toast } from "sonner";

export function useAdminClinicWithdrawals(query?: ListAdminWithdrawalsQuery) {
  return useQuery({
    queryKey: ["admin-clinic-withdrawals", query],
    queryFn: async () => {
      const res = await adminClinicWithdrawalsApi.listWithdrawals(query);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useMarkWithdrawalPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: MarkPaidDto }) =>
      adminClinicWithdrawalsApi.markPaid(id, dto),
    onSuccess: () => {
      toast.success("Xác nhận đã chuyển khoản thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-clinic-withdrawals"] });
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      const msg =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message || (err as Error)?.message;
      if (status === 400 || (msg && msg.includes("already"))) {
        toast.error(
          "Yêu cầu này đã được xử lý bởi người khác. Hệ thống đã làm mới dữ liệu.",
        );
        queryClient.invalidateQueries({
          queryKey: ["admin-clinic-withdrawals"],
        });
      } else {
        toast.error(msg || "Không thể chuyển trạng thái Đã chuyển khoản.");
      }
    },
  });
}

export function useRejectWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: RejectWithdrawalDto }) =>
      adminClinicWithdrawalsApi.reject(id, dto),
    onSuccess: () => {
      toast.success(
        "Đã từ chối yêu cầu rút tiền. Tiền đã được hoàn lại vào ví phòng khám.",
      );
      queryClient.invalidateQueries({ queryKey: ["admin-clinic-withdrawals"] });
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      const msg =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message || (err as Error)?.message;
      if (status === 400 || (msg && msg.includes("already"))) {
        toast.error(
          "Yêu cầu này đã được xử lý bởi người khác. Hệ thống đã làm mới dữ liệu.",
        );
        queryClient.invalidateQueries({
          queryKey: ["admin-clinic-withdrawals"],
        });
      } else {
        toast.error(msg || "Không thể từ chối yêu cầu rút tiền.");
      }
    },
  });
}
