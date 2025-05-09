
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from 'next/link';
import { Inbox, Send, Eye, Trash2, MailOpen, Mail as MailIcon } from 'lucide-react'; // Added MailOpen, MailIcon
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // For sender avatar
import { revalidatePath } from 'next/cache'; // If you have actions that modify data
import Imap from 'node-imap';
// import { inspect } from 'util'; 
import { simpleParser } from 'mailparser'; // For easier email parsing

// Define the type for an email
// Replace this with your actual email type, possibly from Supabase types
type Email = {
  id: string; // Will use IMAP message UID
  sender_name: string;
  sender_email: string;
  subject: string;
  snippet: string; // A short preview of the email body
  body: string; // Full email body (can be HTML or text)
  received_at: string; // ISO date string
  is_read: boolean;
  avatar_url?: string; // Optional: URL for sender's avatar
};

// Updated data fetching function using node-imap
async function fetchEmails(): Promise<Email[]> {
  return new Promise((resolve, reject) => {
    const imapConfig: Imap.Config = {
      user: process.env.NEXT_PUBLIC_IMAP_USER || '', 
      password: process.env.NEXT_PUBLIC_IMAP_PASSWORD || '',
      host: process.env.NEXT_PUBLIC_IMAP_HOST || 'imap.hostinger.com',
      port: parseInt(process.env.NEXT_PUBLIC_IMAP_PORT || '993', 10), 
      tls: process.env.NEXT_PUBLIC_IMAP_TLS === 'true' || true, 
      tlsOptions: {
        rejectUnauthorized: process.env.NEXT_PUBLIC_IMAP_TLS_REJECT_UNAUTHORIZED === 'false' ? false : true,
      },
      // debug: console.log, // Uncomment for detailed IMAP logging
    };

    if (!imapConfig.user || !imapConfig.password) {
      console.error("IMAP_USER or IMAP_PASSWORD environment variables are not set.");
      return reject(new Error("IMAP credentials are not configured."));
    }

    const imap = new Imap(imapConfig);
    const fetchedEmails: Email[] = [];

    function openInbox(cb: (error: Error | null, box?: Imap.Box) => void) {
      imap.openBox('INBOX', false, cb); // false for read-only if you don't intend to modify flags here
    }

    imap.once('ready', () => {
      openInbox((err, box) => {
        if (err) {
          console.error('Error opening INBOX:', err);
          imap.end();
          return reject(err);
        }
        if (!box) {
          const e = new Error('Mailbox not found or could not be opened');
          console.error(e);
          imap.end();
          return reject(e);
        }

        // Fetch the last 20 emails for example. Adjust as needed.
        // For all emails: '1:*'
        // For unread: ['UNSEEN']
        // const fetchStart = Math.max(1, box.messages.total - 19);
        const fetchRange = '1:*';

        if (box.messages.total === 0) {
          console.log('Inbox is empty.');
          imap.end();
          return resolve([]);
        }
        
        const f = imap.seq.fetch(fetchRange, {
          bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'], // Fetch headers and text body
          struct: true, // To understand email structure (e.g., multipart)
          envelope: true, // For parsed header fields
          markSeen: false, // To get \Seen flag without marking as read
        });

        f.on('message', (msg: Imap.ImapMessage, seqno: number) => {
          let buffer = '';
          let msgAttributes: Imap.ImapMessageAttributes;

          msg.on('body', (stream: NodeJS.ReadableStream) => {
            stream.on('data', (chunk: Buffer) => {
              buffer += chunk.toString('utf8');
            });
            stream.once('end', () => {
              // Body part is fully received
            });
          });

          msg.once('attributes', (attrs: Imap.ImapMessageAttributes) => {
            msgAttributes = attrs;
          });

          msg.once('end', async () => {
            try {
              const parsedEmail = await simpleParser(buffer); // Use mailparser for robust parsing

              const sender = parsedEmail.from?.value[0];
              const subject = parsedEmail.subject || 'No Subject';
              const receivedDate = parsedEmail.date || new Date();
              const isRead = msgAttributes.flags.includes('\\Seen');
              // Use textAsHtml if available, otherwise text. For snippet, truncate.
              const bodyContent = parsedEmail.html || parsedEmail.textAsHtml || parsedEmail.text || '';
              const textSnippet = (bodyContent).substring(0, 150) + '...';

              fetchedEmails.push({
                id: msgAttributes.uid.toString(), // Use UID as a stable ID
                sender_name: sender?.name || (sender?.address || 'Unknown Sender').split('@')[0],
                sender_email: sender?.address || 'unknown@example.com',
                subject: subject,
                snippet: textSnippet,
                body: bodyContent,
                received_at: receivedDate.toISOString(),
                is_read: isRead,
                // avatar_url: you might need a service like Gravatar or parse from HTML body
              });
            } catch (parseError) {
              console.error(`Error parsing email seqno ${seqno}:`, parseError);
            }
          });
        });

        f.once('error', (fetchErr: Error) => {
          console.error('Fetch error:', fetchErr);
          imap.end();
          reject(fetchErr);
        });

        f.once('end', () => {
          console.log('Done fetching all messages!');
          imap.end();
          resolve(fetchedEmails.sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime())); // Sort by date descending
        });
      });
    });

    imap.once('error', (imapErr: Error) => {
      console.error('IMAP connection error:', imapErr);
      reject(imapErr);
    });

    imap.once('end', () => {
      console.log('IMAP connection ended.');
    });

    imap.connect();
  });
}

