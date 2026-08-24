// ─── Officer Dashboard API Layer ────────────────────────────
// Connects the Officer Dashboard frontend to the correct backend services:
// - Tender Service (port 8082) for KPIs and tender list
// - Bid Service (port 8083) for bid counts

const TENDER_SERVICE = process.env.NEXT_PUBLIC_TENDER_SERVICE_URL || "http://localhost:8082";
const BID_SERVICE = process.env.NEXT_PUBLIC_BID_SERVICE_URL || "http://localhost:8083";

/**
 * Fetches the dashboard KPI metrics from the tender-service.
 * Also fetches total bid count from bid-service and merges them.
 */
export async function getDashboardMetrics(): Promise<{
  active: number;
  bids: number;
  evaluating: number;
  awarded: number;
  noBids: number;
  completed: number;
}> {
  try {
    // Fetch tender metrics and total bid count from bid-service in parallel
    const [metricsRes, bidsCountRes] = await Promise.all([
      fetch(`${TENDER_SERVICE}/api/officer/dashboard/metrics`).catch((): null => null),
      fetch(`${BID_SERVICE}/api/bids/count`).catch((): null => null),
    ]);

    let metrics = { active: 0, evaluating: 0, awarded: 0, noBids: 0, completed: 0 };
    if (metricsRes && metricsRes.ok) {
      const metricsJson = await metricsRes.json();
      metrics = metricsJson.data || metrics;
    }

    // Retrieve total bid count directly from the database-backed endpoint
    let bidCount = 0;
    if (bidsCountRes && bidsCountRes.ok) {
      const bidsCountJson = await bidsCountRes.json();
      bidCount = typeof bidsCountJson.data === "number" ? bidsCountJson.data : 0;
    }

    return {
      active: metrics.active || 0,
      bids: bidCount,
      evaluating: metrics.evaluating || 0,
      awarded: metrics.awarded || 0,
      noBids: metrics.noBids || 0,
      completed: metrics.completed || 0,
    };
  } catch (err) {
    console.warn("Failed to fetch dashboard metrics:", err);
    return {
      active: 0,
      bids: 0,
      evaluating: 0,
      awarded: 0,
      noBids: 0,
      completed: 0,
    };
  }
}

/**
 * Fetches the list of CAO-approved tenders assigned to officers.
 * Returns data in the format the AssignedTenderTable expects.
 */
export async function getAssignedTenders(
  keyword: string = "",
  status: string = "ALL",
  page: number = 0,
  size: number = 8
): Promise<{
  data: {
    content: Array<{
      id: string;
      tenderNo: string;
      title: string;
      category: string;
      status: string;
      closingDate: string;
      role: string;
    }>;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}> {
  const fallback = { data: { content: [] as any[], totalElements: 0, totalPages: 1, number: 0 } };
  try {
    const url = new URL(`${TENDER_SERVICE}/api/officer/dashboard/tenders`);
    if (keyword) url.searchParams.append("keyword", keyword);
    if (status && status !== "ALL") url.searchParams.append("status", status);
    url.searchParams.append("page", page.toString());
    url.searchParams.append("size", size.toString());

    const res = await fetch(url.toString());
    if (!res.ok) {
      console.warn("Failed to fetch assigned tenders status:", res.status);
      return fallback;
    }
    return res.json();
  } catch (err) {
    console.warn("Failed to fetch assigned tenders:", err);
    return fallback;
  }
}

/**
 * Fetches a list of tenders ready for bid opening.
 */
export async function getTendersForOpening(): Promise<{
  success: boolean;
  data: Array<{
    id: string;
    tenderNo: string;
    title: string;
    category: string;
    status: string;
    closingDate: string;
  }>;
}> {
  const fallback = { success: false, data: [] as any[] };
  try {
    const res = await fetch(`${TENDER_SERVICE}/api/officer/dashboard/tenders-for-opening`);
    if (!res.ok) return fallback;
    return res.json();
  } catch (err) {
    console.warn("Failed to fetch tenders for opening:", err);
    return fallback;
  }
}

/**
 * Fetches historical bid opening logs.
 */
export async function getOpeningLogs(): Promise<{
  success: boolean;
  data: Array<{
    id: string;
    tenderNo: string;
    title: string;
    openingDate: string;
    status: string;
    category: string;
  }>;
}> {
  const fallback = { success: false, data: [] as any[] };
  try {
    const res = await fetch(`${TENDER_SERVICE}/api/officer/dashboard/opening-logs`);
    if (!res.ok) return fallback;
    return res.json();
  } catch (err) {
    console.warn("Failed to fetch opening logs:", err);
    return fallback;
  }
}

/**
 * Fetches tenders that have bids for document export.
 */
export async function getTendersWithBids(): Promise<{
  success: boolean;
  data: Array<{
    id: string;
    tenderNo: string;
    title: string;
    category: string;
    status: string;
    closingDate: string;
  }>;
}> {
  const fallback = { success: false, data: [] as any[] };
  try {
    const res = await fetch(`${TENDER_SERVICE}/api/officer/dashboard/tenders-with-bids`);
    if (!res.ok) return fallback;
    return res.json();
  } catch (err) {
    console.warn("Failed to fetch tenders with bids:", err);
    return fallback;
  }
}

/**
 * Fetches tenders that are pending final award finalization.
 */
export async function getTendersPendingAward(): Promise<{
  success: boolean;
  data: Array<{
    id: string;
    tenderNo: string;
    title: string;
    category: string;
    status: string;
    closingDate: string;
  }>;
}> {
  const fallback = { success: false, data: [] as any[] };
  try {
    const res = await fetch(`${TENDER_SERVICE}/api/officer/dashboard/tenders-pending-award`);
    if (!res.ok) return fallback;
    return res.json();
  } catch (err) {
    console.warn("Failed to fetch tenders pending award:", err);
    return fallback;
  }
}
