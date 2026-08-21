import TenderLayout from "@/components/tender/TenderLayout";
import TenderHeader from "@/components/tender/TenderHeader";
import TenderTabs from "@/components/tender/TenderTabs";
import SpecialRequirements from "@/components/tender/SpecialRequirements";
import TenderActionsFooter from "@/components/tender/TenderActionsFooter";

import { getTenderById } from "@/services/tender.service";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // ✅ MUST await

  const tender = await getTenderById(id).catch(() => null);

  if (!tender) {
    return (
      <TenderLayout>
        <div className="py-20 text-center space-y-4">
          <h1 className="text-2xl font-black text-black-1">Tender Not Found</h1>
          <p className="text-gray-2">
            The tender you are looking for does not exist or has been removed.
          </p>
        </div>
      </TenderLayout>
    );
  }

  return (
    <TenderLayout>
      <div className="space-y-6">
        <TenderHeader tender={tender} />
        <SpecialRequirements tender={tender} />
        <TenderTabs tender={tender} />
        <TenderActionsFooter tenderId={tender.id} />
      </div>
    </TenderLayout>
  );
}