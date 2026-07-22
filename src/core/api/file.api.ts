import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import type { FileAttachment, FileStorageType } from "./types";

export const fileApi = {
  uploadFiles: async (
    files: File[],
    storageType: FileStorageType,
  ): Promise<FileAttachment[]> => {
    const formData = new FormData();

    for (const file of files) {
      formData.append("files", file);
    }

    formData.append("storageType", storageType);

    const response = await apiClient.post<FileAttachment[]>(
      API_ENDPOINTS.FILES.UPLOAD,
      formData,
    );

    return response.data;
  },
};
