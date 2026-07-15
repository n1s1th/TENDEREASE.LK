import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function OfficerRegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}