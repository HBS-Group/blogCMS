import { notFound, redirect } from 'next/navigation'; // Added redirect
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Reply, Forward, Trash2, Download } from 'lucide-react';
import Link from 'next/link';
import Imap from 'node-imap';
import { simpleParser } from 'mailparser';
import { revalidatePath } from 'next/cache';

// Define the Email type (same as in mailbox/page.tsx)
type Email = {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  snippet: string;
  body: string;
  received_at: string;
  is_read: boolean;
  avatar_url?: string;
};

// Function to fetch a single email by ID
async function fetchEmailById(id: string): Promise<Email | null> {
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
    };

    if (!imapConfig.user || !imapConfig.password) {
      console.error("IMAP credentials are not configured.");
      return reject(new Error("IMAP credentials are not configured."));
    }

    const imap = new Imap(imapConfig);
    let foundEmail: Email | null = null;

    // function openInbox(cb: (error: Error | null, box?: Imap.Box) => void) {
    //   imap.openBox('INBOX', false, cb); // false for read-only mode, true for read-write
    // }

    imap.once('ready', () => {
     
      imap.openBox('INBOX', false, async (err, box) => { // Changed to false, if setFlags is an issue, it should be true and subsequent operations adjusted
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

        try {
          const uidNumber = parseInt(id, 10);
          if (isNaN(uidNumber)) {
            imap.end(); // Make sure to end imap connection
            return reject(new Error(`Invalid email ID: ${id}`));
          }
          
          imap.setFlags([uidNumber], ['\\Seen'], (markErr) => {
            if (markErr) console.error('Error marking email as read:', markErr); // Log error but continue
          });
          
          const f = imap.fetch(uidNumber, {
            bodies: [''],
            struct: true,
            // envelope: true, // envelope is not strictly needed if simpleParser gets all headers
          });

          let buffer = '';
          let messageFound = false;

          f.on('message', (msg: Imap.ImapMessage) => {
            messageFound = true;
            msg.on('body', (stream: NodeJS.ReadableStream) => {
              stream.on('data', (chunk: Buffer) => {
                buffer += chunk.toString('utf8');
              });
            });
            // Removed stream.once('end') logic from here as buffer is global to fetchEmailById scope
            // and simpleParser is called in f.once('end')
          });

          f.once('error', (fetchErr: Error) => {
            console.error('Fetch error:', fetchErr);
            imap.end();
            reject(fetchErr);
          });

          f.once('end', async () => {
            if (!messageFound) {
              imap.end();
              // Resolve with null if not found, consistent with Promise<Email | null>
              return resolve(null); 
            }
            
            try {
              const parsedEmail = await simpleParser(buffer);
              const sender = parsedEmail.from?.value[0];
              const subject = parsedEmail.subject || 'No Subject';
              const receivedDate = parsedEmail.date || new Date();
              const bodyContent = parsedEmail.html || parsedEmail.textAsHtml || parsedEmail.text || '';

              foundEmail = {
                id: id, // Use the original UID string
                sender_name: sender?.name || (sender?.address || 'Unknown Sender').split('@')[0],
                sender_email: sender?.address || 'unknown@example.com',
                subject: subject,
                snippet: (parsedEmail.text || '').substring(0, 150) + '...',
                body: bodyContent,
                received_at: receivedDate.toISOString(),
                is_read: true, 
                avatar_url: undefined 
              };
              
              imap.end();
              resolve(foundEmail);
            } catch (parseError) {
              console.error(`Error parsing email:`, parseError);
              imap.end();
              reject(new Error(`Failed to parse email: ${parseError instanceof Error ? parseError.message : String(parseError)}`));
            }
          });
        } catch (searchErr) {
          console.error('Error searching for email:', searchErr);
          imap.end();
          reject(searchErr);
        }
      });
    });

    imap.once('error', (imapErr: Error) => {
      console.error('IMAP connection error:', imapErr);
      reject(imapErr);
    });

    imap.once('end', () => {
      // console.log('IMAP connection ended for fetchEmailById.'); // Less verbose
    });

    imap.connect();
  });
}

