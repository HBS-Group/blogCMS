// app/generator/actions.ts
"use server";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

import {articlegeneration} from "./prompt-templates/article-generation";
import {TITLE_GENERATION_PROMPT} from "./prompt-templates/title-generation";
import {OUTLINE_GENERATION_PROMPT} from "./prompt-templates/outline-generation";
import {IMAGE_PROMPT_PATH} from "./prompt-templates/image-prompt";
// --- Constants ---
// Use the latest stable model or the specific experimental one you prefer
const MODEL_NAME = "gemini-2.5-flash-preview-04-17";
const API_KEY = process.env.GEMINI_API_KEY || "";




// --- Initialization & Validation ---
if (!API_KEY) {
  console.error(
    "CRITICAL: Gemini API Key not found in environment variables (GEMINI_API_KEY)."
  );
  // Consider throwing an error here in production if the key is absolutely required
  // throw new Error("Gemini API Key is missing.");
}
// Initialize the SDK - ensure this happens only once if possible, but server actions are stateless.
const genAI = new GoogleGenerativeAI(API_KEY);

// Standard safety settings used across actions
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

// --- Interfaces ---
// Define the input structure expected from the form for Article Generation
interface GenerationInput {
  primaryKeyword: string;
  contentType: string;
  articleTitle: string;
  targetCountry: string;
  targetLanguage: string;
  articleLength: string;
  toneOfVoice: string;
  pointOfView: string;
  secondaryKeywords: string;
  outline: string; // Assuming the generated outline text
  includeCta: boolean;
  includeSummary: boolean;
  includeFaq: boolean;
  includeLinks: boolean;
  includeStats: boolean;
  includeImages: boolean;
  creativityLevel: number; // Value from 0 to 100
}

// --- Helper Functions ---

/**
 * Maps a 0-100 slider value to a 0.1 - 1.0 temperature range.
 */
function mapCreativityToTemperature(level: number): number {
  const mappedTemp = (level / 100) * 0.9 + 0.1;
  return Math.max(0.1, Math.min(1.0, mappedTemp)); // Clamp between 0.1 and 1.0
}

/**
 * Reads a prompt template file and replaces placeholders.
 * @param templatePath Path to the .md template file.
 * @param replacements An object where keys are placeholders (like "__KEYWORD__") and values are the replacements.
 * @returns The populated prompt string.
 * @throws Error if the template file cannot be read.
 */
function loadAndPopulatePrompt(
  promptTemplate: string,
  replacements: Record<string, string | undefined>
): string {
  let populatedPrompt = promptTemplate;
  
  for (const placeholder in replacements) {
    // ReplaceAll ensures all occurrences are replaced. Use empty string for undefined values.
    // Ensure the placeholder exists in the template before replacing
    if (promptTemplate.includes(placeholder)) {
        populatedPrompt = populatedPrompt.replaceAll(
          placeholder,
          replacements[placeholder] || ""
        );
    } else {
        console.warn(`Placeholder "${placeholder}" not found in template`);
    }
  }
  // Optional: Remove any example usage section if present in the template
  populatedPrompt = populatedPrompt.split("---")[0].trim(); // Adjust if your template has a separator
  return populatedPrompt;
}



