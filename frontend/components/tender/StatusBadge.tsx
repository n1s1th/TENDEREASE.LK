interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const isPending = status?.toLowerCase() === "upcoming" || status?.toLowerCase() === "pending";
  const isOpen = status?.toLowerCase() === "open" || status?.toLowerCase() === "active" || status?.toLowerCase() === "open for bidding";
  const isClosed = status?.toLowerCase() === "closed" || status?.toLowerCase() === "cancelled" || status?.toLowerCase() === "rejected";

  const color = isOpen
    ? "bg-success/10 text-success border-success/10"
    : isPending
    ? "bg-warning/10 text-warning border-warning/10"
    : "bg-error/10 text-error border-error/10";

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${color}`}>
      {status}
    </span>
  );
}
