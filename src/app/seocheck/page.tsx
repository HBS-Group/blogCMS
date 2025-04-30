// src/app/page.tsx
"use client";

import React, { useState, useTransition } from "react";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip";
import {
    Search, Loader2, CheckCircle2, AlertCircle, Info, Globe,
    Smartphone, ScreenShare, Zap, SlidersHorizontal, FileText, CheckSquare, ShieldAlert, GaugeCircle,
    Link as LinkIcon
} from "lucide-react";
import Link  from "next/link";
import type {
    ApiAnalysisResponse, ProcessedAnalysisResults, IssuesCategorized, PerformanceScores, ApiCheckResult, TooltipInfo
} from "@/lib/types_seo";

// --- Helper Functions ---

const TOOLTIP_INFO: TooltipInfo = {
    overallScore: { title: "Overall SEO Score", explanation: "A weighted score (0-100) based on various SEO factors including performance, content, technical aspects, and on-page elements. Higher is better." },
    performance: { title: "Performance (PageSpeed)", explanation: "Average Google PageSpeed Insights score (0-100) measuring loading performance. Aim for 90+." },
    psiPerformance: { title: "Performance Score", explanation: "Google PageSpeed Insights score (0-100) measuring loading performance. Aim for 90+." },
    psiAccessibility: { title: "Accessibility Score", explanation: "PageSpeed score (0-100) for how accessible the page is to users with disabilities. Aim for 90+." },
    psiBestPractices: { title: "Best Practices Score", explanation: "PageSpeed score (0-100) for modern web development practices. Aim for 100." },
    psiSeo: { title: "SEO Score (PageSpeed)", explanation: "PageSpeed score (0-100) checking basic technical SEO elements. Aim for 90+." },
    title: { title: "Title Tag", explanation: "The main title shown in search results and browser tabs. Crucial for SEO and CTR. Length: 10-60 chars recommended." },
    metaDescription: { title: "Meta Description", explanation: "Summary shown below the title in search results. Affects CTR. Length: 70-160 chars recommended." },
    headings: { title: "Headings (H1-H6)", explanation: "Structure content logically. Use one H1 per page for the main topic. Use H2-H6 for subtopics." },
    wordCount: { title: "Word Count", explanation: "The approximate number of words in the main content. Longer, comprehensive content often performs better (aim for 300+)." },
    keywordDensity: { title: "Keyword Density", explanation: "Percentage of times the primary keyword appears in the content. Aim for 0.5% - 2.5%. Avoid keyword stuffing." },
    readability: { title: "Readability (Flesch)", explanation: "How easy the content is to read. Higher scores (60+) indicate easier readability." },
    imageAltText: { title: "Image Alt Text", explanation: "Text descriptions for images, important for accessibility and image SEO. All meaningful images should have descriptive alt text." },
    https: { title: "HTTPS", explanation: "Secure connection (SSL/TLS). Essential for security, user trust, and SEO ranking." },
    canonicalTag: { title: "Canonical Tag", explanation: "Specifies the preferred version of a page to avoid duplicate content issues." },
    robotsMeta: { title: "Robots Meta Tag", explanation: "Instructs search engines whether to index or follow links on the page (e.g., 'index, follow', 'noindex')." },
    robotsTxt: { title: "Robots.txt File", explanation: "A file at the root of your domain that guides search engine crawlers on which parts of the site to access." },
    sitemapXml: { title: "Sitemap.xml", explanation: "An XML file listing important URLs on your site to help search engines discover content (checks common /sitemap.xml path)." },
    structuredData: { title: "Structured Data (Schema)", explanation: "Code markup (like JSON-LD) that helps search engines understand the content's context (e.g., reviews, products, articles)." },
    viewport: { title: "Viewport Meta Tag", explanation: "Ensures the page renders correctly on different screen sizes, crucial for mobile-friendliness." },
    favicon: { title: "Favicon", explanation: "A small icon representing your website, shown in browser tabs and bookmarks." },
    links: { title: "Internal/External Links", explanation: "Internal links connect pages within your site. External links point to other websites. Both are important for SEO and user navigation." },
    pageSpeedMobile: { title: "PageSpeed Mobile", explanation: "Performance and related metrics analysis for mobile devices." },
    pageSpeedDesktop: { title: "PageSpeed Desktop", explanation: "Performance and related metrics analysis for desktop devices." },
    htmlFetch: { title: "HTML Fetch Status", explanation: "Indicates if the server could successfully retrieve the page's HTML source for analysis." }
};

