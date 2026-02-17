export default function OverviewSection() {
  return (
    <div className="bg-white p-3 rounded-md shadow-sm space-y-3">
      <h2 className="font-semibold">Project Overview</h2>
      <p className="text-sm text-gray-600">
        The project involves upgrading the drainage infrastructure within
        Colombo Zone 03 to reduce urban flooding.
      </p>

      <h3 className="font-medium text-sm">Scope of Work</h3>
      <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
        <li>Installation of reinforced concrete pipes</li>
        <li>Construction of inspection chambers</li>
        <li>Desilting existing canals</li>
        <li>Road reinstatement works</li>
        <li>Stormwater gate installations</li>
      </ul>
    </div>
  );
}
