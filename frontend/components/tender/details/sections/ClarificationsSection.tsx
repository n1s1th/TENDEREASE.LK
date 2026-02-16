"use client";

import { useState } from "react";

export default function ClarificationsSection() {
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState("");

  return (
    <div className="bg-white p-5 rounded-lg shadow space-y-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            Clarifications and Questions
          </h2>
          <p className="text-sm text-gray-500">
            Questions can be submitted until Dec 30, 2025.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-700 text-white px-4 py-2 rounded-md hover:bg-orange-800 cursor-pointer"
        >
          {showForm ? "Cancel" : "Submit Question"}
        </button>
      </div>

      {/* Ask Question Form */}
      {showForm && (
        <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
          <h3 className="font-medium">Ask a Question</h3>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            className="w-full border rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows={4}
          />

          <div className="flex gap-3">
            <button className="bg-orange-700 text-white px-4 py-2 rounded-md hover:bg-orange-800 cursor-pointer">
              Submit Question
            </button>

            <button
              onClick={() => setShowForm(false)}
              className="border px-4 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Your question will be reviewed and answered within 48 hours.
          </p>
        </div>
      )}

      {/* Q&A Cards */}
      {[1, 2].map((num) => (
        <div
          key={num}
          className="border rounded-lg p-4 space-y-2"
        >
          <div className="flex justify-between text-xs text-gray-500">
            <span>Q00{num}</span>
            <span className="text-green-600">Answered</span>
          </div>

          <p className="font-medium text-sm">
            What is the required warranty period for HVAC systems?
          </p>

          <div className="bg-gray-100 p-3 rounded text-sm">
            The required warranty period is 24 months from commissioning date.
          </div>
        </div>
      ))}

      {/* Pending */}
      <div className="border rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Q003</span>
          <span className="text-yellow-600">Pending</span>
        </div>

        <p className="font-medium text-sm">
          What is the required warranty period?
        </p>

        <div className="bg-amber-50 p-3 rounded text-sm">
          Status: Answer pending.
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-amber-100 p-3 rounded text-xs text-orange-700">
        Important: Questions must be submitted before deadline.
      </div>
    </div>
  );
}
