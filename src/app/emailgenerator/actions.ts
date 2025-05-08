"use server";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { 
  EMAIL_GENERATION_PROMPT,
  feedback_request_PROMPT,
  welcome_PROMPT,
  internal_announcement_PROMPT,
  inquiry_response_PROMPT,
  apology_PROMPT,
  thank_you_PROMPT,
  newsletter_PROMPT,
  cold_outreach_PROMPT,
  follow_up_PROMPT,
  marketing_PROMPT
} from './prompts/templates'; // Import all prompt templates

// --- Configuration ---
const MODEL_NAME = "gemini-2.5-flash-preview-04-17"; 
const API_KEY = process.env.GEMINI_API_KEY || "";

if (!API_KEY) {
  console.error("CRITICAL: Gemini API Key not found in environment variables (GEMINI_API_KEY).");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const standardSafetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// --- Input Interface ---
interface EmailGeneratorInput {
  emailType: string;
  recipientContext: string;
  objective: string;
  keyInfo: string;
  senderName?: string;
  senderPosition?: string; // <-- Add senderPosition
  companyName?: string;
  tone: string;
  length: string;
  language: string;
  accent?: string;
  callToAction?: string;
  numberOfVariations: number;
}

// --- Output Interface ---
interface GeneratedEmail {
  subject: string;
  body: string;
}

interface ActionResult {
  success: boolean;
  emails?: GeneratedEmail[];
  error?: string;
}

// --- Helper Function (Corrected) ---
function loadAndPopulatePrompt(
  promptTemplate: string,
  replacements: Record<string, string | undefined>
): string {
  let populatedPrompt = promptTemplate;
  for (const placeholder in replacements) {
    // Ensure the key is treated as a literal string for the regex
    // Escape special regex characters within the placeholder string
    const escapedPlaceholder = placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedPlaceholder, 'g');
    populatedPrompt = populatedPrompt.replace(regex, replacements[placeholder] || "N/A");
  }
   // Remove lines containing only "N/A" or empty optional fields for cleaner prompts
   populatedPrompt = populatedPrompt.split('\n').filter(line => {
    const trimmedLine = line.trim();
    // Check if the line contains an optional field marker and ends with N/A or is empty after the marker
    return !(
        (trimmedLine.startsWith('*   **Sender Name:**') && trimmedLine.endsWith(' N/A')) ||
        (trimmedLine.startsWith('*   **Sender Position:**') && trimmedLine.endsWith(' N/A')) || // <-- Add check for position
        (trimmedLine.startsWith('*   **Company Name:**') && trimmedLine.endsWith(' N/A')) ||
        (trimmedLine.startsWith('*   **Call to Action:**') && trimmedLine.endsWith(' N/A')) ||
        (trimmedLine.startsWith('*   **Accent/Dialect (if applicable):**') && trimmedLine.endsWith(' N/A'))
    );
  }).join('\n');

  // Remove the example section
  populatedPrompt = populatedPrompt.split("--- Example (Do not include this example in the final output): ---")[0].trim();
  return populatedPrompt;
}

