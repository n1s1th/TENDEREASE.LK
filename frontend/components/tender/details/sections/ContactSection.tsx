export default function ContactSection() {
  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Tender Officer
        </h2>

        <div className="bg-amber-50 p-5 rounded space-y-2">
          <p><strong>Name:</strong> Umesh Mihiranga</p>
          <p><strong>Position:</strong> Chief Procurement Officer</p>
          <p><strong>Email:</strong> kgumihiranga@gmail.com</p>
          <p><strong>Phone:</strong> +94 774368063</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">
          Organization Details
        </h2>

        <div className="bg-amber-50 p-5 rounded space-y-2">
          <p><strong>Department:</strong> Ministry of Infrastructure</p>
          <p><strong>Address:</strong></p>
          <p>
            Government Complex, Building 5<br />
            123 Government Street<br />
            Capital City, 12345
          </p>
          <p><strong>Website:</strong> www.infrastructure.gov</p>
        </div>
      </div>
    </div>
  );
}
