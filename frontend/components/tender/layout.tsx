"use client";
import TopNavigation from "./TopNavigation";

export default function TenderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNavigation />
      {children}
    </>
  );
}
