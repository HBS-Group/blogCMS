// app/generator/components/HtmlTab.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

interface HtmlTabProps {
    value: string | null | undefined; // <<< Renamed from editedContent to be more general
    isLoading: boolean;
    onCopyToClipboard: (text: string | undefined | null, type?: string) => void;
    typeText: boolean;
    readOnly?: boolean; // <<< ADDED: Optional readOnly flag
    // Optional: Only pass onChangeValue if it's NOT readOnly
    onChangeValue?: (newContent: string) => void; // <<< Renamed from onEditContent
}

export const HtmlTab: React.FC<HtmlTabProps> = ({
    value, // <<< Use general value prop
    isLoading,
    onCopyToClipboard,
    typeText,
    readOnly = false, // <<< Default to false if not provided
    onChangeValue, // <<< Use renamed handler
}) => {
    const contentToDisplay = value || ''; // Handle null/undefined
    const canCopy = !!contentToDisplay && !isLoading;
    const contentType = typeText ? 'Text' : 'HTML';
    const titleAction = readOnly ? 'View' : 'Edit';
    const descriptionAction = readOnly
        ? `View the raw ${contentType} content below.`
        : `Edit the ${contentType} content below. Changes will reflect live in the Preview tab.`;

    const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!readOnly && onChangeValue) { // Only call handler if editable
            onChangeValue(e.target.value);
        }
    };

    return (
        <Card className="bg-gray-900/80 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gray-800/50">
                <div>
                    <CardTitle className="text-white">{titleAction} Raw {contentType}</CardTitle>
                    <CardDescription className="mt-1 text-gray-400/80">
                        {descriptionAction}
                    </CardDescription>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                    onClick={() => onCopyToClipboard(contentToDisplay, `Raw ${contentType}`)}
                    disabled={!canCopy}
                    title={`Copy raw ${contentType}`}
                >
                    <Copy className="mr-2 h-4 w-4 text-indigo-400" /> Copy {contentType}
                </Button>
            </CardHeader>
            <CardContent>
                <Textarea
                    value={contentToDisplay}
                    readOnly={readOnly}
                    onChange={handleTextAreaChange}
                    className={`min-h-[400px] max-h-[60vh] font-mono text-xs bg-gray-800/50 border-gray-700 text-gray-200 focus-visible:ring-1 focus-visible:ring-indigo-500/30 ${readOnly ? 'cursor-default' : ''}`}
                    placeholder={isLoading ? "Loading..." : readOnly ? `Raw ${contentType} content will appear here.` : `Edit the ${contentType} directly.`}
                    disabled={isLoading}
                />
            </CardContent>
        </Card>
    );
};