// --- ACTION: Generate Article Content ---
export async function generateArticleAction(
  input: GenerationInput
): Promise<{ success: boolean; content?: string; error?: string }> {
  if (!API_KEY) return { success: false, error: "API Key not configured." };

  let prompt: string;
  try {
    // Prepare dynamic instruction parts for the article prompt
    let creativityInstruction = "";
    if (input.creativityLevel < 30)
      creativityInstruction =
        "Prioritize factual accuracy and straightforward language.";
    else if (input.creativityLevel > 70)
      creativityInstruction =
        "Feel free to use more creative language, analogies, and engaging phrasing.";

    const includeCtaInstruction = input.includeCta
      ? "- Include a relevant Call-to-Action paragraph towards the end (e.g., within the conclusion section)."
      : "";
    const includeSummaryInstruction = input.includeSummary
      ? "- Include a 'Key Takeaways' or 'Summary' section with a clear heading (e.g., <h2>Summary</h2>) containing a bulleted list of main points."
      : "";
    const includeFaqInstruction = input.includeFaq
      ? `- Include an FAQ section with a clear heading (e.g., <h2>Frequently Asked Questions</h2>). Format each question/answer pair clearly (e.g., <FaqItem key={idx} question="Question" answer="Answer" />.`
      : "";
    const includeLinksInstruction = input.includeLinks
      ? "- Include placeholder links like <a href='#link'>[relevant descriptive link text]</a> where appropriate for section in the article internal resources if its not exsist wirte contnet about it if needed if not dont link it to unknown id."
      : "";
    const includeStatsInstruction = input.includeStats
      ? "- Incorporate relevant statistics or data points where applicable. Use placeholders like [statistic about X] if specific numbers are unknown."
      : "";
    const includeImagesInstruction = input.includeImages
      ? "- Suggest relevant image ideas within paragraphs like [Image suggestion: A visual explaining concept Y] where appropriate."
      : "";
    const faqExamplePlaceholder = input.includeFaq
      ? `<FaqItem key={idx} question="Question" answer="Answer" />`
      : "";
    const todayDate = new Date().toDateString();
    // Define replacements for the article template placeholders
    const replacements: Record<string, string | undefined> = {
      __CONTENT_TYPE__: input.contentType,
      __PRIMARY_KEYWORD__: input.primaryKeyword,
      __ARTICLE_TITLE__:
        input.articleTitle || "Generate a suitable title based on the keyword",
      __TARGET_COUNTRY__: input.targetCountry,
      __TARGET_LANGUAGE__: input.targetLanguage,
      __ARTICLE_LENGTH__: input.articleLength,
      __TONE_OF_VOICE__: input.toneOfVoice,
      __POINT_OF_VIEW__: input.pointOfView,
      
      __ENGINE_RESULTS__: input.secondaryKeywords || "None specified",
      __OUTLINE__:
        input.outline || "<!-- Outline was not provided or generated -->", // Ensure valid HTML comment if outline is missing
      __INCLUDE_CTA_INSTRUCTION__: includeCtaInstruction,
      __INCLUDE_SUMMARY_INSTRUCTION__: includeSummaryInstruction,
      __INCLUDE_FAQ_INSTRUCTION__: includeFaqInstruction,
      __INCLUDE_LINKS_INSTRUCTION__: includeLinksInstruction,
      __INCLUDE_STATS_INSTRUCTION__: includeStatsInstruction,
      __INCLUDE_IMAGES_INSTRUCTION__: includeImagesInstruction,
      __CREATIVITY_INSTRUCTION__: creativityInstruction,
      __FAQ_EXAMPLE_PLACEHOLDER__: faqExamplePlaceholder,
      __TODAT_DATE__: todayDate,
    };

    prompt = loadAndPopulatePrompt(articlegeneration, replacements);
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to build article prompt from template.",
    };
  }

  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const dynamicTemperature = mapCreativityToTemperature(input.creativityLevel);
  console.log(
    `[generateArticleAction] Using Model: ${MODEL_NAME}, Temp: ${dynamicTemperature.toFixed(
      2
    )} (Level: ${input.creativityLevel})`
  );

  const generationConfig = {
    temperature: dynamicTemperature,
    maxOutputTokens: 50000, // Generous token limit for Gemini 1.5
    // topP, topK optional
  };

  try {
    // console.log(
    //   "[generateArticleAction] Sending prompt from template (first 200 chars):",
    //   prompt
    // );
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings: standardSafetySettings,
    });

    if (
      !result.response ||
      !result.response.candidates ||
      result.response.candidates.length === 0 ||
      !result.response.candidates[0].content
    ) {
      const blockReason = result.response?.promptFeedback?.blockReason;
      const safetyRatings = result.response?.promptFeedback?.safetyRatings;
      console.error(
        "[generateArticleAction] Gemini response blocked or empty:",
        { blockReason, safetyRatings }
      );
      return {
        success: false,
        error: `Content generation blocked or empty. Reason: ${
          blockReason || "Unknown safety/empty issue"
        }. Review safety settings or prompt.`,
      };
    }

    const responseText = result.response.text();

    // Basic cleaning (LLM should follow instructions, but good fallback)
    const cleanedContent = responseText
      .replace(/^```(?:html|markdown)?\s*/i, "")
      .replace(/```$/i, "")
      .replace(/^.*GENERAT[E|ING].*HTML BELOW THIS LINE.*$/im, "") // Remove marker line
      .trim();

    // console.log(
    //   "[generateArticleAction] Gemini generated content successfully (first 200 chars):",
    //   cleanedContent.substring(0, 200) + "..."
    // );
    return { success: true, content: cleanedContent };
  } catch (error: unknown) {
    const err = error as Error & {
      response?: { data?: { error?: { message: string } } };
    };
    console.error("[generateArticleAction] Error calling Gemini API:", err);
    const apiErrorMessage = err.response?.data?.error?.message;
    const errorMessage = apiErrorMessage
      ? `Gemini API Error: ${apiErrorMessage}`
      : err.message || "An unknown error occurred during generation.";
    return { success: false, error: errorMessage };
  }
}

