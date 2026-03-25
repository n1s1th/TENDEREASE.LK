import { Tender } from "@/types/tender";

interface Props {
  tender: Tender;
}

export default function RequirementsSection({ tender }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold mb-3">Requirements</h2>
      <p className="text-gray-600">
        Requirements for {tender.title} will be listed here.
      </p>
    </div>
  );
}
