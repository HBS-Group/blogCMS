import { createClient } from '@/utils/supabase/server';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Mail } from 'lucide-react';
import type { Tables } from "@/types/supabase";
import { EmailLogTable } from './EmailLogTable'; // Import the client component

// Type for sent emails including the nested freelancer name
type SentEmailWithSender = Tables<'sent_mails'> & {
  freelancers: { name: string | null } | null; // Supabase nests related data like this
};

export default async function EmailLogsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">User not authenticated. Please log in to view email logs.</p>
      </div>
    );
  }

  // Fetch total count for display
  const countQueryBuilder = supabase
    .from('sent_mails')
    .select('id', { count: 'exact', head: true })
    .eq('freelancer_id', user.id);

  const { count: totalItems, error: countError } = await countQueryBuilder;

  if (countError) {
    console.error("Error fetching email count:", countError.message);
    return (
        <div className="container mx-auto px-4 py-8">
            <p className="text-red-500">Could not retrieve email count. Please try again later.</p>
        </div>
    );
  }

  // Fetch all emails without pagination
  const queryBuilder = supabase
    .from('sent_mails')
    .select('*, freelancers(name)') // Fetch all from sent_mails and the name from related freelancers
    .eq('freelancer_id', user.id)
    .order('created_at', { ascending: false }); // Default ordering by created_at desc

  const { data: fetchedEmails, error: emailsError } = await queryBuilder;

  if (emailsError) {
    console.error("Error fetching emails:", emailsError.message);
    return (
        <div className="container mx-auto px-4 py-8">
            <p className="text-red-500">Could not retrieve emails. Please try again later.</p>
        </div>
    );
  }

  const typedSentEmails = (fetchedEmails || []) as SentEmailWithSender[];

  // For CardDescription
  let itemsRangeString = "";
  if (totalItems != null) {
    if (totalItems > 0 && typedSentEmails.length > 0) {
      itemsRangeString = ` Showing all ${totalItems} emails.`;
    } else if (totalItems === 0) {
      itemsRangeString = " 0 emails found.";
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center">
            <Mail className="mr-3 h-8 w-8" /> Sent Email Logs
          </h1>
          <p className="text-gray-400/90 mt-1">Review emails you&apos;ve sent.</p>
        </div>
      </div>

      <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Email History</CardTitle>
          <CardDescription className="text-gray-400/90">
            A list of emails sent from your account.
            {itemsRangeString}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {typedSentEmails && typedSentEmails.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-gray-700">
                      <TableHead className="text-indigo-300 font-medium px-4 py-3 first:pl-6 last:pr-6">Sender Name</TableHead>
                      <TableHead className="text-indigo-300 font-medium px-4 py-3 first:pl-6 last:pr-6">Recipient</TableHead>
                      <TableHead className="text-indigo-300 font-medium px-4 py-3 first:pl-6 last:pr-6">Subject</TableHead>
                      <TableHead className="text-indigo-300 font-medium px-4 py-3 first:pl-6 last:pr-6">Status</TableHead>
                      <TableHead className="text-indigo-300 font-medium px-4 py-3 first:pl-6 last:pr-6">Sent At</TableHead>
                      <TableHead className="text-right text-indigo-300 font-medium px-4 py-3 first:pl-6 last:pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  {/* EmailLogTable is expected to render TableBody and its contents */}
                  <EmailLogTable emails={typedSentEmails} /> 
                  {totalItems != null && totalItems > 0 && typedSentEmails.length > 0 && (
                    <TableCaption className="text-gray-400/90 sr-only">
                      {totalItems} email(s) found.
                    </TableCaption>
                  )}
                </Table>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400/80 py-10">
              <p>{totalItems === 0 ? 'No sent emails found.' : 'No emails match your current criteria.'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}