// --- Server Action ---
export async function generateEmailsAction(input: EmailGeneratorInput): Promise<ActionResult> {
  if (!API_KEY) return { success: false, error: "API Key not configured." };

  let prompt: string;
  try {
    // Select the appropriate prompt template based on email type
    let promptTemplate: string;
    
    switch(input.emailType) {
      case "feedback_request":
        promptTemplate = feedback_request_PROMPT;
        break;
      case "welcome":
        promptTemplate = welcome_PROMPT;
        break;
      case "internal_announcement":
        promptTemplate = internal_announcement_PROMPT;
        break;
      case "inquiry_response":
        promptTemplate = inquiry_response_PROMPT;
        break;
      case "apology":
        promptTemplate = apology_PROMPT;
        break;
      case "thank_you":
        promptTemplate = thank_you_PROMPT;
        break;
      case "newsletter":
        promptTemplate = newsletter_PROMPT;
        break;
      case "cold_outreach":
        promptTemplate = cold_outreach_PROMPT;
        break;
      case "follow_up":
        promptTemplate = follow_up_PROMPT;
        break;
      case "marketing":
        promptTemplate = marketing_PROMPT;
        break;
      default:
        promptTemplate = EMAIL_GENERATION_PROMPT;
    }
    
    // Create replacements for the specific template format
    const replacements: Record<string, string | undefined> = {
      "[numberOfVariations]": (input.numberOfVariations || 1).toString(),
      "[recipientContext]": input.recipientContext,
      "[objective]": input.objective,
      "[keyInfo]": input.keyInfo,
      "[senderName]": input.senderName,
      "[senderPosition]": input.senderPosition,
      "[companyName]": input.companyName,
      "[callToAction]": input.callToAction,
      "[tone]": input.tone,
      "[length]": input.length,
      "[language]": input.language,
      "[accent]": input.accent,
      
      // For the generic template (if used)
      "[insert number]": (input.numberOfVariations || 1).toString(),
      "[insert email type]": input.emailType,
      "[insert recipient context]": input.recipientContext,
      "[insert objective]": input.objective,
      "[insert key info]": input.keyInfo,
      "[insert sender name]": input.senderName,
      "[insert sender position]": input.senderPosition,
      "[insert company name]": input.companyName,
      "[insert call to action]": input.callToAction,
      "[insert tone]": input.tone,
      "[insert length]": input.length,
      "[insert language]": input.language,
      "[insert accent]": input.accent,
    };

    prompt = loadAndPopulatePrompt(promptTemplate, replacements);
    console.log("--- Generated Prompt ---");
    console.log(prompt);
    console.log("--- End Generated Prompt ---");

  } catch (error: unknown) {
    console.error("Error building prompt:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to build email generation prompt." };
  }

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 150000, // Adjusted back from 150000, check if needed
      },
      safetySettings: standardSafetySettings,
    });

     if (!result.response || !result.response.candidates || result.response.candidates.length === 0 || !result.response.candidates[0].content) {
        const blockReason = result.response?.promptFeedback?.blockReason;
        const safetyRatings = result.response?.promptFeedback?.safetyRatings;
        console.error("Content generation blocked or invalid response structure.", { blockReason, safetyRatings, response: result.response });
        let errorMsg = "Content generation failed.";
        if (blockReason) {
            errorMsg += ` Reason: ${blockReason}.`;
        }
        if (safetyRatings && safetyRatings.length > 0) {
             errorMsg += ` Safety issues detected: ${safetyRatings.map(r => `${r.category} (${r.probability})`).join(', ')}.`;
        }
        return { success: false, error: errorMsg };
    }

    const responseText = result.response.text();
    console.log('--- Raw Gemini API Response ---'); // Keep this log for debugging
    console.log(responseText);
    console.log('--- End Raw Response ---');

    // --- Parsing Logic ---
    const emails: GeneratedEmail[] = [];
    // Improved splitting regex to handle variations in whitespace and case around the marker
    const variations = responseText.split(/---\s*End Variation\s*\d+\s*---/i);

    console.log('--- Parsing Variations ---'); // Keep this log
    for (const variation of variations) {
        const cleanVariation = variation.trim();
        if (cleanVariation.length === 0) continue; // Skip empty splits

        // More robust regex for subject and body extraction
        const subjectMatch = cleanVariation.match(/Subject:\s*([\s\S]*?)Body:/i); // Non-greedy match until Body:
        const bodyMatch = cleanVariation.match(/Body:\s*([\s\S]*)/i); // Match everything after Body:

        if (subjectMatch && subjectMatch[1] && bodyMatch && bodyMatch[1]) {
            const subject = subjectMatch[1].trim();
            let body = bodyMatch[1].trim();
            // Remove the "Variation X:" line if it's still present at the beginning
            body = body.replace(/^\s*Variation \d+:\s*/i, '').trim();

            console.log(`Parsed Subject: "${subject}"`); // Keep this log
            // console.log(`Parsed Body:\n"${body}"`); // Uncomment if needed
            emails.push({ subject, body });
        } else {
             console.warn("Could not parse subject/body from variation chunk:", cleanVariation); // Log the problematic chunk
        }
    }
     console.log('--- Parsing Complete ---'); // Keep this log
     console.log('Final Emails:', emails); // Keep this log

    if (emails.length === 0 && responseText.trim().length > 0 && !responseText.includes("Please provide the specific details")) {
      // Only warn if parsing failed AND the response wasn't the placeholder message
      console.warn("Parsing resulted in empty emails despite receiving a potentially valid response. Check raw response and parsing logic against the actual AI output format.");
      // Optional: Return raw text if parsing fails but text exists
      // return { success: false, error: "Failed to parse emails from the response. Raw response: " + responseText };
    }

    if (emails.length !== input.numberOfVariations && emails.length > 0) { // Only warn if we got *some* emails but not the expected number
         console.warn(`Expected ${input.numberOfVariations} variations, but parsed ${emails.length}. The AI might not have generated all requested variations.`);
    }


    return { success: true, emails };

  } catch (error: unknown) {
    console.error("Error during Gemini API call or processing:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error during email generation" };
  }
}