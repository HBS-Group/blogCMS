// src/app/api/analyze/route.ts
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import axios, { AxiosError } from "axios"; // Import AxiosError

// Corrected Import: Use default import for text-readability
import textReadability from "text-readability";

import type {
  ApiCheckResult,
  ApiAnalysisResponse,
  AnalyzeRequestBody,
  PageSpeedApiResponse,
  ResourceAccessibilityStatus,
  FetchPageSpeedResult,
  PageSpeedStrategyResult,
} from "@/lib/types_seo"; // Import refined types
import { isPageSpeedApiErrorPayload } from "@/lib/types_seo"; // Import type guard

// !! IMPORTANT: Replace with your actual website or contact info !!
const BOT_USER_AGENT = "MyExpertSEOCheckerBot/1.0 (+https://yourwebsite.com)";

// Helper to fetch URL content
async function fetchHtml(url: string): Promise<string | null> {
  try {
    // Ensure URL is valid before fetching
    new URL(url); // Throws if invalid

    const response = await axios.get<string>(url, {
      // Explicitly type response data as string
      headers: {
        "User-Agent": BOT_USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9", // Behave more like a browser
      },
      timeout: 15000, // 15 second timeout
      maxRedirects: 5, // Follow redirects
      responseType: "text", // Ensure data is treated as text
      validateStatus: (status) => status >= 200 && status < 400, // Consider only 2xx/3xx as success
    });

    const contentType =
      response.headers["content-type"] || response.headers["Content-Type"];
    if (!contentType?.toLowerCase().includes("text/html")) {
      console.warn(`Non-HTML content type received for ${url}: ${contentType}`);
      // Decide if this should be treated as an error - for SEO analysis, it usually is.
      // return null; // Option: Treat non-HTML as fetch failure
    }
    // Basic check for empty response
    if (
      !response.data ||
      typeof response.data !== "string" ||
      response.data.trim().length === 0
    ) {
      console.warn(`Empty HTML content received for ${url}`);
      return null; // Treat empty response as failure
    }

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      // Log status only if response exists, otherwise just log message
      const status = axiosError.response?.status
        ? `Status ${axiosError.response.status}, `
        : "";
      console.error(
        `Axios error fetching ${url}: ${status}Message: ${axiosError.message}`
      );
    } else if (error instanceof Error) {
      // Catches URL constructor errors, timeouts, network errors etc.
      console.error(`Error fetching ${url}:`, error.message);
    } else {
      console.error(`Unknown error fetching ${url}:`, error);
    }
    return null;
  }
}

// Helper function to check resource accessibility (robots.txt, sitemap.xml)
async function checkResourceAccessibility(
  url: string
): Promise<ResourceAccessibilityStatus> {
  try {
    const response = await axios.head(url, {
      headers: { "User-Agent": BOT_USER_AGENT },
      timeout: 7000,
      validateStatus: (status) => status < 500, // Accept 4xx as non-error status for this check
      maxRedirects: 3,
    });
    if (response.status === 200) return "accessible";
    if (response.status === 404) return "not_found";
    // Other 4xx statuses (e.g., 403 Forbidden, 410 Gone) are treated as inaccessible 'error' here
    console.warn(
      `Resource check for ${url} returned status ${response.status}`
    );
    return "error"; // Treat non-200/404 as error/inaccessible
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      // Network error, timeout, or 5xx server error
      const status = error.response?.status
        ? `Status ${error.response.status}, `
        : "";
      console.error(
        `Axios error checking ${url}: ${status}Message: ${error.message}`
      );
    } else if (error instanceof Error) {
      console.error(`Error checking ${url}:`, error.message);
    } else {
      console.error(`Unknown error checking ${url}:`, error);
    }
    return "error";
  }
}

