import api from "./api";

export const meetingService = {
  create: (data) => api.post("/api/meetings", data),
  list: () => api.get("/api/meetings"),
  get: (id) => api.get(`/api/meetings/${id}`),
  updateStatus: (id, status) => api.patch(`/api/meetings/${id}/status`, { status }),
  join: (id, data) => api.post(`/api/meetings/${id}/join`, data),
  end: (id) => api.post(`/api/meetings/${id}/end`),
  getTranscript: (id) => api.get(`/api/transcripts/${id}`),
  getAnalysis: (id) => api.get(`/api/analysis/${id}`),
  generateAnalysis: (id) => api.post(`/api/analysis/${id}/generate`),
  uploadRecording: (id, formData) =>
    api.post(`/api/files/upload/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    }),
  getFileUrl: (fileId) =>
    `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/files/${fileId}`,
};
