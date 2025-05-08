"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { Loader2, Copy, Mail } from "lucide-react";
import { generateEmailsAction } from "./actions"; 

// --- Constants specific to Email Generation ---

const EMAIL_TYPES = [
  { key: "marketing", label: "Marketing/Promotion" },
  { key: "follow_up", label: "Follow-up" },
  { key: "cold_outreach", label: "Cold Outreach" },
  { key: "newsletter", label: "Newsletter Snippet" },
  { key: "thank_you", label: "Thank You" },
  { key: "apology", label: "Apology" },
  { key: "inquiry_response", label: "Inquiry Response" },
  { key: "internal_announcement", label: "Internal Announcement" },
  { key: "welcome", label: "Welcome Email" },
  { key: "feedback_request", label: "Feedback Request" },
];

const EMAIL_OBJECTIVES = [
    { key: "promote_product", label: "Promote a product/service" },
    { key: "schedule_meeting", label: "Schedule a meeting/call" },
    { key: "request_information", label: "Request information" },
    { key: "build_relationship", label: "Build relationship/Nurture lead" },
    { key: "provide_update", label: "Provide an update" },
    { key: "resolve_issue", label: "Resolve an issue" },
    { key: "gather_feedback", label: "Gather feedback" },
    { key: "drive_traffic", label: "Drive traffic to website/landing page" },
    { key: "announce_event", label: "Announce an event/webinar" },
];

// Reusing constants from social media page (assuming they are globally accessible or copied)
const TONES = [
  { key: "neutral", label: "Neutral - محايد"},
  { key: "friendly", label: "Friendly - ودود" },
  { key: "professional", label: "Professional - احترافي"},
  { key: "formal", label: "Formal - رسمي"},
  { key: "persuasive", label: "Persuasive - مقنع"},
  { key: "urgent", label: "Urgent - عاجل"},
  { key: "empathetic", label: "Empathetic - متعاطف"},
  { key: "enthusiastic", label: "Enthusiastic - حماسي"},
  { key: "concise", label: "Concise - موجز"},
];

const LENGTHS = [
  { key: "very_short", label: "Very Short (1-2 sentences)" },
  { key: "short", label: "Short (3-5 sentences)" },
  { key: "medium", label: "Medium (2-3 paragraphs)" },
  { key: "long", label: "Long (4+ paragraphs)" },
];

const LANGUAGES = [
  { key: "english", label: "English" },
  { key: "arabic", label: "Arabic" },
  { key: "french", label: "French" },
];

const ACCENTS: Record<string, { key: string; label: string }[]> = {
  english: [
    { key: "american", label: "American" },
    { key: "british", label: "British" },
    { key: "neutral", label: "Neutral/International" },
  ],
  arabic: [
    { key: "msa", label: "Modern Standard (MSA)" },
    { key: "egyptian", label: "Egyptian" },
    { key: "gulf", label: "Gulf (Khaliji)" },
    { key: "levantine", label: "Levantine" },
  ],
  french: [
    { key: "parisian", label: "Parisian" },
    { key: "standard", label: "Standard European" },
    { key: "quebecois", label: "Canadian (Québécois)" },
  ],
};

// --- Types ---
interface GeneratedEmail {
  subject: string;
  body: string;
}