export default async function MailboxPage() {
  let emails: Email[] = [];
  let fetchError: string | null = null;

  try {
    emails = await fetchEmails();
  } catch (error) {
    console.error("Error fetching emails:", error);
    fetchError = error instanceof Error ? error.message : "An unknown error occurred while fetching emails.";
  }

  if (fetchError) {
    return <div className="container mx-auto p-4 md:p-6 lg:p-8 text-red-500">Error loading emails: {fetchError}</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card className="mb-6 bg-gray-900/80 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center">
                <Inbox className="mr-2 h-6 w-6" /> Inbox
              </CardTitle>
              <CardDescription className="text-gray-400/90">
                Manage your received emails.
              </CardDescription>
            </div>
            <Button asChild className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-indigo-500/20 transition-all">
              {/* Link to a compose page or trigger a compose modal */}
              <Link href="/sendemail">
                <Send className="mr-2 h-4 w-4" /> Compose Email
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {emails && emails.length > 0 ? (
        <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
          <Table>
            <TableCaption className="text-gray-400/90">
              A list of your recent emails.
            </TableCaption>
            <TableHeader>
              <TableRow className="bg-gray-800/60 hover:bg-transparent">
                <TableHead className="w-[250px] text-indigo-300 font-medium">Sender</TableHead>
                <TableHead className="text-indigo-300 font-medium">Subject & Snippet</TableHead>
                <TableHead className="w-[180px] text-indigo-300 font-medium">Date</TableHead>
                <TableHead className="text-right text-indigo-300 font-medium w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emails.map((email) => (
                <TableRow 
                  key={email.id} 
                  className={`hover:bg-gray-800/40 border-gray-800 transition-colors ${!email.is_read ? 'bg-gray-800/20' : ''}`}
                >
                  <TableCell className={`py-3 ${!email.is_read ? 'font-semibold' : 'font-medium'}`}>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={email.avatar_url} alt={email.sender_name} />
                        <AvatarFallback className="bg-indigo-500 text-white text-xs">
                          {email.sender_name.split(' ').map(n => n[0]).join('').toUpperCase() || email.sender_email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className={`text-sm ${!email.is_read ? 'text-indigo-300' : 'text-gray-100'}`}>{email.sender_name}</div>
                        <div className="text-xs text-gray-400">{email.sender_email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Link href={`/mailbox/${email.id}`} className="hover:underline">
                      <div className={`text-sm ${!email.is_read ? 'text-indigo-300 font-semibold' : 'text-gray-200'}`}>{(email.subject).substring(0, 30)}</div>
                      
                    </Link>
                  </TableCell>
                  <TableCell className={`text-xs py-3 ${!email.is_read ? 'text-indigo-400/90' : 'text-gray-400/90'}`}>
                    {new Date(email.received_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    <div className="text-gray-500">
                      {new Date(email.received_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-3">
                    <div className="flex justify-end items-center space-x-1">
                       {/* Placeholder for Mark as Read/Unread action */}
                       <form action={async () => {
                        'use server';
                        // const supabase = await createClient();
                        // await supabase.from('your_emails_table').update({ is_read: !email.is_read }).eq('id', email.id);
                        console.log(`Toggling read status for ${email.id} to ${!email.is_read}`);
                        revalidatePath('/mailbox');
                      }}>
                        <Button variant="ghost" size="sm" type="submit" title={email.is_read ? "Mark as Unread" : "Mark as Read"} className="text-indigo-400 hover:text-indigo-300">
                          {email.is_read ? <MailIcon className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                        </Button>
                      </form>
                      <Button variant="ghost" size="sm" asChild title="View Email" className="text-indigo-400 hover:text-indigo-300">
                        <Link href={`/mailbox/${email.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <form action={async () => {
                        'use server';
                        // const supabase = await createClient();
                        // await supabase.from('your_emails_table').delete().eq('id', email.id);
                        console.log(`Deleting email ${email.id}`);
                        revalidatePath('/mailbox');
                      }}>
                        <Button variant="ghost" size="sm" type="submit" title="Delete Email" className="text-rose-500 hover:text-rose-400">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
          <CardContent className="py-12">
            <div className="text-center text-gray-400/80">
              <Inbox className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Your inbox is empty</h3>
              <p className="text-sm">You have no new emails at the moment.</p>
              <Button asChild className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white">
                <Link href="/mailbox/compose">
                  <Send className="mr-2 h-4 w-4" /> Compose First Email
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}