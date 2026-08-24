"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

const QUICK_REPLIES = [
  { label: "How to register?", keyword: "register" },
  { label: "How to bid?", keyword: "bid" },
  { label: "What is DRC verification?", keyword: "drc" },
  { label: "CIDA Grades", keyword: "cida" },
  { label: "Required Documents", keyword: "document" },
  { label: "Contact Support", keyword: "contact" },
];

const FAQ_RESPONSES: Record<string, string> = {
  greeting: "Hello! Welcome to TenderEase Support. How can I assist you with your procurement or vendor account today?",
  register: "To register as a vendor on TenderEase, follow these steps:\n\n" +
            "1. Click 'Register' on the top-right of the homepage.\n" +
            "2. Fill in the Company Profile (Legal Name, BRN, Address, Email, Phone).\n" +
            "3. Enter the Authorized Officer details (Name, Designation, NIC, Mobile).\n" +
            "4. Select your industry sectors/categories of interest.\n" +
            "5. Upload required documents (Business Registration copy, VAT Certificate, etc.).\n" +
            "6. Read and accept the platform terms, and click 'Submit Registration'.\n\n" +
            "Once submitted, our Chief Administrative Officer (CAO) will review and approve your profile.",
  bid: "To submit a bid for an active tender, follow these steps:\n\n" +
       "1. Log in to your Vendor Dashboard and go to the 'Find Tenders' section.\n" +
       "2. Search and click on the tender you wish to bid for.\n" +
       "3. Click 'Download Bid Documents' to retrieve templates.\n" +
       "4. Click 'Bid Now' to open the bidding submission interface.\n" +
       "5. Enter your total financial bid value (Price Proposal).\n" +
       "6. Upload your Technical Proposal document (PDF) and Financial Schedule (PDF).\n" +
       "7. Upload the Bid Bond/Security guarantee if required.\n" +
       "8. Review the summary and click 'Submit Bid' to generate your Bid Submission Receipt.",
  drc: "DRC Verification is our automated system that validates your business details in real-time with the Department of the Registrar of Companies in Sri Lanka. " +
       "When you input your Business Registration Number (BRN) during registration, our system queries the DRC database to verify company legitimacy, active registration status, and matching legal names. " +
       "If the company status is inactive or mismatching in the DRC registry, the platform registration will be automatically restricted to prevent fraudulent profiles.",
  cida: "CIDA (Construction Industry Development Authority) grading classifies contractors in Sri Lanka from C1 (highest capacity) to C9 (lowest capacity) based on financial strength, past project execution, and engineering expertise. " +
        "Procurement officers specify minimum CIDA grade requirements for public works tenders. " +
        "During evaluation, any bidding vendor who does not meet the specified CIDA grade threshold is automatically marked non-compliant and disqualified.",
  document: "For a complete vendor profile and successful bid submissions, the following documents are required:\n\n" +
            "📋 Vendor Registration Documents:\n" +
            "• Business Registration Certificate (Mandatory - PDF format)\n" +
            "• VAT Registration Certificate (If VAT registered - PDF format)\n" +
            "• Authorized Officer Letter of Authorization (Mandatory - PDF format)\n" +
            "• CIDA Grading Certificate (Mandatory for construction contractors - PDF format)\n\n" +
            "💼 Bid Submission Documents:\n" +
            "• Completed Technical Proposal (PDF format)\n" +
            "• Completed Financial Proposal/Schedule (PDF format)\n" +
            "• Bid Bond/Security Deposit proof (If specified - PDF format)",
  contact: "You can reach the official TenderEase Support Desk through:\n\n" +
           "📧 Email: support@tenderease.lk\n" +
           "📞 Phone: +94 (11) 234-5678\n" +
           "🏢 Office: Procurement Secretariat, Lotus Road, Colombo 01.\n" +
           "⏰ Hours: Monday - Friday, 8:30 AM to 4:30 PM (Closed on public holidays).",
  password: "Password management is secured via Keycloak. To reset your password, click 'Forgot Password' on the login screen, or contact your organization's CAO user to reset it from the user administration panel.",
  thanks: "You're very welcome! If you have any other questions, feel free to ask.",
  default: "I'm not sure I fully understand that question. Could you please rephrase it, or select one of the quick replies below? You can also contact our support team at support@tenderease.lk."
};

