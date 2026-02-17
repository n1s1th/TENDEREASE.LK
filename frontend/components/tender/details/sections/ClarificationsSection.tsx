"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";

export default function ClarificationsSection() {
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState("");

  return (
    <div className="bg-white rounded-xl shadow-sm px-6 py-6 space-y-6">


      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-semibold text-sm">
            Clarifications and Questions
          </h2>
          <p className="text-xs text-gray-500">
            All questions and clarifications. Questions can be submitted until Dec 30, 2025.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-700 text-white px-4 py-1.5 rounded-md text-sm hover:bg-orange-800 cursor-pointer transition"
        >
          {showForm ? "Cancel" : "Submit Question"}
        </button>
      </div>

      {/* ASK QUESTION FORM */}
      {showForm && (
        <div className="border rounded-md p-3 space-y-3">

          <div className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare size={16} className="text-orange-600" />
            Ask a Question
          </div>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            rows={4}
            className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
          />

          <div className="flex gap-3">
            <button className="bg-orange-700 text-white px-4 py-1.5 rounded-md text-sm hover:bg-orange-800 cursor-pointer">
              Submit Question
            </button>

            <button
              onClick={() => setShowForm(false)}
              className="border px-4 py-1.5 rounded-md text-sm hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Your question will be reviewed and answered within 48 hours.
            All answers are visible to other bidders.
          </p>

        </div>
      )}

      {/* EXISTING QUESTIONS */}
      {[1, 2].map((num) => (
        <div key={num} className="border rounded-md p-3 space-y-2">

          <div className="flex justify-between items-center text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <MessageSquare size={14} className="text-orange-600" />
              <span>Q00{num}</span>
              <span>Dec 5, 2024</span>
            </div>
            <span className="text-green-600">Answered</span>
          </div>

          <p className="text-sm font-medium">
            What is the required warranty period for HVAC systems?
          </p>

          <div className="bg-gray-100 p-2 rounded text-xs">
            The required warranty period is 24 months from commissioning date.
          </div>

        </div>
      ))}

      {/* Pending Example */}
      <div className="border rounded-md p-3 space-y-2">

        <div className="flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <MessageSquare size={14} className="text-orange-600" />
            <span>Q003</span>
            <span>Dec 8, 2024</span>
          </div>
          <span className="text-yellow-600">Pending</span>
        </div>

        <p className="text-sm font-medium">
          Will there be a site inspection before submission?
        </p>

        <div className="bg-amber-50 p-2 rounded text-xs">
          Status: Answer pending.
        </div>

      </div>

      {/* Info Footer */}
      <div className="bg-amber-100 p-2 rounded text-xs text-orange-700">
        Important: Questions must be submitted by Dec 20, 2025.
        Answers will be published within 48 hours.
      </div>

    </div>
  );
}
