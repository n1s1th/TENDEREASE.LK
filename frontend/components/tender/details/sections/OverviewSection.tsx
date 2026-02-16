export default function OverviewSection() {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">Project Overview</h2>

      <p className="text-gray-600 mb-6">
        This tender aims to construct infrastructure improvements
        under the Ministry development plan.
      </p>

      <h3 className="font-semibold mb-3">Scope of Work</h3>

      <ul className="list-disc ml-6 space-y-2 text-gray-600">
        <li>Road resurfacing</li>
        <li>Drainage systems</li>
        <li>Bridge repairs</li>
        <li>Compliance verification</li>
      </ul>
    </div>
  );
}
