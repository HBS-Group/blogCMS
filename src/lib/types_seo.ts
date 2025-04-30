// src/lib/types_seo.ts

// Define a structure for the relevant parts of the PageSpeed API response data
// This is a simplified version focusing on categories and audits.
export interface PageSpeedApiResponse {
    lighthouseResult?: {
        categories?: {
            performance?: { score: number | null };
            accessibility?: { score: number | null };
            'best-practices'?: { score: number | null }; // Use quotes for key with hyphen
            seo?: { score: number | null };
        };
        audits?: {
            [auditKey: string]: {
                id: string;
                title: string;
                score: number | null;
                displayValue?: string;
                description?: string;
                numericValue?: number;
                numericUnit?: string;
                // Add other audit properties you might need
            };
        };
        // Add other top-level Lighthouse result properties if needed
        finalUrl?: string;
        requestedUrl?: string;
        fetchTime?: string;
    };
    // Include other PageSpeed API fields if necessary
    id?: string;
    loadingExperience?: object; // Define further if needed
    analysisUTCTimestamp?: string;
    error?: { // PageSpeed API error object structure (example)
        code: number;
        message: string;
        errors?: Array<{ message: string; domain: string; reason: string }>;
    };
}


// Raw check result structure from the backend API
// Make this comprehensive based on all checks performed in route.ts
export interface ApiCheckResult {
    // Common fields
    status?: 'good' | 'warning' | 'bad' | 'info' | 'not_applicable' | 'error' | 'accessible' | 'not_found';
    message?: string; // For errors or info messages within a check
    present?: boolean;

    // Title & Meta Description specific
    text?: string | null;
    length?: number;
    keywords_present?: boolean | null;

    // Headings specific
    structure?: { level: string; text: string }[];
    h1Count?: number;
    h1Texts?: string[];
    h1Status?: 'good' | 'warning' | 'bad';
    h1HasKeyword?: boolean | null;

    // Image specific
    totalImages?: number;
    missingAltText?: number;

    // Links specific
    internal?: number;
    external?: number;

    // Content specific
    count?: number; // e.g., word count

    // Keyword specific
    keyword?: string | undefined; // The keyword checked against
    density?: number; // Keyword density percentage

    // Readability specific
    score?: number | null; // e.g., Flesch Reading Ease score
    level?: 'Easy' | 'Standard' | 'Difficult' | string; // Readability level

    // Structured Data specific
    schemas?: { type?: string; validJson: boolean; content?: string | null }[];

    // Technical SEO specific
    value?: string | null; // e.g., canonical URL
    content?: string | null; // e.g., meta robots content, viewport content
    enabled?: boolean; // e.g., HTTPS
    url?: string; // e.g., robots.txt URL, sitemap URL
    href?: string | null; // e.g., favicon href

    // PageSpeed specific fields (derived/processed)
    performanceScore?: number | null;
    accessibilityScore?: number | null;
    bestPracticesScore?: number | null;
    seoScore?: number | null;
    // Optionally include the raw data if the frontend needs it
    rawData?: PageSpeedApiResponse['lighthouseResult'] | null;
    error?: string; // For reporting fetch/processing errors for this specific check
}

// Structure of the full response from the /api/analyze endpoint
export interface ApiAnalysisResponse {
    url: string;
    checks: Record<string, ApiCheckResult>; // A dictionary of different checks
    error?: string; // Top-level error message if the whole analysis failed partially/fully
}

// Structure for categorized issues on the frontend
export interface IssuesCategorized {
    critical: string[];
    warnings: string[];
    info: string[];
    good: string[]; // Optional: Track good points too
}

// Structure for performance scores extracted on the frontend
export interface PerformanceScores {
    mobile: number | null;
    desktop: number | null;
    mobileAccessibility: number | null;
    desktopAccessibility: number | null;
    mobileBestPractices: number | null;
    desktopBestPractices: number | null;
    mobileSeo: number | null;
    desktopSeo: number | null;
}

// Structure for the processed analysis results stored in the frontend state
export interface ProcessedAnalysisResults {
    seoScore: number;
    issues: IssuesCategorized;
    suggestions: string[]; // Actionable recommendations
    checkDetails: Record<string, ApiCheckResult>; // Raw checks for detailed display
    performanceScores: PerformanceScores;
    wordCount: number;
    readabilityScore: number | null;
    primaryKeyword: string | null; // Store the keyword used for analysis
    url: string; // Store the analyzed URL
}

// Tooltip content helper type
export type TooltipInfo = Record<string, { title: string; explanation: string }>;

// Define a type for the expected request body
export interface AnalyzeRequestBody {
    url?: unknown; // Use unknown for initial validation
    keywords?: unknown;
}

// Type guard to check if an object has a PageSpeed API error structure
export function isPageSpeedApiErrorPayload(data: unknown): data is { error: { message: string } } {
    return typeof data === 'object' && data !== null &&
           'error' in data && typeof (data as Record<string, unknown>).error === 'object' && (data as Record<string, unknown>).error !== null &&
           typeof ((data as { error: { message: string } }).error).message === 'string';
}

// Define resource status type used by checkResourceAccessibility
export type ResourceAccessibilityStatus = 'accessible' | 'not_found' | 'error';

// Define the structure returned by fetchPageSpeedData
// Allows either the full response OR a specific error object per strategy
export type PageSpeedStrategyResult = PageSpeedApiResponse | { error: string };

export interface FetchPageSpeedResult {
    mobile?: PageSpeedStrategyResult;
    desktop?: PageSpeedStrategyResult;
    overallError?: string; // For errors affecting both fetches or the overall process
}