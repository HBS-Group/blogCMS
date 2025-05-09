'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/types/supabase";

type SentEmail = Tables<'sent_mails'>; // Ensure this type includes 'body'

interface EmailPreviewDialogProps {
  email: SentEmail | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmailPreviewDialog({ email, isOpen, onOpenChange }: EmailPreviewDialogProps) {
  if (!email) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[80vh] flex flex-col bg-gray-900/90 border-gray-700 text-gray-200 backdrop-blur-md">
        <DialogHeader className="pt-6 px-6">
          <DialogTitle className="text-2xl text-indigo-300">Email Preview</DialogTitle>
          <DialogDescription className="text-gray-400">
            Details for email sent to: {email.receiver_email}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 p-6 overflow-y-auto flex-grow">
          <div className="grid grid-cols-[100px_1fr] items-center gap-x-4 gap-y-2 text-sm">
            <span className="font-semibold text-gray-400">Recipient:</span>
            <span className="text-gray-100">{email.receiver_email}</span>

            <span className="font-semibold text-gray-400">Subject:</span>
            <span className="text-gray-100">{email.subject}</span>

            <span className="font-semibold text-gray-400">Status:</span>
            <Badge
              variant={email.status === 'sent' ? 'default' : 'outline'}
              className={
                email.status === 'sent'
                  ? 'bg-green-700/30 text-green-300 border-green-600/50 w-fit'
                  : email.status === 'failed'
                  ? 'bg-red-700/30 text-red-300 border-red-600/50 w-fit'
                  : 'bg-yellow-700/30 text-yellow-300 border-yellow-600/50 w-fit'
              }
            >
              {email.status}
            </Badge>

            <span className="font-semibold text-gray-400">Sent At:</span>
            <span className="text-gray-300">
              {new Date(email.created_at).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold text-gray-300 mb-2">Email Body:</h4>
            {/* 
              SECURITY WARNING: Only use dangerouslySetInnerHTML if you trust the HTML source.
              If the HTML comes from user input or an untrusted third party,
              it MUST be sanitized to prevent XSS attacks.
            */}
            <div
              className="prose prose-sm prose-invert max-w-none p-4 border border-gray-700 rounded-md bg-gray-800/50 overflow-auto"
              dangerouslySetInnerHTML={{ __html: email.body || '<p>No body content available.</p>' }}
            />
          </div>
        </div>
        <DialogFooter className="px-6 pb-6 pt-4 border-t border-gray-700">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-gray-100">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}