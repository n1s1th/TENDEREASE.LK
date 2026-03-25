import { Tender } from "@/types/tender";

interface Props {
  tender: Tender;
}

export default function TimelineSection({ tender }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold mb-3">Timeline</h2>
      <p className="text-gray-600">
        Timeline details for {tender.title}.
      </p>
    </div>
  );
}