// --- ACTION: Generate Title Suggestions ---
export async function generateTitleAction(
  primaryKeyword: string,
  targetCountry: string,
  targetLanguage: string,
  contentType: string,
  blogCategories: string
): Promise<{ success: boolean; titles?: string[]; error?: string }> {
  if (!API_KEY) return { success: false, error: "API Key not configured." };

  let prompt: string;
  try {
    const replacements: Record<string, string | undefined> = {
      __PRIMARY_KEYWORD__: primaryKeyword,
      __BLOG_CATEGORY__: blogCategories,
      __TARGET_COUNTRY__: targetCountry,
      __TARGET_LANGUAGE__: targetLanguage,
      __CONTENT_TYPE__: contentType,
    };
    prompt = loadAndPopulatePrompt(TITLE_GENERATION_PROMPT, replacements);
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to build title prompt from template.",
    };
  }

  // Consider using a faster/cheaper model if available and sufficient
  const model = genAI.getGenerativeModel({ model: MODEL_NAME }); // Or gemini-1.5-flash-latest
  console.log(`[generateTitleAction] Using Model: ${MODEL_NAME}`);

  const generationConfig = {
    temperature: 0.75, // Slightly higher temp for title creativity
    maxOutputTokens: 5000, // Titles don't need many tokens
  };

  try {
    console.log(
      `[generateTitleAction] Generating titles for: "${primaryKeyword}"`
    );
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings: standardSafetySettings, // Use standard safety
    });

    if (
      !result.response ||
      !result.response.candidates ||
      result.response.candidates.length === 0 ||
      !result.response.candidates[0].content
    ) {
      const blockReason = result.response?.promptFeedback?.blockReason;
      console.error(
        "[generateTitleAction] Gemini title generation blocked or empty:",
        { blockReason }
      );
      return {
        success: false,
        error: `Title generation blocked or empty. Reason: ${
          blockReason || "Unknown safety/empty issue"
        }`,
      };
    }

    const responseText = result.response.text();
    // console.log("data ", result.response);
    const titles = responseText
      .split("\n")
      .map((title) => title.trim().replace(/^- |^\* |^\d+\. /, "")) // Remove leading list markers
      .filter(Boolean); // Remove empty lines

    if (titles.length === 0) {
      console.error(
        "[generateTitleAction] Gemini returned empty titles after parsing:",
        responseText
      );
      return {
        success: false,
        error: "Failed to parse valid titles from AI response.",
      };
    }

    console.log("[generateTitleAction] Generated titles:", titles);
    return { success: true, titles: titles };
  } catch (error: unknown) {
    const err = error as Error & {
      response?: { data?: { error?: { message: string } } };
    };
    console.error("[generateTitleAction] Error calling Gemini API:", err);
    const apiErrorMessage = err.response?.data?.error?.message;
    const errorMessage = apiErrorMessage
      ? `Gemini API Error: ${apiErrorMessage}`
      : err.message || "An unknown error occurred during title generation.";
    return { success: false, error: errorMessage };
  }
}