// Server action to delete an email
async function deleteEmailAction(emailId: string) { // Renamed parameter to avoid conflict
  'use server';
  
  const imapConfig: Imap.Config = {
    user: process.env.NEXT_PUBLIC_IMAP_USER || '',
    password: process.env.NEXT_PUBLIC_IMAP_PASSWORD || '',
    host: process.env.NEXT_PUBLIC_IMAP_HOST || 'imap.hostinger.com',
    port: parseInt(process.env.NEXT_PUBLIC_IMAP_PORT || '993', 10),
    tls: process.env.NEXT_PUBLIC_IMAP_TLS === 'true' || true,
    tlsOptions: {
      rejectUnauthorized: process.env.NEXT_PUBLIC_IMAP_TLS_REJECT_UNAUTHORIZED === 'false' ? false : true,
    },
  };

  if (!imapConfig.user || !imapConfig.password) {
    console.error("IMAP credentials for delete are not configured.");
    throw new Error("IMAP credentials for delete are not configured.");
  }

  return new Promise<void>((resolve, reject) => { // Return Promise<void> for actions
    const imap = new Imap(imapConfig);

    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err) => { // false for read-write
        if (err) {
          console.error('Error opening INBOX for delete:', err);
          imap.end();
          return reject(err);
        }
        
        const uidNumber = parseInt(emailId, 10);
        if (isNaN(uidNumber)) {
          imap.end();
          return reject(new Error(`Invalid email ID for delete: ${emailId}`));
        }

        imap.addFlags(uidNumber, '\\Deleted', (flagErr) => {
          if (flagErr) {
            console.error('Error flagging email as deleted:', flagErr);
            imap.end();
            return reject(flagErr);
          }

          imap.expunge((expungeErr) => {
            if (expungeErr) {
              console.error('Error expunging mailbox:', expungeErr);
              imap.end();
              return reject(expungeErr);
            }
            console.log(`Email ${emailId} marked as deleted and expunged.`);
            imap.end();
            resolve();
          });
        });
      });
    });

    imap.once('error', (imapErr) => {
      console.error('IMAP connection error for delete:', imapErr);
      reject(imapErr);
    });

    imap.once('end', () => {
      // console.log('IMAP connection ended for deleteEmailAction.'); // Less verbose
    });

    imap.connect();
  });
}
interface EmailPageProps {
    params: Promise<{ id: string }>;
  }
  export default async function EmailPage({ params }: EmailPageProps) {
    // Resolve the params Promise to get the actual id
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
  let email: Email | null = null;
  let error: string | null = null;

  try {
    if (!id || !/^\d+$/.test(id.toString())) {
      // This should ideally result in a 404 or a specific error page.
      // Throwing an error here will be caught by the catch block.
      throw new Error(`Invalid email ID format: ${id}`);
    }
    
    email = await fetchEmailById(id.toString()); // Convert id to string for fetchEmailById
    if (!email) {
      // If fetchEmailById resolves to null (e.g., email not found), trigger notFound().
      return notFound();
    }
  } catch (err) {
    console.error(`Error fetching email ${id}:`, err);
    // Set error state to display to the user
    error = err instanceof Error ? err.message : "An unknown error occurred while fetching the email.";

  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-red-500 text-lg mb-4">Error Loading Email</div>
            <p className="text-gray-300 mb-6">{error}</p>
            <Button asChild className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white">
              <Link href="/mailbox">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Inbox
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // This check is technically redundant if error handling above is comprehensive
  // and fetchEmailById correctly returns null for not found, triggering notFound().
  // However, keeping it as a safeguard.
  if (!email) {
    return notFound();
  }

  // Server action for handling delete, simplified.
  // The form action will call this, and Next.js handles redirect/revalidation.
  const handleDeleteSubmit = async () => {
    'use server';
    try {
      await deleteEmailAction(id.toString()); // Use the id from component scope
      revalidatePath('/mailbox'); // Revalidate the inbox page
      revalidatePath(`/mailbox/${id}`); // Revalidate current page (might be 404 after delete)
      redirect('/mailbox'); // Redirect to inbox
    } catch (err) {
      console.error("Error deleting email (action):", err);
      // Handle error display, perhaps by redirecting with an error query param
      // or by re-rendering the page with an error message (more complex with redirects).
      // For simplicity, just log and the redirect might fail or show old data until revalidation.
      // A more robust solution would involve client-side state updates or error messages.
      // For now, if delete fails, user stays on page, error logged server-side.
      // A redirect with an error message could be: redirect(`/mailbox?error=delete_failed`);
      // Or, simply do not redirect on error, let the user retry.
      // Here we re-throw to let Next.js handle the action error if needed.
      throw new Error(err instanceof Error ? err.message : "Failed to delete email");
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-4">
        <Button asChild variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
          <Link href="/mailbox">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Inbox
          </Link>
        </Button>
      </div>

      <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm mb-6">
        <CardHeader className="border-b border-gray-800 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold text-white mb-2">{email.subject}</CardTitle>
              <div className="flex items-center space-x-3 mt-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={email.avatar_url} alt={email.sender_name} />
                  <AvatarFallback className="bg-indigo-500 text-white">
                    {(email.sender_name?.split(' ').map(n => n[0]).join('') || email.sender_email?.[0] || 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium text-gray-200">{email.sender_name}</div>
                  <div className="text-xs text-gray-400">{email.sender_email}</div>
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {new Date(email.received_at).toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="py-6">
          <div 
            className="prose prose-sm sm:prose-base prose-invert max-w-none prose-headings:text-gray-300 prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-strong:text-gray-200 prose-code:bg-gray-700 prose-code:p-1 prose-code:rounded prose-blockquote:border-indigo-500"
            dangerouslySetInnerHTML={{ __html: email.body }}
          />
        </CardContent>
        
        <CardFooter className="border-t border-gray-800 pt-4 flex flex-wrap justify-between gap-2">
          <div className="flex space-x-2">
            <Button asChild variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
              <Link href={`/mailbox/compose?replyTo=${email.id}&subject=${encodeURIComponent("Re: " + email.subject)}&sender=${encodeURIComponent(email.sender_email)}`}>
                <Reply className="mr-2 h-4 w-4" /> Reply
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
            <Link href={`/mailbox/compose?forwardSubject=${encodeURIComponent("Fwd: " + email.subject)}&forwardBody=${encodeURIComponent("\n\n-------- Forwarded message --------\nFrom: " + email.sender_name + " <" + email.sender_email + ">\nDate: " + new Date(email.received_at).toLocaleString() + "\nSubject: " + email.subject + "\n\n" + email.body.replace(/<[^>]*>?/gm, ''))}`}>
                <Forward className="mr-2 h-4 w-4" /> Forward
              </Link>
            </Button>
            {/* Download button functionality would require server-side logic to fetch raw email and serve as a file */}
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white" disabled title="Download not implemented">
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          </div>
          
          <form action={handleDeleteSubmit}>
            <Button 
              type="submit"
              variant="destructive" 
              className="bg-rose-700 hover:bg-rose-800 text-white"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}