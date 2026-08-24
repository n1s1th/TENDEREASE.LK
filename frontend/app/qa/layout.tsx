import QaLayoutComponent from "@/components/qa/QaLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function QaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <QaLayoutComponent>{children}</QaLayoutComponent>
    </ProtectedRoute>
  );
}

