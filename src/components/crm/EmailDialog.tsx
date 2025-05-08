"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";

interface EmailDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  recipients: string[]; // Array of email addresses
  onSend: (subject: string, body: string) => Promise<void>; // Async function to handle sending
}

export function EmailDialog({ isOpen, onOpenChange, recipients, onSend }: EmailDialogProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset form when recipients change or dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setSubject("");
      setBody("");
      setIsSending(false);
      setErrorMessage(null);
    }
  }, [isOpen, recipients]);

  const handleSendClick = async () => {
    if (!subject || !body || recipients.length === 0) {
      setErrorMessage("Subject, body, and at least one recipient are required.");
      return;
    }
    setIsSending(true);
    setErrorMessage(null);
    try {
      await onSend(subject, body);
      // Optionally close dialog on success, or let the parent component handle it
      // onOpenChange(false);
    } catch (error) {
      console.error("Failed to send email:", error);
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsSending(false);
    }
  };

  const recipientDisplay = recipients.join(', ');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
          <DialogDescription>
            Sending email to: {recipientDisplay.length > 100 ? recipientDisplay.substring(0, 97) + '...' : recipientDisplay} ({recipients.length} recipient{recipients.length !== 1 ? 's' : ''})
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right text-gray-300">
              Subject
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="col-span-3 bg-gray-700 border-gray-600 text-white"
              disabled={isSending}
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4"> {/* Changed items-center to items-start for textarea */}
            <Label htmlFor="body" className="text-right text-gray-300 pt-2"> {/* Added padding-top */}
              Body
            </Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="col-span-3 bg-gray-700 border-gray-600 text-white min-h-[150px]" // Added min-height
              disabled={isSending}
              placeholder="Write your email content here..."
            />
          </div>
           {errorMessage && (
             <div className="col-span-4 text-red-500 text-sm px-1">
               Error: {errorMessage}
             </div>
           )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSending} className="text-gray-300 border-gray-600 hover:bg-gray-700">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSendClick}
            disabled={isSending || !subject || !body || recipients.length === 0}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white disabled:opacity-50"
          >
            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}