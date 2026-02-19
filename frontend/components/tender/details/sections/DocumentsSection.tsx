import { Tender } from "@/types/tender";

interface Props {
  tender: Tender;
}

export default function AddendaSection({ tender }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold mb-3">Addenda</h2>
      <p className="text-gray-600">
        Addenda information for {tender.title}.
      </p>
    </div>
  );
}
