export default function RequirementsSection() {
  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Eligibility Criteria
        </h2>

        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>Valid business registration</li>
          <li>Minimum 3 years relevant experience</li>
          <li>Tax clearance certificate required</li>
          <li>Financial capability proof</li>
          <li>Compliance with procurement regulations</li>
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">
          Required Documents
        </h2>

        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-amber-50 p-4 rounded-lg mb-3 flex items-center gap-3"
          >
            <div className="bg-yellow-500 w-10 h-10 rounded flex items-center justify-center text-white">
              📄
            </div>
            <div>
              <p className="font-medium">
                Document 0{i + 1}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">
          Technical Specifications
        </h2>

        <ul className="list-disc ml-6 space-y-2 text-gray-700">
          <li>Specification requirement 1</li>
          <li>Specification requirement 2</li>
          <li>Specification requirement 3</li>
          <li>Specification requirement 4</li>
          <li>Specification requirement 5</li>
        </ul>
      </div>
    </div>
  );
}
