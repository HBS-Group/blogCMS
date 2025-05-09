import type { TablesInsert } from "@/types/supabase"; 
import { createClient } from '@/utils/supabase/server';


export async function sendAndLogEmail(
  recipient: string,
  subject: string,
  inlinedHtml: string ,
  info: { messageId: string }
) {


  try {
    // Save the email to the database
    const supabase = await createClient();


    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      console.error("Error getting user for logging sent email:", authError?.message || "No authenticated user");
      // The email was sent successfully. Consider if this failure to log should make the whole operation fail.
      // For now, we'll return success true as the primary operation (email sending) succeeded.
      // But we'll log the error.
      return {
        success: true, // Email sent
        message: `Email sent successfully: ${info.messageId}, but failed to get user to log the email.`,
        messageId: info.messageId,
        logError: authError?.message || "No authenticated user",
      };
    }
    const userId = authUser.id; // This will be your freelancer_id

    // Prepare the data for insertion, matching the 'sent_mails' table columns
    // This uses the generated 'Insert' type for 'sent_mails' for type safety.
    const emailDataToSave: TablesInsert<"sent_mails"> = {
      freelancer_id: userId,
      receiver_email: recipient,
      subject: subject,
      body: inlinedHtml, // Or textVersion, or a combined/specific body variable
      status: "sent",    // As per your original snippet
      message_id: info.messageId, // From Nodemailer's response
    };

    const { error: insertError } = await supabase
      .from("sent_mails")
      .insert([emailDataToSave]); // Supabase expects an array of objects for insertion

    if (insertError) {
      console.error("Error saving sent email record to database:", insertError.message);
      // Email was sent, but DB save failed.
      // Return success true for email, but include DB error information.
      return {
        success: true, // Email sent
        message: `Email sent successfully: ${info.messageId}, but failed to save record to database.`,
        messageId: info.messageId,
        dbError: insertError.message,
      };
    } else {
      console.log(`Sent email record saved to database for message_id: ${info.messageId}`);
    }

    return {
      success: true,
      message: `Email sent successfully: ${info.messageId}`,
      messageId: info.messageId,
    };

  } catch (error: unknown) { 
    console.error("Error sending email or processing:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to send email";
    

    return {
      success: false,
      message: errorMessage,
      
    };
  }
}