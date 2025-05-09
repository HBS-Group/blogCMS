import { createClient } from '@/utils/supabase/server';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, // Keep Table for structure, TableHeader
  TableHeader,
  TableHead,
  TableRow,
  TableCaption,

} from "@/components/ui/table";
// Badge is now used in EmailLogTable and EmailPreviewDialog
import { Mail, ChevronUp, ChevronDown, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Tables } from "@/types/supabase";
import { EmailLogTable } from './EmailLogTable'; // Import the new client component

// New type that includes the nested freelancer name
type SentEmailWithSender = Tables<'sent_mails'> & {
  freelancers: { name: string | null } | null; // Supabase nests related data
};

// Define valid sortable columns to ensure type safety for sortBy
type SortableColumn = Extract<keyof Tables<'sent_mails'>, 'receiver_email' | 'subject' | 'status' | 'created_at'> | 'freelancers.name';

const ITEMS_PER_PAGE = 10; // Define how many items to show per page

export default async function EmailLogsPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
    sortBy?: string; // Will be validated against SortableColumn
    sortDir?: 'asc' | 'desc';
  };
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
        <div className="container mx-auto px-4 py-8">
            <p className="text-red-500">User not authenticated. Please log in to view email logs.</p>
        </div>
    );
  }

  // Await searchParams before accessing its properties
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const searchQuery = resolvedSearchParams?.query || '';
  const sortBy = (resolvedSearchParams?.sortBy) || 'created_at';
  const sortDir = resolvedSearchParams?.sortDir || 'desc';

  // Validate sortBy to prevent invalid column errors
  const validSortColumns: SortableColumn[] = ['receiver_email', 'subject', 'status', 'created_at', 'freelancers.name'];
  const validSortBy: SortableColumn = validSortColumns.includes(sortBy as SortableColumn) ? sortBy as SortableColumn : 'created_at';

  // Fetch total count for pagination
  let countQueryBuilder = supabase
    .from('sent_mails')
    .select('id', { count: 'exact', head: true }) // Select a minimal column for counting
    .eq('freelancer_id', user.id);

  if (searchQuery) {
    countQueryBuilder = countQueryBuilder.or(`receiver_email.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%`);
  }

  const { count: totalItems, error: countError } = await countQueryBuilder;

  if (countError) {
    console.error("Error fetching email count:", countError.message);
    // Handle error, perhaps show a message or fallback
  }

  const totalPages = totalItems ? Math.ceil(totalItems / ITEMS_PER_PAGE) : 0;

  // Fetch paginated and sorted emails
  // Ensure 'body' is selected for the dialog.
  let queryBuilder = supabase
    .from('sent_mails')
    .select('*, freelancers(name)') // Fetch all from sent_mails and the name from related freelancers
    .eq('freelancer_id', user.id);

  if (searchQuery) {
    queryBuilder = queryBuilder.or(`receiver_email.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%`);
  }

  // For related table sorting, Supabase expects 'foreignTable.column'
  const orderByColumn = validSortBy === 'freelancers.name' ? 'freelancers.name' : validSortBy;
  
  queryBuilder = queryBuilder.order(orderByColumn, { 
      ascending: sortDir === 'asc',
      foreignTable: validSortBy === 'freelancers.name' ? 'freelancers' : undefined,
    })
    .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

  const { data: sentEmails, error } = await queryBuilder;

  if (error) {
    console.error("Error fetching sent emails:", error.message);
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Error Loading Email Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-400">Could not retrieve email logs. Please try again later.</p>
            <p className="text-xs text-gray-500 mt-2">Details: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typedSentEmails = (sentEmails || []) as SentEmailWithSender[];

  const SortableLink = ({ column, children }: { column: SortableColumn; children: React.ReactNode }) => {
    const isCurrentSort = validSortBy === column;
    const newSortDir = isCurrentSort && sortDir === 'asc' ? 'desc' : 'asc';
    const icon = isCurrentSort ? (sortDir === 'asc' ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />) : null;
    return (
      <Link href={`/email_logs?page=${currentPage}&sortBy=${column}&sortDir=${newSortDir}&query=${searchQuery}`} className="flex items-center gap-1 hover:text-indigo-200">
        {children}
        {icon}
      </Link>
    );
  };

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

      {/* Search Form */}
      <form method="GET" action="/email_logs" className="mb-6 flex flex-col sm:flex-row gap-3 items-center">
        <Input
          type="text"
          name="query"
          placeholder="Search by recipient or subject..."
          defaultValue={searchQuery}
          className="flex-grow max-w-md bg-gray-800/70 border-gray-700 text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <input type="hidden" name="page" value="1" />
        <input type="hidden" name="sortBy" value={validSortBy} />
        <input type="hidden" name="sortDir" value={sortDir} />
        <Button type="submit" variant="outline" className="border-indigo-600 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 w-full sm:w-auto">
          Search
        </Button>
        {searchQuery && (
          <Link href={`/email_logs?page=1&sortBy=${validSortBy}&sortDir=${sortDir}`}>
            <Button variant="ghost" className="text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 w-full sm:w-auto">Clear Search</Button>
          </Link>
        )}
      </form>

      <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Email History</CardTitle>
          <CardDescription className="text-gray-400/90">
            A list of emails sent from your account.
            {totalItems !== null && ` Showing ${typedSentEmails.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE + 1) : 0}-${Math.min(currentPage * ITEMS_PER_PAGE, totalItems || 0)} of ${totalItems || 0} emails.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {typedSentEmails && typedSentEmails.length > 0 ? (
            <>
              {/* Table structure with Header remains in Server Component */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-gray-700">
                      <TableHead className="text-indigo-300 font-medium">
                        <SortableLink column="freelancers.name">Sender Name</SortableLink>
                      </TableHead>
                      <TableHead className="text-indigo-300 font-medium">
                        <SortableLink column="receiver_email">Recipient</SortableLink>
                      </TableHead>
                      <TableHead className="text-indigo-300 font-medium">
                        <SortableLink column="subject">Subject</SortableLink>
                      </TableHead>
                      <TableHead className="text-indigo-300 font-medium">
                        <SortableLink column="status">Status</SortableLink>
                      </TableHead>
                      <TableHead className="text-indigo-300 font-medium">
                        <SortableLink column="created_at">Sent At</SortableLink>
                      </TableHead>
                      <TableHead className="text-right text-indigo-300 font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  {/* EmailLogTable will render TableBody and handle dialogs */}
                  <EmailLogTable emails={typedSentEmails} />
                  {/* MOVED TableCaption here, inside Table */}
                  {totalItems !== null && typedSentEmails.length > 0 && (
                    <TableCaption className="text-gray-400/90 sr-only">
                      {totalItems} email(s) found.
                    </TableCaption>
                  )}
                </Table>
              </div>
              {/* TableCaption was here, now moved inside <Table> */}
            </>
          ) : (
            <div className="text-center text-gray-400/80 py-10">
              <p>{searchQuery ? 'No emails found matching your search.' : 'No sent emails found.'}</p>
            </div>
          )}
        </CardContent>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4 p-4 border-t border-gray-700">
            <Link
              href={`/email_logs?page=${Math.max(1, currentPage - 1)}&sortBy=${validSortBy}&sortDir=${sortDir}&query=${searchQuery}`}
              className={`p-2 rounded-md ${currentPage <= 1 ? 'text-gray-600 cursor-not-allowed bg-gray-800/50' : 'text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 bg-gray-800'}`}
              aria-disabled={currentPage <= 1}
              onClick={(e) => { if (currentPage <= 1) e.preventDefault(); }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <Link
              href={`/email_logs?page=${Math.min(totalPages, currentPage + 1)}&sortBy=${validSortBy}&sortDir=${sortDir}&query=${searchQuery}`}
              className={`p-2 rounded-md ${currentPage >= totalPages ? 'text-gray-600 cursor-not-allowed bg-gray-800/50' : 'text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 bg-gray-800'}`}
              aria-disabled={currentPage >= totalPages}
              onClick={(e) => { if (currentPage >= totalPages) e.preventDefault(); }}
            >
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}