// --- ACTION: Generate HTML Outline ---
export async function generateOutlineAction(
  primaryKeyword: string,
  contentType: string,
  targetCountry: string,
  targetLanguage: string,
  articleTitle: string, // Keep article title for context
  includeSummary: boolean,
  includeFaq: boolean,
  includeCta: boolean,
  includeLinks: boolean,
  includeStats: boolean,
  includeImages: boolean
): Promise<{ success: boolean; outline?: string; error?: string }> {
  if (!API_KEY) return { success: false, error: "API Key not configured." };

  let prompt: string;
  try {
    // Prepare dynamic instruction parts for the outline prompt
    const includeSummaryInstruction = includeSummary
      ? "- A summary/key takeaways section is desired."
      : "";
    const includeFaqInstruction = includeFaq
      ? "- An FAQ section is desired."
      : "";
    const includeCtaInstruction = includeCta
      ? "- A call-to-action will be included near the end."
      : "";
    const includeLinksInstruction = includeLinks
      ? "- The final content should include relevant links (internal/external)."
      : "";
    const includeStatsInstruction = includeStats
      ? "- The final content aims to incorporate statistics/data."
      : "";
    const includeImagesInstruction = includeImages
      ? "- The final content will include image suggestions ."
      : "";
    const mustIncludeSummary = includeSummary
      ? "6.  **Must Include Heading:** Add an appropriate heading for a 'Summary' or 'Key Takeaways' section (e.g., <h2>Summary</h2>) placed logically, usually before the Conclusion or FAQ."
      : "";
    const mustIncludeFaq = includeFaq
      ? `7.  **Must Include Heading:** Add an appropriate heading for an 'FAQ' section (e.g., <h2>Frequently Asked Questions (FAQ)</h2>) placed logically, usually near the end.`
      : "";
    const mustIncludeCta = includeCta
      ? "8.  Ensure the 'Conclusion' heading (or a dedicated CTA heading if appropriate) clearly allows space for a Call to Action later."
      : "";
    const todayDate = new Date().toDateString();
    const replacements: Record<string, string | undefined> = {
      __CONTENT_TYPE__: contentType,
      __PRIMARY_KEYWORD__: primaryKeyword,
      __ARTICLE_TITLE__: articleTitle || "", // Pass empty string if no title
      __TARGET_COUNTRY__: targetCountry,
      __TARGET_LANGUAGE__: targetLanguage,
      __INCLUDE_SUMMARY_INSTRUCTION__: includeSummaryInstruction,
      __INCLUDE_FAQ_INSTRUCTION__: includeFaqInstruction,
      __INCLUDE_CTA_INSTRUCTION__: includeCtaInstruction,
      __INCLUDE_LINKS_INSTRUCTION__: includeLinksInstruction,
      __INCLUDE_STATS_INSTRUCTION__: includeStatsInstruction,
      __INCLUDE_IMAGES_INSTRUCTION__: includeImagesInstruction,
      __MUST_INCLUDE_SUMMARY__: mustIncludeSummary,
      __MUST_INCLUDE_FAQ__: mustIncludeFaq,
      __MUST_INCLUDE_CTA__: mustIncludeCta,
      __TODAT_DATE__: todayDate,
    };
    prompt = loadAndPopulatePrompt(OUTLINE_GENERATION_PROMPT, replacements);
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to build outline prompt from template.",
    };
  }

  // Consider using a faster/cheaper model if available and sufficient
  const model = genAI.getGenerativeModel({ model: MODEL_NAME }); // Or gemini-1.5-flash-latest
  console.log(
    `[generateOutlineAction] Using Model: ${MODEL_NAME}. Preferences: Summary=${includeSummary}, FAQ=${includeFaq}, CTA=${includeCta}, Links=${includeLinks}, Stats=${includeStats}, Images=${includeImages}`
  );

  const generationConfig = {
    temperature: 0.4, // Lower temp for more predictable structure
    maxOutputTokens: 4096, // Outline might still be long
  };

  try {
    console.log(`[generateOutlineAction] Generating outline`);
    // console.log("[generateOutlineAction] Prompt:", prompt); // Uncomment for debugging prompt
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings: standardSafetySettings,
    });

    if (
      !result.response ||
      !result.response.candidates ||
      result.response.candidates.length === 0 ||
      !result.response.candidates[0].content
    ) {
      const blockReason = result.response?.promptFeedback?.blockReason;
      const safetyRatings = result.response?.promptFeedback?.safetyRatings;
      console.error(
        "[generateOutlineAction] Gemini outline generation blocked or empty:",
        { blockReason, safetyRatings }
      );
      return {
        success: false,
        error: `Outline generation blocked or empty. Reason: ${
          blockReason || "Unknown issue"
        }.`,
      };
    }

    const responseText = result.response.text();
    // Clean specifically for outline format
    const cleanedOutline = responseText
      .replace(/^```(?:html|markdown)?\s*/i, "")
      .replace(/```$/i, "")
      .replace(/^.*GENERAT[E|ING] HTML OUTLINE.*$/im, "") // Remove marker line
      .trim();

    // Basic validation - check for start/end tags and reasonable length
    if (
      !cleanedOutline.startsWith("<") ||
      !cleanedOutline.endsWith(">") ||
      cleanedOutline.length < 15
    ) {
      console.error(
        "[generateOutlineAction] Generated outline seems invalid or too short:",
        cleanedOutline
      );
      return {
        success: false,
        error:
          "Generated outline format appears invalid. Please try again or adjust parameters.",
      };
    }

    // console.log("[generateOutlineAction] Generated Outline (HTML):\n", cleanedOutline);
    return { success: true, outline: cleanedOutline };
  } catch (error: unknown) {
    const err = error as Error & {
      response?: { data?: { error?: { message: string } } };
    };
    console.error("[generateOutlineAction] Error calling Gemini API:", err);
    const apiErrorMessage = err.response?.data?.error?.message;
    const errorMessage = apiErrorMessage
      ? `Gemini API Error: ${apiErrorMessage}`
      : err.message || "An unknown error occurred during outline generation.";
    return { success: false, error: errorMessage };
  }
}
// --- ACTION: Generate Image Prompts ---
export async function generateImagePromptsAction(
  articleContent: string
): Promise<{ success: boolean; prompts?: string[]; error?: string }> {
  if (!API_KEY) return { success: false, error: "API Key not configured." };
  if (!articleContent)
    return { success: false, error: "Article content is required." };

  let prompt: string;
  try {
    const replacements: Record<string, string | undefined> = {
      __ARTICLE_CONTENT__: articleContent,
    };
    prompt = loadAndPopulatePrompt(IMAGE_PROMPT_PATH, replacements);
    // console.log(prompt.replace(/<[^>]*>/g, ""));
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to build image prompt from template.",
    };
  }

  const model = genAI.getGenerativeModel({ model: MODEL_NAME }); // Use the standard model
  console.log(`[generateImagePromptsAction] Using Model: ${MODEL_NAME}`);

  const generationConfig = {
    temperature: 0.6, // Moderate temperature for creative but relevant prompts
    maxOutputTokens: 10000, // Allow sufficient tokens for multiple prompts
  };

  try {
    console.log(
      `[generateImagePromptsAction] Generating image prompts for article.`
    );
    // console.log("[generateImagePromptsAction] Prompt (first 200 chars):", prompt.substring(0, 200) + "..."); // Uncomment for debugging
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings: standardSafetySettings,
    });

    if (
      !result.response ||
      !result.response.candidates ||
      result.response.candidates.length === 0 ||
      !result.response.candidates[0].content
    ) {
      const blockReason = result.response?.promptFeedback?.blockReason;
      console.error(
        "[generateImagePromptsAction] Gemini image prompt generation blocked or empty:",
        { blockReason }
      );
      return {
        success: false,
        error: `Image prompt generation blocked or empty. Reason: ${
          blockReason || "Unknown safety/empty issue"
        }`,
      };
    }

    const responseText = result.response.text();
    // console.log("[generateImagePromptsAction] Raw response:", result.response);

    // Parse the numbered list
    const prompts = responseText
      .split("\n")
      .map((line) => line.trim().replace(/^\d+\.\s*/, "")) // Remove leading numbers and dots
      .filter(Boolean); // Remove empty lines

    if (prompts.length === 0) {
      console.error(
        "[generateImagePromptsAction] Gemini returned empty prompts after parsing:",
        responseText
      );
      return {
        success: false,
        error: "Failed to parse valid image prompts from AI response.",
      };
    }

    // Optional: Trim to the requested number if AI gives more
    const finalPrompts = prompts.slice(0);

    // console.log(
    //   "[generateImagePromptsAction] Generated prompts:",
    //   finalPrompts
    // );
    return { success: true, prompts: finalPrompts };
  } catch (error: unknown) {
    const err = error as Error & {
      response?: { data?: { error?: { message: string } } };
    };
    console.error(
      "[generateImagePromptsAction] Error calling Gemini API:",
      err
    );
    const apiErrorMessage = err.response?.data?.error?.message;
    const errorMessage = apiErrorMessage
      ? `Gemini API Error: ${apiErrorMessage}`
      : err.message ||
        "An unknown error occurred during image prompt generation.";
    return { success: false, error: errorMessage };
  }
}

