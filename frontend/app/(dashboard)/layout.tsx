// app/(dashboard)/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      {/* Add your sidebar, navbar, etc. here */}
      <main>{children}</main>
    </div>
  );
}