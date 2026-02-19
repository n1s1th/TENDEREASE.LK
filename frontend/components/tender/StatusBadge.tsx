interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const color =
    status === "Open"
      ? "bg-green-100 text-green-700"
      : status === "Upcoming"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  );
}
