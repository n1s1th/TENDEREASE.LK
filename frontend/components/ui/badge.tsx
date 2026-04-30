export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary";
  className?: string;
}) {
  return (
    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
      {children}
    </span>
  );
}