// --- Component ---
export default function EmailGeneratorPage() {
  // --- State ---
  const [emailType, setEmailType] = useState("marketing");
  const [recipientContext, setRecipientContext] = useState(""); // e.g., "Potential customer", "Existing client", "Hiring manager"
  const [objective, setObjective] = useState("promote_product");
  const [keyInfo, setKeyInfo] = useState(""); // Main points to include
  const [senderName, setSenderName] = useState("");
  const [senderPosition, setSenderPosition] = useState(""); // <-- Add state for position
  const [companyName, setCompanyName] = useState(""); // Optional
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [language, setLanguage] = useState("english");
  const [accent, setAccent] = useState("");
  const [callToAction, setCallToAction] = useState("");
  const [numberOfVariations, setNumberOfVariations] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmails, setGeneratedEmails] = useState<GeneratedEmail[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- Derived State & Effects ---
  const availableAccents = useMemo(() => ACCENTS[language] || [], [language]);

  useEffect(() => {
    if (availableAccents.length > 0 && !availableAccents.find(a => a.key === accent)) {
      setAccent(availableAccents[0].key);
    } else if (availableAccents.length === 0) {
      setAccent("");
    }
  }, [language, availableAccents, accent]);

  // --- Handlers ---
  const handleGenerate = async () => {
    setErrorMessage(null);
    if (!emailType || !recipientContext.trim() || !objective || !keyInfo.trim()) {
      setErrorMessage("Please fill in Email Type, Recipient Context, Objective, and Key Information.");
      return;
    }
    setIsGenerating(true);
    setGeneratedEmails([]); // Clear previous results

    try {
      // --- Actual API Call ---
      const result = await generateEmailsAction({
        emailType,
        recipientContext,
        objective,
        keyInfo,
        senderName: senderName.trim() || undefined,
        senderPosition: senderPosition.trim() || undefined, // <-- Pass position
        companyName: companyName.trim() || undefined,
        tone,
        length,
        language,
        accent: availableAccents.length > 0 ? accent : undefined,
        callToAction: callToAction.trim() || undefined,
        numberOfVariations,
      });

      if (result.success) {
        setGeneratedEmails(result.emails || []);
        if ((result.emails || []).length === 0) {
            setErrorMessage("The AI generated a response, but no valid emails could be parsed. Please check the console logs or try adjusting your input.");
        }
      } else {
        setErrorMessage(result.error || "Failed to generate emails.");
      }

    } catch (err) {
      console.error("Error generating emails:", err);
      setErrorMessage(`An error occurred: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optional: Add a toast notification for feedback
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white p-4 md:p-6 lg:p-8">
      <div className="container mx-auto max-w-3xl">
        {/* Header Card */}
        <Card className="mb-6 bg-gray-900/70 border-gray-800 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
              <Mail className="h-7 w-7" /> AI Email Generator
            </CardTitle>
            <CardDescription className="text-gray-400">
              Craft compelling emails for any situation in seconds.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Input Card */}
        <Card className="bg-gray-900/70 border-gray-800 backdrop-blur-sm shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-white text-xl">Compose Your Email Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Row 1: Email Type & Objective */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Email Type *</Label>
                <select
                  value={emailType}
                  onChange={e => setEmailType(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-gray-800/60 border-gray-700 text-white rounded px-3 py-2"
                >
                  {EMAIL_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Main Objective *</Label>
                <select
                  value={objective}
                  onChange={e => setObjective(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-gray-800/60 border-gray-700 text-white rounded px-3 py-2"
                >
                  {EMAIL_OBJECTIVES.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Row 2: Recipient & Key Info */}
            <div className="space-y-2">
              <Label htmlFor="recipientContext" className="text-gray-300">Recipient Context *</Label>
              <Input
                id="recipientContext"
                type="text"
                placeholder="e.g., Potential customer interested in X, Hiring manager for Y role"
                value={recipientContext}
                onChange={e => setRecipientContext(e.target.value)}
                disabled={isGenerating}
                className="bg-gray-800/60 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keyInfo" className="text-gray-300">Key Information / Points to Include *</Label>
              <Textarea
                id="keyInfo"
                placeholder="List the essential details, benefits, or questions for the email..."
                value={keyInfo}
                onChange={e => setKeyInfo(e.target.value)}
                disabled={isGenerating}
                className="bg-gray-800/60 border-gray-700 text-white min-h-[100px]"
                rows={4}
              />
            </div>

             {/* Row 3: Sender Name, Position & Company */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="senderName" className="text-gray-300">Sender Name (Optional)</Label>
                    <Input
                        id="senderName"
                        type="text"
                        placeholder="e.g., John Doe"
                        value={senderName}
                        onChange={e => setSenderName(e.target.value)}
                        disabled={isGenerating}
                        className="bg-gray-800/60 border-gray-700 text-white"
                    />
                </div>
                <div className="space-y-2"> {/* <-- New div for Position */}
                    <Label htmlFor="senderPosition" className="text-gray-300">Sender Position (Optional)</Label>
                    <Input
                        id="senderPosition"
                        type="text"
                        placeholder="e.g., Marketing Manager"
                        value={senderPosition}
                        onChange={e => setSenderPosition(e.target.value)}
                        disabled={isGenerating}
                        className="bg-gray-800/60 border-gray-700 text-white"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-gray-300">Company Name (Optional)</Label>
                    <Input
                        id="companyName"
                        type="text"
                        placeholder="e.g., Acme Corp"
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        disabled={isGenerating}
                        className="bg-gray-800/60 border-gray-700 text-white"
                    />
                </div>
            </div>

            {/* Row 4: Tone & Length */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Tone</Label>
                <select
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-gray-800/60 border-gray-700 text-white rounded px-3 py-2"
                >
                  {TONES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Length</Label>
                <select
                  value={length}
                  onChange={e => setLength(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-gray-800/60 border-gray-700 text-white rounded px-3 py-2"
                >
                  {LENGTHS.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
                </select>
              </div>
            </div>

            {/* Row 5: Language & Accent */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Language</Label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  disabled={isGenerating}
                  className="w-full bg-gray-800/60 border-gray-700 text-white rounded px-3 py-2"
                >
                  {LANGUAGES.map(lang => <option key={lang.key} value={lang.key}>{lang.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Accent</Label>
                <select
                  value={accent}
                  onChange={e => setAccent(e.target.value)}
                  disabled={isGenerating || availableAccents.length === 0}
                  className="w-full bg-gray-800/60 border-gray-700 text-white rounded px-3 py-2 disabled:opacity-50"
                >
                  {availableAccents.length === 0 ? (
                    <option value="">N/A for selected language</option>
                  ) : (
                    availableAccents.map(acc => <option key={acc.key} value={acc.key}>{acc.label}</option>)
                  )}
                </select>
              </div>
            </div>

             {/* Row 6: CTA & Number of Variations */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="callToAction" className="text-gray-300">Call to Action (Optional)</Label>
                    <Input
                        id="callToAction"
                        type="text"
                        placeholder="e.g., Book a demo, Visit our website, Reply to confirm"
                        value={callToAction}
                        onChange={e => setCallToAction(e.target.value)}
                        disabled={isGenerating}
                        className="bg-gray-800/60 border-gray-700 text-white"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="numberOfVariations" className="text-gray-300">Number of Variations</Label>
                    <Input
                        id="numberOfVariations"
                        type="number"
                        min="1"
                        max="5" // Limit variations for performance/cost
                        value={numberOfVariations}
                        onChange={e => setNumberOfVariations(parseInt(e.target.value, 10) || 1)}
                        disabled={isGenerating}
                        className="w-full bg-gray-800/60 border-gray-700 text-white rounded px-3 py-2"
                    />
                </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
            >
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isGenerating ? "Generating Emails..." : "Generate Emails"}
            </Button>
            {errorMessage && (
              <div className="text-red-400 text-sm mt-2">{errorMessage}</div>
            )}
          </CardContent>
        </Card>

        {/* Output Card */}
        <Card className="bg-gray-900/80 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Generated Emails</CardTitle>
            <CardDescription className="text-gray-400">Review and copy the generated email variations below.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80 rounded-md border border-gray-700 p-4 bg-gray-800/40">
              {generatedEmails.length > 0 ? (
                <ul className="space-y-6">
                  {generatedEmails.map((email, idx) => (
                    <li key={idx} className="border border-gray-700 rounded-lg p-4 bg-gray-800/50 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-indigo-300">Subject: <span className="text-gray-200 font-normal">{email.subject}</span></h4>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white ml-2 shrink-0"
                          onClick={() => handleCopy(`Subject: ${email.subject}\n\n${email.body}`)}
                          title="Copy Subject & Body"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-gray-300 whitespace-pre-wrap">{email.body}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500 text-center py-10">
                  {isGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Generating emails...
                    </span>
                  ) : (
                    "Generated emails will appear here."
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}