// 🌟 TenderEase System Knowledge Base for Gemini AI
const SYSTEM_PROMPT = `
You are TenderEase Assistant, the official AI support bot for TenderEase.lk. Your goal is to guide users, resolve platform queries, and explain our digital procurement workflows.

COMPREHENSIVE TENDEREASE PLATFORM DETAILS:

1. TARGET AUDIENCE & USER ROLES:
   - Vendors: Private suppliers/contractors. They onboard onto the platform, inspect open tenders, submit questions, bid (Technical and Financial Proposals), view opening outcomes, and receive awards.
   - Procurement Officers (Ministry/Department): Publish tenders, set up criteria/templates, upload addendums, moderate public Q&A, conduct technical and financial bid openings, evaluate and score proposals, select preferred bidders, and trigger the awarding cycle.
   - CAO (Chief Administrative Officer): The high-level gatekeeper. Reviews all draft vendor registrations, approves or rejects them, and handles vendor appeals/complaints.
   - Admin: System administrators. Handle general user configurations, manage user roles, audit registry transactions, inspect activity logs, and system health.

2. ONBOARDING & VERIFICATION PROCESS:
   - Account Registration Step-by-Step:
     * Step 1: Click 'Register' on the homepage header.
     * Step 2: Choose Vendor account and enter Legal Name, BRN, Address, Email, Phone.
     * Step 3: Input Authorized Officer info (Name, Designation, NIC, Mobile).
     * Step 4: Specify CIDA Grade (if applicable) and select industry interests.
     * Step 5: Upload BR Certificate and other credentials in PDF format.
     * Step 6: Click 'Submit Registration'. CAO reviews and approves profiles.
   - DRC Integration: Our system interfaces live with the Department of the Registrar of Companies in Sri Lanka. It checks if the BRN is valid, matches the legal name, and confirms active business status. If it fails, the registration cannot proceed.
   - CIDA Grade: Vendors in construction select their CIDA grade (C1 to C9). CIDA grading restricts bidding on large state works based on the vendor's checked capacity.

3. TENDER MANAGEMENT LIFE CYCLE & BIDDING STEPS:
   - Bidding Step-by-Step:
     * Step 1: Login to the Vendor Portal.
     * Step 2: Go to 'Find Tenders' and choose active listings.
     * Step 3: Click 'Download Bid Documents' to get the templates.
     * Step 4: Click 'Bid Now' and input Total Financial Proposal Amount.
     * Step 5: Upload Technical Proposal PDF, Financial Proposal PDF, and Bid Security/Bond PDF.
     * Step 6: Click 'Submit Bid' before the deadline.
   - Tender Lifecycle:
     * Draft: Officer drafts the tender (details, category [Goods, Services, Works], department, procurement value, CIDA requirements, security deposit, bid close date).
     * Published: Active tender visible to the public. Vendors can download templates, submit Q&A questions, and prepare responses.
     * Q&A Period: Vendors submit clarifications directly. Officers publish consolidated public answers/clarifications.
     * Closed: Bidding deadline reached. No further bids allowed.
     * Bid Opening: Scheduled session where officers and bidders join to witness the decryption/opening of bids. Initial bid values are recorded and listed in the system for transparency.
     * Evaluation: Officers evaluate compliance and score proposals. Technical criteria are checked and scored first, then financial proposals. A composite score determines the final ranking.
     * Awarded: Bidders are notified. The highest-ranked compliant bidder receives the contract award letter.
     * Appeals: Rejected/failed bidders can submit a formal appeal to the CAO within the stand-still period.

4. SYSTEM TECH & DOCUMENT REQUIREMENTS:
   - Core Stack: Spring Boot microservices backend, Next.js frontend, Keycloak SSO for secure identity and token management.
   - Document Formats: Uploaded documents MUST be in PDF format, with a maximum file size of 10MB.
   - Document Checklist: Business Registration (BR) Certificate, VAT Registration Certificate, Authorized Liaison Letter, CIDA Grading Certificate, Technical/Financial Bid Sheets.

INSTRUCTIONS:
1. Answer the user's question concisely, professionally, and in a friendly manner. Keep your response within 2-4 sentences.
2. Restrict your answers strictly to TenderEase, procurement, tenders, bidding, or related topics.
3. If the user asks something completely unrelated, politely state that you can only assist with TenderEase related support queries.
`;

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting
  useEffect(() => {
    setMessages([
      {
        id: "greet",
        sender: "bot",
        text: FAQ_RESPONSES.greeting,
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Fallback offline keyword matching logic
  const getOfflineResponse = (text: string): string => {
    const cleanText = text.toLowerCase().trim();
    
    if (cleanText.includes("hi") || cleanText.includes("hello") || cleanText.includes("hey")) {
      return FAQ_RESPONSES.greeting;
    }
    if (cleanText.includes("register") || cleanText.includes("registration") || cleanText.includes("signup") || cleanText.includes("join")) {
      return FAQ_RESPONSES.register;
    }
    if (cleanText.includes("bid") || cleanText.includes("proposal") || cleanText.includes("apply") || cleanText.includes("tender")) {
      return FAQ_RESPONSES.bid;
    }
    if (cleanText.includes("drc") || cleanText.includes("registrar") || cleanText.includes("verify") || cleanText.includes("verification")) {
      return FAQ_RESPONSES.drc;
    }
    if (cleanText.includes("cida") || cleanText.includes("grade") || cleanText.includes("contractor")) {
      return FAQ_RESPONSES.cida;
    }
    if (cleanText.includes("document") || cleanText.includes("upload") || cleanText.includes("file") || cleanText.includes("certificate")) {
      return FAQ_RESPONSES.document;
    }
    if (cleanText.includes("contact") || cleanText.includes("support") || cleanText.includes("help") || cleanText.includes("email") || cleanText.includes("phone")) {
      return FAQ_RESPONSES.contact;
    }
    if (cleanText.includes("password") || cleanText.includes("reset") || cleanText.includes("login")) {
      return FAQ_RESPONSES.password;
    }
    if (cleanText.includes("thank") || cleanText.includes("thanks")) {
      return FAQ_RESPONSES.thanks;
    }
    
    return FAQ_RESPONSES.default;
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Retrieve API key from environment variable
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

    if (geminiKey) {
      const models = [
        "gemini-3.6-flash",
        "gemini-3.1-pro-preview",
        "gemini-flash-latest"
      ];

      let responseText = "";
      let success = false;

      for (const model of models) {
        try {
          // Prepare chat history to feed into Gemini context
          const conversationHistory = messages
            .slice(-10) // last 10 messages for context
            .map((m) => `${m.sender === "user" ? "User" : "Assistant"}: ${m.text}`)
            .join("\n");

          const prompt = `${SYSTEM_PROMPT}\n\nCONVERSATION HISTORY:\n${conversationHistory}\nUser: ${text}\nAssistant:`;

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-goog-api-key": geminiKey,
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: prompt,
                      },
                    ],
                  },
                ],
              }),
            }
          );

          if (!response.ok) {
            const errText = await response.text();
            console.warn(`Gemini Model ${model} returned error status ${response.status}:`, errText);
            continue;
          }

          const data = await response.json();
          responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (responseText) {
            success = true;
            break;
          }
        } catch (err) {
          console.warn(`Model ${model} request threw error:`, err);
        }
      }

      if (success) {
        const botMsg: Message = {
          id: Math.random().toString(),
          sender: "bot",
          text: responseText.trim(),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        console.error("All Gemini models failed, falling back to local database");
        const responseFallback = getOfflineResponse(text);
        const botMsg: Message = {
          id: Math.random().toString(),
          sender: "bot",
          text: responseFallback,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
      setIsTyping(false);
    } else {
      // Simulate typing delay for offline mode
      setTimeout(() => {
        const responseText = getOfflineResponse(text);
        const botMsg: Message = {
          id: Math.random().toString(),
          sender: "bot",
          text: responseText,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, 800);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-[#953002] to-[#c2410c] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 group focus:outline-none"
          title="Open TenderEase Chatbot Support"
        >
          <MessageSquare className="w-6 h-6 transition-transform duration-300 group-hover:rotate-6" />
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[380px] max-w-[calc(100vw-32px)] h-[500px] bg-white rounded-3xl border border-slate-100 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#953002] to-[#b43d0b] p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/10">
                <Bot size={18} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold tracking-wide">TenderEase Assistant</h3>
                <span className="text-[10px] text-orange-200/90 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block"></span>
                  Active & Online
                </span>
              </div>
            </div>
            
            <button 
              onClick={toggleChat}
              className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border text-[10px] ${
                    msg.sender === "user"
                      ? "bg-slate-200 text-slate-700 border-slate-300"
                      : "bg-[#953002]/10 text-[#953002] border-[#953002]/10"
                  }`}
                >
                  {msg.sender === "user" ? <User size={12} /> : <Bot size={12} />}
                </div>
                
                <div className="space-y-1">
                  <div
                    className={`p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#953002] text-white rounded-tr-none shadow-sm"
                        : "bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-sm"
                    }`}
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold block text-right px-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 max-w-[85%] mr-auto">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border bg-[#953002]/10 text-[#953002] border-[#953002]/10">
                  <Bot size={12} />
                </div>
                <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies Options */}
          <div className="px-4 py-2 border-t border-slate-100 bg-white flex flex-wrap gap-1.5 shrink-0 max-h-[85px] overflow-y-auto">
            {QUICK_REPLIES.map((qr) => (
              <button
                key={qr.label}
                onClick={() => handleSendMessage(qr.label)}
                className="px-2.5 py-1 bg-slate-50 hover:bg-[#953002]/10 border border-slate-200 hover:border-[#953002]/20 rounded-full text-[10px] font-bold text-slate-600 hover:text-[#953002] transition-all cursor-pointer"
              >
                {qr.label}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage(inputValue);
              }}
              placeholder="Ask a question..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#953002]/15 focus:border-[#953002] transition-all"
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              className="p-2 bg-[#953002] hover:bg-[#b43d0b] text-white rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Send size={14} />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
