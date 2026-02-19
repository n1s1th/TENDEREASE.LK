import { Tender } from "@/types/tender";

interface Props {
  tender: Tender;
}

export default function ContactSection({ tender }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold mb-3">Contact</h2>
      <p className="text-gray-600">
        Contact information for {tender.entity}.
      </p>
    </div>
  );
}
