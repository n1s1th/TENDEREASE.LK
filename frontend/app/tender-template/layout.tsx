import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function TenderTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

