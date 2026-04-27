import { redirect } from "next/navigation";

export default function OfficerDashboardPage() {
  redirect("/officer-dashboard/tenders/pending");
}
