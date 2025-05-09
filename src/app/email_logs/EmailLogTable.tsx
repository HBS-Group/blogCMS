'use client';

import { useState } from 'react';
import {
  TableBody, // Only import TableBody, TableRow, TableCell
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from 'lucide-react';
import type { Tables } from "@/types/supabase";
import { EmailPreviewDialog } from './EmailPreviewDialog'; // Ensure this path is correct

type SentEmailWithSender = Tables<'sent_mails'> & {
  freelancers: { name: string | null } | null;
};

interface EmailLogTableProps {
  emails: SentEmailWithSender[];
  // If dialog handling is lifted to a parent, an onViewEmail prop would be here:
  // onViewEmail: (email: SentEmailWithSender) => void; 
}

export function EmailLogTable({ emails /*, onViewEmail */ }: EmailLogTableProps) {
  const [selectedEmail, setSelectedEmail] = useState<SentEmailWithSender | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewEmail = (email: SentEmailWithSender) => {
    setSelectedEmail(email);
    setIsDialogOpen(true);
    // If using onViewEmail prop: onViewEmail(email);
  };

  // If EmailLogTable renders its own dialog, it must be wrapped in a fragment with TableBody.
  // However, this component (EmailLogTable) is placed directly inside <Table> in page.tsx.
  // This means EmailLogTable should ideally *only* return <TableBody> and its content.
  // Rendering a dialog here as a sibling to TableBody within a fragment would cause
  // the dialog (a div) to be an invalid child of <Table>.
  // For now, let's focus on the whitespace error within TableBody.

  return (
    <>
      <TableBody>
        {/* 
          Ensure there are NO spaces, newlines, or other text nodes here.
          The .map() function should be the direct source of children,
          or any conditional rendering should produce valid table rows.
        */}
        {emails.map((email) => (
          <TableRow key={String(email.id)} className="hover:bg-gray-800/40 border-gray-700 transition-colors">
            <TableCell className="font-medium text-gray-200">{email.freelancers?.name || 'N/A'}</TableCell>
            <TableCell className="font-medium text-gray-200">{email.receiver_email}</TableCell>
            <TableCell className="text-gray-300 truncate max-w-xs" title={email.subject || undefined}>
              {email.subject}
            </TableCell>
            <TableCell>
              <Badge
                variant={email.status === 'sent' ? 'default' : 'outline'}
                className={
                  email.status === 'sent'
                    ? 'bg-green-700/30 text-green-300 border-green-600/50'
                    : email.status === 'failed'
                    ? 'bg-red-700/30 text-red-300 border-red-600/50'
                    : 'bg-yellow-700/30 text-yellow-300 border-yellow-600/50'
                }
              >
                {email.status}
              </Badge>
            </TableCell>
            <TableCell className="text-gray-400">
              {new Date(email.created_at).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                title="View Email Details"
                className="text-indigo-400 hover:text-indigo-300"
                onClick={() => handleViewEmail(email)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <EmailPreviewDialog
        email={selectedEmail}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}