import axios from 'axios';
import { OrgData, OfficerData } from '../../store/vendorRegistrationStore';
import { useAuthStore } from '@/store';

const API_BASE_URL = process.env.NEXT_PUBLIC_USER_API_URL 
  ? `${process.env.NEXT_PUBLIC_USER_API_URL}/v1/vendors` 
  : 'http://localhost:8081/api/v1/vendors';

const getHeaders = () => {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const verifyRegistration = async (certificateNo: string) => {
  const response = await axios.post(`${API_BASE_URL}/verify-registration`, { certificateNo }, {
    headers: getHeaders()
  });
  return response.data;
};

export const registerVendor = async (organization: OrgData, authorizedOfficer: OfficerData) => {
  const response = await axios.post(`${API_BASE_URL}/register`, {
    organization,
    authorizedOfficer
  }, {
    headers: getHeaders()
  });
  return response.data;
};

export const uploadDocument = async (
  vendorId: string, 
  file: File, 
  documentType: string, 
  documentTitle?: string
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);
  if (documentTitle) {
    formData.append('documentTitle', documentTitle);
  }

  const response = await axios.post(`${API_BASE_URL}/${vendorId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...getHeaders()
    },
  });
  return response.data;
};

export const deleteDocument = async (vendorId: string, docId: string) => {
  await axios.delete(`${API_BASE_URL}/${vendorId}/documents/${docId}`, {
    headers: getHeaders()
  });
};

export const submitVendor = async (vendorId: string) => {
  const response = await axios.post(`${API_BASE_URL}/${vendorId}/submit`, { termsAccepted: true }, {
    headers: getHeaders()
  });
  return response.data;
};

export const getVendorByEmail = async (email: string) => {
  const response = await axios.get(`${API_BASE_URL}/email/${encodeURIComponent(email)}`, {
    headers: getHeaders()
  });
  return response.data;
};