// Helper to fetch PageSpeed Data
async function fetchPageSpeedData(
  url: string,
  apiKey: string | undefined
): Promise<FetchPageSpeedResult> {
  if (!apiKey) {
    console.warn("PageSpeed Insights API key not configured.");
    return { overallError: "API key not configured on the server." };
  }

  const encodedUrl = encodeURIComponent(url);
  const strategies = ["mobile", "desktop"] as const; // Use const assertion for stricter typing
  const results: Partial<FetchPageSpeedResult> = {}; // Use the defined result type
  let firstError: string | null = null;

  try {
    for (const strategy of strategies) {
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodedUrl}&strategy=${strategy}&key=${apiKey}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO`;
      try {
        // Explicitly type the expected response data structure
        const response = await axios.get<PageSpeedApiResponse>(apiUrl, {
          timeout: 60000,
        }); // Increased timeout

        // Check for API-level errors within a 200 response body
        if (response.data.error) {
          console.error(
            `PageSpeed API error (${strategy}) for ${url}: ${response.data.error.message}`
          );
          const errorMessage = `PageSpeed (${strategy}) failed: ${response.data.error.message}`;
          results[strategy] = { error: errorMessage };
          if (!firstError) firstError = errorMessage;
        } else if (!response.data.lighthouseResult) {
          // Handle cases where the API returns 200 but no result (e.g., URL resolution errors within PSI)
          console.warn(
            `PageSpeed API returned 200 but no lighthouseResult (${strategy}) for ${url}. Might be a DNS or redirect issue.`
          );
          const errorMessage = `PageSpeed (${strategy}) could not analyze the URL (check URL validity and redirects).`;
          results[strategy] = { error: errorMessage };
          if (!firstError) firstError = errorMessage;
        } else {
          results[strategy] = response.data; // Store successful raw data
        }

        // Avoid hitting API too rapidly
        await new Promise((resolve) => setTimeout(resolve, 250)); // Slightly increased delay
      } catch (strategyError: unknown) {
        let errorMessage = `PageSpeed (${strategy}) request failed.`;
        if (axios.isAxiosError(strategyError)) {
          const errorData = strategyError.response?.data;
          const status = strategyError.response?.status
            ? `Status ${strategyError.response.status}, `
            : "";

          // Try to get specific error message from API response body if available
          if (isPageSpeedApiErrorPayload(errorData)) {
            errorMessage = `PageSpeed (${strategy}) failed: ${errorData.error.message}`;
            console.error(
              `Error fetching PageSpeed (${strategy}) for ${url}: ${status}API Message: ${errorData.error.message}`
            );
          } else {
            // Use Axios error message for network issues, timeouts etc.
            errorMessage = `PageSpeed (${strategy}) request failed: ${strategyError.message}`;
            console.error(
              `Error fetching PageSpeed (${strategy}) for ${url}: ${status}Message: ${strategyError.message}`
            );
          }
        } else if (strategyError instanceof Error) {
          errorMessage = `PageSpeed (${strategy}) failed: ${strategyError.message}`;
          console.error(
            `Error fetching PageSpeed (${strategy}) for ${url}:`,
            strategyError.message
          );
        } else {
          console.error(
            `Unknown error fetching PageSpeed (${strategy}) for ${url}:`,
            strategyError
          );
        }

        results[strategy] = { error: errorMessage };
        if (!firstError) firstError = errorMessage;
      }
    }

    // Add the first encountered error as the overall error if any occurred
    if (firstError) {
      results.overallError = firstError;
    }
    // Cast should be safe as we've populated based on FetchPageSpeedResult structure
    return results as FetchPageSpeedResult;
  } catch (error: unknown) {
    // Catch potential errors outside the loop (less likely)
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error occurred during PageSpeed fetch setup";
    console.error(`General error in fetchPageSpeedData for ${url}:`, message);
    return { overallError: `Failed to fetch PageSpeed data: ${message}` };
  }
}

// Helper to process raw PageSpeed data into an ApiCheckResult
function processPageSpeedResult(
  rawData: PageSpeedStrategyResult | undefined, // Use the union type
  strategy: "mobile" | "desktop"
): ApiCheckResult {
  if (!rawData) {
    // This case might happen if the loop in fetchPageSpeedData had an unexpected issue
    return {
      status: "error",
      message: `No data or error received for ${strategy} PageSpeed check.`,
    };
  }

  // Check if it's our custom error object { error: string }
  if (
    typeof rawData === "object" &&
    "error" in rawData &&
    typeof rawData.error === "string" &&
    !("lighthouseResult" in rawData)
  ) {
    return { status: "error", message: rawData.error };
  }

  // Now, rawData should be PageSpeedApiResponse; check for API-level errors inside it
  const apiResponse = rawData as PageSpeedApiResponse; // Cast for easier access
  if (apiResponse.error) {
    return {
      status: "error",
      message: `PageSpeed API error (${strategy}): ${apiResponse.error.message}`,
    };
  }
  if (!apiResponse.lighthouseResult?.categories) {
    // This might indicate an incomplete analysis by PSI
    return {
      status: "error",
      message: `Incomplete PageSpeed data received (missing categories) for ${strategy}.`,
    };
  }

  const categories = apiResponse.lighthouseResult.categories;
  // Scores are 0-1, multiply by 100 for display, handle null/undefined
  const formatScore = (score: number | null | undefined): number | null =>
    score === null || score === undefined ? null : Math.round(score * 100);

  return {
    status: "info", // Base status, frontend can derive 'good'/'warning' based on scores
    performanceScore: formatScore(categories.performance?.score),
    accessibilityScore: formatScore(categories.accessibility?.score),
    bestPracticesScore: formatScore(categories["best-practices"]?.score),
    seoScore: formatScore(categories.seo?.score),
    // Decide if frontend needs raw data. Can significantly increase response size.
    // rawData: apiResponse.lighthouseResult,
    message: `PageSpeed (${strategy}) data processed.`,
  };
}

export async function POST(
  request: Request
): Promise<NextResponse<ApiAnalysisResponse>> {
  let url: string | null = null; // Keep track of the validated URL
  let primaryKeyword: string | null = null;

  try {
    const body: AnalyzeRequestBody = await request.json();

    // --- Input Validation ---
    if (!body.url || typeof body.url !== "string") {
      return NextResponse.json(
        {
          url: "",
          checks: {},
          error: "Invalid URL provided (must be a non-empty string)",
        },
        { status: 400 }
      );
    }

    try {
      // Validate and normalize URL
      const parsedUrl = new URL(body.url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("URL must use http or https protocol");
      }
      // Enforce HTTPS check later, allow HTTP for now
      url = parsedUrl.toString(); // Use normalized URL
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Invalid URL format";
      return NextResponse.json(
        { url: body.url, checks: {}, error: message },
        { status: 400 }
      );
    }

    if (
      body.keywords &&
      typeof body.keywords === "string" &&
      body.keywords.trim()
    ) {
      primaryKeyword = body.keywords.trim().toLowerCase();
    }
    // --- End Input Validation ---

    // --- Start Concurrent Fetches ---
    const fetchHtmlPromise = fetchHtml(url);
    const pageSpeedPromise = fetchPageSpeedData(
      url,
      process.env.PAGESPEED_API_KEY
    );
    const robotsUrl = new URL("/robots.txt", url).toString();
    const robotsTxtPromise = checkResourceAccessibility(robotsUrl);
    const sitemapUrl = new URL("/sitemap.xml", url).toString(); // Basic guess
    const sitemapXmlPromise = checkResourceAccessibility(sitemapUrl);
    // TODO: Consider parsing robots.txt AFTER it's fetched to find the *actual* sitemap URL(s)

    const [html, pageSpeedData, robotsTxtStatus, sitemapXmlStatus] =
      await Promise.all([
        fetchHtmlPromise,
        pageSpeedPromise,
        robotsTxtPromise,
        sitemapXmlPromise,
      ]);
    // --- End Concurrent Fetches ---

    const checks: Record<string, ApiCheckResult> = {};

    // --- Add PageSpeed Results First (Available even if HTML fails) ---
    checks.pageSpeedMobile = processPageSpeedResult(
      pageSpeedData.mobile,
      "mobile"
    );
    checks.pageSpeedDesktop = processPageSpeedResult(
      pageSpeedData.desktop,
      "desktop"
    );
    // Add a general PageSpeed error only if specific strategies didn't already report it
    if (
      pageSpeedData.overallError &&
      checks.pageSpeedMobile.status !== "error" &&
      checks.pageSpeedDesktop.status !== "error"
    ) {
      checks.pageSpeedError = {
        status: "error",
        message: pageSpeedData.overallError,
      };
    }

    if (!html) {
      // If HTML fails, return early with PageSpeed data (already added) and HTML error
      checks.htmlFetch = {
        status: "error",
        message: "Failed to fetch or process HTML content for analysis.",
      };
      // Return 200 OK status, but indicate failure within the response payload
      return NextResponse.json({
        url: url,
        checks: checks,
        error: "HTML fetch failed, analysis incomplete.",
      });
    } else {
      checks.htmlFetch = {
        status: "good",
        message: "HTML content fetched successfully.",
      };
    }

    const $ = cheerio.load(html);

    // --- Content & On-Page Checks ---
    const title = $("h1").text().trim();
    console.log(title);

    const description =
      $('meta[name="description"]').first().attr("content")?.trim() ?? null;
    const canonical =
      $('link[rel="canonical"]').first().attr("href")?.trim() ?? null;
    const robotsMeta =
      $('meta[name="robots"]').first().attr("content")?.trim()?.toLowerCase() ??
      null;
    const viewport = $('meta[name="viewport"]').attr("content")?.trim() ?? null;
    const favicon = $('link[rel*="icon"]').first().attr("href") ?? null; // Basic check
    const h1Elements = $("h1");
    const h1Texts = h1Elements
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean); // Filter out empty H1s

    // Try more robust main content selectors, fall back to body
    let mainContentText =
      $("article").first().text() ||
      $('main[role="main"]').first().text() ||
      $(".post-content").first().text() || // Common blog class
      $(".entry-content").first().text() || // Common WordPress class
      $("#article-body").first().text() || // Common ID
      $(".article-content").first().text() || // Common ID
      ""; // Start with empty

    // If nothing specific found, fall back VERY carefully
    if (!mainContentText) {
      // Clone body, remove known non-content areas, then get text
      const $bodyClone = $("body").clone();
      $bodyClone
        .find(
          "nav, header, footer, aside, script, style, .sidebar, .menu, .ads"
        )
        .remove();
      mainContentText = $bodyClone.text();
    }

    mainContentText = mainContentText.replace(/\s+/g, " ").trim(); // Clean whitespace

    const words = mainContentText.match(/\b\w{2,}\b/g) || [];
    const wordCount = words.length;

    // Title
    checks.title = {
      present: !!title,
      text: title || null,
      length: title?.length ?? 0,
      status: !title
        ? "bad"
        : title.length >= 10 && title.length <= 60
        ? "good"
        : "warning",
      message: !title
        ? "Title tag is missing or empty."
        : title.length < 10
        ? "Title is too short (< 10 chars)."
        : title.length > 60
        ? "Title is too long (> 60 chars)."
        : `Title length is ${title.length} chars.`,
      keywords_present:
        primaryKeyword && title
          ? title.toLowerCase().includes(primaryKeyword)
          : primaryKeyword
          ? false
          : null, // Check only if keyword provided
    };

    // Meta Description
    checks.metaDescription = {
      present: !!description,
      text: description,
      length: description?.length ?? 0,
      status: !description
        ? "info"
        : description.length >= 70 && description.length <= 160
        ? "good"
        : "warning",
      message: !description
        ? "Meta description is missing. Recommended for CTR."
        : description.length < 70
        ? "Meta description is short (< 70 chars)."
        : description.length > 160
        ? "Meta description is long (> 160 chars)."
        : `Meta description length is ${description.length} chars.`,
      keywords_present:
        primaryKeyword && description
          ? description.toLowerCase().includes(primaryKeyword)
          : primaryKeyword
          ? false
          : null, // Check only if keyword provided
    };

    // Headings
    const headings: { level: string; text: string }[] = [];
    $("h1, h2, h3, h4, h5, h6").each((_, el) => {
      const headingText = $(el).text().trim();
      if (headingText) {
        // Only include headings with text
        headings.push({
          level: $(el).prop("tagName").toLowerCase(),
          text: headingText,
        });
      }
    });
    const h1StatusResult =
      h1Texts.length === 1 ? "good" : h1Texts.length === 0 ? "bad" : "warning";
    checks.headings = {
      status: h1StatusResult, // <--- ADD THIS LINE
      structure: headings,
      h1Count: h1Texts.length,
      h1Texts: h1Texts,
      h1Status: h1StatusResult, // Keep this too for detailed info if needed
      message:
        h1Texts.length === 1
          ? "Exactly one H1 tag found."
          : h1Texts.length === 0
          ? "Missing H1 tag."
          : `Found ${h1Texts.length} H1 tags. Should ideally be one.`,
      // Check keyword in the *first* H1 if exactly one exists
      h1HasKeyword:
        primaryKeyword && h1Texts.length === 1
          ? h1Texts[0].toLowerCase().includes(primaryKeyword)
          : primaryKeyword && h1Texts.length === 1
          ? false
          : null, // Check only if 1 H1 and keyword exists
    };

    // Image Alt Text
    const images = $("img");
    const totalImages = images.length;
    let imagesMissingAlt = 0;
    let imagesEmptyAlt = 0;
    images.each((_, img) => {
      const alt = $(img).attr("alt");
      if (alt === undefined || alt === null) {
        imagesMissingAlt++;
      } else if (alt.trim() === "") {
        imagesEmptyAlt++; // Present but empty (alt="") - often OK for decorative
      }
    });
    checks.imageAltText = {
      totalImages: totalImages,
      missingAltText: imagesMissingAlt, // Count only truly missing alt attributes
      // Optional: Report empty alt tags separately if needed: emptyAltText: imagesEmptyAlt,
      status:
        totalImages === 0
          ? "not_applicable"
          : imagesMissingAlt === 0
          ? "good"
          : imagesMissingAlt < totalImages * 0.1
          ? "warning"
          : "bad", // Example threshold (10%)
      message:
        totalImages === 0
          ? "No images found on the page."
          : imagesMissingAlt === 0
          ? `All ${totalImages} images have an alt attribute.`
          : `${imagesMissingAlt} out of ${totalImages} images are missing the alt attribute. ${imagesEmptyAlt} have an empty alt attribute.`,
    };

    // Links (Basic Count)
    let internalLinks = 0;
    let externalLinks = 0;
    let nofollowLinks = 0;
    const pageOrigin = new URL(url).origin;
    const pageHostname = new URL(url).hostname;

    $("a[href]").each((_, el) => {
      const link = $(el);
      const href = link.attr("href");
      if (
        href &&
        href.trim() &&
        !href.startsWith("#") &&
        !href.startsWith("javascript:") &&
        !href.startsWith("mailto:") &&
        !href.startsWith("tel:")
      ) {
        try {
          // Resolve relative URLs relative to the *fetched* URL
          const linkUrl = new URL(href, url || pageOrigin);
          // Only count HTTP/HTTPS links
          if (["http:", "https:"].includes(linkUrl.protocol)) {
            if (linkUrl.hostname === pageHostname) {
              internalLinks++;
            } else {
              externalLinks++;
              if (link.attr("rel")?.toLowerCase().includes("nofollow")) {
                nofollowLinks++;
              }
            }
          }
        } catch {
          // Ignore invalid URLs during parsing (e.g. "http://")
          console.warn(`Could not parse link URL: ${href} on page ${url}`);
        }
      }
    });
    checks.links = {
      internal: internalLinks,
      external: externalLinks,
      // Optional: add nofollow count: nofollow: nofollowLinks,
      status: "info", // Basic counts are informational
      message: `Found ${internalLinks} internal and ${externalLinks} external links. ${nofollowLinks} external links have 'nofollow'.`,
    };

    // Word Count
    checks.wordCount = {
      count: wordCount,
      status: wordCount >= 300 ? "good" : wordCount >= 50 ? "info" : "warning",
      message:
        wordCount >= 300
          ? `Good content length (${wordCount} words).`
          : wordCount >= 50
          ? `Content length is ${wordCount} words. Consider adding more for complex topics.`
          : `Content is very short (${wordCount} words). May be considered thin content.`,
    };

    // Keyword Density
    if (primaryKeyword && wordCount > 0) {
      // Case-insensitive match on whole words
      const keywordRegex = new RegExp(
        `\\b${primaryKeyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`,
        "gi"
      ); // Escape regex special chars
      const matches = mainContentText.match(keywordRegex);
      const keywordCount = matches ? matches.length : 0;
      const density = parseFloat(((keywordCount / wordCount) * 100).toFixed(2));
      checks.keywordDensity = {
        keyword: primaryKeyword,
        count: keywordCount,
        density: density,
        status:
          density >= 0.5 && density <= 2.5
            ? "good"
            : density === 0
            ? "info"
            : "warning", // Adjust thresholds as needed
        message:
          density >= 0.5 && density <= 2.5
            ? `Keyword density (${density}%) is within the recommended range.`
            : density === 0
            ? `Primary keyword '${primaryKeyword}' not found in main content.`
            : `Keyword density (${density}%) is outside the typical 0.5-2.5% range. Avoid keyword stuffing.`,
      };
    } else {
      checks.keywordDensity = {
        keyword: primaryKeyword ?? undefined,
        status: "not_applicable",
        message: primaryKeyword
          ? wordCount === 0
            ? "No analyzable content found."
            : "Insufficient content to calculate density."
          : "No primary keyword provided for analysis.",
      };
    }

    // Readability Score
    try {
      // Ensure text-readability is installed: npm install text-readability
      if (wordCount > 100) {
        // Require sufficient content for a reliable score
        // Corrected Usage: Access function via default import object
        const readabilityScore = Math.round(
          textReadability.fleschReadingEase(mainContentText)
        );

        let level: ApiCheckResult["level"] = "Difficult";
        let status: ApiCheckResult["status"] = "warning";
        if (readabilityScore >= 60) {
          level = "Easy";
          status = "good";
        } else if (readabilityScore >= 30) {
          level = "Standard";
          status = "info";
        }

        checks.readability = {
          score: readabilityScore,
          level: level,
          status: status,
          message: `Readability score (Flesch Reading Ease): ${readabilityScore} (${level}).`,
        };
      } else {
        checks.readability = {
          score: null,
          status: "not_applicable",
          message:
            "Content too short (< 100 words) for reliable readability analysis.",
        };
      }
    } catch (readabilityError: unknown) {
      const message =
        readabilityError instanceof Error
          ? readabilityError.message
          : "Unknown readability calculation error";
      console.warn("Readability check failed:", message);
      // Check if the error is due to the library not being installed or function missing
      if (
        message.includes("Cannot find module") ||
        message.includes("text-readability") ||
        message.includes("is not a function")
      ) {
        checks.readability = {
          status: "error",
          message:
            "Readability check failed: Library/function issue. Ensure text-readability is installed and imported correctly.",
        };
      } else {
        checks.readability = {
          status: "error",
          message: `Could not calculate readability: ${message}`,
        };
      }
    }

    // Structured Data Detection (Basic)
    const structuredDataScripts = $('script[type="application/ld+json"]');
    const detectedSchemas: NonNullable<ApiCheckResult["schemas"]> = []; // Ensure array is not undefined
    structuredDataScripts.each((_, el) => {
      const scriptContent = $(el).html()?.trim() ?? null;
      if (scriptContent) {
        let jsonData = null; // Use any for parsing flexibility
        let validJson = false;
        let schemaType: string | undefined = "Unknown Type";
        let errorMessage: string | null = null;
        try {
          jsonData = JSON.parse(scriptContent);
          validJson = true;
          // Try to extract type(s) - handles string or array for @type
          if (
            typeof jsonData === "object" &&
            jsonData !== null &&
            jsonData["@type"]
          ) {
            schemaType = Array.isArray(jsonData["@type"])
              ? jsonData["@type"].join(", ")
              : jsonData["@type"];
          } else {
            schemaType = "Type not specified or invalid structure";
          }
        } catch (e: unknown) {
          errorMessage = e instanceof Error ? e.message : "Invalid JSON format";
        }
        detectedSchemas.push({
          type: schemaType,
          validJson: validJson,
          // Optionally include snippet of invalid content for debugging
          content:
            !validJson && errorMessage
              ? `Error: ${errorMessage}. Content: ${scriptContent.substring(
                  0,
                  100
                )}${scriptContent.length > 100 ? "..." : ""}`
              : null, // Don't include valid content unless needed
        });
      }
    });
    const invalidSchemaCount = detectedSchemas.filter(
      (s) => !s.validJson
    ).length;
    checks.structuredData = {
      present: detectedSchemas.length > 0,
      count: detectedSchemas.length,
      schemas: detectedSchemas,
      status:
        detectedSchemas.length === 0
          ? "info"
          : invalidSchemaCount > 0
          ? "warning"
          : "good",
      message:
        detectedSchemas.length === 0
          ? "No JSON-LD structured data scripts found."
          : invalidSchemaCount > 0
          ? `${invalidSchemaCount} structured data script(s) contain invalid JSON.`
          : `Found ${detectedSchemas.length} valid JSON-LD structured data script(s).`,
    };

    // --- Technical Checks ---
    checks.https = {
      enabled: url.startsWith("https://"),
      status: url.startsWith("https://") ? "good" : "bad",
      message: url.startsWith("https://")
        ? "Site is served over HTTPS."
        : "Site is not served over HTTPS. This is critical for security and SEO.",
    };

    // Resolve canonical URL against the base URL to handle relative paths
    let absoluteCanonical: string | null = null;
    if (canonical) {
      try {
        absoluteCanonical = new URL(canonical, url).toString();
      } catch {
        absoluteCanonical = null; // Invalid canonical URL format
      }
    }
    let canonicalStatus: ApiCheckResult["status"] = "info";
    let canonicalMessage: string | undefined;
    if (!absoluteCanonical) {
      canonicalStatus = "warning";
      canonicalMessage = "Canonical tag is missing or has an invalid URL.";
    } else if (absoluteCanonical !== url) {
      canonicalStatus = "info"; // Not necessarily bad, just informational
      canonicalMessage = `Canonical tag points to a different URL: ${absoluteCanonical}`;
    } else {
      canonicalStatus = "good";
      canonicalMessage =
        "Canonical tag is present and points to the current URL.";
    }
    checks.canonicalTag = {
      present: !!absoluteCanonical,
      value: absoluteCanonical, // Store the resolved absolute URL
      status: canonicalStatus,
      message: canonicalMessage,
    };

    let robotsMetaStatus: ApiCheckResult["status"] = "info";
    let robotsMetaMessage: string | undefined;
    if (robotsMeta) {
      if (robotsMeta.includes("noindex")) {
        robotsMetaStatus = "bad"; // 'noindex' is usually critical if unintended
        robotsMetaMessage =
          'Meta robots tag contains "noindex". Page will likely not be indexed by search engines.';
      } else if (robotsMeta.includes("nofollow")) {
        robotsMetaStatus = "warning"; // 'nofollow' is less critical but important
        robotsMetaMessage =
          'Meta robots tag contains "nofollow". Links on this page may not be followed.';
      } else {
        robotsMetaStatus = "good";
        robotsMetaMessage = `Meta robots tag found: "${robotsMeta}". Allows indexing and following.`;
      }
    } else {
      robotsMetaStatus = "good"; // Missing meta robots implies index, follow (usually good)
      robotsMetaMessage =
        'No meta robots tag found. Defaults to "index, follow".';
    }
    checks.robotsMeta = {
      present: !!robotsMeta,
      content: robotsMeta,
      status: robotsMetaStatus,
      message: robotsMetaMessage,
    };

    checks.viewport = {
      present: !!viewport,
      content: viewport,
      status: viewport
        ? viewport.includes("width=device-width") &&
          viewport.includes("initial-scale=1")
          ? "good"
          : "warning"
        : "bad",
      message: viewport
        ? viewport.includes("width=device-width") &&
          viewport.includes("initial-scale=1")
          ? "Viewport meta tag is configured for responsiveness."
          : "Viewport meta tag found, but may not be optimally configured."
        : "Viewport meta tag is missing. Crucial for mobile usability.",
    };

    checks.favicon = {
      present: !!favicon,
      href: favicon,
      status: favicon ? "good" : "info",
      message: favicon
        ? "Favicon link tag found."
        : "Favicon link tag not found. Recommended for branding.",
    };
    checks.robotsTxt = {
      url: robotsUrl,
      status: robotsTxtStatus,
      message:
        robotsTxtStatus === "accessible"
          ? "robots.txt is accessible."
          : robotsTxtStatus === "not_found"
          ? "robots.txt not found (returns 404)."
          : "Could not access or verify robots.txt (error or non-200/404 status).",
    };
    checks.sitemapXml = {
      // Reminder: This is a basic guess, might not be the actual sitemap
      url: sitemapUrl,
      status: sitemapXmlStatus,
      message:
        sitemapXmlStatus === "accessible"
          ? "sitemap.xml (guessed location) is accessible."
          : sitemapXmlStatus === "not_found"
          ? "sitemap.xml (guessed location) not found (returns 404)."
          : "Could not access or verify sitemap.xml at the guessed location.",
    };

    // Final response object conforming to ApiAnalysisResponse
    const responseData: ApiAnalysisResponse = {
      url: url,
      checks: checks,
      // No top-level error if we got this far
    };

    return NextResponse.json(responseData);
  } catch (error: unknown) {
    console.error("API Route Top-Level Error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected internal server error occurred during analysis.";

    // Ensure the response structure matches ApiAnalysisResponse even on catastrophic error
    // Try to get URL if it was validated, otherwise use placeholder or extract from request if possible
    const errorUrl =
      url ??
      (typeof (await request.clone().json())?.url === "string"
        ? (await request.clone().json()).url
        : "Unknown URL");
    const errorResponse: ApiAnalysisResponse = {
      url: errorUrl,
      checks: {
        // Include minimal checks if possible, e.g., input error
        processingError: { status: "error", message: message },
      },
      error: message, // Set the top-level error message
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
