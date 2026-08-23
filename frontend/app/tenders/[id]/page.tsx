"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import TenderLayout from "@/components/tender/TenderLayout";
import TenderHeader from "@/components/tender/TenderHeader";
import TenderTabs from "@/components/tender/TenderTabs";
import SpecialRequirements from "@/components/tender/SpecialRequirements";
import TenderActionsFooter from "@/components/tender/TenderActionsFooter";
import RequireAuth from "@/components/auth/RequireAuth";

import { getTenderById } from "@/services/tender.service";

/**
 * Tender details are for signed-in users only, so the fetch lives inside
 * RequireAuth: a guest never triggers the request and the page ships no tender
 * data to the browser until they authenticate.
 */
function TenderDetails({ id }: { id: string }) {
  const [tender, setTender] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await getTenderById(id);
        if (!cancelled) setTender(data);
      } catch (error) {
        console.error("❌ Failed to load tender:", error);
        if (!cancelled) setTender(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-gray-3 uppercase tracking-[0.2em] animate-pulse">
          Loading Tender
        </p>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="py-20 text-center space-y-4">
        <h1 className="text-2xl font-black text-black-1">Tender Not Found</h1>
        <p className="text-gray-2">
          The tender you are looking for does not exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TenderHeader tender={tender} />
      <SpecialRequirements tender={tender} />
      <TenderTabs tender={tender} />
      <TenderActionsFooter tenderId={tender.id} />
    </div>
  );
}

export default function Page() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <TenderLayout>
      <RequireAuth message="Log in or register to view this tender's details, documents and contacts.">
        <TenderDetails id={id} />
      </RequireAuth>
    </TenderLayout>
  );
}
