"use server";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import fs from "fs"; // Import Node.js file system module
import path from "path"; // Import Node.js path module

const MODEL_NAME = "gemini-2.5-flash-preview-04-17";
const API_KEY = process.env.GEMINI_API_KEY || "";

// Path to the prompt template file
const SOCIAL_POST_PROMPT_PATH = path.join(
  process.cwd(),
  "src",
  "app",
  "socialmedia",
  "prompts",
  "generatePosts.md" // Assuming this is the correct prompt file
);


if (!API_KEY) {
  console.error("CRITICAL: Gemini API Key not found in environment variables (GEMINI_API_KEY).");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const standardSafetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

interface SocialPostInput {
  topic: string;
  platform: string;
  tone: string;
  length: string;
  numberOfPosts?: number;
  language: string;
  accent?: string;
  targetAudience?: string;
  hashtagStyle?: string;
  callToAction?: string; // <-- Add optional callToAction field
}

// Helper function to load and populate prompt (adapted from generator/actions.ts)
function loadAndPopulatePrompt(
  templatePath: string,
  replacements: Record<string, string | undefined>
): string {
  let template: string;
  try {
    template = fs.readFileSync(templatePath, "utf8");
  } catch (error) {
    console.error(`Failed to read prompt template at: ${templatePath}`, error);
    throw new Error(
      `Could not load prompt template file: ${path.basename(templatePath)}`
    );
  }

  let populatedPrompt = template;
  for (const placeholder in replacements) {
    // ReplaceAll ensures all occurrences are replaced. Use empty string for undefined values.
    // Ensure the placeholder exists in the template before replacing
    if (template.includes(placeholder)) {
        populatedPrompt = populatedPrompt.replaceAll(
          placeholder,
          replacements[placeholder] || ""
        );
    } else {
        console.warn(`Placeholder "${placeholder}" not found in template: ${templatePath}`);
    }
  }
  // Optional: Remove any example usage section if present in the template
  populatedPrompt = populatedPrompt.split("---")[0].trim(); // Adjust if your template has a separator
  return populatedPrompt;
}


export async function generateSocialPostsAction(
  input: SocialPostInput
): Promise<{ success: boolean; posts?: string[]; hashtags?: string[]; error?: string }> {
  if (!API_KEY) return { success: false, error: "API Key not configured." };

  let prompt: string;
  try {
    const replacements: Record<string, string | undefined> = {
      "[insert number]": (input.numberOfPosts || 3).toString(),
      "[insert platform name]": input.platform,
      "[insert tone: e.g., professional, friendly, witty, motivational, informative]": input.tone,
      "[insert length: e.g., short (under 100 words), medium (100–150 words), or long (150–200 words)]": input.length,
      "[insert topic, e.g., digital wellness, product education, sustainable fashion, etc.]": input.topic,
      "[insert language]": input.language,
      "[insert accent]": input.accent,
      "[insert target audience, e.g., small business owners, students, tech enthusiasts]": input.targetAudience,
      "[insert hashtag style: e.g., trending, niche, mixed]": input.hashtagStyle,
      "[insert specific call to action]": input.callToAction, // <-- Add CTA replacement
    };

    // Remove placeholders that don't have a value
    Object.keys(replacements).forEach(key => {
        if (replacements[key] === undefined || replacements[key] === "") {
            console.log(`Removing placeholder "${key}" because its value is empty or undefined.`);
            // Keep the placeholder in the prompt text but don't replace it if the value is empty/undefined
            // This allows the LLM to see the instruction even if no specific value is provided
            // delete replacements[key]; // Commented out: Let the placeholder remain if value is empty
        }
    });

    prompt = loadAndPopulatePrompt(SOCIAL_POST_PROMPT_PATH, replacements);
    console.log("--- Populated Prompt ---");
    console.log(prompt);
    console.log("------------------------");

    // Clean up any remaining unfilled placeholders (like the optional accent or audience)
    prompt = prompt.replace(/\[insert accent\]/g, ''); // Remove accent placeholder if not filled
    prompt = prompt.replace(/\[insert target audience, e.g.,.*?\]/g, ''); // Remove audience placeholder if not filled
    prompt = prompt.replace(/^\s*-\s*Be written in \.$/gm, ''); // Remove empty 'Be written in .' lines if accent wasn't provided

    // Append instructions for output format
    prompt += `\n\nEnsure the posts are written in ${input.language}${input.accent ? ` (${input.accent} accent)` : ''}.`; // Add accent to instruction if provided
    prompt += "\nAlso, suggest 5-7 relevant hashtags (as a list) for this topic, including a mix of popular and niche tags.";
    prompt += "\nReturn the posts as a numbered list (e.g., 1. Post content...), then the hashtags as a separate list below the posts, under a heading like 'Suggested Hashtags:'.";


  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to build social post prompt from template.",
    };
  }


  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  try {
    console.log("[generateSocialPostsAction] Sending prompt (first 300 chars):", prompt.substring(0, 300) + "..."); // Log more chars

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 15000,
      },
      safetySettings: standardSafetySettings,
    });

    if (
      !result.response ||
      !result.response.candidates ||
      result.response.candidates.length === 0 ||
      !result.response.candidates[0].content ||
      !result.response.text // Added check for text() method existence
    ) {
       console.error("Content generation blocked or response structure invalid:", result.response);
      return { success: false, error: "Content generation blocked or empty/invalid response structure." };
    }

    const responseText = result.response.text();
    console.log('--- Raw Gemini API Response ---');
    console.log(responseText);
    console.log('--- End Raw Response ---');

    // Parse posts and hashtags from response
    const postLines = responseText.split("\n").filter(line => line.trim().length > 0);
    const posts: string[] = [];
    const hashtags: string[] = [];
    let inHashtagsSection = false;

    console.log('--- Parsing Lines ---');
    for (const line of postLines) {
        console.log(`Processing line: "${line}"`);
        // Check if the line indicates the start of the hashtags section (case-insensitive)
        // More robust check for hashtag section header
        if (!inHashtagsSection && /^\s*(suggested\s+)?(hashtags?|tags?)\s*[:\-–—]?\s*$/i.test(line.trim())) {
            console.log('Detected start of hashtags section.');
            inHashtagsSection = true;
            // Don't try to extract hashtags from the header line itself, handle in the 'else' block
            continue; // Move to the next line
        }

        if (!inHashtagsSection) {
            // Try to match lines starting with number, period, optional space
            const postMatch = line.match(/^\s*\d+\.\s*(.+)$/);
            if (postMatch && postMatch[1]) {
                const postContent = postMatch[1].trim();
                console.log(`Extracted post: "${postContent}"`);
                posts.push(postContent);
            } else {
                 console.log('Line does not match post format (e.g., "1. ...").');
            }
        } else {
            // Extract all hashtags found on the line, potentially preceded by list markers
            // Use Unicode-aware regex with the 'u' flag, looking for # preceded by optional list markers/whitespace
            const tagMatch = line.match(/#[\p{L}\p{N}_]+/gu); // Keep the core hashtag regex simple
            if (tagMatch) {
                 // Filter out any potential '#' symbols that might not be part of a valid tag if needed,
                 // but the regex should generally capture valid tags.
                const extractedTags = tagMatch.map(tag => tag.trim()).filter(tag => tag.length > 1); // Ensure it's not just '#'
                if (extractedTags.length > 0) {
                    console.log(`Extracted hashtags: ${extractedTags.join(', ')}`);
                    hashtags.push(...extractedTags);
                } else {
                    console.log('Line in hashtag section matched # pattern but resulted in empty tags after trim/filter.');
                }
            } else {
                 console.log('Line in hashtag section does not contain hashtags.');
            }
        }
    }
     console.log('--- Parsing Complete ---');
     console.log('Final Posts:', posts);
     console.log('Final Hashtags:', hashtags);


    // Add a check if parsing failed to extract anything meaningful
    if (posts.length === 0 && hashtags.length === 0 && responseText.length > 0) { // Check responseText length too
        console.warn("Parsing resulted in empty posts and hashtags despite receiving a response. Check raw response and parsing logic against the actual AI output format.");
        // Consider returning the raw response or a specific error
        // return { success: false, error: "Failed to parse posts and hashtags from the response. Raw response: " + responseText };
    }


    return { success: true, posts, hashtags };
  } catch (error: unknown) {
    console.error("Error during Gemini API call or processing:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error during generation" };
  }
}