import { config } from "./config";
import { useAuthStore } from "@/store/auth/auth.store";

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${config.backendUrl}${endpoint}`;
  const token = useAuthStore.getState().token;
  
  const headers: Record<string, string> = {
    ...(!options.body || typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as any),
  };

  if (headers['Content-Type'] === 'remove_this') {
      delete headers['Content-Type'];
  }

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    let errorMsg = `Server error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorMsg;
    } catch {
      // Ignored
    }
    throw new Error(errorMsg);
  }
  
  // if 204 No Content, return empty
  if (response.status === 204) {
      return null;
  }
  
  // Try to parse JSON
  try {
      return await response.json();
  } catch {
      return null;
  }
};

export const api = {
  // Tenders
  getTender: (id: string) => apiCall(`/api/v1/tenders/${id}`),
  updateTender: (id: string, data: any) => apiCall(`/api/v1/tenders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTender: (id: string) => apiCall(`/api/v1/tenders/${id}`, { method: 'DELETE' }),
  getTenderSchedule: (id: string) => apiCall(`/api/v1/tenders/${id}/schedule`),
  updateTenderSchedule: (id: string, data: any) => apiCall(`/api/v1/tenders/${id}/schedule`, { method: 'PUT', body: JSON.stringify(data) }),
  getComplianceChecklist: (id: string) => apiCall(`/api/v1/tenders/${id}/compliance-checklist`),
  updateComplianceChecklist: (id: string, data: any) => apiCall(`/api/v1/tenders/${id}/compliance-checklist`, { method: 'PUT', body: JSON.stringify(data) }),
  listOwnTenders: () => apiCall(`/api/v1/tenders`),
  createTender: (data: any) => apiCall(`/api/v1/tenders`, { method: 'POST', body: JSON.stringify(data) }),
  submitForApproval: (id: string) => apiCall(`/api/v1/tenders/${id}/submit-for-approval`, { method: 'POST' }),
  uploadDocument: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiCall(`/api/v1/tenders/${id}/documents`, { 
      method: 'POST', body: formData, 
      headers: { 'Content-Type': 'remove_this' } // We will handle this in apiCall by deleting it
    });
  },
  getNoticePreview: (id: string) => apiCall(`/api/v1/tenders/${id}/notice-preview`),
  listAllTenders: () => apiCall(`/api/v1/tenders/all`),
  deleteDocument: (id: string, docId: string) => apiCall(`/api/v1/tenders/${id}/documents/${docId}`, { method: 'DELETE' }),

  // Reference Data
  listTenderTypes: () => apiCall(`/api/v1/tenders/reference-data/tender-types`),
  listSbdTemplates: () => apiCall(`/api/v1/tenders/reference-data/sbd-templates`),
  listProcurementTypes: () => apiCall(`/api/v1/tenders/reference-data/procurement-types`),
  listMinistries: () => apiCall(`/api/v1/tenders/reference-data/ministries`),
  listDepartments: (ministryId: string) => apiCall(`/api/v1/tenders/reference-data/ministries/${ministryId}/departments`),
  listFundingSources: () => apiCall(`/api/v1/tenders/reference-data/funding-sources`),
  listBiddingMethods: () => apiCall(`/api/v1/tenders/reference-data/bidding-methods`),
};
