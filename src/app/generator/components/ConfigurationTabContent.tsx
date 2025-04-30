
// app/generator/components/ConfigurationTabContent.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ConfigurationTabContentProps {
    articleLength: string;
    setArticleLength: (value: string) => void;
    toneOfVoice: string;
    setToneOfVoice: (value: string) => void;
    pointOfView: string;
    setPointOfView: (value: string) => void;
    secondaryKeywords: string;
    setSecondaryKeywords: (value: string) => void;
    outlineText: string;
    setOutlineText: (value: string) => void;
    isOutlineGenerating: boolean;
    onGenerateOutline: () => void;
    includeSummary: boolean;
    setIncludeSummary: (value: boolean) => void;
    includeLinks: boolean;
    setIncludeLinks: (value: boolean) => void;
    includeImages: boolean;
    setIncludeImages: (value: boolean) => void;
    includeCta: boolean;
    setIncludeCta: (value: boolean) => void;
    includeFaq: boolean;
    setIncludeFaq: (value: boolean) => void;
    includeStats: boolean;
    setIncludeStats: (value: boolean) => void;
    creativityLevel: number[];
    setCreativityLevel: (value: number[]) => void;
    isLoading: boolean;
    canGenerateOutline: boolean; // Added prop to control button enablement
}

export const ConfigurationTabContent: React.FC<ConfigurationTabContentProps> = ({
    articleLength, setArticleLength,
    toneOfVoice, setToneOfVoice,
    pointOfView, setPointOfView,
    secondaryKeywords, setSecondaryKeywords,
    outlineText, setOutlineText, isOutlineGenerating, onGenerateOutline,
    includeSummary, setIncludeSummary, includeLinks, setIncludeLinks,
    includeImages, setIncludeImages, includeCta, setIncludeCta,
    includeFaq, setIncludeFaq, includeStats, setIncludeStats,
    creativityLevel, setCreativityLevel,
    isLoading, canGenerateOutline
}) => {
    return (
        <Card className="bg-gray-900/80 border-gray-800">
            <CardHeader>
                <CardTitle className="text-white">Content Configuration & Style</CardTitle>
                <CardDescription className="text-gray-400/80">
                    Fine-tune the structure, style, and specific elements of the article.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-gray-200">
                {/* Length, Tone, POV */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="articleLength" className="font-semibold text-indigo-300">Article Length Guide *</Label>
                        <Select required value={articleLength} onValueChange={setArticleLength} disabled={isLoading}>
                            <SelectTrigger id="articleLength" className="bg-gray-800 border-gray-700 text-gray-200">
                                <SelectValue placeholder="Select length..." />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectItem value="500">Short (~500 w)</SelectItem>
                                <SelectItem value="1000">Medium (~1000 w)</SelectItem>
                                <SelectItem value="1500">Standard (~1500 w)</SelectItem>
                                <SelectItem value="2000">Long (~2000 w)</SelectItem>
                                <SelectItem value="2500">Very Long (2500+ w)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="toneOfVoice" className="font-semibold">Tone of Voice *</Label>
                        <Select required value={toneOfVoice} onValueChange={setToneOfVoice} disabled={isLoading}>
                            <SelectTrigger id="toneOfVoice"><SelectValue placeholder="Select tone..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Professional">Professional</SelectItem>
                                <SelectItem value="Casual">Casual</SelectItem>
                                <SelectItem value="Informative">Informative</SelectItem>
                                <SelectItem value="Friendly">Friendly</SelectItem>
                                <SelectItem value="Witty">Witty</SelectItem>
                                <SelectItem value="Formal">Formal</SelectItem>
                                <SelectItem value="Authoritative">Authoritative</SelectItem>
                                <SelectItem value="Empathetic">Empathetic</SelectItem>
                                <SelectItem value="Inspirational">Inspirational</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pointOfView" className="font-semibold">Point of View *</Label>
                        <Select required value={pointOfView} onValueChange={setPointOfView} disabled={isLoading}>
                            <SelectTrigger id="pointOfView"><SelectValue placeholder="Select POV..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="First Person (I/We)">First Person (I/We)</SelectItem>
                                <SelectItem value="Second Person (You)">Second Person (You)</SelectItem>
                                <SelectItem value="Third Person (He/She/It/They)">Third Person</SelectItem>
                                <SelectItem value="Automatic/Mixed">Automatic/Mixed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Separator className="bg-gray-700" />
                {/* Keywords */}
                <div className="space-y-2">
                    <Label htmlFor="secondaryKeywords" className="font-semibold text-indigo-300">Engine Results(Optional)</Label>
                    <Textarea
                        className="bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500"
                        id="secondaryKeywords"
                        rows={10}
                        placeholder="Enter related engine results."
                        value={secondaryKeywords}
                        onChange={(e) => setSecondaryKeywords(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <Separator className="bg-gray-700" />
                {/* Outline */}
                <div className="space-y-2">
                    <Label htmlFor="outlineText" className="font-semibold text-indigo-300">Content Outline (HTML - Optional)</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            type="button"
                            onClick={onGenerateOutline}
                            disabled={isLoading || isOutlineGenerating || !canGenerateOutline}
                        >
                            {isOutlineGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isOutlineGenerating ? "Generating..." : "Generate AI Outline"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOutlineText("")}
                            disabled={isLoading || !outlineText}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            Clear Outline
                        </Button>
                    </div>
                    <Textarea
                        id="outlineText"
                        rows={8}
                        placeholder="Enter your HTML outline (use <h2>, <h3>...) or generate one. The AI will follow this structure."
                        className="bg-gray-800 border-gray-700 text-gray-200 font-mono text-xs"
                        value={outlineText}
                        onChange={(e) => setOutlineText(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <Separator className="bg-gray-700" />
                {/* Advanced Options */}
                <div className="space-y-3">
                    <Label className="font-semibold text-indigo-300">Include Sections / Features</Label>
                    <div className="flex items-center space-x-2">
                        <Switch
                            className="data-[state=checked]:bg-indigo-500"
                            id="include-summary" checked={includeSummary} onCheckedChange={setIncludeSummary} disabled={isLoading} />
                            <Label htmlFor="include-summary">Key Takeaways/Summary</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="include-links" checked={includeLinks} onCheckedChange={setIncludeLinks} disabled={isLoading} />
                            <Label htmlFor="include-links">Internal/External Link Placeholders</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="include-images" checked={includeImages} onCheckedChange={setIncludeImages} disabled={isLoading} />
                            <Label htmlFor="include-images">AI Image Suggestions</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="include-cta" checked={includeCta} onCheckedChange={setIncludeCta} disabled={isLoading} />
                            <Label htmlFor="include-cta">Call-to-Action Placeholder</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="include-faq" checked={includeFaq} onCheckedChange={setIncludeFaq} disabled={isLoading} />
                            <Label htmlFor="include-faq">FAQ Section</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="include-stats" checked={includeStats} onCheckedChange={setIncludeStats} disabled={isLoading} />
                            <Label htmlFor="include-stats">Attempt to Include Statistics</Label>
                        </div>
                    </div>
                
                <Separator className="bg-gray-700" />
                {/* Creativity */}
                <div className="space-y-2">
                    <Label htmlFor="creativitySlider" className="font-semibold text-indigo-300">Creativity vs. Factual Balance</Label>
                    <Slider
                        className="[&>*:first-child]:bg-indigo-500"
                        id="creativitySlider"
                        value={creativityLevel}
                        onValueChange={setCreativityLevel}
                        max={100}
                        step={5}
                        
                        disabled={isLoading}
                        aria-label="Creativity Level"
                    />
                    <span className="text-xs text-muted-foreground w-12 text-left">Creative</span>
                    <span className="text-sm font-medium w-8 text-center tabular-nums">{creativityLevel[0]}</span>
                </div>
                <p className="text-xs text-muted-foreground">Lower values prioritize accuracy and known facts. Higher values allow more novel ideas and style.</p>
            </CardContent>
        </Card>
    );
};