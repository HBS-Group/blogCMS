// utils/parseContent.ts
import { FaqItemProps } from '@/components/blog/fqa'; // Ensure correct path

export interface ParsedContentPart {
  type: 'html' | 'faq';
  content?: string; // For type 'html'
  props?: FaqItemProps; // For type 'faq'
}

// Define the structure for a Table of Contents item
export interface TocItem {
  id: string;
  text: string;
  level: number; // e.g., 2 for h2
}

// Define the new return type for the parser
export interface ParseResult {
  parts: ParsedContentPart[];
  toc: TocItem[];
}

// Regex for FaqItem - Allows matching across newlines within the tag
const faqRegex = /<FaqItem[\s\S]*?question=(?:"|')(.*?)(?:"|')[\s\S]*?answer=(?:"|')(.*?)(?:"|')[\s\S]*?\/>/gi;

// Regex for H2 tags - Allows matching across newlines within the tag and content
const h2Regex = /<h2[\s\S]*?>([\s\S]*?)<\/h2>/gi;

// Regex for finding ID within an H2 tag (needs to also allow newlines)
const h2IdRegex = /<h2[\s\S]*?id=(?:"|')(.*?)(?:"|')[\s\S]*?>/i;


// Helper function to generate a simple slug (you might want a more robust library)
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

// Function to strip HTML tags from a string
function stripHtml(html: string): string {
  // Basic fallback for server-side or environments without DOMParser/document
  return html.replace(/<[^>]*>?/gm, '');
}


export function parseContent(htmlString: string): ParseResult {
  // Trim leading/trailing whitespace from the entire string
  htmlString = htmlString.trim();

  const parts: ParsedContentPart[] = [];
  const toc: TocItem[] = [];
  let lastIndex = 0;
  let faqMatch;
  let h2Match;
  let faqIndex = 0;
  let headingIndex = 0; // Counter for unique heading IDs

  // --- 1. Extract H2 Headings for TOC ---
  h2Regex.lastIndex = 0; // Reset regex state

  while ((h2Match = h2Regex.exec(htmlString)) !== null) {
    const rawText = h2Match[1]; // Content within <h2> tags
    const cleanText = stripHtml(rawText); // Remove any nested tags like <strong>

    if (cleanText.trim()) { // Use trim() to handle whitespace-only content
      // Attempt to find an existing ID attribute on the h2 tag first using the specific ID regex
      const h2TagMatch = h2IdRegex.exec(h2Match[0]);
      const existingId = h2TagMatch ? h2TagMatch[1] : null;

      let id = existingId || slugify(cleanText);
      if (!id) {
        id = `heading-${headingIndex++}`; // Fallback unique ID
      }

      toc.push({
        id: id,
        text: cleanText.trim(), // Also trim text in TOC for cleanliness
        level: 2, // h2 corresponds to level 2
      });
    }
    // exec handles lastIndex automatically with 'g'
  }

  // --- 2. Parse for FAQ items and HTML chunks ---
  faqRegex.lastIndex = 0; // Reset regex state
  lastIndex = 0; // Reset lastIndex

  while ((faqMatch = faqRegex.exec(htmlString)) !== null) {
    // Add the HTML chunk *before* the current FAQ match
    if (faqMatch.index > lastIndex) {
      const htmlContent = htmlString.substring(lastIndex, faqMatch.index);
      if (htmlContent.trim()) { // Only add non-empty html segments after trimming
        parts.push({
          type: 'html',
          content: htmlContent.trim(),
        });
      }
    }

    // Add the extracted FaqItem data
    const question = faqMatch[1];
    const answer = faqMatch[2];

    parts.push({
      type: 'faq',
      props: {
        id: `faq-item-${faqIndex++}`, // Use a more robust ID generator if needed
        question: question,
        answer: answer,
      },
    });

    // Update the index to search from the end of the current match
    lastIndex = faqRegex.lastIndex;
  }

  // Add any remaining HTML *after* the last FAQ match
  if (lastIndex < htmlString.length) {
    const remainingHtml = htmlString.substring(lastIndex);
     if (remainingHtml.trim()) { // Only add non-empty remaining html after trimming
        parts.push({
          type: 'html',
          content: remainingHtml.trim(),
        });
     }
  }

  // --- 3. Return both parts and TOC ---
  return { parts, toc };
}