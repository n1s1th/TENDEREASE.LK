interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const normalized = status?.toLowerCase();

  const isPublished = normalized === "published" || normalized === "open" || normalized === "active" || normalized === "open for bidding";
  const isPending = normalized === "upcoming" || normalized === "pending" || normalized === "pending_approval" || normalized === "draft" || normalized === "submitted";
  const isClosed = normalized === "closed" || normalized === "cancelled" || normalized === "rejected";

  const isEvaluation = normalized === "evaluation";

  const color = isPublished
    ? "bg-success/10 text-success border-success/10"
    : isEvaluation
    ? "bg-[#E2B93B]/10 text-[#E2B93B] border-[#E2B93B]/20"
    : isPending
    ? "bg-warning/10 text-warning border-warning/10"
    : isClosed
    ? "bg-error/10 text-error border-error/10"
    : "bg-grey-2 text-grey-5 border-grey-3";

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${color}`}>
      {status}
    </span>
  );
}
