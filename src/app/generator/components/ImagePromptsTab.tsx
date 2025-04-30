
// app/generator/components/ImagePromptsTab.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Image as ImageIcon, Copy } from "lucide-react";

interface ImagePromptsTabProps {
    generatedImagePrompts: string[];
    isLoading: boolean; // General loading state
    isImagePromptGenerating: boolean;
    canGenerate: boolean; // Derived from parent: !!(formattedContent || rawGeneratedContent)
    loadingText: string; // To show other loading activity
    onGenerateImagePrompts: () => void;
    onCopyToClipboard: (text: string | undefined | null, type?: string) => void;
}

export const ImagePromptsTab: React.FC<ImagePromptsTabProps> = ({
    generatedImagePrompts,
    isLoading,
    isImagePromptGenerating,
    canGenerate,
    loadingText,
    onGenerateImagePrompts,
    onCopyToClipboard,
}) => {
    const disableGenerateButton = isLoading || isImagePromptGenerating || !canGenerate;

    return (
        <Card className="bg-gray-900/80 border-gray-800">
            <CardHeader>
                <CardTitle className="text-white">Generate Image Prompts</CardTitle>
                <CardDescription className="mt-1 text-gray-400/80">
                    Create relevant image prompt ideas based on the generated article content (Main Image + Suggestions found in HTML).
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-200">
                <div className="flex justify-end">
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={onGenerateImagePrompts}
                        disabled={disableGenerateButton}
                    >
                        {isImagePromptGenerating ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <ImageIcon className="mr-2 h-4 w-4" />
                        )}
                        {generatedImagePrompts.length > 0 ? "Re-Generate Prompts" : "Generate Prompts"}
                    </Button>
                </div>
                <Separator className="bg-gray-700" />
                <div className="min-h-[150px] max-h-[50vh] overflow-y-auto">
                    {generatedImagePrompts.length > 0 ? (
                        <div className="space-y-3">
                            <h4 className="font-semibold text-indigo-300">Generated Prompts:</h4>
                            <ul className="space-y-2 bg-gray-800/50 p-3 rounded-md border border-gray-700">
                                {generatedImagePrompts.map((promptLine, index) => {
                                    const match = promptLine.match(/^(\d+)\.\s+(.*?)\s+\((.*?)\)$/);
                                    const promptText = match ? match[2] : promptLine;
                                    const label = match ? match[3] : '';

                                    return (
                                        <li key={index} className="flex items-start p-2 hover:bg-gray-700/50 rounded">
                                            <span className="mr-3 font-medium text-gray-400">{index + 1}.</span>
                                            <div className="flex-1">
                                                <p className="break-words">{promptText}</p>
                                                {label && <Badge variant="secondary" className="mt-1 text-xs bg-gray-700 text-gray-300">{label}</Badge>}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="ml-2 h-6 w-6 flex-shrink-0 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                                                onClick={() => onCopyToClipboard(promptText, `Prompt ${index + 1}`)}
                                                title="Copy prompt text"
                                                disabled={isLoading}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-10">
                            {isImagePromptGenerating ? "Generating prompts..." : "Click 'Generate Prompts' after generating article content."}
                            {isLoading && !isImagePromptGenerating && loadingText && !loadingText.includes("Prompts") && <span className="block mt-2 text-gray-400">({loadingText})</span>}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};