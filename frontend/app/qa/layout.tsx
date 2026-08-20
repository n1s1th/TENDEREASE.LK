import QaLayoutComponent from "@/components/qa/QaLayout";

export default function QaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QaLayoutComponent>{children}</QaLayoutComponent>;
}
