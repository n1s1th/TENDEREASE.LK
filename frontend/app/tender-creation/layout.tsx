import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function TenderCreationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute allowedRoles={["PROCUREMENT_OFFICER"]}>{children}</ProtectedRoute>;
}

