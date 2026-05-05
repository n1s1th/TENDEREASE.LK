import axios from 'axios';
import { OrgData, OfficerData } from '../../store/vendorRegistrationStore';

const API_BASE_URL = 'http://localhost:8000/api/v1/vendors';

export const verifyRegistration = async (certificateNo: string) => {
  const response = await axios.post(`${API_BASE_URL}/verify-registration`, { certificateNo });
  return response.data;
};

export const registerVendor = async (organization: OrgData, authorizedOfficer: OfficerData) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { confirmPassword, ...officerRest } = authorizedOfficer;
  const response = await axios.post(`${API_BASE_URL}/register`, {
    organization,
    authorizedOfficer: officerRest
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
    },
  });
  return response.data;
};

export const deleteDocument = async (vendorId: string, docId: string) => {
  await axios.delete(`${API_BASE_URL}/${vendorId}/documents/${docId}`);
};

export const submitVendor = async (vendorId: string) => {
  const response = await axios.post(`${API_BASE_URL}/${vendorId}/submit`, { termsAccepted: true });
  return response.data;
};
