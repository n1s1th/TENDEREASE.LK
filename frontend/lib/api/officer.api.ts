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
}> {
  // Fetch tender metrics and bid count in parallel
  const [metricsRes, bidsRes] = await Promise.all([
    fetch(`${TENDER_SERVICE}/api/officer/dashboard/metrics`),
    fetch(`${BID_SERVICE}/api/bids/count`).catch(() => null), // Graceful fallback if bid-service is down
  ]);

  if (!metricsRes.ok) throw new Error("Failed to fetch dashboard metrics");
  
  const metricsJson = await metricsRes.json();
  const metrics = metricsJson.data;

  // Enrich with bid count from bid-service
  let bidCount = 0;
  if (bidsRes && bidsRes.ok) {
    const bidsJson = await bidsRes.json();
    bidCount = bidsJson.data || 0;
  }

  return {
    active: metrics.active,
    bids: bidCount,
    evaluating: metrics.evaluating,
    awarded: metrics.awarded,
    noBids: metrics.noBids,
  };
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
  const url = new URL(`${TENDER_SERVICE}/api/officer/dashboard/tenders`);
  if (keyword) url.searchParams.append("keyword", keyword);
  if (status && status !== "ALL") url.searchParams.append("status", status);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("size", size.toString());

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch assigned tenders");
  return res.json();
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
  const res = await fetch(`${TENDER_SERVICE}/api/officer/dashboard/tenders-for-opening`);
  if (!res.ok) throw new Error("Failed to fetch tenders for opening");
  return res.json();
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
  const res = await fetch(`${TENDER_SERVICE}/api/officer/dashboard/opening-logs`);
  if (!res.ok) throw new Error("Failed to fetch opening logs");
  return res.json();
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
  const res = await fetch(`${TENDER_SERVICE}/api/officer/dashboard/tenders-with-bids`);
  if (!res.ok) throw new Error("Failed to fetch tenders with bids");
  return res.json();
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
  const res = await fetch(`${TENDER_SERVICE}/api/officer/dashboard/tenders-pending-award`);
  if (!res.ok) throw new Error("Failed to fetch tenders pending award");
  return res.json();
}
