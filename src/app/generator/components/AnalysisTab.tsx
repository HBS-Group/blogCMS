// app/generator/components/AnalysisTab.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Save, Send } from "lucide-react";

interface AnalysisTabProps {
    contentToAnalyze: string; // <<< ADDED: Accept the content string
    seoScore: number;
    readability: string;
    plagiarismResult: string;
    // Add props for any analysis actions if needed in the future
    // onRunAnalysis?: () => void;
}

export const AnalysisTab: React.FC<AnalysisTabProps> = ({
    contentToAnalyze, // <<< Destructure the new prop (even if not directly used for display yet)
    seoScore,
    readability,
    plagiarismResult,
}) => {
    const getBadgeVariant = (value: string, type: 'readability' | 'plagiarism'): "outline" | "secondary" | "success" | "destructive" => {
        if (type === 'readability') {
            // Example: Adjust logic based on actual readability scores if needed
            if (value === "Not Analyzed" || !value) return "outline";
            // Add more sophisticated logic here based on score ranges (e.g., "Good", "Fair", "Difficult")
            return "secondary"; // Default for now
        }
        // Plagiarism
        if (value === "Not Checked" || !value) return "outline";
        if (value.toLowerCase().startsWith("passed") || value.toLowerCase().includes("unique")) return "success"; // Assuming "Passed" or "Unique" means good
        // Add checks for specific failure messages if applicable
        return "destructive"; // Assume anything else means potential issues
    };

    // Determine if analysis results are present
    const hasAnalysisData = seoScore > 0 || (readability && readability !== "Not Analyzed") || (plagiarismResult && plagiarismResult !== "Not Checked");
    const canAnalyze = !!contentToAnalyze; // Can we potentially run analysis?

    return (
        <Card className="bg-gray-900/80 border-gray-800">
            <CardHeader>
                <CardTitle className="text-white">Content Analysis</CardTitle>
                <CardDescription className="mt-1 text-gray-400/80">
                    {hasAnalysisData
                        ? "Estimated scores based on the current content."
                        : canAnalyze
                        ? "Analysis results will appear here. (Simulated)"
                        : "Generate or edit content to enable analysis. (Simulated)"}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* SEO Score Card */}
                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-indigo-300">SEO Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {seoScore > 0 || hasAnalysisData ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <Progress 
                                            value={seoScore} 
                                            className="w-full [&>*:first-child]:bg-indigo-500" 
                                            aria-label={`SEO Score: ${seoScore} out of 100`} 
                                        />
                                        <span className="text-lg font-bold text-white">{seoScore}<span className="text-sm font-normal text-gray-400">/100</span></span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Estimated on-page score.</p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-500">Not calculated</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Readability Card */}
                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-indigo-300">Readability</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge variant={getBadgeVariant(readability || 'Not Analyzed', 'readability')} className="text-base">
                                {readability || 'Not Analyzed'}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">Based on standard metrics.</p>
                        </CardContent>
                    </Card>

                    {/* Plagiarism Check Card */}
                    <Card className="bg-gray-800/50 border-gray-700">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-indigo-300">Plagiarism Check</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Badge variant={getBadgeVariant(plagiarismResult || 'Not Checked', 'plagiarism')} className="text-base">
                                {plagiarismResult || 'Not Checked'}
                            </Badge>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={!canAnalyze || true} 
                                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                                Run Check (Soon)
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Optional Action Buttons */}
                {hasAnalysisData && (
                    <>
                        <Separator className="bg-gray-700" />
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" disabled className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                                <Save className="mr-2 h-4 w-4 text-indigo-400" /> Save Draft
                            </Button>
                            <Button variant="outline" disabled className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                                <Send className="mr-2 h-4 w-4 text-indigo-400" /> Publish to CMS
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};