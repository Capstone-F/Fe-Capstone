"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Search,
  Power,
  RefreshCw,
  Edit2,
  Loader2,
  CheckCircle,
  XCircle,
  HelpCircle,
  Layers,
} from "lucide-react";
import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination";

export interface SurveyOption {
  id?: string;
  text: string;
  score: number;
  baumannDimension?: string;
}

export interface SurveyQuestion {
  id: string;
  code: string;
  title?: string;
  text?: string;
  category?: string;
  order?: number;
  displayOrder?: number;
  isActive: boolean;
  options?: SurveyOption[];
  createdAt?: string;
  updatedAt?: string;
}

export function SurveyQuestionsView() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(
    null,
  );

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    category: "BAUMANN",
    order: 1,
  });

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["admin-survey-questions", { q: searchTerm, activeOnly }],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (searchTerm.trim()) params.q = searchTerm.trim();
      if (activeOnly) params.activeOnly = "true";
      const res = await apiClient.get<SurveyQuestion[]>(
        API_ENDPOINTS.ADMIN_SURVEY_QUESTIONS.LIST,
        { params },
      );
      const list = Array.isArray(res.data)
        ? res.data
        : (res.data as unknown as { items: SurveyQuestion[] })?.items || [];
      return list;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: typeof formData) =>
      apiClient.post(API_ENDPOINTS.ADMIN_SURVEY_QUESTIONS.CREATE, body),
    onSuccess: () => {
      toast.success("Thêm câu hỏi khảo sát mới thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-survey-questions"] });
      closeModal();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể tạo câu hỏi khảo sát";
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<SurveyQuestion> }) =>
      apiClient.patch(API_ENDPOINTS.ADMIN_SURVEY_QUESTIONS.UPDATE(id), body),
    onSuccess: () => {
      toast.success("Cập nhật thông tin câu hỏi thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-survey-questions"] });
      closeModal();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể cập nhật câu hỏi";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(API_ENDPOINTS.ADMIN_SURVEY_QUESTIONS.DELETE(id)),
    onSuccess: () => {
      toast.success("Đã vô hiệu hóa câu hỏi khảo sát!");
      queryClient.invalidateQueries({ queryKey: ["admin-survey-questions"] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể vô hiệu hóa câu hỏi";
      toast.error(msg);
    },
  });

  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormData({ code: "", title: "", category: "BAUMANN", order: 1 });
    setIsModalOpen(true);
  };

  const openEditModal = (q: SurveyQuestion) => {
    setEditingQuestion(q);
    setFormData({
      code: q.code || "",
      title: q.title || "",
      category: q.category || "BAUMANN",
      order: q.order || 1,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingQuestion(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.code.trim()) {
      toast.error("Vui lòng nhập Mã câu hỏi và Nội dung câu hỏi.");
      return;
    }

    if (editingQuestion) {
      updateMutation.mutate({ id: editingQuestion.id, body: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleToggleStatus = (q: SurveyQuestion) => {
    if (q.isActive) {
      deleteMutation.mutate(q.id);
    } else {
      updateMutation.mutate({ id: q.id, body: { isActive: true } });
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const questions = data || [];
  const totalQuestions = questions.length;
  const totalPages = Math.max(1, Math.ceil(totalQuestions / pageSize));
  const paginatedQuestions = questions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Action Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E2EBE6] text-[#2C3E35] dark:bg-emerald-950 dark:text-emerald-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Ngân Hàng Câu Hỏi Khảo Sát Da Liễu
            </h2>
            <p className="text-xs text-slate-500">
              Quản lý bộ câu hỏi chuẩn hóa Baumann Skin Typing, thang điểm và
              các lựa chọn đáp án.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={openCreateModal}
            className="rounded-xl bg-[#2C3E35] px-4 text-xs font-bold text-white shadow-xs hover:bg-[#3A5246]"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Thêm Câu Hỏi Mới
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Questions Table — Search & Filter inside Card header */}
      <Card className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Embedded Search & Filter bar */}
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-800/40">
          <div className="relative w-full sm:w-72">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm theo mã hoặc tiêu đề câu hỏi..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border-slate-200 pl-9 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveOnly((prev) => !prev);
                setCurrentPage(1);
              }}
              className={`rounded-full px-4 text-xs font-bold transition-all ${
                activeOnly
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              {activeOnly ? "✓ Đang kích hoạt" : "Tất cả câu hỏi"}
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-xs text-slate-500">
              <Loader2 className="mb-2 h-6 w-6 animate-spin text-[#2C3E35]" />
              Đang tải ngân hàng câu hỏi...
            </div>
          ) : paginatedQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-12 text-center text-xs text-slate-500">
              <HelpCircle className="h-10 w-10 text-slate-300" />
              <span className="text-sm font-bold text-slate-700">
                Chưa có câu hỏi nào
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 font-bold text-slate-700">
                        STT
                      </th>
                      <th className="px-4 py-3 font-bold text-slate-700">Mã</th>
                      <th className="px-4 py-3 font-bold text-slate-700">
                        Nội Dung Câu Hỏi
                      </th>
                      <th className="px-4 py-3 font-bold text-slate-700">
                        Phân Loại
                      </th>
                      <th className="px-4 py-3 font-bold text-slate-700">
                        Trạng Thái
                      </th>
                      <th className="px-4 py-3 text-right font-bold text-slate-700">
                        Thao Tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedQuestions.map((q) => (
                      <tr
                        key={q.id}
                        className={`transition-colors hover:bg-slate-50/70 ${
                          !q.isActive ? "bg-slate-50/50 opacity-60" : ""
                        }`}
                      >
                        <td className="p-4 font-mono font-bold text-slate-500">
                          #{q.displayOrder ?? q.order ?? 1}
                        </td>

                        <td className="p-4 font-mono font-bold text-[#2C3E35] dark:text-emerald-400">
                          {q.code}
                        </td>

                        <td className="max-w-xs p-4 font-bold text-slate-900 dark:text-white">
                          {q.text || q.title || "Chưa có nội dung"}
                        </td>

                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                            <Layers className="h-3 w-3 text-slate-400" />
                            {q.category || "BAUMANN"}
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              q.isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {q.isActive ? (
                              <>
                                <CheckCircle className="h-3 w-3" /> Hoạt động
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3" /> Đã vô hiệu hóa
                              </>
                            )}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(q)}
                              className="h-8 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                            >
                              <Edit2 className="mr-1 h-3.5 w-3.5" /> Sửa
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(q)}
                              className={`h-8 rounded-xl text-xs font-bold ${
                                q.isActive
                                  ? "border-rose-200 text-rose-600 hover:bg-rose-50"
                                  : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              }`}
                            >
                              <Power className="mr-1 h-3.5 w-3.5" />
                              {q.isActive ? "Vô hiệu hóa" : "Khôi phục"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="border-t border-slate-100 p-4">
                <DataTablePagination
                  page={currentPage}
                  totalPages={totalPages}
                  totalItems={totalQuestions}
                  pageSize={pageSize}
                  onPageChange={(p) => setCurrentPage(p)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-md rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="space-y-2 border-b border-slate-100 pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[#2C3E35]">
              <FileText className="h-5 w-5 text-[#2C3E35]" />
              {editingQuestion
                ? "Chỉnh sửa Câu Hỏi Khảo Sát"
                : "Thêm Câu Hỏi Mới"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Nhập mã định danh, thứ tự hiển thị và nội dung câu hỏi.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="code"
                  className="text-xs font-bold text-slate-700"
                >
                  Mã Câu Hỏi *:
                </Label>
                <Input
                  id="code"
                  required
                  placeholder="VD: Q_OILINESS_1"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="rounded-xl border-slate-200 font-mono text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="order"
                  className="text-xs font-bold text-slate-700"
                >
                  Thứ Tự Hiển Thị:
                </Label>
                <Input
                  id="order"
                  type="number"
                  min={1}
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="rounded-xl border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="title"
                className="text-xs font-bold text-slate-700"
              >
                Nội Dung Câu Hỏi *:
              </Label>
              <Input
                id="title"
                required
                placeholder="VD: Sau khi rửa mặt 2 tiếng, da bạn có cảm giác căng hay bóng dầu?"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <DialogFooter className="gap-2 border-t border-slate-100 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                className="rounded-xl text-xs font-semibold"
              >
                Quay lại
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="rounded-xl bg-[#2C3E35] px-6 text-xs font-bold text-white hover:bg-[#3A5246]"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingQuestion ? (
                  "Lưu Thay Đổi"
                ) : (
                  "Tạo Câu Hỏi"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
