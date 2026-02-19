import { CalendarDays, DollarSign, Building2, Clock } from "lucide-react";
import { Tender } from "@/types/tender";

interface Props {
  tender: Tender;
}

export default function TenderHeader({ tender }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm px-8 py-8 space-y-7">

      <div className="flex flex-col lg:flex-row justify-between gap-6">

        <div className="space-y-3 max-w-3xl">

          <span
            className={`text-sm px-3 py-1 rounded-md ${
              tender.status === "Open"
                ? "bg-green-100 text-green-700"
                : tender.status === "Upcoming"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {tender.status}
          </span>

          <p className="text-sm text-gray-500">
            Tender ID: {tender.id}
          </p>

          <h1 className="text-2xl font-semibold leading-snug">
            {tender.title}
          </h1>

          <p className="text-base text-gray-600 leading-relaxed">
            {tender.description}
          </p>

        </div>

        <div className="flex items-start">
          <button className="bg-orange-700 text-white px-6 py-2 rounded-md text-sm hover:bg-orange-800 transition cursor-pointer">
            Submit
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <MetaCard
          icon={<CalendarDays size={22} className="text-amber-600" />}
          label="Closing Date"
          value={tender.closing}
        />

        <MetaCard
          icon={<DollarSign size={22} className="text-amber-600" />}
          label="Estimated Budget"
          value={tender.value}
        />

        <MetaCard
          icon={<Building2 size={22} className="text-amber-600" />}
          label="Department"
          value={tender.entity}
        />

        <MetaCard
          icon={<Clock size={22} className="text-amber-600" />}
          label="Time Remaining"
          value="18 Days 4 Hours"
        />

      </div>

    </div>
  );
}

function MetaCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-amber-50 border border-amber-200 p-5 rounded-lg hover:shadow-sm transition">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-base font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}