// Add this new function to replace image suggestions with actual image tags
export async function replaceImageSuggestionsWithTags(
  articleContent: string,
  imageUrls: Record<number, string>
): Promise<{ success: boolean; content?: string; error?: string }> {
  if (!articleContent)
    return { success: false, error: "Article content is required." };
  if (!imageUrls || Object.keys(imageUrls).length === 0) {
    return { success: true, content: articleContent }; // No images to replace, return original content
  }

  try {
    // Find all image suggestions in the format [Image suggestion: ...]
    const regex = /\[Image suggestion: ([^\]]+)\]/g;
    let match;
    let replacedContent = articleContent;
    let index = 0;

    while ((match = regex.exec(articleContent)) !== null) {
      // Get the next image URL (if available)
      const imageUrl = imageUrls[index];

      if (imageUrl) {
        // Replace the suggestion with an Image component
        const imageTag = `<Image src="${imageUrl}" alt="${match[1]}" width={800} height={600} className="w-full rounded-lg" />`;
        replacedContent = replacedContent.replace(match[0], imageTag);
        index++;
      }
    }

    // If there's a main image URL (index 0) and no image suggestions were found,
    // consider adding it at the beginning of the article
    if (index === 0 && imageUrls[0]) {
      const mainImageTag = `<Image src="${imageUrls[0]}" alt="Main article image" width={800} height={600} className="w-full rounded-lg mb-6" />`;
      // Find the first heading and insert the image before it
      const headingMatch = replacedContent.match(/<h[1-6][^>]*>/i);
      if (headingMatch && headingMatch.index) {
        replacedContent =
          replacedContent.substring(0, headingMatch.index) +
          mainImageTag +
          replacedContent.substring(headingMatch.index);
      } else {
        // If no heading found, add at the beginning
        replacedContent = mainImageTag + replacedContent;
      }
    }

    return { success: true, content: replacedContent };
  } catch (error: unknown) {
    console.error(
      "[replaceImageSuggestionsWithTags] Error replacing image suggestions:",
      error
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to replace image suggestions with tags.",
    };
  }
}
