import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function QaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
