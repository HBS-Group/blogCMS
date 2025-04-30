import React from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface MainActionsProps {
    isLoading: boolean;
    isGenerating: boolean;
    isFormatting: boolean;
    isUploading: boolean; // Added
    loadingText: string;
    progressValue: number;
    generationStatus: string;
    onGenerateArticle: () => void;
}

export const MainActions: React.FC<MainActionsProps> = ({
    isLoading,
    isGenerating,
    isFormatting,
    isUploading,
    loadingText,
    progressValue,
    generationStatus,
    onGenerateArticle,
}) => {
    const showGenerationProgress = isGenerating || isFormatting;
    const buttonText = showGenerationProgress && !isUploading ? loadingText : "✨ Generate Article Now";

    return (
        <Card className="mb-6 bg-gray-900/80 border-gray-800">
            <CardContent className="p-4 flex flex-wrap justify-between items-center gap-4">
                <Button 
                    onClick={onGenerateArticle} 
                    disabled={isLoading} 
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    {isLoading && !isUploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {buttonText}
                </Button>
                <div className="flex items-center gap-3">
                    {showGenerationProgress ? (
                        <>
                            <Progress 
                                value={progressValue} 
                                className="w-[150px] sm:w-[200px] [&>*:first-child]:bg-indigo-500" 
                            />
                            <Badge 
                                variant={generationStatus.includes("Error") ? "destructive" : generationStatus === "Completed" ? "success" : "outline"}
                                className="text-gray-200"
                            >
                                {generationStatus}
                            </Badge>
                        </>
                    ) : isUploading ? (
                        <Badge variant="outline" className="text-gray-300">Uploading...</Badge>
                    ) : !isLoading ? (
                        <Badge variant="outline" className="text-gray-300">Idle</Badge>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
};