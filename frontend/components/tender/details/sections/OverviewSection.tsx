export default function OverviewSection() {
  return (
    <div className="bg-white rounded-xl shadow-sm px-6 py-6 space-y-5">

      <div className="space-y-4">
        <h3 className="text-base font-semibold">
          Project Overview
        </h3>

        <p className="text-sm text-gray-600 leading-relaxed">
          This project involves comprehensive rehabilitation of the
          urban drainage system in Colombo Zone 03 to mitigate flood risks
          and improve stormwater management.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-semibold">
          Scope of Work
        </h3>

        <ul className="list-disc ml-6 text-sm text-gray-600 space-y-2 leading-relaxed">
          <li>Replacement of outdated drainage pipelines</li>
          <li>Installation of new stormwater collection chambers</li>
          <li>Rehabilitation of culverts and overflow channels</li>
          <li>Surface restoration after excavation works</li>
        </ul>
      </div>

    </div>
  );
}
