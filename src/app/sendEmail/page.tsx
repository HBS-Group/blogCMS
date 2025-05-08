"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Mail, FileEdit } from "lucide-react";
import { sendEmailAction } from "./actions";


export default function SendEmailPage() {

  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [showPreview, setShowPreview] = useState(false);

  // Form state
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSendEmail = async () => {
    if (!recipient || !subject || !body) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    clearMessages();
    setIsSending(true);

    const result = await sendEmailAction(
        recipient,
        subject,
        body
      );

    if (result.success) {
      setSuccessMessage(result.message);
    } else {
      setErrorMessage(result.message);
    }

    setIsSending(false);
  };

  
  const previewEmail = () => {
    if (!body) {
      setErrorMessage("Please enter email content first");
      return;
    }
    setShowPreview(true);
  };
  const logoUrl =  process.env.NEXT_PUBLIC_DEFAULT_LOGO_URL || 'https://cvmjchleuqfblycohmdk.supabase.co/storage/v1/object/public/email-assets//Hyper%20Business%20Solution_b.png';
  const stampUrl =  process.env.NEXT_PUBLIC_DEFAULT_STAMP_URL || 'https://cvmjchleuqfblycohmdk.supabase.co/storage/v1/object/public/email-assets//Karim%20Stamp.png';
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white p-4 md:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header Card */}
        <div className="mb-6 bg-gray-900/70 border-gray-800 backdrop-blur-sm shadow-xl rounded-lg p-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <Mail className="h-7 w-7" /> Professional Email Sender
          </h1>
          <p className="text-gray-400 mt-2">
            Send beautifully formatted emails with your company branding
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-900/70 border-gray-800 backdrop-blur-sm shadow-lg mb-8 rounded-lg p-6">
          <div className="space-y-6">
            {/* Recipient */}
            <div className="space-y-2">
              <Label htmlFor="recipient" className="text-gray-300">
                Recipient Email *
              </Label>
              <Input
                id="recipient"
                type="email"
                placeholder="recipient@example.com"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                disabled={isSending}
                className="bg-gray-800/60 border-gray-700 text-white"
              />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-gray-300">
                Subject *
              </Label>
              <Input
                id="subject"
                type="text"
                placeholder="Email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isSending}
                className="bg-gray-800/60 border-gray-700 text-white"
              />
            </div>



            {/* Body */}
            <div className="space-y-2">
              <Label htmlFor="body" className="text-gray-300 flex items-center gap-2">
                <FileEdit className="h-4 w-4" /> Message *
              </Label>
              <Textarea
                id="body"
                placeholder="Write your email content here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={isSending}
                className="bg-gray-800/60 border-gray-700 text-white min-h-[200px]"
              />
            </div>

            {/* Messages */}
            {errorMessage && (
              <div className="text-red-400 text-sm">{errorMessage}</div>
            )}
            {successMessage && (
              <div className="text-green-400 text-sm">{successMessage}</div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleSendEmail}
                disabled={isSending}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
              >
                {isSending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isSending ? "Sending..." : "Send Email"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={previewEmail}
                disabled={!body || isSending}
                className="flex-1 bg-gray-800/60 border-gray-700 text-white hover:bg-gray-800/80"
              >
                Preview Email
              </Button>
            </div>
          </div>
        </div>

        {/* Email Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Email Preview</h2>
                <button 
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <div className="bg-white text-gray-800 p-1 rounded">
                  <div dangerouslySetInnerHTML={{ 
                    __html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: #f8f8f8; padding: 20px; text-align: center; border-bottom: 1px solid #e0e0e0;">
                          <img src="${logoUrl}" alt="Logo" style="display: block; margin-left: auto; margin-right: auto; max-width: 120px; height: auto;">
                        </div>
                        <div style="padding: 20px;">
                          ${body.replace(/\n/g, '<br>')}
                          <div style="margin-top: 30px; font-style: italic;">
                            <p>Best regards,</p>
                            <p>${process.env.NEXT_PUBLIC_COMPANY_NAME || 'Your Company'}</p>
                          </div>
                        </div>
                        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #e0e0e0;">
                          <img src="${stampUrl}" alt="Stamp" style="max-width: 100; height: auto; margin: 15px 0;">
                          <p>© ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_COMPANY_NAME || 'Your Company'}. All rights reserved.</p>
                          <p>${process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'Your Company Address'}</p>
                        </div>
                      </div>
                    `
                  }} />
                </div>
              </div>
              <div className="p-4 border-t border-gray-800 flex justify-end">
                <Button
                  onClick={() => setShowPreview(false)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Close Preview
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}