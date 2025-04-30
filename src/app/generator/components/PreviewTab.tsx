// app/generator/components/PreviewTab.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Copy } from "lucide-react";
import { parseContent, ParseResult } from "@/utils/parseContent"; // Assuming TocItem is exported or handled within parseContent
import parse, {
    domToReact,
    HTMLReactParserOptions,
    Element,
} from "html-react-parser";
import FaqItem from '@/components/blog/fqa';

interface PreviewTabProps {
    formattedContent: string | null | undefined; // The last known "good" formatted version
    rawGeneratedContent: string | null | undefined; // The ORIGINAL raw content (used for reformat check)
    editedContent?: string | null; // <<< The LIVE edited content from the parent state
    isLoading: boolean;
    isFormatting: boolean;
    loadingText: string;
    onCopyToClipboard: (text: string | undefined | null, type?: string) => void;
    // No onEditContent here - PreviewTab only displays
}

export const PreviewTab: React.FC<PreviewTabProps> = ({
    formattedContent,
    rawGeneratedContent, // Keep this for the reformat check
    editedContent,       // Receive the live edited content
    isLoading,
    isFormatting,
    loadingText,
    onCopyToClipboard,
}) => {
    // PRIORITIZE editedContent for display
    const contentToDisplay = editedContent ?? formattedContent;

    // Copy enabled if there's anything to display and not initial loading
    const canCopy = !!contentToDisplay && !isLoading;

    // Show formatting loader only if formatting AND no content displayed yet
    const showFormattingLoader = isFormatting && !contentToDisplay;

    // Parse the content intended for display
    const { parts: parsedBlogContent, toc: tableOfContents }: ParseResult =
        parseContent(contentToDisplay || "");

    const parserOptions: HTMLReactParserOptions = {
        replace: (domNode) => {
            if (domNode instanceof Element && domNode.tagName === "h2") {
                try {
                    const h2Text = domToReact(domNode.children as Element[], parserOptions)?.toString() || '';
                    const tocItem = tableOfContents.find((item) => item.text === h2Text);
                    if (tocItem) {
                        return (
                            <h2 id={tocItem.id} {...domNode.attribs}>
                                {domToReact(domNode.children as Element[], parserOptions)}
                            </h2>
                        );
                    }
                } catch (error) {
                    console.error("Error processing h2 tag for TOC:", error, domNode);
                    // Fallback rendering
                    return (
                        <h2 {...domNode.attribs}>
                            {domToReact(domNode.children as Element[], parserOptions)}
                        </h2>
                    );
                }
            }
            return undefined;
        },
    };

    return (
        <Card className="bg-gray-900/80 border-gray-800">
            <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2 border-b border-gray-700">
                <div>
                    {/* Dynamic Title */}
                    <CardTitle className="text-white">{editedContent !== null && editedContent !== undefined ? "Editing Preview" : "Formatted Preview"}</CardTitle>
                    <CardDescription className="mt-1 text-gray-400/80">
                        {editedContent !== null && editedContent !== undefined
                            ? "Live preview of your edits."
                            : "Preview using applied Tailwind CSS styles."}
                    </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                    <Button
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                        variant="outline"
                        size="sm"
                        onClick={() => onCopyToClipboard(contentToDisplay, editedContent !== null && editedContent !== undefined ? "Edited HTML" : "Formatted HTML")}
                        disabled={!canCopy}
                        title={editedContent !== null && editedContent !== undefined ? "Copy edited HTML" : "Copy formatted HTML"}
                    >
                        <Copy className="mr-2 h-4 w-4" /> Copy HTML
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="p-4 border rounded-md bg-white dark:bg-gray-800 min-h-[400px] max-h-[60vh] overflow-y-auto">
                    {showFormattingLoader ? (
                         <div className="flex justify-center items-center h-full">
                             <p className="text-muted-foreground italic flex items-center gap-2">
                                 <Loader2 className="h-4 w-4 animate-spin" /> Applying formatting...
                             </p>
                         </div>
                    ) : contentToDisplay ? (
                        <article className="relative bg-gray-800/30 rounded-2xl shadow-xl p-6 md:p-8 mb-12 border border-gray-700/3 article-content">
                            <div className="prose prose-lg lg:prose-xl prose-invert max-w-none">
                                {parsedBlogContent.map((part, index) => {
                                    const key = part.type === "faq" ? part.props!.id : `html-${index}`;
                                    if (part.type === "html" && part.content) {
                                        return <div key={key}>{parse(part.content, parserOptions)}</div>;
                                    } else if (part.type === "faq" && part.props) {
                                        return (
                                            <div key={key} className="mt-6 pt-6 border-t border-gray-700/50 not-prose">
                                                <FaqItem
                                                    id={part.props.id}
                                                    question={part.props.question}
                                                    answer={part.props.answer}
                                                />
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        </article>
                    ) : (
                         <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-10">
                            {isLoading
                                ? loadingText || "Generating content..."
                                : rawGeneratedContent
                                    ? "Format content to see preview." // Adjusted text slightly
                                    : "Generate an article to see the preview here."
                            }
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin inline-block ml-2" />}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};