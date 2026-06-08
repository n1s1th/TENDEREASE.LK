// import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function TenderCreationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // return <ProtectedRoute>{children}</ProtectedRoute>;
  return <>{children}</>;
}

{/* <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
  {children}
</ProtectedRoute> */}