const KEY_MAP: Partial<Record<keyof typeof TOOLTIP_INFO, keyof ApiAnalysisResponse['checks']>> = {
    psiPerformance: "pageSpeedMobile",
    psiAccessibility: "pageSpeedMobile",
    psiBestPractices: "pageSpeedMobile",
    psiSeo: "pageSpeedMobile",
};

const InfoTooltip = ({ id }: { id: keyof typeof TOOLTIP_INFO }) => {
    const info = TOOLTIP_INFO[id];
    if (!info) return null;
    return (
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Info className="inline-block h-3.5 w-3.5 ml-1.5 text-gray-400 hover:text-indigo-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-gray-800 text-white border-indigo-500 p-3 z-50">
                    <p className="font-semibold mb-1">{info.title}</p>
                    <p className="text-xs text-gray-300">{info.explanation}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const processApiResults = (data: ApiAnalysisResponse, primaryKeyword: string | null): ProcessedAnalysisResults => {
    const checks = data.checks;
    let score = 0;
    let scorePointsPossible = 0;

    const issues: IssuesCategorized = { critical: [], warnings: [], info: [], good: [] };
    const suggestions: string[] = [];

    const addIssueFromCheck = (checkKey: keyof ApiAnalysisResponse['checks'], check: ApiCheckResult | undefined, suggestionOverride?: string) => {
        if (!check) return;

        const message = check.message || TOOLTIP_INFO[checkKey as keyof TooltipInfo]?.title || checkKey;

        switch (check.status) {
            case 'good':
                issues.good.push(message);
                break;
            case 'warning':
                issues.warnings.push(message);
                if (suggestionOverride) suggestions.push(suggestionOverride);
                break;
            case 'bad':
                issues.critical.push(message);
                if (suggestionOverride) suggestions.push(suggestionOverride);
                break;
            case 'info':
            case 'not_applicable':
                issues.info.push(message);
                if (suggestionOverride && check.status === 'info') suggestions.push(suggestionOverride);
                break;
            case 'error':
                issues.warnings.push(`Check Error (${checkKey}): ${message}`);
                break;
            case 'accessible':
                issues.good.push(`${TOOLTIP_INFO[checkKey as keyof TooltipInfo]?.title || checkKey} is accessible.`);
                break;
            case 'not_found':
                issues.info.push(`${TOOLTIP_INFO[checkKey as keyof TooltipInfo]?.title || checkKey} not found (404).`);
                if (checkKey === 'robotsTxt') suggestions.push("Create a robots.txt file to guide search engine crawlers.");
                if (checkKey === 'sitemapXml') suggestions.push("Ensure a sitemap exists and is referenced in robots.txt or submitted to search engines.");
                break;
            default:
                issues.info.push(`${checkKey}: Status ${check.status} - ${message}`);
                break;
        }
    };

    const weights: Partial<Record<keyof ApiAnalysisResponse['checks'], number>> = {
        pageSpeedMobile: 15,
        pageSpeedDesktop: 10,
        title: 10,
        metaDescription: 5,
        headings: 10,
        wordCount: 5,
        imageAltText: 5,
        https: 10,
        viewport: 10,
        canonicalTag: 5,
        robotsMeta: 5,
        structuredData: 5,
        readability: 5,
    };

    for (const key of Object.keys(checks) as Array<keyof ApiAnalysisResponse['checks']>) {
        const check = checks[key];
        if (!check) continue;

        const weight = weights[key] ?? 0;
        if (weight > 0) {
            scorePointsPossible += weight;
            if (check.status === 'good') {
                score += weight;
            } else if (check.status === 'warning') {
                score += weight * 0.4;
            } else if (check.status === 'info' && ['metaDescription', 'canonicalTag', 'structuredData'].includes(key)) {
                score += weight * 0.2;
            }
        }

        let suggestion: string | undefined = undefined;
        if (key === 'title' && check.status !== 'good') suggestion = "Optimize title: Ensure it's present, between 10-60 characters, and includes the primary keyword.";
        if (key === 'metaDescription' && check.status !== 'good') suggestion = "Optimize meta description: Ensure it's present, between 70-160 characters, and includes the primary keyword.";
        if (key === 'headings' && check.status !== 'good') suggestion = "Heading structure: Ensure exactly one H1 tag exists containing the main topic. Use H2-H6 for subheadings.";
        if (key === 'imageAltText' && check.status !== 'good') suggestion = "Add descriptive alt text to all meaningful images.";
        if (key === 'https' && check.status !== 'good') suggestion = "Migrate site to HTTPS for security and SEO benefits.";
        if (key === 'viewport' && check.status !== 'good') suggestion = "Add a viewport meta tag (e.g., <meta name='viewport' content='width=device-width, initial-scale=1'>) for mobile responsiveness.";
        if (key === 'canonicalTag' && check.status !== 'good' && !check.value?.startsWith('http')) suggestion = "Add a valid self-referencing canonical tag to avoid duplicate content issues.";
        if (key === 'structuredData' && check.status !== 'good') suggestion = "Add relevant Schema.org structured data markup. Validate existing markup using testing tools.";
        if (key === 'robotsMeta' && check.status === 'bad') suggestion = "Review the robots meta tag; 'noindex' prevents indexing. Ensure this is intentional.";
        if (key === 'readability' && ['warning', 'bad'].includes(check.status || '')) suggestion = "Improve content readability by simplifying sentences and vocabulary (aim for Flesch score 60+).";
        if (key === 'wordCount' && check.status === 'warning') suggestion = "Consider expanding content to be more comprehensive and detailed (aim for 300-500+ words for most topics).";
        if (key === 'keywordDensity' && check.status === 'warning') suggestion = "Review keyword usage to ensure it sounds natural. Avoid keyword stuffing (typical density 0.5-2.5%).";

        addIssueFromCheck(key, check, suggestion);
    }

    const performanceScores: PerformanceScores = {
        mobile: checks.pageSpeedMobile?.performanceScore ?? null,
        desktop: checks.pageSpeedDesktop?.performanceScore ?? null,
        mobileAccessibility: checks.pageSpeedMobile?.accessibilityScore ?? null,
        desktopAccessibility: checks.pageSpeedDesktop?.accessibilityScore ?? null,
        mobileBestPractices: checks.pageSpeedMobile?.bestPracticesScore ?? null,
        desktopBestPractices: checks.pageSpeedDesktop?.bestPracticesScore ?? null,
        mobileSeo: checks.pageSpeedMobile?.seoScore ?? null,
        desktopSeo: checks.pageSpeedDesktop?.seoScore ?? null,
    };

    score = Math.min(score, scorePointsPossible);
    const finalScore = scorePointsPossible > 0 ? Math.max(0, Math.min(100, Math.round((score / scorePointsPossible) * 100))) : 0;

    const uniqueSuggestions = Array.from(new Set(suggestions));

    return {
        seoScore: finalScore,
        issues,
        suggestions: uniqueSuggestions,
        checkDetails: checks,
        performanceScores,
        wordCount: checks.wordCount?.count ?? 0,
        readabilityScore: checks.readability?.score ?? null,
        primaryKeyword: primaryKeyword,
        url: data.url,
    };
};

export default function SeoCheckPage() {
    const [url, setUrl] = useState("");
    const [keywords, setKeywords] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisStatus, setAnalysisStatus] = useState("Ready");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [analysisResults, setAnalysisResults] = useState<ProcessedAnalysisResults | null>(null);
    const [isPending, startTransition] = useTransition();

    const isLoading = isAnalyzing || isPending;

    const clearMessages = () => {
        setErrorMessage(null);
        setSuccessMessage(null);
    };

    const resetState = () => {
        clearMessages();
        setAnalysisResults(null);
        setIsAnalyzing(false);
        setAnalysisStatus("Ready");
    };

    const handleAnalyzeUrl = async () => {
        if (!url || !(url.startsWith('http://') || url.startsWith('https://'))) {
            setErrorMessage("Please enter a valid URL (starting with http:// or https://)");
            return;
        }

        resetState();
        setIsAnalyzing(true);
        setAnalysisStatus("Initializing...");

        try {
            setAnalysisStatus("Fetching data...");
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, keywords: keywords.trim() || undefined }),
            });

            setAnalysisStatus("Processing data...");

            let data: ApiAnalysisResponse | { message?: string } | null = null;
            try {
                data = await response.json();
            } catch (e) {
                console.error("Failed to parse API response:", e);
                throw new Error(`Analysis failed: Server returned non-JSON response (Status: ${response.status} ${response.statusText})`);
            }

            if (!response.ok) {
                const errorMsg = (data && 'message' in data && data.message) ? data.message : `Analysis failed: ${response.statusText} (${response.status})`;
                throw new Error(errorMsg);
            }

            const analysisData = data as ApiAnalysisResponse;

            if (analysisData.error) {
                setErrorMessage(analysisData.error);
            }

            if (analysisData.checks.htmlFetch?.status === 'error') {
                setErrorMessage(analysisData.checks.htmlFetch.message || 'Failed to fetch HTML content. Results may be incomplete.');
            } else if (!analysisData.error) {
                setSuccessMessage("Analysis complete!");
            }

            const processedData = processApiResults(analysisData, keywords.trim() || null);
            startTransition(() => {
                setAnalysisResults(processedData);
            });

            setAnalysisStatus("Done");

        } catch (error: unknown) {
            console.error("Analysis error:", error);
            const message = error instanceof Error ? error.message : String(error || "An unexpected error occurred.");
            setErrorMessage(message);
            setAnalysisStatus("Error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const renderScoreGauge = (score: number | null) => {
        if (score === null || score === undefined) return <span className="text-gray-500 text-xs">N/A</span>;
        const percentage = Math.max(0, Math.min(100, Math.round(score)));
        const color = percentage >= 90 ? 'text-green-400' : percentage >= 50 ? 'text-yellow-400' : 'text-red-400';
        return <span className={`font-bold ${color}`}>{percentage}</span>;
    };

    const renderStatusIcon = (status: ApiCheckResult['status']) => {
        switch (status) {
            case 'good': case 'accessible': return <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />;
            case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
            case 'bad': return <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0" />;
            case 'info': return <Info className="h-4 w-4 text-blue-400 flex-shrink-0" />;
            case 'error': return <AlertCircle className="h-4 w-4 text-red-700 flex-shrink-0" />;
            case 'not_applicable': return <CheckSquare className="h-4 w-4 text-gray-500 flex-shrink-0" />;
            case 'not_found': return <AlertCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />;
            default: return <Info className="h-4 w-4 text-gray-400 flex-shrink-0" />;
        }
    };

    const renderIssueList = (title: string, issues: string[], iconType: 'warning' | 'critical' | 'info' | 'good') => {
        if (!issues || issues.length === 0) return null;

        const iconMap = {
            critical: <ShieldAlert className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />,
            warning: <AlertCircle className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />,
            info: <Info className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />,
            good: <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />,
        };
        const colorClass = {
            critical: 'text-red-300',
            warning: 'text-yellow-300',
            info: 'text-blue-300',
            good: 'text-green-300',
        };

        return (
            <div className="mb-4">
                <h4 className={`text-md font-semibold mb-2 ${colorClass[iconType]}`}>{title} ({issues.length})</h4>
                <ul className="space-y-2">
                    {issues.map((issue, index) => (
                        <li key={`${iconType}-${index}`} className="flex items-start gap-2 text-sm text-gray-300">
                            {iconMap[iconType]}
                            <span>{issue}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const renderCheckDetail = (tooltipKey: keyof typeof TOOLTIP_INFO, checkData: ApiCheckResult | undefined) => {
        if (!checkData) return null;

        const status = checkData.status || 'info';
        const title = TOOLTIP_INFO[tooltipKey]?.title || tooltipKey;
        let detailText = '';

        if (checkData.error) detailText = `Error: ${checkData.error}`;
        else if (tooltipKey === 'title') detailText = checkData.present ? `"${checkData.text}" (${checkData.length} chars)` : 'Missing';
        else if (tooltipKey === 'metaDescription') detailText = checkData.present ? `"${checkData.text}" (${checkData.length} chars)` : 'Missing';
        else if (tooltipKey === 'wordCount') detailText = `${checkData.count ?? 'N/A'} words`;
        else if (tooltipKey === 'readability') detailText = checkData.score !== null && checkData.score !== undefined ? `${checkData.score} (${checkData.level})` : (checkData.message || 'N/A');
        else if (tooltipKey === 'keywordDensity') detailText = checkData.density !== undefined && checkData.keyword ? `${checkData.density}% (${checkData.count} mentions)` : (checkData.message || 'N/A');
        else if (tooltipKey === 'imageAltText') detailText = `${checkData.missingAltText ?? '?'} missing / ${checkData.totalImages ?? '?'} total`;
        else if (tooltipKey === 'https') detailText = checkData.enabled ? 'Enabled' : 'Disabled';
        else if (tooltipKey === 'canonicalTag') detailText = checkData.value ? `"${checkData.value}"` : (checkData.present ? 'Present (empty)' : 'Missing');
        else if (tooltipKey === 'robotsMeta') detailText = checkData.content || (checkData.present ? 'Present (empty)' : 'Not specified');
        else if (tooltipKey === 'robotsTxt') detailText = checkData.status ? checkData.status.replace('_', ' ') : 'Unknown';
        else if (tooltipKey === 'sitemapXml') detailText = checkData.status ? checkData.status.replace('_', ' ') : 'Unknown';
        else if (tooltipKey === 'structuredData') detailText = checkData.present ? `${checkData.count} found (${checkData.schemas?.filter(s => !s.validJson).length || 0} invalid)` : 'None detected';
        else if (tooltipKey === 'viewport') detailText = checkData.present ? 'Present' : 'Missing';
        else if (tooltipKey === 'favicon') detailText = checkData.present ? 'Detected' : 'Missing';
        else if (tooltipKey === 'links') detailText = `Internal: ${checkData.internal ?? '?'}, External: ${checkData.external ?? '?'}`;
        else if (tooltipKey === 'htmlFetch') detailText = checkData.status === 'good' ? 'Success' : `Failed (${checkData.status})`;
        else if (tooltipKey === 'pageSpeedMobile' || tooltipKey === 'pageSpeedDesktop') detailText = checkData.status === 'error' ? `Check Error` : `Perf: ${checkData.performanceScore ?? 'N/A'}`;
        else detailText = checkData.message || checkData.status || '';

        const isLongValue = detailText.length > 50;

        return (
            <div className="flex items-start sm:items-center justify-between py-2.5 border-b border-gray-700/50 last:border-b-0 flex-col sm:flex-row gap-1 sm:gap-4">
                <div className="flex items-center text-sm text-gray-300 flex-shrink-0">
                    {renderStatusIcon(status)}
                    <span className="ml-2">{title}</span>
                    <InfoTooltip id={tooltipKey} />
                </div>
                <span className={`text-sm text-right sm:text-right font-medium ${status === 'good' ? 'text-green-400' : status === 'warning' ? 'text-yellow-400' : status === 'bad' ? 'text-red-400' : 'text-gray-400'} ${isLongValue ? 'break-all' : 'truncate'} sm:max-w-[60%]`}>
                    {detailText}
                </span>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white p-4 md:p-6 lg:p-8">
            <div className="container mx-auto max-w-7xl">
                <Card className="mb-6 bg-gray-900/70 border-gray-800 backdrop-blur-sm shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Expert SEO Analyzer
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            Get detailed SEO insights, performance metrics, and actionable recommendations.
                        </CardDescription>
                    </CardHeader>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Section */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="bg-gray-900/70 border-gray-800 backdrop-blur-sm shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-white text-xl">Analyze Your Page</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="url" className="text-gray-300 font-medium">Website URL <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="url"
                                        type="url"
                                        value={url}
                                        onChange={(e) => { setUrl(e.target.value); clearMessages(); }}
                                        placeholder="https://example.com"
                                        className="mt-1 bg-gray-800/60 border-gray-700 text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-0"
                                        disabled={isLoading}
                                        aria-required="true"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="keywords" className="text-gray-300 font-medium">Primary Target Keyword <span className="text-gray-500 text-xs">(Optional)</span></Label>
                                    <Input
                                        id="keywords"
                                        value={keywords}
                                        onChange={(e) => { setKeywords(e.target.value); clearMessages(); }}
                                        placeholder="e.g., best seo tool"
                                        className="mt-1 bg-gray-800/60 border-gray-700 text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-0"
                                        disabled={isLoading}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">For basic on-page keyword checks (title, meta, H1, density).</p>
                                </div>
                                <Button
                                    onClick={handleAnalyzeUrl}
                                    disabled={isLoading || !url || !(url.startsWith('http://') || url.startsWith('https://'))}
                                    className="w-full text-base py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
                                    aria-label="Analyze website URL"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Analyzing ({analysisStatus})
                                        </>
                                    ) : (
                                        <>
                                            <Search className="mr-2 h-5 w-5" />
                                            Analyze Page
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Messages */}
                        {errorMessage && (
                            <div role="alert" className="p-4 rounded-md bg-red-900/40 border border-red-700/60 text-red-300 flex items-start gap-3 shadow-md">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <span className="flex-1">{errorMessage}</span>
                            </div>
                        )}
                        {successMessage && !errorMessage && (
                            <div role="status" className="p-4 rounded-md bg-green-900/30 border border-green-700/50 text-green-300 flex items-start gap-3 shadow-md">
                                <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <span className="flex-1">{successMessage}</span>
                            </div>
                        )}
                    </div>

                    {/* Results Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {analysisResults && !isLoading && (
                            <Tabs defaultValue="overview" className="w-full">
                                <Card className="bg-gray-900/70 border-gray-800 backdrop-blur-sm shadow-lg overflow-hidden">
                                    <CardHeader className="border-b border-gray-700/60 pb-4">
                                        <CardTitle className="text-white text-xl">Analysis Results for:</CardTitle>
                                        <CardDescription className="text-indigo-300 break-all"><Link href={analysisResults.url} target="_blank"><LinkIcon/>{analysisResults.url}</Link></CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <TabsList className="grid w-full h-full grid-cols-2 md:grid-cols-5 bg-gray-800/60 mb-4">
                                            <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-900/50 data-[state=active]:text-indigo-300 text-xs sm:text-sm py-2.5"><GaugeCircle className="h-4 w-4 mr-1.5 hidden sm:inline-block" />Overview</TabsTrigger>
                                            <TabsTrigger value="performance" className="data-[state=active]:bg-indigo-900/50 data-[state=active]:text-indigo-300 text-xs sm:text-sm py-2.5"><Zap className="h-4 w-4 mr-1.5 hidden sm:inline-block" />Performance</TabsTrigger>
                                            <TabsTrigger value="content" className="data-[state=active]:bg-indigo-900/50 data-[state=active]:text-indigo-300 text-xs sm:text-sm py-2.5"><FileText className="h-4 w-4 mr-1.5 hidden sm:inline-block" />Content</TabsTrigger>
                                            <TabsTrigger value="technical" className="data-[state=active]:bg-indigo-900/50 data-[state=active]:text-indigo-300 text-xs sm:text-sm py-2.5"><SlidersHorizontal className="h-4 w-4 mr-1.5 hidden sm:inline-block" />Technical</TabsTrigger>
                                            <TabsTrigger value="checks" className="data-[state=active]:bg-indigo-900/50 data-[state=active]:text-indigo-300 text-xs sm:text-sm py-2.5"><CheckSquare className="h-4 w-4 mr-1.5 hidden sm:inline-block" />All Checks</TabsTrigger>
                                        </TabsList>

                                        <ScrollArea className="h-[60vh] md:h-[70vh] p-1 -m-1 pr-3">
                                            <TabsContent value="overview" className="mt-2 space-y-6">
                                                <Card className="bg-gray-800/50 border-gray-700/60">
                                                    <CardHeader>
                                                        <CardTitle className="text-lg flex items-center text-white" >Overall SEO Score <InfoTooltip id="overallScore" /></CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="text-center">
                                                        <div className="text-6xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                                                            {analysisResults.seoScore}
                                                            <span className="text-3xl text-gray-500">/100</span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                {renderIssueList("Critical Issues", analysisResults.issues.critical, 'critical')}
                                                {renderIssueList("Warnings", analysisResults.issues.warnings, 'warning')}
                                                {renderIssueList("Suggestions & Info", [...analysisResults.suggestions, ...analysisResults.issues.info], 'info')}
                                                {renderIssueList("Good Points", analysisResults.issues.good, 'good')}
                                            </TabsContent>

                                            <TabsContent value="performance" className="mt-2 space-y-4">
                                                <h3 className="text-lg font-semibold text-white flex items-center mb-3">PageSpeed Insights <InfoTooltip id="performance" /></h3>
                                                {analysisResults.checkDetails.pageSpeedMobile?.status === 'error' && (
                                                    <div className="text-sm text-yellow-400 flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Mobile check failed: {analysisResults.checkDetails.pageSpeedMobile.message}</div>
                                                )}
                                                {analysisResults.checkDetails.pageSpeedDesktop?.status === 'error' && (
                                                    <div className="text-sm text-yellow-400 flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Desktop check failed: {analysisResults.checkDetails.pageSpeedDesktop.message}</div>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {(['mobile', 'desktop'] as const).map(strategy => (
                                                        <Card key={strategy} className="bg-gray-800/50 border-gray-700/60 p-4">
                                                            <CardTitle className="text-md font-medium mb-3 flex items-center text-accent">
                                                                {strategy === 'mobile' ? <Smartphone className="h-4 w-4 mr-2" /> : <ScreenShare className="h-4 w-4 mr-2" />}
                                                                {strategy.charAt(0).toUpperCase() + strategy.slice(1)}
                                                            </CardTitle>
                                                            {analysisResults.performanceScores[`${strategy}`] !== null || analysisResults.checkDetails[`pageSpeed${strategy.charAt(0).toUpperCase() + strategy.slice(1)}` as keyof typeof analysisResults.checkDetails]?.status !== 'error' ? (
                                                                <div className="space-y-2 text-sm">
                                                                    <div className="flex justify-between text-white"><span>Performance: <InfoTooltip id="psiPerformance" /></span> {renderScoreGauge(analysisResults.performanceScores[strategy])}</div>
                                                                    <div className="flex justify-between text-white"><span>Accessibility: <InfoTooltip id="psiAccessibility" /></span> {renderScoreGauge(analysisResults.performanceScores[`${strategy}Accessibility`])}</div>
                                                                    <div className="flex justify-between text-white"><span>Best Practices: <InfoTooltip id="psiBestPractices" /></span> {renderScoreGauge(analysisResults.performanceScores[`${strategy}BestPractices`])}</div>
                                                                    <div className="flex justify-between text-white"><span>SEO Checks: <InfoTooltip id="psiSeo" /></span> {renderScoreGauge(analysisResults.performanceScores[`${strategy}Seo`])}</div>
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-gray-500">No data available (check failed).</p>
                                                            )}
                                                        </Card>
                                                    ))}
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="content" className="mt-2 space-y-1">
                                                <h3 className="text-lg font-semibold text-white mb-3">Content & Keywords</h3>
                                                {renderCheckDetail('title', analysisResults.checkDetails.title)}
                                                {renderCheckDetail('metaDescription', analysisResults.checkDetails.metaDescription)}
                                                <div className="py-2.5 border-b border-gray-700/50">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center text-sm text-gray-300">
                                                            {renderStatusIcon(analysisResults.checkDetails.headings?.h1Status)}
                                                            <span className="ml-2">Heading Structure</span> <InfoTooltip id="headings" />
                                                        </div>
                                                        <span className="text-sm text-gray-400 font-medium">{analysisResults.checkDetails.headings?.h1Status === 'good' ? '1 H1 Found' : `${analysisResults.checkDetails.headings?.h1Count || 0} H1s Found`}</span>
                                                    </div>
                                                    {(analysisResults.checkDetails.headings?.structure?.length ?? 0) > 0 && (
                                                        <ScrollArea className="h-32 mt-2 pr-2 border border-gray-700/40 rounded p-2 bg-gray-800/30">
                                                            <ul className="space-y-1 text-xs">
                                                                {analysisResults.checkDetails.headings?.structure?.map((h, i) => (
                                                                    <li key={i} className="flex items-center gap-2">
                                                                        <span className={`w-7 text-center text-[10px] font-semibold py-0.5 px-1 rounded text-white ${h.level === 'h1' ? 'bg-indigo-600' : h.level === 'h2' ? 'bg-purple-600' : 'bg-gray-600'}`}>{h.level.toUpperCase()}</span>
                                                                        <span className="truncate text-gray-300 flex-1">{h.text || '<empty>'}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </ScrollArea>
                                                    )}
                                                    {analysisResults.checkDetails.headings?.message && analysisResults.checkDetails.headings.h1Status !== 'good' && (
                                                        <p className={`text-xs mt-1.5 ${analysisResults.checkDetails.headings.h1Status === 'bad' ? 'text-red-400' : 'text-yellow-400'}`}>
                                                            {analysisResults.checkDetails.headings.message}
                                                        </p>
                                                    )}
                                                </div>
                                                {renderCheckDetail('wordCount', analysisResults.checkDetails.wordCount)}
                                                {renderCheckDetail('keywordDensity', analysisResults.checkDetails.keywordDensity)}
                                                {renderCheckDetail('readability', analysisResults.checkDetails.readability)}
                                                {renderCheckDetail('imageAltText', analysisResults.checkDetails.imageAltText)}
                                            </TabsContent>

                                            <TabsContent value="technical" className="mt-2 space-y-1">
                                                <h3 className="text-lg font-semibold text-white mb-3">Technical SEO</h3>
                                                {renderCheckDetail('https', analysisResults.checkDetails.https)}
                                                {renderCheckDetail('viewport', analysisResults.checkDetails.viewport)}
                                                {renderCheckDetail('canonicalTag', analysisResults.checkDetails.canonicalTag)}
                                                {renderCheckDetail('robotsMeta', analysisResults.checkDetails.robotsMeta)}
                                                {renderCheckDetail('robotsTxt', analysisResults.checkDetails.robotsTxt)}
                                                {renderCheckDetail('sitemapXml', analysisResults.checkDetails.sitemapXml)}
                                                {renderCheckDetail('structuredData', analysisResults.checkDetails.structuredData)}
                                                {renderCheckDetail('favicon', analysisResults.checkDetails.favicon)}
                                                {renderCheckDetail('links', analysisResults.checkDetails.links)}
                                            </TabsContent>

                                            <TabsContent value="checks" className="mt-2 space-y-1">
                                                <h3 className="text-lg font-semibold text-white mb-3">All Checks Summary</h3>
                                                {[
                                                    'htmlFetch', 'title', 'metaDescription', 'headings', 'wordCount', 'keywordDensity',
                                                    'readability', 'imageAltText', 'https', 'viewport', 'canonicalTag',
                                                    'robotsMeta', 'robotsTxt', 'sitemapXml', 'structuredData', 'favicon', 'links',
                                                    'pageSpeedMobile', 'pageSpeedDesktop'
                                                ].map(key => {
                                                    const tooltipKey = key as keyof typeof TOOLTIP_INFO;
                                                    const dataKey = KEY_MAP[tooltipKey] || tooltipKey as keyof ApiAnalysisResponse['checks'];
                                                    if (TOOLTIP_INFO[tooltipKey] && analysisResults.checkDetails[dataKey]) {
                                                        return <React.Fragment key={dataKey}>{renderCheckDetail(tooltipKey, analysisResults.checkDetails[dataKey])}</React.Fragment>;
                                                    }
                                                    return null;
                                                })}
                                            </TabsContent>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </Tabs>
                        )}

                        {/* Placeholder when not loading and no results */}
                        {!analysisResults && !isLoading && (
                            <Card className="bg-gray-900/70 border-gray-800 backdrop-blur-sm shadow-lg flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
                                <Globe className="h-16 w-16 text-indigo-400/60 mb-4" />
                                <h3 className="text-xl font-medium text-white mb-2">Ready to Analyze</h3>
                                <p className="text-gray-400 max-w-md">
                                    Enter a URL and optional keyword above, then click &ldquo;Analyze Page&ldquo; to start the SEO audit.
                                </p>
                            </Card>
                        )}

                        {/* Loading indicator */}
                        {isLoading && (
                            <Card className="bg-gray-900/70 border-gray-800 backdrop-blur-sm shadow-lg flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
                                <Loader2 className="h-16 w-16 text-indigo-400 animate-spin mb-4" />
                                <h3 className="text-xl font-medium text-white mb-2">Analyzing...</h3>
                                <p className="text-gray-400 max-w-md">({analysisStatus})</p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}