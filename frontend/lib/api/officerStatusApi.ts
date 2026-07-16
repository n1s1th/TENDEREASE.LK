import axios from 'axios';

const USER_API_BASE = process.env.NEXT_PUBLIC_USER_API_URL || 'http://localhost:8081/api';

export interface OfficerStatusResponse {
  officerId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  registrationReference: string;
  rejectionReason?: string;
}

/**
 * Fetch the current registration status for an officer by their email.
 * Returns null if no registration is found (404).
 */
export async function getOfficerStatusByEmail(email: string): Promise<OfficerStatusResponse | null> {
  try {
    const res = await axios.get(`${USER_API_BASE}/officers/email/${encodeURIComponent(email)}`);
    const data = res.data;
    return {
      officerId: data.officerId || data.id,
      status: data.status || 'PENDING',
      registrationReference: data.registrationReference || data.referenceId || '',
      rejectionReason: data.rejectionReason,
    };
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return null;
    }
    throw err;
  }
}
